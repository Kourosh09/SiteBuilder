import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema, PropertyAnalysisInput } from "@shared/schema";
import { aiAnalysis } from "./ai-analysis";
import { propertyDataService } from "./property-data";
import { leadGenerationService } from "./lead-generation";
import { zoningIntelligenceService } from "./zoning-intelligence";
import { permitTrackerService } from "./permit-tracker";
import { partnerFinderService } from "./partner-finder";
import { aiDesignGeneratorService } from "./ai-design-generator";
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
      const { address, city, lotSize, frontage } = req.body;
      
      if (!address || !city || !lotSize || !frontage) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: address, city, lotSize, frontage" 
        });
      }

      const analysis = await zoningIntelligenceService.getZoningAnalysisWithBill44(address, city, lotSize, frontage);
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

  // === PERMIT TRACKER ENDPOINTS ===

  // Search permits
  app.post("/api/permits/search", async (req, res) => {
    try {
      const filters = req.body;
      const permits = permitTrackerService.searchPermits(filters);
      res.json({ success: true, data: permits });
      
    } catch (error) {
      console.error("Permit search error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to search permits" 
      });
    }
  });

  // Get permits by city
  app.get("/api/permits/city/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const permits = permitTrackerService.getPermitsByCity(city);
      res.json({ success: true, data: permits });
      
    } catch (error) {
      console.error("Get permits by city error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get permits" 
      });
    }
  });

  // Get development insights
  app.get("/api/permits/insights/:city?", async (req, res) => {
    try {
      const { city } = req.params;
      const insights = permitTrackerService.getDevelopmentInsights(city);
      res.json({ success: true, data: insights });
      
    } catch (error) {
      console.error("Get development insights error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get insights" 
      });
    }
  });

  // Generate market analysis
  app.post("/api/permits/market-analysis", async (req, res) => {
    try {
      const { city } = req.body;
      
      if (!city) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required field: city" 
        });
      }

      const analysis = await permitTrackerService.generateMarketAnalysis(city);
      res.json({ success: true, data: { analysis } });
      
    } catch (error) {
      console.error("Market analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate market analysis" 
      });
    }
  });

  // === PARTNER FINDER ENDPOINTS ===

  // Search partners
  app.post("/api/partners/search", async (req, res) => {
    try {
      const filters = req.body;
      const partners = partnerFinderService.searchPartners(filters);
      res.json({ success: true, data: partners });
      
    } catch (error) {
      console.error("Partner search error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to search partners" 
      });
    }
  });

  // Add partner
  app.post("/api/partners", async (req, res) => {
    try {
      const partnerData = req.body;
      
      if (!partnerData.name || !partnerData.company || !partnerData.tradeType) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: name, company, tradeType" 
        });
      }

      const partner = await partnerFinderService.addPartner(partnerData);
      res.json({ success: true, data: partner });
      
    } catch (error) {
      console.error("Add partner error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add partner" 
      });
    }
  });

  // Get partner by ID
  app.get("/api/partners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const partner = partnerFinderService.getPartnerById(id);
      
      if (!partner) {
        return res.status(404).json({ 
          success: false, 
          error: "Partner not found" 
        });
      }

      res.json({ success: true, data: partner });
      
    } catch (error) {
      console.error("Get partner error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get partner" 
      });
    }
  });

  // Post project opportunity
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = req.body;
      
      if (!projectData.title || !projectData.description || !projectData.location) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: title, description, location" 
        });
      }

      const project = await partnerFinderService.postProjectOpportunity(projectData);
      res.json({ success: true, data: project });
      
    } catch (error) {
      console.error("Post project error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to post project" 
      });
    }
  });

  // Get project opportunities
  app.get("/api/projects", async (req, res) => {
    try {
      const { status } = req.query;
      const projects = partnerFinderService.getProjectOpportunities(status as any);
      res.json({ success: true, data: projects });
      
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get projects" 
      });
    }
  });

  // Submit proposal
  app.post("/api/proposals", async (req, res) => {
    try {
      const proposalData = req.body;
      
      if (!proposalData.projectId || !proposalData.partnerId || !proposalData.proposedValue) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: projectId, partnerId, proposedValue" 
        });
      }

      const proposal = await partnerFinderService.submitProposal(proposalData);
      res.json({ success: true, data: proposal });
      
    } catch (error) {
      console.error("Submit proposal error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to submit proposal" 
      });
    }
  });

  // Get project proposals
  app.get("/api/projects/:id/proposals", async (req, res) => {
    try {
      const { id } = req.params;
      const proposals = partnerFinderService.getProjectProposals(id);
      res.json({ success: true, data: proposals });
      
    } catch (error) {
      console.error("Get project proposals error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get proposals" 
      });
    }
  });

  // === AI DESIGN GENERATOR ENDPOINTS ===

  // Generate design concept
  app.post("/api/design/generate", async (req, res) => {
    try {
      const designRequest = req.body;
      
      if (!designRequest.projectType || !designRequest.lotSize || !designRequest.units) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: projectType, lotSize, units" 
        });
      }

      const design = await aiDesignGeneratorService.generateDesignConcept(designRequest);
      res.json({ success: true, data: design });
      
    } catch (error) {
      console.error("Design generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate design" 
      });
    }
  });

  // Generate floor plan suggestions
  app.post("/api/design/floor-plans", async (req, res) => {
    try {
      const { projectType, units, lotSize, budget } = req.body;
      
      if (!projectType || !units || !lotSize || !budget) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: projectType, units, lotSize, budget" 
        });
      }

      const suggestions = await aiDesignGeneratorService.generateFloorPlanSuggestions(
        projectType, 
        units, 
        lotSize, 
        budget
      );
      res.json({ success: true, data: suggestions });
      
    } catch (error) {
      console.error("Floor plan generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate floor plans" 
      });
    }
  });

  // Generate cost estimation
  app.post("/api/design/cost-estimation", async (req, res) => {
    try {
      const { projectType, units, sqft, location, finishLevel } = req.body;
      
      if (!projectType || !units || !sqft || !location) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: projectType, units, sqft, location" 
        });
      }

      const estimation = await aiDesignGeneratorService.generateCostEstimation(
        projectType, 
        units, 
        sqft, 
        location, 
        finishLevel || 'standard'
      );
      res.json({ success: true, data: estimation });
      
    } catch (error) {
      console.error("Cost estimation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate cost estimation" 
      });
    }
  });

  // Get all designs
  app.get("/api/design/history", async (req, res) => {
    try {
      const designs = aiDesignGeneratorService.getAllDesigns();
      res.json({ success: true, data: designs });
      
    } catch (error) {
      console.error("Get design history error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get design history" 
      });
    }
  });

  // Get design by ID
  app.get("/api/design/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const design = aiDesignGeneratorService.getDesignById(id);
      
      if (!design) {
        return res.status(404).json({ 
          success: false, 
          error: "Design not found" 
        });
      }

      res.json({ success: true, data: design });
      
    } catch (error) {
      console.error("Get design error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get design" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
