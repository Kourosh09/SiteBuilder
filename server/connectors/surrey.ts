import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";
import { buildFSQueryUrl, parseFSJson, validateFSUrl } from "../lib/queryBuilder";

export async function fetchSurrey(query: string) {
  // Enhanced FeatureServer query with validation
  const baseEndpoint = CITY_ENDPOINTS.surrey.split('?')[0];
  const endpoint = buildFSQueryUrl(baseEndpoint, query);
  
  // Validate URL structure
  const validation = validateFSUrl(endpoint);
  if (!validation.ok) {
    console.warn("Surrey URL validation issues:", validation.issues);
  }
  
  try {
    const r = await fetch(endpoint);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();

    // Use enhanced FeatureServer parser with normalized geometry
    const parsedRows = parseFSJson(j);
    const items: Permit[] = [];
    
    for (const row of parsedRows) {
      const normalized = {
        id: String(row.APP_NUMBER ?? row.OBJECTID ?? `SU-${Date.now()}-${Math.random()}`),
        address: String(row.ADDRESS ?? row.SITE_ADDRESS ?? "Unknown"),
        city: "Surrey",
        type: String(row.APP_TYPE ?? row.APPLICATION_TYPE ?? "Development Application"),
        status: String(row.STATUS ?? row.APP_STATUS ?? "Unknown"),
        submittedDate: row.SUBMIT_DATE ? new Date(row.SUBMIT_DATE).toISOString().split('T')[0] : null,
        issuedDate: row.APPROVAL_DATE ? new Date(row.APPROVAL_DATE).toISOString().split('T')[0] : null,
        lat: row.__lat,
        lng: row.__lng,
        source: endpoint,
        sourceUpdatedAt: new Date().toISOString()
      };
      const ok = PermitSchema.safeParse(normalized);
      if (ok.success) items.push(ok.data);
      else console.warn("Surrey validation failed:", ok.error.errors);
    }
    
    return { city: "Surrey", items, rawSource: endpoint };
  } catch (error) {
    console.error("Surrey fetch error:", error);
    return { city: "Surrey", items: [], rawSource: endpoint };
  }
}