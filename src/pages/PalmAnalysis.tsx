import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import PalmUpload from "@/components/PalmUpload";
import PalmResults from "@/components/PalmResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hand,
  Brain,
  Heart,
  TrendingUp,
  Clock,
  Star,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useReadings } from "@/contexts/ReadingsContext";
import type { PalmReading } from "@/lib/apiService";

const PalmAnalysis = () => {
  // Authentication removed
  const [showResults, setShowResults] = useState(false);
  const { currentReading } = useReadings();
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Run GSAP animations when DOM refs are ready
    if (!pageRef.current || !headerRef.current || !contentRef.current || !sidebarRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([headerRef.current, contentRef.current, sidebarRef.current], {
        opacity: 0,
        y: 30,
      });

      // Create timeline
      const tl = gsap.timeline({ delay: 0.3 });

      // Animate elements
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          sidebarRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6",
        );

      // OPTIMIZED: Reduced floating animation for icons
      gsap.to(".floating-icon", {
        y: "random(-3, 3)", // Reduced range
        rotation: "random(-5, 5)", // Reduced rotation
        duration: "random(3, 6)", // Longer duration = less frequent updates
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.2, // Increased stagger
      });

      // REMOVED: Pulse animation for cards (too heavy, causes lag)
    }, pageRef);

    const handleShowResults = () => {
      setShowResults(true);
      // Smooth scroll to top to show results
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("showPalmResults", handleShowResults);

    return () => {
      ctx.revert();
      window.removeEventListener("showPalmResults", handleShowResults);
    };
  }, []);

  if (showResults) {
    return (
      <div className="min-h-screen page-container">
        {/* Fixed star background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="stars-bg absolute inset-0"></div>
        </div>

        <div className="relative z-10">
          <Navbar />
          {/* Spacer + subtle divider between sticky navbar and content */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          {/* Give enough top margin so content clears the sticky navbar height */}
          <div className="mt-20 md:mt-24">
            <PalmResults />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen page-container no-scrollbar overflow-y-auto">
      {/* Enhanced star background with gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
        {/* Additional gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-purple-900/40 to-blue-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />
        {/* Spacer + subtle divider between sticky navbar and main content */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mt-2" />

        {/* Back Button */}
        <div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 mb-3 sm:mb-4 flex justify-start">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10 bg-white/5 backdrop-blur-md text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 touch-manipulation"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header ref={headerRef} className="container mx-auto px-3 sm:px-4 mb-6 sm:mb-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-purple-500/50 text-purple-300 bg-purple-500/10"
            >
              <Hand className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              AI Palm Reading
            </Badge>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white px-2">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-blue-400 bg-clip-text text-transparent">
                Life Lines
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed max-w-xl mx-auto px-2">
              Upload a photo of your palm and let our advanced AI analyze your life lines, personality traits, and future predictions.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main ref={contentRef} className="container mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Upload section */}
            <div className="lg:col-span-2">
              <PalmUpload />
            </div>

            {/* Sidebar with information */}
            <div ref={sidebarRef} className="space-y-4">
              {/* What we analyze */}
              <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Brain className="h-4 w-4 text-purple-400" />
                    What We Analyze
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Life Line</h4>
                      <p className="text-xs text-gray-400">Vitality, health, and major life changes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Head Line</h4>
                      <p className="text-xs text-gray-400">Intelligence, communication, and mental approach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Heart Line</h4>
                      <p className="text-xs text-gray-400">Emotions, relationships, and romantic nature</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-white text-sm">Fate Line</h4>
                      <p className="text-xs text-gray-400">Career path, destiny, and life direction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy info */}
              <Card className="bg-slate-900/50 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Star className="h-4 w-4 text-amber-400" />
                    AI Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                      <span className="text-xs text-gray-400">Line Detection</span>
                      <span className="font-semibold text-lg text-amber-400">
                        {(() => {
                          const reading = currentReading as PalmReading | null;
                          const raw = reading?.results?.accuracy?.lineDetection ?? 0;
                          const value = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
                          return `${value}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                      <span className="text-xs text-gray-400">Pattern Analysis</span>
                      <span className="font-semibold text-lg text-purple-400">
                        {(() => {
                          const reading = currentReading as PalmReading | null;
                          const raw = reading?.results?.accuracy?.patternAnalysis ?? 0;
                          const value = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
                          return `${value}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
                      <span className="text-xs text-gray-400">Interpretation</span>
                      <span className="font-semibold text-lg text-blue-400">
                        {(() => {
                          const reading = currentReading as PalmReading | null;
                          const raw = reading?.results?.accuracy?.interpretation ?? 0;
                          const value = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
                          return `${value}%`;
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pt-2 border-t border-white/5">
                      Powered by live AI palm analysis. Values update after each reading.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="bg-slate-900/50 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    Reading Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">Love & Relationships</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/10 transition-colors">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Career & Success</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Life Timeline</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Personality Traits</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-400">
              Need help? Check our{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">FAQ</a>
              {" "}or{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">contact support</a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Your privacy is our priority. All images are processed securely.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PalmAnalysis;
