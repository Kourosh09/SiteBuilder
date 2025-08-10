import { PermitSchema } from "@shared/schema";

export async function fetchCoquitlam(query: string) {
  try {
    // Placeholder URL - will be replaced with real Coquitlam API endpoint
    const url = `https://data.coquitlam.ca/api/permits?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle both direct arrays and nested records structure
    const records = Array.isArray(data) ? data : (data.records || data.result || []);
    
    return records.map((record: any) => {
      // Extract fields - adjust based on actual Coquitlam API structure
      const item = record.fields || record;
      
      return PermitSchema.parse({
        id: item.permit_id || item.id || item.PERMIT_ID || `coquitlam-${Date.now()}-${Math.random()}`,
        address: item.address || item.ADDRESS || item.permit_address || "Address not available",
        city: "Coquitlam",
        type: item.permit_type || item.type || item.PERMIT_TYPE || "General",
        status: item.status || item.STATUS || item.permit_status || "Unknown",
        submittedDate: item.submitted_date || item.date_submitted || item.SUBMITTED_DATE || new Date().toISOString(),
        issuedDate: item.issued_date || item.date_issued || item.ISSUED_DATE || null,
        lat: parseFloat(item.latitude || item.lat || item.LAT || "0") || null,
        lng: parseFloat(item.longitude || item.lng || item.LNG || "0") || null,
        source: url,
        sourceUpdatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error("Coquitlam API error:", error);
    return [];
  }
}