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
import { getVancouverPermits, searchVancouverPermitsByAddress, getVancouverPermitStats } from "./vancouver-open-data";
import { mlsService } from "./mls-integration";
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

  // === PERMIT TRACKING & MILESTONE MANAGEMENT ENDPOINTS ===

  // Get all permits with optional filters
  app.get("/api/permits", async (req, res) => {
    try {
      const { municipality, permitType, status, searchTerm, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (municipality) filters.municipality = municipality as string;
      if (permitType) filters.permitType = permitType as string;
      if (status) filters.status = status as string;
      if (searchTerm) filters.searchTerm = searchTerm as string;
      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const permits = await permitMilestoneService.getPermits(filters);
      
      res.json({ success: true, data: permits });
      
    } catch (error) {
      console.error("Get permits error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve permits" 
      });
    }
  });

  // Create new permit
  app.post("/api/permits", async (req, res) => {
    try {
      const permitData = req.body;
      
      if (!permitData.permitNumber || !permitData.municipality || !permitData.address || !permitData.permitType) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: permitNumber, municipality, address, permitType" 
        });
      }

      const { permitMilestoneService } = await import('./permit-milestone-service');
      const permit = await permitMilestoneService.createPermit(permitData);
      
      res.status(201).json({ success: true, data: permit });
      
    } catch (error) {
      console.error("Create permit error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create permit" 
      });
    }
  });

  // Get specific permit by ID
  app.get("/api/permits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const permit = await permitMilestoneService.getPermitById(id);
      
      if (!permit) {
        return res.status(404).json({ 
          success: false, 
          error: "Permit not found" 
        });
      }

      res.json({ success: true, data: permit });
      
    } catch (error) {
      console.error("Get permit error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve permit" 
      });
    }
  });

  // Update permit status
  app.patch("/api/permits/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required field: status" 
        });
      }

      const { permitMilestoneService } = await import('./permit-milestone-service');
      await permitMilestoneService.updatePermitStatus(id, status, notes);
      
      res.json({ success: true, message: "Permit status updated successfully" });
      
    } catch (error) {
      console.error("Update permit status error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update permit status" 
      });
    }
  });

  // Get milestones with optional filters
  app.get("/api/milestones", async (req, res) => {
    try {
      const { projectId, permitId, category, status, priority, assignedTo, overdue } = req.query;
      
      const filters: any = {};
      if (projectId) filters.projectId = projectId as string;
      if (permitId) filters.permitId = permitId as string;
      if (category) filters.category = category as string;
      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;
      if (assignedTo) filters.assignedTo = assignedTo as string;
      if (overdue === 'true') filters.overdue = true;
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const milestones = await permitMilestoneService.getMilestones(filters);
      
      res.json({ success: true, data: milestones });
      
    } catch (error) {
      console.error("Get milestones error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve milestones" 
      });
    }
  });

  // Create new milestone
  app.post("/api/milestones", async (req, res) => {
    try {
      const milestoneData = req.body;
      
      if (!milestoneData.title || !milestoneData.category) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: title, category" 
        });
      }

      const { permitMilestoneService } = await import('./permit-milestone-service');
      const milestone = await permitMilestoneService.createMilestone(milestoneData);
      
      res.status(201).json({ success: true, data: milestone });
      
    } catch (error) {
      console.error("Create milestone error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create milestone" 
      });
    }
  });

  // Update milestone
  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      await permitMilestoneService.updateMilestone(id, updates);
      
      res.json({ success: true, message: "Milestone updated successfully" });
      
    } catch (error) {
      console.error("Update milestone error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update milestone" 
      });
    }
  });

  // Get upcoming milestones
  app.get("/api/milestones/upcoming", async (req, res) => {
    try {
      const { days } = req.query;
      const dayCount = days ? parseInt(days as string) : 7;
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const milestones = await permitMilestoneService.getUpcomingMilestones(dayCount);
      
      res.json({ success: true, data: milestones });
      
    } catch (error) {
      console.error("Get upcoming milestones error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve upcoming milestones" 
      });
    }
  });

  // Get overdue milestones
  app.get("/api/milestones/overdue", async (req, res) => {
    try {
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const milestones = await permitMilestoneService.getOverdueMilestones();
      
      res.json({ success: true, data: milestones });
      
    } catch (error) {
      console.error("Get overdue milestones error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve overdue milestones" 
      });
    }
  });

  // Schedule inspection
  app.post("/api/inspections", async (req, res) => {
    try {
      const inspectionData = req.body;
      
      if (!inspectionData.permitId || !inspectionData.inspectionType) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: permitId, inspectionType" 
        });
      }

      const { permitMilestoneService } = await import('./permit-milestone-service');
      const inspection = await permitMilestoneService.scheduleInspection(inspectionData);
      
      res.status(201).json({ success: true, data: inspection });
      
    } catch (error) {
      console.error("Schedule inspection error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to schedule inspection" 
      });
    }
  });

  // Update inspection result
  app.patch("/api/inspections/:id/result", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, deficiencies } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required field: status" 
        });
      }

      const { permitMilestoneService } = await import('./permit-milestone-service');
      await permitMilestoneService.updateInspectionResult(id, status, notes, deficiencies || []);
      
      res.json({ success: true, message: "Inspection result updated successfully" });
      
    } catch (error) {
      console.error("Update inspection result error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update inspection result" 
      });
    }
  });

  // Get project timeline
  app.get("/api/projects/:id/timeline", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const timeline = await permitMilestoneService.getProjectTimeline(id);
      
      res.json({ success: true, data: timeline });
      
    } catch (error) {
      console.error("Get project timeline error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve project timeline" 
      });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/permit-stats", async (req, res) => {
    try {
      const { permitMilestoneService } = await import('./permit-milestone-service');
      const stats = await permitMilestoneService.getDashboardStats();
      
      res.json({ success: true, data: stats });
      
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve dashboard statistics" 
      });
    }
  });

  // === CONTRACTOR MARKETPLACE ENDPOINTS ===

  // Get all contractors with filters
  app.get("/api/contractors", async (req, res) => {
    try {
      const { trades, serviceAreas, city, minRating, availabilityStatus, isVerified, searchTerm } = req.query;
      
      const filters: any = {};
      if (trades) filters.trades = Array.isArray(trades) ? trades : [trades];
      if (serviceAreas) filters.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas];
      if (city) filters.city = city as string;
      if (minRating) filters.minRating = parseFloat(minRating as string);
      if (availabilityStatus) filters.availabilityStatus = availabilityStatus as string;
      if (isVerified) filters.isVerified = isVerified === 'true';
      if (searchTerm) filters.searchTerm = searchTerm as string;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const contractors = await contractorMarketplaceService.getContractors(filters);
      
      res.json({ success: true, data: contractors });
      
    } catch (error) {
      console.error("Get contractors error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve contractors" 
      });
    }
  });

  // Register new contractor
  app.post("/api/contractors", async (req, res) => {
    try {
      const contractorData = req.body;
      
      if (!contractorData.companyName || !contractorData.contactName || !contractorData.email || 
          !contractorData.phone || !contractorData.city || !contractorData.trades || 
          !contractorData.serviceAreas || !contractorData.yearsExperience) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: companyName, contactName, email, phone, city, trades, serviceAreas, yearsExperience" 
        });
      }

      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const contractor = await contractorMarketplaceService.createContractor(contractorData);
      
      res.status(201).json({ success: true, data: contractor });
      
    } catch (error) {
      console.error("Create contractor error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to register contractor" 
      });
    }
  });

  // Get specific contractor by ID
  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const contractor = await contractorMarketplaceService.getContractorById(id);
      
      if (!contractor) {
        return res.status(404).json({ 
          success: false, 
          error: "Contractor not found" 
        });
      }

      res.json({ success: true, data: contractor });
      
    } catch (error) {
      console.error("Get contractor error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve contractor" 
      });
    }
  });

  // Update contractor profile
  app.patch("/api/contractors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      await contractorMarketplaceService.updateContractor(id, updates);
      
      res.json({ success: true, message: "Contractor profile updated successfully" });
      
    } catch (error) {
      console.error("Update contractor error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update contractor profile" 
      });
    }
  });

  // Get all projects with filters
  app.get("/api/projects", async (req, res) => {
    try {
      const { tradeNeeded, city, projectType, projectSize, status, minBudget, maxBudget, isUrgent, searchTerm } = req.query;
      
      const filters: any = {};
      if (tradeNeeded) filters.tradeNeeded = tradeNeeded as string;
      if (city) filters.city = city as string;
      if (projectType) filters.projectType = projectType as string;
      if (projectSize) filters.projectSize = projectSize as string;
      if (status) filters.status = status as string;
      if (minBudget && maxBudget) {
        filters.budgetRange = {
          min: parseInt(minBudget as string),
          max: parseInt(maxBudget as string)
        };
      }
      if (isUrgent) filters.isUrgent = isUrgent === 'true';
      if (searchTerm) filters.searchTerm = searchTerm as string;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const projects = await contractorMarketplaceService.getProjects(filters);
      
      res.json({ success: true, data: projects });
      
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve projects" 
      });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = req.body;
      
      if (!projectData.title || !projectData.description || !projectData.location || 
          !projectData.city || !projectData.projectType || !projectData.tradeNeeded || 
          !projectData.projectSize || !projectData.clientName || !projectData.clientEmail) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: title, description, location, city, projectType, tradeNeeded, projectSize, clientName, clientEmail" 
        });
      }

      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const project = await contractorMarketplaceService.createProject(projectData);
      
      res.status(201).json({ success: true, data: project });
      
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create project" 
      });
    }
  });

  // Get projects for specific contractor
  app.get("/api/contractors/:id/projects", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const projects = await contractorMarketplaceService.getProjectsForContractor(id);
      
      res.json({ success: true, data: projects });
      
    } catch (error) {
      console.error("Get contractor projects error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve projects for contractor" 
      });
    }
  });

  // Submit bid for project
  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = req.body;
      
      if (!bidData.projectId || !bidData.contractorId || !bidData.bidAmount || 
          !bidData.timeline || !bidData.proposalText) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: projectId, contractorId, bidAmount, timeline, proposalText" 
        });
      }

      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const bid = await contractorMarketplaceService.createBid(bidData);
      
      res.status(201).json({ success: true, data: bid });
      
    } catch (error) {
      console.error("Create bid error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to submit bid" 
      });
    }
  });

  // Get bids with filters
  app.get("/api/bids", async (req, res) => {
    try {
      const { projectId, contractorId, status, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (projectId) filters.projectId = projectId as string;
      if (contractorId) filters.contractorId = contractorId as string;
      if (status) filters.status = status as string;
      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const bids = await contractorMarketplaceService.getBids(filters);
      
      res.json({ success: true, data: bids });
      
    } catch (error) {
      console.error("Get bids error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve bids" 
      });
    }
  });

  // Update bid status (accept/reject)
  app.patch("/api/bids/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required field: status" 
        });
      }

      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      await contractorMarketplaceService.updateBidStatus(id, status, notes);
      
      res.json({ success: true, message: "Bid status updated successfully" });
      
    } catch (error) {
      console.error("Update bid status error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update bid status" 
      });
    }
  });

  // Submit contractor review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = req.body;
      
      if (!reviewData.contractorId || !reviewData.reviewerName || !reviewData.rating) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: contractorId, reviewerName, rating" 
        });
      }

      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const review = await contractorMarketplaceService.createReview(reviewData);
      
      res.status(201).json({ success: true, data: review });
      
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to submit review" 
      });
    }
  });

  // Get contractor reviews
  app.get("/api/contractors/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const reviews = await contractorMarketplaceService.getReviewsForContractor(id);
      
      res.json({ success: true, data: reviews });
      
    } catch (error) {
      console.error("Get contractor reviews error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve contractor reviews" 
      });
    }
  });

  // Get marketplace statistics
  app.get("/api/dashboard/marketplace-stats", async (req, res) => {
    try {
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const stats = await contractorMarketplaceService.getMarketplaceStats();
      
      res.json({ success: true, data: stats });
      
    } catch (error) {
      console.error("Get marketplace stats error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve marketplace statistics" 
      });
    }
  });

  // Get contractor dashboard stats
  app.get("/api/contractors/:id/dashboard-stats", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { contractorMarketplaceService } = await import('./contractor-marketplace-service');
      const stats = await contractorMarketplaceService.getContractorDashboardStats(id);
      
      res.json({ success: true, data: stats });
      
    } catch (error) {
      console.error("Get contractor dashboard stats error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve contractor dashboard statistics" 
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

  // Real Vancouver Open Data endpoints
  app.get("/api/permits/vancouver/live", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const permits = await getVancouverPermits(limit);
      res.json({ success: true, permits, source: "Vancouver Open Data API" });
    } catch (error) {
      console.error("Error fetching Vancouver permits:", error);
      res.status(500).json({ success: false, error: "Failed to fetch live permit data" });
    }
  });

  app.get("/api/permits/vancouver/search", async (req, res) => {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json({ success: false, error: "Address parameter required" });
      }
      const permits = await searchVancouverPermitsByAddress(address as string);
      res.json({ success: true, permits, source: "Vancouver Open Data API" });
    } catch (error) {
      console.error("Error searching Vancouver permits:", error);
      res.status(500).json({ success: false, error: "Failed to search permit data" });
    }
  });

  app.get("/api/permits/vancouver/stats", async (req, res) => {
    try {
      const stats = await getVancouverPermitStats();
      res.json({ success: true, stats, source: "Vancouver Open Data API" });
    } catch (error) {
      console.error("Error fetching Vancouver permit stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch permit statistics" });
    }
  });

  // Real MLS endpoints for licensed realtors
  app.get("/api/mls/listings/search", async (req, res) => {
    try {
      const { city, propertyType, minPrice, maxPrice, limit } = req.query;
      
      if (!city) {
        return res.status(400).json({ success: false, error: "City parameter required" });
      }

      const listings = await mlsService.searchListings(
        city as string,
        propertyType as string,
        minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice ? parseInt(maxPrice as string) : undefined,
        limit ? parseInt(limit as string) : 50
      );

      res.json({ 
        success: true, 
        listings, 
        source: "MLS Real Estate Board",
        disclaimer: "MLS® data provided by licensed realtor"
      });
    } catch (error) {
      console.error("Error searching MLS listings:", error);
      res.status(500).json({ success: false, error: "Failed to search MLS listings" });
    }
  });

  app.get("/api/mls/comparables", async (req, res) => {
    try {
      const { address, city, radius, months } = req.query;
      
      if (!address || !city) {
        return res.status(400).json({ success: false, error: "Address and city parameters required" });
      }

      const comparables = await mlsService.getSoldComparables(
        address as string,
        city as string,
        radius ? parseFloat(radius as string) : 1,
        months ? parseInt(months as string) : 12
      );

      res.json({ 
        success: true, 
        comparables, 
        source: "MLS Real Estate Board",
        disclaimer: "MLS® sold data provided by licensed realtor"
      });
    } catch (error) {
      console.error("Error fetching MLS comparables:", error);
      res.status(500).json({ success: false, error: "Failed to fetch sold comparables" });
    }
  });

  app.get("/api/mls/property/:mlsNumber", async (req, res) => {
    try {
      const { mlsNumber } = req.params;
      
      const property = await mlsService.getPropertyDetails(mlsNumber);

      res.json({ 
        success: true, 
        property, 
        source: "MLS Real Estate Board",
        disclaimer: "MLS® property data provided by licensed realtor"
      });
    } catch (error) {
      console.error("Error fetching MLS property details:", error);
      res.status(500).json({ success: false, error: "Failed to fetch property details" });
    }
  });

  app.get("/api/mls/market/stats", async (req, res) => {
    try {
      const { city, propertyType } = req.query;
      
      if (!city) {
        return res.status(400).json({ success: false, error: "City parameter required" });
      }

      const stats = await mlsService.getMarketStats(
        city as string,
        propertyType as string
      );

      res.json({ 
        success: true, 
        stats, 
        source: "MLS Real Estate Board",
        disclaimer: "MLS® market data provided by licensed realtor"
      });
    } catch (error) {
      console.error("Error fetching MLS market stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch market statistics" });
    }
  });

  // Initialize sample contractor data (only in development)
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/init-sample-contractors", async (req, res) => {
      try {
        const { createSampleContractorData } = await import('./sample-contractor-data');
        await createSampleContractorData();
        
        res.json({ 
          success: true, 
          message: "Sample contractor marketplace data created successfully" 
        });
        
      } catch (error) {
        console.error("Init sample contractor data error:", error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to initialize sample data" 
        });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
