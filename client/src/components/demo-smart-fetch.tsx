import React, { useState } from "react";
import { smartFetch } from "@/lib/smartFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoSmartFetch() {
  const [q, setQ] = useState("permits near city hall");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const data = await smartFetch(q, "Maple Ridge");
      setOut(data);
    } catch (e) {
      setOut({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Smart Fetch Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Enter your query..."
            className="flex-1"
          />
          <Button onClick={run} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm max-h-80 overflow-auto">
          {out ? JSON.stringify(out, null, 2) : "// results will appear here"}
        </pre>
      </CardContent>
    </Card>
  );
}