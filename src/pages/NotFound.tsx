import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden page-container">
      {/* Fixed star background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-cosmic rounded-full animate-float stellar-glow"></div>
      <div
        className="absolute top-40 right-20 w-6 h-6 bg-golden rounded-full animate-float golden-glow"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-40 left-20 w-3 h-3 bg-stellar rounded-full animate-float stellar-glow"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold cosmic-text mb-4">
            404
          </div>
          <Sparkles className="h-12 w-12 text-cosmic mx-auto animate-glow" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Lost in the <span className="cosmic-text">Cosmic Void</span>
        </h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          The stars have misaligned... This page seems to have drifted into
          another dimension.
        </p>

        <Link to="/">
          <Button className="bg-stellar-gradient hover:opacity-90 stellar-glow px-8 py-4 text-lg">
            <Home className="h-5 w-5 mr-2" />
            Return to Earth
          </Button>
        </Link>

        <div className="mt-8 text-sm text-muted-foreground">
          Need guidance? Try a{" "}
          <Link to="/palm-analysis" className="text-cosmic hover:underline">
            palm reading
          </Link>{" "}
          to find your way.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
