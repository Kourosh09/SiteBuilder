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

  // ---- AI Optimization Layer: /smart_fetch ----
  app.get("/smart_fetch", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      const city = String(req.query.city || "Maple Ridge");

      // Real BC government data sources (for development/demo)
      const sources = [
        `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&q=${encodeURIComponent(q)}&refine.city=${encodeURIComponent(city)}`,
        `https://data.burnaby.ca/api/records/1.0/search/?dataset=building-permits&q=${encodeURIComponent(q)}`,
        `https://data.surrey.ca/api/records/1.0/search/?dataset=development-permits&q=${encodeURIComponent(q)}`
      ];

      type Prov = { source: string; ok: boolean; data: any; fetched_at: number };
      const provenance: Prov[] = [];

      for (const url of sources) {
        try {
          const r = await fetch(url); // Node 18+ has global fetch
          const ct = r.headers.get("content-type") || "";
          const data = ct.includes("application/json") ? await r.json() : { text: await r.text() };
          provenance.push({ source: url, ok: r.ok, data, fetched_at: Date.now()/1000 });
        } catch (e: any) {
          provenance.push({ source: url, ok: false, data: { error: String(e) }, fetched_at: Date.now()/1000 });
        }
      }

      // Enhanced reconciliation for permit data
      const okOnes = provenance.filter(p => p.ok);
      let payload: any = {};
      let confidence = 0.0;
      let note = "No sources succeeded.";
      
      if (okOnes.length) {
        // Aggregate permit records from successful sources
        const allPermits: any[] = [];
        
        for (const source of okOnes) {
          if (source.data?.records && Array.isArray(source.data.records)) {
            // Transform to standardized permit format with Zod validation
            const permits = source.data.records.map((record: any) => {
              const permitData = {
                id: record.recordid || record.id || `${source.source}-${record.fields?.permit_number || Math.random()}`,
                address: record.fields?.address || record.fields?.location || "Unknown Address",
                city: record.fields?.city || city,
                type: record.fields?.permit_type || record.fields?.type || "Permit",
                status: record.fields?.status || "Unknown",
                submittedDate: record.fields?.submitted_date || record.fields?.application_date || null,
                issuedDate: record.fields?.issue_date || record.fields?.issued_date || null,
                lat: record.fields?.latitude || record.geometry?.coordinates?.[1] || null,
                lng: record.fields?.longitude || record.geometry?.coordinates?.[0] || null,
                source: source.source,
                sourceUpdatedAt: record.record_timestamp || new Date().toISOString()
              };
              
              // Validate with Zod schema for data quality
              try {
                return PermitSchema.parse(permitData);
              } catch (error) {
                // Return raw data if validation fails, but log the issue
                console.warn(`Permit validation failed for ${permitData.id}:`, error);
                return permitData;
              }
            });
            allPermits.push(...permits);
          }
        }
        
        if (allPermits.length > 0) {
          payload = allPermits;
          confidence = Math.min(0.95, 0.6 + (okOnes.length * 0.15)); // Higher confidence with more sources
          note = `Aggregated ${allPermits.length} permits from ${okOnes.length} sources`;
        } else {
          // Fallback to first successful response
          const pick = okOnes[0];
          payload = typeof pick.data === "object" ? pick.data : { raw: pick.data };
          confidence = 0.75;
          note = `Selected ${pick.source}`;
        }
      }
      
      const ok = confidence >= 0.6 && (Array.isArray(payload) ? payload.length > 0 : Object.keys(payload).length > 0);
      return res.json({ ok, payload, confidence: Number(confidence.toFixed(2)), provenance, notes: ok ? note : "No sources succeeded." });
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

  const httpServer = createServer(app);
  return httpServer;
}
