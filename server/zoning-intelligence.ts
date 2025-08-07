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
  bill44Eligible: boolean;
  bill44MaxUnits: number;
  transitOriented: boolean;
  multiplexEligible: boolean;
}

export interface DevelopmentPotential {
  maxUnits: number;
  bill44MaxUnits: number;
  recommendedUnits: number;
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
  bill44Compliance: {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  };
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
   * Get comprehensive zoning and development analysis (BC-focused with Bill 44 compliance)
   */
  async getZoningAnalysisWithBill44(address: string, city: string, lotSize: number, frontage: number): Promise<CityDataResult> {
    try {
      // Ensure BC location
      if (!this.isBCLocation(city)) {
        throw new Error("BuildwiseAI currently focuses on BC municipalities. Please enter a BC city.");
      }

      // Get coordinates (simulated for now - would integrate with geocoding API)
      const coordinates = await this.geocodeAddress(address, city);
      
      // Get zoning data with Bill 44 analysis
      const zoning = await this.getZoningDataWithBill44(coordinates, city);
      
      // Calculate development potential including Bill 44 benefits
      const developmentPotential = await this.calculateDevelopmentPotentialWithBill44(zoning, lotSize, frontage, city);
      
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
      throw new Error(error instanceof Error ? error.message : "Failed to analyze zoning and development potential");
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

  private async getZoningDataWithBill44(coordinates: { lat: number; lng: number }, city: string): Promise<ZoningData> {
    // Simulate zoning lookup with Bill 44 analysis
    const zoningCodes = ['RS-1', 'RS-2', 'RS-3', 'RS-5', 'RS-7', 'RT-1', 'RT-2', 'RM-1', 'RM-2'];
    const randomZoning = zoningCodes[Math.floor(Math.random() * zoningCodes.length)];
    
    return this.zoningRules.get(randomZoning) || this.zoningRules.get('RS-1')!;
  }

  private async calculateDevelopmentPotentialWithBill44(
    zoning: ZoningData,
    lotSize: number,
    frontage: number,
    city: string
  ): Promise<DevelopmentPotential> {
    // Calculate maximum units based on traditional zoning
    const traditionalMaxUnits = Math.min(
      Math.floor(lotSize * zoning.maxFAR / 800), // Assume 800 sq ft average unit
      zoning.maxDensity
    );

    // Bill 44 analysis - enhanced density potential
    const bill44MaxUnits = this.calculateBill44MaxUnits(zoning, lotSize, frontage, city);
    
    // Recommended units (higher of traditional or Bill 44)
    const recommendedUnits = Math.max(traditionalMaxUnits, bill44MaxUnits);

    // Estimate gross floor area
    const estimatedGFA = Math.min(lotSize * zoning.maxFAR, recommendedUnits * 900);

    // Suggest unit mix optimized for Bill 44
    const suggestedUnitMix = this.generateUnitMixForBill44(recommendedUnits, zoning.bill44Eligible);

    // Calculate estimated value with Bill 44 market premium
    const cityMultipliers: Record<string, number> = {
      'vancouver': 1800,
      'burnaby': 1300,
      'richmond': 1400,
      'surrey': 1000,
      'coquitlam': 1200,
      'maple ridge': 950,
      'mission': 850,
      'langley': 1050
    };

    const pricePerSqFt = cityMultipliers[city.toLowerCase()] || 1200;
    const bill44Premium = zoning.bill44Eligible ? 1.15 : 1.0; // 15% premium for Bill 44 eligible
    const estimatedValue = estimatedGFA * pricePerSqFt * bill44Premium;

    // Calculate feasibility score with Bill 44 benefits
    const feasibilityScore = this.calculateFeasibilityScoreWithBill44(zoning, lotSize, recommendedUnits, city);

    // Identify constraints and opportunities including Bill 44
    const constraints = this.identifyConstraintsWithBill44(zoning, lotSize);
    const opportunities = this.identifyOpportunitiesWithBill44(zoning, recommendedUnits, city);

    // Bill 44 compliance analysis
    const bill44Compliance = this.analyzeBill44Compliance(zoning, lotSize, frontage, city);

    return {
      maxUnits: traditionalMaxUnits,
      bill44MaxUnits: bill44MaxUnits,
      recommendedUnits: recommendedUnits,
      suggestedUnitMix,
      buildingType: this.determineBuildingType(recommendedUnits, zoning.zoningCode),
      estimatedGFA,
      estimatedValue,
      feasibilityScore,
      constraints,
      opportunities,
      bill44Compliance
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
    // Initialize BC zoning rules with Bill 44 compliance
    const zoningRules: [string, ZoningData][] = [
      ['RS-1', {
        zoningCode: 'RS-1',
        description: 'Single-family residential',
        maxHeight: 10.7,
        maxFAR: 0.70,
        maxDensity: 1,
        permittedUses: ['Single-family dwelling', 'Home occupation'],
        setbacks: { front: 6, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit',
        bill44Eligible: true,
        bill44MaxUnits: 4,
        transitOriented: false,
        multiplexEligible: true
      }],
      ['RS-2', {
        zoningCode: 'RS-2',
        description: 'Single-family with secondary suite',
        maxHeight: 10.7,
        maxFAR: 0.75,
        maxDensity: 2,
        permittedUses: ['Single-family dwelling', 'Secondary suite', 'Laneway house'],
        setbacks: { front: 6, rear: 6, side: 1.2 },
        parkingRequirements: '1.5 spaces per unit',
        bill44Eligible: true,
        bill44MaxUnits: 4,
        transitOriented: false,
        multiplexEligible: true
      }],
      ['RS-3', {
        zoningCode: 'RS-3',
        description: 'Duplex residential',
        maxHeight: 10.7,
        maxFAR: 0.80,
        maxDensity: 2,
        permittedUses: ['Duplex', 'Single-family dwelling'],
        setbacks: { front: 6, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit',
        bill44Eligible: true,
        bill44MaxUnits: 4,
        transitOriented: false,
        multiplexEligible: true
      }],
      ['RS-5', {
        zoningCode: 'RS-5',
        description: 'Compact residential',
        maxHeight: 10.7,
        maxFAR: 0.85,
        maxDensity: 3,
        permittedUses: ['Single-family dwelling', 'Duplex', 'Triplex'],
        setbacks: { front: 4.5, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit',
        bill44Eligible: true,
        bill44MaxUnits: 6,
        transitOriented: false,
        multiplexEligible: true
      }],
      ['RT-1', {
        zoningCode: 'RT-1',
        description: 'Townhouse residential',
        maxHeight: 10.7,
        maxFAR: 1.2,
        maxDensity: 4,
        permittedUses: ['Townhouses', 'Row houses'],
        setbacks: { front: 4.5, rear: 6, side: 1.2 },
        parkingRequirements: '1 space per unit',
        bill44Eligible: true,
        bill44MaxUnits: 6,
        transitOriented: true,
        multiplexEligible: true
      }],
      ['RM-1', {
        zoningCode: 'RM-1',
        description: 'Multiple residential',
        maxHeight: 15.2,
        maxFAR: 1.45,
        maxDensity: 8,
        permittedUses: ['Apartment buildings', 'Townhouses'],
        setbacks: { front: 6, rear: 10.5, side: 2.4 },
        parkingRequirements: '1 space per unit',
        bill44Eligible: true,
        bill44MaxUnits: 8,
        transitOriented: true,
        multiplexEligible: true
      }]
    ];

    zoningRules.forEach(([code, data]) => {
      this.zoningRules.set(code, data);
    });
  }

  /**
   * Check if location is in BC
   */
  private isBCLocation(city: string): boolean {
    const bcCities = [
      'vancouver', 'burnaby', 'richmond', 'surrey', 'coquitlam', 'port coquitlam', 
      'port moody', 'langley', 'maple ridge', 'mission', 'north vancouver', 
      'west vancouver', 'delta', 'white rock', 'pitt meadows', 'new westminster',
      'victoria', 'kelowna', 'kamloops', 'prince george', 'chilliwack', 'nanaimo'
    ];
    
    return bcCities.some(bcCity => city.toLowerCase().includes(bcCity));
  }

  /**
   * Calculate maximum units under Bill 44 with frontage validation
   */
  private calculateBill44MaxUnits(zoning: ZoningData, lotSize: number, frontage: number, city: string): number {
    // Core Bill 44 eligibility check (lot size and frontage requirements)
    const meetsMinimumSize = lotSize >= 3000 && frontage >= 33;
    
    if (!zoning.bill44Eligible || !meetsMinimumSize) {
      return zoning.maxDensity;
    }
    
    // Base Bill 44 allowance (4-plex eligible)
    let bill44Units = 4;
    
    // Enhanced eligibility for larger lots
    if (lotSize >= 4000 && frontage >= 40) {
      bill44Units = 6; // 6-plex eligible
    }
    
    // Additional bonuses
    if (lotSize > 6000) bill44Units += 1;
    if (lotSize > 8000) bill44Units += 1;
    
    // Transit-oriented zones get significant bonus
    if (zoning.transitOriented) bill44Units += 2;
    
    // High-demand cities get enhanced allowance
    const highDemandCities = ['vancouver', 'burnaby', 'richmond', 'surrey'];
    if (highDemandCities.includes(city.toLowerCase())) {
      bill44Units += 1;
    }
    
    return Math.min(bill44Units, 8); // Cap at 8 units for practical purposes
  }

  /**
   * Generate unit mix optimized for Bill 44
   */
  private generateUnitMixForBill44(maxUnits: number, bill44Eligible: boolean): { bedrooms: number; count: number }[] {
    if (maxUnits <= 2) {
      return [{ bedrooms: 3, count: maxUnits }];
    }
    
    if (bill44Eligible) {
      // Bill 44 encourages smaller, more affordable units
      const mix = [];
      let remaining = maxUnits;
      
      // 30% 1-bedroom, 50% 2-bedroom, 20% 3-bedroom for Bill 44
      const oneBed = Math.floor(maxUnits * 0.3);
      const twoBed = Math.floor(maxUnits * 0.5);
      const threeBed = remaining - oneBed - twoBed;
      
      if (oneBed > 0) mix.push({ bedrooms: 1, count: oneBed });
      if (twoBed > 0) mix.push({ bedrooms: 2, count: twoBed });
      if (threeBed > 0) mix.push({ bedrooms: 3, count: threeBed });
      
      return mix;
    }
    
    return this.generateUnitMix(maxUnits);
  }

  /**
   * Analyze Bill 44 compliance and benefits with frontage validation
   */
  private analyzeBill44Compliance(zoning: ZoningData, lotSize: number, frontage: number, city: string): {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  } {
    const meetsMinimumSize = lotSize >= 3000 && frontage >= 33;
    const meetsEnhancedSize = lotSize >= 4000 && frontage >= 40;
    
    if (!zoning.bill44Eligible || !meetsMinimumSize) {
      return {
        eligible: false,
        benefits: [
          ...(lotSize < 3000 ? ['❌ Lot size below 3,000 sq ft minimum'] : []),
          ...(frontage < 33 ? ['❌ Frontage below 33 ft minimum'] : []),
          ...(lotSize >= 3000 && frontage >= 33 ? ['✅ Property meets Bill 44 basic requirements'] : [])
        ],
        requirements: [
          'Minimum 3,000 sq ft lot size for 4-plex eligibility',
          'Minimum 33 ft frontage for multiplex development',
          'Zoning must permit residential use'
        ],
        incentives: []
      };
    }

    const benefits = [
      '✅ Property qualifies for Bill 44 multiplex development',
      `✅ Up to ${meetsEnhancedSize ? '6' : '4'} units permitted`,
      '✅ Streamlined approval process under Bill 44',
      '✅ Reduced parking requirements (0.5-1 space per unit)',
      '✅ Significant density increase over traditional zoning'
    ];

    if (meetsEnhancedSize) {
      benefits.push('✅ Enhanced eligibility for 6-plex development');
      benefits.push('✅ Potential for rental tenure or transit bonuses');
    }

    if (zoning.transitOriented) {
      benefits.push('✅ Transit-oriented development bonus units available');
      benefits.push('✅ Additional density increases near transit');
    }

    const requirements = [
      'Compliance with BC Building Code',
      'Minimum unit size requirements',
      'Accessible design standards',
      'Fire safety and emergency access'
    ];

    if (lotSize < 5000) {
      requirements.push('Compact design requirements for smaller lots');
    }

    const incentives = [
      'Development cost charge reductions',
      'Expedited permitting',
      'Property tax incentives for rental units',
      'Provincial housing funding eligibility'
    ];

    if (['vancouver', 'burnaby', 'richmond'].includes(city.toLowerCase())) {
      incentives.push('Municipal density bonus programs');
      incentives.push('Affordable housing contribution alternatives');
    }

    return {
      eligible: true,
      benefits,
      requirements,
      incentives
    };
  }

  /**
   * Calculate feasibility score with Bill 44 benefits
   */
  private calculateFeasibilityScoreWithBill44(zoning: ZoningData, lotSize: number, maxUnits: number, city: string): number {
    let score = this.calculateFeasibilityScore(zoning, lotSize, maxUnits, city);
    
    // Bill 44 bonus points
    if (zoning.bill44Eligible) {
      score += 15; // Significant bonus for Bill 44 eligibility
      
      if (zoning.transitOriented) score += 10;
      if (zoning.multiplexEligible) score += 8;
      if (maxUnits >= 4) score += 5; // Density achievement bonus
    }
    
    return Math.min(Math.max(score, 20), 98);
  }

  /**
   * Identify constraints with Bill 44 considerations
   */
  private identifyConstraintsWithBill44(zoning: ZoningData, lotSize: number): string[] {
    const constraints = this.identifyConstraints(zoning, lotSize);
    
    if (zoning.bill44Eligible) {
      if (lotSize < 4000) {
        constraints.push('Small lot size may limit Bill 44 unit count');
      }
      constraints.push('Bill 44 design standards must be met');
      constraints.push('Minimum unit size requirements under Bill 44');
    } else {
      constraints.push('Not eligible for Bill 44 density bonuses');
    }
    
    return constraints;
  }

  /**
   * Identify opportunities with Bill 44 benefits
   */
  private identifyOpportunitiesWithBill44(zoning: ZoningData, maxUnits: number, city: string): string[] {
    const opportunities = this.identifyOpportunities(zoning, maxUnits, city);
    
    if (zoning.bill44Eligible) {
      opportunities.push('Bill 44 enables up to 4-6 units on single-family lots');
      opportunities.push('Streamlined approval process under Bill 44');
      opportunities.push('Access to provincial housing incentives');
      
      if (zoning.transitOriented) {
        opportunities.push('Transit-oriented development bonuses available');
      }
      
      if (maxUnits >= 4) {
        opportunities.push('Strong rental income potential with multiple units');
      }
      
      opportunities.push('Market premium for Bill 44-compliant developments');
    }
    
    return opportunities;
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