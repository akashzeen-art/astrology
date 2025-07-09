import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Hand, Stars, Sparkles, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set(
        [
          titleRef.current,
          subtitleRef.current,
          badgeRef.current,
          buttonsRef.current,
        ],
        {
          opacity: 0,
          y: 50,
        },
      );

      // Create timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // Animate elements in sequence
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6",
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        );

      // Enhanced floating animation for stars with cursor responsiveness
      gsap.to(starsRef.current?.children || [], {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        rotation: "random(-15, 15)",
        duration: "random(3, 6)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });

      // Cursor interaction for main elements
      const handleMouseMove = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        // Subtle movement for title elements
        gsap.to(titleRef.current, {
          x: xPercent * 10,
          y: yPercent * 5,
          rotation: xPercent * 1,
          duration: 2,
          ease: "power2.out",
        });

        gsap.to(subtitleRef.current, {
          x: xPercent * 8,
          y: yPercent * 4,
          duration: 2.2,
          ease: "power2.out",
        });

        gsap.to(badgeRef.current, {
          x: xPercent * 6,
          y: yPercent * 3,
          rotation: xPercent * 0.5,
          duration: 2.5,
          ease: "power2.out",
        });

        gsap.to(buttonsRef.current, {
          x: xPercent * 5,
          y: yPercent * 2,
          duration: 1.8,
          ease: "power2.out",
        });

        // Enhanced star movement
        gsap.to(starsRef.current?.children || [], {
          x: `+=${xPercent * 15}`,
          y: `+=${yPercent * 10}`,
          rotation: `+=${xPercent * 5}`,
          duration: 3,
          ease: "power2.out",
          stagger: 0.1,
        });
      };

      // Add mouse move listener
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dark Cosmic Background */}
      <div className="absolute inset-0">
        {/* Dark mystical gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-purple-900/30 to-blue-900/40"></div>

        {/* Enhanced floating elements */}
        <div ref={starsRef} className="absolute inset-0 pointer-events-none">
          <Stars className="absolute top-20 left-20 h-6 w-6 text-cosmic opacity-60" />
          <Sparkles className="absolute top-32 right-32 h-4 w-4 text-stellar opacity-40" />
          <Moon className="absolute bottom-40 left-40 h-8 w-8 text-golden opacity-30" />
          <Hand className="absolute top-60 right-20 h-5 w-5 text-mystic opacity-50" />
          <Stars className="absolute bottom-20 right-60 h-7 w-7 text-cosmic opacity-45" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div ref={badgeRef}>
            <Badge
              variant="outline"
              className="mb-6 px-6 py-3 text-lg border-purple-500/50 text-purple-400 bg-purple-500/10 backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              AI-Powered Mystical Insights
            </Badge>
          </div>

          {/* Main title */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
          >
            Discover Your{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Destiny
            </span>
            <br />
            Through{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Ancient Wisdom
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Unlock the secrets of your palm lines and birth chart with our
            advanced AI technology. Get personalized insights into your
            personality, relationships, and future.
          </p>

          {/* CTA Buttons */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/palm-analysis">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-lg px-8 py-4 h-auto group shadow-lg"
              >
                <Hand className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Analyze Your Palm
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/astrology">
              <Button
                variant="outline"
                size="lg"
                className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-4 h-auto group"
              >
                <Stars className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-700" />
                Get Astrology Reading
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                10K+
              </div>
              <div className="text-sm text-gray-300">Readings Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                98%
              </div>
              <div className="text-sm text-gray-300">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">
                5K+
              </div>
              <div className="text-sm text-gray-300">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                24/7
              </div>
              <div className="text-sm text-gray-300">AI Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
