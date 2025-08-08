import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Building, TrendingUp, AlertTriangle, CheckCircle, Loader2, MapPin, Download } from "lucide-react";
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
                      variant="secondary" 
                      className={getConfidenceColor(analysis.confidence)}
                      data-testid="badge-confidence"
                    >
                      {analysis.confidence}%
                    </Badge>
                  </div>

                  <Separator />

                  {/* Financial Summary */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Financial Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Estimated Costs</p>
                        <p className="font-semibold" data-testid="text-estimated-costs">
                          {formatCurrency(analysis.financialSummary.estimatedCosts)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Projected Revenue</p>
                        <p className="font-semibold" data-testid="text-projected-revenue">
                          {formatCurrency(analysis.financialSummary.projectedRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Net Profit</p>
                        <p className="font-semibold text-emerald-700" data-testid="text-ai-net-profit">
                          {formatCurrency(analysis.financialSummary.netProfit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">ROI</p>
                        <p className={`font-semibold ${getROIColor(analysis.financialSummary.roi)}`} data-testid="text-ai-roi">
                          {analysis.financialSummary.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Market Analysis */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Market Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Market Demand:</span>
                        <span data-testid="text-market-demand">{analysis.marketAnalysis.marketDemand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Comparable Sales:</span>
                        <span data-testid="text-comparable-sales">{analysis.marketAnalysis.comparableSales}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      {analysis.recommendations.goNoGo.toLowerCase().includes('proceed') ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      Recommendation
                    </h4>
                    <p className="text-sm text-neutral-700 mb-3" data-testid="text-recommendation">
                      {analysis.recommendations.goNoGo}
                    </p>
                    
                    {analysis.recommendations.optimizations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-600 mb-2">Key Optimizations:</p>
                        <ul className="text-sm text-neutral-700 space-y-1">
                          {analysis.recommendations.optimizations.slice(0, 3).map((opt, index) => (
                            <li key={index} className="flex items-start gap-2" data-testid={`text-optimization-${index}`}>
                              <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}