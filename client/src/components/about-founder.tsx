import { Building, GraduationCap, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutFounder() {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
              alt="Kourosh Ahmadian - BuildwiseAI Founder"
              className="rounded-2xl shadow-lg w-full max-w-md mx-auto"
              data-testid="img-founder-headshot"
            />
          </div>
          <div>
            <div className="mb-6">
              <span className="inline-block bg-brand-blue bg-opacity-10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
                Meet the Founder
              </span>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Built by Real Estate Professionals
              </h2>
            </div>
            
            <p className="text-xl text-neutral-600 mb-8">
              BuildwiseAI was founded by Kourosh Ahmadian, bringing together deep expertise in real estate development, finance, and technology.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Licensed Residential Builder</h3>
                  <p className="text-neutral-600">Hands-on experience in development projects across British Columbia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">MBA in Strategy & Finance</h3>
                  <p className="text-neutral-600">Advanced business education with focus on financial strategy</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-amber bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-brand-amber" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Ex-Banking Professional</h3>
                  <p className="text-neutral-600">Deep understanding of development finance and lending requirements</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={scrollToContact}
                className="bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                data-testid="button-connect-founder"
              >
                Connect with Kourosh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
