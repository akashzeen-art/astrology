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

const PalmAnalysis = () => {
  const [showResults, setShowResults] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      // Floating animation for icons
      gsap.to(".floating-icon", {
        y: "random(-5, 5)",
        rotation: "random(-10, 10)",
        duration: "random(2, 4)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.1,
      });

      // Gentle pulse animation for cards
      gsap.to(".glass-card", {
        scale: 1.01,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 1,
      });
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
          <PalmResults />
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen page-container">
      {/* Fixed star background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <Link to="/">
            <Button
              variant="outline"
              className="mb-6 border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header ref={headerRef} className="container mx-auto px-4 mb-12">
          <div className="text-center">
            <Badge
              variant="outline"
              className="mb-6 px-6 py-3 text-lg border-purple-400/50 text-purple-400 bg-purple-500/10 backdrop-blur-sm"
            >
              <Hand className="h-5 w-5 mr-2" />
              AI Palm Reading
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
                Life Lines
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Upload a photo of your palm and let our advanced AI analyze your
              life lines, personality traits, and future predictions.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main ref={contentRef} className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload section */}
            <div className="lg:col-span-2">
              <PalmUpload />
            </div>

            {/* Sidebar with information */}
            <div ref={sidebarRef} className="space-y-6">
              {/* What we analyze */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="h-5 w-5 text-purple-400 floating-icon" />
                    What We Analyze
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-white">Life Line</h4>
                      <p className="text-sm text-gray-300">
                        Vitality, health, and major life changes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-white">Head Line</h4>
                      <p className="text-sm text-gray-300">
                        Intelligence, communication, and mental approach
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-white">Heart Line</h4>
                      <p className="text-sm text-gray-300">
                        Emotions, relationships, and romantic nature
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-white">Fate Line</h4>
                      <p className="text-sm text-gray-300">
                        Career path, destiny, and life direction
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy info */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="h-5 w-5 text-amber-400 floating-icon" />
                    AI Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Line Detection
                      </span>
                      <span className="font-semibold text-amber-400">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Pattern Analysis
                      </span>
                      <span className="font-semibold text-purple-400">96%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Interpretation
                      </span>
                      <span className="font-semibold text-blue-400">94%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Based on 10,000+ analyzed readings
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-400 floating-icon" />
                    Reading Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">
                      Love & Relationships
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      Career & Success
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Life Timeline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">
                      Personality Traits
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-700/50 py-8 relative">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-400">
              Need help? Check our{" "}
              <a href="#" className="text-purple-400 hover:underline">
                FAQ
              </a>{" "}
              or{" "}
              <a href="#" className="text-purple-400 hover:underline">
                contact support
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PalmAnalysis;
