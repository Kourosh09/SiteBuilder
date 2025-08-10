import { PermitSchema, type Permit } from "@shared/schema";
import { buildFSQueryUrl, parseFSJson } from "../lib/arcgis";
import { CITY_ENDPOINTS } from "../lib/config";

export async function fetchMapleRidge(query: string) {
  const base = CITY_ENDPOINTS.mapleRidge;
  const endpoint = buildFSQueryUrl(base, query, { resultRecordCount: 100, returnGeometry: true });
  
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();

  // Use enhanced FeatureServer parser with normalized geometry
  const parsedRows = parseFSJson(j);
  const items: Permit[] = [];

  for (const r of parsedRows) {
    const normalized = {
      id: String(r.PermitNumber ?? r.PERMIT_ID ?? r.OBJECTID ?? `${r.ADDRESS ?? r.House + " " + r.Street ?? "Unknown"}-${r.IssueDate ?? ""}`),
      address: r.House && r.Street ? `${r.House} ${r.Street}` : String(r.ADDRESS ?? "Unknown"),
      city: "Maple Ridge",
      type: String(r.FolderDesc ?? r.FolderType ?? r.PERMIT_TYPE ?? "Building Permit"),
      status: String(r.StatusDescription ?? r.STATUS ?? "Unknown"),
      submittedDate: r.InDate ?? r.APPLIED_DATE ?? null,
      issuedDate: r.IssueDate ?? r.ISSUED_DATE ?? null,
      lat: typeof r.__lat === "number" ? r.__lat : null,
      lng: typeof r.__lng === "number" ? r.__lng : null,
      source: endpoint,
      sourceUpdatedAt: r.LAST_UPDATED ?? r.LASTUPDATE ?? null,
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
  }

  return { city: "Maple Ridge", items, rawSource: endpoint };
}