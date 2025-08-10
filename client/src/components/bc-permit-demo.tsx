import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, MapPin, Calendar, FileText } from "lucide-react";
import type { Permit } from "@/types/permit";

export default function BCPermitDemo() {
  const [query, setQuery] = useState("building");
  const [city, setCity] = useState("all");
  const [loading, setLoading] = useState(false);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const searchPermits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/permits/bc?q=${encodeURIComponent(query)}&city=${city}`);
      const data = await response.json();
      
      if (data.success) {
        setPermits(data.permits || []);
        setTotalCount(data.totalItems || data.count || 0);
      } else {
        setError(data.error || "Failed to fetch permits");
      }
    } catch (err) {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            BC Government Permit Data Demo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search real permit data from Vancouver, Burnaby, Surrey, and Maple Ridge
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                placeholder="e.g., building, renovation, permit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="input-search-query"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="vancouver">Vancouver</SelectItem>
                  <SelectItem value="burnaby">Burnaby</SelectItem>
                  <SelectItem value="surrey">Surrey</SelectItem>
                  <SelectItem value="maple ridge">Maple Ridge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Button 
                onClick={searchPermits}
                disabled={loading}
                className="w-full"
                data-testid="button-search-permits"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Search Permits
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {totalCount > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary font-medium">
                Found {totalCount} permits matching your search
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {permits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permits.slice(0, 12).map((permit, i) => (
            <Card key={permit.id || i} className="border border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{permit.type}</span>
                  </div>
                  <Badge 
                    variant={permit.status === "Issued" ? "default" : permit.status === "Approved" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {permit.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground truncate" title={permit.address}>
                  {permit.address}
                </p>
                <p className="text-xs text-muted-foreground">{permit.city}</p>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {permit.issuedDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Issued: {new Date(permit.issuedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {permit.lat && permit.lng && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{permit.lat.toFixed(4)}, {permit.lng.toFixed(4)}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  ID: {permit.id}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {permits.length > 12 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing first 12 of {permits.length} permits
          </p>
        </div>
      )}
    </div>
  );
}