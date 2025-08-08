import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, Phone, Mail, ExternalLink, Star, Award, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Partner {
  id: string;
  name: string;
  type: 'architect' | 'engineer' | 'contractor' | 'developer' | 'lawyer' | 'realtor';
  specialty: string[];
  city: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  projectsCompleted: number;
  phone: string;
  email: string;
  website?: string;
  licenseNumber: string;
  certifications: string[];
  recentProjects: {
    name: string;
    type: string;
    value: number;
    completedYear: number;
  }[];
  bio: string;
  avatar?: string;
  verified: boolean;
}

const PROFESSIONAL_TYPES = [
  'All Types',
  'Architects',
  'Engineers', 
  'Contractors',
  'Developers',
  'Lawyers',
  'Realtors'
];

const BC_CITIES = [
  'All Cities',
  'Vancouver',
  'Burnaby', 
  'Richmond',
  'Surrey',
  'Maple Ridge',
  'Coquitlam',
  'Port Coquitlam',
  'Port Moody',
  'Mission'
];

export default function Partners() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const { data: partners, isLoading } = useQuery({
    queryKey: ['/api/partners', searchTerm, selectedType, selectedCity],
    enabled: !!user
  });

  if (authLoading) return <div>Loading...</div>;

  // For demo purposes, allow access without authentication
  // In production, this would require authenticated paying customers
  const mockUser = { id: 'demo-user', name: 'Demo User' };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Partners & Trade Professionals
          </h1>
          <p className="text-lg text-gray-600">
            Connect with BC's premier architects, engineers, contractors, and developers
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Name or Specialty"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-partner-search"
                />
              </div>

              {/* Professional Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="select-professional-type">
                  <SelectValue placeholder="Professional Type" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {BC_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : partners && partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner: Partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {partner.name}
                        {partner.verified && (
                          <Award className="inline-block ml-2 h-4 w-4 text-blue-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 capitalize mb-2">
                        {partner.type} • {partner.city}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{partner.rating}</span>
                          <span className="ml-1">({partner.reviewCount})</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{partner.yearsExperience}y exp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {partner.specialty.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {partner.specialty.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.specialty.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {partner.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Projects:</span>
                      <span className="ml-1 font-medium">{partner.projectsCompleted}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">License:</span>
                      <span className="ml-1 font-medium text-xs">{partner.licenseNumber}</span>
                    </div>
                  </div>

                  {partner.recentProjects.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Projects</h4>
                      <div className="space-y-1">
                        {partner.recentProjects.slice(0, 2).map((project, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <span className="font-medium">{project.name}</span>
                            <span className="ml-2">${project.value.toLocaleString()}</span>
                            <span className="ml-2">({project.completedYear})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{partner.city}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${partner.phone}`} className="hover:text-blue-600">
                        {partner.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${partner.email}`} className="hover:text-blue-600">
                        {partner.email}
                      </a>
                    </div>
                    {partner.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid={`button-contact-${partner.id}`}
                    >
                      Contact Professional
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid={`button-view-profile-${partner.id}`}
                    >
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or expanding your location range.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All Types');
                  setSelectedCity('All Cities');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}