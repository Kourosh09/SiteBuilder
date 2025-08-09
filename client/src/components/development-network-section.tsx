import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Briefcase, MapPin, TrendingUp, Star, Network, Building } from "lucide-react";

export default function DevelopmentNetworkSection() {
  return (
    <section id="development-network" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join BC's Premier Development Network
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with BC's top architects, engineers, contractors, and developers. 
            Build your professional network and access exclusive development opportunities.
          </p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2,400+</div>
            <div className="text-gray-600">Active Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">850+</div>
            <div className="text-gray-600">Completed Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">$2.8B+</div>
            <div className="text-gray-600">Project Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Professional Categories */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Professional Categories
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Architects</h4>
                <p className="text-gray-600 mb-4">Residential and commercial design specialists</p>
                <Badge variant="secondary">420+ Members</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Engineers</h4>
                <p className="text-gray-600 mb-4">Structural, civil, and mechanical experts</p>
                <Badge variant="secondary">320+ Members</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">General Contractors</h4>
                <p className="text-gray-600 mb-4">Licensed and bonded construction professionals</p>
                <Badge variant="secondary">680+ Members</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Developers</h4>
                <p className="text-gray-600 mb-4">Experienced project managers and investors</p>
                <Badge variant="secondary">180+ Members</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Professionals */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Network Members
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Chen Architecture</h4>
                    <p className="text-gray-600 text-sm">Vancouver, BC</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">4.9</span>
                  <span className="text-sm text-gray-600 ml-2">(127 reviews)</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Specializing in multi-family residential design with Bill 44 compliance expertise
                </p>
                <Badge className="mb-2 mr-2">Multi-Family</Badge>
                <Badge className="mb-2">Bill 44 Expert</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Pacific Coast Builders</h4>
                    <p className="text-gray-600 text-sm">Burnaby, BC</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">4.8</span>
                  <span className="text-sm text-gray-600 ml-2">(89 reviews)</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Award-winning general contractor with 15+ years of experience in BC
                </p>
                <Badge className="mb-2 mr-2">Licensed</Badge>
                <Badge className="mb-2">Award Winner</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Metro Engineering Ltd.</h4>
                    <p className="text-gray-600 text-sm">Surrey, BC</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">5.0</span>
                  <span className="text-sm text-gray-600 ml-2">(64 reviews)</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Structural and civil engineering for residential and commercial projects
                </p>
                <Badge className="mb-2 mr-2">P.Eng Licensed</Badge>
                <Badge className="mb-2">Structural</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Network Membership Benefits
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Network className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Exclusive Project Access</h4>
                  <p className="text-gray-600">First access to high-value development opportunities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Networking</h4>
                  <p className="text-gray-600">Connect with verified professionals in your field</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Local Market Intelligence</h4>
                  <p className="text-gray-600">Access to BC market data and development insights</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Recognition</h4>
                  <p className="text-gray-600">Showcase your work and build your reputation</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white shadow-xl">
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Join Today
              </h4>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Access:</span>
                  <span className="font-semibold text-green-600">✓ Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Matching:</span>
                  <span className="font-semibold text-green-600">✓ AI-Powered</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional Profile:</span>
                  <span className="font-semibold text-green-600">✓ Enhanced</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Intelligence:</span>
                  <span className="font-semibold text-green-600">✓ Premium</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Monthly Fee:</span>
                    <span className="font-bold text-blue-600">$49/month</span>
                  </div>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-join-network"
                onClick={() => {
                  // Scroll to contact section for network signup
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join Development Network
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                30-day free trial • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Expand Your Professional Network?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join BC's most active development professional community and access exclusive opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-create-profile"
              onClick={() => {
                // Open professional profile creation
                const profileData = {
                  type: 'Professional Profile',
                  service: 'Development Network Registration',
                  details: 'I want to create a professional profile and join the BC Development Network'
                };
                
                // Store the profile creation intent
                sessionStorage.setItem('profileCreation', JSON.stringify(profileData));
                
                // Scroll to contact section
                const contactElement = document.getElementById('contact');
                if (contactElement) {
                  contactElement.scrollIntoView({ behavior: 'smooth' });
                  
                  // Pre-fill the contact form after scrolling
                  setTimeout(() => {
                    const messageField = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement;
                    if (messageField) {
                      messageField.value = 'I want to create a professional profile and join the BC Development Network. Please send me information about:\n\n• Professional profile setup\n• Network membership benefits\n• Project matching opportunities\n• Monthly subscription details ($49/month)';
                      messageField.focus();
                    }
                  }, 1000);
                } else {
                  alert('Contact form not found. Please scroll down to the contact section to create your professional profile.');
                }
              }}
            >
              Create Professional Profile
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-browse-network"
              onClick={() => {
                // Show network directory (placeholder functionality)
                alert('Network Directory coming soon! Contact us to join the waitlist and get early access to BC\'s premier development professional network.');
              }}
            >
              Browse Network Directory
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}