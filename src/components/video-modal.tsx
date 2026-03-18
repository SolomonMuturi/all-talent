'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>

        {/* Video container */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full h-full object-contain"
            style={{ maxHeight: '80vh' }}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Optional: Video info */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            TalantaTrack Platform Demo
          </h3>
          <p className="text-gray-300">
            Watch how TalantaTrack revolutionizes football talent management
          </p>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}