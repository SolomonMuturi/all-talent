'use client';

import { CertificateTemplate } from '@/components/achievements/certificate-template';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CertificatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const playerName = searchParams.get('playerName') || 'Player Name';
  const moduleName = searchParams.get('moduleName') || 'Training Module';
  const academyName = searchParams.get('academyName') || 'TalantaTrack Academy';
  const contactInfo = searchParams.get('contactInfo') || '123 Football Lane, Nairobi, Kenya | +254 700 000 000';
  const signatory1Name = searchParams.get('s1Name') || 'John Omondi';
  const signatory1Title = searchParams.get('s1Title') || 'Head Coach';
  const signatory2Name = searchParams.get('s2Name') || 'Esther Chepkoech';
  const signatory2Title = searchParams.get('s2Title') || 'Academy Director';

  // Decode URL parameters (important!)
  const decodedPlayerName = decodeURIComponent(playerName);
  const decodedModuleName = decodeURIComponent(moduleName);
  const decodedAcademyName = decodeURIComponent(academyName);
  const decodedContactInfo = decodeURIComponent(contactInfo);
  const decodedSignatory1Name = decodeURIComponent(signatory1Name);
  const decodedSignatory1Title = decodeURIComponent(signatory1Title);
  const decodedSignatory2Name = decodeURIComponent(signatory2Name);
  const decodedSignatory2Title = decodeURIComponent(signatory2Title);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/achievements')}
          className="no-print"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Achievements
        </Button>
      </div>
      <CertificateTemplate
        playerName={decodedPlayerName}
        moduleName={decodedModuleName}
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
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-lg font-medium mb-4">Loading certificate...</div>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CertificatePageContent />
    </Suspense>
  );
}