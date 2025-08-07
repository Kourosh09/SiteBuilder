import { CheckCircle, Upload, Brain, BarChart3, Users } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Property Data",
      description: "Submit property address, square footage, and basic development parameters to get started.",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI reviews zoning regulations, market data, and construction costs to build your financial model.",
      color: "text-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Get Financial Model",
      description: "View detailed pro forma with profitability analysis, cash flow projections, and ROI calculations.",
      color: "text-amber-600"
    },
    {
      icon: Users,
      title: "Connect Partners",
      description: "Optional: Connect with potential JV partners, investors, or landowners through our platform.",
      color: "text-purple-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            From property analysis to partnership connections in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-neutral-50 flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-neutral-400">
                    Step {index + 1}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 mb-3" data-testid={`text-step-${index + 1}-title`}>
                  {step.title}
                </h3>
                
                <p className="text-neutral-600 leading-relaxed" data-testid={`text-step-${index + 1}-description`}>
                  {step.description}
                </p>
              </div>

              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-neutral-200 transform -translate-y-1/2">
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-neutral-300 rounded-full transform translate-x-1 -translate-y-1/2"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span data-testid="text-ready-in-minutes">Ready in minutes, not weeks</span>
          </div>
        </div>
      </div>
    </section>
  );
}