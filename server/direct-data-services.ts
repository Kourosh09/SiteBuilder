/**
 * Direct Data Integration Services
 * Direct access to MLS, GIS, and Municipal data sources
 */

export interface DirectDataConfig {
  ddfCredentials: {
    username: string;
    password: string;
    clientId: string;
    clientSecret: string;
  };
  ltsaCredentials: {
    username: string;
    password: string;
    apiKey?: string;
  };
  gisServices: {
    databc: {
      baseUrl: string;
      apiKey?: string;
    };
    vancouver: {
      baseUrl: string;
      apiKey?: string;
    };
  };
  municipalAPIs: {
    vancouver: {
      baseUrl: string;
      apiKey?: string;
    };
    burnaby: {
      baseUrl: string;
      apiKey?: string;
    };
    richmond: {
      baseUrl: string;
      apiKey?: string;
    };
    surrey: {
      baseUrl: string;
      apiKey?: string;
    };
  };
}

export interface GISPropertyData {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  parcelId: string;
  lotSize: number;
  zoning: string;
  landUse: string;
  topography: string;
  environmentalConstraints: string[];
}

export interface LTSAPropertyData {
  pid: string;
  legalDescription: string;
  propertyClass: string;
  taxationArea: string;
  landDistrictLot: string;
  plan: string;
  district: string;
  marketValueLand: number;
  marketValueImprovements: number;
  assessedValue: number;
  lotSize?: number;
  yearBuilt?: number;
  buildingArea?: number;
}

export interface MunicipalData {
  municipality: string;
  zoning: {
    current: string;
    permitted: string[];
    restrictions: string[];
  };
  permits: {
    active: any[];
    recent: any[];
    applications: any[];
  };
  development: {
    applications: any[];
    approvals: any[];
    densityBonuses: any[];
  };
  transit: {
    nearbyStops: any[];
    frequentService: boolean;
    distance: number;
  };
}

/**
 * DataBC GIS Service Integration
 * Access to BC government spatial data
 */
export class DataBCService {
  private baseUrl = 'https://catalogue.data.gov.bc.ca/api/3/action';
  private wfsUrl = 'https://openmaps.gov.bc.ca/geo/pub/wfs';

  async getParcelData(coordinates: { lat: number; lng: number }): Promise<GISPropertyData | null> {
    try {
      console.log('🗺️ Querying DataBC for parcel information');
      
      // Query BC Parcel Fabric
      const wfsQuery = `${this.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&outputFormat=json&CQL_FILTER=INTERSECTS(GEOMETRY,POINT(${coordinates.lng} ${coordinates.lat}))`;
      
      const response = await fetch(wfsQuery);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const parcel = data.features[0];
        
        return {
          coordinates: {
            latitude: coordinates.lat,
            longitude: coordinates.lng
          },
          parcelId: parcel.properties.PARCEL_FABRIC_POLY_ID || '',
          lotSize: parcel.properties.FEATURE_AREA_SQM || 0,
          zoning: await this.getZoningFromDataBC(coordinates),
          landUse: parcel.properties.PARCEL_CLASS || '',
          topography: await this.getTopographyData(coordinates),
          environmentalConstraints: await this.getEnvironmentalConstraints(coordinates)
        };
      }
    } catch (error) {
      console.log('DataBC query failed:', error);
    }
    
    return null;
  }

  private async getZoningFromDataBC(coordinates: { lat: number; lng: number }): Promise<string> {
    try {
      // Query BC Land Use zoning data
      const zoningQuery = `${this.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=pub:WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP&outputFormat=json&CQL_FILTER=INTERSECTS(GEOMETRY,POINT(${coordinates.lng} ${coordinates.lat}))`;
      
      const response = await fetch(zoningQuery);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].properties.ZONING || 'Unknown';
      }
    } catch (error) {
      console.log('Zoning data query failed:', error);
    }
    
    return 'Unknown';
  }

  private async getTopographyData(coordinates: { lat: number; lng: number }): Promise<string> {
    try {
      // Query BC Digital Elevation Model
      const elevationQuery = `${this.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=pub:WHSE_BASEMAPPING.TRIM_EBM_CONTOURS&outputFormat=json&CQL_FILTER=INTERSECTS(GEOMETRY,POINT(${coordinates.lng} ${coordinates.lat}))`;
      
      const response = await fetch(elevationQuery);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const elevation = data.features[0].properties.ELEVATION || 0;
        return `Elevation: ${elevation}m`;
      }
    } catch (error) {
      console.log('Topography data query failed:', error);
    }
    
    return 'Level terrain';
  }

  private async getEnvironmentalConstraints(coordinates: { lat: number; lng: number }): Promise<string[]> {
    const constraints: string[] = [];
    
    try {
      // Query environmental layers
      const environmentalQueries = [
        { layer: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW', constraint: 'Protected Area' },
        { layer: 'WHSE_WATER_MANAGEMENT.WLS_COMMUNITY_WS_PUB_SVW', constraint: 'Watershed' },
        { layer: 'WHSE_ENVIRONMENTAL_MONITORING.ENVCAN_HYDROMETRIC_STN_SP', constraint: 'Water Body' }
      ];
      
      for (const query of environmentalQueries) {
        const envQuery = `${this.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=pub:${query.layer}&outputFormat=json&CQL_FILTER=INTERSECTS(GEOMETRY,POINT(${coordinates.lng} ${coordinates.lat}))`;
        
        const response = await fetch(envQuery);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          constraints.push(query.constraint);
        }
      }
    } catch (error) {
      console.log('Environmental constraints query failed:', error);
    }
    
    return constraints;
  }
}

/**
 * Municipal API Service Integration
 * Direct access to municipal planning data
 */
export class MunicipalAPIService {
  
  async getMunicipalData(address: string, city: string, coordinates?: { lat: number; lng: number }): Promise<MunicipalData | null> {
    const cityLower = city.toLowerCase();
    
    switch (cityLower) {
      case 'vancouver':
        return this.getVancouverData(address, coordinates);
      case 'burnaby':
        return this.getBurnabyData(address, coordinates);
      case 'richmond':
        return this.getRichmondData(address, coordinates);
      case 'surrey':
        return this.getSurreyData(address, coordinates);
      default:
        return this.getGenericMunicipalData(city, address);
    }
  }

  private async getVancouverData(address: string, coordinates?: { lat: number; lng: number }): Promise<MunicipalData | null> {
    try {
      console.log('🏛️ Querying Vancouver Open Data API');
      
      // Vancouver Open Data endpoints
      const baseUrl = 'https://opendata.vancouver.ca/api/records/1.0/search/';
      
      // Get zoning data
      const zoningResponse = await fetch(`${baseUrl}?dataset=zoning-districts-and-labels&q=${encodeURIComponent(address)}`);
      const zoningData = await zoningResponse.json();
      
      // Get development permits
      const permitsResponse = await fetch(`${baseUrl}?dataset=development-permits&q=${encodeURIComponent(address)}`);
      const permitsData = await permitsResponse.json();
      
      // Get building permits
      const buildingResponse = await fetch(`${baseUrl}?dataset=issued-building-permits&q=${encodeURIComponent(address)}`);
      const buildingData = await buildingResponse.json();
      
      return {
        municipality: 'Vancouver',
        zoning: {
          current: zoningData.records[0]?.fields?.zone_name || 'Unknown',
          permitted: zoningData.records[0]?.fields?.permitted_uses?.split(',') || [],
          restrictions: zoningData.records[0]?.fields?.restrictions?.split(',') || []
        },
        permits: {
          active: buildingData.records.filter((r: any) => r.fields.permit_status === 'Issued') || [],
          recent: buildingData.records.slice(0, 10) || [],
          applications: permitsData.records.filter((r: any) => r.fields.application_status === 'Under Review') || []
        },
        development: {
          applications: permitsData.records || [],
          approvals: permitsData.records.filter((r: any) => r.fields.application_status === 'Approved') || [],
          densityBonuses: []
        },
        transit: await this.getTransitData(coordinates || { lat: 0, lng: 0 })
      };
    } catch (error) {
      console.log('Vancouver API query failed:', error);
      return null;
    }
  }

  private async getBurnabyData(address: string, coordinates?: { lat: number; lng: number }): Promise<MunicipalData | null> {
    try {
      console.log('🏛️ Querying Burnaby municipal data');
      
      // Burnaby uses ArcGIS REST services
      const baseUrl = 'https://cosmos.burnaby.ca/arcgis/rest/services';
      
      // Query zoning data
      const zoningUrl = `${baseUrl}/OpenData/Zoning/MapServer/0/query?where=1%3D1&geometry=${coordinates?.lng},${coordinates?.lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outFields=*&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson`;
      
      const zoningResponse = await fetch(zoningUrl);
      const zoningData = await zoningResponse.json();
      
      return {
        municipality: 'Burnaby',
        zoning: {
          current: zoningData.features?.[0]?.attributes?.ZONE || 'Unknown',
          permitted: [],
          restrictions: []
        },
        permits: {
          active: [],
          recent: [],
          applications: []
        },
        development: {
          applications: [],
          approvals: [],
          densityBonuses: []
        },
        transit: await this.getTransitData(coordinates || { lat: 0, lng: 0 })
      };
    } catch (error) {
      console.log('Burnaby API query failed:', error);
      return null;
    }
  }

  private async getRichmondData(address: string, coordinates?: { lat: number; lng: number }): Promise<MunicipalData | null> {
    try {
      console.log('🏛️ Querying Richmond municipal data');
      
      // Richmond Open Data
      const baseUrl = 'https://data.richmond.ca/api/records/1.0/search/';
      
      const zoningResponse = await fetch(`${baseUrl}?dataset=zoning&q=${encodeURIComponent(address)}`);
      const zoningData = await zoningResponse.json();
      
      return {
        municipality: 'Richmond',
        zoning: {
          current: zoningData.records[0]?.fields?.zone_code || 'Unknown',
          permitted: [],
          restrictions: []
        },
        permits: {
          active: [],
          recent: [],
          applications: []
        },
        development: {
          applications: [],
          approvals: [],
          densityBonuses: []
        },
        transit: await this.getTransitData(coordinates || { lat: 0, lng: 0 })
      };
    } catch (error) {
      console.log('Richmond API query failed:', error);
      return null;
    }
  }

  private async getSurreyData(address: string, coordinates?: { lat: number; lng: number }): Promise<MunicipalData | null> {
    try {
      console.log('🏛️ Querying Surrey municipal data');
      
      // Surrey Open Data
      const baseUrl = 'https://data.surrey.ca/api/records/1.0/search/';
      
      const zoningResponse = await fetch(`${baseUrl}?dataset=zoning&q=${encodeURIComponent(address)}`);
      const zoningData = await zoningResponse.json();
      
      return {
        municipality: 'Surrey',
        zoning: {
          current: zoningData.records[0]?.fields?.zone_name || 'Unknown',
          permitted: [],
          restrictions: []
        },
        permits: {
          active: [],
          recent: [],
          applications: []
        },
        development: {
          applications: [],
          approvals: [],
          densityBonuses: []
        },
        transit: await this.getTransitData(coordinates || { lat: 0, lng: 0 })
      };
    } catch (error) {
      console.log('Surrey API query failed:', error);
      return null;
    }
  }

  private async getGenericMunicipalData(city: string, address: string): Promise<MunicipalData> {
    return {
      municipality: city,
      zoning: {
        current: 'RS-1',
        permitted: ['Single Family'],
        restrictions: []
      },
      permits: {
        active: [],
        recent: [],
        applications: []
      },
      development: {
        applications: [],
        approvals: [],
        densityBonuses: []
      },
      transit: await this.getTransitData({ lat: 0, lng: 0 })
    };
  }

  private async getTransitData(coordinates: { lat: number; lng: number }) {
    try {
      // TransLink GTFS data integration would go here
      // For now, return basic structure
      return {
        nearbyStops: [],
        frequentService: false,
        distance: 500
      };
    } catch (error) {
      return {
        nearbyStops: [],
        frequentService: false,
        distance: 999
      };
    }
  }
}

/**
 * LTSA (Land Title and Survey Authority) Service Integration
 * Direct access to BC land title records and property ownership data
 */
export class LTSAService {
  private baseUrl = 'https://ltsa.ca/api'; // LTSA API endpoint
  private myLTSAUrl = 'https://www.myltsa.ca/api'; // myLTSA web service
  
  async getPropertyByPID(pid: string): Promise<LTSAPropertyData | null> {
    try {
      console.log(`🏛️ Querying LTSA for PID: ${pid}`);
      
      // LTSA myLTSA web service for property details
      const titleSearchUrl = `${this.myLTSAUrl}/titleSearch`;
      
      const response = await fetch(titleSearchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          searchType: 'PID',
          searchValue: pid,
          includeAssessment: true,
          includePropertyDetails: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return this.parseLTSAResponse(data);
      }
    } catch (error) {
      console.log('LTSA PID search failed:', error);
    }
    
    return null;
  }
  
  async getPropertyByAddress(address: string, city: string): Promise<LTSAPropertyData | null> {
    try {
      console.log(`🏛️ Querying LTSA for address: ${address}, ${city}`);
      
      // LTSA address search
      const addressSearchUrl = `${this.myLTSAUrl}/addressSearch`;
      
      const response = await fetch(addressSearchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          streetAddress: address,
          city: city,
          province: 'BC'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.properties && data.properties.length > 0) {
          // Get detailed title information for the first matching property
          return this.getPropertyByPID(data.properties[0].pid);
        }
      }
    } catch (error) {
      console.log('LTSA address search failed:', error);
    }
    
    return null;
  }
  
  private parseLTSAResponse(data: any): LTSAPropertyData {
    return {
      pid: data.pid || '',
      legalDescription: data.legalDescription || '',
      propertyClass: data.propertyClass || '',
      taxationArea: data.taxationArea || '',
      landDistrictLot: data.landDistrictLot || '',
      plan: data.plan || '',
      district: data.district || '',
      marketValueLand: data.marketValueLand || 0,
      marketValueImprovements: data.marketValueImprovements || 0,
      assessedValue: data.assessedValue || 0,
      lotSize: data.lotSize,
      yearBuilt: data.yearBuilt,
      buildingArea: data.buildingArea
    };
  }
  
  async getParcelHistory(pid: string): Promise<any[]> {
    try {
      console.log(`📜 Querying LTSA parcel history for PID: ${pid}`);
      
      const historyUrl = `${this.myLTSAUrl}/parcelHistory`;
      
      const response = await fetch(historyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pid })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }
    } catch (error) {
      console.log('LTSA parcel history query failed:', error);
    }
    
    return [];
  }
}

/**
 * Enhanced Property Data Service with Direct Integrations including LTSA
 */
export class EnhancedPropertyDataService {
  private dataBCService = new DataBCService();
  private municipalService = new MunicipalAPIService();
  private ltsaService = new LTSAService();

  async getComprehensivePropertyData(address: string, city: string) {
    console.log(`🔍 Gathering comprehensive data for ${address}, ${city}`);
    
    // First, get coordinates for the property
    const coordinates = await this.geocodeAddress(address, city);
    
    // Parallel data fetching from all direct sources
    const [gisData, municipalData, mlsData, ltsaData] = await Promise.all([
      this.dataBCService.getParcelData(coordinates),
      this.municipalService.getMunicipalData(address, city, coordinates),
      this.getMLSData(address, city),
      this.ltsaService.getPropertyByAddress(address, city)
    ]);
    
    return {
      coordinates,
      gis: gisData,
      municipal: municipalData,
      mls: mlsData,
      ltsa: ltsaData,
      integration: {
        dataQuality: this.assessDataQuality(gisData, municipalData, mlsData, ltsaData),
        sources: ['DataBC GIS', 'Municipal APIs', 'REALTOR.ca DDF', 'LTSA'],
        timestamp: new Date().toISOString()
      }
    };
  }

  private async geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number }> {
    try {
      // Use DataBC Geocoder or BC Address Geocoder
      const geocodeUrl = `https://geocoder.api.gov.bc.ca/addresses.json?addressString=${encodeURIComponent(address + ', ' + city + ', BC')}`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return { lat: coords[1], lng: coords[0] };
      }
    } catch (error) {
      console.log('Geocoding failed:', error);
    }
    
    // Fallback coordinates for BC municipalities
    const fallbackCoords: { [key: string]: { lat: number; lng: number } } = {
      'vancouver': { lat: 49.2827, lng: -123.1207 },
      'burnaby': { lat: 49.2488, lng: -122.9805 },
      'richmond': { lat: 49.1666, lng: -123.1336 },
      'surrey': { lat: 49.1913, lng: -122.8490 },
      'maple ridge': { lat: 49.2192, lng: -122.6060 }
    };
    
    return fallbackCoords[city.toLowerCase()] || { lat: 49.2827, lng: -123.1207 };
  }

  private async getMLSData(address: string, city: string) {
    // Use existing DDF integration
    const { DDFService } = await import('./mls-integration');
    const ddfService = new DDFService();
    
    try {
      const listings = await ddfService.getPropertyListings({ city, limit: 10 });
      return listings || [];
    } catch (error) {
      console.log('MLS data fetch failed:', error);
      return [];
    }
  }

  private assessDataQuality(gisData: any, municipalData: any, mlsData: any, ltsaData?: any): string {
    let quality = 'Good';
    let sources = 0;
    
    if (gisData) sources++;
    if (municipalData) sources++;
    if (mlsData && mlsData.length > 0) sources++;
    if (ltsaData) sources++;
    
    if (sources === 4) quality = 'Excellent';
    else if (sources === 3) quality = 'Very Good';
    else if (sources === 2) quality = 'Good';
    else if (sources === 1) quality = 'Fair';
    else quality = 'Limited';
    
    return quality;
  }
}