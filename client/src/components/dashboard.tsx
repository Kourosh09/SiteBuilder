import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  Users, 
  FileText, 
  Zap,
  TrendingUp,
  Home,
  Search,
  PlusCircle,
  BarChart3,
  Briefcase,
  Calculator,
  Bot,
  Bell,
  Shield
} from "lucide-react";

// Import existing components
import ZoningIntelligence from "./zoning-intelligence";
import AIPropertyAnalyzer from "./ai-property-analyzer";
import PartnerFinder from "./partner-finder";
import PropertyAlerts from "./property-alerts";
import FinancialModeling from "./financial-modeling";
import LeadGenerationDashboard from "./lead-generation-dashboard";
import CalculatorDemo from "./calculator-demo";
import ContractorSignupSection from "./contractor-signup-section";
import Partners from "@/pages/Partners";

interface DashboardStats {
  totalProjects: number;
  activePermits: number;
  leadsGenerated: number;
  propertiesAnalyzed: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock stats - would come from API in real implementation
  const stats: DashboardStats = {
    totalProjects: 12,
    activePermits: 8,
    leadsGenerated: 156,
    propertiesAnalyzed: 89
  };

  const quickActions = [
    {
      title: "Analyze Property",
      description: "AI-powered feasibility analysis",
      icon: Zap,
      color: "bg-blue-600",
      action: () => setActiveTab("property-analyzer")
    },

    {
      title: "Check Zoning",
      description: "Bill 44 compliance & development potential",
      icon: Building,
      color: "bg-emerald-600",
      action: () => setActiveTab("zoning")
    },
    {
      title: "Property Alerts",
      description: "Get notified of new opportunities",
      icon: Bell,
      color: "bg-purple-600",
      action: () => setActiveTab("alerts")
    },
    {
      title: "Financial Models",
      description: "Advanced ROI & cash flow analysis",
      icon: Calculator,
      color: "bg-emerald-600",
      action: () => setActiveTab("financial")
    },
    {
      title: "ROI Calculator",
      description: "Development cost & return calculator",
      icon: BarChart3,
      color: "bg-yellow-600",
      action: () => setActiveTab("calculator")
    },
    {
      title: "Find Partners",
      description: "Connect with architects & engineers",
      icon: Users,
      color: "bg-orange-600",
      action: () => setActiveTab("partners")
    },
    {
      title: "Find Contractors",
      description: "Trade professional marketplace",
      icon: Users,
      color: "bg-indigo-600",
      action: () => setActiveTab("marketplace")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">BuildwiseAI Dashboard</h1>
              <p className="text-neutral-600 mt-1">AI-powered real estate development platform</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-brand-blue">
                BC Focused
              </Badge>
              <Badge variant="outline">
                Bill 44 Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-fit grid-cols-9 gap-1">
              <TabsTrigger value="overview" data-testid="tab-overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="property-analyzer" data-testid="tab-property-analyzer" className="whitespace-nowrap">AI Analysis</TabsTrigger>
              <TabsTrigger value="zoning" data-testid="tab-zoning" className="whitespace-nowrap">Zoning</TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts" className="whitespace-nowrap">Alerts</TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial" className="whitespace-nowrap">Financial</TabsTrigger>
              <TabsTrigger value="marketing" data-testid="tab-marketing" className="whitespace-nowrap">Lead Gen</TabsTrigger>
              <TabsTrigger value="calculator" data-testid="tab-calculator" className="whitespace-nowrap">Calculator</TabsTrigger>
              <TabsTrigger value="marketplace" data-testid="tab-marketplace" className="whitespace-nowrap">Marketplace</TabsTrigger>
              <TabsTrigger value="partners" data-testid="tab-partners" className="whitespace-nowrap">Partners</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Projects</p>
                      <p className="text-3xl font-bold text-brand-blue" data-testid="stat-total-projects">
                        {stats.totalProjects}
                      </p>
                    </div>
                    <Briefcase className="w-8 h-8 text-brand-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Active Permits</p>
                      <p className="text-3xl font-bold text-emerald-600" data-testid="stat-active-permits">
                        {stats.activePermits}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Leads Generated</p>
                      <p className="text-3xl font-bold text-purple-600" data-testid="stat-leads-generated">
                        {stats.leadsGenerated}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Properties Analyzed</p>
                      <p className="text-3xl font-bold text-orange-600" data-testid="stat-properties-analyzed">
                        {stats.propertiesAnalyzed}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-blue" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Access your most-used BuildwiseAI tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
                      data-testid={`quick-action-${index}`}
                    >
                      <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-xs text-neutral-600 mt-1">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-blue" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                    <p className="text-sm">Property analysis completed for 1234 Main St, Vancouver</p>
                    <Badge variant="outline" className="ml-auto text-xs">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <p className="text-sm">Bill 44 compliance check passed for Burnaby project</p>
                    <Badge variant="outline" className="ml-auto text-xs">4 hours ago</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <p className="text-sm">Social media campaign generated 12 new leads</p>
                    <Badge variant="outline" className="ml-auto text-xs">1 day ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Property Analyzer Tab */}
          <TabsContent value="property-analyzer">
            <AIPropertyAnalyzer />
          </TabsContent>

          {/* Zoning Intelligence Tab */}
          <TabsContent value="zoning">
            <ZoningIntelligence />
          </TabsContent>

          {/* Property Alerts Tab */}
          <TabsContent value="alerts">
            <PropertyAlerts />
          </TabsContent>

          {/* Financial Modeling Tab */}
          <TabsContent value="financial">
            <FinancialModeling />
          </TabsContent>

          {/* Marketing/Lead Generation Tab */}
          <TabsContent value="marketing">
            <LeadGenerationDashboard />
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <CalculatorDemo />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <ContractorSignupSection />
          </TabsContent>

          {/* Partners Tab - Premium Feature */}
          <TabsContent value="partners">
            <Partners />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}