import React, { useEffect, useRef, useState } from "react";

const FADE_DURATION = 5000; // ms (slower fade)
const SHOW_DURATION = 2000; // ms

const LoadingOverlay: React.FC = () => {
  const [fade, setFade] = useState(false);
  const [hide, setHide] = useState(false);
  const [muted, setMuted] = useState(true); // Default: muted for autoplay
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setFade(true), SHOW_DURATION);
    let hideTimer: NodeJS.Timeout;
    if (fade) {
      hideTimer = setTimeout(() => setHide(true), FADE_DURATION);
    }
    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [fade]);

  // Ensure video mute state updates
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      if (!videoRef.current.paused) return;
      // Try to play if not already playing
      videoRef.current.play().catch(() => {});
    }
  }, [muted]);

  if (hide) return null;

  return (
    <div
      style={{
        pointerEvents: fade ? "none" : "all",
        transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
        opacity: fade ? 0 : 1,
        zIndex: 9999,
        position: "fixed",
        inset: 0,
        background: "#0e0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/images/ho1.mp4"
        autoPlay
        muted={muted}
        loop
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          // transform: "translate(-50%, -50%) rotate(90deg)",
          transform: "translate(-50%, -50%)",
          borderRadius: 0,
          boxShadow: "none",
          transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`
        }}
      />
      {/* Mute/Unmute Button */}
      <button
        onClick={() => setMuted((m) => !m)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 10000,
          background: "rgba(30,30,40,0.7)",
          border: "none",
          borderRadius: "50%",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px #0005",
        }}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          // Volume Off SVG
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          // Volume On SVG
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19 12c0-1.77-.77-3.29-2-4.29"></path><path d="M19 12c0 1.77-.77 3.29-2 4.29"></path></svg>
        )}
      </button>
    </div>
  );
};

export default LoadingOverlay; 