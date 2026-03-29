'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Zap, Sparkles, Users, Trophy, BarChart } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "free forever",
      description: "Perfect for individual players starting their journey",
      features: [
        "Basic player profile",
        "Upload up to 5 videos",
        "Basic analytics",
        "Community access",
        "Email support"
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-gray-600 to-gray-500"
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For serious players looking to get discovered",
      features: [
        "Advanced player profile",
        "Unlimited video uploads",
        "AI match analysis",
        "Connect with scouts",
        "Priority support",
        "Tournament registration",
        "Performance tracking"
      ],
      cta: "Start Pro Trial",
      popular: true,
      gradient: "from-green-600 to-blue-600"
    },
    {
      name: "Elite",
      price: "$99",
      period: "per month",
      description: "For professional players and academies",
      features: [
        "Everything in Pro",
        "Personal scout manager",
        "Custom training plans",
        "Live match streaming",
        "API access",
        "Dedicated support",
        "Analytics dashboard",
        "Team management tools"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-purple-600 to-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold text-green-400 uppercase tracking-wider">
              Simple Pricing
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
            Choose Your <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-gray-900/80 backdrop-blur-sm border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
              plan.popular ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-gray-800'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-gray-400">/{plan.period}</span>}
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white py-6`}>
                <Link href={plan.name === "Elite" ? "/contact" : "/join"}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}