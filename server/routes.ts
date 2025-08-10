import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
