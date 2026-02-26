import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
  Stars,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import StatusCheck from "@/components/StatusCheck";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Mouse position state for cursor interactions
const mousePosition = { x: 0, y: 0 };

// Interactive floating orbs that respond to cursor movement
const FloatingOrb = ({
  position,
  color,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Base rotation and floating animation
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * speed) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;

      // Floating animation
      const floatY = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.5;

      // Cursor influence - subtle movement following mouse
      const mouseInfluenceX = (mousePosition.x * 0.5 * (position[2] + 5)) / 10;
      const mouseInfluenceY = (mousePosition.y * 0.3 * (position[2] + 5)) / 10;

      meshRef.current.position.set(
        position[0] + mouseInfluenceX,
        position[1] + floatY + mouseInfluenceY,
        position[2],
      );

      // Subtle rotation based on mouse movement
      meshRef.current.rotation.z = mousePosition.x * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        position={position}
        scale={scale}
        args={[1, 32, 32]}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  );
};

// Camera component that follows mouse movement
const CameraController = () => {
  useFrame((state) => {
    // Smooth camera movement based on mouse position
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mousePosition.x * 2,
      0.02,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      mousePosition.y * 1,
      0.02,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

// Enhanced 3D Scene with cursor responsiveness
const CosmicScene = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: isMobile ? 60 : 75 }}
        dpr={isMobile ? 1 : 1.5}
        style={{ background: "transparent" }}
      >
        {/* Camera controller for mouse responsiveness */}
        {!isMobile && <CameraController />}
        {/* Enhanced lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#8b5cf6"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#f59e0b" />
        <pointLight position={[10, -10, 5]} intensity={0.6} color="#3b82f6" />

        {/* Remove all FloatingOrb components */}
        {/* Only keep the starfield and lighting for the 3D background */}

        {/* Optimized star field - reduced count for better performance */}
        <Stars
          radius={100}
          depth={60}
          count={isMobile ? 800 : 1500} // Reduced from 1200/2500
          factor={6} // Reduced from 8
          saturation={0.8} // Reduced from 0.9
          fade
          speed={0.15} // Reduced from 0.2
        />

        {/* Additional distant star layer */}
        <Stars
          radius={200}
          depth={150}
          count={isMobile ? 600 : 1000}
          factor={12}
          saturation={0.5}
          fade
          speed={0.1}
        />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
};

// Animated Floating Images for Footer
const AnimatedFooterImages = () => {
  const [img1, setImg1] = useState({ x: 0, y: 0, scale: 1, rotate: 0, z: 1 });
  const [img2, setImg2] = useState({ x: 0, y: 0, scale: 1, rotate: 0, z: 2 });
  const requestRef = useRef<number>();
  const startTime = useRef<number>(0);
  useEffect(() => {
    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time;
      const t = (time - startTime.current) / 1000;
      setImg1({
        x: Math.sin(t * 0.5) * 120 + 80,
        y: Math.cos(t * 0.7) * 60 + 120,
        scale: 1 + 0.2 * Math.sin(t * 0.8),
        rotate: (t * 40) % 360,
        z: 1 + Math.round((Math.sin(t * 0.6) + 1) * 1),
      });
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
          left: `${img1.x}px`,
          top: `${img1.y}px`,
          width: `${120 * img1.scale}px`,
          height: `${120 * img1.scale}px`,
          borderRadius: "50%",
          backgroundColor: "transparent",
          zIndex: 2,
          transform: `rotate(${img1.rotate}deg)`,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
        draggable={false}
      />
      <img
        src="/images/animate2.png"
        alt="Animated 2"
        style={{
          position: "absolute",
          left: `${img2.x}px`,
          top: `${img2.y}px`,
          width: `${100 * img2.scale}px`,
          height: `${100 * img2.scale}px`,
          borderRadius: "50%",
          zIndex: 2,
          transform: `rotate(${img2.rotate}deg)`,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </>
  );
};

const Index = () => {
  const indexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Import throttle utility
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function (this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    // Mouse movement tracking - THROTTLED for performance
    const handleMouseMove = throttle((event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position to -1 to 1 range
      mousePosition.x = (clientX / innerWidth) * 2 - 1;
      mousePosition.y = -(clientY / innerHeight) * 2 + 1;
    }, 100); // Throttle to 100ms (10fps for mouse tracking)

    // Add mouse move listener
    window.addEventListener("mousemove", handleMouseMove);

    const ctx = gsap.context(() => {
      // Page load animations - REDUCED DURATION
      gsap.fromTo(
        ".fade-in-section",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6, // Reduced from 1s
          stagger: 0.15, // Reduced from 0.3s
          ease: "power2.out", // Simpler easing
          scrollTrigger: {
            trigger: indexRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // SIMPLIFIED floating elements animation - REMOVED cursor influence for performance
      gsap.to(".floating-element", {
        y: "random(-10, 10)", // Reduced range
        x: "random(-5, 5)", // Reduced range
        rotation: "random(-5, 5)", // Reduced rotation
        duration: "random(4, 8)", // Longer duration = less frequent updates
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3, // Increased stagger to reduce simultaneous animations
      });
    }, indexRef);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={indexRef} className="min-h-screen relative overflow-x-hidden">
      {/* Clean 3D Background */}
      <CosmicScene />

      {/* Enhanced gradient overlay with multiple layers */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-purple-900/40 to-blue-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      {/* Main content */}
      <div className="relative z-20 min-h-screen">
        <div className="relative">
          <Navbar />
          <main className="fade-in-section">
            <Hero />
            <div className="fade-in-section">
              <Features />
            </div>
          </main>
          <StatusCheck />
          {/* Footer */}
          <footer className="fade-in-section py-8 sm:py-12 relative border-t border-white/10">
            <div className="container mx-auto px-3 sm:px-4 relative z-10">
              <div className="text-center max-w-2xl mx-auto">
                {/* Logo */}
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  PalmAstro
                </h3>
                
                {/* Description */}
                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400 leading-relaxed px-2">
                  Unlock your destiny through ancient wisdom of palmistry, numerology, and astrology, powered by AI.
                </p>
                
                {/* Links */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-2">
                  <a 
                    href="#" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 touch-manipulation"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-gray-600 text-xs">•</span>
                  <a 
                    href="#" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 touch-manipulation"
                  >
                    Terms of Service
                  </a>
                  <span className="text-gray-600 text-xs">•</span>
                  <a 
                    href="#" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 touch-manipulation"
                  >
                    Contact Us
                  </a>
                </div>
                
                {/* Copyright */}
                <div className="text-[10px] sm:text-xs text-gray-500">
                  © 2024 PalmAstro. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
