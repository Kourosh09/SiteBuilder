import { fetchArcGISPermits, type ArcGISConfig } from "./arcgis-base";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchSurrey(query: string) {
  // Direct API call for Surrey Development Applications
  const baseEndpoint = CITY_ENDPOINTS.surrey.split('?')[0];
  const whereClause = query ? `UPPER(ADDRESS) LIKE UPPER('%${query}%') OR UPPER(SITE_ADDRESS) LIKE UPPER('%${query}%')` : "1=1";
  const endpoint = `${baseEndpoint}?where=${encodeURIComponent(whereClause)}&outFields=*&f=json&resultRecordCount=100`;
  
  try {
    const r = await fetch(endpoint);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();

    const items: any[] = [];
    if (j.features) {
      for (const feat of j.features) {
        const attrs = feat.attributes || {};
        const normalized = {
          id: String(attrs.APP_NUMBER ?? attrs.OBJECTID ?? `SU-${Date.now()}-${Math.random()}`),
          address: String(attrs.ADDRESS ?? attrs.SITE_ADDRESS ?? "Unknown"),
          city: "Surrey",
          type: String(attrs.APP_TYPE ?? attrs.APPLICATION_TYPE ?? "Development Application"),
          status: String(attrs.STATUS ?? attrs.APP_STATUS ?? "Unknown"),
          submittedDate: attrs.SUBMIT_DATE ? new Date(attrs.SUBMIT_DATE).toISOString().split('T')[0] : null,
          issuedDate: attrs.APPROVAL_DATE ? new Date(attrs.APPROVAL_DATE).toISOString().split('T')[0] : null,
          lat: typeof attrs.LAT === "number" ? attrs.LAT : null,
          lng: typeof attrs.LNG === "number" ? attrs.LNG : null,
          source: endpoint,
          sourceUpdatedAt: new Date().toISOString()
        };
        items.push(normalized);
      }
    }
    
    return { city: "Surrey", items, rawSource: endpoint };
  } catch (error) {
    console.error("Surrey fetch error:", error);
    return { city: "Surrey", items: [], rawSource: endpoint };
  }