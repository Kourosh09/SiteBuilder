import { PermitSchema, type Permit } from "@shared/schema";
import { buildFSQueryUrl, parseFSJson } from "../lib/arcgis";
import { CITY_ENDPOINTS } from "../lib/config";

export async function fetchCoquitlam(query: string) {
  const base = CITY_ENDPOINTS.coquitlam; // e.g. https://.../FeatureServer/0/query
  const endpoint = buildFSQueryUrl(base, query, { resultRecordCount: 100, returnGeometry: true });
  const r = await fetch(endpoint);
  const j = await r.json();
  const rows = parseFSJson(j);
  const items: Permit[] = [];

  for (const rec of rows) {
    const p = {
      id: String(rec.PERMIT_ID ?? rec.PERMITNUMBER ?? rec.OBJECTID ?? `${rec.ADDRESS ?? rec.SITE_ADDRESS ?? "Unknown"}-${rec.ISSUED_DATE ?? ""}`),
      address: String(rec.ADDRESS ?? rec.SITE_ADDRESS ?? rec.CIVIC_ADDRESS ?? "Unknown"),
      city: "Coquitlam",
      type: String(rec.PERMIT_TYPE ?? rec.TYPE ?? "Permit"),
      status: String(rec.STATUS ?? "Unknown"),
      submittedDate: rec.APPLIED_DATE ?? null,
      issuedDate: rec.ISSUED_DATE ?? null,
      lat: typeof rec.__lat === "number" ? rec.__lat : null,
      lng: typeof rec.__lng === "number" ? rec.__lng : null,
      source: endpoint,
      sourceUpdatedAt: rec.LAST_UPDATED ?? rec.LASTUPDATE ?? null,
    };
    const ok = PermitSchema.safeParse(p);
    if (ok.success) items.push(ok.data);
  }

  return { city: "Coquitlam", items, rawSource: endpoint };
}