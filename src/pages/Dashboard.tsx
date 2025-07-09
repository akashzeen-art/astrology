import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  User,
  Hand,
  Star,
  TrendingUp,
  Calendar,
  Crown,
  Heart,
  Brain,
  Clock,
  Download,
  Share2,
  Settings,
  Bell,
  Eye,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [user] = useState({
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    avatar: "",
    plan: "Stellar Seeker",
    memberSince: "January 2024",
    totalReadings: 47,
    accuracy: 96,
    favoriteReadingType: "Palm Analysis",
  });

  const [recentReadings] = useState([
    {
      id: 1,
      type: "Palm Analysis",
      date: "2024-01-15",
      accuracy: 98,
      insights: 12,
      status: "completed",
      thumbnail: "/api/placeholder/100/100",
    },
    {
      id: 2,
      type: "Astrology Reading",
      date: "2024-01-12",
      accuracy: 94,
      insights: 8,
      status: "completed",
      thumbnail: "/api/placeholder/100/100",
    },
    {
      id: 3,
      type: "Daily Horoscope",
      date: "2024-01-10",
      accuracy: 92,
      insights: 5,
      status: "completed",
      thumbnail: "/api/placeholder/100/100",
    },
    {
      id: 4,
      type: "Love Compatibility",
      date: "2024-01-08",
      accuracy: 97,
      insights: 15,
      status: "completed",
      thumbnail: "/api/placeholder/100/100",
    },
  ]);

  const [weeklyData] = useState([
    { day: "Mon", readings: 2, accuracy: 95 },
    { day: "Tue", readings: 1, accuracy: 98 },
    { day: "Wed", readings: 3, accuracy: 92 },
    { day: "Thu", readings: 2, accuracy: 96 },
    { day: "Fri", readings: 4, accuracy: 94 },
    { day: "Sat", readings: 1, accuracy: 99 },
    { day: "Sun", readings: 2, accuracy: 97 },
  ]);

  const [spiritualProgress] = useState([
    { name: "Self-Awareness", value: 85, color: "#8852E0" },
    { name: "Intuition", value: 78, color: "#7575F0" },
    { name: "Life Purpose", value: 92, color: "#F4C025" },
    { name: "Relationships", value: 70, color: "#B946D6" },
  ]);

  const [upcomingPredictions] = useState([
    {
      type: "Career",
      prediction: "Major opportunity approaching in March",
      confidence: 94,
      timeframe: "Next 2 months",
      icon: TrendingUp,
    },
    {
      type: "Love",
      prediction: "New romantic connection likely",
      confidence: 87,
      timeframe: "Next 3 weeks",
      icon: Heart,
    },
    {
      type: "Health",
      prediction: "Focus on mental wellness recommended",
      confidence: 91,
      timeframe: "Ongoing",
      icon: Brain,
    },
  ]);

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
            <div className="flex flex-col items-start gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 stellar-glow flex-shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-cosmic/20 text-cosmic text-sm sm:text-lg font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    Welcome back, <br className="sm:hidden" />
                    <span className="cosmic-text">{user.name}</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {user.plan} • Member since {user.memberSince}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cosmic/50 text-cosmic hover:bg-cosmic/20 justify-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Link to="/palm-analysis" className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    className="bg-stellar-gradient hover:opacity-90 stellar-glow w-full justify-center"
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    New Reading
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Dashboard */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card hover:stellar-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Readings
                      </p>
                      <p className="text-2xl font-bold cosmic-text">
                        {user.totalReadings}
                      </p>
                    </div>
                    <div className="p-3 bg-cosmic/20 rounded-full">
                      <Hand className="h-6 w-6 text-cosmic" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:stellar-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Accuracy Rate
                      </p>
                      <p className="text-2xl font-bold cosmic-text">
                        {user.accuracy}%
                      </p>
                    </div>
                    <div className="p-3 bg-stellar/20 rounded-full">
                      <Star className="h-6 w-6 text-stellar" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:stellar-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        This Week
                      </p>
                      <p className="text-2xl font-bold cosmic-text">15</p>
                    </div>
                    <div className="p-3 bg-golden/20 rounded-full">
                      <Calendar className="h-6 w-6 text-golden" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:stellar-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Current Plan
                      </p>
                      <p className="text-lg font-bold text-stellar">
                        {user.plan}
                      </p>
                    </div>
                    <div className="p-3 bg-stellar/20 rounded-full">
                      <Crown className="h-6 w-6 text-stellar" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 glass-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="readings">Readings</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Activity Chart */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-cosmic" />
                        Weekly Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="day"
                            stroke="hsl(var(--foreground))"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--foreground))"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="readings"
                            fill="hsl(var(--cosmic))"
                            radius={[4, 4, 0, 0]}
                            stroke="none"
                            strokeWidth={0}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Spiritual Progress Pie Chart */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-cosmic" />
                        Spiritual Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={spiritualProgress}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {spiritualProgress.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {spiritualProgress.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span>
                              {item.name}: {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-cosmic" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentReadings.slice(0, 3).map((reading) => (
                        <div
                          key={reading.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-cosmic/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cosmic/20 rounded-lg flex items-center justify-center">
                              <Hand className="h-5 w-5 text-cosmic" />
                            </div>
                            <div>
                              <p className="font-medium">{reading.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(reading.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-stellar/20 text-stellar border-stellar/30">
                              {reading.accuracy}% accuracy
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Readings Tab */}
              <TabsContent value="readings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentReadings.map((reading) => (
                    <Card
                      key={reading.id}
                      className="glass-card hover:stellar-glow transition-all duration-300 cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            variant="outline"
                            className="border-cosmic/50 text-cosmic bg-cosmic/10"
                          >
                            {reading.type}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date:</span>
                            <span>
                              {new Date(reading.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Accuracy:
                            </span>
                            <span className="text-cosmic font-medium">
                              {reading.accuracy}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Insights:
                            </span>
                            <span>{reading.insights}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4 bg-stellar-gradient hover:opacity-90"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Accuracy Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="day"
                            stroke="hsl(var(--foreground))"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--foreground))"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="hsl(var(--cosmic))"
                            strokeWidth={2}
                            dot={{
                              fill: "hsl(var(--cosmic))",
                              strokeWidth: 0,
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                              stroke: "hsl(var(--cosmic))",
                              strokeWidth: 2,
                            }}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Spiritual Development</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {spiritualProgress.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingPredictions.map((prediction, index) => {
                    const Icon = prediction.icon;
                    return (
                      <Card
                        key={index}
                        className="glass-card hover:stellar-glow transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-cosmic/20 rounded-full">
                              <Icon className="h-6 w-6 text-cosmic" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {prediction.type}
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
                    );
                  })}
                </div>

                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <Bell className="h-12 w-12 text-cosmic mx-auto mb-4 animate-glow" />
                    <h3 className="text-xl font-semibold mb-2">
                      Want More Detailed Predictions?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upgrade to Mystic Master for 6-month future predictions
                      and personalized remedies.
                    </p>
                    <Button className="bg-golden-gradient hover:opacity-90 golden-glow">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 cosmic-bg">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Questions about your readings?{" "}
              <a href="#" className="text-cosmic hover:underline">
                Contact our spiritual advisors
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
