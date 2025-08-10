import type { Permit } from "@shared/schema";
import { PermitSchema } from "@shared/schema";
import { fetchVancouver } from "./connectors/vancouver";
import { fetchMapleRidge } from "./connectors/mapleRidge";

// Streamlined BC connector system - Vancouver (live) + Maple Ridge (ArcGIS pattern)
// Future: fetchBurnaby can be added when scraping or API becomes available

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

// Wrapper functions for new connectors to match expected interface
export async function fetchCoquitlamService(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  try {
    const items = await fetchCoquitlam(query);
    return { city: "Coquitlam", items, rawSource: "https://data.coquitlam.ca/api/permits" };
  } catch (error) {
    console.error("Coquitlam service error:", error);
    return { city: "Coquitlam", items: [], rawSource: "https://data.coquitlam.ca/api/permits" };
  }
}

export async function fetchSurreyService(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  try {
    const items = await fetchSurreyConnector(query);
    return { city: "Surrey", items, rawSource: "https://data.surrey.ca/api/permits" };
  } catch (error) {
    console.error("Surrey service error:", error);
    return { city: "Surrey", items: [], rawSource: "https://data.surrey.ca/api/permits" };
  }
}

// Vancouver now uses direct connector - no wrapper needed

// Unified permit fetcher for all BC municipalities
export async function fetchAllBCPermits(query: string): Promise<{
  totalItems: number;
  cities: Array<{ city: string; items: Permit[]; rawSource: string }>;
  aggregatedItems: Permit[];
}> {
  const results = await Promise.allSettled([
    fetchMapleRidge(query),
    fetchVancouver(query),
    // later: fetchBurnaby(query) if we scrape or get an API
  ]);

  const cities = results
    .filter((result): result is PromiseFulfilledResult<{ city: string; items: Permit[]; rawSource: string }> => 
      result.status === 'fulfilled')
    .map(result => result.value);

  const aggregatedItems = cities.flatMap(cityData => cityData.items);
  
  return {
    totalItems: aggregatedItems.length,
    cities,
    aggregatedItems,
  };
}