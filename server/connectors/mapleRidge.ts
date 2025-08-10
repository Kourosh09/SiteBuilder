import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";
import { buildFSQueryUrl, parseFSJson, validateFSUrl } from "../lib/queryBuilder";

export async function fetchMapleRidge(query: string) {
  // Build FeatureServer query using enhanced helpers
  const baseEndpoint = CITY_ENDPOINTS.mapleRidge.split('?')[0];
  const endpoint = buildFSQueryUrl(baseEndpoint, query);
  
  // Validate URL structure
  const validation = validateFSUrl(endpoint);
  if (!validation.ok) {
    console.warn("Maple Ridge URL validation issues:", validation.issues);
  }
  
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();

  // Use enhanced FeatureServer parser with normalized geometry
  const parsedRows = parseFSJson(j);
  const items: Permit[] = [];

  for (const row of parsedRows) {
    // Map Maple Ridge API fields with normalized geometry from parser
    const address = row.House && row.Street ? `${row.House} ${row.Street}` : String(row.ADDRESS ?? "Unknown");
    const issuedDate = row.IssueDate ? new Date(row.IssueDate).toISOString().split('T')[0] : null;
    const appliedDate = row.InDate ? new Date(row.InDate).toISOString().split('T')[0] : null;
    
    const normalized = {
      id: String(row.PermitNumber ?? row.OBJECTID ?? `MR-${Date.now()}-${Math.random()}`),
      address: address,
      city: "Maple Ridge",
      type: String(row.FolderDesc ?? row.FolderType ?? "Building Permit"),
      status: String(row.StatusDescription ?? "Unknown"),
      submittedDate: appliedDate,
      issuedDate: issuedDate,
      lat: row.__lat,
      lng: row.__lng,
      source: endpoint,
      sourceUpdatedAt: new Date().toISOString()
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
    else console.warn("Maple Ridge validation failed:", ok.error.errors);
  }

  return { city: "Maple Ridge", items, rawSource: endpoint };
}