import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle, Music } from "lucide-react";

interface DemoVideoSectionProps {
  onGetStarted?: () => void;
}

export default function DemoVideoSection({ onGetStarted }: DemoVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceoverPhase, setVoiceoverPhase] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalDuration = 60; // Faster 1:00 demo video
  
  // Check speech synthesis support and cleanup on unmount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }
    
    // Cleanup function to prevent voice repeating
    return () => {
      window.speechSynthesis.cancel();
      if ((window as any).videoInterval) {
        clearInterval((window as any).videoInterval);
      }
    };
  }, []);

  // Stop speech when component state changes
  useEffect(() => {
    if (!isPlaying) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
  }, [isPlaying]);

  // Stop speech when muted
  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
  }, [isMuted]);

  const voiceoverTexts: Record<number, string> = {
    0: "Ready to see how BuildwiseAI transforms BC property development? This real Vancouver analysis shows the complete workflow in 60 seconds.",
    1: "Let's analyze a Vancouver property using BuildwiseAI. Watch as we instantly pull BC Assessment data and property details from real MLS records.",
    2: "Now we're comparing with recent MLS sales in the area. Similar properties show strong market trends and development potential.",
    3: "Next, BuildwiseAI checks Vancouver zoning laws and Bill 44/47 compliance. This property shows excellent potential for multiplex development.",
    4: "The financial engine calculates ROI based on real costs. With 1.34 million investment plus 580K construction, projected value reaches 2.75 million for 43.2% return.",
    5: "Analysis complete! 87% feasibility score confirms this is an excellent opportunity. BuildwiseAI connects you with 15+ qualified contractors."
  };

  const speakText = (text: string) => {
    if (!speechSupported || isMuted) return;
    
    // Stop any current speech immediately and clear queue
    window.speechSynthesis.cancel();
    
    // Wait a moment for cancellation to complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Prevent speech from repeating
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        speechRef.current = null;
      };
      
      utterance.onerror = () => {
        console.log('Speech error occurred');
        speechRef.current = null;
      };
      
      // Try to use a professional-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.lang.startsWith('en-')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Only speak if no current speech is active
      if (!speechRef.current && window.speechSynthesis.pending === false) {
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate video playback with time progression
    if (!isPlaying) {
      // Start initial narration
      speakText(voiceoverTexts[0]);
      
      // Start playing - faster time progression with voiceover phases
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            setVoiceoverPhase(0);
            clearInterval(interval);
            return 0; // Reset to beginning
          }
          
          // Update voiceover phase based on timeline
          let newPhase = voiceoverPhase;
          if (newTime < 12) newPhase = 1;
          else if (newTime < 24) newPhase = 2;
          else if (newTime < 36) newPhase = 3;
          else if (newTime < 48) newPhase = 4;
          else newPhase = 5;
          
          // Speak when phase changes
          if (newPhase !== voiceoverPhase) {
            setVoiceoverPhase(newPhase);
            speakText(voiceoverTexts[newPhase]);
          }
          
          return newTime;
        });
      }, 500); // Faster playback - 2x speed
      
      // Store interval reference to clear later
      (window as any).videoInterval = interval;
    } else {
      // Pause - stop time progression and speech
      window.speechSynthesis.cancel();
      if ((window as any).videoInterval) {
        clearInterval((window as any).videoInterval);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Muting - stop current speech
      window.speechSynthesis.cancel();
    } else if (isPlaying) {
      // Unmuting - speak current phase text
      speakText(voiceoverTexts[voiceoverPhase]);
    }
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
                  {!isPlaying ? (
                    <div className="text-center">
                      <div 
                        onClick={handlePlayPause}
                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors hover:scale-110"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        BuildwiseAI Platform Demo
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Real BC Property Analysis Demo
                      </p>
                      <p className="text-blue-200 text-xs mt-1">
                        Interactive Demo • Live Data • No Audio Required
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-green-300">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Silent Demo - Visual Only</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white p-6 text-left overflow-y-auto">
                      {/* Simulated Property Analysis Interface */}
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="border-b pb-4">
                          <h3 className="text-lg font-bold text-neutral-900">BuildwiseAI Analysis Dashboard</h3>
                          <p className="text-sm text-neutral-600">Sample BC Property Analysis</p>
                        </div>

                        {/* Narrator Commentary */}
                        <div className="bg-blue-900 text-white p-3 rounded-lg mb-4 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {!isMuted && speechSupported ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                              <span className="font-medium">Narrator:</span>
                            </div>
                            {speechSupported && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleMute}
                                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                              >
                                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                          <p className="italic">
                            {voiceoverTexts[voiceoverPhase]}
                          </p>
                          {!speechSupported && (
                            <p className="text-xs text-blue-300 mt-1">
                              Voice narration not supported in this browser
                            </p>
                          )}
                        </div>

                        {/* Dynamic Content Based on Time - Faster Phases */}
                        {currentTime < 12 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">🏠 Fetching BC Assessment Data...</span>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium">Assessed Value:</span>
                                  <div className="text-lg font-bold text-emerald-600">$1,340,000</div>
                                </div>
                                <div>
                                  <span className="font-medium">Land Value:</span>
                                  <div className="text-lg font-bold">$890,000</div>
                                </div>
                                <div>
                                  <span className="font-medium">Zoning:</span>
                                  <div className="text-sm font-bold">RS-1</div>
                                </div>
                                <div>
                                  <span className="font-medium">Lot Size:</span>
                                  <div className="text-sm font-bold">8,712 sq ft</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentTime >= 12 && currentTime < 24 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">📊 Analyzing MLS Comparables...</span>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span>21560 Glenwood Ave • Sold 12 days</span>
                                  <span className="font-bold text-blue-600">$1,295,000</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>21562 Glenwood Ave • Sold 8 days</span>
                                  <span className="font-bold text-blue-600">$1,385,000</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>11745 228th St • Sold 18 days</span>
                                  <span className="font-bold text-blue-600">$1,320,000</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between font-bold">
                                    <span>Market Trend:</span>
                                    <span className="text-emerald-600">↗ Rising 2.8%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentTime >= 24 && currentTime < 36 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">⚖️ Checking Zoning & Bill 44 Compliance...</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Current Zoning:</span>
                                  <span className="font-bold">RS-1</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bill 44/47 Compliance:</span>
                                  <span className="text-emerald-600 font-bold">✓ Eligible for Multiplex</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Transit-Oriented Area:</span>
                                  <span className="text-emerald-600 font-bold">✓ Yes - 800m to SkyTrain</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Development Potential:</span>
                                  <span className="font-bold text-purple-600">High - Up to 6 Units</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentTime >= 36 && currentTime < 48 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">💰 Calculating ROI & Financial Projections...</span>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium">Current Investment:</span>
                                  <div className="text-sm font-bold">$1,340,000</div>
                                </div>
                                <div>
                                  <span className="font-medium">Construction Cost:</span>
                                  <div className="text-sm font-bold">$580,000</div>
                                </div>
                                <div>
                                  <span className="font-medium">Projected Value:</span>
                                  <div className="text-lg font-bold text-orange-600">$2,750,000</div>
                                </div>
                                <div>
                                  <span className="font-medium">Estimated ROI:</span>
                                  <div className="text-lg font-bold text-emerald-600">43.2%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentTime >= 48 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium">🎯 Analysis Complete - Ready for Action!</span>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                              <div className="text-center space-y-2">
                                <div className="text-2xl font-bold text-emerald-600">87% Feasibility Score</div>
                                <p className="text-xs text-emerald-700">Excellent development opportunity</p>
                                <div className="flex justify-center gap-4 text-xs mt-3">
                                  <div className="text-center">
                                    <div className="font-bold text-blue-600">6-Unit</div>
                                    <div>Multiplex</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-green-600">18 Months</div>
                                    <div>Timeline</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-purple-600">15+</div>
                                    <div>Contractors</div>
                                  </div>
                                </div>
                                <Button 
                                  onClick={onGetStarted}
                                  className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded text-xs hover:bg-emerald-700"
                                >
                                  Start Your Analysis
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    
                    {isPlaying && (
                      <div className="flex items-center space-x-2 text-xs text-yellow-300">
                        <Music className="w-3 h-3" />
                        <span>Music + Voice</span>
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
                This demo shows the complete BuildwiseAI workflow with real BC property data. 
                Watch real BC Assessment data ($1.34M assessed value), local MLS comparables, Bill 44 compliance, 
                and ROI calculations (43.2% projected return) with contractor connections.
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