import { PermitSchema, type Permit } from "@shared/schema";

export async function fetchVancouver(query: string) {
  const endpoint = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&rows=100&q=${encodeURIComponent(query)}`;
  const r = await fetch(endpoint);
  const j = await r.json();
  const items: Permit[] = [];

  for (const rec of j.records ?? []) {
    const f = rec.fields || {};
    const normalized = {
      id: String(f.permitnumber ?? rec.recordid),
      address: String(f.address ?? "Unknown"),
      city: "Vancouver",
      type: String(f.typeofwork ?? "Permit"),
      status: "Issued", // dataset is "issued permits"
      submittedDate: null,
      issuedDate: f.issuedate ?? null,
      lat: Array.isArray(f.geo_point_2d) ? f.geo_point_2d[0] : null,
      lng: Array.isArray(f.geo_point_2d) ? f.geo_point_2d[1] : null,
      source: endpoint,
      sourceUpdatedAt: null
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
  }

  return { city: "Vancouver", items, rawSource: endpoint };
}