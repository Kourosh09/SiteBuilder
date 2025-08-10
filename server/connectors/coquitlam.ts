import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../lib/config";

export async function fetchCoquitlam(query: string) {
  const base = CITY_ENDPOINTS.coquitlam; 
  const endpoint = `${base}&rows=100&q=${encodeURIComponent(query)}`;
  
  try {
    const r = await fetch(endpoint);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const items: Permit[] = [];

    for (const rec of j.records ?? []) {
      const f = rec.fields || {};
      const p = {
        id: String(f.permit_number ?? f.permitnumber ?? rec.recordid ?? `${f.address ?? "Unknown"}-${f.issue_date ?? ""}`),
        address: String(f.address ?? f.site_address ?? "Unknown"),
        city: "Coquitlam",
        type: String(f.permit_type ?? f.typeofwork ?? "Permit"),
        status: String(f.status ?? "Unknown"),
        submittedDate: f.application_date ?? f.applied_date ?? null,
        issuedDate: f.issue_date ?? f.issuedate ?? null,
        lat: Array.isArray(f.geo_point_2d) ? f.geo_point_2d[0] : null,
        lng: Array.isArray(f.geo_point_2d) ? f.geo_point_2d[1] : null,
        source: endpoint,
        sourceUpdatedAt: null
      };
      const ok = PermitSchema.safeParse(p);
      if (ok.success) items.push(ok.data);
    }

    return { city: "Coquitlam", items, rawSource: endpoint };
  } catch (error) {
    console.error("Coquitlam API error:", error);
    return { city: "Coquitlam", items: [], rawSource: endpoint };
  }
}