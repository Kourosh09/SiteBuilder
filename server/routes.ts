import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema, PropertyAnalysisInput } from "@shared/schema";
import { aiAnalysis } from "./ai-analysis";
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

  // AI Property Analysis endpoint
  app.post("/api/ai/analyze-property", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          success: false, 
          error: "AI analysis unavailable. Please configure OpenAI API key." 
        });
      }

      const propertyData = req.body as PropertyAnalysisInput;
      
      // Basic validation
      if (!propertyData.address || !propertyData.city || !propertyData.lotSize) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address, city, and lotSize" 
        });
      }

      const analysis = await aiAnalysis.analyzeProperty(propertyData);
      res.json({ success: true, analysis });
      
    } catch (error) {
      console.error("Property analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to analyze property" 
      });
    }
  });

  // AI Zoning Analysis endpoint
  app.post("/api/ai/analyze-zoning", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          success: false, 
          error: "AI analysis unavailable. Please configure OpenAI API key." 
        });
      }

      const { address, city } = req.body;
      
      if (!address || !city) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address and city" 
        });
      }

      const zoningAnalysis = await aiAnalysis.analyzeZoning(address, city);
      res.json({ success: true, analysis: zoningAnalysis });
      
    } catch (error) {
      console.error("Zoning analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to analyze zoning" 
      });
    }
  });

  // AI Joint Venture Structure endpoint
  app.post("/api/ai/generate-jv", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          success: false, 
          error: "AI analysis unavailable. Please configure OpenAI API key." 
        });
      }

      const { propertyValue, totalCost, equity1, equity2 } = req.body;
      
      if (!propertyValue || !totalCost || !equity1 || !equity2) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: propertyValue, totalCost, equity1, equity2" 
        });
      }

      const jvStructure = await aiAnalysis.generateJVStructure(
        propertyValue, 
        totalCost, 
        equity1, 
        equity2
      );
      res.json({ success: true, structure: jvStructure });
      
    } catch (error) {
      console.error("JV structure error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate JV structure" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
