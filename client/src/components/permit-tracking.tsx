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
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, MapPin, Plus, Search, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPermitSchema, insertMilestoneSchema, type Permit, type Milestone, type Inspection } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const permitFormSchema = insertPermitSchema.extend({
  dueDate: z.string().optional(),
});

const milestoneFormSchema = insertMilestoneSchema.extend({
  dueDate: z.string().optional(),
});

type PermitFormData = z.infer<typeof permitFormSchema>;
type MilestoneFormData = z.infer<typeof milestoneFormSchema>;

export default function PermitTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [permitTypeFilter, setPermitTypeFilter] = useState<string>("");
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isCreatePermitOpen, setIsCreatePermitOpen] = useState(false);
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for permits
  const { data: permitsResponse, isLoading: permitsLoading } = useQuery({
    queryKey: ["/api/permits", { searchTerm, status: statusFilter, permitType: permitTypeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (permitTypeFilter) params.append('permitType', permitTypeFilter);
      
      const response = await apiRequest(`/api/permits?${params.toString()}`);
      return response;
    },
  });

  // Query for milestones
  const { data: milestonesResponse, isLoading: milestonesLoading } = useQuery({
    queryKey: ["/api/milestones", selectedPermit?.id],
    queryFn: async () => {
      const url = selectedPermit ? `/api/milestones?permitId=${selectedPermit.id}` : '/api/milestones';
      return await apiRequest(url);
    },
    enabled: !!selectedPermit,
  });

  // Query for dashboard stats
  const { data: statsResponse } = useQuery({
    queryKey: ["/api/dashboard/permit-stats"],
    queryFn: async () => await apiRequest("/api/dashboard/permit-stats"),
  });

  // Extract data from API responses
  const permits = permitsResponse?.data || [];
  const milestones = milestonesResponse?.data || [];
  const stats = statsResponse?.data;

  // Mutations
  const createPermitMutation = useMutation({
    mutationFn: async (data: PermitFormData) => {
      return await apiRequest("/api/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Permit created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
      setIsCreatePermitOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create permit",
        variant: "destructive" 
      });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: MilestoneFormData) => {
      return await apiRequest("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Milestone created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setIsCreateMilestoneOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create milestone",
        variant: "destructive" 
      });
    },
  });

  const updatePermitStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/permits/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Permit status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
    },
  });

  // Forms
  const permitForm = useForm<PermitFormData>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      permitType: "Building",
      status: "Applied",
      municipality: "",
      address: "",
      permitNumber: "",
    },
  });

  const milestoneForm = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      category: "Permit",
      status: "Pending",
      priority: "Medium",
    },
  });

  const onSubmitPermit = (data: PermitFormData) => {
    createPermitMutation.mutate(data);
  };

  const onSubmitMilestone = (data: MilestoneFormData) => {
    createMilestoneMutation.mutate({
      ...data,
      permitId: selectedPermit?.id,
      dueDate: data.dueDate,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Issued": return "bg-emerald-100 text-emerald-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Pending": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Delayed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6" data-testid="permit-tracking-dashboard">
      {/* Dashboard Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Permits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-permits">{stats.activePermits || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Milestones</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue-milestones">{stats.overdueMilestones || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-upcoming-inspections">{stats.upcomingInspections || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Milestones</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="stat-critical-milestones">{stats.criticalMilestones || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="permits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="space-y-4">
          {/* Filters and Create Button */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-permits"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={permitTypeFilter} onValueChange={setPermitTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Building">Building</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Demolition">Demolition</SelectItem>
                <SelectItem value="Renovation">Renovation</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreatePermitOpen} onOpenChange={setIsCreatePermitOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-permit">
                  <Plus className="h-4 w-4 mr-2" />
                  New Permit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Permit</DialogTitle>
                  <DialogDescription>
                    Add a new permit to track its progress through the approval process.
                  </DialogDescription>
                </DialogHeader>
                <Form {...permitForm}>
                  <form onSubmit={permitForm.handleSubmit(onSubmitPermit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={permitForm.control}
                        name="permitNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permit Number</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-permit-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={permitForm.control}
                        name="permitType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permit Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-permit-type">
                                  <SelectValue placeholder="Select permit type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Building">Building</SelectItem>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Demolition">Demolition</SelectItem>
                                <SelectItem value="Renovation">Renovation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={permitForm.control}
                        name="municipality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Municipality</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-municipality" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={permitForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={permitForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} data-testid="textarea-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreatePermitOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPermitMutation.isPending} data-testid="button-submit-permit">
                        {createPermitMutation.isPending ? "Creating..." : "Create Permit"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Permits List */}
          <div className="grid gap-4">
            {permitsLoading ? (
              <div className="text-center py-8">Loading permits...</div>
            ) : !permits || permits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No permits found</div>
            ) : (
              permits.map((permit: Permit) => (
                <Card key={permit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPermit(permit)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg" data-testid={`permit-title-${permit.id}`}>
                          {permit.permitNumber} - {permit.permitType}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4" />
                          {permit.address}, {permit.municipality}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(permit.status!)} data-testid={`permit-status-${permit.id}`}>
                        {permit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{permit.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Applied: {new Date(permit.applicationDate!).toLocaleDateString()}</span>
                      {permit.estimatedValue && <span>Value: ${parseInt(permit.estimatedValue).toLocaleString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Milestones</h2>
              <p className="text-muted-foreground">
                {selectedPermit ? `Showing milestones for ${selectedPermit.permitNumber}` : "Select a permit to view milestones"}
              </p>
            </div>
            {selectedPermit && (
              <Dialog open={isCreateMilestoneOpen} onOpenChange={setIsCreateMilestoneOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-milestone">
                    <Plus className="h-4 w-4 mr-2" />
                    New Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Milestone</DialogTitle>
                    <DialogDescription>
                      Add a milestone for {selectedPermit.permitNumber}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...milestoneForm}>
                    <form onSubmit={milestoneForm.handleSubmit(onSubmitMilestone)} className="space-y-4">
                      <FormField
                        control={milestoneForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-milestone-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={milestoneForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} data-testid="textarea-milestone-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={milestoneForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-milestone-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Permit">Permit</SelectItem>
                                  <SelectItem value="Construction">Construction</SelectItem>
                                  <SelectItem value="Inspection">Inspection</SelectItem>
                                  <SelectItem value="Completion">Completion</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={milestoneForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-milestone-priority">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={milestoneForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-milestone-due-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateMilestoneOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMilestoneMutation.isPending} data-testid="button-submit-milestone">
                          {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Milestones List */}
          <div className="grid gap-4">
            {milestonesLoading ? (
              <div className="text-center py-8">Loading milestones...</div>
            ) : !selectedPermit ? (
              <div className="text-center py-8 text-muted-foreground">Select a permit to view its milestones</div>
            ) : !milestones || milestones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No milestones found for this permit</div>
            ) : (
              milestones.map((milestone: Milestone) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg" data-testid={`milestone-title-${milestone.id}`}>
                          {milestone.title}
                        </CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(milestone.priority!)} data-testid={`milestone-priority-${milestone.id}`}>
                          {milestone.priority}
                        </Badge>
                        <Badge className={getStatusColor(milestone.status!)} data-testid={`milestone-status-${milestone.id}`}>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Category: {milestone.category}</span>
                      {milestone.dueDate && (
                        <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                      )}
                      {milestone.assignedTo && <span>Assigned: {milestone.assignedTo}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Comprehensive timeline view of all project milestones and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Timeline view coming soon. This will show a comprehensive Gantt chart style view of all project milestones.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}