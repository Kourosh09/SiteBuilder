import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Building, TrendingUp, MapPin, Download, Search, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePropertyData } from "@/hooks/usePropertyData";

interface PropertyAnalysisResult {
  propertyDetails: {
    address: string;
    assessedValue: number;
    lotSize: number;
    zoning: string;
    yearBuilt: number;
    buildingArea: number;
  };
  developmentAnalysis: {
    currentConfiguration: string;
    bill44Potential: {
      eligible: boolean;
      maxUnits: number;
      compliance: string;
    };
    bill47Potential: {
      eligible: boolean;
      reason: string;
      todZone: string;
    };
    recommendedDevelopment: {
      units: number;
      type: string;
      feasibilityScore: number;
      timeline: string;
    };
  };
  financialProjection: {
    acquisitionCost: number;
    developmentCost: number;
    totalInvestment: number;
    projectedValue: number;
    projectedProfit: number;
    roiPercentage: number;
    breakdownCosts: {
      demolition: number;
      construction: number;
      permits: number;
      professional: number;
    };
  };
  marketContext: {
    comparableSales: Array<{
      address: string;
      soldPrice: number;
      pricePerSqft: number;
      daysOnMarket: number;
    }>;
    marketTrend: string;
    averageDaysOnMarket: number;
    priceAppreciation: string;
  };
  nextSteps: string[];
  legalConsiderations: string[];
}

export default function AIPropertyAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PropertyAnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    currentValue: "",
    lotSize: "",
    currentUse: "single-family",
    proposedUse: "multi-family"
  });
  const { toast } = useToast();
  const { propertyData, hasPropertyData, setPropertyData } = usePropertyData();

  // Auto-populate form from stored property data
  useEffect(() => {
    if (hasPropertyData && propertyData) {
      setFormData({
        address: propertyData.address,
        city: propertyData.city,
        currentValue: propertyData.currentValue?.toString() || "",
        lotSize: propertyData.lotSize.toString(),
        currentUse: propertyData.currentUse,
        proposedUse: propertyData.proposedUse
      });
    }
  }, [hasPropertyData, propertyData]);

  // Auto-lookup property data when address and city are entered
  const handlePropertyLookup = async () => {
    if (!formData.address || !formData.city || lookupLoading) {
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch("/api/property/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city
        })
      });

      const result = await response.json();

      if (result.success && result.data?.bcAssessment) {
        const bcData = result.data.bcAssessment;
        
        // Auto-populate fields with authentic BC Assessment data
        setFormData(prev => ({
          ...prev,
          currentValue: bcData.totalAssessedValue ? bcData.totalAssessedValue.toString() : prev.currentValue,
          lotSize: bcData.lotSize ? bcData.lotSize.toString() : prev.lotSize
        }));
        
        toast({
          title: "Property Data Retrieved",
          description: `Found BC Assessment data: $${bcData.totalAssessedValue?.toLocaleString() || 'N/A'} assessed value, ${bcData.lotSize || 'N/A'} sq ft lot`,
        });
      } else {
        toast({
          title: "Property Not Found",
          description: "Could not find BC Assessment data for this address. Please enter values manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Property lookup error:", error);
      toast({
        title: "Lookup Failed",
        description: "Unable to retrieve property data. Please enter values manually.",
        variant: "destructive"
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.address || !formData.city || !formData.lotSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in address, city, and lot size.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
          lotSize: parseFloat(formData.lotSize),
          currentUse: formData.currentUse,
          proposedUse: formData.proposedUse
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        
        // Store comprehensive property data for use in other calculators
        const propertyDetails = result.analysis.propertyDetails;
        setPropertyData({
          address: formData.address,
          city: formData.city,
          currentValue: propertyDetails?.assessedValue || (formData.currentValue ? parseFloat(formData.currentValue) : undefined),
          lotSize: propertyDetails?.lotSize || parseFloat(formData.lotSize),
          currentUse: formData.currentUse,
          proposedUse: formData.proposedUse
        });
        
        toast({
          title: "Analysis Complete",
          description: "AI has generated your property development analysis. Data will now auto-populate in other calculators."
        });
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze property. Please try again.",
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

  return (
    <section id="ai-analyzer" className="py-20 bg-gradient-to-br from-blue-50 to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Analysis</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Property Development Analyzer
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Get instant AI-powered feasibility analysis for your real estate development projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-blue" />
                Property Information
              </CardTitle>
              <CardDescription>
                Enter property details for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    data-testid="input-property-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Vancouver"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    data-testid="input-property-city"
                  />
                </div>
              </div>

              {/* Auto-lookup property data button */}
              {formData.address && formData.city && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePropertyLookup}
                    disabled={lookupLoading}
                    className="flex items-center gap-2"
                    data-testid="button-lookup-property"
                  >
                    {lookupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Looking up property...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Auto-Fill from BC Assessment
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value (CAD)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    placeholder="750000"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                    data-testid="input-current-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size (sq ft) *</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    placeholder="5000"
                    value={formData.lotSize}
                    onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
                    data-testid="input-lot-size"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentUse">Current Use</Label>
                  <Select 
                    value={formData.currentUse} 
                    onValueChange={(value) => setFormData({...formData, currentUse: value})}
                  >
                    <SelectTrigger data-testid="select-current-use">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="vacant-land">Vacant Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposedUse">Proposed Development</Label>
                  <Select 
                    value={formData.proposedUse} 
                    onValueChange={(value) => setFormData({...formData, proposedUse: value})}
                  >
                    <SelectTrigger data-testid="select-proposed-use">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multi-family">Multi-Family</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue/90"
                size="lg"
                data-testid="button-analyze-property"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing Property...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Property
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Analysis Results
                </CardTitle>
                {analysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                )}
              </div>
              <CardDescription>
                AI-generated feasibility analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="w-16 h-16 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 mb-2">No analysis yet</p>
                  <p className="text-sm text-neutral-400">
                    Fill in the property details and click "Analyze Property" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Feasibility Score */}
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-medium text-emerald-900">Feasibility Score</h4>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {analysis.developmentAnalysis.recommendedDevelopment.feasibilityScore}/100
                    </div>
                    <p className="text-sm text-emerald-700 mt-1">
                      {analysis.developmentAnalysis.recommendedDevelopment.feasibilityScore >= 70 ? "Highly Feasible" : 
                       analysis.developmentAnalysis.recommendedDevelopment.feasibilityScore >= 50 ? "Moderately Feasible" : "Low Feasibility"}
                    </p>
                  </div>

                  {/* Property Details */}
                  <div>
                    <h4 className="font-semibold mb-3">Property Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-neutral-600">Assessed Value:</span>
                        <div className="font-semibold">{formatCurrency(analysis.propertyDetails.assessedValue)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-600">Lot Size:</span>
                        <div className="font-semibold">{analysis.propertyDetails.lotSize?.toLocaleString()} sqft</div>
                      </div>
                      <div>
                        <span className="text-neutral-600">Zoning:</span>
                        <div className="font-semibold">{analysis.propertyDetails.zoning}</div>
                      </div>
                      <div>
                        <span className="text-neutral-600">Year Built:</span>
                        <div className="font-semibold">{analysis.propertyDetails.yearBuilt}</div>
                      </div>
                    </div>
                  </div>

                  {/* Development Potential */}
                  <div>
                    <h4 className="font-semibold mb-3">Development Potential</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Recommended Units:</span>
                        <span className="font-semibold">{analysis.developmentAnalysis.recommendedDevelopment.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Development Type:</span>
                        <span className="font-semibold">{analysis.developmentAnalysis.recommendedDevelopment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Timeline:</span>
                        <span className="font-semibold">{analysis.developmentAnalysis.recommendedDevelopment.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div>
                    <h4 className="font-semibold mb-3">Financial Projection</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Investment:</span>
                        <span className="font-semibold">{formatCurrency(analysis.financialProjection.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Projected Value:</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(analysis.financialProjection.projectedValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Projected Profit:</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(analysis.financialProjection.projectedProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">ROI:</span>
                        <span className="font-bold text-lg text-emerald-700">{analysis.financialProjection.roiPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Next Steps</h4>
                      <ul className="text-sm space-y-1 text-neutral-600">
                        {analysis.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-blue font-bold">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}