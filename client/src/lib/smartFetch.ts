export async function smartFetch(query: string, city = "Maple Ridge", mode: "address" | "any" = "any") {
  const url = `/smart_fetch?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&mode=${mode}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}