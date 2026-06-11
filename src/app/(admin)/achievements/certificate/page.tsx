'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
            print-color-adjust: exact;
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
          img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="absolute top-4 right-4 no-print z-20">
        <Button onClick={handleDownload} className="shadow-lg">
          <Download className="mr-2 h-4 w-4"/> Download PDF
        </Button>
      </div>
      <div id="certificate-to-print" className="bg-background p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)] print:p-0">
        <div className="w-full max-w-4xl mx-auto p-8 border-4 border-primary bg-white text-black rounded-lg shadow-2xl relative overflow-hidden printable-content">
          
          <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-5" style={{backgroundImage: 'url(/images/certificate-bg.svg)'}}></div>
          
          <div className="relative text-center space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4 text-left">
                <div className="h-20 w-20 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">TT</span>
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-bold text-black text-sm">{academyName}</p>
                  {contactInfo.split('|').map((info, index) => (
                    <p key={index}>{info.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center">
                <div className="text-xs text-center">
                  <img 
                    src={qrCodeUrl}
                    alt="Verification QR Code"
                    className="w-20 h-20 mx-auto mb-1 border border-gray-300 rounded-lg"
                    width="150"
                    height="150"
                  />
                  <span className="text-gray-600 text-xs">Scan to verify</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">Certificate of Achievement</h1>
              <p className="text-gray-600 text-lg">This certificate is proudly presented to</p>
            </div>

            <h2 className="text-5xl font-bold border-b-2 border-primary pb-4 inline-block px-8">{playerName}</h2>
            
            <p className="text-gray-600 text-lg">for successfully completing the training module</p>
            
            <h3 className="text-3xl font-semibold italic border-t-2 border-b-2 border-accent py-4 inline-block px-8">{moduleName}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-end">
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg">{signatory1Name}</p>
                <hr className="w-full border-t-2 border-gray-400 my-1" />
                <p className="text-sm text-gray-600">{signatory1Title}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg">{issueDate}</p>
                <hr className="w-full border-t-2 border-gray-400 my-1" />
                <p className="text-sm text-gray-600">Date of Issue</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-lg">{signatory2Name}</p>
                <hr className="w-full border-t-2 border-gray-400 my-1" />
                <p className="text-sm text-gray-600">{signatory2Title}</p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="pt-8 mt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Certificate ID: {`${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This certificate can be verified by scanning the QR code above
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
  
  // Get parameters from URL
  const playerName = searchParams.get('playerName') || 'Player Name';
  const moduleName = searchParams.get('moduleName') || 'Training Module';
  const academyName = searchParams.get('academyName') || 'TalantaTrack Academy';
  const contactInfo = searchParams.get('contactInfo') || '123 Football Lane, Nairobi, Kenya | +254 700 000 000 | info@talantatrack.com';
  const signatory1Name = searchParams.get('s1Name') || 'John Omondi';
  const signatory1Title = searchParams.get('s1Title') || 'Head Coach';
  const signatory2Name = searchParams.get('s2Name') || 'Esther Chepkoech';
  const signatory2Title = searchParams.get('s2Title') || 'Academy Director';

  // Decode URL parameters (important for special characters)
  const decodedPlayerName = decodeURIComponent(playerName);
  const decodedModuleName = decodeURIComponent(moduleName);
  const decodedAcademyName = decodeURIComponent(academyName);
  const decodedContactInfo = decodeURIComponent(contactInfo);
  const decodedSignatory1Name = decodeURIComponent(signatory1Name);
  const decodedSignatory1Title = decodeURIComponent(signatory1Title);
  const decodedSignatory2Name = decodeURIComponent(signatory2Name);
  const decodedSignatory2Title = decodeURIComponent(signatory2Title);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4 z-20 no-print">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/achievements')}
          className="bg-white shadow-lg hover:bg-gray-50"
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700 mb-4">Loading certificate...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CertificatePageContent />
    </Suspense>
  );
}