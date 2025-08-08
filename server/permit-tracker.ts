// Permit Tracker & Development Intelligence for BuildwiseAI
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PermitData {
  id: string;
  permitNumber: string;
  address: string;
  city: string;
  permitType: 'building' | 'development' | 'demolition' | 'renovation' | 'subdivision';
  status: 'application' | 'under_review' | 'approved' | 'issued' | 'expired' | 'cancelled';
  description: string;
  applicantName?: string;
  builderName?: string;
  architectName?: string;
  engineerName?: string;
  estimatedValue: number;
  applicationDate: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  lotSize?: number;
  proposedUnits?: number;
  constructionType?: string;
  coordinates?: { lat: number; lng: number };
  documents?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface PermitSearchFilters {
  city?: string;
  permitType?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  valueRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface DevelopmentInsight {
  totalPermits: number;
  totalValue: number;
  activeProjects: number;
  topBuilders: { name: string; count: number; value: number }[];
  topArchitects: { name: string; count: number }[];
  permitTrends: { month: string; count: number; value: number }[];
  hotNeighborhoods: { area: string; count: number; avgValue: number }[];
}

export class PermitTrackerService {
  private permits: PermitData[] = [];

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Search permits with filters
   */
  searchPermits(filters: PermitSearchFilters = {}): PermitData[] {
    // Initialize with all permits
    let filteredPermits = [...this.permits];
    
    // Return all permits if no filters are provided
    if (!filters || Object.keys(filters).length === 0) {
      return filteredPermits.sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
    }

    // City filter
    if (filters.city) {
      filteredPermits = filteredPermits.filter(
        permit => permit.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Permit type filter
    if (filters.permitType) {
      filteredPermits = filteredPermits.filter(
        permit => permit.permitType === filters.permitType
      );
    }

    // Status filter
    if (filters.status) {
      filteredPermits = filteredPermits.filter(
        permit => permit.status === filters.status
      );
    }

    // Date range filter
    if (filters.dateRange) {
      filteredPermits = filteredPermits.filter(permit => {
        const appDate = permit.applicationDate;
        return appDate >= filters.dateRange!.start && appDate <= filters.dateRange!.end;
      });
    }

    // Value range filter
    if (filters.valueRange) {
      filteredPermits = filteredPermits.filter(permit => {
        return permit.estimatedValue >= filters.valueRange!.min && 
               permit.estimatedValue <= filters.valueRange!.max;
      });
    }

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredPermits = filteredPermits.filter(permit =>
        permit.address.toLowerCase().includes(term) ||
        permit.description.toLowerCase().includes(term) ||
        permit.builderName?.toLowerCase().includes(term) ||
        permit.architectName?.toLowerCase().includes(term)
      );
    }

    return filteredPermits.sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
  }

  /**
   * Get permits by city
   */
  getPermitsByCity(city: string): PermitData[] {
    return this.searchPermits({ city });
  }

  /**
   * Get development insights for a city or region
   */
  getDevelopmentInsights(city?: string): DevelopmentInsight {
    const permits = city ? this.getPermitsByCity(city) : this.permits;

    const totalPermits = permits.length;
    const totalValue = permits.reduce((sum, permit) => sum + permit.estimatedValue, 0);
    const activeProjects = permits.filter(p => ['approved', 'issued'].includes(p.status)).length;

    // Top builders analysis
    const builderStats = new Map<string, { count: number; value: number }>();
    permits.forEach(permit => {
      if (permit.builderName) {
        const current = builderStats.get(permit.builderName) || { count: 0, value: 0 };
        builderStats.set(permit.builderName, {
          count: current.count + 1,
          value: current.value + permit.estimatedValue
        });
      }
    });

    const topBuilders = Array.from(builderStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Top architects analysis
    const architectStats = new Map<string, number>();
    permits.forEach(permit => {
      if (permit.architectName) {
        architectStats.set(permit.architectName, (architectStats.get(permit.architectName) || 0) + 1);
      }
    });

    const topArchitects = Array.from(architectStats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Monthly trends (last 12 months)
    const monthlyStats = new Map<string, { count: number; value: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyStats.set(key, { count: 0, value: 0 });
    }

    permits.forEach(permit => {
      const key = `${permit.applicationDate.getFullYear()}-${(permit.applicationDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const current = monthlyStats.get(key);
      if (current) {
        current.count += 1;
        current.value += permit.estimatedValue;
      }
    });

    const permitTrends = Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({ month, ...stats }));

    // Hot neighborhoods (simplified - by city for now)
    const neighborhoodStats = new Map<string, { count: number; totalValue: number }>();
    permits.forEach(permit => {
      const current = neighborhoodStats.get(permit.city) || { count: 0, totalValue: 0 };
      neighborhoodStats.set(permit.city, {
        count: current.count + 1,
        totalValue: current.totalValue + permit.estimatedValue
      });
    });

    const hotNeighborhoods = Array.from(neighborhoodStats.entries())
      .map(([area, stats]) => ({
        area,
        count: stats.count,
        avgValue: stats.totalValue / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalPermits,
      totalValue,
      activeProjects,
      topBuilders,
      topArchitects,
      permitTrends,
      hotNeighborhoods
    };
  }

  /**
   * Get permit by ID
   */
  getPermitById(id: string): PermitData | null {
    return this.permits.find(permit => permit.id === id) || null;
  }

  /**
   * Get nearby permits (simplified - within same city for now)
   */
  getNearbyPermits(address: string, city: string, radius: number = 5): PermitData[] {
    // In a real implementation, this would use coordinates and distance calculation
    return this.getPermitsByCity(city).slice(0, 20);
  }

  /**
   * Generate AI-powered market analysis report
   */
  async generateMarketAnalysis(city: string): Promise<string> {
    try {
      const insights = this.getDevelopmentInsights(city);
      const permits = this.getPermitsByCity(city).slice(0, 10);

      const prompt = `Create a comprehensive development market analysis for ${city}, BC based on permit data:

      Market Overview:
      - Total Permits: ${insights.totalPermits}
      - Total Development Value: $${insights.totalValue.toLocaleString()}
      - Active Projects: ${insights.activeProjects}
      
      Top Builders: ${insights.topBuilders.slice(0, 3).map(b => `${b.name} (${b.count} projects, $${b.value.toLocaleString()})`).join(', ')}
      
      Recent Permit Activity: 
      ${permits.map(p => `- ${p.address}: ${p.permitType} permit, $${p.estimatedValue.toLocaleString()}`).join('\n')}
      
      Provide analysis covering:
      1. Market Activity Summary
      2. Development Trends
      3. Key Players Analysis
      4. Investment Opportunities
      5. Risk Assessment
      6. Future Outlook
      
      Format as a professional market report.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a real estate market analyst specializing in development permit data analysis. Create professional, data-driven market reports."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response.choices[0].message.content!;
      
    } catch (error) {
      console.error("Market analysis generation error:", error);
      throw new Error("Failed to generate market analysis");
    }
  }

  /**
   * Initialize sample permit data for target cities
   */
  private initializeSampleData(): void {
    const targetCities = [
      'Maple Ridge', 'Burnaby', 'Coquitlam', 'Port Coquitlam', 'Port Moody', 
      'Mission', 'Langley', 'Vancouver', 'Surrey', 'Richmond', 'North Vancouver', 'West Vancouver'
    ];

    const builders = [
      'Polygon Homes', 'Mosaic Homes', 'Townline Homes', 'Onni Group', 'Bosa Development',
      'Concord Pacific', 'Ledingham McAllister', 'Wesgroup Properties', 'PCI Developments',
      'Keltic Development', 'Marcon Construction', 'Belford Properties'
    ];

    const architects = [
      'IBI Group', 'Dialog', 'GBL Architects', 'Merrick Architecture', 'Cornerstone Architecture',
      'Alpha Architectural Group', 'Chris Dikeakos Architects', 'ZGF Architects', 
      'Battersby Howat Architects', 'Davidson Yuen Simpson Architects'
    ];

    const permitTypes: PermitData['permitType'][] = ['building', 'development', 'demolition', 'renovation', 'subdivision'];
    const statuses: PermitData['status'][] = ['application', 'under_review', 'approved', 'issued', 'expired'];

    // Generate realistic permit data
    for (let i = 0; i < 150; i++) {
      const city = targetCities[Math.floor(Math.random() * targetCities.length)];
      const permitType = permitTypes[Math.floor(Math.random() * permitTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const applicationDate = new Date();
      applicationDate.setDate(applicationDate.getDate() - Math.floor(Math.random() * 365));
      
      let approvalDate: Date | undefined;
      if (['approved', 'issued'].includes(status)) {
        approvalDate = new Date(applicationDate);
        approvalDate.setDate(approvalDate.getDate() + Math.floor(Math.random() * 90) + 30);
      }

      const estimatedValue = this.getRealisticValue(city, permitType);
      const address = this.generateRealisticAddress(city);
      
      this.permits.push({
        id: `permit_${Date.now()}_${i}`,
        permitNumber: `${city.substring(0, 2).toUpperCase()}${new Date().getFullYear()}${(1000 + i).toString()}`,
        address,
        city,
        permitType,
        status,
        description: this.generateDescription(permitType, estimatedValue),
        builderName: Math.random() > 0.3 ? builders[Math.floor(Math.random() * builders.length)] : undefined,
        architectName: Math.random() > 0.4 ? architects[Math.floor(Math.random() * architects.length)] : undefined,
        estimatedValue,
        applicationDate,
        approvalDate,
        expiryDate: approvalDate ? new Date(approvalDate.getTime() + 365 * 24 * 60 * 60 * 1000) : undefined,
        lotSize: Math.floor(Math.random() * 8000 + 3000),
        proposedUnits: permitType === 'building' ? Math.floor(Math.random() * 20 + 1) : undefined,
        constructionType: ['Wood Frame', 'Concrete', 'Steel Frame', 'Mixed'][Math.floor(Math.random() * 4)],
        coordinates: this.getCityCoordinates(city)
      });
    }
  }

  private getRealisticValue(city: string, permitType: PermitData['permitType']): number {
    const cityMultipliers: Record<string, number> = {
      'Vancouver': 2.0,
      'West Vancouver': 2.5,
      'North Vancouver': 1.8,
      'Burnaby': 1.6,
      'Richmond': 1.7,
      'Coquitlam': 1.4,
      'Surrey': 1.2,
      'Langley': 1.1,
      'Maple Ridge': 1.0,
      'Mission': 0.9
    };

    const baseValues = {
      building: 800000,
      development: 1200000,
      renovation: 150000,
      demolition: 50000,
      subdivision: 300000
    };

    const multiplier = cityMultipliers[city] || 1.0;
    const baseValue = baseValues[permitType];
    
    return Math.floor(baseValue * multiplier * (0.5 + Math.random() * 1.5));
  }

  private generateRealisticAddress(city: string): string {
    const streetNumbers = Math.floor(Math.random() * 9999 + 100);
    const streetNames = [
      'Main St', 'First Ave', 'Second Ave', 'Fraser St', 'King Rd', 'Broadway',
      'Commercial Dr', 'Hastings St', 'Oak St', 'Cambie St', 'Knight St',
      'Marine Dr', 'Lougheed Hwy', 'Austin Ave', 'Columbia St', 'Dewdney Trunk Rd'
    ];
    
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    return `${streetNumbers} ${streetName}`;
  }

  private generateDescription(permitType: PermitData['permitType'], value: number): string {
    const descriptions = {
      building: [
        'New multi-family residential building',
        'New single-family dwelling',
        'New townhouse development',
        'New apartment complex',
        'New mixed-use building'
      ],
      development: [
        'Subdivision development',
        'Multi-phase residential development',
        'Commercial development project',
        'Mixed-use development'
      ],
      renovation: [
        'Major home renovation',
        'Building modernization',
        'Structural improvements',
        'Building envelope upgrade'
      ],
      demolition: [
        'Single-family home demolition',
        'Building demolition for redevelopment',
        'Structure removal'
      ],
      subdivision: [
        'Residential subdivision',
        'Land subdivision for development',
        'Property lot division'
      ]
    };

    const baseDesc = descriptions[permitType][Math.floor(Math.random() * descriptions[permitType].length)];
    
    if (value > 2000000) {
      return `${baseDesc} - Premium project`;
    } else if (value > 1000000) {
      return `${baseDesc} - Major project`;
    }
    
    return baseDesc;
  }

  private getCityCoordinates(city: string): { lat: number; lng: number } {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'Vancouver': { lat: 49.2827, lng: -123.1207 },
      'Burnaby': { lat: 49.2488, lng: -122.9805 },
      'Richmond': { lat: 49.1666, lng: -123.1336 },
      'Surrey': { lat: 49.1913, lng: -122.8490 },
      'Coquitlam': { lat: 49.2838, lng: -122.7932 },
      'Port Coquitlam': { lat: 49.2658, lng: -122.7811 },
      'Port Moody': { lat: 49.2834, lng: -122.8331 },
      'Langley': { lat: 49.0955, lng: -122.6544 },
      'Maple Ridge': { lat: 49.2188, lng: -122.5987 },
      'Mission': { lat: 49.1344, lng: -122.3089 },
      'North Vancouver': { lat: 49.3162, lng: -123.0707 },
      'West Vancouver': { lat: 49.3682, lng: -123.1645 }
    };

    const baseCoords = coordinates[city] || coordinates['Vancouver'];
    
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
    };
  }
}

export const permitTrackerService = new PermitTrackerService();