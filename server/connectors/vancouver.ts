import { PermitSchema } from "@shared/schema";

export async function fetchVancouver(query: string) {
  try {
    // Real Vancouver Open Data API endpoint
    const url = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&rows=100&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle Vancouver Open Data format with records array
    const records = data.records || [];
    
    return records.map((record: any) => {
      // Vancouver uses nested fields structure
      const fields = record.fields || {};
      
      return PermitSchema.parse({
        id: String(record.recordid || fields.permitnumber || `vancouver-${fields.propertyaddress || Date.now()}`),
        address: String(fields.propertyaddress || fields.address || "Address not available"),
        city: "Vancouver",
        type: String(fields.permitcategory || fields.typeofwork || fields.category || "Building"),
        status: "Issued", // Vancouver dataset contains only issued permits
        submittedDate: fields.applicationdate || null,
        issuedDate: fields.issuedate || fields.issued_date || null,
        lat: typeof fields.geom?.coordinates?.[1] === "number" ? fields.geom.coordinates[1] : 
             (record.geometry?.coordinates?.[1] || null),
        lng: typeof fields.geom?.coordinates?.[0] === "number" ? fields.geom.coordinates[0] : 
             (record.geometry?.coordinates?.[0] || null),
        source: url,
        sourceUpdatedAt: fields.extractdate || record.record_timestamp || new Date().toISOString()
      });
    });
  } catch (error) {
    console.error("Vancouver API error:", error);
    return [];
  }
}