/**
 * Centralized BC Municipal API Configuration
 */

export const CITY_ENDPOINTS = {
  vancouver: "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits",
  mapleRidge: "https://geoservices.mapleridge.ca/server/rest/services/DataCatalog/EconomicDevelopment/MapServer/0/query",
  surrey: "https://gisservices.surrey.ca/arcgis/rest/services/OpenData/Development_Applications/MapServer/0/query",
  coquitlam: "https://data.coquitlam.ca/api/records/1.0/search/?dataset=building-permits",
  burnaby: "SCRAPE:https://www.burnaby.ca/city-services/permits-licences/building-permits/permits-issued" // or API URL when available
};

export const CITY_TRUST_SCORES = {
  vancouver: 0.9,   // Primary data source with comprehensive coverage
  mapleRidge: 0.85, // Good FeatureServer with reliable data
  surrey: 0.85,     // Development applications with good coverage  
  burnaby: 0.8,     // OpenData portal with decent coverage
  coquitlam: 0.8    // OpenData portal with basic coverage
};