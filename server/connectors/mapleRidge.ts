import { PermitSchema, type Permit } from "@shared/schema";
import { CITY_ENDPOINTS } from "../city-config";

export async function fetchMapleRidge(query: string) {
  const endpoint = CITY_ENDPOINTS.mapleRidge;
  const r = await fetch(endpoint);
  const j = await r.json();

  const rows = j.features?.map((f: any) => ({ ...(f.attributes||{}), ...f })) ?? [];
  const items: Permit[] = [];

  for (const r of rows) {
    const normalized = {
      id: String(r.PERMIT_ID ?? r.PERMITNUMBER ?? r.OBJECTID ?? `${r.ADDRESS}-${r.ISSUED_DATE ?? ""}`),
      address: String(r.ADDRESS ?? r.SITE_ADDRESS ?? "Unknown"),
      city: "Maple Ridge",
      type: String(r.PERMIT_TYPE ?? "Permit"),
      status: String(r.STATUS ?? "Unknown"),
      submittedDate: r.APPLIED_DATE ?? null,
      issuedDate: r.ISSUED_DATE ?? null,
      lat: typeof r.LAT === "number" ? r.LAT : null,
      lng: typeof r.LNG === "number" ? r.LNG : null,
      source: endpoint,
      sourceUpdatedAt: r.LAST_UPDATED ?? null
    };
    const ok = PermitSchema.safeParse(normalized);
    if (ok.success) items.push(ok.data);
  }

  return { city: "Maple Ridge", items, rawSource: endpoint };
}