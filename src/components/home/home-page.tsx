'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Logo className="h-8 w-8 mr-2" />
            <span className="font-bold font-headline">TalantaTrack</span>
          </div>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="/#testimonials"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Testimonials
            </Link>
            <Link
              href="/#pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2">
             <Button variant="ghost" asChild>
                <Link href="/dashboard">Admin Login</Link>
            </Button>
            <Button asChild>
                <Link href="/book-ticket">Book Tickets</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                src="https://picsum.photos/seed/hero/1200/800"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                width="600"
                height="600"
                data-ai-hint="football academy action"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Complete Platform for Modern Football Academies
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    TalantaTrack provides an all-in-one solution to manage players, finances, and operations, empowering academies to nurture the next generation of stars.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/dashboard">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/#features">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From player development to financial automation, we've got you covered. Focus on what matters most: developing talent.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                    <CardTitle>Player Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Track player performance, attendance, biometrics, and disciplinary records with detailed player profiles.</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Financial Automation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Manage fees, expenses, and payroll with integrated M-Pesa payments and automated reporting.</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Utilize AI for fraud detection and automated report summaries to make data-driven decisions.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight">
                Trusted by Top Academies
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See what academy directors and coaches are saying about TalantaTrack.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
              <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t1/100/100" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">John Doe</p>
                            <p className="text-xs text-muted-foreground">Director, Future Stars Academy</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">"TalantaTrack has transformed our operations. The ability to manage everything from a single dashboard is a game-changer."</p>
                </CardContent>
              </Card>
               <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t2/100/100" />
                            <AvatarFallback>JO</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Jane Omondi</p>
                            <p className="text-xs text-muted-foreground">Head Coach, Elite FC Youth</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">"The performance tracking and AI insights are incredible. We're making smarter decisions and seeing real results on the pitch."</p>
                </CardContent>
              </Card>
               <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/t3/100/100" />
                            <AvatarFallback>SK</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Samuel Kamau</p>
                            <p className="text-xs text-muted-foreground">Finance Manager, Nairobi United</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">"The financial automation features, especially M-Pesa integration, have saved us countless hours of administrative work."</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TalantaTrack Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
