'use client';

import Image from 'next/image';
import { Logo } from '@/components/icons';
import { Button } from '../ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketTemplateProps {
    id: string;
    event: string;
    tier: string;
    gate: string;
    date: string;
    time: string;
}

export function TicketTemplate(props: TicketTemplateProps) {
  const { toast } = useToast();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${props.id}`;

  const handleShare = async () => {
      const shareData = {
        title: `Your Ticket for ${props.event}`,
        text: `Here is your e-ticket for the ${props.event}. Ticket ID: ${props.id}`,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Error sharing:', err);
          // Fallback to copy link if user cancels share dialog
          copyToClipboard();
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard();
      }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
            title: "Link Copied!",
            description: "The ticket link has been copied to your clipboard.",
        });
    }, (err) => {
        console.error('Could not copy text: ', err);
        toast({
            variant: "destructive",
            title: "Failed to Copy",
            description: "Could not copy the ticket link.",
        });
    });
  }

  return (
    <div className="bg-background p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md mx-auto p-6 border-2 border-primary bg-card text-card-foreground rounded-lg shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-5" style={{backgroundImage: 'url(/images/ticket-bg.svg)'}}></div>
            
            <div className="relative text-center space-y-4">
                <div className="flex justify-center">
                    <Logo className="h-16 w-16" />
                </div>
                
                <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">This Ticket Admits One</p>
                    <h1 className="text-2xl font-bold font-headline text-primary">{props.event}</h1>
                </div>

                <div className="flex justify-center my-4">
                    <Image
                        src={qrCodeUrl}
                        width={180}
                        height={180}
                        alt="Ticket QR Code"
                    />
                </div>

                <p className="font-mono text-muted-foreground text-sm tracking-widest">{props.id}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 text-left">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Tier</p>
                        <p className="font-bold text-lg">{props.tier}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">Gate</p>
                        <p className="font-bold text-lg">{props.gate}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground uppercase">Date</p>
                        <p className="font-bold text-lg">{props.date}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">Time</p>
                        <p className="font-bold text-lg">{props.time}</p>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleShare} className="w-full">
                        <Share2 className="mr-2 h-4 w-4"/>
                        Share Ticket
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
