/**
 * AutoProp-Style Integration Service
 * Comprehensive property data integration similar to AutoProp's approach
 * Combines BC Assessment, MLS, Municipal Zoning, and Building Code data
 */

export interface AutoPropStyleReport {
  propertyIdentification: {
    address: string;
    city: string;
    pid: string;
    legalDescription: string;
    coordinates: { lat: number; lng: number };
  };
  bcAssessmentData: {
    landValue: number;
    improvementValue: number;
    totalAssessedValue: number;
    propertyType: string;
    yearBuilt: number;
    buildingArea: number;
    lotSize: number;
    zoning: string;
  };
  mlsMarketData: {
    comparables: any[];
    marketAnalysis: {
      averagePricePerSqFt: number;
      marketTrend: string;
      averageDaysOnMarket: number;
      priceRange: { min: number; max: number };
    };
  };
  municipalRegulatoryData: {
    zoningSummary: {
      code: string;
      description: string;
      maxHeight: number;
      maxFAR: number;
      maxDensity: number;
      setbacks: any;
      parkingRequirements: string;
      permittedUses: string[];
    };
    applicableBylaws: {
      bylawNumber: string;
      title: string;
      requirement: string;
      category: string;
      lastUpdated: Date;
    }[];
    buildingCodeRequirements: {
      energyStepCode: any;
      accessibilityRequirements: string[];
      fireProtectionRequirements: string[];
    };
  };
  developmentAnalysis: {
    currentUse: string;
    maxUnitsUnderCurrentZoning: number;
    bill44MaxUnits: number;
    bill47MaxUnits: number;
    recommendedDevelopment: string;
    estimatedConstructionCost: number;
    estimatedTotalValue: number;
    feasibilityScore: number;
  };
  complianceMatrix: {
    bill44Compliant: boolean;
    bill47Compliant: boolean;
    ssmuhCompliant: boolean;
    municipalZoningCompliant: boolean;
    buildingCodeReady: boolean;
  };
  aiDesignInput: {
    constraintsForAI: string[];
    opportunities: string[];
    recommendedDesignType: string;
    targetUnits: number;
    budgetEstimate: number;
  };
}

export class AutoPropIntegrationService {
  /**
   * Generate comprehensive property report like AutoProp
   */
  async generateComprehensiveReport(
    address: string, 
    city: string, 
    sessionId?: string
  ): Promise<AutoPropStyleReport> {
    console.log(`🏢 AutoProp-style comprehensive analysis for ${address}, ${city}`);
    
    // Get existing property session data
    const { propertySessionManager } = await import('./property-session');
    let session = null;
    if (sessionId) {
      session = propertySessionManager.getSession(sessionId);
    }
    
    // If no session, create one with property lookup
    if (!session) {
      const { PropertyDataService } = await import('./property-data');
      const propertyService = new PropertyDataService();
      const propertyData = await propertyService.getPropertyData(address, city);
      session = propertySessionManager.createSession(propertyData);
    }
    
    // Get municipal regulatory data
    const { municipalDataService } = await import('./municipal-data-service');
    const zoning = session.bcAssessment?.zoning || 'RS-1';
    const municipalAnalysis = await municipalDataService.getComprehensiveRegulatoryAnalysis(city, zoning);
    
    // Get zoning intelligence analysis
    const { zoningIntelligenceService } = await import('./zoning-intelligence');
    const zoningAnalysis = await zoningIntelligenceService.getZoningAnalysis(
      address, 
      city, 
      session.bcAssessment?.lotSize || 4000, 
      40
    );
    
    // Calculate development potential
    const developmentAnalysis = this.calculateDevelopmentPotential(
      session,
      municipalAnalysis,
      zoningAnalysis
    );
    
    // Create comprehensive report
    const report: AutoPropStyleReport = {
      propertyIdentification: {
        address,
        city,
        pid: session.bcAssessment?.pid || 'Not Available',
        legalDescription: session.bcAssessment?.legalDescription || 'Not Available',
        coordinates: { lat: 49.2827, lng: -123.1207 } // Default Vancouver coords
      },
      
      bcAssessmentData: {
        landValue: session.bcAssessment?.landValue || 0,
        improvementValue: session.bcAssessment?.improvementValue || 0,
        totalAssessedValue: session.bcAssessment?.totalAssessedValue || 0,
        propertyType: session.bcAssessment?.propertyType || 'Unknown',
        yearBuilt: session.bcAssessment?.yearBuilt || 0,
        buildingArea: session.bcAssessment?.buildingArea || 0,
        lotSize: session.bcAssessment?.lotSize || 0,
        zoning: session.bcAssessment?.zoning || 'Unknown'
      },
      
      mlsMarketData: {
        comparables: session.mlsComparables || [],
        marketAnalysis: session.marketAnalysis || {
          averagePricePerSqFt: 0,
          marketTrend: 'Unknown',
          averageDaysOnMarket: 0,
          priceRange: { min: 0, max: 0 }
        }
      },
      
      municipalRegulatoryData: {
        zoningSummary: municipalAnalysis.zoning ? {
          code: municipalAnalysis.zoning.zoningCode,
          description: municipalAnalysis.zoning.description,
          maxHeight: municipalAnalysis.zoning.maxHeight,
          maxFAR: municipalAnalysis.zoning.maxFAR,
          maxDensity: municipalAnalysis.zoning.maxDensity,
          setbacks: municipalAnalysis.zoning.setbacks,
          parkingRequirements: municipalAnalysis.zoning.parkingRequirements,
          permittedUses: municipalAnalysis.zoning.permittedUses
        } : {
          code: 'Not Available',
          description: 'Municipal data not available',
          maxHeight: 0,
          maxFAR: 0,
          maxDensity: 0,
          setbacks: {},
          parkingRequirements: 'Unknown',
          permittedUses: []
        },
        
        applicableBylaws: municipalAnalysis.bylaws.map(bylaw => ({
          bylawNumber: bylaw.bylawNumber,
          title: bylaw.title,
          requirement: bylaw.requirement,
          category: bylaw.category,
          lastUpdated: bylaw.lastUpdated
        })),
        
        buildingCodeRequirements: municipalAnalysis.buildingCode ? {
          energyStepCode: municipalAnalysis.buildingCode.energyStepCode,
          accessibilityRequirements: municipalAnalysis.buildingCode.accessibilityRequirements,
          fireProtectionRequirements: municipalAnalysis.buildingCode.fireProtectionRequirements
        } : {
          energyStepCode: { required: false, minLevel: 0, applicableBuildings: [] },
          accessibilityRequirements: [],
          fireProtectionRequirements: []
        }
      },
      
      developmentAnalysis,
      
      complianceMatrix: {
        bill44Compliant: zoningAnalysis.bill44Compliance?.eligible || false,
        bill47Compliant: zoningAnalysis.bill47Compliance?.eligible || false,
        ssmuhCompliant: zoningAnalysis.ssmuhCompliance?.eligible || false,
        municipalZoningCompliant: !!municipalAnalysis.zoning,
        buildingCodeReady: !!municipalAnalysis.buildingCode
      },
      
      aiDesignInput: {
        constraintsForAI: municipalAnalysis.designConstraints,
        opportunities: municipalAnalysis.opportunities,
        recommendedDesignType: this.determineRecommendedDesignType(developmentAnalysis.maxUnitsUnderCurrentZoning),
        targetUnits: Math.max(
          developmentAnalysis.maxUnitsUnderCurrentZoning,
          developmentAnalysis.bill44MaxUnits,
          developmentAnalysis.bill47MaxUnits
        ),
        budgetEstimate: developmentAnalysis.estimatedConstructionCost
      }
    };
    
    console.log(`✅ AutoProp-style report generated with ${report.municipalRegulatoryData.applicableBylaws.length} bylaws and ${report.mlsMarketData.comparables.length} comparables`);
    
    return report;
  }
  
  private calculateDevelopmentPotential(
    session: any,
    municipalAnalysis: any,
    zoningAnalysis: any
  ): AutoPropStyleReport['developmentAnalysis'] {
    const lotSize = session.bcAssessment?.lotSize || 4000;
    const currentValue = session.bcAssessment?.totalAssessedValue || 1000000;
    
    // Calculate construction costs per unit (BC 2025 estimates)
    const costPerSqFt = 280; // $280/sqft for mid-range construction
    const avgUnitSize = 800; // 800 sqft average unit size
    const costPerUnit = costPerSqFt * avgUnitSize; // $224,000 per unit
    
    const maxUnits = zoningAnalysis.developmentPotential?.maxUnits || 1;
    const bill44Units = zoningAnalysis.developmentPotential?.bill44MaxUnits || 0;
    const bill47Units = zoningAnalysis.developmentPotential?.bill47MaxUnits || 0;
    
    const targetUnits = Math.max(maxUnits, bill44Units, bill47Units);
    const constructionCost = targetUnits * costPerUnit;
    
    // Estimate total project value (construction + land + soft costs + profit)
    const softCosts = constructionCost * 0.25; // 25% for permits, design, etc.
    const landCost = currentValue;
    const totalProjectCost = constructionCost + softCosts + landCost;
    const estimatedSaleValue = totalProjectCost * 1.20; // 20% profit margin
    
    return {
      currentUse: session.bcAssessment?.propertyType || 'Single Family',
      maxUnitsUnderCurrentZoning: maxUnits,
      bill44MaxUnits: bill44Units,
      bill47MaxUnits: bill47Units,
      recommendedDevelopment: this.determineRecommendedDevelopment(targetUnits),
      estimatedConstructionCost: constructionCost,
      estimatedTotalValue: estimatedSaleValue,
      feasibilityScore: this.calculateFeasibilityScore(
        estimatedSaleValue,
        totalProjectCost,
        targetUnits
      )
    };
  }
  
  private determineRecommendedDevelopment(units: number): string {
    if (units <= 1) return 'Single Family Dwelling';
    if (units === 2) return 'Duplex Development';
    if (units <= 4) return 'Fourplex Development';
    if (units <= 6) return 'Small Multi-Family Building';
    return 'Apartment Building';
  }
  
  private determineRecommendedDesignType(units: number): string {
    if (units <= 1) return 'single-family';
    if (units === 2) return 'duplex';
    if (units <= 4) return 'fourplex';
    if (units <= 8) return 'townhouse';
    return 'apartment';
  }
  
  private calculateFeasibilityScore(
    saleValue: number,
    projectCost: number,
    units: number
  ): number {
    // Simple feasibility calculation (0-100 score)
    const profitMargin = (saleValue - projectCost) / projectCost;
    const baseScore = Math.min(profitMargin * 100, 50); // Max 50 points for profit
    
    // Bonus points for multiple units (density bonus)
    const densityBonus = Math.min(units * 5, 30); // Max 30 points for units
    
    // Market conditions bonus (BC market is strong)
    const marketBonus = 20;
    
    return Math.min(Math.round(baseScore + densityBonus + marketBonus), 100);
  }
}

export const autoPropIntegrationService = new AutoPropIntegrationService();