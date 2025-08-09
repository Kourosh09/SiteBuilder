import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, CheckCircle, Clock, X } from "lucide-react";

interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  trades: string[];
  serviceAreas: string[];
  yearsExperience: string;
  businessLicense: string | null;
  isActive: string;
  isVerified: string;
  availabilityStatus: string;
  createdAt: string;
}

export default function ContractorApplications() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    try {
      const response = await fetch('/api/contractors');
      const data = await response.json();
      if (data.success) {
        setContractors(data.data);
      } else {
        setError('Failed to load contractor applications');
      }
    } catch (err) {
      setError('Failed to load contractor applications');
      console.error('Error loading contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isVerified: string, isActive: string) => {
    if (isVerified === "true") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (isActive === "true") return <Clock className="w-4 h-4 text-yellow-500" />;
    return <X className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (isVerified: string, isActive: string) => {
    if (isVerified === "true") return "Verified";
    if (isActive === "true") return "Pending Review";
    return "Inactive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contractor Applications</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading applications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contractor Applications</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadContractors} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contractor Applications</h1>
            <p className="text-neutral-600 mt-2">
              {contractors.length} total applications submitted
            </p>
          </div>
          <Button onClick={loadContractors} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {contractors.map((contractor) => (
            <Card key={contractor.id} data-testid={`contractor-card-${contractor.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {contractor.companyName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {contractor.contactName} • Applied {formatDate(contractor.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(contractor.isVerified, contractor.isActive)}
                    <span className="text-sm font-medium">
                      {getStatusText(contractor.isVerified, contractor.isActive)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <a href={`mailto:${contractor.email}`} className="text-blue-600 hover:underline">
                        {contractor.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-neutral-500" />
                      <a href={`tel:${contractor.phone}`} className="text-blue-600 hover:underline">
                        {contractor.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      <span>{contractor.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span>{contractor.yearsExperience} experience</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Trades & Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {contractor.trades.map((trade) => (
                          <Badge key={trade} variant="secondary">
                            {trade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Service Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {contractor.serviceAreas.map((area) => (
                          <Badge key={area} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {contractor.businessLicense && (
                      <div>
                        <h4 className="font-medium mb-1">License #</h4>
                        <span className="text-sm text-neutral-600">
                          {contractor.businessLicense}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`button-approve-${contractor.id}`}
                  >
                    Approve Application
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                    data-testid={`button-contact-${contractor.id}`}
                  >
                    Contact Contractor
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-600 text-red-700 hover:bg-red-50"
                    data-testid={`button-reject-${contractor.id}`}
                  >
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contractors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-neutral-600">
                Contractor applications will appear here once they submit through the signup form.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}