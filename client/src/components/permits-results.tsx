import React from "react";
import type { Permit } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PermitsResults({ items }: { items: Permit[] }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No results.</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.slice(0, 30).map((p) => (
        <Card key={p.id} className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <span className="truncate">{p.address}</span>
              <Badge>{p.city}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="font-medium">Type:</span> {p.type}</div>
            <div><span className="font-medium">Status:</span> {p.status}</div>
            {p.issuedDate && <div><span className="font-medium">Issued:</span> {new Date(p.issuedDate).toLocaleDateString()}</div>}
            {p.submittedDate && <div><span className="font-medium">Submitted:</span> {new Date(p.submittedDate).toLocaleDateString()}</div>}
            <a href={p.source} target="_blank" rel="noreferrer" className="text-blue-600 underline">View source</a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}