import OpenAI from "openai";
import { PropertyAnalysisInput, PropertyAnalysisResult } from "../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export class RealEstateAnalysisAI {
  async analyzeProperty(property: PropertyAnalysisInput): Promise<PropertyAnalysisResult> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = this.buildAnalysisPrompt(property);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert real estate development analyst with extensive knowledge of Canadian real estate markets, zoning regulations, and financial modeling. Provide detailed, actionable analysis in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent financial analysis
      });

      const analysis = JSON.parse(response.choices[0].message.content!);
      return this.formatAnalysisResult(analysis, property);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to analyze property. Please check your API key and try again.");
    }
  }

  async analyzeZoning(address: string, city: string): Promise<any> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = `
      Analyze the zoning and development potential for this property:
      Address: ${address}
      City: ${city}
      
      Provide analysis on:
      1. Likely zoning classification
      2. Density allowances and building height restrictions
      3. Setback requirements
      4. Parking requirements
      5. Development fees and charges
      6. Bill 47 impacts (BC multiplex zoning)
      7. Potential development scenarios
      
      Return as JSON with specific recommendations.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a zoning and municipal planning expert specializing in British Columbia regulations and Bill 47 multiplex legislation."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      console.error("Zoning Analysis Error:", error);
      throw new Error("Failed to analyze zoning. Please try again.");
    }
  }

  async generateJVStructure(propertyValue: number, totalCost: number, equity1: number, equity2: number): Promise<any> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = `
      Create a detailed Joint Venture structure for this real estate development project:
      
      Property Value: $${propertyValue.toLocaleString()}
      Total Development Cost: $${totalCost.toLocaleString()}
      Partner 1 Equity: ${equity1}%
      Partner 2 Equity: ${equity2}%
      
      Provide:
      1. Cash flow distribution model
      2. Profit sharing structure
      3. Exit strategy options
      4. Risk allocation
      5. Management responsibilities
      6. Return projections for each partner
      7. Key performance milestones
      
      Format as JSON with detailed calculations.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in real estate joint venture structuring and partnership agreements with deep knowledge of Canadian real estate investment structures."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      console.error("JV Structure Error:", error);
      throw new Error("Failed to generate JV structure. Please try again.");
    }
  }

  private buildAnalysisPrompt(property: PropertyAnalysisInput): string {
    return `
      Analyze this real estate development opportunity:

      Property Details:
      - Address: ${property.address}
      - Current Value: $${property.currentValue?.toLocaleString() || 'TBD'}
      - Lot Size: ${property.lotSize} sq ft
      - Current Use: ${property.currentUse || 'Residential'}
      - Proposed Development: ${property.proposedUse || 'Multi-family'}

      Market Context:
      - City: ${property.city}
      - Province: British Columbia, Canada
      - Analysis Date: ${new Date().toLocaleDateString()}

      Please provide comprehensive analysis including:

      1. FINANCIAL ANALYSIS
         - Estimated development costs
         - Revenue projections
         - Net profit calculations
         - ROI percentages
         - Cash flow timeline

      2. MARKET ANALYSIS
         - Comparable sales data considerations
         - Market demand indicators
         - Pricing recommendations
         - Risk factors

      3. DEVELOPMENT FEASIBILITY
         - Construction complexity assessment
         - Timeline estimates
         - Regulatory considerations
         - Potential obstacles

      4. RECOMMENDATIONS
         - Go/No-go recommendation
         - Optimization suggestions
         - Alternative development scenarios

      Format as JSON with specific numbers and actionable insights.
    `;
  }

  private formatAnalysisResult(analysis: any, input: PropertyAnalysisInput): PropertyAnalysisResult {
    return {
      propertyId: input.address, // Using address as ID for now
      analysisDate: new Date(),
      financialSummary: {
        estimatedCosts: analysis.financial?.development_costs || 0,
        projectedRevenue: analysis.financial?.revenue || 0,
        netProfit: analysis.financial?.net_profit || 0,
        roi: analysis.financial?.roi || 0,
        paybackPeriod: analysis.financial?.payback_months || 24
      },
      marketAnalysis: {
        marketDemand: analysis.market?.demand_score || 'Medium',
        comparableSales: analysis.market?.comparable_range || '$500-700k',
        priceRecommendation: analysis.market?.recommended_price || 0,
        riskFactors: analysis.market?.risks || []
      },
      developmentFeasibility: {
        complexity: analysis.development?.complexity || 'Medium',
        timelineMonths: analysis.development?.timeline_months || 12,
        majorObstacles: analysis.development?.obstacles || [],
        regulatoryRequirements: analysis.development?.regulatory || []
      },
      recommendations: {
        goNoGo: analysis.recommendations?.decision || 'Proceed with caution',
        optimizations: analysis.recommendations?.improvements || [],
        alternatives: analysis.recommendations?.alternatives || []
      },
      confidence: analysis.confidence_score || 75
    };
  }
}

export const aiAnalysis = new RealEstateAnalysisAI();