// MLS Integration for Licensed Realtors
// Ready for real MLS API credentials

interface MLSCredentials {
  loginUrl: string;
  username: string;
  password: string;
  boardId?: string;
}

interface MLSListing {
  mlsNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  price: number;
  listDate: string;
  soldDate?: string;
  status: 'Active' | 'Sold' | 'Expired' | 'Pending';
  propertyType: string;
  propertySubType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;
  yearBuilt?: number;
  daysOnMarket: number;
  photos: string[];
  virtualTour?: string;
  description: string;
  features: string[];
  agentInfo: {
    name: string;
    brokerage: string;
    phone: string;
    email: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class MLSService {
  private credentials: MLSCredentials;
  
  constructor() {
    this.credentials = {
      loginUrl: process.env.REBGV_LOGIN_URL || '',
      username: process.env.MLS_USERNAME || '',
      password: process.env.MLS_PASSWORD || '',
      boardId: process.env.MLS_BOARD_ID || 'REBGV'
    };
  }

  // Authenticate with REBGV MLS system  
  async authenticate(): Promise<string> {
    if (!this.credentials.username || !this.credentials.password) {
      console.log("REBGV MLS credentials not configured");
      throw new Error('MLS credentials not configured - username and password required');
    }

    try {
      console.log("🔐 Authenticating with REBGV MLS system...");
      
      // REBGV RETS Login URL (Real Estate Transaction Standard)
      const loginUrl = this.credentials.loginUrl || 'https://data.rebgv.org/rets/login';
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BuildwiseAI/1.0 (RETS)',
          'RETS-Version': 'RETS/1.8'
        },
        body: new URLSearchParams({
          'LoginType': 'Login',
          'UserAgent': 'BuildwiseAI/1.0',
          'RETSVersion': 'RETS/1.8'
        }),
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BuildwiseAI/1.0 (RETS)',
          'RETS-Version': 'RETS/1.8'
        }
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log("✅ REBGV MLS authentication successful");
        // Extract session info from RETS response
        return response.headers.get('set-cookie') || 'authenticated';
      }

      console.log("⚠️ REBGV MLS authentication failed, credentials may need verification");
      throw new Error(`MLS authentication failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('REBGV MLS authentication error:', error);
      throw new Error('Failed to authenticate with REBGV MLS system');
    }
  }

  private getAuthHeaders() {
    const credentials = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`
    };
  }

  // Search active listings
  async searchListings(
    city: string,
    propertyType?: string,
    minPrice?: number,
    maxPrice?: number,
    limit: number = 50
  ): Promise<MLSListing[]> {
    try {
      const token = await this.authenticate();
      
      const searchParams = new URLSearchParams({
        city: city,
        status: 'Active',
        limit: limit.toString()
      });

      if (propertyType) searchParams.append('propertyType', propertyType);
      if (minPrice) searchParams.append('minPrice', minPrice.toString());
      if (maxPrice) searchParams.append('maxPrice', maxPrice.toString());

      const response = await fetch(`${this.credentials.loginUrl}/listings/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MLS search failed: ${response.status}`);
      }

      const data = await response.json();
      return this.formatListings(data.listings || data.results);
    } catch (error) {
      console.error('MLS search error:', error);
      throw new Error('Failed to search MLS listings');
    }
  }

  // Get sold comparables
  async getSoldComparables(
    address: string,
    city: string,
    radius: number = 1, // km
    months: number = 12
  ): Promise<MLSListing[]> {
    try {
      const token = await this.authenticate();
      
      const searchParams = new URLSearchParams({
        address: address,
        city: city,
        radius: radius.toString(),
        status: 'Sold',
        soldWithin: `${months}M`
      });

      const response = await fetch(`${this.credentials.loginUrl}/comparables?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MLS comparables search failed: ${response.status}`);
      }

      const data = await response.json();
      return this.formatListings(data.comparables || data.results);
    } catch (error) {
      console.error('MLS comparables error:', error);
      throw new Error('Failed to get sold comparables');
    }
  }

  // Get property details by MLS number
  async getPropertyDetails(mlsNumber: string): Promise<MLSListing> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.credentials.loginUrl}/property/${mlsNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MLS property details failed: ${response.status}`);
      }

      const data = await response.json();
      return this.formatListing(data.property || data);
    } catch (error) {
      console.error('MLS property details error:', error);
      throw new Error('Failed to get property details');
    }
  }

  // Get market statistics
  async getMarketStats(city: string, propertyType?: string) {
    try {
      const token = await this.authenticate();
      
      const searchParams = new URLSearchParams({
        city: city
      });
      if (propertyType) searchParams.append('propertyType', propertyType);

      const response = await fetch(`${this.credentials.loginUrl}/market/stats?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MLS market stats failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLS market stats error:', error);
      throw new Error('Failed to get market statistics');
    }
  }

  // Format MLS data to standard interface
  private formatListings(rawListings: any[]): MLSListing[] {
    return rawListings.map(listing => this.formatListing(listing));
  }

  private formatListing(rawListing: any): MLSListing {
    return {
      mlsNumber: rawListing.mlsNumber || rawListing.mls_number,
      address: rawListing.address || rawListing.property_address,
      city: rawListing.city,
      province: rawListing.province || 'BC',
      postalCode: rawListing.postalCode || rawListing.postal_code,
      price: parseFloat(rawListing.price || rawListing.list_price),
      listDate: rawListing.listDate || rawListing.list_date,
      soldDate: rawListing.soldDate || rawListing.sold_date,
      status: rawListing.status,
      propertyType: rawListing.propertyType || rawListing.property_type,
      propertySubType: rawListing.propertySubType || rawListing.property_sub_type,
      bedrooms: parseInt(rawListing.bedrooms) || 0,
      bathrooms: parseFloat(rawListing.bathrooms) || 0,
      sqft: parseInt(rawListing.sqft || rawListing.square_feet) || 0,
      lotSize: rawListing.lotSize || rawListing.lot_size || '',
      yearBuilt: rawListing.yearBuilt ? parseInt(rawListing.yearBuilt) : undefined,
      daysOnMarket: parseInt(rawListing.daysOnMarket || rawListing.dom) || 0,
      photos: rawListing.photos || [],
      virtualTour: rawListing.virtualTour || rawListing.virtual_tour,
      description: rawListing.description || rawListing.public_remarks || '',
      features: rawListing.features || [],
      agentInfo: {
        name: rawListing.agentInfo?.name || rawListing.listing_agent_name || '',
        brokerage: rawListing.agentInfo?.brokerage || rawListing.listing_brokerage || '',
        phone: rawListing.agentInfo?.phone || rawListing.listing_agent_phone || '',
        email: rawListing.agentInfo?.email || rawListing.listing_agent_email || ''
      },
      coordinates: rawListing.coordinates || rawListing.lat && rawListing.lng ? {
        lat: parseFloat(rawListing.lat),
        lng: parseFloat(rawListing.lng)
      } : undefined
    };
  }
}

// Export singleton instance
export const mlsService = new MLSService();