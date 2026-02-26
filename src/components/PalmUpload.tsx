import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReadings } from "@/contexts/ReadingsContext";
import {
  Upload,
  Camera,
  FileImage,
  CheckCircle,
  AlertCircle,
  Hand,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import gsap from "gsap";

const PalmUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { startPalmAnalysis, isAnalyzing, progress, currentReading } =
    useReadings();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(uploadRef.current, {
        opacity: 0,
        scale: 0.9,
      });

      gsap.to(uploadRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      const uploadArea = uploadRef.current?.querySelector(".upload-area");
      if (uploadArea) {
        uploadArea.addEventListener("mouseenter", () => {
          gsap.to(uploadArea, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        uploadArea.addEventListener("mouseleave", () => {
          gsap.to(uploadArea, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }
    }, uploadRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (previewUrl && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        {
          opacity: 0,
          scale: 0.8,
          rotationY: 180,
        },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
      );
    }
  }, [previewUrl]);

  useEffect(() => {
    if (isAnalyzing && progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
        },
      );
    }
  }, [isAnalyzing]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // No complex camera functions needed - using simple file input with capture

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  // Start camera stream
  const startCamera = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setError(null);
    
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to file input with capture
        cameraInputRef.current?.click();
        return;
      }
      
      // Try to use MediaDevices API (works on both mobile and desktop)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: isMobile ? 'environment' : 'user', // Prefer rear camera on mobile
          width: { ideal: isMobile ? 1280 : 1920 },
          height: { ideal: isMobile ? 720 : 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err);
            setError('Unable to start camera preview. Please try again.');
            stopCamera();
          });
        }
      }, 100);
      
    } catch (err: any) {
      console.error('Camera access error:', err);
      // Fallback to file input if camera access fails
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access in your browser settings or use Gallery Upload.');
        // Still offer file input as fallback
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 500);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please use Gallery Upload instead.');
        cameraInputRef.current?.click();
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use. Please close other apps using the camera and try again.');
        cameraInputRef.current?.click();
      } else {
        // Generic error - fallback to file input
        setError('Unable to access camera. Using file picker instead.');
        cameraInputRef.current?.click();
      }
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'palm-photo.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const triggerGallery = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    galleryInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setError(null);

    try {
      await startPalmAnalysis(selectedFile);
    } catch (error: any) {
      console.error("Palm analysis failed:", error);
      // Show user-friendly error message
      let errorMessage = error?.message || "Analysis failed. Please try again.";
      
      // Provide more specific error messages
      if (errorMessage.includes("Network error") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to the server. Please ensure the backend is running and try again.";
      } else if (errorMessage.includes("Not authenticated")) {
        errorMessage = "Please log in to use this feature.";
      } else if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
        errorMessage = "Invalid image. Please upload a clear image of your palm.";
      }
      
      setError(errorMessage);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    stopCamera();
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  return (
    <div ref={uploadRef} className="space-y-4 sm:space-y-6">
      {/* Instructions */}
      <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-white text-sm sm:text-base">
            <Hand className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
            How to Take Your Palm Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="text-center p-2 sm:p-3 rounded-lg hover:bg-purple-500/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              </div>
              <p className="font-medium text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Good Lighting</p>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-tight">Use natural light or a bright lamp</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg hover:bg-blue-500/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Hand className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              </div>
              <p className="font-medium text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Open Palm</p>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-tight">Keep your palm flat and fingers spread</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg hover:bg-amber-500/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              </div>
              <p className="font-medium text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Clear Focus</p>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-tight">Ensure palm lines are clearly visible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Camera View */}
      {showCamera && (
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Camera Preview Container */}
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-black aspect-video w-full max-w-full mx-auto min-h-[200px] sm:min-h-[300px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Overlay guide lines for palm positioning */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-purple-400/30 rounded-lg border-dashed"></div>
                </div>
                {/* Loading overlay */}
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs sm:text-sm text-white">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Error message in camera view */}
              {error && showCamera && (
                <div className="p-3 sm:p-3.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-400 leading-relaxed break-words">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center">
                <Button
                  onClick={capturePhoto}
                  disabled={!stream}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 h-auto touch-manipulation font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  size="lg"
                >
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  Capture Photo
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-red-400/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 h-auto touch-manipulation font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  Cancel
                </Button>
              </div>
              
              {/* Instructions */}
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm text-gray-300 text-center px-2 font-medium">
                  Position your palm clearly in the frame
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 text-center px-2">
                  Ensure good lighting and keep your palm flat with fingers spread
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Interface */}
      {!previewUrl && !showCamera && (
        <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div
              className={cn(
                "upload-area border-2 border-dashed border-purple-400/30 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300",
                "hover:border-purple-400 hover:bg-purple-500/10",
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex gap-3 sm:gap-4 items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm">or</span>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-white">
                    Take Photo or Upload Image
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5">
                    Click to use your camera or select an existing photo from your device
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center w-full sm:w-auto">
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="w-full sm:w-auto border-purple-400/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400 transition-all text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 h-auto touch-manipulation font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                    >
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                      Direct Camera
                    </Button>
                    <Button
                      onClick={triggerGallery}
                      variant="outline"
                      className="w-full sm:w-auto border-blue-400/50 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400 transition-all text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 h-auto touch-manipulation font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                    >
                      <FileImage className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                      Gallery Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Analysis Section */}
      {previewUrl && (
        <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div ref={previewRef} className="space-y-3 sm:space-y-4">
              {/* Image preview */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Palm preview"
                  className="w-full max-w-sm mx-auto rounded-lg sm:rounded-xl border border-purple-400/30"
                />
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  size="sm"
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 border-purple-400/30 text-purple-300 bg-slate-900/80 backdrop-blur-sm text-[10px] sm:text-xs px-2 sm:px-3 py-1 touch-manipulation"
                >
                  Change Image
                </Button>
              </div>

              {/* Analysis progress */}
              {isAnalyzing && (
                <div ref={progressRef} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-400">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                    <span>AI analyzing your palm...</span>
                  </div>
                  <Progress value={progress} className="w-full h-1.5 sm:h-2" />
                </div>
              )}

              {/* Analysis complete */}
              {currentReading && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-medium">Analysis Complete!</span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm touch-manipulation py-2.5 sm:py-3"
                    size="sm"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("showPalmResults");
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    View Your Reading
                  </Button>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-purple-400/30 text-purple-300 text-sm touch-manipulation py-2.5 sm:py-3"
                    size="sm"
                    onClick={resetUpload}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Analyze button */}
              {!isAnalyzing && !currentReading && !error && (
                <Button
                  onClick={analyzeImage}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm hover:scale-[1.02] transition-transform touch-manipulation py-2.5 sm:py-3"
                  size="sm"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Analyze My Palm
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file inputs */}
      {/* Camera input - opens device camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      {/* Gallery input - opens file picker/gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Security notice */}
      <Card className="bg-slate-900/50 border-emerald-500/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Privacy & Security</p>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
                Your images are processed securely and automatically deleted after analysis. We never store or share your personal photos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PalmUpload;
