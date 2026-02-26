import React from "react";
import VideoBackground from "@/components/VideoBackground";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stars, Sparkles, Moon, Hand } from "lucide-react";

const VideoBackgroundDemo = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background with Overlay */}
      <VideoBackground src="/images/he2.mp4" overlay={true} />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Stars className="absolute top-20 left-20 h-6 w-6 text-purple-400 opacity-60 animate-pulse" />
        <Sparkles className="absolute top-40 right-32 h-4 w-4 text-pink-300 opacity-50 animate-bounce" />
        <Moon className="absolute bottom-40 left-40 h-8 w-8 text-yellow-300 opacity-40 animate-pulse" />
        <Hand className="absolute top-60 right-20 h-5 w-5 text-indigo-300 opacity-50 animate-bounce" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Hero Card */}
          <GlassCard className="p-8 text-center" blur="lg" opacity="medium">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-400/50">
              <Sparkles className="h-4 w-4 mr-2" />
              Video Background Demo
            </Badge>
            
            <h1 className="text-4xl font-bold mb-4 text-white">
              Immersive{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Content floats elegantly over a mystical video background, creating a cinematic user experience with glass morphism effects.
            </p>
            
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-105 transition-all duration-300">
              <Stars className="h-4 w-4 mr-2" />
              Explore Magic
            </Button>
          </GlassCard>

          {/* Features Card */}
          <GlassCard className="p-8" blur="md" opacity="low">
            <h2 className="text-2xl font-bold mb-6 text-white">Key Features</h2>
            
            <div className="space-y-4">
              {[
                { icon: Stars, title: "Seamless Integration", desc: "Video never interferes with interaction" },
                { icon: Sparkles, title: "Performance Optimized", desc: "GPU acceleration & mobile optimization" },
                { icon: Moon, title: "Glass Morphism", desc: "Semi-transparent cards with backdrop blur" },
                { icon: Hand, title: "Cursor Responsive", desc: "Elements react to mouse movement" },
              ].map((feature, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <feature.icon className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Stats Card */}
          <GlassCard className="p-6 md:col-span-2" blur="sm" opacity="high">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Performance", value: "60 FPS", color: "text-green-400" },
                { label: "Load Time", value: "< 2s", color: "text-blue-400" },
                { label: "Mobile Ready", value: "100%", color: "text-purple-400" },
                { label: "Accessibility", value: "WCAG", color: "text-amber-400" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default VideoBackgroundDemo;