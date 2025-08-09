/**
 * LTSA Enterprise Account Integration Service
 * Uses proper business account credentials to access authentic BC property data
 */

export class LTSAEnterpriseService {
  private baseUrl = 'https://apps.ltsa.ca';
  private username: string;
  private password: string;
  private apiToken?: string;

  constructor() {
    this.username = process.env.LTSA_ENTERPRISE_USERNAME || '';
    this.password = process.env.LTSA_ENTERPRISE_PASSWORD || '';
    this.apiToken = process.env.LTSA_API_TOKEN || '';
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.apiToken) {
      return {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    } else if (this.username && this.password) {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }
    throw new Error('LTSA Enterprise credentials not configured');
  }

  /**
   * Search property by address using LTSA Enterprise Account
   */
  async searchPropertyByAddress(address: string, city: string): Promise<any | null> {
    try {
      console.log(`🏛️ LTSA Enterprise: Searching ${address}, ${city}`);

      // Method 1: SRS Property Search API
      const response = await fetch(`${this.baseUrl}/srs/api/property/search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          searchCriteria: {
            address: `${address}, ${city}, BC`,
            includeAssessment: true,
            includeTitleInfo: true,
            includeOwnership: true,
            includeCharges: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ LTSA Enterprise: Found property data`);
        return this.formatLTSAData(data);
      }

      // Method 2: Alternative Enterprise Search
      const altResponse = await fetch(`${this.baseUrl}/api/search/address`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          streetAddress: address,
          city: city,
          province: 'BC'
        })
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log(`✅ LTSA Enterprise: Found property via alternative search`);
        return this.formatLTSAData(altData);
      }

      console.log(`❌ LTSA Enterprise: No property found for ${address}, ${city}`);
      return null;

    } catch (error) {
      console.log(`❌ LTSA Enterprise search failed:`, error);
      return null;
    }
  }

  /**
   * Get title information by PID
   */
  async getTitleByPID(pid: string): Promise<any | null> {
    try {
      console.log(`🏛️ LTSA Enterprise: Getting title for PID ${pid}`);

      const response = await fetch(`${this.baseUrl}/srs/api/title/${pid}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ LTSA Enterprise: Retrieved title for PID ${pid}`);
        return data;
      }

      console.log(`❌ LTSA Enterprise: Title not found for PID ${pid}`);
      return null;

    } catch (error) {
      console.log(`❌ LTSA Enterprise title search failed:`, error);
      return null;
    }
  }

  /**
   * Format LTSA data to standardized format
   */
  private formatLTSAData(rawData: any): any {
    try {
      const property = rawData.properties?.[0] || rawData.property || rawData;

      return {
        pid: property.pid || property.parcelIdentifier,
        titleNumber: property.titleNumber || property.title?.titleNumber,
        legalDescription: property.legalDescription || property.legal,
        address: property.address || property.civicAddress,
        landValue: property.assessment?.landValue || property.landValue || 0,
        improvementValue: property.assessment?.improvementValue || property.improvementValue || 0,
        totalAssessedValue: property.assessment?.totalValue || property.assessedValue || 0,
        propertyClass: property.propertyClass || property.classification,
        lotSize: property.lotSize || property.parcelSize || 0,
        yearBuilt: property.yearBuilt || property.constructionYear || 0,
        buildingArea: property.buildingArea || property.floorArea || 0,
        ownership: property.ownership || property.owners || [],
        charges: property.charges || [],
        zoning: property.zoning || '',
        source: 'LTSA Enterprise Account - Authentic Government Records',
        retrievedAt: new Date().toISOString()
      };
    } catch (error) {
      console.log(`❌ Error formatting LTSA data:`, error);
      return rawData;
    }
  }

  /**
   * Get BC Assessment data through LTSA partnership
   */
  async getBCAssessmentData(address: string, city: string): Promise<any | null> {
    try {
      console.log(`🏛️ LTSA Enterprise: Getting BC Assessment data for ${address}, ${city}`);

      const response = await fetch(`${this.baseUrl}/api/assessment/search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          address: `${address}, ${city}, BC`,
          includeHistory: true,
          includeComparables: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ LTSA Enterprise: Retrieved BC Assessment data`);
        return {
          ...data,
          source: 'BC Assessment via LTSA Enterprise Partnership',
          authentic: true
        };
      }

      return null;

    } catch (error) {
      console.log(`❌ LTSA Enterprise BC Assessment search failed:`, error);
      return null;
    }
  }

  /**
   * Check if enterprise credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.apiToken || (this.username && this.password));
  }

  /**
   * Test enterprise account connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/account/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        console.log(`✅ LTSA Enterprise account connection successful`);
        return true;
      }

      console.log(`❌ LTSA Enterprise account connection failed: ${response.status}`);
      return false;

    } catch (error) {
      console.log(`❌ LTSA Enterprise connection test failed:`, error);
      return false;
    }
  }
}