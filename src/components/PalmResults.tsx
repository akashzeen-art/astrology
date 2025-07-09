import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Hand,
  Heart,
  Brain,
  TrendingUp,
  Clock,
  Star,
  Download,
  Share2,
  Eye,
  CheckCircle,
  Calendar,
  Shield,
  FileText,
  Copy,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  downloadReport,
  shareReading,
  shareWithReport,
  copyToClipboard,
  ReadingData,
} from "@/lib/shareAndDownload";

interface PalmResultsProps {
  analysisData?: any;
}

const PalmResults = ({ analysisData }: PalmResultsProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [palmAnalysis] = useState({
    overallScore: 94,
    lines: {
      lifeLine: {
        quality: "Strong",
        score: 92,
        meaning: "Excellent vitality and long life",
        details:
          "Your life line is deep and well-formed, indicating robust health and strong life force. You have natural resilience and recovery abilities.",
      },
      heartLine: {
        quality: "Curved",
        score: 88,
        meaning: "Emotional and expressive in love",
        details:
          "Your heart line curves upward, showing you're a romantic at heart. You express emotions openly and value deep connections.",
      },
      headLine: {
        quality: "Clear",
        score: 96,
        meaning: "Sharp intellect and analytical mind",
        details:
          "A clear, straight head line indicates logical thinking and excellent problem-solving abilities. You approach challenges methodically.",
      },
      fateLine: {
        quality: "Present",
        score: 85,
        meaning: "Strong sense of purpose and direction",
        details:
          "Your fate line suggests you have a clear life direction and will achieve your goals through determination and hard work.",
      },
    },
    personality: {
      traits: [
        {
          name: "Leadership",
          score: 93,
          description: "Natural ability to guide and inspire others",
        },
        {
          name: "Creativity",
          score: 87,
          description: "Strong artistic and innovative tendencies",
        },
        {
          name: "Intuition",
          score: 91,
          description: "Excellent instincts and gut feelings",
        },
        {
          name: "Communication",
          score: 84,
          description: "Good at expressing ideas and connecting with people",
        },
        {
          name: "Determination",
          score: 96,
          description: "Persistent and goal-oriented nature",
        },
      ],
      dominantHand: "Right",
      palmShape: "Square",
      fingerLength: "Balanced",
    },
    predictions: [
      {
        area: "Career",
        timeframe: "Next 6 months",
        prediction:
          "Significant professional advancement on the horizon. Your leadership qualities will be recognized.",
        confidence: 89,
        advice:
          "Take on challenging projects and showcase your problem-solving skills.",
      },
      {
        area: "Relationships",
        timeframe: "Next 3 months",
        prediction:
          "A meaningful connection will enter your life. Existing relationships will deepen.",
        confidence: 82,
        advice:
          "Be open to new social situations and express your emotions honestly.",
      },
      {
        area: "Health",
        timeframe: "Ongoing",
        prediction:
          "Overall excellent health with strong vitality. Minor stress-related concerns possible.",
        confidence: 94,
        advice:
          "Maintain regular exercise and consider meditation for stress management.",
      },
      {
        area: "Finances",
        timeframe: "Next year",
        prediction:
          "Financial growth through career advancement. Investment opportunities will arise.",
        confidence: 78,
        advice:
          "Focus on long-term planning and avoid impulsive financial decisions.",
      },
    ],
    specialMarks: [
      {
        name: "Star on Mount of Apollo",
        meaning: "Creative success and recognition",
        significance: "High",
      },
      {
        name: "Triangle on Mount of Jupiter",
        meaning: "Leadership abilities and wisdom",
        significance: "Medium",
      },
      {
        name: "Cross on Mount of Mercury",
        meaning: "Communication challenges to overcome",
        significance: "Low",
      },
    ],
    compatibility: [
      {
        type: "Earth Hands",
        match: 94,
        description: "Practical and grounded individuals",
      },
      {
        type: "Fire Hands",
        match: 87,
        description: "Energetic and passionate personalities",
      },
      {
        type: "Water Hands",
        match: 76,
        description: "Emotional and intuitive types",
      },
      {
        type: "Air Hands",
        match: 82,
        description: "Intellectual and communicative people",
      },
    ],
  });

  const getLineColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "strong":
      case "clear":
        return "text-cosmic";
      case "curved":
      case "present":
        return "text-stellar";
      default:
        return "text-golden";
    }
  };

  // Prepare reading data for sharing/downloading
  const getReadingData = (): ReadingData => ({
    type: "palm",
    userInfo: {
      name: analysisData?.name || "Palm Reading User",
      date: analysisData?.date || new Date().toLocaleDateString(),
      email: analysisData?.email,
    },
    results: {
      lines: palmAnalysis.lines,
      personality_traits: palmAnalysis.personality.traits.map((t) => t.name),
      life_predictions: {
        career: palmAnalysis.predictions.find((p) => p.area === "Career")
          ?.prediction,
        relationships: palmAnalysis.predictions.find(
          (p) => p.area === "Relationships",
        )?.prediction,
        health: palmAnalysis.predictions.find((p) => p.area === "Health")
          ?.prediction,
        finances: palmAnalysis.predictions.find((p) => p.area === "Finances")
          ?.prediction,
      },
      special_marks: palmAnalysis.specialMarks,
      compatibility: palmAnalysis.compatibility,
    },
    overallScore: palmAnalysis.overallScore,
    timestamp: new Date().toISOString(),
  });

  // Handle PDF download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const readingData = getReadingData();
      await downloadReport(readingData);

      toast({
        title: "Report Downloaded",
        description: "Your palm reading report has been saved to your device.",
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
    setIsSharing(true);
    try {
      const readingData = getReadingData();
      await shareReading(readingData);

      toast({
        title: "Shared Successfully",
        description: "Your palm reading has been shared.",
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
    setIsSharing(true);
    try {
      const readingData = getReadingData();
      await shareWithReport(readingData);

      toast({
        title: "Shared with Report",
        description: "Your palm reading report has been shared.",
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
            "Your palm reading has been shared (without file attachment).",
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
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="glass-card stellar-glow">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Hand className="h-12 w-12 text-cosmic animate-glow" />
            <div>
              <h2 className="text-3xl font-bold cosmic-text">
                {palmAnalysis.overallScore}%
              </h2>
              <p className="text-muted-foreground">
                Overall Palm Reading Score
              </p>
            </div>
          </div>
          <Badge className="bg-stellar-gradient stellar-glow px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Analysis Complete
          </Badge>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="lines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="lines">Palm Lines</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="special">Special Marks</TabsTrigger>
        </TabsList>

        {/* Palm Lines Tab */}
        <TabsContent value="lines" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(palmAnalysis.lines).map(([lineKey, line]) => (
              <Card
                key={lineKey}
                className="glass-card hover:stellar-glow transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">
                      {lineKey.replace("Line", " Line")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`border-cosmic/50 bg-cosmic/10 ${getLineColor(line.quality)}`}
                    >
                      {line.quality}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Quality Score:
                      </span>
                      <span className="font-medium">{line.score}%</span>
                    </div>
                    <Progress value={line.score} className="h-2" />
                  </div>
                  <div>
                    <p className="font-medium text-cosmic mb-2">
                      {line.meaning}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {line.details}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cosmic" />
                  Personality Traits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {palmAnalysis.personality.traits.map((trait, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{trait.name}</span>
                      <span className="text-cosmic font-bold">
                        {trait.score}%
                      </span>
                    </div>
                    <Progress value={trait.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {trait.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5 text-cosmic" />
                  Physical Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Dominant Hand:
                    </span>
                    <span className="font-medium">
                      {palmAnalysis.personality.dominantHand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Palm Shape:</span>
                    <span className="font-medium">
                      {palmAnalysis.personality.palmShape}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Finger Length:
                    </span>
                    <span className="font-medium">
                      {palmAnalysis.personality.fingerLength}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-cosmic/10 rounded-lg">
                  <h4 className="font-medium text-cosmic mb-2">
                    Hand Type Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your square palm with balanced fingers indicates a
                    practical, reliable personality with good organizational
                    skills. You balance logic with intuition effectively.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compatibility */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-cosmic" />
                Compatibility with Other Hand Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {palmAnalysis.compatibility.map((compat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                  >
                    <div>
                      <p className="font-medium">{compat.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {compat.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold cosmic-text">
                        {compat.match}%
                      </p>
                      <Progress
                        value={compat.match}
                        className="h-1 w-16 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {palmAnalysis.predictions.map((prediction, index) => (
              <Card
                key={index}
                className="glass-card hover:stellar-glow transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cosmic/20 rounded-full">
                      {prediction.area === "Career" && (
                        <TrendingUp className="h-6 w-6 text-cosmic" />
                      )}
                      {prediction.area === "Relationships" && (
                        <Heart className="h-6 w-6 text-cosmic" />
                      )}
                      {prediction.area === "Health" && (
                        <Shield className="h-6 w-6 text-cosmic" />
                      )}
                      {prediction.area === "Finances" && (
                        <Star className="h-6 w-6 text-cosmic" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{prediction.area}</h3>
                      <p className="text-sm text-muted-foreground">
                        {prediction.timeframe}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-cosmic mb-1">
                        Prediction:
                      </p>
                      <p className="text-sm">{prediction.prediction}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-stellar mb-1">
                        Advice:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.advice}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Confidence:
                        </span>
                        <span className="font-medium text-cosmic">
                          {prediction.confidence}%
                        </span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Special Marks Tab */}
        <TabsContent value="special" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-cosmic" />
                Special Marks & Symbols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {palmAnalysis.specialMarks.map((mark, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                  >
                    <div>
                      <p className="font-medium">{mark.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mark.meaning}
                      </p>
                    </div>
                    <Badge
                      variant={
                        mark.significance === "High" ? "default" : "outline"
                      }
                      className={
                        mark.significance === "High"
                          ? "bg-cosmic/20 text-cosmic border-cosmic/30"
                          : mark.significance === "Medium"
                            ? "border-stellar/50 text-stellar bg-stellar/10"
                            : "border-golden/50 text-golden bg-golden/10"
                      }
                    >
                      {mark.significance} Impact
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-stellar/10 rounded-lg">
                <h4 className="font-medium text-stellar mb-2">
                  Symbol Interpretation
                </h4>
                <p className="text-sm text-muted-foreground">
                  The special marks on your palm are rare and significant. The
                  star on your Mount of Apollo is particularly auspicious,
                  indicating potential for creative success and public
                  recognition.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="space-y-4">
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

        {/* Save to Dashboard */}
        <div className="flex justify-center">
          <Link to="/dashboard">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8"
            >
              <Eye className="h-4 w-4 mr-2" />
              Save to Dashboard
            </Button>
          </Link>
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
  );
};

export default PalmResults;
