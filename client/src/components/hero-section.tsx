import { Button } from "@/components/ui/button";
import { Check, Play, Search } from "lucide-react";
import { usePropertyData } from "@/hooks/usePropertyData";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { setPropertyData } = usePropertyData();
  
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

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-20 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
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
          <div className="lg:pl-8 mt-8 lg:mt-0">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Modern city skyline with construction development"
                className="rounded-2xl shadow-2xl w-full h-auto max-h-96 object-cover"
                data-testid="img-hero-cityscape"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
