import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, MapPin, Zap, Loader2, DollarSign, Clock, Users, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DemoResult {
  propertyAnalysis: any;
  developmentScenarios: any;
  constructionDesign: any;
  marketingCapture: any;
  demoSummary: {
    address: string;
    city: string;
    analysisComplete: boolean;
    scenariosGenerated: number;
    recommendedProject: string;
    estimatedROI: number;
    leadCaptured: boolean;
  };
}

export default function InteractivePropertyDemo() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Vancouver');
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 'first-time',
    specificNeeds: [] as string[],
    message: ''
  });

  const runPropertyDemo = async () => {
    if (!address.trim()) return;
    
    setIsRunningDemo(true);
    try {
      console.log(`🚀 Running demo for: ${address}, ${city}`);
      
      const response = await fetch('/api/marketing/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          city,
          contactInfo: showContactForm ? contactInfo : null
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Demo response received:', data);
      
      if (data.success && data.data) {
        setDemoResult(data.data);
        if (!showContactForm) {
          setShowContactForm(true);
        }
      } else {
        throw new Error(data.error || 'Demo failed');
      }
    } catch (error) {
      console.error('❌ Demo failed:', error);
      alert(`Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const captureLeadAndRunDemo = async () => {
    console.log('🔄 Starting captureLeadAndRunDemo function');
    console.log('Contact info:', contactInfo);
    console.log('Address:', address, 'City:', city);
    
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please fill in your name and email address to continue.');
      return;
    }
    
    setIsRunningDemo(true);
    try {
      console.log('📡 Sending request to /api/marketing/demo...');
      const response = await fetch('/api/marketing/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          city,
          contactInfo
        })
      });
      
      console.log('📡 Response received:', response.status, response.statusText);
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success && data.data) {
        setDemoResult(data.data);
        setShowContactForm(false);
        console.log('✅ Demo completed successfully!');
      } else {
        throw new Error(data.error || 'Demo failed');
      }
    } catch (error) {
      console.error('❌ Demo with lead capture failed:', error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const handleNeedToggle = (need: string) => {
    setContactInfo(prev => ({
      ...prev,
      specificNeeds: prev.specificNeeds.includes(need)
        ? prev.specificNeeds.filter(n => n !== need)
        : [...prev.specificNeeds, need]
    }));
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            See BuildwiseAI in Action
          </h2>
          <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto">
            Enter any BC property address and watch AI analyze everything in real-time:
            BC Assessment data, MLS comparables, zoning codes, and generate development scenarios with ROI.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => {
                setAddress("21558 Glenwood Ave");
                setCity("Maple Ridge");
              }}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              data-testid="button-try-demo-property"
            >
              Try Demo Property
            </Button>
          </div>
        </div>

        {/* Property Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Try the Complete AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-white">Property Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Development Street"
                  className="bg-white text-black"
                  data-testid="input-property-address"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-white">City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vancouver">Vancouver</SelectItem>
                    <SelectItem value="Burnaby">Burnaby</SelectItem>
                    <SelectItem value="Richmond">Richmond</SelectItem>
                    <SelectItem value="Surrey">Surrey</SelectItem>
                    <SelectItem value="Maple Ridge">Maple Ridge</SelectItem>
                    <SelectItem value="Coquitlam">Coquitlam</SelectItem>
                    <SelectItem value="Port Coquitlam">Port Coquitlam</SelectItem>
                    <SelectItem value="Port Moody">Port Moody</SelectItem>
                    <SelectItem value="Mission">Mission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={runPropertyDemo}
                disabled={isRunningDemo || !address.trim()}
                className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400 py-3 text-lg font-semibold"
                data-testid="button-run-demo"
              >
                {isRunningDemo ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Property...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Property with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Results */}
        {demoResult && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader className="text-center">
                  <BarChart3 className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Scenarios Generated</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {demoResult.demoSummary.scenariosGenerated}
                  </div>
                  <p className="text-blue-100">Development options analyzed</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader className="text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Estimated ROI</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {demoResult.demoSummary.estimatedROI?.toFixed(1) || '0'}%
                  </div>
                  <p className="text-blue-100">Return on investment</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Recommended Project</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-sm font-semibold text-green-400 mb-1">
                    {demoResult.demoSummary.recommendedProject || 'Analysis Complete'}
                  </div>
                  <p className="text-blue-100 text-sm">City-compliant design ready</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">Complete Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-400">Property Data Integrated:</h4>
                    <ul className="space-y-1 text-blue-100">
                      <li>✓ BC Assessment property value & details</li>
                      <li>✓ MLS comparable properties analyzed</li>
                      <li>✓ Municipal zoning requirements</li>
                      <li>✓ Building code compliance checked</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-400">AI Analysis Generated:</h4>
                    <ul className="space-y-1 text-blue-100">
                      <li>✓ Multiple development scenarios</li>
                      <li>✓ Financial ROI calculations</li>
                      <li>✓ City-compliant construction designs</li>
                      <li>✓ Contractor timeline estimates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Form Dialog */}
        <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Get Your Complete Development Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Developer"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(604) 555-0123"
                  data-testid="input-contact-phone"
                />
              </div>

              <div>
                <Label htmlFor="experience">Development Experience</Label>
                <Select 
                  value={contactInfo.experience} 
                  onValueChange={(value) => setContactInfo(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-time">First-time developer</SelectItem>
                    <SelectItem value="some-experience">Some experience</SelectItem>
                    <SelectItem value="experienced">Experienced developer</SelectItem>
                    <SelectItem value="professional">Professional developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>What do you need help with? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'Financial analysis',
                    'Zoning compliance',
                    'Construction design',
                    'Contractor matching',
                    'Permit guidance',
                    'Investment planning'
                  ].map((need) => (
                    <label key={need} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactInfo.specificNeeds.includes(need)}
                        onChange={() => handleNeedToggle(need)}
                        className="rounded"
                      />
                      <span className="text-sm">{need}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Additional Details</Label>
                <Textarea
                  id="message"
                  value={contactInfo.message}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us about your project timeline, budget, or any specific requirements..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🖱️ Button clicked! Running captureLeadAndRunDemo...');
                    captureLeadAndRunDemo();
                  }}
                  disabled={!contactInfo.name || !contactInfo.email || isRunningDemo}
                  className="bg-blue-600 hover:bg-blue-700 relative z-10"
                  data-testid="button-get-full-analysis"
                  style={{ pointerEvents: 'auto' }}
                >
                  {isRunningDemo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Get Complete Analysis & Connect with Contractors'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}