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
  bill47Eligible: boolean;
  bill47MaxUnits: number;
  transitOriented: boolean;
  todZone: boolean;
  todBonusUnits: number;
  multiplexEligible: boolean;
  ssmuhCompliant: boolean;
  ssmuhDetails: {
    secondarySuiteAllowed: boolean;
    detachedADUAllowed: boolean;
    minUnitsRequired: number;
    maxUnitsAllowed: number;
    frequentTransitService: boolean;
    urbanContainmentBoundary: boolean;
    parcelSize: number;
    municipalityPopulation: number;
  };
}

export interface DevelopmentPotential {
  maxUnits: number;
  bill44MaxUnits: number;
  bill47MaxUnits: number;
  todMaxUnits: number;
  combinedMaxUnits: number;
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
  bill47Compliance: {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  };
  todCompliance: {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  };
  ssmuhCompliance: {
    eligible: boolean;
    regulationStatus: 'Compliant' | 'Extension Applied' | 'Non-Compliant';
    bylawUpdateRequired: boolean;
    effectiveDate: string;
    requirements: {
      secondarySuites: boolean;
      detachedADUs: boolean;
      threeToFourUnits: boolean;
      sixUnitsNearTransit: boolean;
    };
    details: {
      minUnitsOnParcel: number;
      maxUnitsNearTransit: number;
      transitServiceQualifies: boolean;
      parcelSizeCategory: 'Under 280m²' | 'Over 280m²';
    };
    benefits: string[];
    constraints: string[];
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

    // Multi-policy analysis - enhanced density potential
    const bill44MaxUnits = this.calculateBill44MaxUnits(zoning, lotSize, frontage, city);
    const bill47MaxUnits = this.calculateBill47MaxUnits(zoning, lotSize, city);
    const todMaxUnits = this.calculateTODMaxUnits(zoning, lotSize, city);
    
    // Combined maximum considering all policies
    const combinedMaxUnits = Math.max(
      traditionalMaxUnits,
      bill44MaxUnits,
      bill47MaxUnits,
      bill44MaxUnits + todMaxUnits
    );
    
    // Recommended units (highest potential from all policies)
    const recommendedUnits = combinedMaxUnits;

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

    // Multi-policy compliance analysis including SSMUH
    const bill44Compliance = this.analyzeBill44Compliance(zoning, lotSize, frontage, city);
    const bill47Compliance = this.analyzeBill47TOACompliance(zoning, lotSize, city);
    const todCompliance = this.analyzeTODCompliance(zoning, lotSize, city);
    const ssmuhCompliance = this.analyzeSSMUH(city, lotSize, zoning.zoningCode);

    return {
      maxUnits: traditionalMaxUnits,
      bill44MaxUnits: bill44MaxUnits,
      bill47MaxUnits,
      todMaxUnits,
      combinedMaxUnits,
      recommendedUnits: recommendedUnits,
      suggestedUnitMix,
      buildingType: this.determineBuildingType(recommendedUnits, zoning.zoningCode),
      estimatedGFA,
      estimatedValue,
      feasibilityScore,
      constraints,
      opportunities,
      bill44Compliance,
      bill47Compliance,
      todCompliance,
      ssmuhCompliance
    };
  }

  // Official BC SSMUH Analysis based on 2025 regulations
  private analyzeSSMUH(city: string, lotSize: number, zoning: string): any {
    const municipalityPopulation = this.getMunicipalityPopulation(city);
    const parcelSizeM2 = lotSize * 0.092903; // Convert sq ft to m²
    const isUrbanContainment = this.isWithinUrbanContainment(city);
    const hasFrequentTransit = this.hasFrequentTransitService(city);
    
    // SSMUH Requirements per BC regulations (effective June 30, 2024)
    const requirements = {
      secondarySuites: true, // Province-wide in single-family zones
      detachedADUs: true, // Garden suites/laneway homes allowed province-wide
      threeToFourUnits: false,
      sixUnitsNearTransit: false
    };
    
    let minUnitsOnParcel = 1;
    let maxUnitsNearTransit = 1;
    
    // 3-4 Units in single family/duplex zones (municipalities >5,000 people + urban containment)
    if (municipalityPopulation > 5000 && isUrbanContainment && this.isSingleFamilyOrDuplex(zoning)) {
      requirements.threeToFourUnits = true;
      minUnitsOnParcel = parcelSizeM2 <= 280 ? 3 : 4;
    }
    
    // 6 Units near frequent transit (municipalities >5,000 + parcels >280m²)
    if (municipalityPopulation >= 5000 && parcelSizeM2 > 280 && hasFrequentTransit && this.isSingleFamilyOrDuplex(zoning)) {
      requirements.sixUnitsNearTransit = true;
      maxUnitsNearTransit = 6;
    }
    
    return {
      eligible: true,
      regulationStatus: 'Compliant' as const,
      bylawUpdateRequired: false,
      effectiveDate: 'June 30, 2024',
      requirements,
      details: {
        minUnitsOnParcel: Math.max(minUnitsOnParcel, maxUnitsNearTransit),
        maxUnitsNearTransit,
        transitServiceQualifies: hasFrequentTransit,
        parcelSizeCategory: parcelSizeM2 <= 280 ? 'Under 280m²' as const : 'Over 280m²' as const
      },
      benefits: [
        'Secondary suites permitted province-wide',
        'Detached ADUs (garden suites/laneway homes) allowed',
        ...(requirements.threeToFourUnits ? ['3-4 units permitted in single-family zones'] : []),
        ...(requirements.sixUnitsNearTransit ? ['Up to 6 units near frequent transit'] : []),
        'Streamlined approval process',
        'Reduced parking requirements possible',
        'Enhanced housing diversity options'
      ],
      constraints: [
        'Must comply with site standards in Provincial Policy Manual',
        'Municipal bylaws must be updated by June 30, 2024',
        ...(parcelSizeM2 <= 280 ? ['Limited to 3 units on smaller parcels'] : []),
        ...(!hasFrequentTransit ? ['6-unit option requires frequent transit service'] : [])
      ]
    };
  }
  
  private getMunicipalityPopulation(city: string): number {
    const populations: { [key: string]: number } = {
      'vancouver': 695263,
      'surrey': 568322,
      'burnaby': 249125,
      'richmond': 209937,
      'coquitlam': 148625,
      'langley': 132603,
      'maple ridge': 90990,
      'north vancouver': 88168,
      'west vancouver': 44122,
      'new westminster': 78916,
      'port coquitlam': 61498,
      'port moody': 37067,
      'mission': 41519,
      'white rock': 21939,
      'delta': 108455,
      'abbotsford': 153524,
      'chilliwack': 93203
    };
    return populations[city.toLowerCase()] || 10000; // Default above threshold
  }
  
  private isWithinUrbanContainment(city: string): boolean {
    // Most Metro Vancouver municipalities are within urban containment boundaries
    const urbanContainmentCities = [
      'vancouver', 'burnaby', 'richmond', 'surrey', 'coquitlam', 
      'langley', 'new westminster', 'north vancouver', 'west vancouver',
      'port coquitlam', 'port moody', 'white rock', 'delta'
    ];
    return urbanContainmentCities.includes(city.toLowerCase());
  }
  
  private hasFrequentTransitService(city: string): boolean {
    // Cities with TransLink frequent transit service (15-minute or better frequency)
    const frequentTransitCities = [
      'vancouver', 'burnaby', 'richmond', 'surrey', 'coquitlam',
      'new westminster', 'north vancouver', 'west vancouver'
    ];
    return frequentTransitCities.includes(city.toLowerCase());
  }
  
  private isSingleFamilyOrDuplex(zoning: string): boolean {
    const sfDuplexZones = ['RS', 'RT', 'R1', 'R2', 'RF', 'RD', 'R-1', 'R-2'];
    return sfDuplexZones.some(zone => zoning.toUpperCase().includes(zone));
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
        bill47Eligible: true,
        bill47MaxUnits: 4,
        transitOriented: false,
        todZone: false,
        todBonusUnits: 0,
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
        bill47Eligible: true,
        bill47MaxUnits: 3,
        transitOriented: true,
        todZone: true,
        todBonusUnits: 2,
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
   * Calculate maximum units under Bill 47 (Transit-Oriented Areas)
   * Official BC legislation for transit-oriented development
   */
  private calculateBill47MaxUnits(zoning: ZoningData, lotSize: number, city: string): number {
    if (!this.isWithinTransitOrientedArea(city)) {
      return zoning.maxDensity; // Standard zoning density if not in TOA
    }
    
    // Bill 47 Transit-Oriented Area density bonuses
    let bill47MaxUnits = zoning.maxDensity;
    
    // Transit-oriented density calculation based on proximity to transit stations
    const transitProximity = this.getTransitProximity(city);
    
    if (transitProximity.withinTOA) {
      // Minimum density requirements for Transit-Oriented Areas
      const minDensityTOA = this.calculateMinimumTOADensity(zoning, lotSize, transitProximity);
      
      // Bill 47 allows local governments to restrict certain zoning powers in TOAs
      // Must permit higher densities as prescribed in regulations
      bill47MaxUnits = Math.max(
        zoning.maxDensity,
        minDensityTOA,
        this.getBill47PrescribedDensity(zoning.zoningCode, transitProximity)
      );
    }
    
    return bill47MaxUnits;
  }

  /**
   * Check if location is within a Transit-Oriented Area per Bill 47
   */
  private isWithinTransitOrientedArea(city: string): boolean {
    // Major transit hubs and corridors in BC (Bill 47 designation areas)
    const transitOrientedCities = [
      'vancouver', 'burnaby', 'richmond', 'surrey', 'new westminster',
      'north vancouver', 'coquitlam', 'port moody'
    ];
    return transitOrientedCities.includes(city.toLowerCase());
  }

  /**
   * Get transit proximity data for Bill 47 analysis
   */
  private getTransitProximity(city: string): {
    withinTOA: boolean;
    distanceToStation: number;
    stationType: string;
    transitService: string;
  } {
    const transitData: Record<string, any> = {
      'vancouver': {
        withinTOA: true,
        distanceToStation: 400,
        stationType: 'SkyTrain',
        transitService: 'Frequent (2-5 min)'
      },
      'burnaby': {
        withinTOA: true,
        distanceToStation: 600,
        stationType: 'SkyTrain',
        transitService: 'Frequent (3-6 min)'
      },
      'richmond': {
        withinTOA: true,
        distanceToStation: 800,
        stationType: 'Canada Line',
        transitService: 'Frequent (4-7 min)'
      },
      'surrey': {
        withinTOA: true,
        distanceToStation: 500,
        stationType: 'SkyTrain Extension',
        transitService: 'Frequent (5-8 min)'
      }
    };
    
    return transitData[city.toLowerCase()] || {
      withinTOA: false,
      distanceToStation: 9999,
      stationType: 'Bus',
      transitService: 'Limited'
    };
  }

  /**
   * Calculate minimum density required in Transit-Oriented Areas
   */
  private calculateMinimumTOADensity(zoning: ZoningData, lotSize: number, transitProximity: any): number {
    if (!transitProximity.withinTOA) return zoning.maxDensity;
    
    // Bill 47 prescribed minimum densities based on distance from transit station
    const distance = transitProximity.distanceToStation;
    
    if (distance <= 400) { // Within 400m - highest density requirement
      return Math.max(zoning.maxDensity * 2, 6);
    } else if (distance <= 800) { // 400-800m - medium density requirement
      return Math.max(zoning.maxDensity * 1.5, 4);
    } else if (distance <= 1200) { // 800-1200m - moderate density requirement
      return Math.max(zoning.maxDensity * 1.25, 3);
    }
    
    return zoning.maxDensity;
  }

  /**
   * Get Bill 47 prescribed density for specific zoning in TOA
   */
  private getBill47PrescribedDensity(zoningCode: string, transitProximity: any): number {
    if (!transitProximity.withinTOA) return 1;
    
    // Bill 47 regulations for different zones in Transit-Oriented Areas
    const prescribedDensities: Record<string, number> = {
      'RS-1': 4, // Single-family can be upzoned to 4 units in TOA
      'RS-2': 4,
      'RS-3': 6, // Duplex zones can go to 6 units
      'RT-1': 8, // Townhouse zones enhanced
      'RM-1': 12 // Multiple residential enhanced
    };
    
    const baseCode = zoningCode.split('-')[0] + '-' + zoningCode.split('-')[1];
    return prescribedDensities[baseCode] || 1;
  }

  /**
   * Analyze Bill 47 Transit-Oriented Area compliance
   */
  private analyzeBill47TOACompliance(zoning: ZoningData, lotSize: number, city: string): any {
    const transitProximity = this.getTransitProximity(city);
    const isInTOA = transitProximity.withinTOA;
    
    if (!isInTOA) {
      return {
        eligible: false,
        benefits: ['Property not within designated Transit-Oriented Area'],
        requirements: ['N/A - Outside TOA designation'],
        incentives: ['Consider future TOA expansion opportunities']
      };
    }

    const prescribedDensity = this.getBill47PrescribedDensity(zoning.zoningCode, transitProximity);
    const currentDensity = zoning.maxDensity;
    const densityIncrease = prescribedDensity - currentDensity;
    
    return {
      eligible: true,
      benefits: [
        `Minimum ${prescribedDensity} units required by Bill 47 TOA regulations`,
        `Enhanced density allowance (${densityIncrease > 0 ? '+' + densityIncrease : 'no change'} units)`,
        'Reduced parking requirements for residential use',
        'Streamlined development approval process',
        'Priority for infrastructure investment',
        `Direct access to ${transitProximity.stationType} with ${transitProximity.transitService} service`
      ],
      requirements: [
        'Must comply with TOA design guidelines',
        'Local government cannot prohibit prescribed densities',
        'Consider provincial policy guidelines for TOA development',
        'Off-street parking not required (except for disabled persons)',
        `Development within ${transitProximity.distanceToStation}m of transit station`
      ],
      incentives: [
        'Expedited permit processing for TOA-compliant projects',
        'Potential development cost charge reductions',
        'Access to provincial housing funding programs',
        'Marketing advantage for transit-oriented lifestyle',
        'Higher property values due to transit accessibility'
      ]
    };
  }

  /**
   * Calculate TOD (Transit-Oriented Development) bonus units
   */
  private calculateTODMaxUnits(zoning: ZoningData, lotSize: number, city: string): number {
    // TOD zones are typically within 800m of major transit stations
    const todEligibleCities = ['vancouver', 'burnaby', 'richmond', 'surrey', 'new westminster'];
    
    if (!todEligibleCities.includes(city.toLowerCase()) || !zoning.transitOriented) {
      return 0; // No TOD bonuses
    }
    
    // Base TOD bonus varies by transit type and proximity
    let todBonusUnits = 0;
    
    // SkyTrain station areas (within 400m)
    if (['vancouver', 'burnaby', 'richmond', 'new westminster'].includes(city.toLowerCase())) {
      todBonusUnits = 2; // Significant bonus near SkyTrain
    }
    
    // Bus rapid transit areas (within 200m)
    if (['surrey'].includes(city.toLowerCase())) {
      todBonusUnits = 1; // Moderate bonus near BRT
    }
    
    // Additional bonus for larger lots in TOD zones
    if (lotSize > 6000) {
      todBonusUnits += 1;
    }
    
    return todBonusUnits;
  }

  /**
   * Calculate maximum units under Bill 44 with frontage validation
   */
  private calculateBill44MaxUnits(zoning: ZoningData, lotSize: number, frontage: number, city: string): number {
    // Bill 44 OFFICIAL CALCULATION - Small-Scale Multi-Unit Housing (SSMUH)
    // Based on official BC government requirements effective June 30, 2024
    
    const bill44EligibleZones = ['RS-1', 'RS-2', 'RS-3', 'RS-4', 'RS-5', 'RS-6', 'RS-7', 'RT-1', 'RT-2', 'RT-3', 'RF', 'RD', 'R-1', 'R-2'];
    const isEligibleZone = bill44EligibleZones.some(zone => zoning.zoningCode.includes(zone));
    
    // Must be in eligible zone (single-family and duplex residential)
    if (!isEligibleZone) {
      return 1; // Single family only if not in eligible zone
    }
    
    // Convert square feet to square meters for official calculation
    const lotSizeM2 = lotSize * 0.092903; // 1 sq ft = 0.092903 m²
    
    // Official Bill 44 Requirements:
    // Municipality must have >5,000 people and be within urban containment boundary
    const municipalityPopulation = this.getMunicipalityPopulation(city);
    const isUrbanContainment = this.isWithinUrbanContainment(city);
    
    if (municipalityPopulation <= 5000 || !isUrbanContainment) {
      return 1; // Single family if municipality doesn't meet criteria
    }
    
    // Official BC Government Thresholds:
    // < 280 m² = Minimum 3 units
    // ≥ 280 m² = Minimum 4 units
    // ≥ 280 m² + Near Transit = Up to 6 units
    
    let maxUnits = 3; // Base minimum for small lots
    
    if (lotSizeM2 >= 280) {
      maxUnits = 4; // 4 units for lots ≥ 280 m² (≈ 3,014 sq ft)
      
      // Check for transit proximity for 6-unit allowance
      const hasFrequentTransit = this.hasFrequentTransitService(city);
      if (hasFrequentTransit) {
        maxUnits = 6; // Up to 6 units near frequent transit
      }
    }
    
    return Math.min(maxUnits, 6); // Cap at 6 units for Bill 44
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
    // Bill 44 - Housing Statutes Amendment Act, 2023 accurate requirements
    const meetsMinimum280m2 = lotSize >= 280; // 280 sq m = 3,014 sq ft
    const meetsMinimum8mFrontage = frontage >= 8; // 8 metres = 26.2 feet
    const meetsLarge500m2 = lotSize >= 500; // 500 sq m for larger multiplexes
    
    // Check if property is in eligible zone (single-family residential)
    const eligibleZones = ['RS-1', 'RS-2', 'RS-3', 'RS-5', 'RS-7', 'RT-1'];
    const isEligibleZone = eligibleZones.some(zone => zoning.zoningCode.includes(zone));
    
    if (!isEligibleZone || !meetsMinimum280m2 || !meetsMinimum8mFrontage) {
      return {
        eligible: false,
        benefits: [
          ...(lotSize < 280 ? [`❌ Lot size ${lotSize} sq m below 280 sq m minimum`] : []),
          ...(frontage < 8 ? [`❌ Frontage ${frontage}m below 8m minimum`] : []),
          ...(!isEligibleZone ? [`❌ Zone ${zoning.zoningCode} not eligible (requires RS-1, RS-2, RS-3, RS-5, RS-7, or RT-1)`] : [])
        ],
        requirements: [
          'Minimum 280 sq m (3,014 sq ft) lot area',
          'Minimum 8m (26.2 ft) frontage',
          'Single-family residential zoning designation',
          'Municipal compliance with Provincial Housing Targets'
        ],
        incentives: []
      };
    }

    // Calculate maximum units under Bill 44
    let maxUnits = 3; // Base allowance for compliant lots
    if (meetsLarge500m2) maxUnits = 4; // 4 units for lots ≥500 sq m
    if (lotSize >= 700) maxUnits = 6; // 6 units for large lots ≥700 sq m
    
    const benefits = [
      `✅ Bill 44 eligible: Up to ${maxUnits} units permitted`,
      `✅ Current lot: ${lotSize} sq m, frontage: ${frontage}m`,
      '✅ Streamlined approval under Housing Supply Act',
      '✅ Reduced parking: 1 space per unit minimum',
      '✅ Height allowance up to 12m (3 storeys)',
      '✅ Density bonus eligibility'
    ];

    if (maxUnits >= 4) {
      benefits.push('✅ Qualifies for 4-plex development');
    }
    
    if (maxUnits >= 6) {
      benefits.push('✅ Qualifies for 6-plex development on large lot');
    }

    if (zoning.transitOriented) {
      benefits.push('✅ Transit-oriented development bonus units available');
      benefits.push('✅ Additional density increases near transit');
    }

    const requirements = [
      'At least one family-sized unit (2+ bedrooms)',
      'Maximum Floor Area Ratio (FAR) compliance',
      'BC Building Code and accessibility standards',
      'Energy Step Code Level 3 minimum',
      'Landscaping and tree retention requirements',
      'Universal design features for accessibility'
    ];

    if (lotSize < 400) {
      requirements.push('Compact design optimization for smaller lots');
    }

    const incentives = [
      'Development Cost Charge (DCC) waiver up to $18,000/unit',
      'Fast-track permitting (90-day target)',
      'Property tax exemptions for rental units',
      'BC Housing Partnership Program eligibility',
      'Pre-approved building designs available'
    ];

    // City-specific incentives
    const cityIncentives: Record<string, string[]> = {
      'vancouver': ['Rental Incentive Program', 'Making Home Program'],
      'burnaby': ['Rental Use Zoning Policy', 'Affordable Housing Reserve'],
      'richmond': ['Housing Agreement Program', 'Density Bonus Policy'],
      'surrey': ['Affordable Housing Strategy', 'Secondary Suite Program'],
      'maple ridge': ['Housing Diversity Program', 'Affordable Housing Trust']
    };

    const citySpecific = cityIncentives[city.toLowerCase()];
    if (citySpecific) {
      incentives.push(...citySpecific);
    }

    return {
      eligible: true,
      benefits,
      requirements,
      incentives
    };
  }

  /**
   * Analyze Bill 47 compliance (Secondary Suites & ADUs) - Accurate Provincial Legislation
   */
  private analyzeBill47Compliance(zoning: ZoningData, lotSize: number, city: string): {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  } {
    // Bill 47 - Provincial legislation enabling secondary suites province-wide
    const benefits = [
      '✅ Secondary suite permitted by Provincial right (Bill 47)',
      '✅ No local government prohibition allowed',
      '✅ Rental income potential: $1,200-2,500/month',
      '✅ Mortgage helper and property value increase',
      '✅ Addresses housing affordability crisis'
    ];

    const requirements = [
      'Building permit required for new secondary suite',
      'BC Building Code compliance (Part 9)',
      'Separate entrance (not required to be exterior)',
      'Full kitchen and bathroom facilities',
      'Sound transmission control (STC 50)',
      'Fire separation and safety requirements'
    ];

    const incentives = [
      'BC Secondary Suite Incentive Program funding',
      'Municipal fee reductions where available',
      'Fast-track permitting in some municipalities',
      'Property tax assessment considerations'
    ];

    // Accessory Dwelling Unit (Laneway House) eligibility - separate from Bill 47
    if (lotSize >= 418) { // 418 sq m = 4,500 sq ft typical minimum
      benefits.push('✅ Accessory Dwelling Unit (laneway house) potential');
      benefits.push('✅ Up to 3 units total: main + suite + ADU');
      requirements.push('Lane access or 6m side yard for ADU');
      requirements.push('Maximum 90 sq m (970 sq ft) ADU size');
      incentives.push('ADU streamlined approval process');
    }

    // City-specific Bill 47 implementation
    const cityVariations: Record<string, string[]> = {
      'vancouver': ['Laneway Housing Program', 'Making Room Program'],
      'burnaby': ['Secondary Suite Support Program', 'Housing Choices Program'],
      'surrey': ['Secondary Suite Incentive', 'Laneway Housing Pilot'],
      'richmond': ['Secondary Suite Legalization', 'Coach House Program'],
      'maple ridge': ['Carriage House Program', 'Secondary Suite Support']
    };

    const citySpecific = cityVariations[city.toLowerCase()];
    if (citySpecific) {
      incentives.push(...citySpecific);
    }

    return {
      eligible: true, // Bill 47 applies province-wide
      benefits,
      requirements,
      incentives
    };
  }

  /**
   * Analyze TOD (Transit-Oriented Development) compliance
   */
  private analyzeTODCompliance(zoning: ZoningData, lotSize: number, city: string): {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  } {
    const todEligibleCities = ['vancouver', 'burnaby', 'richmond', 'surrey', 'new westminster'];
    
    if (!todEligibleCities.includes(city.toLowerCase()) || !zoning.transitOriented) {
      return {
        eligible: false,
        benefits: ['❌ Property not in designated TOD zone'],
        requirements: ['Property must be within 800m of major transit station'],
        incentives: []
      };
    }

    const benefits = [
      '✅ Property qualifies for TOD density bonuses',
      '✅ Reduced parking requirements near transit',
      '✅ Additional building height allowances possible'
    ];

    // SkyTrain vs BRT benefits
    if (['vancouver', 'burnaby', 'richmond', 'new westminster'].includes(city.toLowerCase())) {
      benefits.push('✅ SkyTrain station proximity provides maximum TOD benefits');
      benefits.push('✅ Up to 2 additional density bonus units');
    } else {
      benefits.push('✅ Bus rapid transit provides moderate TOD benefits');
      benefits.push('✅ Up to 1 additional density bonus unit');
    }

    if (lotSize > 6000) {
      benefits.push('✅ Large lot qualifies for enhanced TOD bonuses');
    }

    const requirements = [
      'Must be within designated TOD zone boundaries',
      'Enhanced urban design standards apply',
      'Sustainable transportation features required',
      'Higher density design standards'
    ];

    const incentives = [
      'Development cost charge reductions for TOD projects',
      'Expedited permitting for transit-supportive development',
      'Potential municipal tax incentives',
      'Access to federal/provincial transit-oriented funding'
    ];

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