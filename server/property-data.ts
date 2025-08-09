/**
 * Property Data Service - FREE Sources Only
 * Updated to use 100% free data sources with zero per-query costs
 */

export interface BCAssessmentData {
  pid: string;
  address: string;
  landValue: number;
  improvementValue: number;
  totalAssessedValue: number;
  lotSize: number;
  propertyType: string;
  yearBuilt: number;
  source: string;
}

export interface MLSData {
  mlsNumber: string;
  address: string;
  price: number;
  listDate: string;
  daysOnMarket: number;
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
  constructor() {
    console.log(`💰 PropertyDataService: Using 100% FREE data sources`);
  }

  /**
   * Get BC Assessment data using FREE sources only
   */
  async getBCAssessmentData(address: string, city: string): Promise<BCAssessmentData | null> {
    console.log(`📊 Searching for ${address} using FREE data sources only`);
    
    // Method 1: FREE Vancouver Open Data API (if Vancouver)
    if (city.toLowerCase().includes('vancouver')) {
      console.log(`🏛️ Attempting Vancouver Open Data API for ${address}, ${city}`);
      const vancouverData = await this.getVancouverOpenData(address, city);
      if (vancouverData) {
        console.log(`✅ Found FREE Vancouver Open Data for ${address}`);
        return vancouverData;
      }
    }

    // Method 2: FREE BC Assessment Public Search  
    console.log(`🏛️ Attempting FREE BC Assessment public search for ${address}, ${city}`);
    const bcAssessmentData = await this.getBCAssessmentPublicData(address, city);
    if (bcAssessmentData) {
      console.log(`✅ Found FREE BC Assessment public data for ${address}`);
      return bcAssessmentData;
    }

    // Method 3: FREE LTSA Basic Property Info
    console.log(`🏛️ Attempting FREE LTSA basic property info for ${address}, ${city}`);
    const ltsaFreeData = await this.getLTSAFreeData(address, city);
    if (ltsaFreeData) {
      console.log(`✅ Found FREE LTSA basic data for ${address}`);
      return ltsaFreeData;
    }

    // Method 4: Municipal Open Data APIs for other cities
    console.log(`🏛️ Checking ${city} municipal open data...`);
    const municipalData = await this.getMunicipalOpenData(address, city);
    if (municipalData) {
      console.log(`✅ Found FREE municipal data for ${address}`);
      return municipalData;
    }

    console.log(`❌ Property not found in any FREE data sources`);
    return null;
  }

  /**
   * Get property data from Vancouver Open Data API (FREE)
   */
  private async getVancouverOpenData(address: string, city: string): Promise<BCAssessmentData | null> {
    try {
      const apiUrl = `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/property-tax-report/records`;
      
      // Extract address components for search
      const addressMatch = address.match(/^(\d+)\s+(.+)/);
      if (!addressMatch) {
        console.log(`❌ Invalid address format: ${address}`);
        return null;
      }
      
      const [, civicNumber, streetPart] = addressMatch;
      
      // Convert address format to match Vancouver's database format
      // Example: "34th Avenue West" -> "34TH AVE W"
      const streetFormatted = streetPart
        .replace(/\b(avenue|ave)\b/gi, 'AVE')
        .replace(/\b(street|st)\b/gi, 'ST') 
        .replace(/\b(drive|dr)\b/gi, 'DR')
        .replace(/\b(road|rd)\b/gi, 'RD')
        .replace(/\b(west|w)\b/gi, 'W')
        .replace(/\b(east|e)\b/gi, 'E')
        .replace(/\b(north|n)\b/gi, 'N')
        .replace(/\b(south|s)\b/gi, 'S')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
      
      const params = new URLSearchParams({
        'where': `to_civic_number = '${civicNumber}' AND street_name like '%${streetFormatted}%'`,
        'limit': '5'
      });

      console.log(`🔍 Querying Vancouver Open Data: ${civicNumber} ${streetFormatted}`);
      const response = await fetch(`${apiUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Vancouver API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Vancouver API returned ${data.results?.length || 0} results`);
      
      if (data.results && data.results.length > 0) {
        const property = data.results[0]; // Take first exact match
        
        // Build full address from components
        const fullAddress = `${property.to_civic_number} ${property.street_name}`;
        console.log(`✅ Found Vancouver property: ${fullAddress}`);
        
        return {
          pid: property.pid || '',
          address: fullAddress + `, Vancouver, BC`,
          landValue: parseFloat(property.current_land_value) || 0,
          improvementValue: parseFloat(property.current_improvement_value) || 0, 
          totalAssessedValue: (parseFloat(property.current_land_value) || 0) + (parseFloat(property.current_improvement_value) || 0),
          lotSize: 0, // Not available in this dataset
          propertyType: property.zoning_classification || 'Residential',
          yearBuilt: parseInt(property.year_built) || 0,
          source: 'Vancouver Open Data (FREE)'
        };
      }
      
      return null;
    } catch (error) {
      console.log(`❌ Vancouver Open Data API failed:`, error);
      return null;
    }
  }

  /**
   * Find best address match from Vancouver Open Data results
   */
  private findBestAddressMatch(results: any[], targetAddress: string): { record: any, score: number } | null {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const result of results) {
      const record = result.record || result;
      const apiAddress = record.civic_address || '';
      
      const score = this.calculateAddressMatchScore(apiAddress, targetAddress);
      
      if (score > bestScore && score > 0.7) { // Require at least 70% match
        bestMatch = { record, score };
        bestScore = score;
      }
    }
    
    if (bestMatch) {
      console.log(`✅ Best address match: "${bestMatch.record.civic_address}" (score: ${bestMatch.score.toFixed(2)})`);
    }
    
    return bestMatch;
  }

  /**
   * Calculate address matching score (0-1)
   */
  private calculateAddressMatchScore(apiAddress: string, targetAddress: string): number {
    const normalize = (addr: string) => addr.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const apiNorm = normalize(apiAddress);
    const targetNorm = normalize(targetAddress);
    
    // Check for exact match first
    if (apiNorm === targetNorm) return 1.0;
    
    // Check if target is contained in API address
    if (apiNorm.includes(targetNorm)) return 0.9;
    
    // Calculate word overlap
    const apiWords = new Set(apiNorm.split(' '));
    const targetWords = new Set(targetNorm.split(' '));
    
    const intersection = new Set([...apiWords].filter(w => targetWords.has(w)));
    const union = new Set([...apiWords, ...targetWords]);
    
    return intersection.size / union.size;
  }

  /**
   * Get property data from BC Assessment public search (FREE)
   */
  private async getBCAssessmentPublicData(address: string, city: string): Promise<BCAssessmentData | null> {
    console.log(`📋 BC Assessment public search available for ${address}, ${city}`);
    console.log(`⚠️ Implementation note: Web scraping of BC Assessment public search needed`);
    
    // Return null for now - this maintains data integrity
    // while indicating the FREE source is available
    return null;
  }

  /**
   * Get FREE LTSA basic property information (ParcelMap BC)
   */
  private async getLTSAFreeData(address: string, city: string): Promise<BCAssessmentData | null> {
    console.log(`📋 LTSA ParcelMap BC: FREE property identification for ${address}, ${city}`);
    
    try {
      // LTSA FREE services:
      // 1. ParcelMap BC - Property boundaries and legal descriptions (FREE)
      // 2. BC Assessment Folios - Property identification via folio numbers (FREE)
      // 3. Common Property Records - Strata common property info (FREE)
      
      // Implement LTSA ParcelMap BC integration (FREE service)
      const ltsaData = await this.queryLTSAParcelMap(address, city);
      
      if (ltsaData && ltsaData.pid && ltsaData.pid !== 'LTSA-FREE-LOOKUP') {
        console.log(`✅ Found LTSA FREE property data: PID ${ltsaData.pid}`);
        return {
          pid: ltsaData.pid,
          address: `${address}, ${city}, BC`,
          landValue: 0, // LTSA ParcelMap doesn't provide assessment values
          improvementValue: 0, // Assessment data comes from other sources
          totalAssessedValue: 0, // Combined with Vancouver Open Data for complete profile
          lotSize: ltsaData.lotSize || 0,
          propertyType: ltsaData.propertyType || 'Property',
          yearBuilt: 0, // Not available in LTSA ParcelMap
          source: 'LTSA ParcelMap BC (FREE)'
        };
      }
      
      console.log(`⚠️ No LTSA free data found for ${address}, ${city}`);
      return null;
      
    } catch (error) {
      console.log(`❌ LTSA free data search failed:`, error);
      return null;
    }
  }

  /**
   * Query LTSA ParcelMap BC (FREE service)
   */
  private async queryLTSAParcelMap(address: string, city: string): Promise<BCAssessmentData | null> {
    try {
      // LTSA ParcelMap BC Web Service (FREE)
      // This service provides basic property identification without ownership details
      
      const baseUrl = 'https://maps.ltsa.ca/pmbc';
      
      // First, try to geocode the address to get coordinates
      const coords = await this.geocodeAddress(address, city);
      if (!coords) {
        console.log(`❌ Could not geocode address for LTSA lookup`);
        return null;
      }
      
      console.log(`🗺️ Querying LTSA ParcelMap at coordinates: ${coords.lat}, ${coords.lon}`);
      
      // Query LTSA ParcelMap BC for property at coordinates
      // Note: This is a simplified implementation - real LTSA API integration needed
      const ltsaResponse = await this.queryLTSAByCoordinates(coords.lat, coords.lon);
      
      if (ltsaResponse && ltsaResponse.pid) {
        return {
          pid: ltsaResponse.pid,
          address: `${address}, ${city}, BC`,
          landValue: 0, // Not available in free LTSA data
          improvementValue: 0, // Not available in free LTSA data
          totalAssessedValue: 0, // Not available in free LTSA data
          lotSize: ltsaResponse.lotSize || 0,
          propertyType: ltsaResponse.propertyType || 'Unknown',
          yearBuilt: 0, // Not available in free LTSA data
          source: 'LTSA ParcelMap BC (FREE)'
        };
      }
      
      return null;
      
    } catch (error) {
      console.log(`❌ LTSA ParcelMap query failed:`, error);
      return null;
    }
  }

  /**
   * Geocode address to coordinates for LTSA lookup
   */
  private async geocodeAddress(address: string, city: string): Promise<{lat: number, lon: number} | null> {
    try {
      // Use BC Government Geocoder (FREE)
      const geocodeUrl = `https://geocoder.api.gov.bc.ca/addresses.json`;
      const params = new URLSearchParams({
        addressString: `${address}, ${city}, BC`,
        maxResults: '1',
        outputFormat: 'json'
      });
      
      console.log(`🗺️ Geocoding address: ${address}, ${city}`);
      const response = await fetch(`${geocodeUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`BC Geocoder error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coords = feature.geometry.coordinates;
        console.log(`✅ Geocoded to: ${coords[1]}, ${coords[0]}`);
        
        return {
          lat: coords[1],
          lon: coords[0]
        };
      }
      
      return null;
      
    } catch (error) {
      console.log(`❌ Geocoding failed:`, error);
      return null;
    }
  }

  /**
   * Query LTSA ParcelMap BC (FREE service) by coordinates
   */
  private async queryLTSAByCoordinates(lat: number, lon: number): Promise<any> {
    try {
      // LTSA ParcelMap BC Public Map Service (FREE)
      // Base URL: https://parcelmapbc.ltsa.ca/pmsspub/
      
      console.log(`🗺️ Querying FREE LTSA ParcelMap BC at: ${lat}, ${lon}`);
      
      // LTSA ParcelMap BC REST API endpoints (FREE access)
      const ltsaBaseUrl = 'https://parcelmapbc.ltsa.ca/pmsspub/rest/services';
      
      // Query for parcel information at coordinates using LTSA's FREE service
      const identifyUrl = `${ltsaBaseUrl}/PMBC_Parcel/MapServer/identify`;
      const params = new URLSearchParams({
        'f': 'json',
        'tolerance': '3',
        'returnGeometry': 'false',
        'mapExtent': `${lon-0.001},${lat-0.001},${lon+0.001},${lat+0.001}`,
        'imageDisplay': '400,400,96',
        'geometry': `${lon},${lat}`,
        'geometryType': 'esriGeometryPoint',
        'sr': '4326',
        'layers': 'all'
      });
      
      const response = await fetch(`${identifyUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`LTSA ParcelMap BC error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 LTSA ParcelMap BC returned ${data.results?.length || 0} results`);
      
      if (data.results && data.results.length > 0) {
        const parcel = data.results[0];
        const attributes = parcel.attributes;
        
        console.log(`✅ Found LTSA parcel: PID ${attributes.PID}`);
        
        return {
          pid: attributes.PID || attributes.PARCEL_FABRIC_POLY_ID,
          lotSize: parseFloat(attributes.AREA_SQM) || 0,
          propertyType: attributes.OWNER_TYPE || 'Property',
          legalDescription: attributes.LEGAL_DESCRIPTION || '',
          planNumber: attributes.PLAN_NUMBER || '',
          municipality: attributes.MUNICIPALITY || '',
          ltsaSource: 'ParcelMap BC (FREE)',
          coordinates: { lat, lon }
        };
      }
      
      console.log(`⚠️ No LTSA parcel found at coordinates: ${lat}, ${lon}`);
      return null;
      
    } catch (error) {
      console.log(`❌ LTSA ParcelMap BC query failed:`, error);
      return null;
    }
  }

  /**
   * Get property data from municipal open data APIs (FREE)
   */
  private async getMunicipalOpenData(address: string, city: string): Promise<BCAssessmentData | null> {
    const cityLower = city.toLowerCase();
    
    // Check if city has known open data portal
    const openDataCities = ['surrey', 'burnaby', 'richmond', 'coquitlam'];
    
    if (cityLower.includes('vancouver')) {
      // Vancouver is handled separately in getVancouverOpenData
      console.log(`⚠️ Vancouver should be handled by getVancouverOpenData method`);
      return null;
    }
    
    if (openDataCities.some(c => cityLower.includes(c))) {
      console.log(`📋 ${city} municipal open data available for ${address}`);
      console.log(`⚠️ Implementation note: ${city} open data API integration needed`);
      return null;
    }
    
    console.log(`❌ No open data portal found for ${city}`);
    return null;
  }

  /**
   * Get MLS comparables for market analysis
   */
  async getMLSComparables(address: string, city: string, limit: number = 10): Promise<MLSData[]> {
    console.log(`📊 Fetching MLS comparables for ${address}, ${city}`);
    
    try {
      const { DDFService } = await import('./mls-integration');
      const ddfService = new DDFService();
      
      const listings = await ddfService.getPropertyListings({ 
        city, 
        limit 
      });
      
      return this.convertToMLSData(listings);
      
    } catch (error) {
      console.log(`❌ MLS comparables search failed:`, error);
      return [];
    }
  }

  /**
   * Convert DDF listings to standardized MLS format
   */
  private convertToMLSData(listings: any[]): MLSData[] {
    return listings.map((listing: any) => ({
      mlsNumber: listing.MlsNumber || listing.mlsNumber || '',
      address: listing.UnparsedAddress || listing.address || '',
      price: parseFloat(listing.ListPrice || listing.price) || 0,
      listDate: listing.ListingDate || listing.listDate || '',
      daysOnMarket: parseInt(listing.DaysOnMarket) || 0,
      propertyType: listing.PropertyType || listing.propertyType || 'Unknown',
      bedrooms: parseInt(listing.BedroomsTotal) || undefined,
      bathrooms: parseFloat(listing.BathroomsTotal) || undefined,
      squareFootage: parseInt(listing.LivingArea) || undefined
    }));
  }

  /**
   * Get complete property data with FREE sources + MLS
   */
  async getPropertyData(address: string, city: string): Promise<PropertyDataResult> {
    console.log(`🔍 Fetching comprehensive property data for ${address}, ${city}`);
    
    // Get BC Assessment data from FREE sources
    const bcAssessment = await this.getBCAssessmentData(address, city);
    
    // Get MLS comparables for market context
    const mlsComparables = await this.getMLSComparables(address, city);
    
    // Calculate market analysis
    const marketAnalysis = this.calculateMarketAnalysis(mlsComparables);
    
    return {
      bcAssessment,
      mlsComparables,
      marketAnalysis
    };
  }

  /**
   * Calculate market trends from MLS data
   */
  private calculateMarketAnalysis(comparables: MLSData[]) {
    if (comparables.length === 0) {
      return {
        averagePricePerSqFt: 0,
        marketTrend: 'stable' as const,
        averageDaysOnMarket: 0,
        priceRange: { min: 0, max: 0 }
      };
    }

    const prices = comparables.map(c => c.price).filter(p => p > 0);
    const daysOnMarket = comparables.map(c => c.daysOnMarket).filter(d => d > 0);

    return {
      averagePricePerSqFt: this.calculateAveragePricePerSqFt(comparables),
      marketTrend: this.determineTrend(comparables),
      averageDaysOnMarket: daysOnMarket.length > 0 ? 
        daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length : 0,
      priceRange: {
        min: Math.min(...prices) || 0,
        max: Math.max(...prices) || 0
      }
    };
  }

  private calculateAveragePricePerSqFt(comparables: MLSData[]): number {
    const validComps = comparables.filter(c => c.price > 0 && c.squareFootage && c.squareFootage > 0);
    if (validComps.length === 0) return 0;
    
    const totalPricePerSqFt = validComps.reduce((sum, comp) => 
      sum + (comp.price / comp.squareFootage!), 0);
    
    return Math.round(totalPricePerSqFt / validComps.length);
  }

  private determineTrend(comparables: MLSData[]): 'rising' | 'falling' | 'stable' {
    // Simple trend analysis based on days on market
    const avgDOM = comparables
      .filter(c => c.daysOnMarket > 0)
      .reduce((sum, c) => sum + c.daysOnMarket, 0) / comparables.length;
    
    if (avgDOM < 30) return 'rising';
    if (avgDOM > 60) return 'falling';
    return 'stable';
  }
}