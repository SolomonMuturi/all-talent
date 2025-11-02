'use client';

import Image from 'next/image';
import { Logo } from '@/components/icons';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface CertificateTemplateProps {
    playerName: string;
    moduleName: string;
    academyName: string;
    contactInfo: string;
    signatory1Name: string;
    signatory1Title: string;
    signatory2Name: string;
    signatory2Title: string;
}

export function CertificateTemplate({ 
    playerName, 
    moduleName,
    academyName,
    contactInfo,
    signatory1Name,
    signatory1Title,
    signatory2Name,
    signatory2Title,
}: CertificateTemplateProps) {
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verificationData = `Player: ${playerName}, Module: ${moduleName}, Date: ${issueDate}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationData)}`;

  const handleDownload = () => {
    const filename = `Certificate-${playerName.replace(/\s+/g, '_')}-${moduleName.replace(/\s+/g, '_')}.pdf`;
    document.title = filename;
    window.print();
  }

  return (
    <>
    <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact; /* Chrome, Safari */
            color-adjust: exact; /* Firefox */
          }
          .no-print {
            display: none;
          }
          #certificate-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 100%;
            padding: 0;
            border: none;
            box-shadow: none;
            margin: 0;
          }
          .printable-content {
            border: 10px solid hsl(var(--primary)) !important;
            background-color: hsl(var(--card)) !important;
            color: hsl(var(--card-foreground)) !important;
          }
        }
      `}</style>
      <div className="absolute top-4 right-4 no-print">
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
      </div>
      <div id="certificate-to-print" className="bg-background p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)] print:p-0">
        <div className="w-full max-w-4xl mx-auto p-8 border-4 border-primary bg-card text-card-foreground rounded-lg shadow-2xl relative overflow-hidden printable-content">
            
            <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-5" style={{backgroundImage: 'url(/images/certificate-bg.svg)'}}></div>
            
            <div className="relative text-center space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 text-left">
                        <Logo className="h-20 w-20 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                            <p className="font-bold text-card-foreground text-sm">{academyName}</p>
                            {contactInfo.split('|').map(info => <p key={info}>{info.trim()}</p>)}
                        </div>
                    </div>
                    <Image
                        src={qrCodeUrl}
                        width={80}
                        height={80}
                        alt="Certificate QR Code"
                    />
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
                        <p className="font-bold">{signatory1Name}</p>
                        <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">{signatory1Title}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="font-bold">{issueDate}</p>
                         <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">Date of Issue</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="font-bold">{signatory2Name}</p>
                         <hr className="w-full border-t border-muted-foreground my-1" />
                        <p className="text-sm text-muted-foreground">{signatory2Title}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}
