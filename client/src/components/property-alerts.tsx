import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Plus, 
  Settings, 
  TrendingUp, 
  MapPin,
  Home,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  criteria: {
    minLotSize?: number;
    maxLotSize?: number;
    minPrice?: number;
    maxPrice?: number;
    cities: string[];
    zoningCodes: string[];
    developmentPotential: {
      minUnits?: number;
      maxUnits?: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  matchCount: number;
}

interface PropertyMatch {
  id: string;
  alertId: string;
  property: {
    address: string;
    city: string;
    price: number;
    lotSize: number;
    zoning: string;
    listingDate: string;
    daysOnMarket: number;
    developmentPotential: {
      maxUnits: number;
      bill44Eligible: boolean;
      estimatedValue: number;
    };
  };
  matchScore: number;
  matchedAt: string;
}

export default function PropertyAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("alerts");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newAlert, setNewAlert] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    minLotSize: "",
    maxLotSize: "",
    cities: [] as string[],
    zoningCodes: [] as string[],
    minUnits: "",
    maxUnits: ""
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/property-alerts"],
    retry: false,
  });

  // Fetch matches for selected alert
  const { data: matches = [] } = useQuery({
    queryKey: ["/api/property-alerts", selectedAlert, "matches"],
    enabled: !!selectedAlert,
    retry: false,
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await fetch("/api/property-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData)
      });
      if (!response.ok) throw new Error("Failed to create alert");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-alerts"] });
      setShowCreateForm(false);
      resetForm();
      toast({
        title: "Alert Created",
        description: "Your property alert has been created successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create property alert. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle alert status
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const response = await fetch(`/api/property-alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error("Failed to update alert");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-alerts"] });
    }
  });

  const cityOptions = ["Vancouver", "Burnaby", "Surrey", "Richmond", "Langley", "Coquitlam", "North Vancouver"];
  const zoningOptions = ["RS-1", "RS-2", "RS-3", "RS-5", "RS-6", "RM-1", "RM-2"];

  const handleCityToggle = (city: string) => {
    setNewAlert(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }));
  };

  const handleZoningToggle = (zoning: string) => {
    setNewAlert(prev => ({
      ...prev,
      zoningCodes: prev.zoningCodes.includes(zoning)
        ? prev.zoningCodes.filter(z => z !== zoning)
        : [...prev.zoningCodes, zoning]
    }));
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertData = {
      name: newAlert.name,
      criteria: {
        minPrice: newAlert.minPrice ? parseInt(newAlert.minPrice) : undefined,
        maxPrice: newAlert.maxPrice ? parseInt(newAlert.maxPrice) : undefined,
        minLotSize: newAlert.minLotSize ? parseInt(newAlert.minLotSize) : undefined,
        maxLotSize: newAlert.maxLotSize ? parseInt(newAlert.maxLotSize) : undefined,
        cities: newAlert.cities,
        zoningCodes: newAlert.zoningCodes,
        developmentPotential: {
          minUnits: newAlert.minUnits ? parseInt(newAlert.minUnits) : undefined,
          maxUnits: newAlert.maxUnits ? parseInt(newAlert.maxUnits) : undefined,
        }
      },
      isActive: true
    };

    createAlertMutation.mutate(alertData);
  };

  const resetForm = () => {
    setNewAlert({
      name: "",
      minPrice: "",
      maxPrice: "",
      minLotSize: "",
      maxLotSize: "",
      cities: [],
      zoningCodes: [],
      minUnits: "",
      maxUnits: ""
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Property Alerts</h2>
          <p className="text-neutral-600">Get notified when properties matching your criteria become available</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-alert"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts" data-testid="tab-alerts">My Alerts</TabsTrigger>
          <TabsTrigger value="matches" data-testid="tab-matches">Recent Matches</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alertsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading alerts...</div>
              </CardContent>
            </Card>
          ) : (alerts as PropertyAlert[]).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Property Alerts</h3>
                <p className="text-neutral-600 mb-4">Create your first alert to get notified about new opportunities</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(alerts as PropertyAlert[]).map((alert: PropertyAlert) => (
                <Card key={alert.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          {alert.name}
                        </CardTitle>
                        <CardDescription>
                          Created {new Date(alert.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={(checked) => 
                            toggleAlertMutation.mutate({ alertId: alert.id, isActive: checked })
                          }
                          data-testid={`switch-alert-${alert.id}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {alert.criteria.minPrice && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Min: {formatCurrency(alert.criteria.minPrice)}</span>
                        </div>
                      )}
                      {alert.criteria.maxPrice && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-red-600" />
                          <span className="text-sm">Max: {formatCurrency(alert.criteria.maxPrice)}</span>
                        </div>
                      )}
                      {alert.criteria.minLotSize && (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Min: {alert.criteria.minLotSize} sq ft</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">{alert.matchCount} matches</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {alert.criteria.cities.map(city => (
                        <Badge key={city} variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {city}
                        </Badge>
                      ))}
                      {alert.criteria.zoningCodes.map(zoning => (
                        <Badge key={zoning} variant="outline">{zoning}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAlert(alert.id)}
                        data-testid={`button-view-matches-${alert.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Matches
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {alert.lastTriggered && (
                      <div className="mt-3 text-xs text-neutral-500">
                        Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  ← Back to All Alerts
                </Button>
                <span className="text-sm text-neutral-600">
                  Showing matches for selected alert
                </span>
              </div>

              {(matches as PropertyMatch[]).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
                    <p className="text-neutral-600">We'll notify you when properties matching your criteria become available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {(matches as PropertyMatch[]).map((match: PropertyMatch) => (
                    <Card key={match.id} className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{match.property.address}</h3>
                            <p className="text-neutral-600">{match.property.city}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {Math.round(match.matchScore * 100)}% Match
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-neutral-500">Price</p>
                            <p className="font-semibold">{formatCurrency(match.property.price)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Lot Size</p>
                            <p className="font-semibold">{match.property.lotSize.toLocaleString()} sq ft</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Max Units</p>
                            <p className="font-semibold">{match.property.developmentPotential.maxUnits}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Days on Market</p>
                            <p className="font-semibold">{match.property.daysOnMarket} days</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {match.property.developmentPotential.bill44Eligible && (
                              <Badge variant="secondary">Bill 44 Eligible</Badge>
                            )}
                            <Badge variant="outline">{match.property.zoning}</Badge>
                          </div>
                          <div className="text-sm text-neutral-500">
                            Matched {new Date(match.matchedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Alert</h3>
                <p className="text-neutral-600">Choose an alert from the Alerts tab to view its matches</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Alert Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Property Alert</CardTitle>
              <CardDescription>
                Set your criteria and we'll notify you when matching properties become available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAlert} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="alertName">Alert Name *</Label>
                  <Input
                    id="alertName"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Vancouver 4-plex Opportunities"
                    required
                    data-testid="input-alert-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={newAlert.minPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, minPrice: e.target.value }))}
                      placeholder="1000000"
                      data-testid="input-min-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={newAlert.maxPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, maxPrice: e.target.value }))}
                      placeholder="2000000"
                      data-testid="input-max-price"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLotSize">Min Lot Size (sq ft)</Label>
                    <Input
                      id="minLotSize"
                      type="number"
                      value={newAlert.minLotSize}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, minLotSize: e.target.value }))}
                      placeholder="5000"
                      data-testid="input-min-lot-size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLotSize">Max Lot Size (sq ft)</Label>
                    <Input
                      id="maxLotSize"
                      type="number"
                      value={newAlert.maxLotSize}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, maxLotSize: e.target.value }))}
                      placeholder="10000"
                      data-testid="input-max-lot-size"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Cities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cityOptions.map(city => (
                      <Badge
                        key={city}
                        variant={newAlert.cities.includes(city) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => handleCityToggle(city)}
                        data-testid={`city-${city.toLowerCase()}`}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Zoning Codes</Label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {zoningOptions.map(zoning => (
                      <Badge
                        key={zoning}
                        variant={newAlert.zoningCodes.includes(zoning) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => handleZoningToggle(zoning)}
                        data-testid={`zoning-${zoning.toLowerCase()}`}
                      >
                        {zoning}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    data-testid="button-cancel-alert"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAlertMutation.isPending}
                    data-testid="button-save-alert"
                  >
                    {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}