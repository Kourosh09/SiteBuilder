import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  TrendingUp, 
  Users, 
  Target, 
  Smartphone,
  Mail,
  Share2,
  BarChart3,
  Zap,
  Play,
  ArrowRight
} from "lucide-react";

export default function MarketingAutomationShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const automationFeatures = [
    {
      title: "AI Social Media Manager",
      description: "Automatically generate and schedule property marketing content across all platforms",
      icon: Share2,
      color: "bg-blue-500",
      benefits: ["300% more engagement", "5x faster content creation", "24/7 posting optimization"],
      example: "Creates Facebook ads for new listings with property photos, descriptions, and targeted audience selection"
    },
    {
      title: "Smart Lead Scoring",
      description: "AI analyzes prospect behavior to identify high-value leads automatically",
      icon: Target,
      color: "bg-emerald-500",
      benefits: ["40% higher conversion rates", "Automated follow-up sequences", "Priority lead identification"],
      example: "Tracks website visits, property views, and engagement to rank leads by likelihood to purchase"
    },
    {
      title: "Email Campaign Automation",
      description: "Personalized email sequences based on buyer preferences and behavior",
      icon: Mail,
      color: "bg-purple-500",
      benefits: ["60% open rate improvement", "Automated drip campaigns", "Dynamic content personalization"],
      example: "Sends targeted property recommendations based on previous searches and budget preferences"
    },
    {
      title: "Performance Analytics",
      description: "Real-time tracking of all marketing campaigns with AI-powered insights",
      icon: BarChart3,
      color: "bg-orange-500",
      benefits: ["ROI optimization", "Campaign performance insights", "Automated reporting"],
      example: "Tracks cost-per-lead across all channels and automatically adjusts budget allocation"
    }
  ];

  const marketingStats = [
    { label: "Average Lead Increase", value: "185%", color: "text-emerald-600" },
    { label: "Time Saved Weekly", value: "12 hrs", color: "text-blue-600" },
    { label: "Marketing ROI Boost", value: "240%", color: "text-purple-600" },
    { label: "Campaign Automation", value: "100%", color: "text-orange-600" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            <span>AI Marketing Automation Suite</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Automated Marketing That Never Sleeps
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Let AI handle your marketing while you focus on closing deals. Our automation suite generates leads, 
            manages campaigns, and optimizes performance 24/7.
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {marketingStats.map((stat, index) => (
            <Card key={index} className="text-center shadow-lg">
              <CardContent className="p-6">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-neutral-900 mb-12">
            How AI Marketing Automation Works
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">1. Connect Your Data</h4>
              <p className="text-neutral-600">
                Integrate your property listings, CRM, and social media accounts. 
                Our AI learns your market and target audience automatically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">2. AI Creates Campaigns</h4>
              <p className="text-neutral-600">
                AI generates targeted ad copy, social media posts, email sequences, 
                and landing pages optimized for your specific market.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">3. Optimize & Scale</h4>
              <p className="text-neutral-600">
                Continuous AI optimization improves performance, increases ROI, 
                and scales successful campaigns automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Automation Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {automationFeatures.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="grid grid-cols-1 gap-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-emerald-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                {/* Example */}
                <div className="bg-neutral-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-neutral-700">
                    <strong>Example:</strong> {feature.example}
                  </p>
                </div>
                
                {/* Demo Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveDemo(activeDemo === feature.title ? null : feature.title)}
                  data-testid={`demo-button-${index}`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {activeDemo === feature.title ? "Hide Demo" : "View Live Demo"}
                </Button>
                
                {activeDemo === feature.title && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Live Demo Active</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      Interactive demo would show real-time {feature.title.toLowerCase()} in action, 
                      demonstrating the automated workflow and results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
            <CardContent className="p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Automate Your Marketing?
              </h3>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Join hundreds of real estate professionals who've increased their leads by 185% 
                with BuildwiseAI's marketing automation suite.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-neutral-100"
                data-testid="cta-get-started"
              >
                Get Started with AI Marketing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}