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

export async function fetchVancouver(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Vancouver Open Data Portal - Issued Building Permits
  const endpoint = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&q=${encodeURIComponent(query)}&rows=100`;
  
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items: Permit[] = [];
    const records = data?.records || [];
    
    for (const record of records) {
      const fields = record.fields || {};
      const normalized = {
        id: String(record.recordid || fields.permitnumber || `VAN-${fields.propertyaddress || Date.now()}`),
        address: String(fields.propertyaddress || fields.address || "Unknown Address"),
        city: "Vancouver",
        type: String(fields.permitcategory || fields.typeofwork || fields.category || "Building"),
        status: "Issued", // Vancouver dataset contains only issued permits
        submittedDate: fields.applicationdate || null,
        issuedDate: fields.issuedate || fields.issued_date || null,
        lat: typeof fields.geom?.coordinates?.[1] === "number" ? fields.geom.coordinates[1] : 
             (record.geometry?.coordinates?.[1] || null),
        lng: typeof fields.geom?.coordinates?.[0] === "number" ? fields.geom.coordinates[0] : 
             (record.geometry?.coordinates?.[0] || null),
        source: endpoint,
        sourceUpdatedAt: fields.extractdate || record.record_timestamp || new Date().toISOString(),
      };
      
      const parsed = PermitSchema.safeParse(normalized);
      if (parsed.success) {
        items.push(parsed.data);
      } else {
        console.warn(`Vancouver permit validation failed:`, parsed.error.errors);
      }
    }

    return { city: "Vancouver", items, rawSource: endpoint };
  } catch (error) {
    console.error("Vancouver API error:", error);
    return { city: "Vancouver", items: [], rawSource: endpoint };
  }
}

export async function fetchBurnaby(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Burnaby Open Data Portal - Building Permits
  const endpoint = `https://data.burnaby.ca/api/records/1.0/search/?dataset=building-permits&q=${encodeURIComponent(query)}&rows=100`;
  
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

export async function fetchSurrey(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Surrey Open Data Portal - Development Applications
  const endpoint = `https://data.surrey.ca/api/records/1.0/search/?dataset=development-applications&q=${encodeURIComponent(query)}&rows=100`;
  
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items: Permit[] = [];
    const records = data?.records || [];
    
    for (const record of records) {
      const fields = record.fields || {};
      const normalized = {
        id: String(record.recordid || fields.application_number || `SUR-${fields.address || Date.now()}`),
        address: String(fields.address || fields.site_address || fields.civic_address || "Unknown Address"),
        city: "Surrey",
        type: String(fields.application_type || fields.permit_type || "Development"),
        status: String(fields.status || fields.application_status || "Unknown"),
        submittedDate: fields.submission_date || fields.application_date || null,
        issuedDate: fields.approval_date || fields.issued_date || null,
        lat: typeof fields.latitude === "number" ? fields.latitude : 
             (record.geometry?.coordinates?.[1] || null),
        lng: typeof fields.longitude === "number" ? fields.longitude : 
             (record.geometry?.coordinates?.[0] || null),
        source: endpoint,
        sourceUpdatedAt: fields.last_modified || record.record_timestamp || new Date().toISOString(),
      };
      
      const parsed = PermitSchema.safeParse(normalized);
      if (parsed.success) {
        items.push(parsed.data);
      } else {
        console.warn(`Surrey permit validation failed:`, parsed.error.errors);
      }
    }

    return { city: "Surrey", items, rawSource: endpoint };
  } catch (error) {
    console.error("Surrey API error:", error);
    return { city: "Surrey", items: [], rawSource: endpoint };
  }
}

// Unified permit fetcher for all BC municipalities
export async function fetchAllBCPermits(query: string): Promise<{
  totalItems: number;
  cities: Array<{ city: string; items: Permit[]; rawSource: string }>;
  aggregatedItems: Permit[];
}> {
  const cities = await Promise.all([
    fetchVancouver(query),
    fetchBurnaby(query),
    fetchSurrey(query),
    fetchMapleRidge(query),
  ]);

  const aggregatedItems = cities.flatMap(cityData => cityData.items);
  
  return {
    totalItems: aggregatedItems.length,
    cities,
    aggregatedItems,
  };
}