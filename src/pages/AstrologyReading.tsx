import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Heart,
  TrendingUp,
  Brain,
  Shield,
  Eye,
  CheckCircle,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";

const AstrologyReading = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const [birthData, setBirthData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "",
    timezone: "",
    latitude: "",
    longitude: "",
  });

  const [astrologyResults] = useState({
    sunSign: "Leo",
    moonSign: "Scorpio",
    risingSign: "Gemini",
    planetaryPositions: [
      {
        planet: "Sun",
        sign: "Leo",
        house: "3rd",
        aspect: "Confident and creative",
      },
      {
        planet: "Moon",
        sign: "Scorpio",
        house: "6th",
        aspect: "Intuitive and intense",
      },
      {
        planet: "Mercury",
        sign: "Virgo",
        house: "4th",
        aspect: "Analytical communicator",
      },
      {
        planet: "Venus",
        sign: "Cancer",
        house: "2nd",
        aspect: "Nurturing in love",
      },
      {
        planet: "Mars",
        sign: "Aries",
        house: "11th",
        aspect: "Action-oriented leader",
      },
    ],
    personalityTraits: [
      {
        trait: "Leadership",
        score: 92,
        description: "Natural born leader with charismatic presence",
      },
      {
        trait: "Creativity",
        score: 88,
        description: "Highly creative with artistic talents",
      },
      {
        trait: "Intuition",
        score: 85,
        description: "Strong intuitive abilities and psychic sensitivity",
      },
      {
        trait: "Communication",
        score: 79,
        description: "Excellent communication and social skills",
      },
      {
        trait: "Determination",
        score: 91,
        description: "Persistent and goal-oriented",
      },
    ],
    lifePredictions: [
      {
        area: "Career",
        timeframe: "Next 6 months",
        prediction:
          "Significant career advancement opportunity will present itself. Focus on leadership roles.",
        confidence: 89,
      },
      {
        area: "Love",
        timeframe: "Next 3 months",
        prediction:
          "New romantic relationship possible. Pay attention to water signs (Cancer, Scorpio, Pisces).",
        confidence: 76,
      },
      {
        area: "Health",
        timeframe: "Ongoing",
        prediction:
          "Focus on stress management and meditation. Your intense energy needs proper channeling.",
        confidence: 84,
      },
      {
        area: "Finance",
        timeframe: "Next year",
        prediction:
          "Financial growth through creative ventures. Investment opportunities in technology sector.",
        confidence: 82,
      },
    ],
    compatibility: [
      { sign: "Sagittarius", match: 94, type: "Soulmate" },
      { sign: "Aries", match: 88, type: "Perfect Match" },
      { sign: "Gemini", match: 82, type: "Great Match" },
      { sign: "Libra", match: 79, type: "Good Match" },
      { sign: "Aquarius", match: 76, type: "Good Match" },
    ],
  });

  const handleInputChange = (field: string, value: string) => {
    setBirthData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      generateReading();
    }
  };

  const generateReading = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 8;
      });
    }, 200);
  };

  const steps = [
    { number: 1, title: "Personal Info", description: "Basic details" },
    { number: 2, title: "Birth Details", description: "Date, time & place" },
    { number: 3, title: "Preferences", description: "Reading focus" },
  ];

  if (analysisComplete) {
    return (
      <div className="min-h-screen page-container">
        {/* Fixed star background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="stars-bg absolute inset-0"></div>
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* Header */}
          <section className="pt-24 pb-8 relative overflow-hidden">
            <div className="absolute inset-0 stars-bg opacity-20"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center">
                <Badge
                  variant="outline"
                  className="mb-4 px-4 py-2 border-cosmic/50 text-cosmic bg-cosmic/10"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reading Complete
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Your <span className="cosmic-text">Cosmic Blueprint</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Here's your personalized astrological analysis based on your
                  birth chart
                </p>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className="pb-20">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 glass-card">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="personality">Personality</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card stellar-glow">
                      <CardContent className="p-6 text-center">
                        <Sun className="h-12 w-12 text-golden mx-auto mb-4 animate-glow" />
                        <h3 className="text-xl font-bold mb-2">Sun Sign</h3>
                        <p className="text-2xl cosmic-text font-bold">
                          {astrologyResults.sunSign}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your core identity and ego
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card stellar-glow">
                      <CardContent className="p-6 text-center">
                        <Moon className="h-12 w-12 text-stellar mx-auto mb-4 animate-glow" />
                        <h3 className="text-xl font-bold mb-2">Moon Sign</h3>
                        <p className="text-2xl cosmic-text font-bold">
                          {astrologyResults.moonSign}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your emotional nature and instincts
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card stellar-glow">
                      <CardContent className="p-6 text-center">
                        <Globe className="h-12 w-12 text-cosmic mx-auto mb-4 animate-glow" />
                        <h3 className="text-xl font-bold mb-2">Rising Sign</h3>
                        <p className="text-2xl cosmic-text font-bold">
                          {astrologyResults.risingSign}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          How others perceive you
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-cosmic" />
                        Planetary Positions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {astrologyResults.planetaryPositions.map(
                          (planet, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                            >
                              <div>
                                <p className="font-semibold">
                                  {planet.planet} in {planet.sign}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {planet.house} House
                                </p>
                              </div>
                              <p className="text-sm text-cosmic">
                                {planet.aspect}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personality Tab */}
                <TabsContent value="personality" className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-cosmic" />
                        Personality Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {astrologyResults.personalityTraits.map(
                        (trait, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{trait.trait}</span>
                              <span className="text-cosmic font-bold">
                                {trait.score}%
                              </span>
                            </div>
                            <Progress value={trait.score} className="h-3" />
                            <p className="text-sm text-muted-foreground">
                              {trait.description}
                            </p>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Predictions Tab */}
                <TabsContent value="predictions" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {astrologyResults.lifePredictions.map(
                      (prediction, index) => (
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
                                {prediction.area === "Love" && (
                                  <Heart className="h-6 w-6 text-cosmic" />
                                )}
                                {prediction.area === "Health" && (
                                  <Shield className="h-6 w-6 text-cosmic" />
                                )}
                                {prediction.area === "Finance" && (
                                  <Star className="h-6 w-6 text-cosmic" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {prediction.area}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {prediction.timeframe}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm mb-4">
                              {prediction.prediction}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Confidence:
                                </span>
                                <span className="font-medium text-cosmic">
                                  {prediction.confidence}%
                                </span>
                              </div>
                              <Progress
                                value={prediction.confidence}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </TabsContent>

                {/* Compatibility Tab */}
                <TabsContent value="compatibility" className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-cosmic" />
                        Love Compatibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {astrologyResults.compatibility.map((match, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cosmic/20 rounded-full flex items-center justify-center">
                                <Star className="h-5 w-5 text-cosmic" />
                              </div>
                              <div>
                                <p className="font-semibold">{match.sign}</p>
                                <p className="text-sm text-muted-foreground">
                                  {match.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold cosmic-text">
                                {match.match}%
                              </p>
                              <Progress
                                value={match.match}
                                className="h-2 w-20 mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button className="bg-stellar-gradient hover:opacity-90 stellar-glow">
                  <Star className="h-4 w-4 mr-2" />
                  Save Reading
                </Button>
                <Button
                  variant="outline"
                  className="border-cosmic/50 text-cosmic hover:bg-cosmic/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="border-cosmic/50 text-cosmic hover:bg-cosmic/20"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-container">
      {/* Fixed star background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg absolute inset-0"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Header */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 stars-bg opacity-30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-cosmic hover:text-cosmic/80 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <Badge
                variant="outline"
                className="mb-4 px-4 py-2 border-cosmic/50 text-cosmic bg-cosmic/10"
              >
                <Star className="h-4 w-4 mr-2" />
                Astrology Reading
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Your <span className="cosmic-text">Cosmic Blueprint</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get personalized astrological insights based on your birth chart
                and planetary alignments.
              </p>
            </div>
          </div>
        </section>

        {/* Progress indicator */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.number
                          ? "border-cosmic bg-cosmic text-background"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="ml-2 mr-8">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-16 ${currentStep > step.number ? "bg-cosmic" : "bg-border"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form steps */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card">
                <CardContent className="p-8">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          Personal Information
                        </h2>
                        <p className="text-muted-foreground">
                          Tell us about yourself to personalize your reading
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={birthData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={birthData.gender}
                            onValueChange={(value) =>
                              handleInputChange("gender", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">
                                Prefer not to say
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          Birth Details
                        </h2>
                        <p className="text-muted-foreground">
                          Precise birth information for accurate chart
                          calculation
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="birthDate"
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Birth Date
                          </Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={birthData.birthDate}
                            onChange={(e) =>
                              handleInputChange("birthDate", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="birthTime"
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            Birth Time
                          </Label>
                          <Input
                            id="birthTime"
                            type="time"
                            value={birthData.birthTime}
                            onChange={(e) =>
                              handleInputChange("birthTime", e.target.value)
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Check your birth certificate for the exact time
                          </p>
                        </div>

                        <div>
                          <Label
                            htmlFor="birthPlace"
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            Birth Place
                          </Label>
                          <Input
                            id="birthPlace"
                            value={birthData.birthPlace}
                            onChange={(e) =>
                              handleInputChange("birthPlace", e.target.value)
                            }
                            placeholder="City, State/Province, Country"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          Reading Focus
                        </h2>
                        <p className="text-muted-foreground">
                          What aspects of your life would you like to explore?
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            id: "love",
                            label: "Love & Relationships",
                            icon: Heart,
                          },
                          {
                            id: "career",
                            label: "Career & Finance",
                            icon: TrendingUp,
                          },
                          {
                            id: "health",
                            label: "Health & Wellness",
                            icon: Shield,
                          },
                          {
                            id: "spiritual",
                            label: "Spiritual Growth",
                            icon: Eye,
                          },
                        ].map((focus) => {
                          const Icon = focus.icon;
                          return (
                            <div
                              key={focus.id}
                              className="p-4 border border-border/50 rounded-lg hover:border-cosmic/50 transition-colors cursor-pointer"
                            >
                              <Icon className="h-6 w-6 text-cosmic mb-2" />
                              <p className="font-medium text-sm">
                                {focus.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <Label htmlFor="questions">
                          Specific Questions (Optional)
                        </Label>
                        <Textarea
                          id="questions"
                          placeholder="Any specific questions you'd like answered in your reading?"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="text-center space-y-6">
                      <Sparkles className="h-16 w-16 text-cosmic mx-auto animate-spin" />
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Calculating Your Birth Chart
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          Our AI is analyzing planetary positions and cosmic
                          influences...
                        </p>
                        <Progress
                          value={progress}
                          className="w-full max-w-md mx-auto"
                        />
                        <p className="text-sm text-cosmic mt-2">
                          {progress}% Complete
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {progress < 25 && (
                          <p>Mapping celestial coordinates...</p>
                        )}
                        {progress >= 25 && progress < 50 && (
                          <p>Calculating planetary aspects...</p>
                        )}
                        {progress >= 50 && progress < 75 && (
                          <p>Analyzing house positions...</p>
                        )}
                        {progress >= 75 && (
                          <p>Generating personalized insights...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <div className="flex justify-between pt-6">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentStep(Math.max(1, currentStep - 1))
                        }
                        disabled={currentStep === 1}
                        className="border-cosmic/50 text-cosmic hover:bg-cosmic/20"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="bg-stellar-gradient hover:opacity-90 stellar-glow"
                      >
                        {currentStep === 3 ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Reading
                          </>
                        ) : (
                          "Next"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 cosmic-bg">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your birth data is encrypted and secure. We never share personal
              information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AstrologyReading;
