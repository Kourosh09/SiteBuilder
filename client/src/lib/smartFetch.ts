export function isGenericAddressToken(q: string) {
  const s = (q || "").trim().toLowerCase();
  if (s.length < 3) return true;
  const generic = ["rd","road","st","street","ave","avenue","blvd","lane","ln","dr","drive","hwy","highway","way","ct","court","pl","place"];
  return generic.includes(s);
}

export async function smartFetch(query: string, city = "Maple Ridge", mode: "address" | "any" = "any") {
  const url = `/smart_fetch?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&mode=${mode}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}