import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  onLoginClick?: () => void;
}

export default function Navigation({ onLoginClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => window.location.href = '/'}>
            <h1 className="text-3xl font-bold text-neutral-900 hover:text-blue-600 transition-colors">BuildwiseAI</h1>
            <p className="text-neutral-600 mt-1">AI-powered real estate development platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">
                BC Focused
              </Badge>
              <Badge variant="outline">
                Bill 44 Ready
              </Badge>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-neutral-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-features"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    const contractorSection = document.querySelector('section.bg-gradient-to-br.from-orange-50');
                    if (contractorSection) {
                      contractorSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMenuOpen(false);
                  }}
                  className="text-orange-600 hover:text-orange-700 px-3 py-2 text-sm font-medium transition-colors border border-orange-200 rounded-md bg-orange-50"
                  data-testid="nav-professionals"
                >
                  For Professionals
                </button>
                <button
                  onClick={() => scrollToSection("landowner-jv")}
                  className="text-neutral-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-landowner-jv"
                >
                  Land Owner JV
                </button>
                <button
                  onClick={() => scrollToSection("development-network")}
                  className="text-neutral-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-development-network"
                >
                  Join BC's Premier Development Network
                </button>
                <button
                  onClick={() => scrollToSection("calculator")}
                  className="text-neutral-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-calculator"
                >
                  Calculator
                </button>
                <button
                  onClick={onLoginClick}
                  className="text-neutral-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </button>
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  data-testid="button-get-started"
                >
                  Get Started
              </Button>
            </div>
          </div>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => scrollToSection("features")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-features"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("landowner-jv")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-landowner-jv"
              >
                Land Owner JV
              </button>
              <button
                onClick={() => scrollToSection("development-network")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-development-network"
              >
                Join BC Development Network
              </button>
              <button
                onClick={onLoginClick}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-calculator"
              >
                Calculator
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="w-full mt-2 bg-brand-blue text-white hover:bg-blue-700"
                data-testid="mobile-button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
