import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, Maximize, CheckCircle } from "lucide-react";

interface DemoVideoSectionProps {
  onGetStarted?: () => void;
}

export default function DemoVideoSection({ onGetStarted }: DemoVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 150; // 2:30 demo video

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In real implementation, this would control video playback
  };

  const videoFeatures = [
    "Live property analysis with BC Assessment data",
    "Real-time ROI calculations and feasibility scoring",
    "Municipal zoning compliance across 9 BC cities",
    "Premium partner directory access",
    "Lead generation and marketing automation",
    "Bill 44/47 provincial housing legislation compliance"
  ];

  return (
    <section id="demo-video" className="py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            See BuildwiseAI in Action
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Watch how BC development professionals are transforming property analysis 
            from weeks of research into seconds of AI-powered insights.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Real BC Properties</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Live Data Integration</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Actual ROI Calculations</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative bg-black aspect-video">
                {/* Video Thumbnail/Player */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      BuildwiseAI Platform Demo
                    </h3>
                    <p className="text-blue-100 text-sm">
                      21558 Glenwood Ave, Maple Ridge Analysis
                    </p>
                    <p className="text-blue-200 text-xs mt-1">
                      Duration: 2:30 • HD Quality
                    </p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="bg-white/30 rounded-full h-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Description */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">
                Complete Platform Walkthrough
              </h4>
              <p className="text-neutral-600 text-sm leading-relaxed">
                This demo shows the complete BuildwiseAI workflow using a real Maple Ridge property. 
                You'll see instant BC Assessment lookup, MLS comparable analysis, zoning intelligence, 
                financial modeling, and access to our premium BC professional directory.
              </p>
            </div>
          </div>

          {/* Feature List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                  What You'll See in This Demo
                </h4>
                <div className="space-y-3">
                  {videoFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h5 className="font-semibold text-neutral-900 mb-3">
                    Ready to Get Started?
                  </h5>
                  <p className="text-sm text-neutral-600 mb-4">
                    Start your 7-day free trial and analyze your first property in minutes.
                  </p>
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
                    data-testid="button-demo-start-trial"
                  >
                    Start Free Trial
                  </Button>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-neutral-500">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-xs text-neutral-600">BC Developers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">$2.5M+</div>
                  <div className="text-xs text-neutral-600">Avg Analysis Value</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Start Analyzing BC Properties Today
            </h3>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
              Join the growing community of BC development professionals who rely on 
              BuildwiseAI for accurate, instant property analysis and profitable development opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-emerald-500 text-white hover:bg-emerald-400 px-8"
                data-testid="button-final-cta"
              >
                Start Free Trial
              </Button>
              
              <Button
                onClick={() => {
                  const heroSection = document.getElementById('property-analysis');
                  if (heroSection) {
                    heroSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                size="lg"
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8"
              >
                Try Demo Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}