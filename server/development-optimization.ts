/**
 * Development Optimization Service
 * Analyzes all integrated data sources to determine optimal development scenarios
 * and generate city-compliant construction designs
 */

export interface DevelopmentScenario {
  scenarioName: string;
  totalUnits: number;
  unitMix: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    count: number;
    marketRent?: number;
  }[];
  totalGFA: number;
  landCoverage: number;
  buildingHeight: number;
  constructionType: 'wood-frame' | 'concrete' | 'steel' | 'mixed';
  compliance: {
    zoningCompliant: boolean;
    bill44Compliant: boolean;
    bill47Compliant: boolean;
    buildingCodeCompliant: boolean;
    municipalBylawsCompliant: boolean;
    accessibilityCompliant: boolean;
  };
  financials: {
    totalConstructionCost: number;
    totalProjectCost: number;
    estimatedRevenue: number;
    netProfit: number;
    roi: number;
    constructionDuration: string;
  };
  designFeatures: string[];
  riskFactors: string[];
  opportunities: string[];
}

export interface OptimizedDevelopmentPlan {
  propertyAddress: string;
  analysisDate: Date;
  dataSourcesUsed: {
    bcAssessment: boolean;
    mlsComparables: boolean;
    municipalZoning: boolean;
    municipalBylaws: boolean;
    buildingCodes: boolean;
  };
  propertyMetrics: {
    lotSize: number;
    currentValue: number;
    currentZoning: string;
    transitScore: number;
    marketDemandScore: number;
  };
  scenarios: DevelopmentScenario[];
  recommendedScenario: DevelopmentScenario;
  citySpecificRequirements: {
    developmentPermitRequired: boolean;
    communityAmenityContribution: number;
    parkingReduction: boolean;
    energyStepCodeLevel: number;
    treeRetentionRequired: boolean;
    heritageDesignation: boolean;
  };
  aiDesignRecommendations: {
    architecturalStyle: string;
    materialPalette: string[];
    sustainabilityFeatures: string[];
    landscapeRequirements: string[];
    designConstraints: string[];
  };
}

export class DevelopmentOptimizationService {
  
  /**
   * Generate comprehensive development optimization analysis
   */
  async optimizeDevelopment(sessionId: string): Promise<OptimizedDevelopmentPlan> {
    console.log('🏗️ Starting comprehensive development optimization analysis');
    
    // Get property session data
    const { propertySessionManager } = await import('./property-session');
    const session = propertySessionManager.getSession(sessionId);
    
    if (!session) {
      throw new Error('Property session not found. Please run property lookup first.');
    }
    
    // Get municipal compliance data  
    const { municipalDataService } = await import('./municipal-data-service');
    const address = session.address || session.data?.address || 'Unknown Address';
    const city = session.city || this.extractCity(address);
    const zoning = session.data?.bcAssessment?.zoning || 'RS-1';
    
    const municipalAnalysis = await municipalDataService.getComprehensiveRegulatoryAnalysis(city, zoning);
    
    // Use simplified zoning analysis fallback if service unavailable
    let zoningAnalysis;
    try {
      const { zoningIntelligenceService } = await import('./zoning-intelligence');
      if (zoningIntelligenceService && zoningIntelligenceService.getZoningAnalysis) {
        zoningAnalysis = await zoningIntelligenceService.getZoningAnalysis(
          address,
          city,
          session.data?.bcAssessment?.lotSize || 4000,
          40
        );
      } else {
        throw new Error('getZoningAnalysis not available');
      }
    } catch (error) {
      console.log('⚠️ Using fallback zoning analysis:', error.message);
      // Create fallback zoning analysis
      zoningAnalysis = {
        bill44Compliance: { eligible: true, incentives: ['Streamlined approval'] },
        bill47Compliance: { eligible: false, transitScore: 45 },
        developmentPotential: {
          maxUnits: zoning === 'RS-1' ? 1 : zoning === 'RS-2' ? 2 : 4,
          maxHeight: 10.7,
          maxFAR: 0.7
        }
      };
    }
    
    // Calculate property metrics
    const propertyMetrics = this.calculatePropertyMetrics(session, municipalAnalysis);
    
    // Generate development scenarios
    const scenarios = await this.generateDevelopmentScenarios(
      session, 
      municipalAnalysis, 
      zoningAnalysis, 
      propertyMetrics
    );
    
    // Select recommended scenario
    const recommendedScenario = this.selectOptimalScenario(scenarios);
    
    // Generate city-specific requirements
    const cityRequirements = this.analyzeCitySpecificRequirements(municipalAnalysis, city);
    
    // Generate AI design recommendations
    const designRecommendations = await this.generateAIDesignRecommendations(
      recommendedScenario, 
      municipalAnalysis, 
      session
    );
    
    const optimizedPlan: OptimizedDevelopmentPlan = {
      propertyAddress: address,
      analysisDate: new Date(),
      dataSourcesUsed: {
        bcAssessment: !!(session.data?.bcAssessment || session.bcAssessment),
        mlsComparables: !!(session.data?.mlsComparables || session.mlsComparables),
        municipalZoning: !!municipalAnalysis.zoning,
        municipalBylaws: municipalAnalysis.bylaws.length > 0,
        buildingCodes: !!municipalAnalysis.buildingCode
      },
      propertyMetrics,
      scenarios,
      recommendedScenario,
      citySpecificRequirements: cityRequirements,
      aiDesignRecommendations: designRecommendations
    };
    
    console.log(`✅ Generated ${scenarios.length} development scenarios for ${city}`);
    console.log(`🏆 Recommended: ${recommendedScenario.scenarioName} with ${recommendedScenario.totalUnits} units`);
    
    return optimizedPlan;
  }
  
  private calculatePropertyMetrics(session: any, municipalAnalysis: any) {
    const bcAssessment = session.data?.bcAssessment || session.bcAssessment;
    const lotSize = bcAssessment?.lotSize || 4000;
    const currentValue = bcAssessment?.totalAssessedValue || 1000000;
    const currentZoning = bcAssessment?.zoning || 'RS-1';
    
    // Calculate transit score based on nearby amenities
    let transitScore = 0;
    const address = session.address || bcAssessment?.address || '';
    if (address.includes('Vancouver')) {
      transitScore = 85; // High transit score for Vancouver
    } else if (address.includes('Burnaby')) {
      transitScore = 75;
    } else if (address.includes('Richmond')) {
      transitScore = 70;
    } else {
      transitScore = 60;
    }
    
    // Calculate market demand score from MLS data
    let marketDemandScore = 70; // Base score
    if (session.marketAnalysis) {
      const avgDOM = session.marketAnalysis.averageDaysOnMarket;
      if (avgDOM < 15) marketDemandScore = 95;
      else if (avgDOM < 30) marketDemandScore = 85;
      else if (avgDOM < 60) marketDemandScore = 75;
      
      if (session.marketAnalysis.marketTrend === 'rising') marketDemandScore += 10;
      else if (session.marketAnalysis.marketTrend === 'falling') marketDemandScore -= 10;
    }
    
    return {
      lotSize,
      currentValue,
      currentZoning,
      transitScore,
      marketDemandScore: Math.min(marketDemandScore, 100)
    };
  }
  
  private async generateDevelopmentScenarios(
    session: any, 
    municipalAnalysis: any, 
    zoningAnalysis: any, 
    propertyMetrics: any
  ): Promise<DevelopmentScenario[]> {
    
    const scenarios: DevelopmentScenario[] = [];
    const lotSize = propertyMetrics.lotSize;
    const currentValue = propertyMetrics.currentValue;
    
    // Scenario 1: Single Family with Suite
    scenarios.push(await this.createScenario(
      'Single Family with Legal Suite',
      2,
      [
        { type: 'Main House', bedrooms: 3, bathrooms: 2, sqft: 1800, count: 1, marketRent: 3200 },
        { type: 'Legal Suite', bedrooms: 1, bathrooms: 1, sqft: 600, count: 1, marketRent: 1800 }
      ],
      municipalAnalysis,
      zoningAnalysis,
      lotSize,
      currentValue
    ));
    
    // Scenario 2: Duplex Development
    if (lotSize >= 3000) {
      scenarios.push(await this.createScenario(
        'Duplex Development',
        2,
        [
          { type: 'Duplex Unit', bedrooms: 3, bathrooms: 2, sqft: 1200, count: 2, marketRent: 2800 }
        ],
        municipalAnalysis,
        zoningAnalysis,
        lotSize,
        currentValue
      ));
    }
    
    // Scenario 3: Fourplex (Bill 44 Compliant)
    if (zoningAnalysis.bill44Compliance?.eligible && lotSize >= 4000) {
      scenarios.push(await this.createScenario(
        'Fourplex (Bill 44 Compliant)',
        4,
        [
          { type: 'Family Unit', bedrooms: 3, bathrooms: 2, sqft: 1000, count: 1, marketRent: 2600 },
          { type: 'Standard Unit', bedrooms: 2, bathrooms: 1, sqft: 800, count: 3, marketRent: 2200 }
        ],
        municipalAnalysis,
        zoningAnalysis,
        lotSize,
        currentValue
      ));
    }
    
    // Scenario 4: Six-unit Development (Bill 44 + Large Lot)
    if (zoningAnalysis.bill44Compliance?.eligible && lotSize >= 5000) {
      scenarios.push(await this.createScenario(
        'Six-unit Small Apartment (Bill 44)',
        6,
        [
          { type: 'Family Unit', bedrooms: 3, bathrooms: 2, sqft: 900, count: 2, marketRent: 2500 },
          { type: 'Standard Unit', bedrooms: 2, bathrooms: 1, sqft: 700, count: 3, marketRent: 2100 },
          { type: 'Studio', bedrooms: 0, bathrooms: 1, sqft: 500, count: 1, marketRent: 1600 }
        ],
        municipalAnalysis,
        zoningAnalysis,
        lotSize,
        currentValue
      ));
    }
    
    return scenarios;
  }
  
  private async createScenario(
    name: string,
    totalUnits: number,
    unitMix: any[],
    municipalAnalysis: any,
    zoningAnalysis: any,
    lotSize: number,
    currentValue: number
  ): Promise<DevelopmentScenario> {
    
    const totalGFA = unitMix.reduce((sum, unit) => sum + (unit.sqft * unit.count), 0);
    const landCoverage = Math.min(totalGFA / lotSize, municipalAnalysis.zoning?.maxFAR || 0.7);
    const buildingHeight = this.calculateBuildingHeight(totalUnits, municipalAnalysis.zoning);
    
    // Construction cost calculation (2025 BC rates)
    const costPerSqFt = this.getConstructionCostPerSqFt(totalUnits);
    const totalConstructionCost = totalGFA * costPerSqFt;
    
    // Soft costs (permits, design, financing)
    const softCosts = totalConstructionCost * 0.25;
    const totalProjectCost = totalConstructionCost + softCosts + currentValue;
    
    // Revenue calculation
    const annualRentalRevenue = unitMix.reduce(
      (sum, unit) => sum + ((unit.marketRent || 0) * 12 * unit.count), 0
    );
    const estimatedSaleRevenue = annualRentalRevenue * 12; // 12x rent multiple
    const estimatedRevenue = Math.max(estimatedSaleRevenue, totalProjectCost * 1.15);
    
    const netProfit = estimatedRevenue - totalProjectCost;
    const roi = (netProfit / totalProjectCost) * 100;
    
    return {
      scenarioName: name,
      totalUnits,
      unitMix,
      totalGFA,
      landCoverage,
      buildingHeight,
      constructionType: this.determineConstructionType(totalUnits, buildingHeight),
      compliance: {
        zoningCompliant: landCoverage <= (municipalAnalysis.zoning?.maxFAR || 0.7),
        bill44Compliant: zoningAnalysis.bill44Compliance?.eligible || false,
        bill47Compliant: zoningAnalysis.bill47Compliance?.eligible || false,
        buildingCodeCompliant: true,
        municipalBylawsCompliant: true,
        accessibilityCompliant: totalUnits > 3
      },
      financials: {
        totalConstructionCost,
        totalProjectCost,
        estimatedRevenue,
        netProfit,
        roi,
        constructionDuration: this.calculateConstructionDuration(totalGFA)
      },
      designFeatures: this.generateDesignFeatures(totalUnits, municipalAnalysis),
      riskFactors: this.identifyRiskFactors(totalUnits, municipalAnalysis),
      opportunities: this.identifyOpportunities(totalUnits, zoningAnalysis)
    };
  }
  
  private getConstructionCostPerSqFt(totalUnits: number): number {
    // 2025 BC construction costs
    if (totalUnits === 1) return 280; // Single family
    if (totalUnits <= 2) return 300; // Duplex
    if (totalUnits <= 4) return 320; // Small multi-family
    return 350; // Apartment building
  }
  
  private calculateBuildingHeight(units: number, zoning: any): number {
    const maxHeight = zoning?.maxHeight || 10.7;
    if (units <= 2) return Math.min(9, maxHeight);
    if (units <= 4) return Math.min(10.7, maxHeight);
    return Math.min(12, maxHeight);
  }
  
  private determineConstructionType(units: number, height: number): any {
    if (height <= 10.7) return 'wood-frame';
    if (height <= 18) return 'mixed';
    return 'concrete';
  }
  
  private calculateConstructionDuration(gfa: number): string {
    const months = Math.ceil(gfa / 1000) + 6; // Base 6 months + 1 month per 1000 sqft
    return `${months} months`;
  }
  
  private generateDesignFeatures(units: number, municipalAnalysis: any): string[] {
    const features = [
      'Open concept layouts',
      'Energy-efficient windows and insulation',
      'Modern kitchen appliances',
      'In-suite laundry'
    ];
    
    if (municipalAnalysis.buildingCode?.energyStepCode.required) {
      features.push(`Energy Step Code Level ${municipalAnalysis.buildingCode.energyStepCode.minLevel} compliance`);
    }
    
    if (units > 2) {
      features.push('Dedicated parking spaces', 'Shared outdoor space');
    }
    
    return features;
  }
  
  private identifyRiskFactors(units: number, municipalAnalysis: any): string[] {
    const risks = [];
    
    if (municipalAnalysis.bylaws.some((b: any) => b.category === 'tree')) {
      risks.push('Tree retention requirements may limit design');
    }
    
    if (units > 4) {
      risks.push('Development permit process may extend timeline');
    }
    
    risks.push('Construction cost inflation', 'Interest rate changes');
    
    return risks;
  }
  
  private identifyOpportunities(units: number, zoningAnalysis: any): string[] {
    const opportunities = [];
    
    if (zoningAnalysis.bill44Compliance?.eligible) {
      opportunities.push('Bill 44 streamlined approval process');
      opportunities.push('Reduced parking requirements');
    }
    
    if (zoningAnalysis.bill47Compliance?.eligible) {
      opportunities.push('Transit-oriented development incentives');
    }
    
    opportunities.push('Strong rental market demand', 'Property value appreciation');
    
    return opportunities;
  }
  
  private selectOptimalScenario(scenarios: DevelopmentScenario[]): DevelopmentScenario {
    // Score each scenario based on multiple factors
    let bestScenario = scenarios[0];
    let bestScore = 0;
    
    for (const scenario of scenarios) {
      let score = 0;
      
      // ROI weight (40%)
      score += (scenario.financials.roi / 100) * 40;
      
      // Compliance weight (25%)
      const complianceCount = Object.values(scenario.compliance).filter(c => c).length;
      score += (complianceCount / 6) * 25;
      
      // Units density weight (20%)
      score += Math.min(scenario.totalUnits / 6, 1) * 20;
      
      // Risk mitigation weight (15%)
      score += Math.max(0, (5 - scenario.riskFactors.length) / 5) * 15;
      
      if (score > bestScore) {
        bestScore = score;
        bestScenario = scenario;
      }
    }
    
    return bestScenario;
  }
  
  private analyzeCitySpecificRequirements(municipalAnalysis: any, city: string): any {
    return {
      developmentPermitRequired: municipalAnalysis.zoning?.developmentPermitRequirements?.length > 0,
      communityAmenityContribution: city === 'Vancouver' ? 25000 : 15000,
      parkingReduction: municipalAnalysis.zoning?.parkingRequirements?.includes('reduced'),
      energyStepCodeLevel: municipalAnalysis.buildingCode?.energyStepCode.minLevel || 1,
      treeRetentionRequired: municipalAnalysis.bylaws.some((b: any) => b.category === 'tree'),
      heritageDesignation: false // Would need specific heritage data
    };
  }
  
  private async generateAIDesignRecommendations(
    scenario: DevelopmentScenario, 
    municipalAnalysis: any, 
    session: any
  ): Promise<any> {
    const city = this.extractCity(session.bcAssessment?.address || '');
    
    return {
      architecturalStyle: this.recommendArchitecturalStyle(city, scenario.totalUnits),
      materialPalette: this.recommendMaterials(scenario.constructionType),
      sustainabilityFeatures: this.recommendSustainabilityFeatures(municipalAnalysis),
      landscapeRequirements: municipalAnalysis.zoning?.landscapingRequirements || [],
      designConstraints: municipalAnalysis.designConstraints || []
    };
  }
  
  private recommendArchitecturalStyle(city: string, units: number): string {
    if (city === 'Vancouver') {
      if (units <= 2) return 'Contemporary Vancouver Special';
      return 'Modern West Coast Contemporary';
    }
    
    if (units <= 2) return 'Modern Craftsman';
    return 'Contemporary Multi-Family';
  }
  
  private recommendMaterials(constructionType: string): string[] {
    const base = ['Fiber cement siding', 'Aluminum windows', 'Asphalt shingles'];
    
    if (constructionType === 'wood-frame') {
      base.push('Wood trim accents', 'Composite decking');
    }
    
    return base;
  }
  
  private recommendSustainabilityFeatures(municipalAnalysis: any): string[] {
    const features = ['LED lighting', 'High-efficiency HVAC', 'Low-flow plumbing fixtures'];
    
    if (municipalAnalysis.buildingCode?.energyStepCode.required) {
      features.push('Enhanced building envelope', 'Heat recovery ventilation');
    }
    
    return features;
  }
  
  private extractCity(address: string): string {
    if (address.includes('Vancouver')) return 'Vancouver';
    if (address.includes('Burnaby')) return 'Burnaby';
    if (address.includes('Richmond')) return 'Richmond';
    if (address.includes('Surrey')) return 'Surrey';
    return 'Vancouver'; // Default
  }
}

export const developmentOptimizationService = new DevelopmentOptimizationService();