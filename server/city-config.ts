export const CITY_ENDPOINTS = {
  mapleRidge: "<PASTE FeatureServer /query URL here>",
  surrey:     "<PASTE FeatureServer /query URL here>",
  coquitlam:  "<PASTE FeatureServer /query URL here>",
  burnaby:    "<PASTE API/CSV URL or 'SCRAPE:<page URL>' here>",
};

/** Optional: per-city trust override (0–1) */
export const CITY_TRUST: Record<string, number> = {
  Vancouver: 0.9,
  "Maple Ridge": 0.9,
  Surrey: 0.9,
  Coquitlam: 0.9,
  Burnaby: 0.85, // bump once API is confirmed
};