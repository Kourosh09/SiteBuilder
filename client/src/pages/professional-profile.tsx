import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Award, Users, Calendar, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalProfileProps {
  onBack: () => void;
}

export default function ProfessionalProfile({ onBack }: ProfessionalProfileProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    serviceAreas: [] as string[],
    trades: [] as string[],
    yearsExperience: "",
    licenseNumber: "",
    insuranceDetails: "",
    description: "",
    specializations: "",
    projectTypes: [] as string[],
    teamSize: "",
    previousProjects: ""
  });

  const availableCities = [
    "Vancouver", "Burnaby", "Richmond", "Surrey", "Maple Ridge",
    "Coquitlam", "Port Coquitlam", "Port Moody", "Mission"
  ];

  const availableTrades = [
    "Framing", "Carpentry", "Plumbing", "Electrical", "HVAC",
    "Roofing", "Flooring", "Painting", "Drywall", "Concrete",
    "Excavation", "Landscaping", "General Contracting"
  ];

  const projectTypes = [
    "Single Family Homes", "Townhouses", "Condominiums", "Multiplex (4-6 units)",
    "Commercial Buildings", "Renovations", "Additions", "Laneway Houses"
  ];

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest("POST", "/api/contractors", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created Successfully!",
        description: "Your professional profile has been submitted for review. You'll receive an email confirmation within 24 hours.",
      });
      // Reset form
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        city: "",
        serviceAreas: [],
        trades: [],
        yearsExperience: "",
        licenseNumber: "",
        insuranceDetails: "",
        description: "",
        specializations: "",
        projectTypes: [],
        teamSize: "",
        previousProjects: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Profile Creation Failed",
        description: error.message || "Unable to create profile. Please check all required fields and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone || !formData.city) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    if (formData.trades.length === 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please select at least one trade or service",
        variant: "destructive",
      });
      return;
    }

    createProfileMutation.mutate(formData);
  };

  const toggleArrayItem = (array: string[], item: string, setter: (newArray: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Professional Profile</h1>
            <p className="text-gray-600">Join BC's premier development professional network and connect with qualified projects</p>
            
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="default" className="bg-blue-600">
                $49/month
              </Badge>
              <Badge variant="outline">
                30-day free trial
              </Badge>
              <Badge variant="outline">
                Cancel anytime
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="Fraser Valley Framing Co."
                    required
                    data-testid="input-company-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Contact Name *
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Mike Thompson"
                    required
                    data-testid="input-contact-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="mike@fraserframing.ca"
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(604) 555-0123"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium">
                  Primary Location *
                </Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                  <SelectTrigger data-testid="select-city">
                    <SelectValue placeholder="Select your primary city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Service Areas
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCities.map(city => (
                    <label key={city} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.serviceAreas.includes(city)}
                        onChange={() => toggleArrayItem(
                          formData.serviceAreas, 
                          city, 
                          (newArray) => setFormData({...formData, serviceAreas: newArray})
                        )}
                        className="rounded"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trades & Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Trades & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Select Your Trades/Services *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTrades.map(trade => (
                    <label key={trade} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.trades.includes(trade)}
                        onChange={() => toggleArrayItem(
                          formData.trades, 
                          trade, 
                          (newArray) => setFormData({...formData, trades: newArray})
                        )}
                        className="rounded"
                      />
                      <span className="text-sm">{trade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsExperience" className="text-sm font-medium">
                    Years of Experience
                  </Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => setFormData({...formData, yearsExperience: value})}>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="teamSize" className="text-sm font-medium">
                    Team Size
                  </Label>
                  <Select value={formData.teamSize} onValueChange={(value) => setFormData({...formData, teamSize: value})}>
                    <SelectTrigger data-testid="select-team-size">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 people</SelectItem>
                      <SelectItem value="3-5">3-5 people</SelectItem>
                      <SelectItem value="6-10">6-10 people</SelectItem>
                      <SelectItem value="11-20">11-20 people</SelectItem>
                      <SelectItem value="20+">20+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="licenseNumber" className="text-sm font-medium">
                  License Number (if applicable)
                </Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="BC License #123456"
                  data-testid="input-license"
                />
              </div>

              <div>
                <Label htmlFor="insuranceDetails" className="text-sm font-medium">
                  Insurance Details
                </Label>
                <Textarea
                  id="insuranceDetails"
                  value={formData.insuranceDetails}
                  onChange={(e) => setFormData({...formData, insuranceDetails: e.target.value})}
                  placeholder="General liability, workers compensation, etc."
                  rows={3}
                  data-testid="textarea-insurance"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Types You Handle
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {projectTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.projectTypes.includes(type)}
                        onChange={() => toggleArrayItem(
                          formData.projectTypes, 
                          type, 
                          (newArray) => setFormData({...formData, projectTypes: newArray})
                        )}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Company Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us about your company, your approach to projects, and what sets you apart..."
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>

              <div>
                <Label htmlFor="specializations" className="text-sm font-medium">
                  Specializations & Unique Services
                </Label>
                <Textarea
                  id="specializations"
                  value={formData.specializations}
                  onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                  placeholder="Green building, heritage restoration, passive house construction, etc."
                  rows={3}
                  data-testid="textarea-specializations"
                />
              </div>

              <div>
                <Label htmlFor="previousProjects" className="text-sm font-medium">
                  Notable Previous Projects
                </Label>
                <Textarea
                  id="previousProjects"
                  value={formData.previousProjects}
                  onChange={(e) => setFormData({...formData, previousProjects: e.target.value})}
                  placeholder="Describe some of your most successful or notable projects..."
                  rows={4}
                  data-testid="textarea-projects"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 px-8"
              data-testid="button-submit-profile"
            >
              {createProfileMutation.isPending ? "Creating Profile..." : "Create Professional Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}