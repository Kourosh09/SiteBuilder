import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Building2, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Ruler,
  Loader2,
  Home,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BCAssessmentData {
  pid: string;
  address: string;
  landValue: number;
  improvementValue: number;
  totalAssessedValue: number;
  lotSize: number;
  zoning?: string;
  propertyType: string;
  yearBuilt?: number;
  buildingArea?: number;
  legalDescription?: string;
}

interface MLSData {
  mlsNumber?: string;
  listPrice?: number;
  soldPrice?: number;
  daysOnMarket?: number;
  listDate?: Date;
  soldDate?: Date;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

interface PropertyDataResult {
  bcAssessment: BCAssessmentData | null;
  mlsComparables: MLSData[];
  marketAnalysis: {
    averagePricePerSqFt: number;
    marketTrend: 'rising' | 'falling' | 'stable';
    averageDaysOnMarket: number;
    priceRange: { min: number; max: number };
  };
}

export default function PropertyLookup() {
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyDataResult | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!address.trim() || !city.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both address and city.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/property/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: address.trim(),
          city: city.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setPropertyData(result.data);
        toast({
          title: "Property Data Retrieved",
          description: "BC Assessment and MLS data loaded successfully."
        });
      } else {
        throw new Error(result.error || "Lookup failed");
      }
    } catch (error) {
      console.error("Property lookup error:", error);
      toast({
        title: "Lookup Failed",
        description: error instanceof Error ? error.message : "Unable to retrieve property data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-emerald-600 bg-emerald-50';
      case 'falling': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  return (
    <section id="property-lookup" className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Search className="w-4 h-4" />
            <span>Property Data Intelligence</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            BC Assessment & MLS Lookup
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Access comprehensive property data including assessed values, zoning information, and market comparables
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-blue" />
              Property Search
            </CardTitle>
            <CardDescription>
              Enter a property address to retrieve BC Assessment and MLS data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lookup-address">Property Address</Label>
                <Input
                  id="lookup-address"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  data-testid="input-lookup-address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookup-city">City</Label>
                <Input
                  id="lookup-city"
                  placeholder="Vancouver"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="input-lookup-city"
                />
              </div>
            </div>

            <Button
              onClick={handleLookup}
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              size="lg"
              data-testid="button-property-lookup"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Looking up property data...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lookup Property Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {propertyData && (
          <div className="space-y-8">
            <Tabs defaultValue="assessment" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="assessment" data-testid="tab-assessment">BC Assessment</TabsTrigger>
                <TabsTrigger value="mls" data-testid="tab-mls">MLS Comps</TabsTrigger>
                <TabsTrigger value="market" data-testid="tab-market">Market Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="assessment" className="space-y-6">
                {propertyData.bcAssessment ? (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-blue" />
                        BC Assessment Data
                      </CardTitle>
                      <CardDescription>
                        Official assessed values and property details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">PID</p>
                          <p className="text-lg font-semibold" data-testid="text-pid">
                            {propertyData.bcAssessment.pid}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Land Value</p>
                          <p className="text-lg font-semibold text-emerald-600" data-testid="text-land-value">
                            {formatCurrency(propertyData.bcAssessment.landValue)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Improvement Value</p>
                          <p className="text-lg font-semibold" data-testid="text-improvement-value">
                            {formatCurrency(propertyData.bcAssessment.improvementValue)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Total Assessed</p>
                          <p className="text-lg font-semibold text-brand-blue" data-testid="text-total-assessed">
                            {formatCurrency(propertyData.bcAssessment.totalAssessedValue)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Lot Size</p>
                          <p className="text-lg font-semibold" data-testid="text-bc-lot-size">
                            {propertyData.bcAssessment.lotSize.toLocaleString()} sq ft
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Zoning</p>
                          <Badge variant="secondary" data-testid="badge-zoning">
                            {propertyData.bcAssessment.zoning || 'N/A'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Property Type</p>
                          <p className="text-lg font-semibold" data-testid="text-property-type">
                            {propertyData.bcAssessment.propertyType}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Year Built</p>
                          <p className="text-lg font-semibold" data-testid="text-year-built">
                            {propertyData.bcAssessment.yearBuilt || 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Building Area</p>
                          <p className="text-lg font-semibold" data-testid="text-building-area">
                            {propertyData.bcAssessment.buildingArea?.toLocaleString() || 'N/A'} sq ft
                          </p>
                        </div>
                      </div>
                      
                      {propertyData.bcAssessment.legalDescription && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-600">Legal Description</p>
                            <p className="text-sm text-neutral-700" data-testid="text-legal-description">
                              {propertyData.bcAssessment.legalDescription}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-lg">
                    <CardContent className="py-12 text-center">
                      <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">No BC Assessment data found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="mls" className="space-y-6">
                {propertyData.mlsComparables.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {propertyData.mlsComparables.map((comp, index) => (
                      <Card key={index} className="shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="w-5 h-5 text-brand-blue" />
                              <span>MLS #{comp.mlsNumber}</span>
                            </div>
                            <Badge variant="outline" data-testid={`badge-property-type-${index}`}>
                              {comp.propertyType}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Sold Price</p>
                              <p className="text-lg font-semibold text-emerald-600" data-testid={`text-sold-price-${index}`}>
                                {comp.soldPrice ? formatCurrency(comp.soldPrice) : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">List Price</p>
                              <p className="text-lg font-semibold" data-testid={`text-list-price-${index}`}>
                                {comp.listPrice ? formatCurrency(comp.listPrice) : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Days on Market</p>
                              <p className="text-lg font-semibold" data-testid={`text-days-market-${index}`}>
                                {comp.daysOnMarket || 'N/A'} days
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Square Footage</p>
                              <p className="text-lg font-semibold" data-testid={`text-square-footage-${index}`}>
                                {comp.squareFootage?.toLocaleString() || 'N/A'} sq ft
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Sold Date</p>
                              <p className="text-sm text-neutral-700" data-testid={`text-sold-date-${index}`}>
                                {formatDate(comp.soldDate)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Bed/Bath</p>
                              <p className="text-sm text-neutral-700" data-testid={`text-bed-bath-${index}`}>
                                {comp.bedrooms || 'N/A'} bed, {comp.bathrooms || 'N/A'} bath
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-lg">
                    <CardContent className="py-12 text-center">
                      <Home className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">No MLS comparables found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="market" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-brand-blue" />
                      Market Analysis
                    </CardTitle>
                    <CardDescription>
                      Analysis based on recent comparable sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Avg Price/Sq Ft</p>
                        <p className="text-2xl font-bold text-brand-blue" data-testid="text-avg-price-sqft">
                          {formatCurrency(propertyData.marketAnalysis.averagePricePerSqFt)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Market Trend</p>
                        <Badge 
                          className={`${getTrendColor(propertyData.marketAnalysis.marketTrend)} border-0`}
                          data-testid="badge-market-trend"
                        >
                          {getTrendIcon(propertyData.marketAnalysis.marketTrend)} {propertyData.marketAnalysis.marketTrend}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Avg Days on Market</p>
                        <p className="text-2xl font-bold" data-testid="text-avg-days-market">
                          {Math.round(propertyData.marketAnalysis.averageDaysOnMarket)} days
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Price Range</p>
                        <div className="text-sm text-neutral-700" data-testid="text-price-range">
                          <div>{formatCurrency(propertyData.marketAnalysis.priceRange.min)}</div>
                          <div>to {formatCurrency(propertyData.marketAnalysis.priceRange.max)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </section>
  );
}