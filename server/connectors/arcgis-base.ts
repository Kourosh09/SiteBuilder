import { PermitSchema, type Permit } from "@shared/schema";

export interface ArcGISConfig {
  baseUrl: string;
  layerId: string;
  cityName: string;
  fieldMappings: {
    id: string;
    address: string;
    type: string;
    status: string;
    submittedDate?: string;
    issuedDate?: string;
    lat?: string;
    lng?: string;
  };
}

export async function fetchArcGISPermits(query: string, config: ArcGISConfig): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  const endpoint = `${config.baseUrl}/FeatureServer/${config.layerId}/query`;
  const whereClause = query ? `${config.fieldMappings.address} LIKE '%${query}%'` : "1=1";
  const url = `${endpoint}?where=${encodeURIComponent(whereClause)}&outFields=*&f=json&resultRecordCount=100`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const items: Permit[] = [];
    
    for (const feature of data.features || []) {
      const attrs = feature.attributes || {};
      
      const normalized = {
        id: String(attrs[config.fieldMappings.id] || `${config.cityName.toLowerCase()}-${Date.now()}-${Math.random()}`),
        address: String(attrs[config.fieldMappings.address] || "Address not available"),
        city: config.cityName,
        type: String(attrs[config.fieldMappings.type] || "Permit"),
        status: String(attrs[config.fieldMappings.status] || "Unknown"),
        submittedDate: config.fieldMappings.submittedDate ? attrs[config.fieldMappings.submittedDate] : null,
        issuedDate: config.fieldMappings.issuedDate ? attrs[config.fieldMappings.issuedDate] : null,
        lat: config.fieldMappings.lat ? parseFloat(attrs[config.fieldMappings.lat]) || null : 
             (feature.geometry?.y || null),
        lng: config.fieldMappings.lng ? parseFloat(attrs[config.fieldMappings.lng]) || null : 
             (feature.geometry?.x || null),
        source: url,
        sourceUpdatedAt: new Date().toISOString()
      };
      
      const parsed = PermitSchema.safeParse(normalized);
      if (parsed.success) {
        items.push(parsed.data);
      }
    }
    
    return { city: config.cityName, items, rawSource: url };
  } catch (error) {
    console.error(`${config.cityName} ArcGIS API error:`, error);
    return { city: config.cityName, items: [], rawSource: url };
  }
}