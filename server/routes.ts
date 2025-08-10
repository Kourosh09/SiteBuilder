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

  // ---- Enhanced Smart Fetch with Real BC Permit Services ----
  app.get("/smart_fetch", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      const city = String(req.query.city || "").toLowerCase();

      // Import permit services
      const { fetchAllBCPermits, fetchVancouver, fetchBurnaby, fetchSurrey, fetchMapleRidge } = await import("./permit-services");

      let result;
      let confidence = 0.85;
      let note = "";

      // City-specific or all cities
      if (city && city !== "all") {
        switch (city) {
          case "vancouver":
            result = await fetchVancouver(q);
            note = `Fetched ${result.items.length} permits from Vancouver`;
            break;
          case "burnaby":
            result = await fetchBurnaby(q);
            note = `Fetched ${result.items.length} permits from Burnaby`;
            break;
          case "surrey":
            result = await fetchSurrey(q);
            note = `Fetched ${result.items.length} permits from Surrey`;
            break;
          case "maple ridge":
          case "mapleridge":
            result = await fetchMapleRidge(q);
            note = `Fetched ${result.items.length} permits from Maple Ridge`;
            break;
          default:
            // Fallback to all cities
            const allResult = await fetchAllBCPermits(q);
            result = { items: allResult.aggregatedItems, rawSource: "Multiple BC Municipalities" };
            note = `Aggregated ${allResult.totalItems} permits from ${allResult.cities.length} BC cities`;
            confidence = Math.min(0.95, 0.7 + (allResult.cities.filter(c => c.items.length > 0).length * 0.1));
        }
      } else {
        // All cities
        const allResult = await fetchAllBCPermits(q);
        result = { items: allResult.aggregatedItems, rawSource: "Multiple BC Municipalities" };
        note = `Aggregated ${allResult.totalItems} permits from ${allResult.cities.length} BC cities`;
        confidence = Math.min(0.95, 0.7 + (allResult.cities.filter(c => c.items.length > 0).length * 0.1));
      }

      const payload = result.items;
      const ok = payload.length > 0;
      
      // Build provenance for transparency
      const provenance = [{
        source: result.rawSource,
        ok: true,
        data: { records: payload },
        fetched_at: Date.now() / 1000
      }];

      return res.json({ 
        ok, 
        payload, 
        confidence: Number(confidence.toFixed(2)), 
        provenance, 
        notes: ok ? note : "No permits found for the specified query and location" 
      });
    } catch (err: any) {
      console.error("Smart fetch error:", err);
      return res.status(500).json({ ok: false, error: String(err), notes: "Failed to fetch permit data" });
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
      
      const { fetchAllBCPermits, fetchVancouver, fetchBurnaby, fetchSurrey, fetchMapleRidge } = await import("./permit-services");
      
      let result;
      if (city.toLowerCase() === "vancouver") {
        result = await fetchVancouver(q);
      } else if (city.toLowerCase() === "burnaby") {
        result = await fetchBurnaby(q);
      } else if (city.toLowerCase() === "surrey") {
        result = await fetchSurrey(q);
      } else if (city.toLowerCase().includes("maple")) {
        result = await fetchMapleRidge(q);
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

  const httpServer = createServer(app);
  return httpServer;
}
