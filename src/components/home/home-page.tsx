'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowRight, BarChart, ShieldCheck, Users, Trophy, Globe, Calendar, Newspaper, Star, Goal, MapPin, User, Sparkles, Target, TrendingUp, Award, Heart, Zap, Clock, Shield, Video, Mic, Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useState, useEffect } from 'react';

// Import blog and event components
import { BlogList } from '@/components/blog/blog-list';
import { EventList } from '@/components/events/event-list';

// Hero images with sports themes
const heroImages = [
  { src: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1920&q=80', hint: 'Football match action' },
  { src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80', hint: 'Basketball dunk' },
  { src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80', hint: 'Tennis serve' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80', hint: 'Athletics track' },
  { src: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1920&q=80', hint: 'Swimming competition' },
];

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
  
  return <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{count.toLocaleString()}+</span>;
}

export function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dummy data for blogs and events
  const blogs = [
    {
      id: '1',
      title: 'How to Train Like a Pro',
      summary: 'Discover the secrets of professional football training and how you can apply them to your daily routine.',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      author: 'Coach Jane',
      date: '2024-06-01',
      category: 'Training',
      readTime: '5 min',
    },
    {
      id: '2',
      title: 'Nutrition for Young Athletes',
      summary: 'A comprehensive guide to fueling your body for peak performance on and off the pitch.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      author: 'Nutritionist Sam',
      date: '2024-05-20',
      category: 'Nutrition',
      readTime: '7 min',
    },
    {
      id: '3',
      title: 'The Rise of Women’s Football',
      summary: 'Explore the growth and impact of women’s football globally and locally.',
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
      title: 'U-17 Regional Finals',
      date: '2024-07-28',
      location: 'Kasarani Stadium',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      description: 'The best U-17 teams compete for the regional trophy.',
      category: 'Football',
      price: 'Free',
    },
    {
      id: '2',
      title: 'Annual Coaches Conference',
      date: '2024-08-15',
      location: 'Nairobi Conference Center',
      image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1200&q=80',
      description: 'A gathering of top coaches to share strategies and insights.',
      category: 'Workshop',
      price: '$199',
    },
    {
      id: '3',
      title: 'Talent Identification Camp',
      date: '2024-09-05',
      location: 'Mombasa Sports Complex',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      description: 'Scouts and coaches search for the next football stars.',
      category: 'Scouting',
      price: '$49',
    },
  ];

  const sports = [
    { name: 'Football', icon: '⚽', count: '15,240' },
    { name: 'Basketball', icon: '🏀', count: '8,750' },
    { name: 'Tennis', icon: '🎾', count: '5,430' },
    { name: 'Athletics', icon: '🏃', count: '12,890' },
    { name: 'Swimming', icon: '🏊', count: '4,210' },
    { name: 'Volleyball', icon: '🏐', count: '3,540' },
  ];

  const testimonials = [
    {
      name: 'Alex Rodriguez',
      role: 'Professional Scout',
      content: 'TalantaTrack has revolutionized how we discover talent. The analytics are game-changing!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      name: 'Sarah Johnson',
      role: 'Academy Director',
      content: 'Managing our academy has never been easier. The platform is intuitive and powerful.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
      rating: 5,
    },
    {
      name: 'Marcus Lee',
      role: 'Professional Athlete',
      content: 'This platform helped me get discovered. The exposure to scouts worldwide is incredible.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w-400&q=80',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-background via-background to-card/30 text-foreground overflow-x-hidden">
      {/* Header with parallax effect */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 100 
            ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-70 animate-pulse"></div>
                <Logo className="relative h-10 w-10 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TalantaTrack
                </span>
                <p className="text-xs text-muted-foreground">Elevating Sports Excellence</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">Home</a>
              <a href="#features" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">Features</a>
              <a href="#sports" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">Sports</a>
              <a href="#events" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">Events</a>
              <a href="#blogs" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">Blog</a>
              <a href="#about" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">About</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/login">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <a href="#join">
                  <Zap className="h-4 w-4 mr-2" />
                  Join Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Viewport Height */}
      <main className="flex-1 w-full" id="home">
        <section className="relative w-full min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-background/20 z-10" />
          <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
            className="absolute inset-0 w-full h-full"
          >
            <CarouselContent>
              {heroImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={image.src}
                    alt={`Hero image ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    data-ai-hint={image.hint}
                    priority={index === 0}
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          <div className="relative z-20 w-full flex items-center justify-center min-h-screen">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-12 px-4 md:px-8">
              <div className="inline-flex items-center space-x-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  The Future of Sports
                </span>
              </div>
              
              <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter leading-tight mb-4">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient block">
                  Elevate Your Game
                </span>
                <span className="block text-white drop-shadow-2xl mt-2">With TalantaTrack</span>
              </h1>
              
              <p className="text-center text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
                Join the world&apos;s largest sports ecosystem connecting 
                <span className="font-bold text-white"> athletes, coaches, scouts, </span>
                and
                <span className="font-bold text-white"> fans </span>
                through cutting-edge technology and analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-14 w-full justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group w-full sm:w-auto"
                >
                  <Link href="/join">
                    Start Free Trial
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-black text-lg px-10 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                >
                  <a href="#features">
                    <Video className="mr-3 h-6 w-6" />
                    Watch Demo
                  </a>
                </Button>
              </div>
              
              {/* Stats Row - Responsive and Centered */}
              <div className="w-full flex flex-col sm:flex-row flex-wrap items-center justify-center gap-8 mt-4">
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={50} duration={2500} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-primary mb-1">K+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Active Athletes</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={5} duration={2000} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-primary mb-1">K+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Professional Clubs</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={120} duration={3000} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-primary mb-1">+</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Countries</p>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-[180px]">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      <Counter end={98} duration={1800} />
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-primary mb-1">%</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 uppercase tracking-wider mt-2">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* Sports Categories */}
        <section id="sports" className="w-full py-24 min-h-screen bg-gradient-to-b from-background to-card/20 flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-3 mb-4">
                <Target className="h-6 w-6 text-primary inline mr-2" />
                <span className="text-lg font-semibold text-primary">Multi-Sport Platform</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                All Sports, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">One Platform</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From grassroots to professional leagues, we cover every sport with dedicated tools and features
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
              {sports.map((sport, index) => (
                <div 
                  key={index}
                  className="group relative bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 text-center hover:bg-card hover:border-primary/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                    {sport.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{sport.name}</h3>
                  <p className="text-lg font-semibold text-primary">{sport.count} Players</p>
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 min-h-screen bg-gradient-to-b from-card/20 to-background relative overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-primary uppercase tracking-wider">
                  Why Choose TalantaTrack
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                Comprehensive <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sports Ecosystem</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {[
                {
                  icon: <Users className="h-12 w-12" />,
                  title: "Smart Player Profiles",
                  description: "Dynamic profiles with performance analytics, video highlights, and real-time stats",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: <BarChart className="h-12 w-12" />,
                  title: "AI-Powered Analytics",
                  description: "Advanced analytics and predictive insights for performance optimization",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: <ShieldCheck className="h-12 w-12" />,
                  title: "Verified Scouting Network",
                  description: "Connect with certified scouts and clubs worldwide",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: <Trophy className="h-12 w-12" />,
                  title: "Tournament Management",
                  description: "End-to-end tournament organization with live scoring and streaming",
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  icon: <Goal className="h-12 w-12" />,
                  title: "Training Programs",
                  description: "Personalized training plans with progress tracking",
                  gradient: "from-red-500 to-rose-500",
                },
                {
                  icon: <Globe className="h-12 w-12" />,
                  title: "Global Community",
                  description: "Connect with athletes, coaches, and fans worldwide",
                  gradient: "from-indigo-500 to-blue-500",
                },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-card/80 backdrop-blur-sm border border-border/30 rounded-3xl p-8 hover:shadow-2xl hover:border-transparent transition-all duration-500 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <div className={`relative mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10`}>
                    <div className={`text-gradient bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 relative">{feature.title}</h3>
                  <p className="text-muted-foreground relative">{feature.description}</p>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="w-full py-24 min-h-screen bg-gradient-to-b from-background via-card/10 to-background flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <div className="inline-flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold text-primary uppercase tracking-wider">
                    Upcoming Events
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                  Don&apos;t Miss The <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Action</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join world-class tournaments, workshops, and scouting events across all sports
                </p>
                <Button size="lg" className="rounded-xl px-8 py-6 text-lg">
                  <Calendar className="mr-3 h-5 w-5" />
                  View All Events
                </Button>
              </div>
              
              <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                {events.map((event, index) => (
                  <Card 
                    key={event.id} 
                    className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {event.price}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                          Register Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blogs" className="w-full py-24 min-h-screen bg-gradient-to-b from-card/20 to-background flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Newspaper className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary uppercase tracking-wider">
                  Latest Insights
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                Sports <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Intelligence</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {blogs.map((blog) => (
                <article 
                  key={blog.id}
                  className="group bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:scale-105"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {blog.category}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-background/90 text-foreground px-3 py-1 rounded-full text-xs">
                      {blog.readTime} read
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{blog.author}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{blog.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{blog.summary}</p>
                    <Button variant="ghost" className="group-hover:text-primary p-0">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="text-center">
              <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-lg">
                <Newspaper className="mr-3 h-5 w-5" />
                View All Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-24 min-h-screen bg-gradient-to-b from-background to-card/20 flex items-center">
          <div className="container mx-auto px-4 md:px-8 w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary uppercase tracking-wider">
                  Trusted By Champions
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
                What The <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pros Say</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-lg italic text-muted-foreground mb-8">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-primary">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-32 min-h-screen relative overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 mb-6">
                <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                <span className="text-xl font-semibold text-primary uppercase tracking-wider">
                  Ready to Transform Your Sports Journey?
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-8">
                Join <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">50,000+</span> Athletes Worldwide
              </h2>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required. Experience the future of sports management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white text-lg px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-12 py-7 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all"
                >
                  <Mic className="mr-3 h-6 w-6" />
                  Book a Demo
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-8">
                Trusted by top academies, professional clubs, and national federations
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur"></div>
                  <Logo className="relative h-10 w-10 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    TalantaTrack
                  </span>
                  <p className="text-sm text-muted-foreground">The Ultimate Sports Platform</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-8 max-w-md">
                Empowering athletes, coaches, and scouts worldwide with cutting-edge technology and comprehensive sports management solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-background rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {['Platform', 'Company', 'Resources', 'Legal'].map((section) => (
              <div key={section}>
                <h3 className="font-bold text-lg mb-6">{section}</h3>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'API', 'Status'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} TalantaTrack. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}