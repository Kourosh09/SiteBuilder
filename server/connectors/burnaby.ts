import type { Permit } from "@shared/schema";
import { PermitSchema } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchBurnaby(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Use centralized endpoint configuration
  const configuredEndpoint = CITY_ENDPOINTS.burnaby;
  const endpoint = configuredEndpoint.startsWith('<PASTE') 
    ? `https://data.burnaby.ca/api/records/1.0/search/?dataset=building-permits&q=${encodeURIComponent(query)}&rows=100`
    : configuredEndpoint;
  
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items: Permit[] = [];
    
    // Handle both direct array and records structure
    const records = Array.isArray(data) ? data : (data?.records || []);
    
    for (const r of records) {
      // Handle both direct field access and nested fields structure
      const fields = r.fields || r;
      
      const normalized = {
        id: String(fields.PERMIT_NO || fields.permit_no || fields.id || `BUR-${fields.ADDRESS || fields.address}-${fields.ISSUED_DATE || fields.issued_date || ""}`),
        address: String(fields.ADDRESS || fields.address || fields.site_address || "Unknown"),
        city: "Burnaby",
        type: String(fields.PERMIT_TYPE || fields.permit_type || fields.type || "Permit"),
        status: String(fields.STATUS || fields.status || "Unknown"),
        submittedDate: fields.APPLIED_DATE || fields.applied_date || fields.application_date || fields.submitted_date || null,
        issuedDate: fields.ISSUED_DATE || fields.issued_date || fields.issue_date || null,
        lat: typeof fields.LAT === "number" ? fields.LAT : 
             (typeof fields.latitude === "number" ? fields.latitude : 
              (r.geometry?.coordinates?.[1] || null)),
        lng: typeof fields.LNG === "number" ? fields.LNG : 
             (typeof fields.longitude === "number" ? fields.longitude : 
              (r.geometry?.coordinates?.[0] || null)),
        source: endpoint,
        sourceUpdatedAt: fields.LAST_UPDATED || fields.last_updated || r.record_timestamp || new Date().toISOString(),
      };
      
      const parsed = PermitSchema.safeParse(normalized);
      if (parsed.success) {
        items.push(parsed.data);
      } else {
        console.warn(`Burnaby permit validation failed for ${normalized.id}:`, parsed.error.errors);
      }
    }

    return { city: "Burnaby", items, rawSource: endpoint };
  } catch (error) {
    console.error("Burnaby API error:", error);
    return { city: "Burnaby", items: [], rawSource: endpoint };
  }
}