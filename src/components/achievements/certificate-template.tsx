'use client';

import Image from 'next/image';
import { Logo } from '@/components/icons';

interface CertificateTemplateProps {
    playerName: string;
    moduleName: string;
}

export function CertificateTemplate({ playerName, moduleName }: CertificateTemplateProps) {
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=player:${playerName}-module:${moduleName}`;

  return (
    <div className="bg-background p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-4xl mx-auto p-8 border-4 border-primary bg-card text-card-foreground rounded-lg shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-5" style={{backgroundImage: 'url(/images/certificate-bg.svg)'}}></div>
            
            <div className="relative text-center space-y-6">
                <div className="flex justify-center">
                    <Logo className="h-20 w-20" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold font-headline text-primary">Certificate of Achievement</h1>
                    <p className="text-muted-foreground text-lg">This certificate is proudly presented to</p>
                </div>

                <h2 className="text-5xl font-bold font-headline">{playerName}</h2>
                
                <p className="text-muted-foreground text-lg">for successfully completing the training module</p>
                
                <h3 className="text-3xl font-semibold text-accent">{moduleName}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-end">
                    <div className="flex flex-col items-center">
                        <p className="font-bold">John Omondi</p>
                        <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">Head Coach</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="font-bold">{issueDate}</p>
                         <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">Date of Issue</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="font-bold">Esther Chepkoech</p>
                         <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">Academy Director</p>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 flex items-center gap-4">
                    <div className="text-left text-xs text-muted-foreground">
                        <p className="font-bold text-card-foreground">TalantaTrack Academy</p>
                        <p>123 Football Lane, Nairobi, Kenya</p>
                        <p>+254 700 000 000</p>
                    </div>
                     <Image
                        src={qrCodeUrl}
                        width={80}
                        height={80}
                        alt="Certificate QR Code"
                    />
                </div>
            </div>
        </div>
    </div>
  );
}
