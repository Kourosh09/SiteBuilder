/**
 * ArcGIS FeatureServer helpers: build URL, validate, sample fetch, normalize lat/lng
 */

export type FSOptions = {
  where?: string;
  outFields?: string;           // default "*"
  returnGeometry?: boolean;     // default true
  outSR?: number;               // default 4326
  resultRecordCount?: number;   // default 100
  f?: "json";                   // default "json"
};

export function buildFSQueryUrl(baseQueryUrl: string, q: string, opts: FSOptions = {}) {
  const u = new URL(baseQueryUrl); // should end with /FeatureServer/<layerId>/query
  const where = (opts.where ?? buildWhere(q)).trim();
  u.searchParams.set("where", where || "1=1");
  u.searchParams.set("outFields", opts.outFields ?? "*");
  u.searchParams.set("returnGeometry", String(opts.returnGeometry ?? true));
  u.searchParams.set("outSR", String(opts.outSR ?? 4326));
  u.searchParams.set("resultRecordCount", String(opts.resultRecordCount ?? 100));
  u.searchParams.set("f", opts.f ?? "json");
  return u.toString();
}

export function buildWhere(q: string) {
  const s = (q || "").trim();
  if (s.length < 3) return "1=1"; // short/fuzzy → fetch broadly, filter client-side if needed
  const esc = s.replace(/'/g, "''");
  const fields = [
    "ADDRESS","SITE_ADDRESS","CIVIC_ADDRESS",
    "STREET_NAME","STREET_TYPE","ROAD_NAME",
    "PROJECT_NAME","DESCRIPTION"
  ];
  return fields
    .map(f => `(UPPER(${f}) LIKE UPPER('%${esc}%'))`)
    .join(" OR ");
}

/** Quick structural checks for a FeatureServer /query URL */
export function validateFSUrl(url: string) {
  // Support both FeatureServer and MapServer patterns (ArcGIS uses both)
  const ok = /^https?:\/\/.+\/(FeatureServer|MapServer)\/\d+\/query(\?|$)/i.test(url);
  const issues: string[] = [];
  if (!ok) issues.push("URL must end with /FeatureServer/<layerId>/query or /MapServer/<layerId>/query");
  try { new URL(url); } catch { issues.push("Invalid URL format"); }
  return { ok, issues };
}

/** Normalizes ArcGIS FeatureServer response to a simple array of attributes + geometry */
export function parseFSJson(json: any) {
  const features = Array.isArray(json?.features) ? json.features : [];
  return features.map((f: any) => {
    const attrs = f?.attributes ?? {};
    const geom = f?.geometry ?? {};
    let lat: number | null = null;
    let lng: number | null = null;
    if (typeof geom.y === "number" && typeof geom.x === "number") {
      lat = geom.y; lng = geom.x;
    } else if (Array.isArray(geom?.coordinates) && geom.coordinates.length >= 2) {
      lng = Number(geom.coordinates[0]); lat = Number(geom.coordinates[1]);
    }
    return { ...attrs, __lat: lat, __lng: lng };
  });
}