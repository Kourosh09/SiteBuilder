import { fetchArcGISPermits, type ArcGISConfig } from "./arcgis-base";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchSurrey(query: string) {
  const endpoint = CITY_ENDPOINTS.surrey;
  const config: ArcGISConfig = {
    baseUrl: endpoint.split('/FeatureServer')[0] || "https://cosmos.surrey.ca/geo_ref/rest/services",
    layerId: "0",
    cityName: "Surrey",
    fieldMappings: {
      id: "PERMIT_ID",
      address: "ADDRESS",
      type: "PERMIT_TYPE",
      status: "STATUS", 
      submittedDate: "APPLICATION_DATE",
      issuedDate: "ISSUED_DATE",
      lat: "LATITUDE",
      lng: "LONGITUDE"
    }
  };
  
  const result = await fetchArcGISPermits(query, config);
  return result.items;
}