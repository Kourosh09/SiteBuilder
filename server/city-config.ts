export const CITY_ENDPOINTS = {
  mapleRidge: "https://geoservices.mapleridge.ca/server/rest/services/DataCatalog/EconomicDevelopment/MapServer/0/query?where=1%3D1&outFields=*&f=json",
  surrey:     "https://gisservices.surrey.ca/arcgis/rest/services/OpenData/MapServer/14/query?where=1%3D1&outFields=*&f=json",
  coquitlam:  "SCRAPE:https://data.coquitlam.ca/",
  burnaby:    "https://data.burnaby.ca/api/3/action/datastore_search?resource_id=building-permits",
};

/** Optional: per-city trust override (0–1) */
export const CITY_TRUST: Record<string, number> = {
  Vancouver: 0.9,
  "Maple Ridge": 0.9,
  Surrey: 0.9,
  Coquitlam: 0.9,
  Burnaby: 0.85, // bump once API is confirmed
};