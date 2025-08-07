import { useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesOverview from "@/components/features-overview";
import HowItWorks from "@/components/how-it-works";
import PropertyLookup from "@/components/property-lookup";
import ZoningIntelligence from "@/components/zoning-intelligence";
import AIPropertyAnalyzer from "@/components/ai-property-analyzer";
import MarketingAutomationShowcase from "@/components/marketing-automation-showcase";
import ContractorSignupSection from "@/components/contractor-signup-section";
import CalculatorDemo from "@/components/calculator-demo";
import ProductShowcase from "@/components/product-showcase";
import AboutFounder from "@/components/about-founder";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  const [, navigate] = useLocation();

  // This is the public marketing homepage - no auto-redirect
  // Users can access dashboard via login or navigation

  return (
    <div className="bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesOverview />
      <HowItWorks />
      <PropertyLookup />
      <ZoningIntelligence />
      <AIPropertyAnalyzer />
      <MarketingAutomationShowcase />
      <ContractorSignupSection />
      <CalculatorDemo />
      <ProductShowcase />
      <AboutFounder />
      <Testimonials />
      <Pricing />
      <ContactSection />
      <Footer />
    </div>
  );
}
