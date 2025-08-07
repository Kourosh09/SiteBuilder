// BC Assessment and MLS Data Integration for BuildwiseAI
import { PropertyAnalysisInput } from "../shared/schema";

export interface BCAssessmentData {
  pid: string;
  address: string;
  landValue: number;
  improvementValue: number;
  totalAssessedValue: number;
  lotSize: number;
  zoning?: string;
  propertyType: string;
  yearBuilt?: number;
  buildingArea?: number;
  legalDescription?: string;
}

export interface MLSData {
  mlsNumber?: string;
  listPrice?: number;
  soldPrice?: number;
  daysOnMarket?: number;
  listDate?: Date;
  soldDate?: Date;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

export interface PropertyDataResult {
  bcAssessment: BCAssessmentData | null;
  mlsComparables: MLSData[];
  marketAnalysis: {
    averagePricePerSqFt: number;
    marketTrend: 'rising' | 'falling' | 'stable';
    averageDaysOnMarket: number;
    priceRange: { min: number; max: number };
  };
}

export class PropertyDataService {
  /**
   * Fetch BC Assessment data for a property
   * Currently uses simulated data - will integrate with BC Assessment API or scraping
   */
  async getBCAssessmentData(address: string, city: string): Promise<BCAssessmentData | null> {
    try {
      // TODO: Integrate with BC Assessment public search
      // For now, returning realistic sample data based on Vancouver market
      
      const simulatedData: BCAssessmentData = {
        pid: this.generatePID(address),
        address: `${address}, ${city}, BC`,
        landValue: this.estimateLandValue(address, city),
        improvementValue: this.estimateImprovementValue(address, city),
        totalAssessedValue: 0, // Will be calculated
        lotSize: this.estimateLotSize(city),
        zoning: this.getZoningEstimate(city),
        propertyType: "Single Family",
        yearBuilt: Math.floor(Math.random() * (2020 - 1950) + 1950),
        buildingArea: Math.floor(Math.random() * (3000 - 1200) + 1200),
        legalDescription: `Lot ${Math.floor(Math.random() * 99 + 1)}, Block ${Math.floor(Math.random() * 20 + 1)}, District Lot ${Math.floor(Math.random() * 999 + 1)}`
      };

      simulatedData.totalAssessedValue = simulatedData.landValue + simulatedData.improvementValue;
      
      return simulatedData;
    } catch (error) {
      console.error("BC Assessment lookup error:", error);
      return null;
    }
  }

  /**
   * Fetch MLS comparable sales data
   * Currently uses simulated data - will integrate with MLS RETS feed or partner API
   */
  async getMLSComparables(address: string, city: string, radius: number = 1): Promise<MLSData[]> {
    try {
      // TODO: Integrate with MLS RETS feed or partner with licensed realtor
      // For now, generating realistic comparable sales data
      
      const comparables: MLSData[] = [];
      const basePrice = this.estimateMarketPrice(city);
      
      for (let i = 0; i < 5; i++) {
        const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
        const soldPrice = Math.floor(basePrice * (1 + variance));
        const listPrice = Math.floor(soldPrice * (1 + Math.random() * 0.1)); // Listed slightly higher
        
        comparables.push({
          mlsNumber: `R${Math.floor(Math.random() * 9000000 + 1000000)}`,
          listPrice,
          soldPrice,
          daysOnMarket: Math.floor(Math.random() * 60 + 5),
          listDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
          soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          propertyType: "Single Family",
          bedrooms: Math.floor(Math.random() * 3 + 2),
          bathrooms: Math.floor(Math.random() * 2 + 1) + 0.5,
          squareFootage: Math.floor(Math.random() * (2800 - 1400) + 1400)
        });
      }
      
      return comparables.sort((a, b) => (b.soldDate?.getTime() || 0) - (a.soldDate?.getTime() || 0));
    } catch (error) {
      console.error("MLS lookup error:", error);
      return [];
    }
  }

  /**
   * Get comprehensive property data analysis
   */
  async getPropertyData(address: string, city: string): Promise<PropertyDataResult> {
    const [bcAssessment, mlsComparables] = await Promise.all([
      this.getBCAssessmentData(address, city),
      this.getMLSComparables(address, city)
    ]);

    const marketAnalysis = this.analyzeMarketData(mlsComparables);

    return {
      bcAssessment,
      mlsComparables,
      marketAnalysis
    };
  }

  /**
   * Analyze market data from MLS comparables
   */
  private analyzeMarketData(comparables: MLSData[]) {
    if (comparables.length === 0) {
      return {
        averagePricePerSqFt: 0,
        marketTrend: 'stable' as const,
        averageDaysOnMarket: 30,
        priceRange: { min: 0, max: 0 }
      };
    }

    const validComps = comparables.filter(c => c.soldPrice && c.squareFootage);
    const pricesPerSqFt = validComps.map(c => (c.soldPrice! / c.squareFootage!));
    const prices = validComps.map(c => c.soldPrice!);
    const daysOnMarket = comparables.filter(c => c.daysOnMarket).map(c => c.daysOnMarket!);

    return {
      averagePricePerSqFt: pricesPerSqFt.reduce((a, b) => a + b, 0) / pricesPerSqFt.length,
      marketTrend: this.determineTrend(comparables),
      averageDaysOnMarket: daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }

  /**
   * Helper methods for realistic data simulation
   */
  private generatePID(address: string): string {
    // Generate a realistic BC PID format
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `${Math.abs(hash) % 900 + 100}-${Math.abs(hash * 2) % 900 + 100}-${Math.abs(hash * 3) % 900 + 100}`;
  }

  private estimateLandValue(address: string, city: string): number {
    const cityMultipliers: Record<string, number> = {
      'vancouver': 1.8,
      'burnaby': 1.4,
      'richmond': 1.5,
      'surrey': 1.0,
      'coquitlam': 1.2,
      'north vancouver': 1.6,
      'west vancouver': 2.2
    };
    
    const baseValue = 450000;
    const multiplier = cityMultipliers[city.toLowerCase()] || 1.0;
    return Math.floor(baseValue * multiplier * (0.8 + Math.random() * 0.4));
  }

  private estimateImprovementValue(address: string, city: string): number {
    return Math.floor(Math.random() * 400000 + 200000);
  }

  private estimateLotSize(city: string): number {
    const cityAverage: Record<string, number> = {
      'vancouver': 4500,
      'burnaby': 5200,
      'richmond': 5800,
      'surrey': 6500,
      'coquitlam': 5500
    };
    
    const baseSize = cityAverage[city.toLowerCase()] || 5000;
    return Math.floor(baseSize * (0.7 + Math.random() * 0.6));
  }

  private getZoningEstimate(city: string): string {
    const zonings = ['RS-1', 'RS-2', 'RS-3', 'RS-5', 'RS-7', 'RT-1', 'RT-2'];
    return zonings[Math.floor(Math.random() * zonings.length)];
  }

  private estimateMarketPrice(city: string): number {
    const cityPrices: Record<string, number> = {
      'vancouver': 1650000,
      'burnaby': 1200000,
      'richmond': 1350000,
      'surrey': 950000,
      'coquitlam': 1100000,
      'north vancouver': 1450000,
      'west vancouver': 2200000
    };
    
    return cityPrices[city.toLowerCase()] || 1200000;
  }

  private determineTrend(comparables: MLSData[]): 'rising' | 'falling' | 'stable' {
    if (comparables.length < 3) return 'stable';
    
    // Sort by sold date
    const sortedComps = comparables
      .filter(c => c.soldDate && c.soldPrice)
      .sort((a, b) => a.soldDate!.getTime() - b.soldDate!.getTime());
    
    if (sortedComps.length < 3) return 'stable';
    
    const recent = sortedComps.slice(-2);
    const older = sortedComps.slice(0, 2);
    
    const recentAvg = recent.reduce((sum, comp) => sum + comp.soldPrice!, 0) / recent.length;
    const olderAvg = older.reduce((sum, comp) => sum + comp.soldPrice!, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) return 'rising';
    if (change < -0.05) return 'falling';
    return 'stable';
  }
}

export const propertyDataService = new PropertyDataService();