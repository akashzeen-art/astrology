import React, { useState } from "react";
import VideoBackground from "@/components/VideoBackground";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const KidsBoxPortal = () => {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  const stories = [
    {
      title: "The Magic Rainbow",
      preview: "Once upon a time, there was a rainbow that could grant wishes...",
      full: "Once upon a time, there was a rainbow that could grant wishes to all the children who believed in magic. Every time it appeared after the rain, kids would make their most wonderful wishes!"
    },
    {
      title: "Friendly Dragon",
      preview: "In a faraway land lived a dragon who loved to help children...",
      full: "In a faraway land lived a dragon named Sparkles who loved to help children learn new things. Instead of breathing fire, Sparkles breathed colorful letters and numbers that danced in the sky!"
    },
    {
      title: "Dancing Stars",
      preview: "Every night, the stars would come down to dance with the moon...",
      full: "Every night, the stars would come down to dance with the moon, creating the most beautiful light show. Children who looked up at the right moment could see them twirling and spinning with joy!"
    },
    {
      title: "The Talking Tree",
      preview: "Deep in the forest stood a wise old tree that could speak...",
      full: "Deep in the forest stood a wise old tree that could speak to all the animals and children. The tree shared stories of the forest and taught everyone about friendship, kindness, and taking care of nature."
    },
    {
      title: "The Brave Little Explorer",
      preview: "A curious little explorer set out on an adventure...",
      full: "A curious little explorer named Alex set out on an adventure to discover new places. Along the way, Alex met friendly animals, solved puzzles, and learned that the greatest treasure was the joy of discovery!"
    },
    {
      title: "The Colorful Garden",
      preview: "In a magical garden, flowers could sing and dance...",
      full: "In a magical garden, flowers could sing and dance! Every morning, the sunflowers would sing cheerful songs, the roses would waltz in the breeze, and the tulips would play hide and seek."
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Video Background */}
      <VideoBackground src="/images/he2.mp4" overlay={true} />
      
      {/* Content Overlay */}
      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <header className="p-4">
          <GlassCard className="flex justify-between items-center p-4" blur="md">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">🎪 Kids Box Portal</div>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-white hover:text-purple-300">Home</a>
              <a href="#" className="text-white hover:text-purple-300">Activities</a>
            </nav>
          </GlassCard>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-8">
          <GlassCard className="text-center p-8 max-w-4xl mx-auto" blur="lg">
            <h1 className="text-4xl font-bold text-white mb-4">Kids Box Portal</h1>
            <p className="text-xl text-gray-200 mb-6">Welcome to the most fun place on the internet!</p>
            <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/50 text-lg px-4 py-2">
              Learning Fun
            </Badge>
          </GlassCard>
        </section>

        {/* Learning Activities */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "🅰️", title: "Alphabet", desc: "A is for Apple! 🍎" },
              { emoji: "🔢", title: "Numbers", desc: "1, 2, 3... Let's count together!" },
              { emoji: "🌈", title: "Colors", desc: "Red, Blue, Yellow... What's your favorite color?" },
              { emoji: "🔺", title: "Shapes", desc: "Circle, Square, Triangle... Can you spot them?" }
            ].map((item, i) => (
              <GlassCard key={i} className="p-6 text-center hover:scale-105 transition-all" blur="md">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{item.desc}</p>
                <div className="space-y-2">
                  <Button size="sm" className="w-full bg-blue-500/80 hover:bg-blue-600">Show Fact</Button>
                  <Button size="sm" variant="outline" className="w-full border-white/30 text-white">Learn More 🎯</Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Story Time */}
        <section className="px-4 py-8">
          <GlassCard className="max-w-6xl mx-auto p-6" blur="lg">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Story Time</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, i) => (
                <GlassCard key={i} className="p-4 hover:scale-105 transition-all" blur="sm">
                  <h3 className="text-lg font-bold text-white mb-2">{story.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{story.preview}</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-500/80 hover:bg-purple-600"
                    onClick={() => setSelectedStory(selectedStory === story.title ? null : story.title)}
                  >
                    📖 {selectedStory === story.title ? 'Hide' : 'Full Story'}
                  </Button>
                  {selectedStory === story.title && (
                    <div className="mt-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-gray-200 text-sm">✨ {story.full}</p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Daily Puzzle */}
        <section className="px-4 py-8">
          <GlassCard className="max-w-2xl mx-auto p-6 text-center" blur="md">
            <h2 className="text-2xl font-bold text-white mb-4">Daily Puzzle 🧩</h2>
            <p className="text-lg text-gray-200 mb-4">What comes next?</p>
            <div className="text-3xl mb-4">🐱 🐶 🐱 🐶 ?</div>
            <div className="flex justify-center space-x-4">
              <Button className="text-2xl bg-green-500/80 hover:bg-green-600">🐱</Button>
              <Button className="text-2xl bg-blue-500/80 hover:bg-blue-600">🐶</Button>
            </div>
          </GlassCard>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-8">
          <GlassCard className="max-w-4xl mx-auto p-6" blur="lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">What Parents Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "My kids love this portal! It's educational and so much fun!", author: "Sarah M." },
                { quote: "Perfect blend of learning and entertainment. Highly recommended!", author: "Mike D." },
                { quote: "Safe, colorful, and engaging. My daughter spends hours here!", author: "Lisa K." }
              ].map((testimonial, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-gray-200 italic mb-2">"{testimonial.quote}"</p>
                  <p className="text-gray-400 text-sm">- {testimonial.author}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="px-4 py-8">
          <GlassCard className="max-w-4xl mx-auto p-6 text-center" blur="md">
            <p className="text-white mb-4">Made with fun & love</p>
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#" className="text-gray-300 hover:text-white text-sm">Terms & Conditions</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a>
            </div>
            <p className="text-gray-400 text-sm">© 2025 YourCompanyName. All rights reserved.</p>
          </GlassCard>
        </footer>
      </div>
    </div>
  );
};

export default KidsBoxPortal;