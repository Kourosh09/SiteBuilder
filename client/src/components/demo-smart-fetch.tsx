import React, { useMemo, useState } from "react";
import { smartFetch } from "@/lib/smartFetch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building, Calendar, MapPin, Clock } from "lucide-react";
import type { Permit, SmartFetchResponse, PermitSchema } from "@/types/permit";
import PermitsResults from "@/components/permits-results";

// Enhanced renderer for permit data
function RenderPayload({ payload }: { payload: any }) {
  if (!payload) return null;

  // Enhanced permit data visualization with dedicated component
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === "object") {
    const permits = payload as Permit[];
    
    return (
      <div className="space-y-4">
        <PermitsResults items={permits} />
        
        {/* Fallback table for raw data view */}
        <details className="mt-4">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            View raw data table
          </summary>
          <div className="mt-2 w-full overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(permits[0]).slice(0, 8).map((c) => (
                    <th key={c} className="text-left font-medium p-2">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permits.slice(0, 20).map((row: any, i: number) => (
                  <tr key={i} className="border-t">
                    {Object.keys(permits[0]).slice(0, 8).map((c) => (
                      <td key={c} className="p-2 align-top text-xs">{String(row?.[c] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    );
  }

  // If it's a plain object, pretty-print
  if (typeof payload === "object") {
    return (
      <pre className="text-xs bg-muted rounded-md p-3 overflow-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    );
  }

  // Fallback: show as text
  return (
    <pre className="text-xs bg-muted rounded-md p-3 overflow-auto">{String(payload)}</pre>
  );
}

export default function DemoSmartFetch() {
  const [q, setQ] = useState("permits near city hall");
  const [city, setCity] = useState("Maple Ridge");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const confidenceColor = useMemo(() => {
    const c = Number(out?.confidence ?? 0);
    if (c >= 0.9) return "bg-emerald-600";
    if (c >= 0.75) return "bg-blue-600";
    if (c >= 0.5) return "bg-amber-600";
    return "bg-red-600";
  }, [out]);

  async function run() {
    setErr(null);
    setLoading(true);
    try {
      const data = await smartFetch(q, city);
      setOut(data);
    } catch (e: any) {
      setOut(null);
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-10 shadow-sm border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>AI Smart Fetch</span>
          {out?.confidence !== undefined && (
            <Badge className={`${confidenceColor}`}>
              confidence: {Number(out.confidence).toFixed(2)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a query… e.g., building permits near city hall"
            className="flex-1"
          />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g., Maple Ridge)"
            className="sm:w-60"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search
          </Button>
        </div>

        {err && (
          <div className="text-sm text-red-600">
            {err}
          </div>
        )}

        {out && (
          <>
            <Separator />
            {!out.ok && out.notes && (
              <div className="text-sm text-amber-600">
                {out.notes}
              </div>
            )}
            <PermitsResults items={Array.isArray(out.payload) ? out.payload : []} />

            {Array.isArray(out.provenance) && out.provenance.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Provenance</div>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">source</th>
                        <th className="text-left p-2">ok</th>
                        <th className="text-left p-2">fetched_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {out.provenance.slice(0, 10).map((p: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 break-all">{p.source}</td>
                          <td className="p-2">{String(p.ok)}</td>
                          <td className="p-2">{new Date((p.fetched_at ?? 0) * 1000).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}