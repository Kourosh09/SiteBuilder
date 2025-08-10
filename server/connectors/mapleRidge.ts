import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchMapleRidge(query: string) {
  // Build query with address filtering
  const baseEndpoint = CITY_ENDPOINTS.mapleRidge.split('?')[0];
  const whereClause = query ? `UPPER(Street) LIKE UPPER('%${query}%') OR UPPER(House) LIKE UPPER('%${query}%')` : "1=1";
  const endpoint = `${baseEndpoint}?where=${encodeURIComponent(whereClause)}&outFields=*&f=json&resultRecordCount=100`;
  
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();

  const rows = j.features?.map((f: any) => ({ ...(f.attributes||{}), ...f })) ?? [];
  const items: Permit[] = [];

  for (const r of rows) {
    // Map Maple Ridge API fields to our schema
    const address = r.House && r.Street ? `${r.House} ${r.Street}` : String(r.ADDRESS ?? "Unknown");
    const issuedDate = r.IssueDate ? new Date(r.IssueDate).toISOString().split('T')[0] : null;
    const appliedDate = r.InDate ? new Date(r.InDate).toISOString().split('T')[0] : null;
    
    const normalized = {
      id: String(r.PermitNumber ?? r.OBJECTID ?? `MR-${Date.now()}-${Math.random()}`),
      address: address,
      city: "Maple Ridge",
      type: String(r.FolderDesc ?? r.FolderType ?? "Building Permit"),
      status: String(r.StatusDescription ?? "Unknown"),
      submittedDate: appliedDate,
      issuedDate: issuedDate,
      lat: typeof r.LAT === "number" ? r.LAT : null,
      lng: typeof r.LNG === "number" ? r.LNG : null,
      source: endpoint,
      sourceUpdatedAt: new Date().toISOString()
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
    else console.warn("Maple Ridge validation failed:", ok.error.errors);
  }

  return { city: "Maple Ridge", items, rawSource: endpoint };
}