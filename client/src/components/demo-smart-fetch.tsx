import React, { useState } from "react";
import { smartFetch } from "@/lib/smartFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DemoSmartFetch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Vancouver");
  const [mode, setMode] = useState<"address" | "any">("any");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await smartFetch(query, city, mode);
      setResults(data);
    } catch (error) {
      console.error("Smart fetch error:", error);
      setResults({ success: false, error: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Fetch Demo</CardTitle>
          <CardDescription>
            Intelligent BC municipal permit search with city selection and filtering modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                data-testid="input-search-query"
                placeholder="e.g., building, main street, permit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger data-testid="select-city">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vancouver">Vancouver</SelectItem>
                  <SelectItem value="Maple Ridge">Maple Ridge</SelectItem>
                  <SelectItem value="Surrey">Surrey</SelectItem>
                  <SelectItem value="Coquitlam">Coquitlam</SelectItem>
                  <SelectItem value="All BC">All BC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Select value={mode} onValueChange={(value: "address" | "any") => setMode(value)}>
                <SelectTrigger data-testid="select-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Match</SelectItem>
                  <SelectItem value="address">Address Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            data-testid="button-search"
            onClick={handleSearch} 
            disabled={!query.trim() || loading}
            className="w-full"
          >
            {loading ? "Searching..." : "Search Permits"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Search Results
              {results.success && (
                <Badge variant="secondary">
                  {results.filtered} of {results.totalFound} permits
                </Badge>
              )}
            </CardTitle>
            {results.success && (
              <CardDescription>
                Query: "{results.query}" in {results.city} ({results.mode} mode)
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {results.success ? (
              <div className="space-y-3">
                {results.permits.length > 0 ? (
                  results.permits.slice(0, 10).map((permit: any, index: number) => (
                    <div 
                      key={permit.id || index}
                      data-testid={`permit-card-${index}`}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium" data-testid={`permit-address-${index}`}>
                            {permit.address}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {permit.type} • {permit.status}
                          </p>
                        </div>
                        <Badge variant="outline" data-testid={`permit-city-${index}`}>
                          {permit.city}
                        </Badge>
                      </div>
                      {permit.issuedDate && (
                        <p className="text-xs text-muted-foreground">
                          Issued: {new Date(permit.issuedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground" data-testid="text-no-results">
                    No permits found matching your criteria
                  </p>
                )}
                {results.permits.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing first 10 of {results.permits.length} results
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-600" data-testid="text-error">
                {results.error || "Search failed"}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}