// app/(admin)/achievements/certificate/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AchievementData {
  achievement: string;
  module: string;
  date: string;
  description?: string | null;
}

function CertificateTemplate({ 
  playerName, 
  achievements,
  achievementCount,
  academyName,
  contactInfo,
  signatory1Name,
  signatory1Title,
  signatory2Name,
  signatory2Title,
}: {
  playerName: string;
  achievements: AchievementData[];
  achievementCount: number;
  academyName: string;
  contactInfo: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
}) {
  const [certificateId, setCertificateId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    setCertificateId(id);

    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setIssueDate(date);

    const verificationData = `Player: ${playerName}, Achievements: ${achievementCount}, ID: ${id}, Date: ${date}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationData)}`;
    setQrCodeUrl(qrUrl);
  }, [playerName, achievementCount]);

  const handleDownload = () => {
    const filename = `Certificate-${playerName.replace(/\s+/g, '_')}.pdf`;
    document.title = filename;
    window.print();
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background-color: #1a1a2e !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
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
            border: 10px solid #4f46e5 !important;
            background-color: #1a1a2e !important;
            color: #e2e8f0 !important;
          }
          .printable-content h1,
          .printable-content h2,
          .printable-content h3,
          .printable-content p,
          .printable-content .text-gray-600,
          .printable-content .text-gray-500,
          .printable-content .text-gray-700,
          .printable-content .text-gray-800 {
            color: #e2e8f0 !important;
          }
          .printable-content .bg-gradient-to-br {
            background: #2d2d44 !important;
          }
          .printable-content .border-gray-200 {
            border-color: #3d3d5c !important;
          }
          .printable-content .bg-white {
            background-color: #1a1a2e !important;
          }
          .printable-content .border-primary {
            border-color: #4f46e5 !important;
          }
          .printable-content hr {
            border-color: #3d3d5c !important;
          }
          img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .achievement-list {
            page-break-inside: avoid;
          }
          .watermark {
            opacity: 0.08 !important;
          }
        }
      `}</style>
      
      <div className="absolute top-4 right-4 no-print z-20">
        <Button onClick={handleDownload} className="shadow-lg bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4"/> Download PDF
        </Button>
      </div>
      
      <div id="certificate-to-print" className="bg-[#1a1a2e] p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)] print:p-0">
        <div className="w-full max-w-4xl mx-auto p-8 border-4 border-primary bg-[#1a1a2e] text-gray-200 rounded-lg shadow-2xl relative overflow-hidden printable-content">
          
          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none watermark">
            <div className="text-9xl font-bold text-white opacity-[0.04] transform -rotate-12 select-none">
              {academyName}
            </div>
          </div>
          
          {/* Second Watermark - Certificate */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none watermark">
            <div className="text-8xl font-bold text-white opacity-[0.03] transform rotate-12 select-none tracking-widest">
              CERTIFICATE
            </div>
          </div>
          
          {/* Third Watermark - Shield Pattern */}
          <div className="absolute inset-0 pointer-events-none watermark">
            <div className="absolute top-1/4 left-1/4 text-white opacity-[0.02] text-7xl transform -rotate-12">
              ✦ ✦ ✦
            </div>
            <div className="absolute bottom-1/4 right-1/4 text-white opacity-[0.02] text-7xl transform rotate-12">
              ✦ ✦ ✦
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-5" style={{backgroundImage: 'url(/images/certificate-bg.svg)'}}></div>
          
          <div className="relative text-center space-y-6">
            {/* Header with Logo and Academy Info */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4 text-left">
                <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">TT</span>
                </div>
                <div className="text-xs text-gray-400">
                  <p className="font-bold text-gray-200 text-sm">{academyName}</p>
                  {contactInfo.split('|').map((info, index) => (
                    <p key={index}>{info.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center">
                <div className="text-xs text-center">
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl}
                      alt="Verification QR Code"
                      className="w-20 h-20 mx-auto mb-1 border border-gray-700 rounded-lg bg-white p-1"
                      width="150"
                      height="150"
                    />
                  )}
                  <span className="text-gray-400 text-xs">Scan to verify</span>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">Certificate of Achievement</h1>
              <p className="text-gray-400 text-lg">This certificate is proudly presented to</p>
            </div>

            {/* Player Name */}
            <h2 className="text-5xl font-bold border-b-2 border-primary pb-4 inline-block px-8 text-white">{playerName}</h2>
            
            {/* Achievements List */}
            <div className="mt-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-lg font-medium">
                  For achieving the following accomplishments:
                </p>
                <Badge variant="secondary" className="text-sm bg-primary/20 text-primary border-primary/30">
                  {achievementCount} Achievement{achievementCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="bg-[#2d2d44] rounded-lg p-6 border border-gray-700 achievement-list relative">
                {/* Achievement List Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <Shield className="h-32 w-32 text-white" />
                </div>
                
                {achievements.map((achievement, index) => (
                  <div key={index} className="relative">
                    {index > 0 && <Separator className="my-3 bg-gray-700" />}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-lg text-white">
                              {achievement.achievement}
                            </p>
                            <p className="text-sm text-gray-400">
                              Module: {achievement.module}
                            </p>
                            {achievement.description && (
                              <p className="text-sm text-gray-400 italic mt-1">
                                "{achievement.description}"
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs whitespace-nowrap bg-[#1a1a2e] border-gray-600 text-gray-300">
                            {new Date(achievement.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Removed duplicate badge here */}
            </div>
            
            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-end">
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg text-white">{signatory1Name}</p>
                <hr className="w-full border-t-2 border-gray-600 my-1" />
                <p className="text-sm text-gray-400">{signatory1Title}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg text-white">{issueDate || 'Date'}</p>
                <hr className="w-full border-t-2 border-gray-600 my-1" />
                <p className="text-sm text-gray-400">Date of Issue</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg text-white">{signatory2Name}</p>
                <hr className="w-full border-t-2 border-gray-600 my-1" />
                <p className="text-sm text-gray-400">{signatory2Title}</p>
              </div>
            </div>

            {/* Footer with Security Features */}
            <div className="pt-8 mt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Certificate ID: {certificateId || 'GENERATING...'}
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-xs text-gray-500">Verified</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                This certificate recognizes {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CertificatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const playerName = searchParams.get('playerName') || 'Player Name';
  const achievementsParam = searchParams.get('achievements');
  const achievementCount = parseInt(searchParams.get('achievementCount') || '0');
  const academyName = searchParams.get('academyName') || 'TalantaTrack Academy';
  const contactInfo = searchParams.get('contactInfo') || '123 Football Lane, Nairobi, Kenya | +254 700 000 000 | info@talantatrack.com';
  const signatory1Name = searchParams.get('s1Name') || 'John Omondi';
  const signatory1Title = searchParams.get('s1Title') || 'Head Coach';
  const signatory2Name = searchParams.get('s2Name') || 'Esther Chepkoech';
  const signatory2Title = searchParams.get('s2Title') || 'Academy Director';

  let achievements: AchievementData[] = [];
  try {
    if (achievementsParam) {
      achievements = JSON.parse(decodeURIComponent(achievementsParam));
    }
  } catch (e) {
    console.error('Failed to parse achievements:', e);
    const moduleName = searchParams.get('moduleName');
    const achievementType = searchParams.get('achievementType');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    if (moduleName) {
      achievements = [{
        achievement: achievementType || 'Certificate of Excellence',
        module: moduleName,
        date: date,
        description: null
      }];
    }
  }

  const decodedPlayerName = decodeURIComponent(playerName);
  const decodedAcademyName = decodeURIComponent(academyName);
  const decodedContactInfo = decodeURIComponent(contactInfo);
  const decodedSignatory1Name = decodeURIComponent(signatory1Name);
  const decodedSignatory1Title = decodeURIComponent(signatory1Title);
  const decodedSignatory2Name = decodeURIComponent(signatory2Name);
  const decodedSignatory2Title = decodeURIComponent(signatory2Title);

  return (
    <div className="relative min-h-screen bg-[#0f0f1a]">
      <div className="absolute top-4 left-4 z-20 no-print">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/achievements')}
          className="bg-[#1a1a2e] border-gray-700 text-gray-300 hover:bg-[#2d2d44] hover:text-white shadow-lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Achievements
        </Button>
      </div>
      <CertificateTemplate
        playerName={decodedPlayerName}
        achievements={achievements}
        achievementCount={achievementCount || achievements.length}
        academyName={decodedAcademyName}
        contactInfo={decodedContactInfo}
        signatory1Name={decodedSignatory1Name}
        signatory1Title={decodedSignatory1Title}
        signatory2Name={decodedSignatory2Name}
        signatory2Title={decodedSignatory2Title}
      />
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f1a]">
        <div className="text-lg font-medium text-gray-400 mb-4">Loading certificate...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CertificatePageContent />
    </Suspense>
  );
}