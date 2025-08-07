import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Hammer, 
  Users, 
  DollarSign, 
  Star, 
  MapPin,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building,
  Zap,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContractorSignupForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  trades: string[];
  experience: string;
  serviceAreas: string[];
  licenseNumber: string;
}

export default function ContractorSignupSection() {
  const [signupForm, setSignupForm] = useState<ContractorSignupForm>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    trades: [],
    experience: "",
    serviceAreas: [],
    licenseNumber: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contractorBenefits = [
    {
      icon: DollarSign,
      title: "Higher Project Values",
      description: "Access to premium development projects with budgets starting at $500K+",
      color: "bg-emerald-500"
    },
    {
      icon: Users,
      title: "Qualified Leads Only", 
      description: "Pre-screened developers and property owners ready to hire",
      color: "bg-blue-500"
    },
    {
      icon: Award,
      title: "Build Your Reputation",
      description: "Client reviews and ratings system to showcase your quality work",
      color: "bg-purple-500"
    },
    {
      icon: Zap,
      title: "Fast Project Matching",
      description: "AI-powered matching system connects you with relevant projects instantly",
      color: "bg-orange-500"
    }
  ];

  const tradeOptions = [
    "General Contractor", "Architect", "Structural Engineer", "Electrical", 
    "Plumbing", "HVAC", "Concrete & Masonry", "Roofing", "Flooring", 
    "Kitchen & Bath", "Landscaping", "Site Preparation", "Permits & Planning"
  ];

  const serviceAreaOptions = [
    "Vancouver", "Burnaby", "Richmond", "Surrey", "Langley", "Maple Ridge",
    "Coquitlam", "Port Moody", "North Vancouver", "West Vancouver", "New Westminster"
  ];

  const marketplaceStats = [
    { label: "Active Projects", value: "150+", icon: Building },
    { label: "Average Project Value", value: "$850K", icon: DollarSign },
    { label: "Verified Contractors", value: "200+", icon: Shield },
    { label: "Success Rate", value: "94%", icon: TrendingUp }
  ];

  const handleTradeToggle = (trade: string) => {
    setSignupForm(prev => ({
      ...prev,
      trades: prev.trades.includes(trade)
        ? prev.trades.filter(t => t !== trade)
        : [...prev.trades, trade]
    }));
  };

  const handleServiceAreaToggle = (area: string) => {
    setSignupForm(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  const handleSubmitContractorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.trades.length === 0) {
      toast({
        title: "Please Select Trades",
        description: "Select at least one trade specialty to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contractors/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: "We'll review your application and contact you within 24 hours."
        });
        
        // Reset form
        setSignupForm({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          trades: [],
          experience: "",
          serviceAreas: [],
          licenseNumber: ""
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Hammer className="w-4 h-4" />
            <span>Contractor Network</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Join BC's Premier Development Network
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Connect with qualified developers, architects, and property owners. 
            Access premium projects and grow your contracting business.
          </p>
        </div>

        {/* Marketplace Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {marketplaceStats.map((stat, index) => (
            <Card key={index} className="text-center shadow-lg">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Why Join BuildwiseAI Network?
              </h3>
              <div className="space-y-6">
                {contractorBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-neutral-900 mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-neutral-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Stories */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-neutral-900">Success Story</span>
                </div>
                <blockquote className="text-neutral-700 italic mb-4">
                  "BuildwiseAI connected us with 3 major development projects in our first month. 
                  The quality of leads and project values far exceeded our expectations."
                </blockquote>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JS</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Johnson Construction Ltd.</p>
                    <p className="text-xs text-neutral-600">General Contractor, Surrey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signup Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-orange-600" />
                Join Our Network
              </CardTitle>
              <CardDescription>
                Complete your application to start receiving qualified project leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContractorSignup} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={signupForm.companyName}
                      onChange={(e) => setSignupForm({...signupForm, companyName: e.target.value})}
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={signupForm.contactPerson}
                      onChange={(e) => setSignupForm({...signupForm, contactPerson: e.target.value})}
                      required
                      data-testid="input-contact-person"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                      required
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                {/* Trade Specialties */}
                <div className="space-y-3">
                  <Label>Trade Specialties *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {tradeOptions.map((trade) => (
                      <Badge
                        key={trade}
                        variant={signupForm.trades.includes(trade) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1 text-xs"
                        onClick={() => handleTradeToggle(trade)}
                        data-testid={`trade-${trade.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {trade}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div className="space-y-3">
                  <Label>Service Areas *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {serviceAreaOptions.map((area) => (
                      <Badge
                        key={area}
                        variant={signupForm.serviceAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1 text-xs"
                        onClick={() => handleServiceAreaToggle(area)}
                        data-testid={`area-${area.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      value={signupForm.experience}
                      onChange={(e) => setSignupForm({...signupForm, experience: e.target.value})}
                      placeholder="e.g., 10+"
                      required
                      data-testid="input-experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={signupForm.licenseNumber}
                      onChange={(e) => setSignupForm({...signupForm, licenseNumber: e.target.value})}
                      placeholder="Optional"
                      data-testid="input-license"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isSubmitting}
                  data-testid="button-submit-contractor-signup"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>

                <p className="text-xs text-neutral-600 text-center">
                  * Required fields. Applications are typically reviewed within 24 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}