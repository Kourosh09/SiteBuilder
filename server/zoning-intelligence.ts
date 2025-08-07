// Zoning Intelligence & City Data Integration for BuildwiseAI
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ZoningData {
  zoningCode: string;
  description: string;
  maxHeight: number;
  maxFAR: number;
  maxDensity: number;
  permittedUses: string[];
  setbacks: {
    front: number;
    rear: number;
    side: number;
  };
  parkingRequirements: string;
  specialRestrictions?: string[];
}

export interface DevelopmentPotential {
  maxUnits: number;
  suggestedUnitMix: {
    bedrooms: number;
    count: number;
  }[];
  buildingType: string;
  estimatedGFA: number;
  estimatedValue: number;
  feasibilityScore: number;
  constraints: string[];
  opportunities: string[];
}

export interface CityDataResult {
  address: string;
  coordinates: { lat: number; lng: number };
  zoning: ZoningData;
  developmentPotential: DevelopmentPotential;
  nearbyAmenities: {
    transit: { type: string; distance: number }[];
    schools: { name: string; rating: number; distance: number }[];
    shopping: { name: string; type: string; distance: number }[];
  };
  marketContext: {
    averageHomePrices: number;
    constructionCosts: number;
    saleVelocity: string;
    demographics: string;
  };
}

export interface DesignSuggestion {
  layoutType: string;
  unitConfiguration: string;
  estimatedCost: number;
  timeline: string;
  keyFeatures: string[];
  aiSketch?: string;
}

export class ZoningIntelligenceService {
  private zoningRules: Map<string, ZoningData> = new Map();

  constructor() {
    this.initializeZoningRules();
  }

  /**
   * Get comprehensive zoning and development analysis
   */
  async getZoningAnalysis(address: string, city: string, lotSize: number): Promise<CityDataResult> {
    try {
      // Get coordinates (simulated for now - would integrate with geocoding API)
      const coordinates = await this.geocodeAddress(address, city);
      
      // Get zoning data (simulated - would integrate with municipal GIS APIs)
      const zoning = await this.getZoningData(coordinates, city);
      
      // Calculate development potential
      const developmentPotential = await this.calculateDevelopmentPotential(zoning, lotSize, city);
      
      // Get nearby amenities (simulated - would integrate with maps APIs)
      const nearbyAmenities = await this.getNearbyAmenities(coordinates);
      
      // Get market context
      const marketContext = await this.getMarketContext(city);

      return {
        address: `${address}, ${city}, BC`,
        coordinates,
        zoning,
        developmentPotential,
        nearbyAmenities,
        marketContext
      };
      
    } catch (error) {
      console.error("Zoning analysis error:", error);
      throw new Error("Failed to analyze zoning and development potential");
    }
  }

  /**
   * Generate AI-powered design suggestions
   */
  async generateDesignSuggestions(
    zoningData: ZoningData,
    lotSize: number,
    developmentPotential: DevelopmentPotential,
    budget?: number
  ): Promise<DesignSuggestion[]> {
    try {
      const prompt = `As an expert architect and development consultant, provide design suggestions for:
      
      Lot Size: ${lotSize} sq ft
      Zoning: ${zoningData.zoningCode} (${zoningData.description})
      Max Units: ${developmentPotential.maxUnits}
      Max FAR: ${zoningData.maxFAR}
      Building Type: ${developmentPotential.buildingType}
      ${budget ? `Budget: $${budget.toLocaleString()}` : ''}
      
      Provide 3 different design approaches with:
      - Layout type and unit configuration
      - Estimated construction cost
      - Development timeline
      - Key architectural features
      - Optimization strategies
      
      Return JSON array with objects containing: layoutType, unitConfiguration, estimatedCost, timeline, keyFeatures (array).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior architect and real estate development consultant with expertise in BC building codes, zoning optimization, and cost-effective design."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result.suggestions || [];
      
    } catch (error) {
      console.error("Design suggestion generation error:", error);
      throw new Error("Failed to generate design suggestions");
    }
  }

  /**
   * Generate AI-powered feasibility report
   */
  async generateFeasibilityReport(cityData: CityDataResult): Promise<string> {
    try {
      const prompt = `Create a comprehensive feasibility analysis report for:
      
      Property: ${cityData.address}
      Zoning: ${cityData.zoning.zoningCode} - ${cityData.zoning.description}
      Development Potential: ${cityData.developmentPotential.maxUnits} units
      Feasibility Score: ${cityData.developmentPotential.feasibilityScore}/100
      
      Market Context:
      - Average Home Prices: $${cityData.marketContext.averageHomePrices.toLocaleString()}
      - Construction Costs: $${cityData.marketContext.constructionCosts.toLocaleString()}
      - Sale Velocity: ${cityData.marketContext.saleVelocity}
      
      Constraints: ${cityData.developmentPotential.constraints.join(', ')}
      Opportunities: ${cityData.developmentPotential.opportunities.join(', ')}
      
      Generate a professional feasibility report with:
      1. Executive Summary
      2. Zoning Analysis
      3. Development Potential Assessment
      4. Market Analysis
      5. Financial Projections
      6. Risk Assessment
      7. Recommendations
      
      Format as a professional report with clear sections and actionable insights.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior real estate development consultant creating professional feasibility reports for clients. Use industry-standard analysis methods and clear, actionable language."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response.choices[0].message.content!;
      
    } catch (error) {
      console.error("Feasibility report generation error:", error);
      throw new Error("Failed to generate feasibility report");
    }
  }

  /**
   * Private helper methods for data simulation
   * TODO: Replace with real API integrations
   */
  private async geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number }> {
    // Simulate geocoding - would integrate with Google Maps API or similar
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'vancouver': { lat: 49.2827, lng: -123.1207 },
      'burnaby': { lat: 49.2488, lng: -122.9805 },
      'richmond': { lat: 49.1666, lng: -123.1336 },
      'surrey': { lat: 49.1913, lng: -122.8490 },
      'coquitlam': { lat: 49.2838, lng: -122.7932 }
    };

    const baseCoords = cityCoordinates[city.toLowerCase()] || cityCoordinates['vancouver'];
    
    // Add small random offset to simulate specific address
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.01
    };
  }

  private async getZoningData(coordinates: { lat: number; lng: number }, city: string): Promise<ZoningData> {
    // Simulate zoning lookup - would integrate with municipal GIS APIs
    const zoningCodes = ['RS-1', 'RS-2', 'RS-3', 'RS-5', 'RS-7', 'RT-1', 'RT-2', 'RM-1', 'RM-2'];
    const randomZoning = zoningCodes[Math.floor(Math.random() * zoningCodes.length)];
    
    return this.zoningRules.get(randomZoning) || this.zoningRules.get('RS-1')!;
  }

  private async calculateDevelopmentPotential(
    zoning: ZoningData,
    lotSize: number,
    city: string
  ): Promise<DevelopmentPotential> {
    // Calculate maximum units based on zoning and lot size
    const maxUnits = Math.min(
      Math.floor(lotSize * zoning.maxFAR / 800), // Assume 800 sq ft average unit
      zoning.maxDensity
    );

    // Estimate gross floor area
    const estimatedGFA = Math.min(lotSize * zoning.maxFAR, maxUnits * 900);

    // Suggest unit mix
    const suggestedUnitMix = this.generateUnitMix(maxUnits);

    // Calculate estimated value (simplified)
    const cityMultipliers: Record<string, number> = {
      'vancouver': 1800,
      'burnaby': 1300,
      'richmond': 1400,
      'surrey': 1000,
      'coquitlam': 1200
    };

    const pricePerSqFt = cityMultipliers[city.toLowerCase()] || 1200;
    const estimatedValue = estimatedGFA * pricePerSqFt;

    // Calculate feasibility score
    const feasibilityScore = this.calculateFeasibilityScore(zoning, lotSize, maxUnits, city);

    // Identify constraints and opportunities
    const constraints = this.identifyConstraints(zoning, lotSize);
    const opportunities = this.identifyOpportunities(zoning, maxUnits, city);

    return {
      maxUnits,
      suggestedUnitMix,
      buildingType: this.determineBuildingType(maxUnits, zoning.zoningCode),
      estimatedGFA,
      estimatedValue,
      feasibilityScore,
      constraints,
      opportunities
    };
  }

  private async getNearbyAmenities(coordinates: { lat: number; lng: number }) {
    // Simulate amenity lookup - would integrate with Maps APIs
    return {
      transit: [
        { type: 'SkyTrain Station', distance: 850 },
        { type: 'Bus Stop', distance: 200 }
      ],
      schools: [
        { name: 'Elementary School', rating: 8, distance: 400 },
        { name: 'High School', rating: 7, distance: 1200 }
      ],
      shopping: [
        { name: 'Shopping Centre', type: 'Mall', distance: 1500 },
        { name: 'Grocery Store', type: 'Supermarket', distance: 600 }
      ]
    };
  }

  private async getMarketContext(city: string) {
    const cityData: Record<string, any> = {
      'vancouver': {
        averageHomePrices: 1650000,
        constructionCosts: 280,
        saleVelocity: 'Fast (30-45 days)',
        demographics: 'Young professionals and families'
      },
      'burnaby': {
        averageHomePrices: 1200000,
        constructionCosts: 260,
        saleVelocity: 'Moderate (45-60 days)',
        demographics: 'Diverse families and professionals'
      }
    };

    return cityData[city.toLowerCase()] || cityData['vancouver'];
  }

  private initializeZoningRules(): void {
    // Initialize common BC zoning rules
    const zoningRules: [string, ZoningData][] = [
      ['RS-1', {
        zoningCode: 'RS-1',
        description: 'Single-family residential',
        maxHeight: 10.7,
        maxFAR: 0.70,
        maxDensity: 1,
        permittedUses: ['Single-family dwelling', 'Home occupation'],
        setbacks: { front: 6, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit'
      }],
      ['RS-2', {
        zoningCode: 'RS-2',
        description: 'Single-family with secondary suite',
        maxHeight: 10.7,
        maxFAR: 0.75,
        maxDensity: 2,
        permittedUses: ['Single-family dwelling', 'Secondary suite', 'Laneway house'],
        setbacks: { front: 6, rear: 6, side: 1.2 },
        parkingRequirements: '1.5 spaces per unit'
      }],
      ['RT-1', {
        zoningCode: 'RT-1',
        description: 'Townhouse residential',
        maxHeight: 10.7,
        maxFAR: 1.2,
        maxDensity: 4,
        permittedUses: ['Townhouses', 'Row houses'],
        setbacks: { front: 4.5, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit'
      }],
      ['RM-1', {
        zoningCode: 'RM-1',
        description: 'Multiple residential',
        maxHeight: 15.2,
        maxFAR: 1.45,
        maxDensity: 8,
        permittedUses: ['Apartment buildings', 'Townhouses'],
        setbacks: { front: 6, rear: 10.5, side: 2.4 },
        parkingRequirements: '1 space per unit'
      }]
    ];

    zoningRules.forEach(([code, data]) => {
      this.zoningRules.set(code, data);
    });
  }

  private generateUnitMix(maxUnits: number): { bedrooms: number; count: number }[] {
    if (maxUnits <= 2) {
      return [{ bedrooms: 3, count: maxUnits }];
    }
    
    const mix = [];
    let remaining = maxUnits;
    
    // 40% 2-bedroom, 40% 3-bedroom, 20% 4-bedroom
    const twoBed = Math.floor(maxUnits * 0.4);
    const threeBed = Math.floor(maxUnits * 0.4);
    const fourBed = remaining - twoBed - threeBed;
    
    if (twoBed > 0) mix.push({ bedrooms: 2, count: twoBed });
    if (threeBed > 0) mix.push({ bedrooms: 3, count: threeBed });
    if (fourBed > 0) mix.push({ bedrooms: 4, count: fourBed });
    
    return mix;
  }

  private determineBuildingType(maxUnits: number, zoningCode: string): string {
    if (maxUnits === 1) return 'Single-family house';
    if (maxUnits === 2) return 'Duplex';
    if (maxUnits <= 4) return 'Townhouse/Row house';
    if (maxUnits <= 8) return 'Low-rise apartment';
    return 'Mid-rise apartment';
  }

  private calculateFeasibilityScore(zoning: ZoningData, lotSize: number, maxUnits: number, city: string): number {
    let score = 60; // Base score

    // Lot size factors
    if (lotSize > 8000) score += 15;
    else if (lotSize > 6000) score += 10;
    else if (lotSize < 4000) score -= 10;

    // Density factors
    if (maxUnits > 4) score += 10;
    if (zoning.maxFAR > 1.0) score += 10;

    // City factors
    const cityBonus: Record<string, number> = {
      'vancouver': 15,
      'burnaby': 10,
      'richmond': 12,
      'surrey': 5,
      'coquitlam': 8
    };
    score += cityBonus[city.toLowerCase()] || 0;

    return Math.min(Math.max(score, 20), 95);
  }

  private identifyConstraints(zoning: ZoningData, lotSize: number): string[] {
    const constraints = [];

    if (zoning.maxHeight < 12) constraints.push('Height restrictions limit development');
    if (zoning.maxFAR < 1.0) constraints.push('Low FAR limits building size');
    if (lotSize < 5000) constraints.push('Small lot size limits options');
    if (zoning.setbacks.front > 6) constraints.push('Large setbacks reduce buildable area');

    return constraints;
  }

  private identifyOpportunities(zoning: ZoningData, maxUnits: number, city: string): string[] {
    const opportunities = [];

    if (maxUnits > 2) opportunities.push('Multi-unit development potential');
    if (zoning.maxFAR > 1.2) opportunities.push('High-density development allowed');
    if (['vancouver', 'burnaby'].includes(city.toLowerCase())) {
      opportunities.push('High-demand market location');
    }
    if (zoning.permittedUses.includes('Secondary suite')) {
      opportunities.push('Additional rental income potential');
    }

    return opportunities;
  }
}

export const zoningIntelligenceService = new ZoningIntelligenceService();