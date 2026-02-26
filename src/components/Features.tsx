
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import {
  Brain,
  Camera,
  Calendar,
  Shield,
  Zap,
  TrendingUp,
  Heart,
  Eye,
  Clock,
  Hash,
  Calculator,
  Target,
  Sparkles,
  Star,
  Moon,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ShootingStar component for card overlay
const ShootingStar: React.FC<{ cardWidth: number; cardHeight: number }> = ({ cardWidth, cardHeight }) => {
  const [stars, setStars] = useState([
    // Each star: {id, startX, startY, size, duration, delay}
  ]);

  // Helper to generate a random star config
  const generateStar = (id: number) => {
    const size = Math.random() * 32 + 24; // 24px to 56px
    // Start from top right, end at bottom left
    const startX = cardWidth - (Math.random() * (cardWidth * 0.3) + size); // randomize a bit near top right
    const startY = Math.random() * 20; // a little vertical randomness at top
    const duration = Math.random() * 1.2 + 1.2; // 1.2s to 2.4s
    const delay = Math.random() * 2.5; // 0s to 2.5s
    return { id, startX, startY, size, duration, delay };
  };

  useEffect(() => {
    // Generate 2-3 stars per card
    setStars([
      generateStar(1),
      generateStar(2),
      Math.random() > 0.5 ? generateStar(3) : null,
    ].filter(Boolean));
  }, [cardWidth, cardHeight]);

  return (
    <>
      {stars.map((star) => (
        <img
          key={star.id}
          src="/images/shootingstar.png"
          alt="Shooting Star"
          style={{
            position: "absolute",
            left: star.startX,
            top: star.startY,
            width: star.size,
            height: "auto",
            pointerEvents: "none",
            zIndex: 30,
            opacity: 0.85,
            filter: "drop-shadow(0 0 8px #fff8) blur(0.5px)",
            transform: "rotate(180deg)",
            animation: `shooting-star-fall-${star.id} ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
      {/* Keyframes for each star */}
      <style>{`
        ${stars
          .map(
            (star) => `@keyframes shooting-star-fall-${star.id} {
              0% { opacity: 0; transform: translate(0, 0) scale(0.8) rotate(180deg); }
              10% { opacity: 1; }
              80% { opacity: 1; }
              100% { opacity: 0; transform: translate(-${cardWidth - star.startX + 40}px, ${cardHeight + 40}px) scale(1.1) rotate(180deg); }
            }`
          )
          .join("\n")}
      `}</style>
    </>
  );
};

// Animated Floating Images Component
const AnimatedFloatingImages = () => {
  const [img1, setImg1] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    z: 1,
  });
  const [img2, setImg2] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    z: 2,
  });
  const requestRef = useRef<number>();
  const startTime = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time;
      const t = (time - startTime.current) / 1000;
      // Animate img1
      setImg1({
        x: Math.sin(t * 0.5) * 120 + 80,
        y: Math.cos(t * 0.7) * 60 + 120,
        scale: 1 + 0.2 * Math.sin(t * 0.8),
        rotate: (t * 40) % 360,
        z: 1 + Math.round((Math.sin(t * 0.6) + 1) * 1),
      });
      // Animate img2
      setImg2({
        x: Math.cos(t * 0.6) * 100 + 400,
        y: Math.sin(t * 0.9) * 80 + 200,
        scale: 1.1 + 0.15 * Math.cos(t * 0.5),
        rotate: (t * 60) % 360,
        z: 1 + Math.round((Math.cos(t * 0.8) + 1) * 1),
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <img
        src="/images/animate1.png"
        alt="Animated 1"
        style={{
          position: "absolute",
          top: `${img1.y}px`,
          left: `${img1.x}px`,
          width: `${120 * img1.scale}px`,
          height: `${120 * img1.scale}px`,
          borderRadius: "50%",
          backgroundColor: "transparent",
          // boxShadow: "0 0 32px 0 rgba(80, 80, 180, 0.10)",
          zIndex: 30, // <-- set high z-index
          transform: `rotate(${img1.rotate}deg)`,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
        // className="shadow-2xl"
        draggable={false}
      />
      <img
        src="/images/animate2.png"
        alt="Animated 2"
        style={{
          position: "absolute",
          top: `${img2.y}px`,
          left: `${img2.x}px`,
          width: `${100 * img2.scale}px`,
          height: `${100 * img2.scale}px`,
          borderRadius: "50%",
          // background: "rgba(255,255,255,0.7)",
          // boxShadow: "0 0 32px 0 rgba(180, 80, 80, 0.10)",
          zIndex: 30, // <-- set high z-index
          transform: `rotate(${img2.rotate}deg)`,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
        // className="shadow-2xl"
        draggable={false}
      />
    </>
  );
};

// Animated Counter Component
const AnimatedCounter = ({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: any;
}) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const targetValue = parseInt(value.replace(/\D/g, ""));
          const duration = 2000;
          const increment = targetValue / (duration / 16);
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
              current = targetValue;
              clearInterval(timer);
            }
            setCount(Math.floor(current));
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={counterRef} className="text-center group">
      <div className="mb-3 sm:mb-4 flex justify-center">
        <div className="p-3 sm:p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 group-hover:scale-110 transition-all duration-500 shadow-lg">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
      </div>
      <div className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 bg-clip-text text-transparent mb-2 sm:mb-3">
        {value.includes("+")
          ? `${count}+`
          : value.includes("%")
          ? `${count}%`
          : value.includes("★")
          ? `${count}★`
          : value}
      </div>
      <div className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium">
        {label}
      </div>
    </div>
  );
};

// Animated Stat Image Component
const AnimatedStatImage = ({
  children,
  imgSrc,
  speed = 1,
  size = 140,
}: {
  children: React.ReactNode;
  imgSrc: string;
  speed?: number;
  size?: number;
}) => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setRotation((r) => (r + speed) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [speed]);
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={imgSrc}
        alt="Animated Stat BG"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          zIndex: 1,
          transform: `rotate(${rotation}deg)`,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
        draggable={false}
      />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  );
};

// Animated Stat SVG Component (for shape.svg)
const AnimatedStatSVG = ({
  value,
  label,
  speed = 0.3,
  isStar = false,
}: {
  value: string;
  label: string;
  speed?: number;
  isStar?: boolean;
}) => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setRotation((r) => (r + speed) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [speed]);
  return (
    <div className="flex flex-col items-center justify-center group">
      <div
        className="relative flex items-center justify-center"
        style={{ width: 180, height: 180 }}
      >
        <img
          src="/images/shape.svg"
          alt="Stat Shape"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 180,
            height: 180,
            zIndex: 1,
            transform: `rotate(${rotation}deg)`,
            transition: "box-shadow 0.3s",
            pointerEvents: "none",
          }}
          draggable={false}
        />
        {/* Transparent dark circle behind number */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(10,20,40,0.55)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></span>
        <span
          className="relative z-10 text-[2rem] md:text-3xl font-extrabold flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500"
          style={{ fontFamily: "inherit", letterSpacing: 1 }}
        >
          {isStar ? (
            <>
              5
              <span className="ml-1 text-[1.5rem] md:text-2xl text-blue-700 align-middle">
                ★
              </span>
            </>
          ) : (
            value
          )}
        </span>
      </div>
      <div
        className="mt-4 text-white text-lg md:text-xl font-semibold text-center transition-colors duration-300 group-hover:text-orange-400"
        style={{ fontFamily: "inherit" }}
      >
        {label}
      </div>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("numerology");

  const numerologyFeatures = [
    {
      icon: Calculator,
      title: "Life Path Calculator",
      description:
        "Discover your life path number and unlock your destiny through advanced numerological calculations.",
      color: "cosmic",
      badge: "Core Numbers",
    },
    {
      icon: Target,
      title: "Destiny Analysis",
      description:
        "Uncover your life purpose and future opportunities through personalized numerological insights.",
      color: "stellar",
      badge: "Destiny",
    },
    {
      icon: Sparkles,
      title: "Soul Number Reading",
      description:
        "Explore your inner desires and spiritual motivations through detailed soul number analysis.",
      color: "golden",
      badge: "Spiritual",
    },
    {
      icon: Brain,
      title: "AI Numerology Engine",
      description:
        "Advanced AI algorithms analyze numerical patterns with unprecedented accuracy and depth.",
      color: "mystic",
      badge: "AI-Powered",
    },
  ];

  const horoscopeFeatures = [
    {
      icon: Star,
      title: "Daily Horoscopes",
      description:
        "Personalized daily insights and cosmic guidance tailored to your unique zodiac profile.",
      color: "cosmic",
      badge: "Daily",
    },
    {
      icon: Calendar,
      title: "Birth Chart Analysis",
      description:
        "Comprehensive astrological readings based on your exact birth time, date, and location.",
      color: "stellar",
      badge: "Personalized",
    },
    {
      icon: Heart,
      title: "Love Compatibility",
      description:
        "Discover relationship insights, romantic compatibility, and soulmate connections.",
      color: "golden",
      badge: "Romance",
    },
    {
      icon: TrendingUp,
      title: "Future Forecasts",
      description:
        "Detailed weekly and monthly predictions covering career, love, health, and finances.",
      color: "mystic",
      badge: "Forecasting",
    },
  ];

  const astrologyFeatures = [
    {
      icon: Moon,
      title: "Lunar Cycle Guidance",
      description:
        "Harness moon phases and lunar cycles for optimal timing in personal and spiritual growth.",
      color: "cosmic",
      badge: "Lunar",
    },
    {
      icon: Eye,
      title: "Spiritual Awakening",
      description:
        "Connect with your higher purpose and receive divine guidance for your spiritual journey.",
      color: "stellar",
      badge: "Wisdom",
    },
    {
      icon: Hash,
      title: "Planetary Transits",
      description:
        "Track planetary movements and their influence on your personal chart and life events.",
      color: "golden",
      badge: "Live Updates",
    },
    {
      icon: Shield,
      title: "Protected Readings",
      description:
        "Your personal astrological data is encrypted and protected with enterprise-grade security.",
      color: "mystic",
      badge: "Secure",
    },
  ];

  useEffect(() => {
    if (sectionRef.current) {
      // Animate header elements
      const headerElements =
        sectionRef.current.querySelectorAll(".header-animate");
      gsap.fromTo(
        headerElements,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate cards with enhanced effects
      const cards = sectionRef.current.querySelectorAll(".feature-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.8, rotationY: -15 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate tabs with slide effect
      if (tabsRef.current) {
        gsap.fromTo(
          tabsRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: tabsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Parallax effect for background elements
      gsap.to(".parallax-bg", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }, [activeTab]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cosmic":
        return "text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200 dark:text-purple-400 dark:from-purple-900/30 dark:to-purple-800/30";
      case "stellar":
        return "text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 dark:text-blue-400 dark:from-blue-900/30 dark:to-blue-800/30";
      case "golden":
        return "text-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 dark:text-amber-400 dark:from-amber-900/30 dark:to-amber-800/30";
      case "mystic":
        return "text-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:text-indigo-400 dark:from-indigo-900/30 dark:to-indigo-800/30";
      default:
        return "text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200 dark:text-purple-400 dark:from-purple-900/30 dark:to-purple-800/30";
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "cosmic":
        return "border-purple-300 text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-600 dark:text-purple-300 dark:from-purple-900/20 dark:to-purple-800/20";
      case "stellar":
        return "border-blue-300 text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-600 dark:text-blue-300 dark:from-blue-900/20 dark:to-blue-800/20";
      case "golden":
        return "border-amber-300 text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 dark:border-amber-600 dark:text-amber-300 dark:from-amber-900/20 dark:to-amber-800/20";
      case "mystic":
        return "border-indigo-300 text-indigo-700 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:border-indigo-600 dark:text-indigo-300 dark:from-indigo-900/20 dark:to-indigo-800/20";
      default:
        return "border-purple-300 text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-600 dark:text-purple-300 dark:from-purple-900/20 dark:to-purple-800/20";
    }
  };

  const CARD_WIDTH = 420; // px (approximate, adjust as needed)
  const CARD_HEIGHT = 260; // px (approximate, adjust as needed)

  const renderFeatureGrid = (features: typeof numerologyFeatures) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            className="feature-card relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-purple-900/40 border border-purple-500/20 rounded-lg sm:rounded-xl hover:border-purple-500/40 transition-all duration-300 group"
          >
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 rounded-md sm:rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
                <Badge
                  variant="outline"
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-white/5 text-gray-300 border-gray-600/30"
                >
                  {feature.badge}
                </Badge>
              </div>

              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden min-h-screen"
    >
      {/* Overlay to match Hero section */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-90= z-0" />
      {/* Animated Floating Images */}
      <AnimatedFloatingImages />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section header with enhanced animations */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge
            variant="outline"
            className="header-animate mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-purple-500/50 text-purple-300 bg-purple-500/10"
          >
            ✨ Platform Features
          </Badge>
          <h2
            className="header-animate mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-white px-2"
          >
            Powered by{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
              Advanced AI
            </span>
          </h2>
          <p className="header-animate max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed px-2">
            Experience the perfect blend of ancient wisdom and cutting-edge technology. Our AI analyzes thousands of patterns to provide accurate, personalized insights.
          </p>
        </div>

        {/* Enhanced Features tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6 sm:mb-8">
            <TabsList
              ref={tabsRef}
              className="flex w-full max-w-xl p-1 sm:p-2 justify-between gap-1 sm:gap-2 bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-lg sm:rounded-xl"
            >
              {/* Numerology Tab */}
              <TabsTrigger
                value="numerology"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-300 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white touch-manipulation"
              >
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Numerology</span>
                <span className="xs:hidden">Num</span>
              </TabsTrigger>
              {/* Horoscope Tab */}
              <TabsTrigger
                value="horoscope"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-300 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-amber-400 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white touch-manipulation"
              >
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Horoscope</span>
                <span className="xs:hidden">Horo</span>
              </TabsTrigger>
              {/* Astrology Tab */}
              <TabsTrigger
                value="astrology"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-300 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white touch-manipulation"
              >
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Astrology</span>
                <span className="xs:hidden">Astro</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="numerology" className="mt-6 sm:mt-12">
            {renderFeatureGrid(numerologyFeatures)}
          </TabsContent>

          <TabsContent value="horoscope" className="mt-6 sm:mt-12">
            {renderFeatureGrid(horoscopeFeatures)}
          </TabsContent>

          <TabsContent value="astrology" className="mt-6 sm:mt-12">
            {renderFeatureGrid(astrologyFeatures)}
          </TabsContent>
        </Tabs>

        {/* Stats section */}
        <div className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto">
          {[
            { value: "50K+", label: "Readings Completed" },
            { value: "99%", label: "Accuracy Rate" },
            { value: "24/7", label: "Always Available" },
            { value: "5★", label: "User Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-900/50 border border-purple-500/20">
              <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Call to action section */}
      </div>
    </section>
  );
};

export default Features;
