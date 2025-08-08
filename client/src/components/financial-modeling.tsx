import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Plus,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePropertyData } from "@/hooks/usePropertyData";

interface ProjectFinancials {
  id: string;
  projectName: string;
  propertyDetails: {
    address: string;
    purchasePrice: number;
    lotSize: number;
    developmentType: string;
    units: number;
  };
  costs: {
    landCost: number;
    hardCosts: number;
    softCosts: number;
    financing: number;
    contingency: number;
    total: number;
  };
  revenue: {
    salePrice: number;
    totalRevenue: number;
    netRevenue: number;
  };
  returns: {
    grossProfit: number;
    netProfit: number;
    roi: number;
    irr: number;
    profitMargin: number;
  };
  timeline: {
    acquisitionMonths: number;
    developmentMonths: number;
    salesMonths: number;
    totalMonths: number;
  };
  risks: {
    category: string;
    description: string;
    impact: "Low" | "Medium" | "High";
    probability: "Low" | "Medium" | "High";
    mitigation: string;
  }[];
  createdAt: string;
}

export default function FinancialModeling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { propertyData, hasPropertyData } = usePropertyData();
  
  const [newProject, setNewProject] = useState({
    projectName: "",
    address: "",
    purchasePrice: "",
    lotSize: "",
    developmentType: "",
    units: "",
    targetSqFtPerUnit: ""
  });

  // Auto-populate form from stored property data
  useEffect(() => {
    if (hasPropertyData && propertyData) {
      setNewProject(prev => ({
        ...prev,
        projectName: `${propertyData.address} Development`,
        address: `${propertyData.address}, ${propertyData.city}`,
        purchasePrice: propertyData.currentValue?.toString() || "",
        lotSize: propertyData.lotSize.toString(),
        developmentType: propertyData.proposedUse === "multi-family" ? "Duplex" : "Single Family",
        units: propertyData.proposedUse === "multi-family" ? "2" : "1",
        targetSqFtPerUnit: "1500"
      }));
    }
  }, [hasPropertyData, propertyData]);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/financial-models"],
    retry: false,
  });

  // Fetch selected project details
  const { data: projectDetails } = useQuery({
    queryKey: ["/api/financial-models", selectedProject],
    enabled: !!selectedProject,
    retry: false,
  });

  // Fetch sensitivity analysis
  const { data: sensitivityData } = useQuery({
    queryKey: ["/api/financial-models", selectedProject, "sensitivity"],
    enabled: !!selectedProject,
    retry: false,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch("/api/financial-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error("Failed to create financial model");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-models"] });
      setSelectedProject(data.project.id);
      setActiveTab("analysis");
      resetForm();
      toast({
        title: "Financial Model Created",
        description: "Your financial analysis is ready for review!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create financial model. Please try again.",
        variant: "destructive"
      });
    }
  });

  const developmentTypes = [
    "Single Family", "Duplex", "Triplex", "4-plex", "6-plex", 
    "Townhouse", "Condo", "Mixed Use"
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      projectName: newProject.projectName,
      address: newProject.address,
      purchasePrice: parseInt(newProject.purchasePrice),
      lotSize: parseInt(newProject.lotSize),
      developmentType: newProject.developmentType,
      units: parseInt(newProject.units),
      targetSqFtPerUnit: newProject.targetSqFtPerUnit ? parseInt(newProject.targetSqFtPerUnit) : undefined
    };

    createProjectMutation.mutate(projectData);
  };

  const resetForm = () => {
    setNewProject({
      projectName: "",
      address: "",
      purchasePrice: "",
      lotSize: "",
      developmentType: "",
      units: "",
      targetSqFtPerUnit: ""
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-neutral-600 bg-neutral-100";
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 25) return "text-green-600";
    if (roi >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Financial Modeling</h2>
          <p className="text-neutral-600">Advanced ROI analysis and cash flow projections</p>
        </div>
        <Button 
          onClick={() => setActiveTab("create")}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-model"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Model
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create" data-testid="tab-create">Create Model</TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">My Projects</TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
          <TabsTrigger value="sensitivity" data-testid="tab-sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        {/* Create Model Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Create Financial Model
              </CardTitle>
              <CardDescription>
                Enter your project details to generate comprehensive financial analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={newProject.projectName}
                      onChange={(e) => setNewProject(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="e.g., Main Street Development"
                      required
                      data-testid="input-project-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address *</Label>
                    <Input
                      id="address"
                      value={newProject.address}
                      onChange={(e) => setNewProject(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="1234 Main Street, Vancouver"
                      required
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={newProject.purchasePrice}
                      onChange={(e) => setNewProject(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="1500000"
                      required
                      data-testid="input-purchase-price"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size (sq ft) *</Label>
                    <Input
                      id="lotSize"
                      type="number"
                      value={newProject.lotSize}
                      onChange={(e) => setNewProject(prev => ({ ...prev, lotSize: e.target.value }))}
                      placeholder="6000"
                      required
                      data-testid="input-lot-size"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="units">Number of Units *</Label>
                    <Input
                      id="units"
                      type="number"
                      value={newProject.units}
                      onChange={(e) => setNewProject(prev => ({ ...prev, units: e.target.value }))}
                      placeholder="4"
                      required
                      data-testid="input-units"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="developmentType">Development Type *</Label>
                    <Select 
                      value={newProject.developmentType} 
                      onValueChange={(value) => setNewProject(prev => ({ ...prev, developmentType: value }))}
                    >
                      <SelectTrigger data-testid="select-development-type">
                        <SelectValue placeholder="Select development type" />
                      </SelectTrigger>
                      <SelectContent>
                        {developmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetSqFtPerUnit">Sq Ft per Unit (optional)</Label>
                    <Input
                      id="targetSqFtPerUnit"
                      type="number"
                      value={newProject.targetSqFtPerUnit}
                      onChange={(e) => setNewProject(prev => ({ ...prev, targetSqFtPerUnit: e.target.value }))}
                      placeholder="1200"
                      data-testid="input-sqft-per-unit"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={createProjectMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-create-financial-model"
                  >
                    {createProjectMutation.isPending ? "Creating Model..." : "Create Financial Model"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {projectsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading projects...</div>
              </CardContent>
            </Card>
          ) : (projects as ProjectFinancials[]).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calculator className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Financial Models</h3>
                <p className="text-neutral-600 mb-4">Create your first financial model to analyze project profitability</p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Model
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(projects as ProjectFinancials[]).map((project: ProjectFinancials) => (
                <Card key={project.id} className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.projectName}</h3>
                        <p className="text-neutral-600">{project.propertyDetails.address}</p>
                        <p className="text-sm text-neutral-500">
                          {project.propertyDetails.developmentType} • {project.propertyDetails.units} units
                        </p>
                      </div>
                      <Badge className={`${getROIColor(project.returns.roi)} font-semibold`}>
                        {formatPercent(project.returns.roi)} ROI
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-500">Purchase Price</p>
                        <p className="font-semibold">{formatCurrency(project.propertyDetails.purchasePrice)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Total Costs</p>
                        <p className="font-semibold">{formatCurrency(project.costs.total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Net Profit</p>
                        <p className="font-semibold text-green-600">{formatCurrency(project.returns.netProfit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Timeline</p>
                        <p className="font-semibold">{project.timeline.totalMonths} months</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setActiveTab("analysis");
                        }}
                        data-testid={`button-view-project-${project.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {!selectedProject ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                <p className="text-neutral-600">Choose a project from the Projects tab to view detailed analysis</p>
              </CardContent>
            </Card>
          ) : (projectDetails as ProjectFinancials) ? (
            <div className="space-y-6">
              {/* Project Header */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {(projectDetails as ProjectFinancials).projectName}
                  </CardTitle>
                  <CardDescription>{(projectDetails as ProjectFinancials).propertyDetails.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getROIColor((projectDetails as ProjectFinancials).returns.roi)}`}>
                        {formatPercent((projectDetails as ProjectFinancials).returns.roi)}
                      </div>
                      <div className="text-sm text-neutral-500">ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency((projectDetails as ProjectFinancials).returns.netProfit)}
                      </div>
                      <div className="text-sm text-neutral-500">Net Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatPercent((projectDetails as ProjectFinancials).returns.irr)}
                      </div>
                      <div className="text-sm text-neutral-500">IRR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {(projectDetails as ProjectFinancials).timeline.totalMonths}
                      </div>
                      <div className="text-sm text-neutral-500">Months</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Land Cost</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).costs.landCost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Hard Costs</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).costs.hardCosts)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Soft Costs</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).costs.softCosts)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Financing</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).costs.financing)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Contingency</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).costs.contingency)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Costs</span>
                        <span>{formatCurrency((projectDetails as ProjectFinancials).costs.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Revenue & Returns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Sale Price per Unit</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).revenue.salePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Revenue</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).revenue.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Net Revenue</span>
                        <span className="font-semibold">{formatCurrency((projectDetails as ProjectFinancials).revenue.netRevenue)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between items-center">
                        <span>Gross Profit</span>
                        <span className="font-semibold text-green-600">{formatCurrency((projectDetails as ProjectFinancials).returns.grossProfit)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Net Profit</span>
                        <span className="text-green-600">{formatCurrency((projectDetails as ProjectFinancials).returns.netProfit)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(projectDetails as ProjectFinancials).timeline.acquisitionMonths}
                      </div>
                      <div className="text-sm text-neutral-500">Acquisition</div>
                      <div className="text-xs text-neutral-400">months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(projectDetails as ProjectFinancials).timeline.developmentMonths}
                      </div>
                      <div className="text-sm text-neutral-500">Development</div>
                      <div className="text-xs text-neutral-400">months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(projectDetails as ProjectFinancials).timeline.salesMonths}
                      </div>
                      <div className="text-sm text-neutral-500">Sales</div>
                      <div className="text-xs text-neutral-400">months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(projectDetails as ProjectFinancials).timeline.totalMonths}
                      </div>
                      <div className="text-sm text-neutral-500">Total</div>
                      <div className="text-xs text-neutral-400">months</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(projectDetails as ProjectFinancials).risks.map((risk: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{risk.category}</h4>
                          <div className="flex gap-2">
                            <Badge className={getRiskColor(risk.impact)}>
                              {risk.impact} Impact
                            </Badge>
                            <Badge className={getRiskColor(risk.probability)}>
                              {risk.probability} Prob
                            </Badge>
                          </div>
                        </div>
                        <p className="text-neutral-600 mb-2">{risk.description}</p>
                        <p className="text-sm text-neutral-500">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Sensitivity Analysis Tab */}
        <TabsContent value="sensitivity" className="space-y-6">
          {!selectedProject ? (
            <Card>
              <CardContent className="p-6 text-center">
                <LineChart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                <p className="text-neutral-600">Choose a project to view sensitivity analysis</p>
              </CardContent>
            </Card>
          ) : (sensitivityData as any) ? (
            <div className="space-y-6">
              {/* Price Sensitivity */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Price Sensitivity Analysis</CardTitle>
                  <CardDescription>Impact of sale price changes on project returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(sensitivityData as any).priceScenarios.map((scenario: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{scenario.scenario}</Badge>
                          <span>Sale Price: {formatCurrency(scenario.salePrice)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Revenue: {formatCurrency(scenario.totalRevenue)}</span>
                          <span className={`font-semibold ${getROIColor(scenario.roi)}`}>
                            ROI: {formatPercent(scenario.roi)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Sensitivity */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Cost Sensitivity Analysis</CardTitle>
                  <CardDescription>Impact of construction cost changes on project returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(sensitivityData as any).costScenarios.map((scenario: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{scenario.scenario}</Badge>
                          <span>Total Costs: {formatCurrency(scenario.totalCosts)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Net Profit: {formatCurrency(scenario.netProfit)}</span>
                          <span className={`font-semibold ${getROIColor(scenario.roi)}`}>
                            ROI: {formatPercent(scenario.roi)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Scenarios */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Market Scenario Analysis</CardTitle>
                  <CardDescription>Project performance under different market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(sensitivityData as any).marketScenarios.map((scenario: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{scenario.name}</h4>
                          <span className={`font-semibold ${getROIColor(scenario.roi)}`}>
                            {formatPercent(scenario.roi)} ROI
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Sale Price:</span>
                            <span className="ml-2 font-medium">{formatCurrency(scenario.salePrice)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Total Costs:</span>
                            <span className="ml-2 font-medium">{formatCurrency(scenario.totalCosts)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Timeline:</span>
                            <span className="ml-2 font-medium">{scenario.timelineMonths} months</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}