'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, ShieldCheck, Users, Trophy, Globe, Goal, Sparkles, Zap, Video, Award } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Users className="h-12 w-12" />,
      title: "Smart Player Profiles",
      description: "Dynamic football player profiles with performance analytics, video highlights, and match stats",
      gradient: "from-green-500 to-blue-500",
      details: "Create comprehensive player profiles that showcase your skills, achievements, and potential. Our smart profiles use AI to highlight your strengths and areas for improvement, making it easier for scouts and coaches to evaluate your talent."
    },
    {
      icon: <BarChart className="h-12 w-12" />,
      title: "AI Match Analysis",
      description: "Advanced football analytics and predictive insights for performance optimization",
      gradient: "from-green-600 to-emerald-500",
      details: "Our cutting-edge AI analyzes match footage to provide detailed insights on positioning, decision-making, and tactical awareness. Get personalized recommendations to improve your game."
    },
    {
      icon: <ShieldCheck className="h-12 w-12" />,
      title: "Verified Scouting Network",
      description: "Connect with certified football scouts and clubs worldwide",
      gradient: "from-blue-500 to-cyan-500",
      details: "Access our network of 5,000+ verified scouts from top clubs across 120+ countries. Get discovered by the right people and take your career to the next level."
    },
    {
      icon: <Trophy className="h-12 w-12" />,
      title: "Football Tournaments",
      description: "End-to-end football tournament organization with live scoring and streaming",
      gradient: "from-yellow-500 to-orange-500",
      details: "Organize and participate in tournaments with our comprehensive platform. Features include live scoring, video streaming, player stats, and automated bracket management."
    },
    {
      icon: <Goal className="h-12 w-12" />,
      title: "Football Training",
      description: "Personalized football training plans with progress tracking",
      gradient: "from-green-500 to-emerald-500",
      details: "Get customized training programs based on your position, skill level, and goals. Track your progress with detailed analytics and video analysis."
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: "Global Football Community",
      description: "Connect with football players, coaches, and fans worldwide",
      gradient: "from-blue-500 to-indigo-500",
      details: "Join a global network of football enthusiasts. Share insights, discuss tactics, and build relationships with like-minded individuals from around the world."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
              Platform Capabilities
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
            Powerful <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Features</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to elevate your football career or organization
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6`}>
                  <div className={`text-gradient bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.icon}
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">{feature.title}</h2>
                <p className="text-gray-300 text-lg mb-6">{feature.details}</p>
                <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Link href="/join">
                    Try Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex-1 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-3xl p-8 border border-green-500/30">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{feature.icon}</div>
                    <p className="text-gray-300">Experience the power of {feature.title}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg px-12 py-7 rounded-2xl">
            <Link href="/join">
              <Zap className="mr-3 h-6 w-6" />
              Start Your Free Trial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}