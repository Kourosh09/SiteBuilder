import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";
import { buildFeatureServerUrl } from "../lib/queryBuilder";

export async function fetchSurrey(query: string) {
  // Enhanced FeatureServer query for Surrey Development Applications
  const baseEndpoint = CITY_ENDPOINTS.surrey.split('?')[0];
  const endpoint = buildFeatureServerUrl({
    baseUrl: baseEndpoint,
    query: query,
    orderBy: "SUBMIT_DATE DESC",
    maxResults: 100
  });
  
  try {
    const r = await fetch(endpoint);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();

    const items: any[] = [];
    if (j.features) {
      for (const feat of j.features) {
        const attrs = feat.attributes || {};
        // Extract coordinates from geometry (returnGeometry=true provides better location data)
        let lat = null, lng = null;
        if (feat.geometry?.x && feat.geometry?.y) {
          lat = feat.geometry.y;
          lng = feat.geometry.x;
        } else if (typeof attrs.LAT === "number" && typeof attrs.LNG === "number") {
          lat = attrs.LAT;
          lng = attrs.LNG;
        }

        const normalized = {
          id: String(attrs.APP_NUMBER ?? attrs.OBJECTID ?? `SU-${Date.now()}-${Math.random()}`),
          address: String(attrs.ADDRESS ?? attrs.SITE_ADDRESS ?? "Unknown"),
          city: "Surrey",
          type: String(attrs.APP_TYPE ?? attrs.APPLICATION_TYPE ?? "Development Application"),
          status: String(attrs.STATUS ?? attrs.APP_STATUS ?? "Unknown"),
          submittedDate: attrs.SUBMIT_DATE ? new Date(attrs.SUBMIT_DATE).toISOString().split('T')[0] : null,
          issuedDate: attrs.APPROVAL_DATE ? new Date(attrs.APPROVAL_DATE).toISOString().split('T')[0] : null,
          lat: lat,
          lng: lng,
          source: endpoint,
          sourceUpdatedAt: new Date().toISOString()
        };
        const ok = PermitSchema.safeParse(normalized);
        if (ok.success) items.push(ok.data);
        else console.warn("Surrey validation failed:", ok.error.errors);
      }
    }
    
    return { city: "Surrey", items, rawSource: endpoint };
  } catch (error) {
    console.error("Surrey fetch error:", error);
    return { city: "Surrey", items: [], rawSource: endpoint };
  }
}