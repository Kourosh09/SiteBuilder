import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MapPin, 
  Calendar,
  Building,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Permit {
  id: string;
  address: string;
  city: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  applicationDate: string;
  estimatedCompletion: string;
  value: number;
  units: number;
  description: string;
}

export default function PermitTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  // Mock permit data - would come from BC municipal APIs
  const permits: Permit[] = [
    {
      id: "PT-2025-001",
      address: "1234 Main Street",
      city: "Vancouver",
      type: "Multi-family Residential",
      status: "under-review",
      applicationDate: "2025-01-15",
      estimatedCompletion: "2025-03-15",
      value: 2400000,
      units: 6,
      description: "6-unit townhouse development with Bill 44 compliance"
    },
    {
      id: "PT-2025-002", 
      address: "5678 Oak Avenue",
      city: "Burnaby",
      type: "Duplex",
      status: "approved",
      applicationDate: "2024-12-20",
      estimatedCompletion: "2025-02-20",
      value: 1200000,
      units: 2,
      description: "Secondary suite conversion project"
    },
    {
      id: "PT-2025-003",
      address: "9876 Pine Street",
      city: "Surrey",
      type: "4-plex",
      status: "pending",
      applicationDate: "2025-01-10",
      estimatedCompletion: "2025-04-10",
      value: 1800000,
      units: 4,
      description: "New 4-plex construction under Bill 44"
    },
    {
      id: "PT-2025-004",
      address: "2468 Elm Drive",
      city: "Richmond",
      type: "Townhouse",
      status: "approved",
      applicationDate: "2024-11-05",
      estimatedCompletion: "2025-01-05",
      value: 3200000,
      units: 8,
      description: "8-unit townhouse complex with transit-oriented bonuses"
    }
  ];

  const cities = ["Vancouver", "Burnaby", "Surrey", "Richmond", "Coquitlam", "Langley"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'under-review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "all" || permit.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const stats = {
    total: permits.length,
    approved: permits.filter(p => p.status === 'approved').length,
    pending: permits.filter(p => p.status === 'pending').length,
    underReview: permits.filter(p => p.status === 'under-review').length
  };

  return (
    <section className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            BC Permit Tracker
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Monitor development applications across BC municipalities - BuildMapper style
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Permits</p>
                  <p className="text-3xl font-bold text-brand-blue" data-testid="stat-total-permits">
                    {stats.total}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-brand-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600" data-testid="stat-approved-permits">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Under Review</p>
                  <p className="text-3xl font-bold text-yellow-600" data-testid="stat-review-permits">
                    {stats.underReview}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="stat-pending-permits">
                    {stats.pending}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-blue" />
              Search & Filter Permits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search by Address or Description</Label>
                <Input
                  id="search"
                  placeholder="Search permits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-permit-search"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-filter">Filter by City</Label>
                <select
                  id="city-filter"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  data-testid="select-city-filter"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permits List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-blue" />
              Active Permits ({filteredPermits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPermits.map((permit) => (
                <div key={permit.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900" data-testid={`permit-address-${permit.id}`}>
                          {permit.address}
                        </h3>
                        <Badge variant="outline" data-testid={`permit-city-${permit.id}`}>
                          {permit.city}
                        </Badge>
                        <Badge className={getStatusColor(permit.status)} data-testid={`permit-status-${permit.id}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(permit.status)}
                            {permit.status.replace('-', ' ')}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-neutral-600 mb-3" data-testid={`permit-description-${permit.id}`}>
                        {permit.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-neutral-600">Type</p>
                          <p data-testid={`permit-type-${permit.id}`}>{permit.type}</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-600">Units</p>
                          <p data-testid={`permit-units-${permit.id}`}>{permit.units}</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-600">Value</p>
                          <p className="text-emerald-600 font-semibold" data-testid={`permit-value-${permit.id}`}>
                            ${permit.value.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-600">Application Date</p>
                          <p data-testid={`permit-date-${permit.id}`}>
                            {new Date(permit.applicationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>Est. Completion: {new Date(permit.estimatedCompletion).toLocaleDateString()}</span>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-permit-${permit.id}`}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}