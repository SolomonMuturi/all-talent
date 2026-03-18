'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="mb-8 text-gray-300 hover:text-white"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Video player */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Platform Demo
            </h1>
            <p className="text-xl text-gray-300">
              See TalantaTrack in action
            </p>
          </div>

          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video
              src="/videos/demo.mp4"
              controls
              autoPlay
              className="w-full h-full"
              poster="/images/video-poster.jpg" // Optional: add a poster image
            >
              Your browser does not support the video tag.
              <a href="/videos/demo.mp4">Download the video</a>
            </video>
          </div>

          {/* Video details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-green-400">Player Profiles</h3>
              <p className="text-gray-300">Dynamic profiles with stats and highlights</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Match Analysis</h3>
              <p className="text-gray-300">AI-powered performance analytics</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-purple-400">Scouting Tools</h3>
              <p className="text-gray-300">Advanced tools for talent identification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}