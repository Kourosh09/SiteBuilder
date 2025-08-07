import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  criteria: {
    minLotSize?: number;
    maxLotSize?: number;
    minPrice?: number;
    maxPrice?: number;
    cities: string[];
    zoningCodes: string[];
    developmentPotential: {
      minUnits?: number;
      maxUnits?: number;
    };
    proximityToTransit?: number; // meters
    proximityToSchools?: number; // meters
  };
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  matchCount: number;
}

export interface PropertyMatch {
  id: string;
  alertId: string;
  property: {
    address: string;
    city: string;
    price: number;
    lotSize: number;
    zoning: string;
    coordinates: { lat: number; lng: number };
    listingDate: string;
    daysOnMarket: number;
    developmentPotential: {
      maxUnits: number;
      bill44Eligible: boolean;
      estimatedValue: number;
    };
  };
  matchScore: number;
  matchedAt: string;
  notificationSent: boolean;
}

export class PropertyAlertService {
  private alerts: Map<string, PropertyAlert> = new Map();
  private matches: Map<string, PropertyMatch[]> = new Map();

  // Sample BC properties for demonstration
  private sampleProperties = [
    {
      id: "prop_001",
      address: "1234 Main Street",
      city: "Vancouver",
      price: 1850000,
      lotSize: 5500,
      zoning: "RS-1",
      coordinates: { lat: 49.2827, lng: -123.1207 },
      listingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      daysOnMarket: 2,
      developmentPotential: {
        maxUnits: 4,
        bill44Eligible: true,
        estimatedValue: 3200000
      }
    },
    {
      id: "prop_002", 
      address: "5678 Oak Avenue",
      city: "Burnaby",
      price: 1650000,
      lotSize: 6000,
      zoning: "RS-1",
      coordinates: { lat: 49.2488, lng: -122.9805 },
      listingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      daysOnMarket: 1,
      developmentPotential: {
        maxUnits: 6,
        bill44Eligible: true,
        estimatedValue: 3800000
      }
    },
    {
      id: "prop_003",
      address: "9876 Transit Way",
      city: "Surrey",
      price: 1200000,
      lotSize: 7200,
      zoning: "RS-1",
      coordinates: { lat: 49.1913, lng: -122.8490 },
      listingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      daysOnMarket: 3,
      developmentPotential: {
        maxUnits: 8,
        bill44Eligible: true,
        estimatedValue: 4200000
      }
    }
  ];

  async createAlert(alert: Omit<PropertyAlert, "id" | "createdAt" | "matchCount">): Promise<PropertyAlert> {
    const newAlert: PropertyAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      matchCount: 0
    };

    this.alerts.set(newAlert.id, newAlert);
    
    // Run initial matching
    await this.checkForMatches(newAlert);
    
    return newAlert;
  }

  async getUserAlerts(userId: string): Promise<PropertyAlert[]> {
    return [...this.alerts.values()].filter(alert => alert.userId === userId);
  }

  async updateAlert(alertId: string, updates: Partial<PropertyAlert>): Promise<PropertyAlert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(alertId, updatedAlert);

    if (updates.criteria) {
      await this.checkForMatches(updatedAlert);
    }

    return updatedAlert;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const deleted = this.alerts.delete(alertId);
    this.matches.delete(alertId);
    return deleted;
  }

  async getAlertMatches(alertId: string): Promise<PropertyMatch[]> {
    return this.matches.get(alertId) || [];
  }

  private async checkForMatches(alert: PropertyAlert): Promise<void> {
    const matches: PropertyMatch[] = [];

    for (const property of this.sampleProperties) {
      const matchScore = this.calculateMatchScore(property, alert.criteria);
      
      if (matchScore >= 0.7) { // 70% match threshold
        const match: PropertyMatch = {
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          alertId: alert.id,
          property,
          matchScore,
          matchedAt: new Date().toISOString(),
          notificationSent: false
        };

        matches.push(match);
      }
    }

    if (matches.length > 0) {
      this.matches.set(alert.id, matches);
      
      // Update match count
      const updatedAlert = { ...alert, matchCount: matches.length, lastTriggered: new Date().toISOString() };
      this.alerts.set(alert.id, updatedAlert);
    }
  }

  private calculateMatchScore(property: any, criteria: PropertyAlert["criteria"]): number {
    let score = 0;
    let factors = 0;

    // Price range check
    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      factors++;
      if ((!criteria.minPrice || property.price >= criteria.minPrice) &&
          (!criteria.maxPrice || property.price <= criteria.maxPrice)) {
        score += 0.3;
      }
    }

    // Lot size check
    if (criteria.minLotSize !== undefined || criteria.maxLotSize !== undefined) {
      factors++;
      if ((!criteria.minLotSize || property.lotSize >= criteria.minLotSize) &&
          (!criteria.maxLotSize || property.lotSize <= criteria.maxLotSize)) {
        score += 0.2;
      }
    }

    // City check
    if (criteria.cities.length > 0) {
      factors++;
      if (criteria.cities.includes(property.city)) {
        score += 0.2;
      }
    }

    // Zoning check
    if (criteria.zoningCodes.length > 0) {
      factors++;
      if (criteria.zoningCodes.includes(property.zoning)) {
        score += 0.2;
      }
    }

    // Development potential check
    if (criteria.developmentPotential.minUnits !== undefined) {
      factors++;
      if (property.developmentPotential.maxUnits >= criteria.developmentPotential.minUnits) {
        score += 0.1;
      }
    }

    return factors > 0 ? score : 0;
  }

  async generateAlertInsights(alertId: string): Promise<string> {
    const alert = this.alerts.get(alertId);
    const matches = this.matches.get(alertId) || [];

    if (!alert) return "Alert not found";

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a real estate investment advisor analyzing property alert performance and market opportunities."
          },
          {
            role: "user",
            content: `Analyze this property alert and its matches:

Alert: ${alert.name}
Criteria: ${JSON.stringify(alert.criteria)}
Total Matches: ${matches.length}
Recent Matches: ${JSON.stringify(matches.slice(0, 3))}

Provide insights on:
1. Market opportunity assessment
2. Alert criteria optimization suggestions
3. Investment timing recommendations
4. Risk factors to consider

Keep response concise and actionable.`
          }
        ]
      });

      return response.choices[0].message.content || "Unable to generate insights";
    } catch (error) {
      console.error("Error generating alert insights:", error);
      return "Unable to generate insights at this time";
    }
  }

  // Simulate real-time property feed
  async simulateNewListings(): Promise<void> {
    // In production, this would connect to MLS feeds
    const newProperty = {
      id: `prop_${Date.now()}`,
      address: `${Math.floor(Math.random() * 9999)} Development Street`,
      city: ["Vancouver", "Burnaby", "Surrey", "Richmond"][Math.floor(Math.random() * 4)],
      price: Math.floor(Math.random() * 1000000) + 1200000,
      lotSize: Math.floor(Math.random() * 3000) + 5000,
      zoning: "RS-1",
      coordinates: { 
        lat: 49.2827 + (Math.random() - 0.5) * 0.2, 
        lng: -123.1207 + (Math.random() - 0.5) * 0.3 
      },
      listingDate: new Date().toISOString(),
      daysOnMarket: 0,
      developmentPotential: {
        maxUnits: Math.floor(Math.random() * 6) + 2,
        bill44Eligible: Math.random() > 0.3,
        estimatedValue: Math.floor(Math.random() * 2000000) + 2500000
      }
    };

    this.sampleProperties.push(newProperty);

    // Check all active alerts for matches
    for (const alert of this.alerts.values()) {
      if (alert.isActive) {
        await this.checkForMatches(alert);
      }
    }
  }
}

export const propertyAlertService = new PropertyAlertService();