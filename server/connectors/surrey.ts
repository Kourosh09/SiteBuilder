import { fetchArcGISPermits, type ArcGISConfig } from "./arcgis-base";

export async function fetchSurrey(query: string) {
  // Surrey uses ArcGIS FeatureServer format - placeholder until real endpoint provided
  const config: ArcGISConfig = {
    baseUrl: "https://cosmos.surrey.ca/geo_ref/rest/services",
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