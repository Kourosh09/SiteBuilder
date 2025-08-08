import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Play, Search, Building, MapPin, TrendingUp, Users, CheckCircle, ArrowRight, Loader2, Brain, AlertTriangle, Shield } from "lucide-react";
import { usePropertyData } from "@/hooks/usePropertyData";
import { apiRequest } from '@/lib/queryClient';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { setPropertyData } = usePropertyData();
  const [propertyForm, setPropertyForm] = useState({
    address: '21558 Glenwood Ave',
    city: 'Maple Ridge',
    email: '',
    phone: ''
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const demoProperty = () => {
    // Set demo property data that will auto-populate all calculators
    setPropertyData({
      address: "1234 Main Street",
      city: "Vancouver",
      currentValue: 1850000,
      lotSize: 7200,
      currentUse: "single-family",
      proposedUse: "multi-family"
    });
    
    // Navigate to dashboard after setting data
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAnalyzeProperty = async () => {
    if (!propertyForm.address || !propertyForm.city || !propertyForm.email || !propertyForm.phone) {
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest('/api/ai/analyze-property', {
        method: 'POST',
        body: JSON.stringify({
          address: propertyForm.address,
          city: propertyForm.city,
          email: propertyForm.email,
          phone: propertyForm.phone
        })
      });

      if (result.success) {
        setAnalysis(result.analysis);
        
        // Store property data for use in other calculators
        const propertyDetails = result.analysis.propertyDetails;
        setPropertyData({
          address: propertyForm.address,
          city: propertyForm.city,
          currentValue: propertyDetails?.assessedValue || 1650000,
          lotSize: propertyDetails?.lotSize || 7200,
          currentUse: 'single-family',
          proposedUse: 'multi-family'
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-20 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-[80vh]">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              <span className="block mb-2">Professional BC</span>
              <span className="block mb-2">Development Analysis</span>
              <span className="text-yellow-400 font-extrabold drop-shadow-lg block">Platform</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed font-medium max-w-2xl">
              The only platform built specifically for BC development professionals. Access comprehensive property analysis, municipal compliance data across 9 BC cities, and connect with premier architects, engineers, and contractors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={demoProperty}
                className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-colors shadow-lg"
                data-testid="button-property-demo"
              >
                <Search className="w-5 h-5 mr-2" />
                Try Demo Property
              </Button>
              <Button
                onClick={onGetStarted || scrollToContact}
                className="bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 transition-colors shadow-lg"
                data-testid="button-start-trial"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white bg-transparent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-800 transition-colors"
                data-testid="button-watch-demo"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          {/* Right Side - Interactive Property Analysis */}
          <div className="flex flex-col justify-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">See BuildwiseAI in Action</h3>
              <p className="text-blue-100 mb-6">
                Enter any BC property address with your contact info and watch AI analyze everything in real-time: BC Assessment data, MLS comparables, zoning codes, and generate development scenarios with ROI.
              </p>
              
              {!analysis ? (
                <>
                  {/* Property Analysis Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-2">Property Address</label>
                      <Input
                        type="text"
                        value={propertyForm.address}
                        onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                        placeholder="Enter property address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-2">City</label>
                      <Input
                        type="text"
                        value={propertyForm.city}
                        onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={propertyForm.email}
                        onChange={(e) => setPropertyForm({...propertyForm, email: e.target.value})}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        value={propertyForm.phone}
                        onChange={(e) => setPropertyForm({...propertyForm, phone: e.target.value})}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                        placeholder="(604) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAnalyzeProperty}
                    disabled={loading || !propertyForm.address || !propertyForm.city || !propertyForm.email || !propertyForm.phone}
                    className="w-full bg-yellow-500 text-blue-900 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50"
                    data-testid="button-analyze-property"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Property...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analyze Property with AI
                      </>
                    )}
                  </Button>
                  
                  {/* Feature Preview */}
                  <div className="mt-6 space-y-3 text-sm text-blue-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Instant BC Assessment lookup</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Real MLS comparable sales</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Municipal zoning analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Development ROI projections</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Analysis Results Display */
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">Analysis Complete!</h4>
                    <p className="text-blue-100">Your property at {propertyForm.address}, {propertyForm.city}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/20 border-white/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white">{formatCurrency(analysis.propertyDetails?.assessedValue || 0)}</div>
                        <div className="text-sm text-blue-100">Assessed Value</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/20 border-white/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{analysis.developmentPotential?.roi || '0'}%</div>
                        <div className="text-sm text-blue-100">Projected ROI</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Lot Size:</span>
                      <span className="text-white font-medium">{analysis.propertyDetails?.lotSize?.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Zoning:</span>
                      <span className="text-white font-medium">{analysis.propertyDetails?.currentZoning}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Development Potential:</span>
                      <span className="text-white font-medium">{analysis.developmentPotential?.scenario || analysis.developmentPotential?.recommended}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    View Full Analysis
                  </Button>
                  
                  <Button
                    onClick={() => setAnalysis(null)}
                    variant="outline"
                    className="w-full border-white/30 text-white bg-transparent py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Analyze Another Property
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
