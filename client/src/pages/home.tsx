import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import InteractivePropertyDemo from "@/components/interactive-property-demo";
import FeaturesOverview from "@/components/features-overview";
import LandownerJVSection from "@/components/landowner-jv-section";
import HowItWorks from "@/components/how-it-works";
import PropertyLookup from "@/components/property-lookup";
import ZoningIntelligence from "@/components/zoning-intelligence";
import AIPropertyAnalyzer from "@/components/ai-property-analyzer";
import MarketingAutomationShowcase from "@/components/marketing-automation-showcase";
import ContractorSignupSection from "@/components/contractor-signup-section";
import CalculatorDemo from "@/components/calculator-demo";
import DemoVideoSection from "@/components/demo-video-section-fixed";
import ProductShowcase from "@/components/product-showcase";
import AboutFounder from "@/components/about-founder";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import LoginModal from "@/components/login-modal";
import PartnerFinder from "@/components/partner-finder";

interface HomeProps {
  onAuthenticated: () => void;
}

export default function Home({ onAuthenticated }: HomeProps) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="bg-white">
      <Navigation onLoginClick={() => setShowLogin(true)} />
      <HeroSection onGetStarted={() => setShowLogin(true)} />
      <ContractorSignupSection />
      <DemoVideoSection onGetStarted={() => setShowLogin(true)} />
      <InteractivePropertyDemo />
      <FeaturesOverview />
      <LandownerJVSection />
      <HowItWorks />
      <ProductShowcase />
      <AboutFounder />
      <Testimonials />
      <Pricing onGetStarted={() => setShowLogin(true)} />
      <ContactSection />
      <Footer />
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          onAuthenticated();
        }}
      />
    </div>
  );
}
