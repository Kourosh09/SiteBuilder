import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  Zap, 
  FileText, 
  Ruler,
  Loader2,
  TrendingUp,
  Home,
  PieChart,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ZoningData {
  zoningCode: string;
  description: string;
  maxHeight: number;
  maxFAR: number;
  maxDensity: number;
  permittedUses: string[];
  setbacks: {
    front: number;
    rear: number;
    side: number;
  };
  parkingRequirements: string;
  bill44Eligible: boolean;
  bill44MaxUnits: number;
  transitOriented: boolean;
  multiplexEligible: boolean;
}

interface DevelopmentPotential {
  maxUnits: number;
  bill44MaxUnits: number;
  recommendedUnits: number;
  suggestedUnitMix: {
    bedrooms: number;
    count: number;
  }[];
  buildingType: string;
  estimatedGFA: number;
  estimatedValue: number;
  feasibilityScore: number;
  constraints: string[];
  opportunities: string[];
  bill44Compliance: {
    eligible: boolean;
    benefits: string[];
    requirements: string[];
    incentives: string[];
  };
}

interface CityDataResult {
  address: string;
  coordinates: { lat: number; lng: number };
  zoning: ZoningData;
  developmentPotential: DevelopmentPotential;
  nearbyAmenities: {
    transit: { type: string; distance: number }[];
    schools: { name: string; rating: number; distance: number }[];
    shopping: { name: string; type: string; distance: number }[];
  };
  marketContext: {
    averageHomePrices: number;
    constructionCosts: number;
    saleVelocity: string;
    demographics: string;
  };
}

interface DesignSuggestion {
  layoutType: string;
  unitConfiguration: string;
  estimatedCost: number;
  timeline: string;
  keyFeatures: string[];
}

export default function ZoningIntelligence() {
  const [loading, setLoading] = useState(false);
  const [cityData, setCityData] = useState<CityDataResult | null>(null);
  const [designSuggestions, setDesignSuggestions] = useState<DesignSuggestion[]>([]);
  const [feasibilityReport, setFeasibilityReport] = useState<string>("");
  const { toast } = useToast();

  // Form state
  const [analysisForm, setAnalysisForm] = useState({
    address: "",
    city: "",
    lotSize: "",
    frontage: ""
  });

  const [designForm, setDesignForm] = useState({
    budget: ""
  });

  const handleZoningAnalysis = async () => {
    if (!analysisForm.address || !analysisForm.city || !analysisForm.lotSize || !analysisForm.frontage) {
      toast({
        title: "Missing Information",
        description: "Please enter address, city, lot size, and frontage.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/zoning/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: analysisForm.address,
          city: analysisForm.city,
          lotSize: parseInt(analysisForm.lotSize),
          frontage: parseInt(analysisForm.frontage)
        })
      });

      const result = await response.json();

      if (result.success) {
        setCityData(result.data);
        toast({
          title: "Analysis Complete",
          description: "Zoning and development analysis completed successfully!"
        });
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Zoning analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze zoning data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDesignSuggestions = async () => {
    if (!cityData) {
      toast({
        title: "No Analysis Data",
        description: "Please run zoning analysis first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/zoning/design-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoningData: cityData.zoning,
          lotSize: parseInt(analysisForm.lotSize),
          developmentPotential: cityData.developmentPotential,
          budget: designForm.budget ? parseInt(designForm.budget) : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setDesignSuggestions(result.data);
        toast({
          title: "Design Suggestions Generated",
          description: "AI-powered design recommendations are ready!"
        });
      } else {
        throw new Error(result.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Design suggestions error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate design suggestions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFeasibilityReport = async () => {
    if (!cityData) {
      toast({
        title: "No Analysis Data",
        description: "Please run zoning analysis first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/zoning/feasibility-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityData })
      });

      const result = await response.json();

      if (result.success) {
        setFeasibilityReport(result.data.report);
        toast({
          title: "Report Generated",
          description: "Comprehensive feasibility report is ready!"
        });
      } else {
        throw new Error(result.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Feasibility report error:", error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate feasibility report.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDFReport = async () => {
    if (!cityData) {
      toast({
        title: "No Analysis Data",
        description: "Please run zoning analysis first.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const reportData = {
        address: analysisForm.address,
        city: analysisForm.city,
        coordinates: cityData.coordinates,
        lotSize: parseFloat(analysisForm.lotSize),
        frontage: parseFloat(analysisForm.frontage),
        zoning: cityData.zoning,
        developmentPotential: cityData.developmentPotential,
        nearbyAmenities: cityData.nearbyAmenities,
        marketContext: cityData.marketContext
      };

      const response = await fetch("/api/reports/zoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle PDF blob download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BuildwiseAI-Zoning-Report-${analysisForm.address.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Report Downloaded",
        description: "Your comprehensive zoning analysis report has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Error generating PDF report:", error);
      toast({
        title: "PDF Generation Failed", 
        description: error instanceof Error ? error.message : "Failed to generate PDF report. Please try again.",
        variant: "destructive",
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <section id="zoning-intelligence" className="py-20 bg-gradient-to-br from-neutral-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building className="w-4 h-4" />
            <span>Zoning Intelligence & Design Automation</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Smart Zoning Analysis & Design
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Analyze zoning potential, get AI-powered design suggestions, and generate comprehensive feasibility reports
          </p>
        </div>

        {/* Bill 44 Quick Checker */}
        <Card className="max-w-4xl mx-auto mb-8 shadow-lg border-brand-blue/20">
          <CardHeader className="bg-gradient-to-r from-brand-blue/5 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-brand-blue">
              <Zap className="w-5 h-5" />
              Bill 44 Quick Eligibility Checker
            </CardTitle>
            <CardDescription>
              Instantly check if your property qualifies for Bill 44 multiplex development
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quick-lot-size">Lot Size (sq ft)</Label>
                <Input
                  id="quick-lot-size"
                  placeholder="3500"
                  type="number"
                  value={analysisForm.lotSize}
                  onChange={(e) => setAnalysisForm({...analysisForm, lotSize: e.target.value})}
                  data-testid="input-quick-lot-size"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-frontage">Frontage (ft)</Label>
                <Input
                  id="quick-frontage"
                  placeholder="35"
                  type="number"
                  value={analysisForm.frontage}
                  onChange={(e) => setAnalysisForm({...analysisForm, frontage: e.target.value})}
                  data-testid="input-quick-frontage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-city">City</Label>
                <Input
                  id="quick-city"
                  placeholder="Vancouver"
                  value={analysisForm.city}
                  onChange={(e) => setAnalysisForm({...analysisForm, city: e.target.value})}
                  data-testid="input-quick-city"
                />
              </div>
            </div>
            
            {/* Quick Results */}
            {analysisForm.lotSize && analysisForm.frontage && (
              <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-emerald-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Lot Size Check</h4>
                    <Badge 
                      variant={parseInt(analysisForm.lotSize) >= 3000 ? "default" : "secondary"}
                      className={parseInt(analysisForm.lotSize) >= 3000 ? "bg-emerald-600" : ""}
                    >
                      {parseInt(analysisForm.lotSize) >= 3000 ? "✅ Meets 3,000 sq ft minimum" : "❌ Below 3,000 sq ft minimum"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Frontage Check</h4>
                    <Badge 
                      variant={parseInt(analysisForm.frontage) >= 33 ? "default" : "secondary"}
                      className={parseInt(analysisForm.frontage) >= 33 ? "bg-emerald-600" : ""}
                    >
                      {parseInt(analysisForm.frontage) >= 33 ? "✅ Meets 33 ft minimum" : "❌ Below 33 ft minimum"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Bill 44 Eligibility</h4>
                    <Badge 
                      variant={(parseInt(analysisForm.lotSize) >= 3000 && parseInt(analysisForm.frontage) >= 33) ? "default" : "secondary"}
                      className={(parseInt(analysisForm.lotSize) >= 3000 && parseInt(analysisForm.frontage) >= 33) ? "bg-brand-blue" : ""}
                    >
                      {(parseInt(analysisForm.lotSize) >= 3000 && parseInt(analysisForm.frontage) >= 33) ? 
                        (parseInt(analysisForm.lotSize) >= 7200 ? 
                          "6-plex Eligible" : "4-plex Eligible") : 
                        "Not Eligible"}
                    </Badge>
                  </div>
                </div>
                
                {(parseInt(analysisForm.lotSize) >= 3000 && parseInt(analysisForm.frontage) >= 33) && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-emerald-600 font-medium">
                      ✅ This property qualifies for Bill 44 multiplex development!
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      Complete the analysis below for detailed zoning information and development recommendations.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Input Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-blue" />
              Property Analysis Input
            </CardTitle>
            <CardDescription>
              Enter property details to analyze zoning and Bill 44 development potential
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoning-address">Property Address</Label>
                <Input
                  id="zoning-address"
                  placeholder="123 Main Street"
                  value={analysisForm.address}
                  onChange={(e) => setAnalysisForm({...analysisForm, address: e.target.value})}
                  data-testid="input-zoning-address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoning-city">City</Label>
                <Input
                  id="zoning-city"
                  placeholder="Vancouver"
                  value={analysisForm.city}
                  onChange={(e) => setAnalysisForm({...analysisForm, city: e.target.value})}
                  data-testid="input-zoning-city"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot-size">Lot Size (sq ft)</Label>
                <Input
                  id="lot-size"
                  placeholder="5000"
                  type="number"
                  value={analysisForm.lotSize}
                  onChange={(e) => setAnalysisForm({...analysisForm, lotSize: e.target.value})}
                  data-testid="input-lot-size"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frontage">Frontage (ft)</Label>
                <Input
                  id="frontage"
                  placeholder="50"
                  type="number"
                  value={analysisForm.frontage}
                  onChange={(e) => setAnalysisForm({...analysisForm, frontage: e.target.value})}
                  data-testid="input-frontage"
                />
              </div>
            </div>

            <Button
              onClick={handleZoningAnalysis}
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              size="lg"
              data-testid="button-zoning-analysis"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Property...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Bill 44, Bill 47 & TOD Development Potential
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {cityData && (
          <div className="space-y-8">
            <Tabs defaultValue="zoning" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
                <TabsTrigger value="zoning" data-testid="tab-zoning">Zoning Data</TabsTrigger>
                <TabsTrigger value="development" data-testid="tab-development">Development</TabsTrigger>
                <TabsTrigger value="design" data-testid="tab-design">AI Design</TabsTrigger>
                <TabsTrigger value="report" data-testid="tab-report">Report</TabsTrigger>
              </TabsList>

              <TabsContent value="zoning" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-brand-blue" />
                      Zoning Information
                    </CardTitle>
                    <CardDescription>
                      Official zoning data and regulations for {cityData.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Zoning Code</p>
                        <Badge variant="secondary" className="text-lg px-3 py-1" data-testid="badge-zoning-code">
                          {cityData.zoning.zoningCode}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Description</p>
                        <p className="font-semibold" data-testid="text-zoning-description">
                          {cityData.zoning.description}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Max Height</p>
                        <p className="text-lg font-semibold" data-testid="text-max-height">
                          {cityData.zoning.maxHeight}m
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Max FAR</p>
                        <p className="text-lg font-semibold text-brand-blue" data-testid="text-max-far">
                          {cityData.zoning.maxFAR}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Max Density</p>
                        <p className="text-lg font-semibold" data-testid="text-max-density">
                          {cityData.zoning.maxDensity} units
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Parking</p>
                        <p className="text-sm text-neutral-700" data-testid="text-parking-requirements">
                          {cityData.zoning.parkingRequirements}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Front Setback</p>
                        <p className="font-semibold" data-testid="text-front-setback">
                          {cityData.zoning.setbacks.front}m
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Side Setback</p>
                        <p className="font-semibold" data-testid="text-side-setback">
                          {cityData.zoning.setbacks.side}m
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Rear Setback</p>
                        <p className="font-semibold" data-testid="text-rear-setback">
                          {cityData.zoning.setbacks.rear}m
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-600">Permitted Uses</p>
                      <div className="flex flex-wrap gap-2">
                        {cityData.zoning.permittedUses.map((use, index) => (
                          <Badge key={index} variant="outline" data-testid={`badge-permitted-use-${index}`}>
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="development" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-brand-blue" />
                        Development Potential
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-brand-blue mb-2" data-testid="text-feasibility-score">
                          {cityData.developmentPotential.feasibilityScore}/100
                        </div>
                        <Badge 
                          className={`${getScoreColor(cityData.developmentPotential.feasibilityScore)} border-0 text-sm px-3 py-1`}
                          data-testid="badge-feasibility-rating"
                        >
                          {cityData.developmentPotential.feasibilityScore >= 80 ? 'Excellent' : 
                           cityData.developmentPotential.feasibilityScore >= 60 ? 'Good' : 'Fair'} Feasibility
                        </Badge>
                      </div>

                      {/* Multi-Policy Unit Comparison */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* First row - Traditional vs Bill 44 */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-brand-blue/20">
                          <div className="space-y-2 text-center">
                            <p className="text-sm font-medium text-neutral-600">Traditional Zoning</p>
                            <p className="text-xl font-bold text-neutral-600" data-testid="text-max-units">
                              {cityData.developmentPotential.maxUnits} units
                            </p>
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          </div>
                          <div className="space-y-2 text-center">
                            <p className="text-sm font-medium text-neutral-600">Bill 44 Potential</p>
                            <p className="text-2xl font-bold text-brand-blue" data-testid="text-bill44-units">
                              {cityData.developmentPotential.bill44MaxUnits} units
                            </p>
                            <Badge variant="default" className="text-xs bg-brand-blue">Multiplex</Badge>
                          </div>
                        </div>

                        {/* Second row - Bill 47 vs TOD */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-lg border border-emerald-300/30">
                          <div className="space-y-2 text-center">
                            <p className="text-sm font-medium text-neutral-600">Bill 47 Potential</p>
                            <p className="text-2xl font-bold text-emerald-600" data-testid="text-bill47-units">
                              {cityData.developmentPotential.bill47MaxUnits} units
                            </p>
                            <Badge variant="default" className="text-xs bg-emerald-600">Suites + ADU</Badge>
                          </div>
                          <div className="space-y-2 text-center">
                            <p className="text-sm font-medium text-neutral-600">TOD Bonus</p>
                            <p className="text-2xl font-bold text-purple-600" data-testid="text-tod-units">
                              +{cityData.developmentPotential.todMaxUnits} units
                            </p>
                            <Badge variant="default" className="text-xs bg-purple-600">Transit</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Combined Maximum */}
                      <div className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg border-2 border-emerald-400/50">
                        <div className="text-center space-y-2">
                          <p className="text-sm font-medium text-emerald-700">🎯 Maximum Combined Potential</p>
                          <p className="text-3xl font-bold text-emerald-800" data-testid="text-combined-units">
                            {cityData.developmentPotential.combinedMaxUnits} units
                          </p>
                          <Badge variant="default" className="text-sm bg-emerald-600 px-3 py-1">
                            Highest Policy Benefit
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Building Type</p>
                          <p className="font-semibold" data-testid="text-building-type">
                            {cityData.developmentPotential.buildingType}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Est. GFA</p>
                          <p className="font-semibold" data-testid="text-estimated-gfa">
                            {cityData.developmentPotential.estimatedGFA.toLocaleString()} sq ft
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Est. Value</p>
                          <p className="font-semibold text-emerald-600" data-testid="text-estimated-value">
                            {formatCurrency(cityData.developmentPotential.estimatedValue)}
                          </p>
                        </div>
                      </div>

                      {/* Bill 44 Compliance Section */}
                      {cityData.developmentPotential.bill44Compliance && (
                        <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-brand-blue" />
                            <h4 className="font-semibold text-brand-blue">Bill 44 Compliance Analysis</h4>
                            <Badge 
                              variant={cityData.developmentPotential.bill44Compliance.eligible ? "default" : "secondary"}
                              className={cityData.developmentPotential.bill44Compliance.eligible ? "bg-emerald-600" : ""}
                            >
                              {cityData.developmentPotential.bill44Compliance.eligible ? "✅ Eligible" : "❌ Not Eligible"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-600 mb-2">Benefits & Requirements</p>
                              <div className="space-y-1">
                                {cityData.developmentPotential.bill44Compliance.benefits.map((benefit, index) => (
                                  <div key={index} className="text-sm" data-testid={`bill44-benefit-${index}`}>
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {cityData.developmentPotential.bill44Compliance.requirements.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Requirements</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.bill44Compliance.requirements.map((requirement, index) => (
                                    <div key={index} className="text-sm text-neutral-600" data-testid={`bill44-requirement-${index}`}>
                                      • {requirement}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {cityData.developmentPotential.bill44Compliance.incentives.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Available Incentives</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.bill44Compliance.incentives.map((incentive, index) => (
                                    <div key={index} className="text-sm text-emerald-600" data-testid={`bill44-incentive-${index}`}>
                                      💰 {incentive}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bill 47 Compliance Analysis */}
                      {cityData.developmentPotential.bill47Compliance && (
                        <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-semibold text-emerald-600">Bill 47 Compliance Analysis</h4>
                            <Badge 
                              variant={cityData.developmentPotential.bill47Compliance.eligible ? "default" : "secondary"}
                              className={cityData.developmentPotential.bill47Compliance.eligible ? "bg-emerald-600" : ""}
                            >
                              {cityData.developmentPotential.bill47Compliance.eligible ? "✅ Eligible" : "❌ Not Eligible"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-600 mb-2">Benefits & Requirements</p>
                              <div className="space-y-1">
                                {cityData.developmentPotential.bill47Compliance.benefits.map((benefit, index) => (
                                  <div key={index} className="text-sm" data-testid={`bill47-benefit-${index}`}>
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {cityData.developmentPotential.bill47Compliance.requirements.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Requirements</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.bill47Compliance.requirements.map((requirement, index) => (
                                    <div key={index} className="text-sm text-neutral-600" data-testid={`bill47-requirement-${index}`}>
                                      • {requirement}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {cityData.developmentPotential.bill47Compliance.incentives.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Incentives</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.bill47Compliance.incentives.map((incentive, index) => (
                                    <div key={index} className="text-sm text-emerald-600" data-testid={`bill47-incentive-${index}`}>
                                      ✓ {incentive}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TOD Compliance Analysis */}
                      {cityData.developmentPotential.todCompliance && (
                        <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-600">TOD (Transit-Oriented Development) Analysis</h4>
                            <Badge 
                              variant={cityData.developmentPotential.todCompliance.eligible ? "default" : "secondary"}
                              className={cityData.developmentPotential.todCompliance.eligible ? "bg-purple-600" : ""}
                            >
                              {cityData.developmentPotential.todCompliance.eligible ? "✅ Eligible" : "❌ Not Eligible"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-600 mb-2">Benefits & Requirements</p>
                              <div className="space-y-1">
                                {cityData.developmentPotential.todCompliance.benefits.map((benefit, index) => (
                                  <div key={index} className="text-sm" data-testid={`tod-benefit-${index}`}>
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {cityData.developmentPotential.todCompliance.requirements.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Requirements</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.todCompliance.requirements.map((requirement, index) => (
                                    <div key={index} className="text-sm text-neutral-600" data-testid={`tod-requirement-${index}`}>
                                      • {requirement}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {cityData.developmentPotential.todCompliance.incentives.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-neutral-600 mb-2">Incentives</p>
                                <div className="space-y-1">
                                  {cityData.developmentPotential.todCompliance.incentives.map((incentive, index) => (
                                    <div key={index} className="text-sm text-purple-600" data-testid={`tod-incentive-${index}`}>
                                      ✓ {incentive}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-600">Suggested Unit Mix</p>
                        <div className="space-y-2">
                          {cityData.developmentPotential.suggestedUnitMix.map((mix, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded" data-testid={`unit-mix-${index}`}>
                              <span>{mix.bedrooms} bedroom units</span>
                              <Badge variant="secondary">{mix.count} units</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-blue" />
                        Market Context & Amenities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-600">Avg Home Price</p>
                            <p className="font-semibold text-emerald-600" data-testid="text-avg-home-price">
                              {formatCurrency(cityData.marketContext.averageHomePrices)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-600">Construction Cost</p>
                            <p className="font-semibold" data-testid="text-construction-cost">
                              ${cityData.marketContext.constructionCosts}/sq ft
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Sale Velocity</p>
                          <p className="font-semibold" data-testid="text-sale-velocity">
                            {cityData.marketContext.saleVelocity}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Demographics</p>
                          <p className="text-sm text-neutral-700" data-testid="text-demographics">
                            {cityData.marketContext.demographics}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-semibold">Nearby Amenities</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-600 mb-2">Transit</p>
                            {cityData.nearbyAmenities.transit.map((transit, index) => (
                              <div key={index} className="flex items-center justify-between text-sm" data-testid={`transit-${index}`}>
                                <span>{transit.type}</span>
                                <span className="text-neutral-500">{transit.distance}m</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-600 mb-2">Schools</p>
                            {cityData.nearbyAmenities.schools.map((school, index) => (
                              <div key={index} className="flex items-center justify-between text-sm" data-testid={`school-${index}`}>
                                <span>{school.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Rating: {school.rating}/10</Badge>
                                  <span className="text-neutral-500">{school.distance}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Opportunities</p>
                          <div className="space-y-1">
                            {cityData.developmentPotential.opportunities.map((opportunity, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-emerald-600" data-testid={`opportunity-${index}`}>
                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                {opportunity}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Constraints</p>
                          <div className="space-y-1">
                            {cityData.developmentPotential.constraints.map((constraint, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-red-600" data-testid={`constraint-${index}`}>
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                {constraint}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-6">
                <Card className="shadow-lg mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-brand-blue" />
                      AI Design Suggestions
                    </CardTitle>
                    <CardDescription>
                      Get AI-powered architectural recommendations optimized for your zoning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="design-budget">Budget (Optional)</Label>
                      <Input
                        id="design-budget"
                        placeholder="1500000"
                        type="number"
                        value={designForm.budget}
                        onChange={(e) => setDesignForm({...designForm, budget: e.target.value})}
                        data-testid="input-design-budget"
                      />
                    </div>
                    <Button
                      onClick={handleGenerateDesignSuggestions}
                      disabled={loading}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90"
                      data-testid="button-generate-design-suggestions"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Design Suggestions...
                        </>
                      ) : (
                        <>
                          <PieChart className="w-4 h-4 mr-2" />
                          Generate AI Design Suggestions
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {designSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {designSuggestions.map((suggestion, index) => (
                      <Card key={index} className="shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg" data-testid={`design-title-${index}`}>
                            {suggestion.layoutType}
                          </CardTitle>
                          <CardDescription data-testid={`design-config-${index}`}>
                            {suggestion.unitConfiguration}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Estimated Cost</p>
                              <p className="font-semibold text-emerald-600" data-testid={`design-cost-${index}`}>
                                {formatCurrency(suggestion.estimatedCost)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-600">Timeline</p>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-neutral-500" />
                                <p className="text-sm font-semibold" data-testid={`design-timeline-${index}`}>
                                  {suggestion.timeline}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-600">Key Features</p>
                            <div className="space-y-1">
                              {suggestion.keyFeatures.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center gap-2 text-sm" data-testid={`design-feature-${index}-${featureIndex}`}>
                                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full"></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="report" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-blue" />
                      Comprehensive Feasibility Report
                    </CardTitle>
                    <CardDescription>
                      Generate a detailed feasibility analysis report for your development project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={handleGenerateFeasibilityReport}
                        disabled={loading}
                        className="bg-brand-blue hover:bg-brand-blue/90"
                        size="lg"
                        data-testid="button-generate-feasibility-report"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Report...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Text Report
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleGeneratePDFReport}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-600/90"
                        size="lg"
                        data-testid="button-generate-pdf-report"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Download PDF Report
                          </>
                        )}
                      </Button>
                    </div>

                    {feasibilityReport && (
                      <div className="space-y-4">
                        <div className="bg-neutral-50 p-6 rounded-lg max-h-96 overflow-auto">
                          <pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed" data-testid="text-feasibility-report">
                            {feasibilityReport}
                          </pre>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                          <FileText className="w-4 h-4" />
                          <span>Professional feasibility report generated successfully!</span>
                        </div>
                      </div>
                    )}
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