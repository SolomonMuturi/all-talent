'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Target, Globe, Heart, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our technology to our customer support."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "Building a global football community that supports and elevates each other."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Accessibility",
      description: "Making world-class football opportunities accessible to everyone, everywhere."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion",
      description: "Driven by our love for football and desire to see talent flourish."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
                Our Story
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
              About <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">TalantaTrack</span>
            </h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 mb-8">
              Founded in 2020, TalantaTrack has grown to become the world's leading football talent management platform, 
              connecting over 50,000 players with 5,000+ clubs across 120+ countries.
            </p>
            
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-3xl p-8 mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
              <p className="text-gray-300 text-lg">
                To democratize football talent discovery by providing cutting-edge technology that connects 
                players, coaches, and scouts globally, ensuring every talented footballer gets the opportunity 
                they deserve.
              </p>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-white">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {values.map((value, index) => (
                <div key={index} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <div className="text-green-500 mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center bg-gray-900/50 rounded-3xl p-12">
              <Award className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-white">Join Our Journey</h2>
              <p className="text-gray-300 mb-8">
                Be part of the football revolution. Whether you're a player, coach, scout, or club, 
                TalantaTrack is here to help you achieve your goals.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Link href="/join">
                  Get Started Today
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}