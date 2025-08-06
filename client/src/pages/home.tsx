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

export default function Home() {
  return (
    <div className="bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesOverview />
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
