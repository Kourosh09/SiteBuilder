import { BarChart3, DollarSign, Users, FileText } from "lucide-react";

export default function FeaturesOverview() {
  const features = [
    {
      icon: BarChart3,
      title: "AI-Powered Feasibility",
      description: "Automate land value analysis, density calculations, and project yield estimates based on zoning data.",
      color: "text-brand-blue",
      bgColor: "bg-brand-blue bg-opacity-10"
    },
    {
      icon: DollarSign,
      title: "Development Budgets",
      description: "Track construction costs, loan draws, and contingency usage with built-in templates.",
      color: "text-brand-green",
      bgColor: "bg-brand-green bg-opacity-10"
    },
    {
      icon: Users,
      title: "JV Structuring",
      description: "Smart templates and risk/reward models for joint venture deals and partnerships.",
      color: "text-brand-amber",
      bgColor: "bg-brand-amber bg-opacity-10"
    },
    {
      icon: FileText,
      title: "Automated Reporting",
      description: "Generate lender and investor-ready reports with one click, fully formatted and professional.",
      color: "text-purple-600",
      bgColor: "bg-purple-600 bg-opacity-10"
    }
  ];

  return (
    <section id="features" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Everything You Need to Manage Development Finance
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Purpose-built tools that understand real estate development workflows, from land acquisition to investor reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  <IconComponent className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
