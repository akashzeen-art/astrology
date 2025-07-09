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

        {/* Floating orbs with better positioning */}
        <FloatingOrb
          position={[-6, 2, -3]}
          color="#8b5cf6"
          scale={0.8}
          speed={0.8}
        />
        <FloatingOrb
          position={[6, -1, -5]}
          color="#3b82f6"
          scale={1.2}
          speed={1.2}
        />
        <FloatingOrb
          position={[-3, -3, -2]}
          color="#f59e0b"
          scale={0.6}
          speed={1.5}
        />
        <FloatingOrb
          position={[4, 3, -7]}
          color="#ec4899"
          scale={0.9}
          speed={0.7}
        />
        <FloatingOrb
          position={[0, -4, -10]}
          color="#06b6d4"
          scale={1.1}
          speed={1.0}
        />

        {/* Enhanced star field with cosmic colors */}
        <Stars
          radius={120}
          depth={80}
          count={isMobile ? 1200 : 2500}
          factor={8}
          saturation={0.9}
          fade
          speed={0.2}
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

const Index = () => {
  const indexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mouse movement tracking
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position to -1 to 1 range
      mousePosition.x = (clientX / innerWidth) * 2 - 1;
      mousePosition.y = -(clientY / innerHeight) * 2 + 1;
    };

    // Add mouse move listener
    window.addEventListener("mousemove", handleMouseMove);

    const ctx = gsap.context(() => {
      // Page load animations
      gsap.fromTo(
        ".fade-in-section",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: indexRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Enhanced floating elements animation with cursor influence
      gsap.to(".floating-element", {
        y: "random(-15, 15)",
        x: "random(-8, 8)",
        rotation: "random(-10, 10)",
        duration: "random(3, 6)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });

      // Cursor-following animation for floating elements
      const handleMouseMoveGSAP = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 100;
        const yPercent = (clientY / innerHeight - 0.5) * 100;

        gsap.to(".floating-element", {
          x: `+=${xPercent * 0.02}`,
          y: `+=${yPercent * 0.02}`,
          duration: 2,
          ease: "power2.out",
          stagger: 0.02,
        });
      };

      window.addEventListener("mousemove", handleMouseMoveGSAP);

      return () => {
        window.removeEventListener("mousemove", handleMouseMoveGSAP);
      };
    }, indexRef);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={indexRef} className="min-h-screen relative">
      {/* Clean 3D Background */}
      <CosmicScene />

      {/* Subtle astrology accent overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0 opacity-40"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Dark cosmic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-purple-900/20 to-blue-900/30 pointer-events-none"></div>

        <div className="relative">
          <Navbar />

          <main className="fade-in-section">
            <Hero />
            <div className="fade-in-section">
              <Features />
            </div>
          </main>

          <StatusCheck />

          {/* Enhanced Footer */}
          <footer className="fade-in-section border-t border-purple-200/50 py-12 bg-white/60 backdrop-blur-md relative overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="floating-element absolute top-6 left-8 w-2 h-2 bg-purple-400/60 rounded-full"></div>
              <div className="floating-element absolute top-12 right-12 w-3 h-3 bg-blue-400/50 rounded-full"></div>
              <div className="floating-element absolute bottom-8 left-16 w-1.5 h-1.5 bg-amber-400/70 rounded-full"></div>
              <div className="floating-element absolute bottom-6 right-10 w-2.5 h-2.5 bg-pink-400/55 rounded-full"></div>
              <div className="floating-element absolute top-1/2 left-1/4 w-1 h-1 bg-indigo-400/40 rounded-full"></div>
              <div className="floating-element absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400/45 rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 bg-clip-text text-transparent mb-4">
                  PalmAstro
                </h3>
                <p className="text-gray-700 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Unlock your destiny through the ancient wisdom of palmistry,
                  numerology, and astrology, powered by modern AI technology.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600">
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors touch-manipulation py-2 px-4 sm:p-0"
                  >
                    Contact Us
                  </a>
                </div>
                <div className="mt-6 text-xs text-gray-500">
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
