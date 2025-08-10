import { PermitSchema, type Permit } from "@shared/schema";
import { buildFSQueryUrl, parseFSJson } from "../lib/arcgis";
import { CITY_ENDPOINTS } from "../lib/config";

export async function fetchSurrey(query: string) {
  const base = CITY_ENDPOINTS.surrey; // e.g. https://.../FeatureServer/0/query (base)
  const endpoint = buildFSQueryUrl(base, query, { resultRecordCount: 100, returnGeometry: true });
  const r = await fetch(endpoint);
  const j = await r.json();
  const rows = parseFSJson(j);
  const items: Permit[] = [];

  for (const r of rows) {
    const normalized = {
      id: String(r.PERMIT_ID ?? r.PERMITNUMBER ?? r.OBJECTID ?? `${r.ADDRESS ?? r.SITE_ADDRESS ?? "Unknown"}-${r.ISSUED_DATE ?? ""}`),
      address: String(r.ADDRESS ?? r.SITE_ADDRESS ?? r.CIVIC_ADDRESS ?? "Unknown"),
      city: "Surrey",
      type: String(r.PERMIT_TYPE ?? r.TYPE ?? "Permit"),
      status: String(r.STATUS ?? "Unknown"),
      submittedDate: r.APPLIED_DATE ?? null,
      issuedDate: r.ISSUED_DATE ?? null,
      lat: typeof r.__lat === "number" ? r.__lat : null,
      lng: typeof r.__lng === "number" ? r.__lng : null,
      source: endpoint,
      sourceUpdatedAt: r.LAST_UPDATED ?? r.LASTUPDATE ?? null,
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
  }

  return { city: "Surrey", items, rawSource: endpoint };
}