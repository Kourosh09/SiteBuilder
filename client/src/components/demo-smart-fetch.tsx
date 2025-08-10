import React, { useState } from "react";
import { smartFetch } from "@/lib/smartFetch";

export default function DemoSmartFetch() {
  const [q, setQ] = useState("permits near city hall");
  const [city, setCity] = useState("Maple Ridge");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const data = await smartFetch(q, city);
      setOut(data);
    } catch (e: any) {
      setErr(String(e));
      setOut(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 12, marginTop: 24 }}>
      <h3 style={{ marginTop: 0 }}>AI Smart Fetch (live)</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Type a query…"
          style={{ flex: 1, minWidth: 240, padding: 8 }}
        />
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="City (e.g., Maple Ridge)"
          style={{ width: 200, padding: 8 }}
        />
        <button onClick={run} disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Loading…" : "Search"}
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>}

      <pre style={{ background: "#0b0b0b", color: "#c3f", padding: 12, marginTop: 12, borderRadius: 8, maxHeight: 300, overflow: "auto" }}>
        {out ? JSON.stringify(out, null, 2) : "// Results will appear here"}
      </pre>
    </div>
  );
}