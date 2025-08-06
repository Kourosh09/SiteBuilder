import { Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">BuildwiseAI</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              AI-powered financial management platform built for real estate developers and investors. 
              Streamline your development finance workflows from feasibility to investor reporting.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-twitter"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-linkedin"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-300 hover:text-white transition-colors"
                  data-testid="footer-link-features"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("calculator")}
                  className="text-gray-300 hover:text-white transition-colors"
                  data-testid="footer-link-calculator"
                >
                  Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-300 hover:text-white transition-colors"
                  data-testid="footer-link-pricing"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="footer-link-api">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-300 hover:text-white transition-colors"
                  data-testid="footer-link-about"
                >
                  About
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="footer-link-blog">
                  Blog
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-300 hover:text-white transition-colors"
                  data-testid="footer-link-contact"
                >
                  Contact
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="footer-link-careers">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm" data-testid="text-copyright">
            &copy; 2025 BuildwiseAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" data-testid="footer-link-privacy">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" data-testid="footer-link-terms">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" data-testid="footer-link-cookies">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
