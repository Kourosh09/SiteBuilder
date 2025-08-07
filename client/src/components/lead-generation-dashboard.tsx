import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Target, 
  Mail, 
  Share2, 
  BarChart3,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  ThumbsUp,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted";
  score: number;
  notes: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "ads";
  status: "draft" | "active" | "paused" | "completed";
  leads: number;
  engagement: number;
  conversions: number;
  createdAt: string;
}

export default function LeadGenerationDashboard() {
  const [activeLeadTab, setActiveLeadTab] = useState("leads");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "email" as "email" | "social" | "ads",
    content: "",
    targetAudience: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for leads
  const { data: leadsResponse, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Query for campaigns
  const { data: campaignsResponse, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Generate lead mutation
  const generateLeadMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      return await apiRequest("/api/campaigns", "POST", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Campaign Created",
        description: "Your lead generation campaign is now active!",
      });
      setNewCampaign({ name: "", type: "email", content: "", targetAudience: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leads: Lead[] = leadsResponse?.data || [];
  const campaigns: Campaign[] = campaignsResponse?.data || [];

  const leadStats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "new").length,
    qualifiedLeads: leads.filter(l => l.status === "qualified").length,
    conversions: leads.filter(l => l.status === "converted").length,
  };

  const getStatusBadge = (status: Lead["status"]) => {
    const statusConfig = {
      new: { label: "New", variant: "secondary" as const },
      contacted: { label: "Contacted", variant: "outline" as const },
      qualified: { label: "Qualified", variant: "default" as const },
      converted: { label: "Converted", variant: "default" as const, className: "bg-green-600" },
    };
    return statusConfig[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Lead Generation Center</h2>
          <p className="text-neutral-600">Manage leads, campaigns, and social media automation</p>
        </div>
        <Button
          onClick={() => setActiveLeadTab("create")}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-new-campaign"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Leads</p>
                <p className="text-2xl font-bold text-blue-600">{leadStats.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">New Leads</p>
                <p className="text-2xl font-bold text-orange-600">{leadStats.newLeads}</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{leadStats.qualifiedLeads}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Conversions</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.conversions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeLeadTab} onValueChange={setActiveLeadTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>View and manage all your property development leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No leads yet. Create a campaign to start generating leads.</p>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-neutral-600">{lead.email}</p>
                          <p className="text-xs text-neutral-500">Source: {lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">Score: {lead.score}/100</p>
                          <p className="text-xs text-neutral-500">{lead.createdAt}</p>
                        </div>
                        <Badge {...getStatusBadge(lead.status)}>
                          {getStatusBadge(lead.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Monitor your lead generation campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No campaigns yet. Create your first campaign to start generating leads.</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-neutral-600 capitalize">{campaign.type} Campaign</p>
                        </div>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{campaign.leads}</p>
                          <p className="text-xs text-neutral-600">Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{campaign.engagement}%</p>
                          <p className="text-xs text-neutral-600">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{campaign.conversions}</p>
                          <p className="text-xs text-neutral-600">Conversions</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-sm text-neutral-600">Property showcase post</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2.4k</p>
                    <p className="text-sm text-neutral-600">Reach</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-neutral-600">Development progress video</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">3.2k</p>
                    <p className="text-sm text-neutral-600">Views</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-sm text-neutral-600">Industry insights article</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">1.8k</p>
                    <p className="text-sm text-neutral-600">Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Post Scheduler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select defaultValue="facebook">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Post Content</Label>
                  <Textarea
                    placeholder="What would you like to share with your audience?"
                    className="min-h-[100px]"
                  />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Launch a new lead generation campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="e.g., Vancouver Luxury Condos"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value: "email" | "social" | "ads") => 
                      setNewCampaign({ ...newCampaign, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="ads">Paid Advertising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                  placeholder="e.g., First-time homebuyers in Vancouver"
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Content</Label>
                <Textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  placeholder="Enter your campaign message..."
                  className="min-h-[120px]"
                />
              </div>

              <Button
                onClick={() => generateLeadMutation.mutate(newCampaign)}
                disabled={generateLeadMutation.isPending || !newCampaign.name || !newCampaign.content}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {generateLeadMutation.isPending ? "Creating Campaign..." : "Launch Campaign"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}