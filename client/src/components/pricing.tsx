import { Button } from "@/components/ui/button";
import { Check, Clock, CreditCard } from "lucide-react";

interface PricingProps {
  onGetStarted?: () => void;
}

export default function Pricing({ onGetStarted }: PricingProps) {
  const plan = {
    name: "BuildwiseAI Professional",
    description: "Complete BC development analysis platform",
    price: "$197",
    period: "per month",
    trialText: "7-Day Free Trial",
    features: [
      "AI Property Analysis & Feasibility Reports",
      "Municipal Zoning Intelligence (9 BC Cities)", 
      "Advanced Financial Modeling & ROI Calculator",
      "BC Assessment & MLS Data Integration",
      "Development Optimization Engine",
      "Premium Partner & Contractor Directory",
      "Lead Generation & Marketing Automation",
      "Permit Tracking & Compliance Monitoring",
      "Bill 44/47 & TOD Compliance Analysis",
      "PDF Report Generation",
      "Email Support & Training"
    ],
    buttonText: "Start 7-Day Free Trial"
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Professional Builder Tools
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Access comprehensive BC development analysis with your 7-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl shadow-2xl border-2 border-blue-500 bg-white overflow-hidden">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Professional Builder Platform
              </span>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-3xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
              <p className="text-neutral-600 mb-6">{plan.description}</p>

              <div className="mb-8">
                <div className="text-5xl font-bold text-neutral-900 mb-2">{plan.price}</div>
                <div className="text-neutral-600">{plan.period}</div>
                <div className="text-blue-600 font-semibold text-lg mt-2 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {plan.trialText}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8 text-left">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full py-4 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white mb-4 flex items-center justify-center gap-2"
                onClick={onGetStarted}
                data-testid="start-trial-button"
              >
                <CreditCard className="w-5 h-5" />
                {plan.buttonText}
              </Button>
              
              <p className="text-sm text-neutral-500">
                No commitment • Cancel anytime • Full access during trial
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Why Choose BuildwiseAI?</h4>
              <p className="text-blue-700 text-sm">
                The only platform specifically built for BC development professionals. 
                Save weeks of research with instant access to municipal data across 9 BC cities.
              </p>
            </div>
            
            <p className="text-neutral-600 text-sm">
              Questions about the platform? Contact our team for a personalized demo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}