/**
 * Enhanced query builder for BC municipal FeatureServer APIs
 * Provides SQL injection protection and comprehensive address field matching
 */

export function buildWhere(q: string): string {
  const s = (q || "").trim();
  if (!s || s.length < 3) return "1=1"; // broad fetch; we'll filter client-side

  const esc = s.replace(/'/g, "''"); // SQL escape single quotes
  const clauses = [
    `UPPER(ADDRESS) LIKE UPPER('%${esc}%')`,
    `UPPER(SITE_ADDRESS) LIKE UPPER('%${esc}%')`,
    `UPPER(CIVIC_ADDRESS) LIKE UPPER('%${esc}%')`,
    `UPPER(STREET_NAME) LIKE UPPER('%${esc}%')`,
    `UPPER(STREET_TYPE) LIKE UPPER('%${esc}%')`,
    `UPPER(ROAD_NAME) LIKE UPPER('%${esc}%')`,
  ];
  return clauses.join(" OR ");
}

export interface FeatureServerParams {
  baseUrl: string;
  query: string;
  orderBy?: string;
  maxResults?: number;
}

export function buildFeatureServerUrl({ 
  baseUrl, 
  query, 
  orderBy = "OBJECTID", 
  maxResults = 100 
}: FeatureServerParams): string {
  const params = new URLSearchParams({
    where: buildWhere(query),
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326", // WGS84 geographic coordinate system
    orderByFields: orderBy,
    resultRecordCount: maxResults.toString(),
    f: "json"
  });
  
  return `${baseUrl}?${params.toString()}`;
}