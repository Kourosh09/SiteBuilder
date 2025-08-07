import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Briefcase, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building, 
  Hammer, 
  Zap, 
  Wrench, 
  PlusCircle,
  Search,
  Filter,
  Award,
  TrendingUp
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractorSchema, insertProjectSchema, insertBidSchema, type Contractor, type Project, type Bid } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contractorFormSchema = insertContractorSchema.extend({
  trades: z.array(z.string()).min(1, "Select at least one trade"),
  serviceAreas: z.array(z.string()).min(1, "Select at least one service area"),
});

const projectFormSchema = insertProjectSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const bidFormSchema = insertBidSchema.extend({
  validUntil: z.string().optional(),
});

type ContractorFormData = z.infer<typeof contractorFormSchema>;
type ProjectFormData = z.infer<typeof projectFormSchema>;
type BidFormData = z.infer<typeof bidFormSchema>;

const TRADE_OPTIONS = [
  'Framing', 'Plumbing', 'Electrical', 'Foundation', 'Roofing', 'Drywall', 
  'Flooring', 'Painting', 'HVAC', 'Concrete', 'Excavation', 'Landscaping',
  'Masonry', 'Insulation', 'Windows & Doors', 'Siding', 'Tile Work', 'Carpentry'
];

const BC_CITIES = [
  'Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Langley', 'North Vancouver', 
  'West Vancouver', 'Coquitlam', 'Port Coquitlam', 'Port Moody', 'Maple Ridge',
  'Mission', 'Abbotsford', 'Chilliwack', 'White Rock', 'Delta'
];

export default function ContractorMarketplace() {
  const [activeTab, setActiveTab] = useState("browse-projects");
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContractorRegisterOpen, setIsContractorRegisterOpen] = useState(false);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [isBidSubmitOpen, setIsBidSubmitOpen] = useState(false);
  
  // Search filters
  const [projectSearch, setProjectSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [contractorSearch, setContractorSearch] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: projectsResponse, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects", { searchTerm: projectSearch, tradeNeeded: tradeFilter, city: cityFilter, status: "Open" }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', 'Open');
      if (projectSearch) params.append('searchTerm', projectSearch);
      if (tradeFilter) params.append('tradeNeeded', tradeFilter);
      if (cityFilter) params.append('city', cityFilter);
      
      return await apiRequest(`/api/projects?${params.toString()}`);
    },
  });

  const { data: contractorsResponse, isLoading: contractorsLoading } = useQuery({
    queryKey: ["/api/contractors", { searchTerm: contractorSearch, isVerified: true }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('isVerified', 'true');
      if (contractorSearch) params.append('searchTerm', contractorSearch);
      
      return await apiRequest(`/api/contractors?${params.toString()}`);
    },
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["/api/dashboard/marketplace-stats"],
    queryFn: async () => await apiRequest("/api/dashboard/marketplace-stats"),
  });

  // Get data from responses
  const projects = projectsResponse?.data || [];
  const contractors = contractorsResponse?.data || [];
  const stats = statsResponse?.data;

  // Mutations
  const registerContractorMutation = useMutation({
    mutationFn: async (data: ContractorFormData) => {
      return await apiRequest("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Contractor registered successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/contractors"] });
      setIsContractorRegisterOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to register contractor",
        variant: "destructive" 
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return await apiRequest("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Project posted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectCreateOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive" 
      });
    },
  });

  const submitBidMutation = useMutation({
    mutationFn: async (data: BidFormData) => {
      return await apiRequest("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Bid submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
      setIsBidSubmitOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to submit bid",
        variant: "destructive" 
      });
    },
  });

  // Forms
  const contractorForm = useForm<ContractorFormData>({
    resolver: zodResolver(contractorFormSchema),
    defaultValues: {
      province: "BC",
      trades: [],
      serviceAreas: [],
      isActive: "true",
      isVerified: "false",
      availabilityStatus: "Available",
      rating: "0",
      totalJobs: "0",
    },
  });

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectType: "Residential",
      projectSize: "Medium",
      status: "Open",
      isUrgent: "false",
      permitRequired: "false",
    },
  });

  const bidForm = useForm<BidFormData>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      status: "Submitted",
      includedServices: [],
    },
  });

  const onSubmitContractor = (data: ContractorFormData) => {
    registerContractorMutation.mutate(data);
  };

  const onSubmitProject = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const onSubmitBid = (data: BidFormData) => {
    if (!selectedProject) return;
    
    submitBidMutation.mutate({
      ...data,
      projectId: selectedProject.id,
      // Note: In a real app, contractorId would come from authentication
      contractorId: "contractor-123", // Placeholder
    });
  };

  const getTradeIcon = (trade: string) => {
    const icons: Record<string, any> = {
      'Framing': Building,
      'Plumbing': Wrench,
      'Electrical': Zap,
      'Foundation': Hammer,
      'default': Briefcase,
    };
    return icons[trade] || icons.default;
  };

  return (
    <div className="space-y-6" data-testid="contractor-marketplace">
      {/* Dashboard Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-contractors">{stats.activeContractors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-open-projects">{stats.openProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bids This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-bids-month">{stats.totalBidsThisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Awarded</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-projects-awarded">{stats.projectsAwardedThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse-projects">Browse Projects</TabsTrigger>
          <TabsTrigger value="contractors">Find Contractors</TabsTrigger>
          <TabsTrigger value="post-project">Post Project</TabsTrigger>
          <TabsTrigger value="join-marketplace">Join as Contractor</TabsTrigger>
        </TabsList>

        <TabsContent value="browse-projects" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-8"
                data-testid="input-search-projects"
              />
            </div>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-48" data-testid="select-trade-filter">
                <SelectValue placeholder="Filter by trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Trades</SelectItem>
                {TRADE_OPTIONS.map((trade) => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-48" data-testid="select-city-filter">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {BC_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {projectsLoading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No projects found</div>
            ) : (
              projects.map((project: Project) => {
                const TradeIcon = getTradeIcon(project.tradeNeeded);
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TradeIcon className="h-5 w-5 text-brand-blue" />
                            <CardTitle className="text-lg" data-testid={`project-title-${project.id}`}>
                              {project.title}
                            </CardTitle>
                            {project.isUrgent === "true" && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            {project.location}, {project.city}
                          </CardDescription>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{project.projectType}</span>
                            <span>{project.projectSize}</span>
                            {project.estimatedBudget && <span>Budget: ${parseInt(project.estimatedBudget).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline">{project.tradeNeeded}</Badge>
                          <Button 
                            onClick={() => {
                              setSelectedProject(project);
                              setIsBidSubmitOpen(true);
                            }}
                            data-testid={`button-bid-${project.id}`}
                          >
                            Submit Bid
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{project.description}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Posted: {new Date(project.createdAt!).toLocaleDateString()}</span>
                        <span>Timeline: {project.timeline || "TBD"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors..."
                value={contractorSearch}
                onChange={(e) => setContractorSearch(e.target.value)}
                className="pl-8"
                data-testid="input-search-contractors"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contractorsLoading ? (
              <div className="col-span-full text-center py-8">Loading contractors...</div>
            ) : contractors.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No contractors found</div>
            ) : (
              contractors.map((contractor: Contractor) => (
                <Card key={contractor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {contractor.companyName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`contractor-name-${contractor.id}`}>
                          {contractor.companyName}
                        </CardTitle>
                        <CardDescription>{contractor.contactName}</CardDescription>
                      </div>
                      {contractor.isVerified === "true" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{contractor.rating}/5</span>
                        <span className="text-xs text-muted-foreground">({contractor.totalJobs} jobs)</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {contractor.city}, {contractor.province}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contractor.trades?.slice(0, 3).map((trade, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trade}
                          </Badge>
                        ))}
                        {(contractor.trades?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(contractor.trades?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{contractor.yearsExperience} years experience</span>
                      </div>
                      
                      <Badge className={
                        contractor.availabilityStatus === "Available" ? "bg-green-100 text-green-800" :
                        contractor.availabilityStatus === "Busy" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {contractor.availabilityStatus}
                      </Badge>
                    </div>
                    
                    {contractor.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {contractor.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="post-project">
          <Card>
            <CardHeader>
              <CardTitle>Post a New Project</CardTitle>
              <CardDescription>
                Post your project to connect with qualified contractors in BC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={projectForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-project-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={projectForm.control}
                      name="tradeNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Trade Needed</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-trade">
                                <SelectValue placeholder="Select primary trade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TRADE_OPTIONS.map((trade) => (
                                <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={4} data-testid="textarea-project-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={projectForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Street address" data-testid="input-project-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={projectForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-city">
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BC_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={projectForm.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Residential">Residential</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Industrial">Industrial</SelectItem>
                              <SelectItem value="Renovation">Renovation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={projectForm.control}
                      name="projectSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-size">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Small">Small</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={projectForm.control}
                      name="estimatedBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Optional" data-testid="input-project-budget" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={projectForm.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-client-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={projectForm.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-client-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                    {createProjectMutation.isPending ? "Posting..." : "Post Project"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join-marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Join BuildwiseAI Contractor Marketplace</CardTitle>
              <CardDescription>
                Register as a contractor to receive project opportunities matched to your expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...contractorForm}>
                <form onSubmit={contractorForm.handleSubmit(onSubmitContractor)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={contractorForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-company-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contractorForm.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={contractorForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-contractor-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contractorForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-contractor-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={contractorForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contractor-city">
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BC_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contractorForm.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" data-testid="input-years-experience" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={contractorForm.control}
                    name="trades"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trades & Specialties</FormLabel>
                        <div className="grid gap-2 md:grid-cols-3">
                          {TRADE_OPTIONS.map((trade) => (
                            <div key={trade} className="flex items-center space-x-2">
                              <Checkbox
                                id={`trade-${trade}`}
                                checked={field.value?.includes(trade)}
                                onCheckedChange={(checked) => {
                                  const currentTrades = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentTrades, trade]);
                                  } else {
                                    field.onChange(currentTrades.filter(t => t !== trade));
                                  }
                                }}
                                data-testid={`checkbox-trade-${trade.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                              <label htmlFor={`trade-${trade}`} className="text-sm">
                                {trade}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractorForm.control}
                    name="serviceAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Areas</FormLabel>
                        <div className="grid gap-2 md:grid-cols-4">
                          {BC_CITIES.map((city) => (
                            <div key={city} className="flex items-center space-x-2">
                              <Checkbox
                                id={`city-${city}`}
                                checked={field.value?.includes(city)}
                                onCheckedChange={(checked) => {
                                  const currentAreas = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentAreas, city]);
                                  } else {
                                    field.onChange(currentAreas.filter(c => c !== city));
                                  }
                                }}
                                data-testid={`checkbox-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                              <label htmlFor={`city-${city}`} className="text-sm">
                                {city}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contractorForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={4} data-testid="textarea-contractor-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={registerContractorMutation.isPending} data-testid="button-register-contractor">
                    {registerContractorMutation.isPending ? "Registering..." : "Register as Contractor"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bid Submission Dialog */}
      <Dialog open={isBidSubmitOpen} onOpenChange={setIsBidSubmitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedProject && `Submit your bid for: ${selectedProject.title}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...bidForm}>
            <form onSubmit={bidForm.handleSubmit(onSubmitBid)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={bidForm.control}
                  name="bidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bid Amount ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" data-testid="input-bid-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bidForm.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2-3 weeks" data-testid="input-bid-timeline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={bidForm.control}
                name="proposalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} data-testid="textarea-bid-proposal" 
                        placeholder="Describe your approach, experience, and why you're the right contractor for this project..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBidSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitBidMutation.isPending} data-testid="button-submit-bid">
                  {submitBidMutation.isPending ? "Submitting..." : "Submit Bid"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}