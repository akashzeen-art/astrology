import { useRef, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS } from "@/lib/config";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
  Text,
  Ring,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {
  Calculator,
  Target,
  Heart,
  Star,
  Calendar,
  Sparkles,
  Brain,
  Infinity,
  Zap,
  BookOpen,
  TrendingUp,
  Users,
  Lightbulb,
  Crown,
  Eye,
  Download,
  Share2,
  FileText,
  Copy,
  Loader2,
} from "lucide-react";
import {
  downloadReport,
  shareReading,
  shareWithReport,
  copyToClipboard,
  ReadingData,
} from "@/lib/shareAndDownload";
// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Animated number orbits
const NumberOrbit = ({
  number,
  radius,
  speed,
  color,
}: {
  number: number;
  radius: number;
  speed: number;
  color: string;
}) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[radius, 0, 0.5]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {number.toString()}
        </Text>
      </Float>
    </group>
  );
};

// Sacred geometry background
const SacredGeometry = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central sacred geometry */}
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
        <Ring args={[2, 2.2, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.3} />
        </Ring>
      </Float>

      {/* Number orbits */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
        <NumberOrbit
          key={num}
          number={num}
          radius={3 + index * 0.3}
          speed={0.1 + index * 0.02}
          color={`hsl(${(index * 40) % 360}, 70%, 60%)`}
        />
      ))}

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#f59e0b" />
    </group>
  );
};

// 3D Scene Background - Mobile optimized
const ThreeBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reduce 3D complexity on mobile for better performance
  if (isMobile) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <SacredGeometry />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Canvas>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <SacredGeometry />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

const Numerology = () => {
  const { toast } = useToast();
  // Authentication removed
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current || !headerRef.current || !formRef.current || !visualsRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([headerRef.current, formRef.current, visualsRef.current], {
        opacity: 0,
        y: 50,
      });

      // Create timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // OPTIMIZED: Faster animations
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6, // Reduced from 1s
        ease: "power2.out", // Simpler easing
      })
        .to(
          formRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5, // Reduced from 0.8s
            ease: "power2.out",
          },
          "-=0.4", // Reduced overlap
        )
        .to(
          visualsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5, // Reduced from 0.8s
            ease: "power2.out",
          },
          "-=0.3", // Reduced overlap
        );

      // OPTIMIZED: Cards animation with simpler easing
      const cardsNodeList = pageRef.current?.querySelectorAll(".number-card");
      if (cardsNodeList && cardsNodeList.length > 0) {
        const cards = Array.from(cardsNodeList);
        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.9, y: 20 }, // Reduced initial transform
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4, // Reduced from 0.6s
            stagger: 0.08, // Reduced stagger
            ease: "power2.out", // Simpler easing instead of back.out
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const calculateLifePath = async () => {
    if (!birthDate || !fullName) return;

    setIsCalculating(true);
    setCalculationProgress(0);

    // Simulate calculation progress
    const progressInterval = setInterval(() => {
      setCalculationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Actual calculation
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const sum = day + month + year;
    const lifePathNumber = reduceToSingleDigit(sum);

    // Calculate other numbers
    const destinyNumber = calculateDestinyNumber(fullName);
    const soulNumber = calculateSoulNumber(fullName);
    const personalityNumber = calculatePersonalityNumber(fullName);

    clearInterval(progressInterval);
    setCalculationProgress(100);

    setTimeout(async () => {
      const numerologyResult = {
        lifePathNumber,
        destinyNumber,
        soulNumber,
        personalityNumber,
        day,
        month,
        year,
        fullName,
        interpretation: getLifePathInterpretation(lifePathNumber),
        compatibility: getCompatibilityNumbers(lifePathNumber),
        luckyNumbers: getLuckyNumbers(lifePathNumber),
      };
      
      setResult(numerologyResult);
      setIsCalculating(false);

        // Automatically save numerology reading to Dashboard (only if user is authenticated)
        try {
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            const { apiService } = await import("@/lib/apiService");
            // Get latest palm reading for integration (if available)
            const palmReadingId = await apiService.getLatestPalmReadingId();
            await apiService.saveReading({
              reading_type: "numerology",
              result: numerologyResult,
              accuracy: 95, // Numerology calculations are deterministic
              palm_reference_id: palmReadingId || undefined, // Link to palm reading if available
            });
            console.log("✅ Numerology reading saved to Dashboard", palmReadingId ? `(linked to palm reading ${palmReadingId})` : "");
            // Trigger Dashboard refresh event
            window.dispatchEvent(new CustomEvent("reading-saved", { 
              detail: { reading_type: "numerology" } 
            }));
          } else {
            console.log("ℹ️ User not logged in - reading available locally only");
          }
        } catch (error: any) {
          // Only log if it's not an authentication error (which is expected for non-logged-in users)
          if (error?.message?.includes("Not authenticated")) {
            console.log("ℹ️ Please log in to save readings to your Dashboard");
          } else {
            console.warn("⚠️ Failed to save numerology reading to Dashboard:", error);
          }
          // Don't throw - reading is still available locally
        }
    }, 500);
  };

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const calculateDestinyNumber = (name: string): number => {
    const values: { [key: string]: number } = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 1,
      k: 2,
      l: 3,
      m: 4,
      n: 5,
      o: 6,
      p: 7,
      q: 8,
      r: 9,
      s: 1,
      t: 2,
      u: 3,
      v: 4,
      w: 5,
      x: 6,
      y: 7,
      z: 8,
    };

    const sum = name
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .split("")
      .reduce((total, char) => total + (values[char] || 0), 0);

    return reduceToSingleDigit(sum);
  };

  const calculateSoulNumber = (name: string): number => {
    const vowels = "aeiou";
    const values: { [key: string]: number } = {
      a: 1,
      e: 5,
      i: 9,
      o: 6,
      u: 3,
    };

    const sum = name
      .toLowerCase()
      .split("")
      .filter((char) => vowels.includes(char))
      .reduce((total, char) => total + (values[char] || 0), 0);

    return reduceToSingleDigit(sum);
  };

  const calculatePersonalityNumber = (name: string): number => {
    const vowels = "aeiou";
    const values: { [key: string]: number } = {
      b: 2,
      c: 3,
      d: 4,
      f: 6,
      g: 7,
      h: 8,
      j: 1,
      k: 2,
      l: 3,
      m: 4,
      n: 5,
      p: 7,
      q: 8,
      r: 9,
      s: 1,
      t: 2,
      v: 4,
      w: 5,
      x: 6,
      y: 7,
      z: 8,
    };

    const sum = name
      .toLowerCase()
      .split("")
      .filter((char) => !vowels.includes(char) && char.match(/[a-z]/))
      .reduce((total, char) => total + (values[char] || 0), 0);

    return reduceToSingleDigit(sum);
  };

  const getCompatibilityNumbers = (lifePathNumber: number): number[] => {
    const compatibility: { [key: number]: number[] } = {
      1: [1, 5, 7],
      2: [2, 4, 8],
      3: [3, 6, 9],
      4: [2, 4, 8],
      5: [1, 5, 7],
      6: [3, 6, 9],
      7: [1, 5, 7],
      8: [2, 4, 8],
      9: [3, 6, 9],
    };
    return compatibility[lifePathNumber] || [1, 5, 9];
  };

  const getLuckyNumbers = (lifePathNumber: number): number[] => {
    return [lifePathNumber, lifePathNumber * 2, lifePathNumber * 3].map((n) =>
      n > 9 ? reduceToSingleDigit(n) : n,
    );
  };

  const getLifePathInterpretation = (number: number) => {
    const interpretations: { [key: number]: any } = {
      1: {
        title: "The Leader",
        traits: ["Independent", "Pioneering", "Ambitious", "Creative"],
        description:
          "You are a natural born leader with strong independence and creativity. You have the ability to initiate and lead projects successfully.",
        career: "Entrepreneur, Manager, Artist, Inventor",
        love: "You need a partner who respects your independence and supports your ambitions.",
        challenges: "Learning to collaborate and avoiding excessive pride",
        strengths: "Innovation, leadership, determination, originality",
        color: "Red",
        element: "Fire",
      },
      2: {
        title: "The Peacemaker",
        traits: ["Cooperative", "Diplomatic", "Sensitive", "Caring"],
        description:
          "You excel in partnerships and cooperation. Your diplomatic nature makes you an excellent mediator and team player.",
        career: "Counselor, Teacher, Diplomat, Healthcare",
        love: "You thrive in harmonious relationships and value emotional connection.",
        challenges: "Avoiding over-sensitivity and building self-confidence",
        strengths: "Cooperation, empathy, patience, intuition",
        color: "Orange",
        element: "Water",
      },
      3: {
        title: "The Creative",
        traits: ["Artistic", "Expressive", "Optimistic", "Social"],
        description:
          "You are naturally creative and expressive with a gift for communication and artistic endeavors.",
        career: "Artist, Writer, Performer, Designer",
        love: "You need a partner who appreciates your creativity and shares your zest for life.",
        challenges: "Focus and discipline in pursuing long-term goals",
        strengths: "Creativity, communication, enthusiasm, inspiration",
        color: "Yellow",
        element: "Air",
      },
      4: {
        title: "The Builder",
        traits: ["Practical", "Organized", "Reliable", "Hardworking"],
        description:
          "You are the foundation builder with strong organizational skills and a practical approach to life.",
        career: "Engineer, Architect, Accountant, Project Manager",
        love: "You value stability and commitment in relationships.",
        challenges: "Flexibility and embracing change",
        strengths: "Organization, reliability, practicality, perseverance",
        color: "Green",
        element: "Earth",
      },
      5: {
        title: "The Explorer",
        traits: ["Adventurous", "Freedom-loving", "Curious", "Versatile"],
        description:
          "You crave freedom and adventure, with a natural curiosity that drives you to explore new experiences.",
        career: "Travel Guide, Journalist, Sales, Consultant",
        love: "You need variety and excitement in your relationships.",
        challenges: "Commitment and following through on projects",
        strengths: "Adaptability, freedom, curiosity, versatility",
        color: "Blue",
        element: "Air",
      },
      6: {
        title: "The Nurturer",
        traits: ["Caring", "Responsible", "Family-oriented", "Healing"],
        description:
          "You are naturally nurturing and take responsibility for the well-being of others.",
        career: "Healthcare, Teaching, Social Work, Counseling",
        love: "You are devoted to family and seek long-term, committed relationships.",
        challenges: "Setting boundaries and avoiding over-giving",
        strengths: "Compassion, responsibility, healing, service",
        color: "Indigo",
        element: "Water",
      },
      7: {
        title: "The Seeker",
        traits: ["Spiritual", "Analytical", "Introspective", "Wise"],
        description:
          "You are on a spiritual quest for knowledge and understanding, with strong analytical abilities.",
        career: "Researcher, Analyst, Spiritual Teacher, Scientist",
        love: "You need a deep, meaningful connection with someone who understands your spiritual nature.",
        challenges: "Trusting others and sharing your inner world",
        strengths: "Wisdom, analysis, spirituality, intuition",
        color: "Violet",
        element: "Spirit",
      },
      8: {
        title: "The Achiever",
        traits: ["Ambitious", "Business-minded", "Material success", "Power"],
        description:
          "You are focused on material success and have strong business acumen and leadership abilities.",
        career: "CEO, Banker, Real Estate, Investment",
        love: "You are attracted to successful partners and value security in relationships.",
        challenges: "Balancing material and spiritual aspects of life",
        strengths: "Ambition, business sense, leadership, organization",
        color: "Pink",
        element: "Earth",
      },
      9: {
        title: "The Humanitarian",
        traits: ["Compassionate", "Generous", "Idealistic", "Wise"],
        description:
          "You are here to serve humanity with your compassionate nature and desire to make the world better.",
        career: "Non-profit, Teaching, Healing, Social Justice",
        love: "You are attracted to partners who share your humanitarian values.",
        challenges: "Letting go and avoiding martyrdom",
        strengths: "Compassion, wisdom, generosity, global thinking",
        color: "Gold",
        element: "Fire",
      },
    };

    return (
      interpretations[number] || {
        title: "Master Number",
        traits: ["Spiritual", "Powerful", "Transformative"],
        description:
          "You carry a master number with special spiritual significance.",
        career: "Spiritual Teacher, Healer, Leader",
        love: "You need a spiritually aware partner who can match your intensity.",
        challenges: "Managing intense energy and high expectations",
        strengths: "Spiritual power, transformation, higher purpose",
        color: "White",
        element: "Spirit",
      }
    );
  };

  const resetCalculation = () => {
    setResult(null);
    setBirthDate("");
    setFullName("");
    setCalculationProgress(0);
  };

  // Prepare reading data for sharing/downloading
  const getReadingData = (): ReadingData => ({
    type: "numerology",
    userInfo: {
      name: fullName,
      date: birthDate,
    },
    results: {
      life_path_number: result.lifePathNumber,
      destiny_number: result.destinyNumber,
      soul_number: result.soulNumber,
      personality_number: result.personalityNumber,
      interpretation: result.interpretation,
      compatibility: result.compatibility,
      lucky_numbers: result.luckyNumbers,
    },
    timestamp: new Date().toISOString(),
  });

  // Handle PDF download
  const handleDownload = async () => {
    if (!result) return;

    setIsDownloading(true);
    try {
      const readingData = getReadingData();
      await downloadReport(readingData);

      toast({
        title: "Report Downloaded",
        description: "Your numerology report has been saved to your device.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle sharing
  const handleShare = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      const readingData = getReadingData();
      await shareReading(readingData);

      toast({
        title: "Shared Successfully",
        description: "Your numerology reading has been shared.",
      });
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description:
          "There was an error sharing your reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Handle sharing with PDF report
  const handleShareWithReport = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      const readingData = getReadingData();
      await shareWithReport(readingData);

      toast({
        title: "Shared with Report",
        description: "Your numerology report has been shared.",
      });
    } catch (error) {
      console.error("Share with report error:", error);
      // Fallback to regular sharing
      try {
        const readingData = getReadingData();
        await shareReading(readingData);
        toast({
          title: "Shared Successfully",
          description:
            "Your numerology reading has been shared (without file attachment).",
        });
      } catch (fallbackError) {
        toast({
          title: "Share Failed",
          description:
            "There was an error sharing your reading. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!result) return;

    try {
      const readingData = getReadingData();
      await copyToClipboard(readingData);

      toast({
        title: "Copied to Clipboard",
        description: "Your reading summary has been copied to clipboard.",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Copy Failed",
        description:
          "There was an error copying your reading. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Authentication removed - no login check needed

  return (
    <div
      ref={pageRef}
      className="min-h-screen page-container relative overflow-hidden"
    >
      {/* Enhanced star background with gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
        {/* Additional gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-purple-900/40 to-blue-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      {/* 3D Background */}
      <ThreeBackground />

      <Navbar />

      {/* Enhanced Main Page Header */}
      <div ref={headerRef} className="text-center mb-10 mt-24 relative z-10 px-4">
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
          style={{
            fontFamily: `'Playfair Display', 'DM Serif Display', 'Cinzel', serif`,
            color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
          }}
        >
          Discover Your{' '}
          <span 
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #fbbf24, #60a5fa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 5s ease infinite',
            }}
          >
            Sacred Numbers
          </span>
        </h1>
        <p
          className="text-sm md:text-base max-w-2xl mx-auto mb-6 leading-relaxed text-gray-300"
        >
          Unlock the ancient wisdom of numbers and discover your life path, destiny, and soul purpose through the mystical science of numerology.
        </p>
        <style>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </div>

      <main className="pb-6 sm:pb-8 pt-6 sm:pt-8 relative z-10">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          {!result ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 max-w-6xl mx-auto">
              {/* Enhanced Calculator Form */}
              <div ref={formRef} className="order-2 lg:order-1">
                <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                        <Calculator className="w-4 h-4 text-purple-300" />
                      </div>
                      Sacred Number Calculator
                    </CardTitle>
                    <p className="text-sm text-gray-300">
                      Enter your details to reveal your numerological blueprint
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="text-sm font-medium text-white mb-2 block"
                      >
                        Full Birth Name
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your complete birth name"
                        className="text-sm bg-white/10 border-purple-400/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-lg"
                        autoComplete="name"
                        autoCapitalize="words"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        Use the name exactly as it appears on your birth certificate
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="birthDate"
                        className="text-sm font-medium text-white mb-2 block"
                      >
                        Birth Date
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="text-sm bg-white/10 border-purple-400/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-lg"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {isCalculating && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-300">
                          <Sparkles className="w-4 h-4 animate-spin flex-shrink-0" />
                          <span className="font-medium text-sm">
                            Calculating your sacred numbers...
                          </span>
                        </div>
                        <Progress value={calculationProgress} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={calculateLifePath}
                      disabled={!birthDate || !fullName || isCalculating}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 hover:from-purple-700 hover:via-blue-700 hover:to-amber-700 text-white text-sm py-3 rounded-xl shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 font-medium"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                        {isCalculating ? "Calculating..." : "Reveal My Numbers"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Information */}
              <div
                ref={visualsRef}
                className="space-y-6 sm:space-y-8 order-1 lg:order-2"
              >
                {/* Number Meanings */}
                <Card className="glass-card border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                        <Eye className="w-4 h-4 text-blue-300" />
                      </div>
                      Number Meanings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div
                          key={num}
                          className="number-card group text-center p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1.5 text-base font-bold shadow-md group-hover:scale-110 transition-transform">
                            {num}
                          </div>
                          <p className="text-xs font-medium text-white">
                            {
                              [
                                "Leader",
                                "Diplomat",
                                "Creator",
                                "Builder",
                                "Explorer",
                                "Nurturer",
                                "Seeker",
                                "Achiever",
                                "Humanitarian",
                              ][num - 1]
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Your Complete Profile */}
                <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                        <Brain className="w-4 h-4 text-purple-300" />
                      </div>
                      Your Complete Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        icon: Target,
                        title: "Life Path Number",
                        desc: "Your main life journey and purpose",
                        color: "from-purple-500/30 to-purple-600/30",
                        borderColor: "border-purple-400/30",
                        iconColor: "text-purple-300",
                      },
                      {
                        icon: Crown,
                        title: "Destiny Number",
                        desc: "Your life mission and ultimate goal",
                        color: "from-blue-500/30 to-blue-600/30",
                        borderColor: "border-blue-400/30",
                        iconColor: "text-blue-300",
                      },
                      {
                        icon: Heart,
                        title: "Soul Number",
                        desc: "Your inner desires and motivations",
                        color: "from-pink-500/30 to-pink-600/30",
                        borderColor: "border-pink-400/30",
                        iconColor: "text-pink-300",
                      },
                      {
                        icon: Users,
                        title: "Personality Number",
                        desc: "How others perceive you",
                        color: "from-green-500/30 to-green-600/30",
                        borderColor: "border-green-400/30",
                        iconColor: "text-green-300",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 border border-white/5 hover:border-purple-400/30 transition-all duration-300"
                      >
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${item.color} border ${item.borderColor} group-hover:scale-110 transition-transform flex-shrink-0`}
                        >
                          <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-white text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Ancient Wisdom */}
                <Card className="glass-card border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/30">
                        <BookOpen className="w-4 h-4 text-amber-300" />
                      </div>
                      Ancient Wisdom
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-amber-500/10 transition-all duration-300">
                      <div className="p-1.5 rounded-md bg-amber-500/20 border border-amber-400/30 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <span className="text-xs text-gray-300">
                        Numerology dates back over 4,000 years
                      </span>
                    </div>
                    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-all duration-300">
                      <div className="p-1.5 rounded-md bg-purple-500/20 border border-purple-400/30 flex-shrink-0">
                        <Infinity className="w-3.5 h-3.5 text-purple-300" />
                      </div>
                      <span className="text-xs text-gray-300">
                        Pythagoras developed modern numerological systems
                      </span>
                    </div>
                    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/10 transition-all duration-300">
                      <div className="p-1.5 rounded-md bg-blue-500/20 border border-blue-400/30 flex-shrink-0">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <span className="text-xs text-gray-300">
                        Numbers reveal personality patterns and life themes
                      </span>
                    </div>
                    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/10 transition-all duration-300">
                      <div className="p-1.5 rounded-md bg-green-500/20 border border-green-400/30 flex-shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-green-300" />
                      </div>
                      <span className="text-xs text-gray-300">
                        Used for guidance in major life decisions
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Results Display */
            <div className="max-w-5xl mx-auto space-y-5">
              {/* Main Results Header */}
              <div className="text-center mb-6 px-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                  Your Numerological Profile
                </h2>
                <p className="text-sm text-gray-300">
                  <span>{result.fullName}</span>
                  <span className="px-2 text-purple-400">•</span>
                  <span>
                    Born{" "}
                    {(() => {
                      if (!birthDate) return "";
                      const [y, m, d] = birthDate.split("-");
                      return `${d}/${m}/${y}`;
                    })()}
                  </span>
                </p>
                <Button
                  onClick={resetCalculation}
                  variant="outline"
                  className="mt-3 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 px-4 py-2 text-sm"
                >
                  Calculate Another Reading
                </Button>
              </div>

              {/* Calculated Numbers */}
              <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-purple-500/20 rounded-2xl mx-4 mb-6 transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg font-bold text-white">
                    Calculated Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        title: "Life Path",
                        number: result.lifePathNumber,
                        color: "from-purple-600 to-blue-600",
                        icon: Target,
                      },
                      {
                        title: "Destiny",
                        number: result.destinyNumber,
                        color: "from-blue-600 to-indigo-600",
                        icon: Crown,
                      },
                      {
                        title: "Soul",
                        number: result.soulNumber,
                        color: "from-pink-600 to-rose-600",
                        icon: Heart,
                      },
                      {
                        title: "Personality",
                        number: result.personalityNumber,
                        color: "from-green-600 to-emerald-600",
                        icon: Users,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="text-center p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
                      >
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-lg`}
                        >
                          {item.number}
                        </div>
                        <h3 className="text-xs font-medium text-white flex items-center justify-center gap-1">
                          <item.icon className="w-3.5 h-3.5" />
                            {item.title}
                        </h3>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Life Path Analysis */}
              <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-purple-500/20 rounded-2xl mx-4 transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg font-bold mb-2 text-white">
                    Life Path {result.lifePathNumber}:{" "}
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
                      {result.interpretation.title}
                    </span>
                  </CardTitle>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {result.interpretation.traits.map(
                      (trait: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-purple-500/10 text-purple-300 border-purple-400/30 text-xs px-2 py-0.5"
                        >
                          {trait}
                        </Badge>
                      ),
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-white flex items-center gap-1.5 mb-1.5 text-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          Core Description
                        </h4>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          {result.interpretation.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-white flex items-center gap-1.5 mb-1.5 text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          Career Path
                        </h4>
                        <p className="text-gray-300 text-xs">
                          {result.interpretation.career}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-white flex items-center gap-1.5 mb-1.5 text-sm">
                          <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                          Love & Relationships
                        </h4>
                        <p className="text-gray-300 text-xs">
                          {result.interpretation.love}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-white flex items-center gap-1.5 mb-1.5 text-sm">
                          <Zap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          Core Strengths
                        </h4>
                        <p className="text-gray-300 text-xs">
                          {result.interpretation.strengths}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-white flex items-center gap-1.5 mb-1.5 text-sm">
                          <Target className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          Life Challenges
                        </h4>
                        <p className="text-gray-300 text-xs">
                          {result.interpretation.challenges}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2.5 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-lg">
                          <div
                            className="w-5 h-5 rounded-full mx-auto mb-1"
                            style={{
                              backgroundColor:
                                result.interpretation.color.toLowerCase(),
                            }}
                          ></div>
                          <p className="text-xs font-medium text-purple-100">
                            Lucky Color
                          </p>
                          <p className="text-[10px] text-purple-200">
                            {result.interpretation.color}
                          </p>
                        </div>
                        <div className="text-center p-2.5 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-lg">
                          <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                          <p className="text-xs font-medium text-purple-100">
                            Element
                          </p>
                          <p className="text-[10px] text-purple-200">
                            {result.interpretation.element}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-400/20">
                    <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-400/20">
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-sm text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          Compatible Numbers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="flex gap-2 justify-center">
                          {result.compatibility.map(
                            (num: number, index: number) => (
                              <div
                                key={index}
                                className="w-7 h-7 bg-blue-400 text-white rounded-full flex items-center justify-center font-bold text-xs"
                              >
                                {num}
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-amber-400/20">
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-sm text-white flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          Lucky Numbers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="flex gap-2 justify-center">
                          {result.luckyNumbers.map(
                            (num: number, index: number) => (
                              <div
                                key={index}
                                className="w-7 h-7 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-xs"
                              >
                                {num}
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Share and Download Actions */}
              <div className="space-y-3 mt-5 mx-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs px-3 py-2"
                    size="sm"
                    >
                      {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      )}
                    {isDownloading ? "..." : "Download"}
                    </Button>

                    <Button
                      onClick={handleShare}
                      disabled={isSharing}
                      variant="outline"
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10 rounded-lg text-xs"
                    size="sm"
                    >
                      {isSharing ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      )}
                    Share
                    </Button>

                    <Button
                      onClick={handleShareWithReport}
                      disabled={isSharing}
                      variant="outline"
                    className="border-blue-400/50 text-blue-300 hover:bg-blue-500/10 rounded-lg text-xs"
                    size="sm"
                    >
                      {isSharing ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      )}
                    Report
                    </Button>

                    <Button
                      onClick={handleCopyToClipboard}
                      variant="outline"
                    className="border-gray-400/50 text-gray-300 hover:bg-gray-500/10 rounded-lg text-xs"
                    size="sm"
                    >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                    </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 relative mt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
            PalmAstro Numerology
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-lg mx-auto">
            Discover the hidden meanings in numbers and unlock your spiritual potential through ancient numerological wisdom.
          </p>
          <div className="flex justify-center items-center gap-3 text-sm">
            <a
              href="#"
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 transition-all duration-300 text-gray-300 hover:text-white text-sm"
            >
              About Numerology
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/50 transition-all duration-300 text-gray-300 hover:text-white text-sm"
            >
              Number Meanings
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); resetCalculation(); }}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 transition-all duration-300 text-gray-300 hover:text-white text-sm"
            >
              Calculate Again
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Numerology;
