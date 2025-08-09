import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Type } from 'lucide-react';

interface DemoVideoSectionProps {
  onGetStarted?: () => void;
}

export default function DemoVideoSection({ onGetStarted }: DemoVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const totalDuration = 60;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const demoSteps = [
    { title: "Property Input", description: "Enter any BC address to start instant analysis" },
    { title: "BC Assessment Data", description: "Real assessment values and lot details from official sources" },
    { title: "MLS Comparables", description: "Recent sales data showing market trends and pricing" },
    { title: "Zoning Analysis", description: "Bill 44/47 compliance and municipal development potential" },
    { title: "Financial Modeling", description: "ROI calculations with authentic construction costs" },
    { title: "Complete Report", description: "Professional PDF with contractor connections" }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            setCurrentPhase(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          
          // Update demo phase based on timeline
          let newPhase = 0;
          if (newTime >= 10) newPhase = 1;
          if (newTime >= 20) newPhase = 2;
          if (newTime >= 30) newPhase = 3;
          if (newTime >= 45) newPhase = 4;
          if (newTime >= 55) newPhase = 5;
          
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentPhase(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };

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
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Video Demo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Header */}
              <div className="bg-black/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">BuildwiseAI Dashboard</span>
                </div>
                <div className="text-white/60 text-xs">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>

              {/* Video Content */}
              <div className="p-8 min-h-[400px] relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-1000"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  ></div>
                </div>

                {/* Current Step Display */}
                {showCaptions && (
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-6">
                    <div className="text-emerald-300 text-sm font-medium mb-1">
                      Step {currentPhase + 1} of 6
                    </div>
                    <h3 className="text-white text-lg font-bold mb-2">
                      {demoSteps[currentPhase].title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {demoSteps[currentPhase].description}
                    </p>
                  </div>
                )}

                {/* Dynamic Content Based on Phase */}
                {currentPhase === 0 && (
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white text-sm mb-2">Property Address</div>
                      <div className="bg-white/20 rounded px-3 py-2 text-white">
                        21558 Glenwood Ave, Maple Ridge, BC
                      </div>
                    </div>
                  </div>
                )}

                {currentPhase === 1 && (
                  <div className="bg-emerald-500/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-emerald-300">Assessed Value</div>
                        <div className="text-white text-xl font-bold">$2,720,000</div>
                      </div>
                      <div>
                        <div className="text-emerald-300">Lot Size</div>
                        <div className="text-white text-xl font-bold">6,158 sq ft</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPhase === 2 && (
                  <div className="bg-blue-500/20 rounded-lg p-4">
                    <div className="text-blue-300 text-sm mb-3">Recent Sales</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-white text-sm">
                        <span>Similar Property</span>
                        <span className="font-bold">$2,850,000</span>
                      </div>
                      <div className="flex justify-between text-white text-sm">
                        <span>Market Trend</span>
                        <span className="text-emerald-400 font-bold">↗ Rising</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentPhase === 3 && (
                  <div className="bg-purple-500/20 rounded-lg p-4">
                    <div className="text-purple-300 text-sm mb-3">Zoning Analysis</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-white text-sm">
                        <span>Bill 44 Eligible</span>
                        <span className="text-emerald-400 font-bold">✓ Yes</span>
                      </div>
                      <div className="flex justify-between text-white text-sm">
                        <span>Max Units</span>
                        <span className="text-white font-bold">4-plex</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentPhase === 4 && (
                  <div className="bg-yellow-500/20 rounded-lg p-4">
                    <div className="text-yellow-300 text-sm mb-3">Financial Analysis</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-white text-sm">
                        <span>Investment</span>
                        <span className="font-bold">$3,500,000</span>
                      </div>
                      <div className="flex justify-between text-white text-sm">
                        <span>Projected ROI</span>
                        <span className="text-emerald-400 font-bold">32.4%</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentPhase === 5 && (
                  <div className="bg-green-500/20 rounded-lg p-4">
                    <div className="text-green-300 text-sm mb-3">Analysis Complete</div>
                    <div className="text-white text-sm">
                      <div className="text-2xl font-bold text-emerald-400 mb-2">87% Feasible</div>
                      <div>PDF report generated with contractor connections</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="bg-black/30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handlePlayPause}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleRestart}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={toggleCaptions}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Complete BC Development Analysis
              </h3>
              <div className="space-y-4">
                {[
                  "Authentic BC Assessment data integration",
                  "Real-time MLS comparables and pricing",
                  "Bill 44/47 legislative compliance analysis",
                  "Municipal zoning and bylaw verification",
                  "ROI calculations with authentic costs",
                  "Professional PDF reports and contractor network"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-lg">
              <h4 className="font-bold text-neutral-900 mb-2">
                Ready to Transform Your Development Process?
              </h4>
              <p className="text-neutral-600 mb-4">
                Join 200+ BC developers using BuildwiseAI for faster, smarter property decisions.
              </p>
              <Button 
                onClick={onGetStarted}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Start 7-Day Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}