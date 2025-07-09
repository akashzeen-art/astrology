import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
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
} from "lucide-react";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Animated 3D sphere component
const AnimatedSphere = ({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} position={position} scale={0.8} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

// 3D Scene Background
const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#8b5cf6"
        />

        <AnimatedSphere position={[-3, 2, -2]} color="#8b5cf6" />
        <AnimatedSphere position={[3, -1, -1]} color="#06b6d4" />
        <AnimatedSphere position={[0, 0, -3]} color="#f59e0b" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
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
        "Discover your life path number and unlock the secrets of your destiny through advanced numerological calculations.",
      color: "cosmic",
      badge: "Core Numbers",
    },
    {
      icon: Target,
      title: "Destiny Analysis",
      description:
        "Uncover your life purpose and future opportunities through personalized numerological insights and predictions.",
      color: "stellar",
      badge: "Destiny",
    },
    {
      icon: Sparkles,
      title: "Soul Number Reading",
      description:
        "Explore your inner desires and spiritual motivations through detailed soul number analysis and interpretation.",
      color: "golden",
      badge: "Spiritual",
    },
    {
      icon: Brain,
      title: "AI Numerology Engine",
      description:
        "Powered by advanced AI algorithms that analyze numerical patterns with unprecedented accuracy and depth.",
      color: "mystic",
      badge: "AI-Powered",
    },
  ];

  const horoscopeFeatures = [
    {
      icon: Star,
      title: "Daily Horoscopes",
      description:
        "Personalized daily insights and cosmic guidance tailored to your unique zodiac profile and planetary alignments.",
      color: "cosmic",
      badge: "Daily",
    },
    {
      icon: Calendar,
      title: "Birth Chart Analysis",
      description:
        "Comprehensive astrological readings based on your exact birth time, date, and location for maximum accuracy.",
      color: "stellar",
      badge: "Personalized",
    },
    {
      icon: Heart,
      title: "Love Compatibility",
      description:
        "Discover relationship insights, romantic compatibility, and soulmate connections through celestial guidance.",
      color: "golden",
      badge: "Romance",
    },
    {
      icon: TrendingUp,
      title: "Future Forecasts",
      description:
        "Detailed weekly and monthly horoscope predictions covering career, love, health, and financial opportunities.",
      color: "mystic",
      badge: "Forecasting",
    },
  ];

  const astrologyFeatures = [
    {
      icon: Moon,
      title: "Lunar Cycle Guidance",
      description:
        "Harness the power of moon phases and lunar cycles for optimal timing in your personal and spiritual growth.",
      color: "cosmic",
      badge: "Lunar",
    },
    {
      icon: Eye,
      title: "Spiritual Awakening",
      description:
        "Connect with your higher purpose and receive divine guidance for your spiritual journey through celestial wisdom.",
      color: "stellar",
      badge: "Wisdom",
    },
    {
      icon: Hash,
      title: "Planetary Transits",
      description:
        "Track current planetary movements and their powerful influence on your personal chart and life events.",
      color: "golden",
      badge: "Live Updates",
    },
    {
      icon: Shield,
      title: "Protected Readings",
      description:
        "Your personal astrological data and sacred readings are encrypted and protected with enterprise-grade security.",
      color: "mystic",
      badge: "Secure",
    },
  ];

  useEffect(() => {
    if (sectionRef.current) {
      // Animate section entrance
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Animate cards
      const cards = sectionRef.current.querySelectorAll(".feature-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }
  }, [activeTab]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cosmic":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30";
      case "stellar":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
      case "golden":
        return "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30";
      case "mystic":
        return "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30";
      default:
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30";
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "cosmic":
        return "border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:bg-purple-900/20";
      case "stellar":
        return "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/20";
      case "golden":
        return "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:bg-amber-900/20";
      case "mystic":
        return "border-indigo-300 text-indigo-700 bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:bg-indigo-900/20";
      default:
        return "border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:bg-purple-900/20";
    }
  };

  const renderFeatureGrid = (features: typeof numerologyFeatures) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            className="feature-card bg-white/80 dark:bg-gray-800/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 group cursor-pointer"
          >
            <CardContent className="p-8">
              <Badge
                variant="outline"
                className={`mb-6 px-3 py-1 font-medium ${getBadgeClasses(feature.color)}`}
              >
                {feature.badge}
              </Badge>

              <div className="mb-6">
                <div
                  className={`inline-flex p-4 rounded-2xl ${getColorClasses(feature.color)} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-8 w-8" />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
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
      className="py-20 relative overflow-hidden min-h-screen"
    >
      {/* 3D Background */}
      <ThreeBackground />

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-blue-50/90 to-amber-50/90 dark:from-gray-900/90 dark:via-purple-900/90 dark:to-blue-900/90"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-6 py-3 text-lg border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:bg-purple-900/20"
          >
            ✨ Platform Features
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-gray-100">
            Powered by{" "}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 bg-clip-text text-transparent">
              Advanced AI
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the perfect blend of ancient wisdom and cutting-edge
            technology. Our AI analyzes thousands of patterns and configurations
            to provide you with accurate, personalized insights.
          </p>
        </div>

        {/* Features tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList
              ref={tabsRef}
              className="grid w-full max-w-lg grid-cols-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 p-2 rounded-2xl"
            >
              <TabsTrigger
                value="numerology"
                className="px-6 py-3 text-lg font-semibold rounded-xl data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/50 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-lg transition-all duration-300"
              >
                🔢 Numerology
              </TabsTrigger>
              <TabsTrigger
                value="horoscope"
                className="px-6 py-3 text-lg font-semibold rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-lg transition-all duration-300"
              >
                ⭐ Horoscope
              </TabsTrigger>
              <TabsTrigger
                value="astrology"
                className="px-6 py-3 text-lg font-semibold rounded-xl data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/50 dark:data-[state=active]:text-amber-300 data-[state=active]:shadow-lg transition-all duration-300"
              >
                🌙 Astrology
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="numerology" className="mt-12">
            {renderFeatureGrid(numerologyFeatures)}
          </TabsContent>

          <TabsContent value="horoscope" className="mt-12">
            {renderFeatureGrid(horoscopeFeatures)}
          </TabsContent>

          <TabsContent value="astrology" className="mt-12">
            {renderFeatureGrid(astrologyFeatures)}
          </TabsContent>
        </Tabs>

        {/* Enhanced Stats section */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50K+", label: "Readings Completed", icon: Zap },
            { value: "99%", label: "Accuracy Rate", icon: Target },
            { value: "24/7", label: "Always Available", icon: Clock },
            { value: "5★", label: "User Rating", icon: Star },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
