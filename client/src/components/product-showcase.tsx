import { Check } from "lucide-react";

export default function ProductShowcase() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Development Budget Tracking
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Keep your projects on track with real-time cost monitoring, automated draw schedules, and variance analysis.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">Track hard costs, soft costs, and contingencies</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">Automated cash flow projections</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">Real-time budget vs actual analysis</span>
              </li>
            </ul>
          </div>
          <div className="lg:pl-8">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800"
              alt="Financial dashboard with charts and budget analytics"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-budget-dashboard"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="lg:order-2">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Investor Reporting Made Simple
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Generate professional reports instantly with automated data collection, standardized formatting, and customizable templates.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">One-click professional report generation</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">Lender and investor-ready formatting</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-6 w-6 text-brand-green mt-0.5" />
                <span className="text-neutral-700">Automated data collection and updates</span>
              </li>
            </ul>
          </div>
          <div className="lg:order-1 lg:pr-8">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800"
              alt="Business professionals reviewing financial reports and charts"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-reporting-professionals"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
