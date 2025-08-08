// AI-Powered Design Generator for BuildwiseAI
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DesignRequest {
  projectType: 'single-family' | 'duplex' | 'triplex' | 'fourplex' | 'townhouse' | 'apartment' | 'mixed-use';
  lotSize: number;
  units: number;
  budget: number;
  location: string;
  style: 'modern' | 'traditional' | 'craftsman' | 'contemporary' | 'minimalist' | 'rustic';
  requirements: string[];
  constraints: string[];
}

export interface DesignOutput {
  id: string;
  projectName: string;
  conceptDescription: string;
  floorPlanDescription: string;
  designFeatures: string[];
  materials: string[];
  sustainability: string[];
  costBreakdown: {
    category: string;
    estimated: number;
    percentage: number;
  }[];
  timeline: {
    phase: string;
    duration: string;
    description: string;
  }[];
  imagePrompts: string[];
  generatedImages: string[];
  createdAt: Date;
  request: DesignRequest;
}

export interface FloorPlanSuggestion {
  layout: string;
  unitMix: { bedrooms: number; bathrooms: number; sqft: number; count: number }[];
  efficiency: number;
  features: string[];
  advantages: string[];
  challenges: string[];
}

export class AIDesignGeneratorService {
  private designs: DesignOutput[] = [];

  /**
   * Generate comprehensive design concept
   */
  async generateDesignConcept(request: DesignRequest): Promise<DesignOutput> {
    try {
      // Check OpenAI API key availability
      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key not configured for design generation");
        throw new Error("AI design generation unavailable - OpenAI API key required");
      }

      console.log(`🎨 Generating AI design concept for ${request.projectType} in ${request.location}`);
      const conceptPrompt = this.buildConceptPrompt(request);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior architect and development consultant with expertise in Canadian residential design, BC building codes, and cost-effective construction methods. Always respond with valid JSON."
          },
          {
            role: "user",
            content: conceptPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("No response content from OpenAI");
      }
      
      let conceptData;
      try {
        conceptData = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        console.error("Raw OpenAI response:", responseContent);
        throw new Error("AI Design Generator: Invalid JSON response from OpenAI - check API limits and response format");
      }

      // Generate image prompts for visualization
      const imagePrompts = await this.generateImagePrompts(request, conceptData);
      
      // Generate actual images (if OpenAI API key is available)
      const generatedImages = await this.generateDesignImages(imagePrompts);

      const design: DesignOutput = {
        id: this.generateId(),
        projectName: conceptData.projectName || `${request.projectType} Development - ${request.location}`,
        conceptDescription: conceptData.conceptDescription,
        floorPlanDescription: conceptData.floorPlanDescription,
        designFeatures: conceptData.designFeatures || [],
        materials: conceptData.materials || [],
        sustainability: conceptData.sustainability || [],
        costBreakdown: conceptData.costBreakdown || [],
        timeline: conceptData.timeline || [],
        imagePrompts,
        generatedImages,
        createdAt: new Date(),
        request
      };

      this.designs.push(design);
      return design;

    } catch (error) {
      console.error("AI Design Generator Error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!process.env.OPENAI_API_KEY,
        requestType: request.projectType,
        location: request.location
      });
      
      // ENHANCED fallback design concept if OpenAI fails
      const fallbackDesign: DesignOutput = {
        id: this.generateId(),
        projectName: `${request.projectType} Development - ${request.location}`,
        conceptDescription: `Modern ${request.projectType} development designed for ${request.location}. This concept focuses on maximizing space efficiency while maintaining high design standards and cost-effectiveness.`,
        floorPlanDescription: `Open-concept layout designed for optimal flow and functionality. The design incorporates contemporary features while respecting local building codes and zoning requirements.`,
        designFeatures: [
          "Open concept living",
          "Energy-efficient design",
          "Modern finishes",
          "Optimized natural light",
          "Flexible living spaces",
          "Storage solutions"
        ],
        materials: [
          "Engineered hardwood flooring",
          "Quartz countertops",
          "Energy-efficient windows",
          "LED lighting systems",
          "High-efficiency appliances"
        ],
        sustainability: [
          "Energy Star certified appliances",
          "LED lighting throughout",
          "High-performance insulation",
          "Low-VOC materials",
          "Water-efficient fixtures"
        ],
        costBreakdown: [
          { category: "Foundation & Structure", estimated: request.budget * 0.25, percentage: 25 },
          { category: "Electrical & Plumbing", estimated: request.budget * 0.20, percentage: 20 },
          { category: "Interior Finishes", estimated: request.budget * 0.30, percentage: 30 },
          { category: "Exterior & Roofing", estimated: request.budget * 0.15, percentage: 15 },
          { category: "Permits & Contingency", estimated: request.budget * 0.10, percentage: 10 }
        ],
        timeline: [
          { phase: "Design & Permits", duration: "8-12 weeks", description: "Architectural plans and permit approval" },
          { phase: "Foundation", duration: "4-6 weeks", description: "Excavation and foundation work" },
          { phase: "Framing", duration: "6-8 weeks", description: "Structure and framing completion" },
          { phase: "Systems", duration: "8-10 weeks", description: "Electrical, plumbing, and HVAC" },
          { phase: "Finishes", duration: "10-12 weeks", description: "Interior and exterior finishes" }
        ],
        imagePrompts: [
          `Modern ${request.projectType} exterior design with contemporary styling`,
          `Open concept interior living space with modern finishes`,
          `Functional kitchen design with island and modern appliances`
        ],
        generatedImages: [], // No images in fallback mode
        createdAt: new Date(),
        request
      };

      this.designs.push(fallbackDesign);
      return fallbackDesign;
    }
  }

  /**
   * Generate floor plan suggestions
   */
  async generateFloorPlanSuggestions(
    projectType: string,
    units: number,
    lotSize: number,
    budget: number
  ): Promise<FloorPlanSuggestion[]> {
    try {
      const prompt = `Generate 3 different floor plan layout suggestions for:
      
      Project Type: ${projectType}
      Number of Units: ${units}
      Lot Size: ${lotSize} sq ft
      Budget: $${budget.toLocaleString()}
      
      For each layout, provide:
      - Layout name and description
      - Optimal unit mix (bedrooms, bathrooms, square footage, count)
      - Space efficiency percentage
      - Key features and advantages
      - Potential challenges or constraints
      
      Focus on maximizing livability, marketability, and construction efficiency.
      Return as JSON array with objects containing: layout, unitMix, efficiency, features, advantages, challenges.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert residential architect specializing in efficient floor plan design and space optimization for Canadian housing markets."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("No response content from OpenAI");
      }
      
      let result;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("JSON parsing failed for floor plans:", parseError);
        throw new Error("Invalid JSON response from OpenAI");
      }
      
      return result.suggestions || [];

    } catch (error) {
      console.error("Floor plan generation error:", error);
      throw new Error("Failed to generate floor plan suggestions");
    }
  }

  /**
   * Generate design images using DALL-E
   */
  async generateDesignImages(imagePrompts: string[]): Promise<string[]> {
    const images: string[] = [];

    try {
      for (const prompt of imagePrompts.slice(0, 2)) { // Limit to 2 images to manage costs
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        });

        if (response.data && response.data[0]?.url) {
          images.push(response.data[0].url);
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
      // Continue without images if generation fails
    }

    return images;
  }

  /**
   * Get design by ID
   */
  getDesignById(id: string): DesignOutput | null {
    return this.designs.find(design => design.id === id) || null;
  }

  /**
   * Get all designs
   */
  getAllDesigns(): DesignOutput[] {
    return this.designs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Generate cost estimation
   */
  async generateCostEstimation(
    projectType: string,
    units: number,
    sqft: number,
    location: string,
    finishLevel: 'basic' | 'standard' | 'premium' | 'luxury'
  ): Promise<{
    totalCost: number;
    costPerSqft: number;
    breakdown: { category: string; cost: number; percentage: number }[];
    contingency: number;
    timeline: string;
  }> {
    try {
      const prompt = `Create a detailed construction cost estimation for:
      
      Project: ${projectType}
      Units: ${units}
      Total Square Footage: ${sqft}
      Location: ${location}, BC
      Finish Level: ${finishLevel}
      
      Provide:
      1. Total estimated construction cost
      2. Cost per square foot
      3. Detailed cost breakdown by category (foundation, framing, electrical, plumbing, etc.)
      4. Recommended contingency percentage
      5. Estimated construction timeline
      
      Use current BC construction costs and include permit fees, inspections, and local factors.
      Return as JSON with totalCost, costPerSqft, breakdown (array), contingency, timeline.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a construction cost estimator with extensive experience in BC residential construction costs and current market rates."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content!);

    } catch (error) {
      console.error("Cost estimation error:", error);
      throw new Error("Failed to generate cost estimation");
    }
  }

  /**
   * Private helper methods
   */
  private buildConceptPrompt(request: DesignRequest): string {
    return `Create a comprehensive architectural design concept for:

    Project Type: ${request.projectType}
    Location: ${request.location}
    Lot Size: ${request.lotSize} sq ft
    Number of Units: ${request.units}
    Budget: $${request.budget.toLocaleString()}
    Architectural Style: ${request.style}
    
    Requirements: ${request.requirements.join(', ')}
    Constraints: ${request.constraints.join(', ')}
    
    Provide a complete design concept including:
    1. Project name and overall concept description
    2. Detailed floor plan description and layout strategy
    3. Key design features and architectural elements
    4. Recommended materials and finishes
    5. Sustainability features and green building elements
    6. Cost breakdown by major categories with percentages
    7. Construction timeline with phases and durations
    
    Focus on:
    - Maximizing density within zoning constraints
    - Creating marketable, livable spaces
    - Cost-effective construction methods
    - Energy efficiency and sustainability
    - Compliance with BC Building Code
    
    Return as JSON with keys: projectName, conceptDescription, floorPlanDescription, designFeatures, materials, sustainability, costBreakdown, timeline.`;
  }

  private async generateImagePrompts(request: DesignRequest, conceptData: any): Promise<string[]> {
    const prompts = [
      `Architectural exterior rendering of a ${request.style} ${request.projectType} in ${request.location}, BC. ${conceptData.conceptDescription}. Modern Canadian residential architecture, professional architectural visualization, high quality rendering`,
      
      `Interior floor plan layout for ${request.units}-unit ${request.projectType}. Clean architectural drawing style, detailed room layouts, furniture placement, efficient use of space, professional architectural presentation`,
      
      `${request.style} residential building facade design. Materials: ${conceptData.materials?.slice(0, 3).join(', ')}. Located in ${request.location}, BC. Contemporary Canadian architecture, street view perspective, detailed architectural elements`
    ];

    return prompts;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const aiDesignGeneratorService = new AIDesignGeneratorService();