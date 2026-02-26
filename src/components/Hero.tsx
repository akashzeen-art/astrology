// Hero.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Hand, Stars, Sparkles, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Add this style tag for animated gradient
const AnimatedGradientStyle = () => (
  <style>{`
    @keyframes gradient-move {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    .bg-animated-gradient {
      background: linear-gradient(270deg, #a78bfa, #60a5fa, #818cf8, #fbbf24, #f87171);
      background-size: 400% 400%;
      animation: gradient-move 8s ease-in-out infinite alternate;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
  `}</style>
);

// Animated Sun for Hero Section
const AnimatedSun = () => {
  const [pos, setPos] = useState({ x: 0, y: 0, scale: 1, rotate: 0, z: 2 });
  const [isMobile, setIsMobile] = useState(false);
  const requestRef = useRef<number>();
  const startTime = useRef<number>(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time;
      const t = (time - startTime.current) / 3500; // much slower
      // Smooth parametric curve: bottom left to top, rounded
      const progress = (Math.sin(t * Math.PI) + 1) / 2; // 0 to 1, smooth
      // Path: left to right, bottom to top, with a curve
      const x = 40 + 260 * Math.sin(progress * Math.PI * 0.9); // more left-right
      const y = 480 - 340 * progress + 30 * Math.sin(t * 2); // bottom to top, gentle wave
      // Scale: more visible change
      const scale = 0.92 + 0.28 * Math.sin(progress * Math.PI);
      // Z-index: 1 (far) to 3 (close) and back, for 3D effect
      const z = Math.round(1 + 2 * Math.pow(Math.sin(progress * Math.PI), 2));
      // Rotation: slow
      const rotate = (t * 18) % 360;
      setPos({ x, y, scale, rotate, z });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <img
      src="/images/hero22.png"
      alt="Animated Sun"
      className="hidden sm:block"
      style={{
        position: "absolute",
        left: `${pos.x}px`,
        bottom: 0,
        width: `${isMobile ? 120 : 220 * pos.scale}px`,
        height: `${isMobile ? 120 : 220 * pos.scale}px`,
        zIndex: pos.z,
        filter: "drop-shadow(0 0 60px #ffb30088)",
        transform: `rotate(${pos.rotate}deg)`,
        pointerEvents: "none",
        transition: "box-shadow 0.3s, z-index 0.3s",
      }}
      draggable={false}
    />
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [titleRef.current, subtitleRef.current, badgeRef.current, statsRef.current],
        { opacity: 0, y: 50 }
      );

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.4")
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .to(statsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");

      [badgeRef, titleRef, subtitleRef, statsRef].forEach((ref) => {
        if (ref.current) {
          gsap.fromTo(
            ref.current,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ref.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      gsap.to(starsRef.current?.children || [], {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        rotation: "random(-15, 15)",
        duration: "random(3, 6)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });

      // --- ADVANCED ANIMATIONS ---
      // Title: Subtle color (hue-rotate), position, scale animation for premium effect without overlap
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          filter: "hue-rotate(360deg)",
          scale: 1.02,
          x: 4,
          y: 4,
          duration: 3.5,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
      // REMOVE: Subtitle advanced animation
      // if (subtitleRef.current) {
      //   gsap.to(subtitleRef.current, {
      //     filter: "hue-rotate(-360deg)",
      //     scale: 1.04,
      //     x: -10,
      //     y: 10,
      //     duration: 3.5,
      //     ease: "power1.inOut",
      //     repeat: -1,
      //     yoyo: true,
      //   });
      // }
      // Badge: scale pulse
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1.1,
          duration: 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Mousemove parallax (remove subtitleRef from here)
      window.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (clientY / window.innerHeight - 0.5) * 2;

        gsap.to(titleRef.current, {
          x: xPercent * 10,
          y: yPercent * 5,
          rotation: xPercent * 1,
          duration: 2,
        });
        // REMOVE: gsap.to(subtitleRef.current, {...})
        // gsap.to(subtitleRef.current, {
        //   x: xPercent * 8,
        //   y: yPercent * 4,
        //   duration: 2.2,
        // });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedGradientStyle />
      {/* Floating icons */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none z-0">
        <Stars className="absolute top-10 left-4 sm:top-20 sm:left-20 h-4 w-4 sm:h-6 sm:w-6 text-purple-400 opacity-50" />
        <Sparkles className="absolute top-16 right-8 sm:top-32 sm:right-32 h-3 w-3 sm:h-4 sm:w-4 text-pink-300 opacity-40" />
        <Moon className="absolute bottom-20 left-4 sm:bottom-40 sm:left-40 h-5 w-5 sm:h-8 sm:w-8 text-yellow-300 opacity-30" />
        <Hand className="absolute top-32 right-4 sm:top-60 sm:right-20 h-4 w-4 sm:h-5 sm:w-5 text-indigo-300 opacity-40" />
      </div>
      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10 pt-20 sm:pt-24">
        <div className="text-center max-w-4xl mx-auto">
          <div ref={badgeRef}>
            <Badge
              variant="outline"
              className="mb-4 sm:mb-5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-purple-500/50 text-purple-300 bg-purple-500/10 backdrop-blur-sm"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              AI-Powered Mystical Insights
            </Badge>
          </div>
          <h1
            ref={titleRef}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 leading-tight text-white px-2"
            style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
            }}
          >
            Discover Your{" "}
            <span className="bg-animated-gradient">Destiny</span>
            <br />
            Through{" "}
            <span className="bg-animated-gradient">Ancient Wisdom</span>
          </h1>
          <p
            ref={subtitleRef}
            className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Unlock your palm lines and birth chart secrets with advanced AI. Get personalized insights into your personality, relationships, and future.
          </p>
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center px-2">
            <Link to="/palm-analysis" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm px-5 sm:px-6 py-2.5 sm:py-3 h-auto group shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30 touch-manipulation">
                <Hand className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Analyze Your Palm
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/astrology" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-purple-400/50 text-purple-300 hover:bg-purple-500/10 text-sm px-5 sm:px-6 py-2.5 sm:py-3 h-auto group hover:border-purple-400 touch-manipulation"
              >
                <Stars className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-700" />
                Get Astrology Reading
              </Button>
            </Link>
          </div>
          <div
            ref={statsRef}
            className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 max-w-3xl mx-auto px-2"
          >
            {[
              { label: "Readings Completed", value: "10K+", color: "text-purple-400", bgGradient: "from-purple-500/20 to-purple-600/20", borderColor: "border-purple-400/30", hoverGlow: "hover:shadow-purple-500/30" },
              { label: "Accuracy Rate", value: "98%", color: "text-blue-400", bgGradient: "from-blue-500/20 to-blue-600/20", borderColor: "border-blue-400/30", hoverGlow: "hover:shadow-blue-500/30" },
              { label: "Happy Users", value: "5K+", color: "text-amber-400", bgGradient: "from-amber-500/20 to-amber-600/20", borderColor: "border-amber-400/30", hoverGlow: "hover:shadow-amber-500/30" },
              { label: "AI Available", value: "24/7", color: "text-emerald-400", bgGradient: "from-emerald-500/20 to-emerald-600/20", borderColor: "border-emerald-400/30", hoverGlow: "hover:shadow-emerald-500/30" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`group relative text-center p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.bgGradient} backdrop-blur-md border ${stat.borderColor} transition-all duration-300 hover:scale-105 ${stat.hoverGlow}`}
              >
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${stat.color} mb-0.5 sm:mb-1 group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
