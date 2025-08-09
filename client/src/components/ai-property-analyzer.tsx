import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Building, TrendingUp, AlertTriangle, CheckCircle, Loader2, MapPin, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePropertyData } from "@/hooks/usePropertyData";
import { apiRequest } from "@/lib/queryClient";

interface PropertyAnalysisResult {
  propertyId: string;
  analysisDate: string;
  financialSummary: {
    estimatedCosts: number;
    projectedRevenue: number;
    netProfit: number;
    roi: number;
    paybackPeriod: number;
  };
  marketAnalysis: {
    marketDemand: string;
    comparableSales: string;
    priceRecommendation: number;
    riskFactors: string[];
  };
  developmentFeasibility: {
    complexity: string;
    timelineMonths: number;
    majorObstacles: string[];
    regulatoryRequirements: string[];
  };
  recommendations: {
    goNoGo: string;
    optimizations: string[];
    alternatives: string[];
  };
  confidence: number;
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

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    
    try {
      const response = await fetch("/api/generate-pdf-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          propertyData: formData,
          analysisData: analysis
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BuildwiseAI-Analysis-${formData.address.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "PDF Downloaded",
          description: "Your property analysis report has been downloaded successfully."
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF report. Please try again.",
        variant: "destructive"
      });
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-emerald-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return "text-emerald-700";
    if (roi >= 10) return "text-yellow-700";
    return "text-red-700";
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    AI-generated feasibility analysis and recommendations
                  </CardDescription>
                </div>
                {analysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2"
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                )}
              </div>
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
                  {/* Confidence Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">AI Confidence</span>
                    <Badge 
                      variant={analysis.confidence > 80 ? "default" : "secondary"}
                      className={analysis.confidence > 80 ? "bg-emerald-100 text-emerald-800" : ""}
                    >
                      {analysis.confidence}%
                    </Badge>
                  </div>

                  {/* Feasibility Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Feasibility Score</span>
                    <div className="text-2xl font-bold text-brand-blue">
                      {analysis.feasibilityScore}/10
                    </div>
                  </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Details Section */}
            {analysis.propertyDetails && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <MapPin className="w-5 h-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Assessed Value:</span>
                      <div className="font-semibold">{formatCurrency(analysis.propertyDetails.assessedValue)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Land Value:</span>
                      <div className="font-semibold">{formatCurrency(analysis.propertyDetails.landValue)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Lot Size:</span>
                      <div className="font-semibold">{analysis.propertyDetails.lotSize?.toLocaleString()} sqft</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Zoning:</span>
                      <div className="font-semibold">{analysis.propertyDetails.currentZoning}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Year Built:</span>
                      <div className="font-semibold">{analysis.propertyDetails.yearBuilt}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Floor Area:</span>
                      <div className="font-semibold">{analysis.propertyDetails.floorArea?.toLocaleString()} sqft</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Development Potential */}
            <Card className="border-brand-blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-blue">
                  <Building className="w-5 h-5" />
                  Development Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Recommendation:</span>
                    <Badge variant="secondary">{analysis.developmentPotential.scenario || analysis.developmentPotential.recommended}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Description:</span>
                    <span className="font-medium text-sm text-right max-w-48">{analysis.developmentPotential.description}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Max Units:</span>
                    <span className="font-semibold">{analysis.developmentPotential.maxUnits || analysis.developmentPotential.units}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Est. Value:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(analysis.developmentPotential.estimatedValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">ROI:</span>
                    <span className="font-semibold text-emerald-600">{analysis.developmentPotential.roi}%</span>
                  </div>
                  {analysis.developmentPotential.timeline && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Timeline:</span>
                      <span className="font-semibold">{analysis.developmentPotential.timeline}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Projection */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                  Financial Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Est. Development Cost:</span>
                    <span className="font-semibold">
                      {formatCurrency(analysis.financialProjection.estimatedCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Projected Revenue:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(analysis.financialProjection.projectedRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">ROI:</span>
                    <span className={`font-bold text-lg ${getROIColor(analysis.financialProjection.roi)}`}>
                      {analysis.financialProjection.roi}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Breakeven:</span>
                    <span className="font-semibold">{analysis.financialProjection.breakeven} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Comparables */}
            {analysis.marketComparables && analysis.marketComparables.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <MapPin className="w-5 h-5" />
                    Market Comparables
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    Recent sales within 0.5km of your property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.marketComparables.slice(0, 3).map((comp: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{comp.address}</div>
                          <div className="text-xs text-neutral-600">
                            {comp.sqft?.toLocaleString()} sqft • {comp.lotSize?.toLocaleString()} lot
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-700">{formatCurrency(comp.price)}</div>
                          <div className="text-xs text-neutral-600">${comp.pricePerSqft}/sqft</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {analysis.marketAnalysis && (
                    <div className="mt-4 pt-3 border-t border-orange-200">
                      <div className="text-sm text-orange-700">
                        <strong>Market Trend:</strong> {analysis.marketAnalysis.marketTrend}
                      </div>
                      <div className="text-sm text-orange-700">
                        <strong>Average Price:</strong> {formatCurrency(analysis.marketAnalysis.averagePrice)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

                  {/* Compliance Scores */}
                  <Card className="border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-700">
                        <Shield className="w-5 h-5" />
                        Compliance Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-700">
                            {analysis.compliance.zoningCompliance}%
                          </div>
                          <div className="text-sm text-neutral-600">Zoning</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-700">
                            {analysis.compliance.buildingCodeCompliance}%
                          </div>
                          <div className="text-sm text-neutral-600">Building Code</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-700">
                            {analysis.compliance.environmentalClearance}%
                          </div>
                          <div className="text-sm text-neutral-600">Environmental</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Factors */}
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.riskFactors?.map((risk: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <Badge 
                              variant={risk.risk === 'Low' ? 'default' : risk.risk === 'Medium' ? 'secondary' : 'destructive'}
                              className={`${
                                risk.risk === 'Low' 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : risk.risk === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              {risk.risk}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{risk.category}</div>
                              <div className="text-xs text-neutral-600">{risk.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <CheckCircle className="w-5 h-5" />
                        Recommended Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.nextSteps?.map((step: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1 text-sm text-neutral-700">
                              {step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}