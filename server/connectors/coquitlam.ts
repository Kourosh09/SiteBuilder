import { fetchArcGISPermits, type ArcGISConfig } from "./arcgis-base";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchCoquitlam(query: string) {
  const endpoint = CITY_ENDPOINTS.coquitlam;
  
  // Handle SCRAPE mode for Coquitlam
  if (endpoint.startsWith('SCRAPE:')) {
    console.log("Coquitlam scraping not yet implemented");
    return { city: "Coquitlam", items: [], rawSource: endpoint };
  }
  
  const config: ArcGISConfig = {
    baseUrl: endpoint.split('/FeatureServer')[0] || "https://mapping.coquitlam.ca/arcgis/rest/services", 
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