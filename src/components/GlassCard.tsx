import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg";
  opacity?: "low" | "medium" | "high";
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  blur = "md",
  opacity = "medium",
}) => {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  const opacityClasses = {
    low: "bg-black/30",
    medium: "bg-black/50",
    high: "bg-black/70",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/20",
        blurClasses[blur],
        opacityClasses[opacity],
        "shadow-2xl shadow-purple-500/20",
        "transition-all duration-300 hover:shadow-purple-500/30",
        className
      )}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '8px' : '12px'})`,
        WebkitBackdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '8px' : '12px'})`,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;