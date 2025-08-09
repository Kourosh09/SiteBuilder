import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Users, Shield, Calculator, FileText } from "lucide-react";

export default function LandownerJVSection() {
  return (
    <section id="landowner-jv" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Land Owner Joint Venture Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partner with experienced developers to unlock your land's development potential. 
            Our AI-powered platform connects landowners with qualified development partners for profitable joint ventures.
          </p>
        </div>

        {/* Main Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Maximize Your Land Value
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Higher Returns</h4>
                  <p className="text-gray-600">Earn 30-50% more than traditional land sales through development partnerships</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Risk Mitigation</h4>
                  <p className="text-gray-600">Share development risks while maintaining land ownership participation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Expert Partnership</h4>
                  <p className="text-gray-600">Partner with vetted, experienced developers with proven track records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white p-8 rounded-2xl shadow-xl border">
              <div className="text-center mb-6">
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900">Your Land's Potential</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Land Value:</span>
                  <span className="font-semibold">$850,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Development Potential:</span>
                  <span className="font-semibold text-green-600">6 Units (Bill 44)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projected JV Return:</span>
                  <span className="font-semibold text-green-600">$1.2M - $1.8M</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Landowner Share (40%):</span>
                    <span className="text-blue-600">$480K - $720K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JV Process Steps */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple JV Partnership Process
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">1. Property Analysis</h4>
                <p className="text-gray-600">
                  Our AI analyzes your property's development potential, zoning benefits, and market value
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">2. Partner Matching</h4>
                <p className="text-gray-600">
                  Get matched with qualified developers based on project type, location, and investment criteria
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">3. JV Agreement</h4>
                <p className="text-gray-600">
                  Structured partnership with clear terms, profit sharing, and milestone-based development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore Your Land's JV Potential?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get a free property analysis and connect with pre-qualified development partners. 
            No commitment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                console.log('🖱️ Get Free Property Analysis clicked');
                const demoSection = document.getElementById('property-demo');
                if (demoSection) {
                  demoSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback: scroll to interactive property demo
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }
              }}
              data-testid="button-landowner-analysis"
            >
              Get Free Property Analysis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                console.log('🖱️ Browse Development Partners clicked');
                const partnersSection = document.getElementById('partners');
                if (partnersSection) {
                  partnersSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback: scroll to bottom of page
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
              }}
              data-testid="button-landowner-partners"
            >
              Browse Development Partners
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}