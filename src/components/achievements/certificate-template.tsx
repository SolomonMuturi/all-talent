'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// TEMPORARY INLINE CERTIFICATE TEMPLATE COMPONENT
function CertificateTemplate({ 
  playerName, 
  moduleName,
  academyName,
  contactInfo,
  signatory1Name,
  signatory1Title,
  signatory2Name,
  signatory2Title,
}: {
  playerName: string;
  moduleName: string;
  academyName: string;
  contactInfo: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
}) {
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
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
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
            border: 10px solid #000 !important;
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>
      <div className="absolute top-4 right-4 no-print">
        <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
      </div>
      <div id="certificate-to-print" className="bg-background p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)] print:p-0">
        <div className="w-full max-w-4xl mx-auto p-8 border-4 border-primary bg-white text-black rounded-lg shadow-2xl relative overflow-hidden printable-content">
          
          {/* Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
          </div>
          
          <div className="relative text-center space-y-8">
            {/* Header with logo and QR code */}
            <div className="flex justify-between items-start border-b pb-6">
              <div className="flex items-center gap-4 text-left">
                {/* Academy Logo */}
                <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">TT</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-bold text-black text-lg mb-1">{academyName}</p>
                  {contactInfo.split('|').map((info, index) => (
                    <p key={index} className="leading-tight">{info.trim()}</p>
                  ))}
                </div>
              </div>
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">✓</div>
                    <div className="text-xs text-gray-600">Scan to verify</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Certificate ID: {Date.now().toString().slice(-8)}</p>
              </div>
            </div>
            
            {/* Main content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-primary uppercase tracking-wider">Certificate of Achievement</h1>
                <p className="text-gray-600 text-xl italic">This certificate is proudly awarded to</p>
              </div>

              <div className="py-4 border-y-2 border-primary">
                <h2 className="text-5xl font-bold font-serif text-gray-900">{playerName}</h2>
              </div>
              
              <p className="text-gray-700 text-xl">for successfully completing the training module</p>
              
              <div className="py-4">
                <h3 className="text-3xl font-semibold italic text-accent bg-gray-50 py-3 px-6 rounded-lg inline-block">
                  "{moduleName}"
                </h3>
              </div>
              
              <p className="text-gray-600">Awarded on {issueDate}</p>
            </div>
            
            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 mt-8 border-t">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <div className="h-1 w-24 bg-gray-400 mx-auto"></div>
                </div>
                <p className="font-bold text-lg text-gray-900">{signatory1Name}</p>
                <p className="text-sm text-gray-600 mt-1">{signatory1Title}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <div className="h-1 w-24 bg-gray-400 mx-auto"></div>
                </div>
                <p className="font-bold text-lg text-gray-900">Date of Issue</p>
                <p className="text-sm text-gray-600 mt-1">{issueDate}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <div className="h-1 w-24 bg-gray-400 mx-auto"></div>
                </div>
                <p className="font-bold text-lg text-gray-900">{signatory2Name}</p>
                <p className="text-sm text-gray-600 mt-1">{signatory2Title}</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-8 mt-8 border-t text-xs text-gray-500">
              <p>This certificate verifies that the named individual has successfully completed the specified training module.</p>
              <p className="mt-1">Certificate ID: CERT-{Date.now().toString().slice(-6)} | Issued by: {academyName}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main page component
function CertificatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL and decode them
  const playerName = searchParams.get('playerName') || 'Player Name';
  const moduleName = searchParams.get('moduleName') || 'Training Module';
  const academyName = searchParams.get('academyName') || 'TalantaTrack Academy';
  const contactInfo = searchParams.get('contactInfo') || '123 Football Lane, Nairobi, Kenya | +254 700 000 000';
  const signatory1Name = searchParams.get('s1Name') || 'John Omondi';
  const signatory1Title = searchParams.get('s1Title') || 'Head Coach';
  const signatory2Name = searchParams.get('s2Name') || 'Esther Chepkoech';
  const signatory2Title = searchParams.get('s2Title') || 'Academy Director';

  // Decode URL parameters
  const decodedPlayerName = decodeURIComponent(playerName);
  const decodedModuleName = decodeURIComponent(moduleName);
  const decodedAcademyName = decodeURIComponent(academyName);
  const decodedContactInfo = decodeURIComponent(contactInfo);
  const decodedSignatory1Name = decodeURIComponent(signatory1Name);
  const decodedSignatory1Title = decodeURIComponent(signatory1Title);
  const decodedSignatory2Name = decodeURIComponent(signatory2Name);
  const decodedSignatory2Title = decodeURIComponent(signatory2Title);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-10 no-print">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/achievements')}
          className="bg-white shadow-md"
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

// Export the main page with Suspense
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