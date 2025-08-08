import { Button } from "@/components/ui/button";
import { Check, Play } from "lucide-react";

export default function HeroSection() {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              AI-Powered Financial Management for{" "}
              <span className="text-yellow-400 font-extrabold drop-shadow-lg">Real Estate Developers</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed font-medium max-w-2xl">
              Transform your development process with lightning-fast feasibility analysis, intelligent budget automation, and instant investor reporting. Built by developers, for developers who demand results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={scrollToContact}
                className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-colors shadow-lg"
                data-testid="button-start-trial"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white bg-transparent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-800 transition-colors"
                data-testid="button-watch-demo"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          <div className="lg:pl-8">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800"
              alt="Modern city skyline with construction development"
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-hero-cityscape"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
