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
}

interface DevelopmentPotential {
  maxUnits: number;
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
    lotSize: ""
  });

  const [designForm, setDesignForm] = useState({
    budget: ""
  });

  const handleZoningAnalysis = async () => {
    if (!analysisForm.address || !analysisForm.city || !analysisForm.lotSize) {
      toast({
        title: "Missing Information",
        description: "Please enter address, city, and lot size.",
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
          lotSize: parseInt(analysisForm.lotSize)
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

        {/* Analysis Input Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-blue" />
              Property Analysis Input
            </CardTitle>
            <CardDescription>
              Enter property details to analyze zoning and development potential
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
                  Analyze Zoning & Development Potential
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-600">Max Units</p>
                          <p className="text-2xl font-bold" data-testid="text-max-units">
                            {cityData.developmentPotential.maxUnits}
                          </p>
                        </div>
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
                    <Button
                      onClick={handleGenerateFeasibilityReport}
                      disabled={loading}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90"
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
                          Generate Feasibility Report
                        </>
                      )}
                    </Button>

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