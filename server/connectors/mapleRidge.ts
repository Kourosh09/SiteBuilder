import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";
import { buildWhere, buildFeatureServerQuery } from "../lib/queryBuilder";

export async function fetchMapleRidge(query: string) {
  // Build FeatureServer query using exact specification
  const baseEndpoint = CITY_ENDPOINTS.mapleRidge.split('?')[0];
  const whereClause = buildWhere(query);
  const endpoint = buildFeatureServerQuery(baseEndpoint, whereClause);
  
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();

  const rows = j.features?.map((f: any) => ({ ...(f.attributes||{}), ...f })) ?? [];
  const items: Permit[] = [];

  for (const r of rows) {
    // Map Maple Ridge API fields with enhanced geometry handling
    const address = r.House && r.Street ? `${r.House} ${r.Street}` : String(r.ADDRESS ?? "Unknown");
    const issuedDate = r.IssueDate ? new Date(r.IssueDate).toISOString().split('T')[0] : null;
    const appliedDate = r.InDate ? new Date(r.InDate).toISOString().split('T')[0] : null;
    
    // Extract coordinates from geometry (now returned due to returnGeometry=true)
    let lat = null, lng = null;
    if (r.geometry?.x && r.geometry?.y) {
      // Convert from UTM Zone 10N (EPSG:26910) to WGS84 if needed
      lat = r.geometry.y;
      lng = r.geometry.x;
    }
    
    const normalized = {
      id: String(r.PermitNumber ?? r.OBJECTID ?? `MR-${Date.now()}-${Math.random()}`),
      address: address,
      city: "Maple Ridge",
      type: String(r.FolderDesc ?? r.FolderType ?? "Building Permit"),
      status: String(r.StatusDescription ?? "Unknown"),
      submittedDate: appliedDate,
      issuedDate: issuedDate,
      lat: lat,
      lng: lng,
      source: endpoint,
      sourceUpdatedAt: new Date().toISOString()
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
    else console.warn("Maple Ridge validation failed:", ok.error.errors);
  }

  return { city: "Maple Ridge", items, rawSource: endpoint };
}