import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReadingsProvider } from "@/contexts/ReadingsContext";
import ErrorBoundary from "@/components/ErrorBoundary";
// ProtectedRoute removed - authentication disabled
import Index from "./pages/Index";
import PalmAnalysis from "./pages/PalmAnalysis";
import Numerology from "./pages/Numerology";
import AstrologyReading from "./pages/AstrologyReading";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import VideoBackgroundDemo from "./pages/VideoBackgroundDemo";
import KidsBoxPortal from "./pages/KidsBoxPortal";
import VideoTest from "./pages/VideoTest";
import LoadingOverlay from "./components/LoadingOverlay";
import VideoBackground from "@/components/VideoBackground";

// ScrollToTop component
import { useEffect } from "react";
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <>
    <VideoBackground src="/images/he2.mp4" overlay={true} />
    <LoadingOverlay />
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ReadingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/palm-analysis" element={<PalmAnalysis />} />
                  <Route path="/numerology" element={<Numerology />} />
                  <Route path="/astrology" element={<AstrologyReading />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/video-demo" element={<VideoBackgroundDemo />} />
                  <Route path="/kids-portal" element={<KidsBoxPortal />} />
                  <Route path="/video-test" element={<VideoTest />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ReadingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </>
);

export default App;