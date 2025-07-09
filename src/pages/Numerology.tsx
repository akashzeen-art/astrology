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
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([headerRef.current, formRef.current, visualsRef.current], {
        opacity: 0,
        y: 50,
      });

      // Create timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // Animate elements
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      })
        .to(
          formRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6",
        )
        .to(
          visualsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        );

      // Cards animation
      const cards = pageRef.current?.querySelectorAll(".number-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.8, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: cards[0],
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
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

    setTimeout(() => {
      setResult({
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
      });
      setIsCalculating(false);
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

  return (
    <div
      ref={pageRef}
      className="min-h-screen page-container relative overflow-hidden"
    >
      {/* Fixed star background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
      </div>

      {/* 3D Background */}
      <ThreeBackground />

      <Navbar />

      {/* Header */}
      <section
        ref={headerRef}
        className="pt-16 sm:pt-20 pb-8 sm:pb-12 relative z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 sm:mb-6 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg bg-purple-100 text-purple-700 border-purple-300">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">✨ </span>Numerology Reading
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 bg-clip-text text-transparent block sm:inline">
              Sacred Numbers
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
            Unlock the ancient wisdom of numbers and discover your life path,
            destiny, and soul purpose through the mystical science of
            numerology.
          </p>
        </div>
      </section>

      <main className="pb-8 sm:pb-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {!result ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
              {/* Calculator Form */}
              <div ref={formRef} className="order-2 lg:order-1">
                <Card className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-2xl">
                  <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                      <span className="text-center">
                        Sacred Number Calculator
                      </span>
                    </CardTitle>
                    <p className="text-sm sm:text-base text-gray-600 mt-2 px-2">
                      Enter your details to reveal your numerological blueprint
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 block"
                      >
                        Full Birth Name
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your complete birth name"
                        className="text-base sm:text-lg p-3 sm:p-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                        autoComplete="name"
                        autoCapitalize="words"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                        Use the name exactly as it appears on your birth
                        certificate
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="birthDate"
                        className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 block"
                      >
                        Birth Date
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="text-base sm:text-lg p-3 sm:p-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {isCalculating && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3 text-purple-700">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            Calculating your sacred numbers...
                          </span>
                        </div>
                        <Progress
                          value={calculationProgress}
                          className="h-2 sm:h-3"
                        />
                      </div>
                    )}

                    <Button
                      onClick={calculateLifePath}
                      disabled={!birthDate || !fullName || isCalculating}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 hover:from-purple-700 hover:via-blue-700 hover:to-amber-700 text-white text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 min-h-[48px] touch-manipulation"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="truncate">
                        {isCalculating ? "Calculating..." : "Reveal My Numbers"}
                      </span>
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
                <Card className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-xl">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      Number Meanings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div
                          key={num}
                          className="number-card text-center p-2 sm:p-3 lg:p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-sm sm:text-base lg:text-xl font-bold">
                            {num}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
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

                {/* What We Calculate */}
                <Card className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-xl">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      Your Complete Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {[
                      {
                        icon: Target,
                        title: "Life Path Number",
                        desc: "Your main life journey and purpose",
                        color: "text-purple-600",
                      },
                      {
                        icon: Crown,
                        title: "Destiny Number",
                        desc: "Your life mission and ultimate goal",
                        color: "text-blue-600",
                      },
                      {
                        icon: Heart,
                        title: "Soul Number",
                        desc: "Your inner desires and motivations",
                        color: "text-pink-600",
                      },
                      {
                        icon: Users,
                        title: "Personality Number",
                        desc: "How others perceive you",
                        color: "text-green-600",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        <div
                          className={`p-1.5 sm:p-2 rounded-full bg-gray-100 ${item.color} flex-shrink-0`}
                        >
                          <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {item.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Numerology Facts */}
                <Card className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-xl">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                      Ancient Wisdom
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm px-4 sm:px-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Numerology dates back over 4,000 years
                      </span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Infinity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Pythagoras developed modern numerological systems
                      </span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Numbers reveal personality patterns and life themes
                      </span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Used for guidance in major life decisions
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Results Display */
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
              {/* Main Results Header */}
              <div className="text-center mb-8 sm:mb-12 px-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Your Numerological Profile
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 break-words">
                  <span className="block sm:inline">{result.fullName}</span>
                  <span className="hidden sm:inline"> ��� </span>
                  <span className="block sm:inline">
                    Born {new Date(birthDate).toLocaleDateString()}
                  </span>
                </p>
                <Button
                  onClick={resetCalculation}
                  variant="outline"
                  className="mt-3 sm:mt-4 border-purple-300 text-purple-700 hover:bg-purple-50 px-4 sm:px-6 py-2 text-sm sm:text-base touch-manipulation"
                >
                  Calculate Another Reading
                </Button>
              </div>

              {/* Core Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 px-4">
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
                  <Card
                    key={index}
                    className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-xl text-center p-3 sm:p-4 lg:p-6 transform hover:scale-105 active:scale-95 transition-all duration-300 touch-manipulation"
                  >
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 text-lg sm:text-2xl lg:text-3xl font-bold shadow-lg`}
                    >
                      {item.number}
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                      <item.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      <span className="text-center leading-tight">
                        {item.title}
                      </span>
                    </h3>
                  </Card>
                ))}
              </div>

              {/* Detailed Life Path Analysis */}
              <Card className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-2xl mx-4">
                <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                    <span className="block sm:inline">
                      Life Path {result.lifePathNumber}:
                    </span>{" "}
                    <span className="block sm:inline">
                      {result.interpretation.title}
                    </span>
                  </CardTitle>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {result.interpretation.traits.map(
                      (trait: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-300 text-xs sm:text-sm px-2 py-1"
                        >
                          {trait}
                        </Badge>
                      ),
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                          Core Description
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          {result.interpretation.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                          Career Path
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {result.interpretation.career}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                          Love & Relationships
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {result.interpretation.love}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                          Core Strengths
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {result.interpretation.strengths}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                          Life Challenges
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {result.interpretation.challenges}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                          <div
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-1 sm:mb-2"
                            style={{
                              backgroundColor:
                                result.interpretation.color.toLowerCase(),
                            }}
                          ></div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            Lucky Color
                          </p>
                          <p className="text-xs text-gray-600">
                            {result.interpretation.color}
                          </p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-amber-600" />
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            Element
                          </p>
                          <p className="text-xs text-gray-600">
                            {result.interpretation.element}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Compatible Numbers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                          {result.compatibility.map(
                            (num: number, index: number) => (
                              <div
                                key={index}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
                              >
                                {num}
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                          Lucky Numbers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                          {result.luckyNumbers.map(
                            (num: number, index: number) => (
                              <div
                                key={index}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
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
              <div className="space-y-4 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Download PDF Report */}
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? "Generating..." : "Download PDF"}
                  </Button>

                  {/* Share Reading */}
                  <Button
                    onClick={handleShare}
                    disabled={isSharing}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    {isSharing ? "Sharing..." : "Share"}
                  </Button>

                  {/* Share with Report */}
                  <Button
                    onClick={handleShareWithReport}
                    disabled={isSharing}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    {isSharing ? "Sharing..." : "Share Report"}
                  </Button>

                  {/* Copy to Clipboard */}
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    <strong>Download PDF:</strong> Get a detailed report •{" "}
                    <strong>Share:</strong> Share on social media •{" "}
                    <strong>Share Report:</strong> Include PDF file •{" "}
                    <strong>Copy:</strong> Copy text summary
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 sm:py-12 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            PalmAstro Numerology
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
            Discover the hidden meanings in numbers and unlock your spiritual
            potential through ancient numerological wisdom.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <a
              href="#"
              className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
            >
              About Numerology
            </a>
            <a
              href="#"
              className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
            >
              Number Meanings
            </a>
            <a
              href="#"
              className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
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
