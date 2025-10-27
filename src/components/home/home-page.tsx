'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowRight, BarChart, ShieldCheck, Users } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const heroImages = [
  { src: 'https://picsum.photos/seed/nairobi1/1800/1200', hint: 'Nairobi skyline' },
  { src: 'https://picsum.photos/seed/nairobi2/1800/1200', hint: 'Nairobi park' },
  { src: 'https://picsum.photos/seed/nairobi3/1800/1200', hint: 'Nairobi street' },
  { src: 'https://picsum.photos/seed/nairobi4/1800/1200', hint: 'Nairobi market' },
];

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-8 flex items-center">
            <Logo className="h-8 w-8 mr-2 text-primary" />
            <span className="font-bold text-lg font-headline">TalantaTrack</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/#features"
              className="transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="/#testimonials"
              className="transition-colors hover:text-primary"
            >
              Testimonials
            </Link>
             <Link
              href="/blog"
              className="transition-colors hover:text-primary"
            >
              Blog
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-4">
             <Button variant="ghost" asChild>
                <Link href="/dashboard">Admin Login</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/book-ticket">Book Tickets</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center">
            <Carousel 
              opts={{ loop: true }} 
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]} 
              className="absolute inset-0 w-full h-full"
            >
              <CarouselContent>
                {heroImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={image.src}
                      alt={`Hero image ${index + 1}`}
                      fill
                      className="object-cover object-center brightness-50"
                      data-ai-hint={image.hint}
                      priority={index === 0}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="relative z-10 container px-4 md:px-6">
                <div className="flex flex-col justify-center items-center space-y-6">
                    <h1 className="text-4xl font-extrabold font-headline tracking-tighter sm:text-6xl xl:text-7xl/none text-white">
                        Unleash Your Football Potential
                    </h1>
                    <p className="max-w-[700px] text-lg text-gray-200 md:text-xl">
                        TalantaTrack is the ultimate platform for football academies, players, and scouts to connect, develop, and succeed.
                    </p>
                    <div className="flex flex-col gap-4 min-[400px]:flex-row">
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href="/dashboard">
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                            <Link href="/#features">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">The Global Stage For Your Talent</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A comprehensive toolkit for every stakeholder in the beautiful game.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline">For Players</h3>
                <p className="text-sm text-muted-foreground">Build your profile, track your performance with GPS data, and get discovered by scouts worldwide.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                   <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline">For Academies</h3>
                <p className="text-sm text-muted-foreground">Manage your players, automate finances with M-Pesa, and gain AI-powered insights into your operations.</p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline">For Scouts</h3>
                <p className="text-sm text-muted-foreground">Access a verified database of emerging talent with objective performance data and comprehensive profiles.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight">
                Trusted by the Football Community
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear what directors, coaches, and managers are saying about their experience with TalantaTrack.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              <Card className="bg-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t1/100/100" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-left">John Doe</p>
                            <p className="text-xs text-left text-muted-foreground">Director, Future Stars Academy</p>
                        </div>
                    </div>
                    <blockquote className="text-sm text-muted-foreground text-left italic">"TalantaTrack has transformed our operations. The ability to manage everything from a single dashboard is a game-changer."</blockquote>
                </CardContent>
              </Card>
               <Card className="bg-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t2/100/100" />
                            <AvatarFallback>JO</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-left">Jane Omondi</p>
                            <p className="text-xs text-left text-muted-foreground">Head Coach, Elite FC Youth</p>
                        </div>
                    </div>
                    <blockquote className="text-sm text-muted-foreground text-left italic">"The performance tracking and AI insights are incredible. We're making smarter decisions and seeing real results on the pitch."</blockquote>
                </CardContent>
              </Card>
               <Card className="bg-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t3/100/100" />
                            <AvatarFallback>SK</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-left">Samuel Kamau</p>
                            <p className="text-xs text-left text-muted-foreground">Finance Manager, Nairobi United</p>
                        </div>
                    </div>
                    <blockquote className="text-sm text-muted-foreground text-left italic">"The financial automation features, especially M-Pesa integration, have saved us countless hours of administrative work."</blockquote>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
       <footer className="w-full border-t border-border/40">
         <div className="container flex flex-col gap-4 sm:flex-row py-6 shrink-0 items-center px-4 md:px-6">
            <p className="text-sm text-muted-foreground">&copy; 2024 TalantaTrack Inc. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                Privacy
            </Link>
            </nav>
         </div>
      </footer>
    </div>
  );
}

    