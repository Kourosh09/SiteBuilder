import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesOverview from "@/components/features-overview";
import CalculatorDemo from "@/components/calculator-demo";
import ProductShowcase from "@/components/product-showcase";
import AboutFounder from "@/components/about-founder";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import DemoSmartFetch from "@/components/demo-smart-fetch";
import BCPermitDemo from "@/components/bc-permit-demo";

export default function Home() {
  return (
    <div className="bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesOverview />
      <CalculatorDemo />
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Live Government Data Demo</h2>
            <p className="mt-4 text-lg text-gray-600">Search real BC permit data with AI-powered validation and aggregation</p>
          </div>
          <div className="space-y-12">
            <BCPermitDemo />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Smart Fetch AI Layer</h3>
              <DemoSmartFetch />
            </div>
          </div>
        </div>
      </div>
      <ProductShowcase />
      <AboutFounder />
      <Testimonials />
      <Pricing />
      <ContactSection />
      <Footer />
    </div>
  );
}
