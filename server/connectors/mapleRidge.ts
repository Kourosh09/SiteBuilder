import type { Permit } from "@shared/schema";
import { PermitSchema } from "@shared/schema";

export async function fetchMapleRidge(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Maple Ridge Open Data Portal - Building Permits
  const endpoint = `https://data.mapleridge.ca/api/records/1.0/search/?dataset=building-permits&q=${encodeURIComponent(query)}&rows=100`;
  
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items: Permit[] = [];
    const records = data?.records || [];
    
    for (const record of records) {
      const fields = record.fields || {};
      const normalized = {
        id: String(record.recordid || fields.permit_number || `MR-${fields.address || Date.now()}`),
        address: String(fields.address || fields.site_address || fields.location || "Unknown Address"),
        city: "Maple Ridge",
        type: String(fields.permit_type || fields.type || fields.category || "Building"),
        status: String(fields.status || fields.permit_status || "Unknown"),
        submittedDate: fields.submitted_date || fields.application_date || null,
        issuedDate: fields.issued_date || fields.issue_date || fields.date_issued || null,
        lat: typeof fields.latitude === "number" ? fields.latitude : 
             (record.geometry?.coordinates?.[1] || null),
        lng: typeof fields.longitude === "number" ? fields.longitude : 
             (record.geometry?.coordinates?.[0] || null),
        source: endpoint,
        sourceUpdatedAt: fields.updated_at || record.record_timestamp || new Date().toISOString(),
      };
      
      const parsed = PermitSchema.safeParse(normalized);
      if (parsed.success) {
        items.push(parsed.data);
      } else {
        console.warn(`Maple Ridge permit validation failed:`, parsed.error.errors);
      }
    }

    return { city: "Maple Ridge", items, rawSource: endpoint };
  } catch (error) {
    console.error("Maple Ridge API error:", error);
    return { city: "Maple Ridge", items: [], rawSource: endpoint };
  }
}