import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Bell,
  Search,
  Calendar,
  ExternalLink,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ComplianceRule {
  id: string;
  jurisdiction: string;
  category: "Zoning" | "Building Code" | "Environmental" | "Safety" | "Accessibility";
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  impact: "Low" | "Medium" | "High";
  applicableTo: string[];
  requirements: string[];
  penalties: string;
  status: "Active" | "Proposed" | "Under Review" | "Expired";
}

interface RegulationUpdate {
  id: string;
  jurisdiction: string;
  title: string;
  summary: string;
  category: string;
  effectiveDate: string;
  impactLevel: "Low" | "Medium" | "High";
  affectedProjectTypes: string[];
  actionRequired: string;
  deadline?: string;
  sourceUrl: string;
  createdAt: string;
}

export default function RegulatoryCompliance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rules");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [complianceCheck, setComplianceCheck] = useState({
    propertyAddress: "",
    projectType: "",
    jurisdiction: ""
  });

  const jurisdictions = ["Vancouver", "Surrey", "Burnaby", "Richmond", "Langley", "British Columbia"];
  const categories = ["Zoning", "Building Code", "Environmental", "Safety", "Accessibility"];
  const projectTypes = ["Single Family", "Duplex", "Triplex", "4-plex", "Multi-family", "Mixed Use"];

  // Fetch compliance rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/compliance/rules", selectedJurisdiction, selectedCategory],
    retry: false,
  });

  // Fetch recent updates
  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["/api/compliance/updates", selectedJurisdiction],
    retry: false,
  });

  // Compliance check mutation
  const checkComplianceMutation = useMutation({
    mutationFn: async (checkData: any) => {
      const response = await fetch("/api/compliance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: `project_${Date.now()}`,
          ...checkData
        })
      });
      if (!response.ok) throw new Error("Failed to perform compliance check");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Compliance Check Complete",
        description: "Your project compliance analysis is ready!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to perform compliance check. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await fetch("/api/compliance/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData)
      });
      if (!response.ok) throw new Error("Failed to create alert");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert Created",
        description: "You'll receive notifications about regulatory changes!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create compliance alert. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleComplianceCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkComplianceMutation.mutate(complianceCheck);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Proposed": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Expired": return "bg-gray-100 text-gray-800";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Regulatory Compliance</h2>
          <p className="text-neutral-600">Stay compliant with BC housing regulations and building codes</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules" data-testid="tab-rules">Rules & Codes</TabsTrigger>
          <TabsTrigger value="updates" data-testid="tab-updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="checker" data-testid="tab-checker">Compliance Check</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Set Alerts</TabsTrigger>
        </TabsList>

        {/* Rules & Codes Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Filter Regulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger data-testid="select-jurisdiction">
                      <SelectValue placeholder="All jurisdictions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All jurisdictions</SelectItem>
                      {jurisdictions.map(jurisdiction => (
                        <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules List */}
          {rulesLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading compliance rules...</div>
              </CardContent>
            </Card>
          ) : (rules as ComplianceRule[]).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
                <p className="text-neutral-600">Try adjusting your filters to see more regulations</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(rules as ComplianceRule[]).map((rule) => (
                <Card key={rule.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <CardDescription>{rule.jurisdiction} • {rule.category}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(rule.impact)}>
                          {rule.impact} Impact
                        </Badge>
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 mb-4">{rule.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
                          {rule.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1">Applicable To:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rule.applicableTo.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {rule.penalties && (
                        <div>
                          <h4 className="font-semibold mb-1 text-red-600">Penalties:</h4>
                          <p className="text-sm text-red-600">{rule.penalties}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-neutral-500">
                      <span>Effective: {new Date(rule.effectiveDate).toLocaleDateString()}</span>
                      <span>Updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Updates Tab */}
        <TabsContent value="updates" className="space-y-4">
          {updatesLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading recent updates...</div>
              </CardContent>
            </Card>
          ) : (updates as RegulationUpdate[]).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recent Updates</h3>
                <p className="text-neutral-600">No new regulatory updates in the selected period</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(updates as RegulationUpdate[]).map((update) => (
                <Card key={update.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <CardDescription>{update.jurisdiction} • {update.category}</CardDescription>
                      </div>
                      <Badge className={getImpactColor(update.impactLevel)}>
                        {update.impactLevel} Impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 mb-4">{update.summary}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">Affected Project Types:</h4>
                        <div className="flex flex-wrap gap-1">
                          {update.affectedProjectTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1 text-blue-600">Action Required:</h4>
                        <p className="text-sm text-blue-600">{update.actionRequired}</p>
                      </div>
                      
                      {update.deadline && (
                        <div className="flex items-center gap-2 text-red-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            Deadline: {new Date(update.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="text-sm text-neutral-500">
                        <span>Effective: {new Date(update.effectiveDate).toLocaleDateString()}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Source
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compliance Check Tab */}
        <TabsContent value="checker" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Project Compliance Check
              </CardTitle>
              <CardDescription>
                Analyze your project against current regulations and building codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplianceCheck} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Input
                      id="propertyAddress"
                      value={complianceCheck.propertyAddress}
                      onChange={(e) => setComplianceCheck(prev => ({ ...prev, propertyAddress: e.target.value }))}
                      placeholder="123 Main Street, Vancouver"
                      required
                      data-testid="input-property-address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select 
                      value={complianceCheck.projectType} 
                      onValueChange={(value) => setComplianceCheck(prev => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger data-testid="select-project-type">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Select 
                    value={complianceCheck.jurisdiction} 
                    onValueChange={(value) => setComplianceCheck(prev => ({ ...prev, jurisdiction: value }))}
                  >
                    <SelectTrigger data-testid="select-jurisdiction-check">
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map(jurisdiction => (
                        <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={checkComplianceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-check-compliance"
                  >
                    {checkComplianceMutation.isPending ? "Checking..." : "Check Compliance"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results would be displayed here */}
          {checkComplianceMutation.data && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Compliance Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-neutral-600">
                    Compliance check completed successfully. Review the results above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Regulatory Change Alerts
              </CardTitle>
              <CardDescription>
                Get notified when regulations change in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <Select defaultValue="">
                      <SelectTrigger data-testid="select-alert-jurisdiction">
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map(jurisdiction => (
                          <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      data-testid="input-alert-email"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Categories to Monitor</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="cursor-pointer px-3 py-2 justify-center hover:bg-blue-50"
                        data-testid={`category-${category.toLowerCase()}`}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => createAlertMutation.mutate({
                      jurisdiction: "Vancouver",
                      categories: ["Zoning", "Building Code"],
                      email: "demo@example.com"
                    })}
                    disabled={createAlertMutation.isPending}
                    data-testid="button-create-alert"
                  >
                    {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Stay Informed</h4>
                  <p className="text-sm text-neutral-600">
                    Regulatory alerts help you stay ahead of changes that could impact your projects. 
                    We'll notify you about new rules, deadlines, and compliance requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}