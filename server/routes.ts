import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema, PropertyAnalysisInput } from "@shared/schema";
import { aiAnalysis } from "./ai-analysis";
import { propertyDataService } from "./property-data";
import { leadGenerationService } from "./lead-generation";
import { zoningIntelligenceService } from "./zoning-intelligence";
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

  // Property Data Lookup endpoint (BC Assessment + MLS)
  app.post("/api/property/lookup", async (req, res) => {
    try {
      const { address, city } = req.body;
      
      if (!address || !city) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address and city" 
        });
      }

      const propertyData = await propertyDataService.getPropertyData(address, city);
      res.json({ success: true, data: propertyData });
      
    } catch (error) {
      console.error("Property lookup error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to lookup property data" 
      });
    }
  });

  // BC Assessment specific lookup
  app.post("/api/property/bc-assessment", async (req, res) => {
    try {
      const { address, city } = req.body;
      
      if (!address || !city) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address and city" 
        });
      }

      const bcData = await propertyDataService.getBCAssessmentData(address, city);
      res.json({ success: true, data: bcData });
      
    } catch (error) {
      console.error("BC Assessment lookup error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to lookup BC Assessment data" 
      });
    }
  });

  // MLS Comparables lookup
  app.post("/api/property/mls-comparables", async (req, res) => {
    try {
      const { address, city, radius = 1 } = req.body;
      
      if (!address || !city) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address and city" 
        });
      }

      const mlsData = await propertyDataService.getMLSComparables(address, city, radius);
      res.json({ success: true, data: mlsData });
      
    } catch (error) {
      console.error("MLS lookup error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to lookup MLS data" 
      });
    }
  });

  // === LEAD GENERATION & SOCIAL MEDIA ENDPOINTS ===

  // Capture lead
  app.post("/api/leads/capture", async (req, res) => {
    try {
      const leadData = req.body;
      
      if (!leadData.name || !leadData.email || !leadData.projectInterest || !leadData.leadType) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: name, email, projectInterest, leadType" 
        });
      }

      const lead = await leadGenerationService.captureLead({
        ...leadData,
        source: req.headers.referer || 'direct'
      });

      res.json({ success: true, data: lead });
      
    } catch (error) {
      console.error("Lead capture error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to capture lead" 
      });
    }
  });

  // Get leads
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, leadType, projectInterest } = req.query;
      
      const leads = leadGenerationService.getLeads({
        status: status as any,
        leadType: leadType as any,
        projectInterest: projectInterest as any
      });

      res.json({ success: true, data: leads });
      
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve leads" 
      });
    }
  });

  // Update lead status
  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, tags } = req.body;
      
      const updated = leadGenerationService.updateLeadStatus(id, status, tags);
      
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          error: "Lead not found" 
        });
      }

      res.json({ success: true, message: "Lead updated successfully" });
      
    } catch (error) {
      console.error("Update lead error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update lead" 
      });
    }
  });

  // Generate social media content
  app.post("/api/social/generate", async (req, res) => {
    try {
      const { category, platform, topic } = req.body;
      
      if (!category || !platform) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: category, platform" 
        });
      }

      const post = await leadGenerationService.generateSocialContent(category, platform, topic);
      res.json({ success: true, data: post });
      
    } catch (error) {
      console.error("Social content generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate social content" 
      });
    }
  });

  // Get social media posts
  app.get("/api/social/posts", async (req, res) => {
    try {
      const { platform } = req.query;
      
      const posts = leadGenerationService.getSocialPosts(platform as any);
      res.json({ success: true, data: posts });
      
    } catch (error) {
      console.error("Get social posts error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve social posts" 
      });
    }
  });

  // Generate ad copy
  app.post("/api/advertising/generate-copy", async (req, res) => {
    try {
      const { targetAudience, offer, propertyType, location } = req.body;
      
      if (!targetAudience || !offer) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: targetAudience, offer" 
        });
      }

      const adCopy = await leadGenerationService.generateAdCopy(
        targetAudience, 
        offer, 
        propertyType, 
        location
      );
      
      res.json({ success: true, data: adCopy });
      
    } catch (error) {
      console.error("Ad copy generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate ad copy" 
      });
    }
  });

  // Generate landing page
  app.post("/api/marketing/landing-page", async (req, res) => {
    try {
      const config = req.body;
      
      if (!config.realtorName || !config.company || !config.primaryOffer) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: realtorName, company, primaryOffer" 
        });
      }

      const landingPageHtml = await leadGenerationService.generateLandingPage(config);
      res.json({ success: true, data: { html: landingPageHtml } });
      
    } catch (error) {
      console.error("Landing page generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate landing page" 
      });
    }
  });

  // === ZONING INTELLIGENCE ENDPOINTS ===

  // Get zoning analysis
  app.post("/api/zoning/analysis", async (req, res) => {
    try {
      const { address, city, lotSize } = req.body;
      
      if (!address || !city || !lotSize) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address, city, lotSize" 
        });
      }

      const analysis = await zoningIntelligenceService.getZoningAnalysis(address, city, lotSize);
      res.json({ success: true, data: analysis });
      
    } catch (error) {
      console.error("Zoning analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to analyze zoning" 
      });
    }
  });

  // Generate design suggestions
  app.post("/api/zoning/design-suggestions", async (req, res) => {
    try {
      const { zoningData, lotSize, developmentPotential, budget } = req.body;
      
      if (!zoningData || !lotSize || !developmentPotential) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: zoningData, lotSize, developmentPotential" 
        });
      }

      const suggestions = await zoningIntelligenceService.generateDesignSuggestions(
        zoningData, 
        lotSize, 
        developmentPotential, 
        budget
      );
      
      res.json({ success: true, data: suggestions });
      
    } catch (error) {
      console.error("Design suggestions error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate design suggestions" 
      });
    }
  });

  // Generate feasibility report
  app.post("/api/zoning/feasibility-report", async (req, res) => {
    try {
      const { cityData } = req.body;
      
      if (!cityData) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required field: cityData" 
        });
      }

      const report = await zoningIntelligenceService.generateFeasibilityReport(cityData);
      res.json({ success: true, data: { report } });
      
    } catch (error) {
      console.error("Feasibility report error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate feasibility report" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
