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
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import gsap from "gsap";

const PalmUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setError(null);

    try {
      await startPalmAnalysis(selectedFile);
    } catch (error) {
      console.error("Palm analysis failed:", error);
      setError("Analysis failed. Please try again.");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div ref={uploadRef} className="space-y-6">
      {/* Instructions */}
      <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Hand className="h-5 w-5 text-purple-600" />
            How to Take Your Palm Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium mb-1 text-gray-900">Good Lighting</p>
              <p className="text-gray-600">
                Use natural light or a bright lamp
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Hand className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium mb-1 text-gray-900">Open Palm</p>
              <p className="text-gray-600">
                Keep your palm flat and fingers spread
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
              <p className="font-medium mb-1 text-gray-900">Clear Focus</p>
              <p className="text-gray-600">
                Ensure palm lines are clearly visible
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Upload Interface */}
      {!previewUrl && (
        <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div
              className={cn(
                "upload-area border-2 border-dashed border-purple-300 rounded-lg p-8 text-center transition-all duration-300",
                "hover:border-purple-400 hover:bg-purple-50 cursor-pointer active:scale-95",
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4 items-center justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-gray-400">or</div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Take Photo or Upload Image
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Click to use your camera or select an existing photo from
                    your device
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge
                      variant="outline"
                      className="border-purple-300 text-purple-700 bg-purple-50"
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Direct Camera
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-700 bg-blue-50"
                    >
                      <FileImage className="h-3 w-3 mr-1" />
                      Gallery Upload
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Analysis Section */}
      {previewUrl && (
        <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div ref={previewRef} className="space-y-4">
              {/* Image preview */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Palm preview"
                  className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-lg"
                />
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Change Image
                </Button>
              </div>

              {/* Analysis progress */}
              {isAnalyzing && (
                <div ref={progressRef} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>AI analyzing your palm...</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              )}

              {/* Analysis complete */}
              {currentReading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Analysis Complete!</span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("showPalmResults");
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    View Your Reading
                  </Button>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-transform"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze My Palm
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Security notice */}
      <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1 text-gray-900">
                Privacy & Security
              </p>
              <p className="text-gray-600">
                Your images are processed securely and automatically deleted
                after analysis. We never store or share your personal photos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PalmUpload;
