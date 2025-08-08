import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Clock, CheckCircle, AlertTriangle, Search, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SupportMessage {
  id: string;
  name: string;
  email: string;
  type: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: Date;
}

export function SupportDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<SupportMessage[]>({
    queryKey: ['/api/support/messages'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/support/messages/${id}/status`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/messages'] });
      toast({
        title: "Status Updated",
        description: "Support message status has been updated.",
      });
    }
  });

  const filteredMessages = messages.filter((msg: SupportMessage) => {
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || msg.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStats = () => {
    const stats = (messages as SupportMessage[]).reduce((acc: any, msg: SupportMessage) => {
      acc.total++;
      acc[msg.status] = (acc[msg.status] || 0) + 1;
      acc[msg.priority] = (acc[msg.priority] || 0) + 1;
      return acc;
    }, { total: 0, new: 0, in_progress: 0, resolved: 0, urgent: 0, high: 0, medium: 0, low: 0 });

    return stats;
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-orange-600">{stats.new}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Support Messages</CardTitle>
          <CardDescription>
            Manage customer support requests and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-messages"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40" data-testid="select-priority-filter">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No support messages found</p>
              </div>
            ) : (
              filteredMessages.map((message: SupportMessage) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(message.status)}
                          <h3 className="font-semibold">{message.subject}</h3>
                          <Badge variant={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>From:</strong> {message.name} ({message.email})</p>
                          <p><strong>Type:</strong> {message.type.charAt(0).toUpperCase() + message.type.slice(1)}</p>
                          <p><strong>Created:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {message.status !== 'resolved' && (
                          <>
                            {message.status === 'new' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ id: message.id, status: 'in_progress' })}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-start-${message.id}`}
                              >
                                Start
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: message.id, status: 'resolved' })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-resolve-${message.id}`}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}