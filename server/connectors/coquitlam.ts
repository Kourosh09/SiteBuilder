import { fetchArcGISPermits, type ArcGISConfig } from "./arcgis-base";

export async function fetchCoquitlam(query: string) {
  // Coquitlam uses ArcGIS FeatureServer format - placeholder until real endpoint provided
  const config: ArcGISConfig = {
    baseUrl: "https://mapping.coquitlam.ca/arcgis/rest/services",
    layerId: "0",
    cityName: "Coquitlam",
    fieldMappings: {
      id: "PERMIT_NO",
      address: "SITE_ADDRESS", 
      type: "PERMIT_TYPE",
      status: "PERMIT_STATUS",
      submittedDate: "DATE_SUBMITTED",
      issuedDate: "DATE_ISSUED",
      lat: "LAT",
      lng: "LONG"
    }
  };
  
  const result = await fetchArcGISPermits(query, config);
  return result.items;
}