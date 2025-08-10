// Test script for BC permit services with your exact data structure patterns
import type { Permit } from "@shared/schema";
import { PermitSchema } from "@shared/schema";

// Test the exact pattern you provided for Burnaby
export async function testBurnabyPattern(query: string): Promise<{ city: string; items: Permit[]; rawSource: string }> {
  // Using your exact endpoint pattern
  const endpoint = `https://example.burnaby.ca/opendata/permits?q=${encodeURIComponent(query)}`;
  
  // Mock data matching your expected structure for testing
  const mockData = [
    {
      PERMIT_NO: "BP2024-001",
      ADDRESS: "123 Main Street",
      PERMIT_TYPE: "Building",
      STATUS: "Issued",
      APPLIED_DATE: "2024-01-15T10:00:00Z",
      ISSUED_DATE: "2024-02-01T14:30:00Z",
      LAT: 49.2488,
      LNG: -122.9805,
      LAST_UPDATED: "2024-02-01T15:00:00Z"
    },
    {
      PERMIT_NO: "BP2024-002", 
      ADDRESS: "456 Oak Avenue",
      PERMIT_TYPE: "Electrical",
      STATUS: "Pending",
      APPLIED_DATE: "2024-01-20T09:00:00Z",
      ISSUED_DATE: null,
      LAT: 49.2510,
      LNG: -122.9820,
      LAST_UPDATED: "2024-01-20T10:00:00Z"
    }
  ];

  const items: Permit[] = [];
  for (const r of Array.isArray(mockData) ? mockData : []) {
    const normalized = {
      id: String(r.PERMIT_NO ?? `${r.ADDRESS}-${r.ISSUED_DATE ?? ""}`),
      address: String(r.ADDRESS ?? "Unknown"),
      city: "Burnaby",
      type: String(r.PERMIT_TYPE ?? "Permit"),
      status: String(r.STATUS ?? "Unknown"),
      submittedDate: r.APPLIED_DATE ?? null,
      issuedDate: r.ISSUED_DATE ?? null,
      lat: typeof r.LAT === "number" ? r.LAT : null,
      lng: typeof r.LNG === "number" ? r.LNG : null,
      source: endpoint,
      sourceUpdatedAt: r.LAST_UPDATED ?? null,
    };
    const parsed = PermitSchema.safeParse(normalized);
    if (parsed.success) items.push(parsed.data);
  }

  return { city: "Burnaby", items, rawSource: endpoint };
}

// Test all patterns work correctly
export async function testAllPatterns() {
  console.log("Testing permit data patterns...");
  
  try {
    const burnabyTest = await testBurnabyPattern("building");
    console.log(`Burnaby pattern test: ${burnabyTest.items.length} items processed`);
    
    if (burnabyTest.items.length > 0) {
      console.log("Sample Burnaby permit:", JSON.stringify(burnabyTest.items[0], null, 2));
    }
    
    return { success: true, burnaby: burnabyTest };
  } catch (error) {
    console.error("Pattern test failed:", error);
    return { success: false, error };
  }
}