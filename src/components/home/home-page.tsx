'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowRight, BarChart, ShieldCheck, Users, Trophy, Globe, Calendar, Newspaper, Star, Goal, MapPin, User, Sparkles, Target, TrendingUp, Award, Heart, Zap, Clock, Shield, Video, Mic, Twitter, Facebook, Instagram, Linkedin, Youtube, X } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useState, useEffect } from 'react';

// Video Modal Component
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Close modal on Escape key and prevent background scrolling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-16 right-0 md:-right-16 text-white hover:bg-white/20 z-10 rounded-full p-3"
        >
          <X className="h-8 w-8" />
          <span className="sr-only">Close video</span>
        </Button>

        {/* Video container */}
        <div className="relative bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-2 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-green-500/20">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <video
                src="/videos/demo.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster="/images/video-poster.jpg"
              >
                Your browser does not support the video tag.
                <a href="/videos/demo.mp4" className="text-green-500 underline">
                  Download the video
                </a>
              </video>
            </div>
          </div>

          {/* Video info */}
          <div className="p-8 text-center bg-gradient-to-b from-gray-900/90 to-black/90">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              TalantaTrack Platform Demo
            </h3>
            <p className="text-gray-300 text-lg">
              See how we revolutionize football talent management with AI-powered analytics,
              comprehensive player profiles, and global scouting networks.
            </p>
            
            {/* Video chapters/timestamps */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-green-500/20">
                <div className="text-green-500 font-bold mb-2">00:30</div>
                <h4 className="font-semibold text-white">Player Profiles</h4>
                <p className="text-sm text-gray-400">Dynamic stats & highlights</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-blue-500/20">
                <div className="text-blue-500 font-bold mb-2">02:15</div>
                <h4 className="font-semibold text-white">AI Match Analysis</h4>
                <p className="text-sm text-gray-400">Performance insights</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-purple-500/20">
                <div className="text-purple-500 font-bold mb-2">04:45</div>
                <h4 className="font-semibold text-white">Scouting Network</h4>
                <p className="text-sm text-gray-400">Global talent discovery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close */}
        <div
          className="absolute inset-0 -z-10 cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// Stats counter animation
function Counter({ end, duration = 2000 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(percentage * end));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };
    
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">{count.toLocaleString()}+</span>;
}

// Hero images with football themes only
const heroImages = [
  { src: '/images/hero/football-action.jpg', hint: 'Football match action' },
  { src: '/images/hero/football-training.jpg', hint: 'Football training session' },
  { src: '/images/hero/football-stadium.jpg', hint: 'Football stadium' },
  { src: '/images/hero/football-goal.jpg', hint: 'Football goal celebration' },
  { src: '/images/hero/football-team.jpg', hint: 'Football team huddle' },
];

// Persistent football equipment images
const persistentFootballItems = [
  { src: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=400&q=80', alt: 'Football ball', style: 'top-20 left-10 w-32 h-32 md:w-48 md:h-48' },
  { src: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=400&q=80', alt: 'Football boots', style: 'top-40 right-10 w-28 h-28 md:w-40 md:h-40' },
  { src: 'https://images.unsplash.com/photo-1519861531473-920034658307?auto=format&fit=crop&w=400&q=80', alt: 'Football jersey', style: 'bottom-40 left-5 w-20 h-20 md:w-32 md:h-32' },
  { src: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80', alt: 'Football goalpost', style: 'bottom-20 right-20 w-24 h-24 md:w-36 md:h-36' },
  { src: 'https://images.unsplash.com/photo-1511204579483-e5c2b1d69acd?auto=format&fit=crop&w=400&q=80', alt: 'Football field', style: 'top-60 left-1/4 w-16 h-16 md:w-24 md:h-24' },
  { src: 'https://images.unsplash.com/photo-1551645700-ffa2c6c4d0bd?auto=format&fit=crop&w=400&q=80', alt: 'Football trophy', style: 'top-1/4 right-1/4 w-24 h-24 md:w-36 md:h-36' },
];

export function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dummy data for blogs and events - Football only
  const blogs = [
    {
      id: '1',
      title: 'How to Train Like a Pro Footballer',
      summary: 'Discover the secrets of professional football training and how you can apply them to your daily routine.',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      author: 'Coach Jane',
      date: '2024-06-01',
      category: 'Training',
      readTime: '5 min',
    },
    {
      id: '2',
      title: 'Nutrition for Football Players',
      summary: 'A comprehensive guide to fueling your body for peak performance on the pitch.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      author: 'Nutritionist Sam',
      date: '2024-05-20',
      category: 'Nutrition',
      readTime: '7 min',
    },
    {
      id: '3',
      title: 'The Rise of African Football Talent',
      summary: 'Explore the growth and impact of African football talent globally.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      author: 'Analyst Mary',
      date: '2024-05-10',
      category: 'Analysis',
      readTime: '6 min',
    },
  ];

  const events = [
    {
      id: '1',
      title: 'U-17 Football Regional Finals',
      date: '2024-07-28',
      location: 'Kasarani Stadium',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      description: 'The best U-17 football teams compete for the regional trophy.',
      category: 'Football',
      price: 'Free',
    },
    {
      id: '2',
      title: 'Football Coaches Conference',
      date: '2024-08-15',
      location: 'Nairobi Conference Center',
      image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1200&q=80',
      description: 'A gathering of top football coaches to share strategies and insights.',
      category: 'Workshop',
      price: '$199',
    },
    {
      id: '3',
      title: 'Football Talent Identification Camp',
      date: '2024-09-05',
      location: 'Mombasa Sports Complex',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      description: 'Scouts and coaches search for the next football stars.',
      category: 'Scouting',
      price: '$49',
    },
  ];

  const testimonials = [
    {
      name: 'Alex Rodriguez',
      role: 'Professional Football Scout',
      content: 'TalantaTrack has revolutionized how we discover football talent. The analytics are game-changing!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      name: 'Sarah Johnson',
      role: 'Football Academy Director',
      content: 'Managing our football academy has never been easier. The platform is intuitive and powerful.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      name: 'Marcus Lee',
      role: 'Professional Footballer',
      content: 'This platform helped me get discovered. The exposure to scouts worldwide is incredible.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      {/* Header with parallax effect */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 100 
            ? 'bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-xl' 
            : 'bg-black/80 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-70 animate-pulse"></div>
                <Logo className="relative h-10 w-10 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl font-headline bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  TalantaTrack
                </span>
                <p className="text-xs text-gray-400">Elevating Football Excellence</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-sm font-semibold text-gray-300 hover:text-green-500 transition-all hover:scale-105">Home</a>
              <a href="#features" className="text-sm font-semibold text-gray-300 hover:text-green-500 transition-all hover:scale-105">Features</a>
              <a href="#events" className="text-sm font-semibold text-gray-300 hover:text-green-500 transition-all hover:scale-105">Events</a>
              <a href="#blogs" className="text-sm font-semibold text-gray-300 hover:text-green-500 transition-all hover:scale-105">Blog</a>
              <a href="#about" className="text-sm font-semibold text-gray-300 hover:text-green-500 transition-all hover:scale-105">About</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hidden md:flex text-gray-300">
                <Link href="/login">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Link href="/join">
                  <Zap className="h-4 w-4 mr-2" />
                  Join Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Viewport Height with Black Background */}
      <main className="flex-1 w-full" id="home">
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
          {/* Black background with football equipment */}
          <div className="absolute inset-0 z-0">
            {/* Permanent football equipment images - Visible on dark background */}
            {persistentFootballItems.map((item, index) => (
              <div 
                key={index}
                className={`absolute ${item.style} opacity-80 hover:opacity-100 transition-opacity duration-300`}
                style={{
                  animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="rounded-full object-cover shadow-xl w-full h-full border-2 border-green-500/30"
                  style={{
                    width: item.style.includes('w-32') ? '128px' : 
                           item.style.includes('w-48') ? '192px' : 
                           item.style.includes('w-40') ? '160px' :
                           item.style.includes('w-36') ? '144px' :
                           item.style.includes('w-28') ? '112px' :
                           item.style.includes('w-24') ? '96px' :
                           item.style.includes('w-20') ? '80px' :
                           item.style.includes('w-16') ? '64px' : '96px',
                    height: item.style.includes('h-32') ? '128px' : 
                            item.style.includes('h-48') ? '192px' : 
                            item.style.includes('h-40') ? '160px' :
                            item.style.includes('h-36') ? '144px' :
                            item.style.includes('h-28') ? '112px' :
                            item.style.includes('h-24') ? '96px' :
                            item.style.includes('h-20') ? '80px' :
                            item.style.includes('h-16') ? '64px' : '96px'
                  }}
                />
              </div>
            ))}
            
            {/* Dark background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Carousel overlay */}
          <div className="absolute inset-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-20"></div>
            <Carousel
              opts={{ loop: true }}
              plugins={[Autoplay({ delay: 8000, stopOnInteraction: false })]}
              className="absolute inset-0 w-full h-full"
            >
              <CarouselContent>
                {heroImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image.src}
                      alt={`Football hero image ${index + 1}`}
                      className="object-cover object-center opacity-60 w-full h-full"
                      data-ai-hint={image.hint}
                      style={{ position: 'absolute', inset: 0 }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Content */}
          <div className="relative z-30 w-full flex items-center justify-center min-h-screen">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-12 px-4 md:px-8">
              <div className="inline-flex items-center space-x-2 mb-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                  The Future of Football
                </span>
              </div>
              
              <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter leading-tight mb-4">
                <span className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 bg-clip-text text-transparent animate-gradient block">
                  Elevate Your Football
                </span>
                <span className="block text-white drop-shadow-2xl mt-2">With TalantaTrack</span>
              </h1>
              
              <p className="text-center text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                Join the world&apos;s largest football ecosystem connecting 
                <span className="font-bold text-white"> players, coaches, scouts, </span>
                and
                <span className="font-bold text-white"> clubs </span>
                through cutting-edge technology and analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-14 w-full justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group w-full sm:w-auto"
                >
                  <Link href="/join">
                    Start Free Trial
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-black/60 backdrop-blur-sm border-gray-600 text-white hover:bg-green-600 hover:border-green-600 text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto group"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <Video className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats Row - Focused on Football */}
              <div className="w-full flex flex-col sm:flex-row flex-wrap items-center justify-center gap-8 mt-4 bg-black/60 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-green-500/20">
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={50} duration={2500} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-green-500 mb-1">K+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Football Players</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={5} duration={2000} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-green-500 mb-1">K+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Football Clubs</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={120} duration={3000} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-green-500 mb-1">+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Countries</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={98} duration={1800} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-green-500 mb-1">%</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-green-500 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* Features Section - Football Focused */}
        <section id="features" className="w-full py-24 min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
                  Why Choose TalantaTrack for Football
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                Complete <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Football Ecosystem</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {[
                {
                  icon: <Users className="h-12 w-12" />,
                  title: "Smart Player Profiles",
                  description: "Dynamic football player profiles with performance analytics, video highlights, and match stats",
                  gradient: "from-green-500 to-blue-500",
                },
                {
                  icon: <BarChart className="h-12 w-12" />,
                  title: "AI Match Analysis",
                  description: "Advanced football analytics and predictive insights for performance optimization",
                  gradient: "from-green-600 to-emerald-500",
                },
                {
                  icon: <ShieldCheck className="h-12 w-12" />,
                  title: "Verified Scouting Network",
                  description: "Connect with certified football scouts and clubs worldwide",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: <Trophy className="h-12 w-12" />,
                  title: "Football Tournaments",
                  description: "End-to-end football tournament organization with live scoring and streaming",
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  icon: <Goal className="h-12 w-12" />,
                  title: "Football Training",
                  description: "Personalized football training plans with progress tracking",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: <Globe className="h-12 w-12" />,
                  title: "Global Football Community",
                  description: "Connect with football players, coaches, and fans worldwide",
                  gradient: "from-blue-500 to-indigo-500",
                },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:shadow-2xl hover:border-green-500/30 hover:shadow-green-500/10 transition-all duration-500 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <div className={`relative mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10`}>
                    <div className={`text-gradient bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 relative text-white">{feature.title}</h3>
                  <p className="text-gray-300 relative">{feature.description}</p>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA within Features */}
            <div className="text-center">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group"
              >
                <Link href="/join">
                  <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                  Start Your Free Trial
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <p className="text-gray-400 mt-4 text-sm">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Events Section - Football Only */}
        <section id="events" className="w-full py-24 min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <div className="inline-flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
                    Upcoming Football Events
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                  Don&apos;t Miss The <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Football Action</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join world-class football tournaments, workshops, and scouting events
                </p>
                <Button asChild size="lg" className="rounded-xl px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <Link href="/join">
                    <Calendar className="mr-3 h-5 w-5" />
                    Register for Events
                  </Link>
                </Button>
              </div>
              
              <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                {events.map((event, index) => (
                  <Card 
                    key={event.id} 
                    className="group relative overflow-hidden border border-gray-800 bg-gray-900/80 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-105"
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="object-cover group-hover:scale-110 transition-transform duration-500 w-full h-full"
                          style={{ position: 'absolute', inset: 0 }}
                        />
                        <div className="absolute top-4 left-4 bg-green-600/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-lg font-bold text-green-500">
                            {event.price}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{event.title}</h3>
                        <div className="flex items-center text-gray-400 mb-4">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{event.description}</p>
                        <Button asChild variant="outline" className="w-full border-green-600 text-green-500 hover:bg-green-600 hover:text-white transition-colors">
                          <Link href="/join">
                            Register Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA within Events */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-3xl p-12 text-center">
              <h3 className="text-3xl font-bold mb-4 text-white">
                Ready to Showcase Your Football Talent?
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of players who have been discovered through TalantaTrack events. 
                Get your free trial and start registering for tournaments today.
              </p>
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Link href="/join">
                  <Trophy className="mr-3 h-6 w-6" />
                  Get Free Trial for Events
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Blog Section - Football Focused */}
        <section id="blogs" className="w-full py-24 min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Newspaper className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
                  Latest Football Insights
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                Football <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Intelligence</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {blogs.map((blog) => (
                <article 
                  key={blog.id}
                  className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-green-500/30 hover:shadow-green-500/10 transition-all duration-500 hover:scale-105"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="object-cover group-hover:scale-110 transition-transform duration-500 w-full h-full"
                      style={{ position: 'absolute', inset: 0 }}
                    />
                    <div className="absolute top-4 left-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {blog.category}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/90 text-white px-3 py-1 rounded-full text-xs">
                      {blog.readTime} read
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-400">{blog.author}</span>
                      </div>
                      <span className="text-sm text-gray-400">{blog.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-500 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-300 mb-6">{blog.summary}</p>
                    <Button variant="ghost" className="group-hover:text-green-500 p-0 text-gray-300">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="rounded-full px-10 py-6 text-lg border-green-600 text-green-500 hover:bg-green-600 hover:text-white">
                <Link href="/join">
                  <Newspaper className="mr-3 h-5 w-5" />
                  Get Full Access to Insights
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials - Football Focused */}
        <section className="w-full py-24 min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
                  Trusted By Football Champions
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                What The <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Football Pros Say</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-lg italic text-gray-300 mb-8">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-green-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA within Testimonials */}
            <div className="mt-20 text-center">
              <div className="max-w-3xl mx-auto bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-3xl p-12">
                <h3 className="text-3xl font-bold mb-4 text-white">
                  Join These Success Stories
                </h3>
                <p className="text-gray-300 mb-8">
                  Be the next football star discovered through TalantaTrack. Start your journey today with our free trial.
                </p>
                <Button 
                  asChild
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                >
                  <Link href="/join">
                    <Award className="mr-3 h-6 w-6" />
                    Start Your Success Story
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="join" className="w-full py-32 min-h-screen relative overflow-hidden flex items-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute inset-0 z-0">
            {/* Animated background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 mb-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
                <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                <span className="text-xl font-semibold text-green-400 uppercase tracking-wider">
                  Limited Time Offer
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-8">
                Start Your <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Football Journey</span> Today
              </h2>
              
              <div className="bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-3xl p-8 mb-12 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-green-500">What You Get in Your Free Trial:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {[
                    "✓ 14-day full platform access",
                    "✓ AI-powered player analysis",
                    "✓ Connect with 100+ verified scouts",
                    "✓ Upload match videos & highlights",
                    "✓ Access to football tournaments",
                    "✓ Performance tracking dashboard",
                    "✓ Training plan generator",
                    "✓ Priority email support"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Join 50,000+ football players, coaches, and scouts worldwide. Experience the future of football talent management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group"
                >
                  <Link href="/join">
                    <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                    Request Free Trial Now
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-12 py-7 rounded-2xl border-2 border-green-600 text-green-500 hover:bg-green-600 hover:text-white transition-all group"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <Video className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Watch Platform Demo
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  <span>Trusted by 5,000+ clubs</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur"></div>
                  <Logo className="relative h-10 w-10 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl font-headline bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                    TalantaTrack
                  </span>
                  <p className="text-sm text-gray-400">The Ultimate Football Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-8 max-w-md">
                Empowering football players, coaches, and scouts worldwide with cutting-edge technology and comprehensive football management solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-gray-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-gray-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-gray-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-gray-300">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-gray-300">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {[
              {
                title: 'Platform',
                items: ['Features', 'Pricing', 'API', 'Status', 'Free Trial']
              },
              {
                title: 'Company',
                items: ['About', 'Careers', 'Press', 'Partners', 'Contact']
              },
              {
                title: 'Resources',
                items: ['Blog', 'Events', 'Help Center', 'Community', 'Documentation']
              }
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6 text-white">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item}>
                      <a 
                        href="#" 
                        className="text-gray-400 hover:text-green-500 transition-colors hover:pl-2 block transition-all"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} TalantaTrack. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-400 hover:text-green-500 transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-green-500 transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-400 hover:text-green-500 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}