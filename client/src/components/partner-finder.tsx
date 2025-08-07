import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MapPin, 
  Star,
  Building,
  Search,
  Phone,
  Mail,
  Globe,
  Award,
  Briefcase
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  company: string;
  type: 'architect' | 'engineer' | 'contractor' | 'developer';
  city: string;
  rating: number;
  reviews: number;
  specialties: string[];
  phone: string;
  email: string;
  website?: string;
  projects: number;
  experience: string;
  description: string;
}

export default function PartnerFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  // Mock partner data - would come from CRM/database
  const partners: Partner[] = [
    {
      id: "ARCH-001",
      name: "Sarah Chen",
      company: "Chen Architecture Studio",
      type: "architect",
      city: "Vancouver",
      rating: 4.8,
      reviews: 24,
      specialties: ["Multi-family", "Bill 44 Compliance", "Transit-Oriented Development"],
      phone: "(604) 555-0123",
      email: "sarah@chenarch.com",
      website: "chenarchitecture.com",
      projects: 47,
      experience: "12 years",
      description: "Specialized in Bill 44 compliant multi-family developments with focus on sustainable design."
    },
    {
      id: "ENG-002",
      name: "Michael Thompson",
      company: "Thompson Structural Engineering",
      type: "engineer",
      city: "Burnaby",
      rating: 4.9,
      reviews: 31,
      specialties: ["Structural Engineering", "Seismic Design", "Wood Frame Construction"],
      phone: "(604) 555-0456",
      email: "mike@thompsoneng.com",
      projects: 89,
      experience: "18 years",
      description: "Expert in BC Building Code compliance and cost-effective structural solutions."
    },
    {
      id: "CON-003",
      name: "Lisa Rodriguez",
      company: "Rodriguez Construction Ltd",
      type: "contractor",
      city: "Surrey",
      rating: 4.7,
      reviews: 42,
      specialties: ["Multi-family Construction", "Energy Efficiency", "Bill 44 Projects"],
      phone: "(604) 555-0789",
      email: "lisa@rodriguezcon.com",
      website: "rodriguezcontruction.ca",
      projects: 156,
      experience: "22 years",
      description: "Premier contractor for multi-family developments throughout BC Lower Mainland."
    },
    {
      id: "DEV-004",
      name: "David Kim",
      company: "Kim Development Group",
      type: "developer",
      city: "Richmond",
      rating: 4.6,
      reviews: 18,
      specialties: ["Joint Ventures", "Land Assembly", "Transit-Oriented Development"],
      phone: "(604) 555-0321",
      email: "david@kimdevelopment.com",
      website: "kimdevelopment.com",
      projects: 34,
      experience: "15 years",
      description: "Experienced developer seeking joint venture partners for innovative housing projects."
    }
  ];

  const cities = ["Vancouver", "Burnaby", "Surrey", "Richmond", "Coquitlam", "Langley"];
  const types = [
    { value: "architect", label: "Architects" },
    { value: "engineer", label: "Engineers" },
    { value: "contractor", label: "Contractors" },
    { value: "developer", label: "Developers" }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'architect':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'engineer':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'contractor':
        return <Briefcase className="w-5 h-5 text-orange-600" />;
      case 'developer':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'architect':
        return 'bg-blue-100 text-blue-800';
      case 'engineer':
        return 'bg-green-100 text-green-800';
      case 'contractor':
        return 'bg-orange-100 text-orange-800';
      case 'developer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || partner.type === selectedType;
    const matchesCity = selectedCity === "all" || partner.city === selectedCity;
    return matchesSearch && matchesType && matchesCity;
  });

  return (
    <section className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Find Partners & Trade Professionals
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Connect with BC's premier architects, engineers, contractors, and developers
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-blue" />
              Search Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-search">Search by Name or Specialty</Label>
                <Input
                  id="partner-search"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-partner-search"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-filter">Professional Type</Label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  data-testid="select-type-filter"
                >
                  <option value="all">All Types</option>
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-filter">City</Label>
                <select
                  id="city-filter"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  data-testid="select-partner-city-filter"
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

        {/* Partners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(partner.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900" data-testid={`partner-name-${partner.id}`}>
                          {partner.name}
                        </h3>
                        <p className="text-sm text-neutral-600" data-testid={`partner-company-${partner.id}`}>
                          {partner.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(partner.type)} data-testid={`partner-type-${partner.id}`}>
                      {partner.type}
                    </Badge>
                    <Badge variant="outline" data-testid={`partner-city-${partner.id}`}>
                      <MapPin className="w-3 h-3 mr-1" />
                      {partner.city}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating and Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold" data-testid={`partner-rating-${partner.id}`}>
                        {partner.rating}
                      </span>
                      <span className="text-sm text-neutral-600">
                        ({partner.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <span data-testid={`partner-projects-${partner.id}`}>{partner.projects} projects</span> • 
                    <span data-testid={`partner-experience-${partner.id}`}> {partner.experience}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-700" data-testid={`partner-description-${partner.id}`}>
                  {partner.description}
                </p>

                {/* Specialties */}
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs" data-testid={`partner-specialty-${partner.id}-${index}`}>
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span data-testid={`partner-phone-${partner.id}`}>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <span data-testid={`partner-email-${partner.id}`}>{partner.email}</span>
                  </div>
                  {partner.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-neutral-500" />
                      <span className="text-brand-blue" data-testid={`partner-website-${partner.id}`}>
                        {partner.website}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
                    data-testid={`button-contact-${partner.id}`}
                  >
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-portfolio-${partner.id}`}
                  >
                    View Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                No partners found
              </h3>
              <p className="text-neutral-500">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}