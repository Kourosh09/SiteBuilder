import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual developers getting started",
      price: "Free",
      period: "Forever",
      features: [
        "Basic feasibility calculator",
        "Simple budget tracker",
        "Up to 3 projects",
        "Community support"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      description: "For growing development businesses",
      price: "$199",
      period: "per month",
      features: [
        "Advanced AI feasibility analysis",
        "Complete budget management",
        "JV structuring tools",
        "Automated reporting",
        "Unlimited projects",
        "Priority support"
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large development firms and partnerships",
      price: "Custom",
      period: "Contact us for pricing",
      features: [
        "Custom AI model training",
        "API access and integrations",
        "White-label options",
        "Dedicated account manager",
        "Custom training & onboarding"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Choose the plan that fits your development business. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white border-2 rounded-2xl p-8 hover:border-brand-blue transition-colors relative ${
                plan.popular 
                  ? "border-brand-blue transform scale-105" 
                  : "border-gray-200"
              }`}
              data-testid={`pricing-card-${index}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <p className="text-neutral-600 mb-6">{plan.description}</p>
                <div className="text-4xl font-bold text-neutral-900 mb-2" data-testid={`pricing-price-${index}`}>
                  {plan.price}
                </div>
                <p className="text-sm text-neutral-600">{plan.period}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={scrollToContact}
                variant={plan.buttonVariant}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.buttonVariant === "default" 
                    ? "bg-brand-blue text-white hover:bg-blue-700" 
                    : plan.buttonVariant === "secondary"
                    ? "bg-brand-amber text-brand-blue hover:bg-yellow-400"
                    : "bg-gray-100 text-neutral-900 hover:bg-gray-200"
                }`}
                data-testid={`pricing-button-${index}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <p className="text-sm text-neutral-500">
            Questions about pricing?{" "}
            <button 
              onClick={scrollToContact}
              className="text-brand-blue hover:underline"
              data-testid="link-contact-pricing"
            >
              Contact our team
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
