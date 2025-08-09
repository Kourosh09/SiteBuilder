import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, MapPin, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PartnerSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PartnerSignupDialog({ open, onOpenChange }: PartnerSignupDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Company Information
    companyName: '',
    companyType: '',
    yearsInBusiness: '',
    businessLicense: '',
    
    // Service Details
    serviceType: [] as string[],
    specializations: [] as string[],
    serviceAreas: [] as string[],
    
    // Experience & Portfolio
    projectsCompleted: '',
    averageProjectValue: '',
    portfolioDescription: '',
    
    // Licensing & Insurance
    professionallLicenses: '',
    insuranceCoverage: '',
    bondingCapacity: '',
    
    // Marketing & Partnership
    marketingBudget: '',
    partnershipInterest: [] as string[],
    referralCapacity: '',
    
    // Additional Information
    additionalInfo: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const serviceTypes = [
    'General Contractor',
    'Architect',
    'Structural Engineer',
    'Civil Engineer',
    'Real Estate Developer',
    'Project Manager',
    'Interior Designer',
    'Landscape Architect',
    'Environmental Consultant',
    'Building Permit Consultant',
    'Construction Lawyer',
    'Real Estate Agent/Broker'
  ];

  const specializations = [
    'Multi-family Residential',
    'Single Family Custom Homes',
    'Commercial Development',
    'Mixed-Use Projects',
    'Sustainable/Green Building',
    'Heritage Restoration',
    'Laneway Housing',
    'Secondary Suites',
    'Townhouse Development',
    'Condo Development',
    'Land Assembly',
    'Rezoning Applications'
  ];

  const serviceAreas = [
    'Vancouver',
    'Burnaby',
    'Richmond',
    'Surrey',
    'Maple Ridge',
    'Coquitlam',
    'Port Coquitlam',
    'Port Moody',
    'Mission',
    'North Vancouver',
    'West Vancouver',
    'Delta',
    'Langley',
    'White Rock',
    'Fraser Valley',
    'All Metro Vancouver'
  ];

  const partnershipTypes = [
    'Joint Venture Development',
    'Build-to-Suit Projects',
    'Design-Build Partnerships',
    'Referral Network',
    'Subcontracting Opportunities',
    'Consulting Services',
    'Land Assembly Partnerships',
    'Investment Partnerships'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/partners/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
        setStep(4); // Success step
      } else {
        throw new Error(result.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Partner signup error:', error);
      alert(`Signup failed: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Smith"
            data-testid="input-last-name"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="john@company.com"
          data-testid="input-email"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(604) 555-0123"
          data-testid="input-phone"
        />
      </div>
      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="ABC Development Corp"
          data-testid="input-company-name"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Service Type *</Label>
        <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {serviceTypes.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.serviceType.includes(service)}
                onCheckedChange={() => handleArrayToggle('serviceType', service)}
                data-testid={`checkbox-service-${service.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={service} className="text-sm">{service}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Specializations</Label>
        <p className="text-sm text-gray-600 mb-3">What types of projects do you specialize in?</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {specializations.map((spec) => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox
                id={spec}
                checked={formData.specializations.includes(spec)}
                onCheckedChange={() => handleArrayToggle('specializations', spec)}
                data-testid={`checkbox-spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={spec} className="text-sm">{spec}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Service Areas *</Label>
        <p className="text-sm text-gray-600 mb-3">Which areas do you serve?</p>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {serviceAreas.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox
                id={area}
                checked={formData.serviceAreas.includes(area)}
                onCheckedChange={() => handleArrayToggle('serviceAreas', area)}
                data-testid={`checkbox-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={area} className="text-sm">{area}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearsInBusiness">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            value={formData.yearsInBusiness}
            onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
            placeholder="10"
            data-testid="input-years-business"
          />
        </div>
        <div>
          <Label htmlFor="projectsCompleted">Projects Completed</Label>
          <Input
            id="projectsCompleted"
            value={formData.projectsCompleted}
            onChange={(e) => handleInputChange('projectsCompleted', e.target.value)}
            placeholder="50+"
            data-testid="input-projects-completed"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="averageProjectValue">Average Project Value</Label>
        <Select value={formData.averageProjectValue} onValueChange={(value) => handleInputChange('averageProjectValue', value)}>
          <SelectTrigger data-testid="select-project-value">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-500k">Under $500K</SelectItem>
            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
            <SelectItem value="1m-2m">$1M - $2M</SelectItem>
            <SelectItem value="2m-5m">$2M - $5M</SelectItem>
            <SelectItem value="5m-10m">$5M - $10M</SelectItem>
            <SelectItem value="over-10m">Over $10M</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="portfolioDescription">Portfolio Description</Label>
        <Textarea
          id="portfolioDescription"
          value={formData.portfolioDescription}
          onChange={(e) => handleInputChange('portfolioDescription', e.target.value)}
          placeholder="Brief description of your recent projects and expertise..."
          rows={3}
          data-testid="textarea-portfolio"
        />
      </div>

      <div>
        <Label className="text-base font-medium">Partnership Interest</Label>
        <p className="text-sm text-gray-600 mb-3">What types of partnerships are you interested in?</p>
        <div className="grid grid-cols-2 gap-2">
          {partnershipTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={formData.partnershipInterest.includes(type)}
                onCheckedChange={() => handleArrayToggle('partnershipInterest', type)}
                data-testid={`checkbox-partnership-${type.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={type} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          placeholder="Anything else you'd like us to know about your services or experience..."
          rows={3}
          data-testid="textarea-additional-info"
        />
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
            data-testid="checkbox-terms"
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the Terms & Conditions and Privacy Policy for BuildwiseAI Partner Network *
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToMarketing"
            checked={formData.agreeToMarketing}
            onCheckedChange={(checked) => handleInputChange('agreeToMarketing', checked as boolean)}
            data-testid="checkbox-marketing"
          />
          <Label htmlFor="agreeToMarketing" className="text-sm">
            I agree to receive marketing communications about partnership opportunities
          </Label>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Thank you for your interest in joining the BuildwiseAI Partner Network. 
        We'll review your application and contact you within 2-3 business days.
      </p>
      <div className="space-y-3 text-sm text-gray-600">
        <p><strong>Next Steps:</strong></p>
        <ul className="text-left space-y-1 max-w-sm mx-auto">
          <li>• Application review (2-3 days)</li>
          <li>• Partner interview call</li>
          <li>• Profile setup & verification</li>
          <li>• Welcome to the network!</li>
        </ul>
      </div>
      <Button 
        onClick={() => onOpenChange(false)} 
        className="mt-6"
        data-testid="button-close-success"
      >
        Close
      </Button>
    </div>
  );

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Contact Information';
      case 2: return 'Services & Expertise';
      case 3: return 'Experience & Partnership';
      case 4: return 'Success';
      default: return 'Partner Signup';
    }
  };

  const canProceed = () => {
    switch(step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.phone && formData.companyName;
      case 2:
        return formData.serviceType.length > 0 && formData.serviceAreas.length > 0;
      case 3:
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Join BuildwiseAI Partner Network - {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        {step < 4 && (
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderSuccess()}
        </div>

        {step < 4 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              data-testid="button-previous"
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (step === 3) {
                  handleSubmit();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed() || loading}
              data-testid="button-next"
            >
              {loading ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}