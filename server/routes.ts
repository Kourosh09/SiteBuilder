import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema, PermitSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Lead submission endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json({ success: true, lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid lead data", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create lead" });
      }
    }
  });

  // Get all leads (admin endpoint)
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch leads" });
    }
  });

  // Calculation submission endpoint
  app.post("/api/calculations", async (req, res) => {
    try {
      const calculationData = insertCalculationSchema.parse(req.body);
      const calculation = await storage.createCalculation(calculationData);
      res.json({ success: true, calculation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid calculation data", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to save calculation" });
      }
    }
  });

  // Get all calculations
  app.get("/api/calculations", async (req, res) => {
    try {
      const calculations = await storage.getCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch calculations" });
    }
  });

  // ---- Enhanced Smart Fetch with Ranking and Deduplication ----
  const memCache = new Map<string, { ts: number; data: any }>();
  const CACHE_MS = 60 * 1000; // 1 minute cache

  // Import centralized city trust configuration
  const cityConfig = await import("./city-config");
  const CityTrust: Record<string, number> = cityConfig.CITY_TRUST;

  function scorePermit(p: any): number {
    const trust = CityTrust[p.city] ?? 0.7;
    const recency = p.sourceUpdatedAt ? Date.parse(p.sourceUpdatedAt) : 0;
    const recencyBoost = recency ? Math.min(1, (Date.now() - recency) / (1000 * 60 * 60 * 24 * 365)) : 0.5;
    const freshness = 1 - Math.min(1, recencyBoost);
    return 0.7 * trust + 0.3 * freshness;
  }

  function dedupeById(perms: any[]): any[] {
    const m = new Map<string, any>();
    for (const p of perms) {
      const existing = m.get(p.id);
      if (!existing) m.set(p.id, p);
      else {
        const keep = scorePermit(existing) >= scorePermit(p) ? existing : p;
        m.set(p.id, keep);
      }
    }
    return Array.from(m.values());
  }

  app.get("/smart_fetch", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      const cacheKey = `smart:${q}`;
      const cached = memCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_MS) {
        return res.json(cached.data);
      }

      // Import core BC connectors
      const { fetchMapleRidge } = await import("./connectors/mapleRidge");
      const { fetchVancouver } = await import("./connectors/vancouver");

      // Pull from 2 core BC cities (Vancouver live + Maple Ridge ArcGIS pattern)
      const results = await Promise.allSettled([
        fetchMapleRidge(q),
        fetchVancouver(q),
        // later: fetchBurnaby(q) if we scrape or get an API
      ]);

      // Flatten & validate defensively
      const allPermits: any[] = [];
      const provenance: any[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          const { city, items, rawSource } = r.value;
          provenance.push({ city, count: items.length, source: rawSource, ok: true });
          for (const it of items) {
            const parsed = PermitSchema.safeParse(it);
            if (parsed.success) allPermits.push(parsed.data);
          }
        } else {
          provenance.push({ city: "unknown", count: 0, source: "", ok: false, err: String(r.reason) });
        }
      }

      // Rank, dedupe, and compute confidence
      const ranked = dedupeById(allPermits).sort((a, b) => scorePermit(b) - scorePermit(a));
      const avgScore = ranked.length ? ranked.map(scorePermit).reduce((a,b)=>a+b,0)/ranked.length : 0;
      const response = {
        ok: ranked.length > 0,
        payload: ranked,
        confidence: Number(avgScore.toFixed(2)),
        provenance,
        notes: ranked.length ? `Ranked and deduplicated ${ranked.length} permits` : "No permits matched data sources.",
      };

      memCache.set(cacheKey, { ts: Date.now(), data: response });
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // Project export endpoint
  app.get("/api/export/project", (req, res) => {
    try {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=\"buildwiseai-project.zip\"");

      const archive = archiver("zip", { zlib: { level: 9 } });
      
      archive.on("error", (err: any) => {
        console.error("Archive error:", err);
        res.status(500).json({ error: "Failed to create archive" });
      });

      archive.pipe(res);

      // Exclude certain directories and files
      const excludeDirs = new Set(["node_modules", ".git", ".cache", "dist", ".local", ".upm", "attached_assets"]);
      const projectRoot = path.resolve(".");

      const addDirectory = (dirPath: string, archivePath = ""): void => {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          if (excludeDirs.has(item.name) || item.name.startsWith(".")) {
            continue;
          }

          const fullPath = path.join(dirPath, item.name);
          const itemArchivePath = archivePath ? `${archivePath}/${item.name}` : item.name;

          if (item.isDirectory()) {
            addDirectory(fullPath, itemArchivePath);
          } else {
            archive.file(fullPath, { name: itemArchivePath });
          }
        }
      };

      addDirectory(projectRoot);
      archive.finalize();

    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export project" });
    }
  });

  // Project file listing endpoint
  app.get("/api/export/files", (req, res) => {
    try {
      const excludeDirs = new Set(["node_modules", ".git", ".cache", "dist", ".local", ".upm", "attached_assets"]);
      const projectRoot = path.resolve(".");
      const files: Array<{ path: string; size: number }> = [];

      const listFiles = (dirPath: string, basePath = "") => {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          if (excludeDirs.has(item.name) || item.name.startsWith(".")) {
            continue;
          }

          const fullPath = path.join(dirPath, item.name);
          const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

          if (item.isDirectory()) {
            listFiles(fullPath, relativePath);
          } else {
            const stats = fs.statSync(fullPath);
            files.push({ path: relativePath, size: stats.size });
          }
        }
      };

      listFiles(projectRoot);
      res.json({ 
        success: true, 
        count: files.length, 
        files: files.sort((a, b) => a.path.localeCompare(b.path))
      });

    } catch (error) {
      console.error("File listing error:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  // Permit validation endpoint for testing Zod schema
  app.post("/api/permits/validate", async (req, res) => {
    try {
      const validatedPermit = PermitSchema.parse(req.body);
      res.json({ 
        success: true, 
        valid: true,
        permit: validatedPermit,
        message: "Permit data is valid" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          valid: false,
          error: "Invalid permit data", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Validation failed" 
        });
      }
    }
  });

  // BC Permits API endpoint for direct access
  app.get("/api/permits/bc", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      const city = String(req.query.city || "");
      
      const { fetchAllBCPermits, fetchBurnaby } = await import("./permit-services");
      const { fetchMapleRidge } = await import("./connectors/mapleRidge");
      const { fetchVancouver } = await import("./connectors/vancouver");
      const { fetchSurrey } = await import("./connectors/surrey");
      const { fetchCoquitlam } = await import("./connectors/coquitlam");
      
      let result;
      if (city.toLowerCase() === "vancouver") {
        result = await fetchVancouver(q);
      } else if (city.toLowerCase() === "burnaby") {
        result = await fetchBurnaby(q);
      } else if (city.toLowerCase() === "surrey") {
        result = await fetchSurrey(q);
      } else if (city.toLowerCase().includes("maple")) {
        result = await fetchMapleRidge(q);
      } else if (city.toLowerCase().includes("coquitlam")) {
        result = await fetchCoquitlam(q);
      } else {
        const allResult = await fetchAllBCPermits(q);
        return res.json({
          success: true,
          totalItems: allResult.totalItems,
          cities: allResult.cities,
          permits: allResult.aggregatedItems
        });
      }
      
      res.json({
        success: true,
        city: result.city,
        permits: result.items,
        source: result.rawSource,
        count: result.items.length
      });
    } catch (error) {
      console.error("BC Permits API error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch BC permit data" 
      });
    }
  });

  // Smart Fetch endpoint with city selection and mode filtering
  app.get("/smart_fetch", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      const city = String(req.query.city || "Maple Ridge");
      const mode = String(req.query.mode || "any") as "address" | "any";
      
      const { fetchAllBCPermits } = await import("./permit-services");
      const { fetchMapleRidge } = await import("./connectors/mapleRidge");
      const { fetchVancouver } = await import("./connectors/vancouver");
      const { fetchSurrey } = await import("./connectors/surrey");
      const { fetchCoquitlam } = await import("./connectors/coquitlam");
      
      let result;
      
      // City-specific fetching
      if (city.toLowerCase().includes("vancouver")) {
        result = await fetchVancouver(q);
      } else if (city.toLowerCase().includes("maple")) {
        result = await fetchMapleRidge(q);
      } else if (city.toLowerCase().includes("surrey")) {
        result = await fetchSurrey(q);
      } else if (city.toLowerCase().includes("coquitlam")) {
        result = await fetchCoquitlam(q);
      } else {
        // Default to all BC municipalities
        const allResult = await fetchAllBCPermits(q);
        result = {
          city: "All BC",
          items: allResult.aggregatedItems,
          rawSource: "Multiple municipal APIs"
        };
      }
      
      // Enhanced mode filtering with generic token detection
      let filteredItems = result.items;
      if (mode === "address" && q.length >= 3) {
        // Filter for address-specific matches with generic token handling
        const addressTerms = q.toLowerCase().split(/\s+/);
        const isGenericAddressToken = (term: string) => {
          if (term.length < 3) return true;
          const generic = ["rd","road","st","street","ave","avenue","blvd","lane","ln","dr","drive","hwy","highway","way","ct","court","pl","place"];
          return generic.includes(term);
        };
        
        // Skip filtering if all terms are generic
        const hasSpecificTerms = addressTerms.some(term => !isGenericAddressToken(term));
        
        if (hasSpecificTerms) {
          filteredItems = result.items.filter(permit => {
            const address = permit.address.toLowerCase();
            return addressTerms.some(term => !isGenericAddressToken(term) && address.includes(term));
          });
        }
      }
      
      res.json({
        success: true,
        query: q,
        city: result.city,
        mode,
        totalFound: result.items.length,
        filtered: filteredItems.length,
        permits: filteredItems,
        source: result.rawSource
      });
    } catch (error) {
      console.error("Smart Fetch error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Smart fetch failed" 
      });
    }
  });

  // Test endpoint for permit data patterns
  app.get("/api/permits/test", async (req, res) => {
    try {
      const { testAllPatterns } = await import("./permit-test");
      const results = await testAllPatterns();
      res.json(results);
    } catch (error) {
      console.error("Permit test error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to run permit tests" 
      });
    }
  });

  // Enhanced FeatureServer helpers test endpoint
  app.get("/api/featureserver/test", async (req, res) => {
    const query = req.query.q as string || "main";
    const { buildWhere, buildFSQueryUrl, validateFSUrl } = await import("./lib/arcgis");
    const { CITY_ENDPOINTS } = await import("./lib/config");
    
    const examples = {
      maple_ridge: {
        base: CITY_ENDPOINTS.mapleRidge,
        where_clause: buildWhere(query),
        full_url: buildFSQueryUrl(CITY_ENDPOINTS.mapleRidge, query),
        validation: validateFSUrl(CITY_ENDPOINTS.mapleRidge),
        enhanced_fields: ["ADDRESS", "SITE_ADDRESS", "CIVIC_ADDRESS", "STREET_NAME", "STREET_TYPE", "ROAD_NAME", "PROJECT_NAME", "DESCRIPTION"]
      },
      surrey: {
        base: CITY_ENDPOINTS.surrey,
        where_clause: buildWhere(query),
        full_url: buildFSQueryUrl(CITY_ENDPOINTS.surrey, query),
        validation: validateFSUrl(CITY_ENDPOINTS.surrey),
        enhanced_fields: ["ADDRESS", "SITE_ADDRESS", "CIVIC_ADDRESS", "STREET_NAME", "STREET_TYPE", "ROAD_NAME", "PROJECT_NAME", "DESCRIPTION"]
      }
    };
    
    res.json({
      query: query,
      specification: {
        pattern: "/FeatureServer/0/query or /MapServer/0/query",
        required_params: ["where", "outFields=*", "returnGeometry=true", "outSR=4326", "resultRecordCount=100", "f=json"],
        enhanced_features: [
          "8-field comprehensive address matching",
          "SQL injection protection with quote escaping", 
          "Normalized geometry extraction (__lat, __lng)",
          "Clean import structure with lib/arcgis helpers",
          "Comprehensive field mapping with fallbacks"
        ]
      },
      examples: examples
    });
  });

  // FeatureServer diagnostic endpoint for testing municipal APIs
  app.get("/api/admin/test-featureserver", async (req, res) => {
    try {
      const url = String(req.query.url || "");
      const q = String(req.query.q || "test");
      const { validateFSUrl, buildFSQueryUrl } = await import("./lib/arcgis");
      
      const val = validateFSUrl(url);
      if (!val.ok) return res.status(400).json({ ok: false, issues: val.issues });

      // Build a minimal query to avoid heavy loads
      const testUrl = buildFSQueryUrl(url, q, {
        resultRecordCount: 1, outFields: "*", returnGeometry: true, outSR: 4326
      });

      const r = await fetch(testUrl, { method: "GET" });
      const text = await r.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* leave as text for diagnostics */ }

      const diagnostics = {
        ok: r.ok,
        status: r.status,
        testUrl,
        contentType: r.headers.get("content-type"),
        hasFeaturesArray: Array.isArray(json?.features),
        featuresCount: Array.isArray(json?.features) ? json.features.length : 0,
        sampleAttributes: Array.isArray(json?.features) && json.features[0]?.attributes ? json.features[0].attributes : null,
        sampleGeometry: Array.isArray(json?.features) && json.features[0]?.geometry ? json.features[0].geometry : null,
        issues: val.issues,
      };
      return res.json(diagnostics);
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
