import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-brand-blue">BuildwiseAI</h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-features"
              >
                Features
              </button>
              <a
                href="/login"
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-dashboard"
              >
                Dashboard
              </a>
              <button
                onClick={() => scrollToSection("calculator")}
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-calculator"
              >
                Calculator
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-pricing"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-about"
              >
                About
              </button>
              <a
                href="/login"
                className="text-neutral-600 hover:text-brand-blue px-3 py-2 text-sm font-medium transition-colors"
                data-testid="nav-login"
              >
                Login
              </a>
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
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
              <a
                href="/login"
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-dashboard"
              >
                Dashboard
              </a>
              <button
                onClick={() => scrollToSection("calculator")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-calculator"
              >
                Calculator
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-pricing"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-brand-blue"
                data-testid="mobile-nav-about"
              >
                About
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
