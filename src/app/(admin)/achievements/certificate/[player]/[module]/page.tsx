'use client';
import { CertificateTemplate } from "@/components/achievements/certificate-template";
import { notFound, useSearchParams } from "next/navigation";

export default function CertificatePage({ params }: { params: { player: string, module: string } }) {
    const searchParams = useSearchParams();

    if (!params.player || !params.module) {
        notFound();
    }
    
    const playerName = decodeURIComponent(params.player);
    const moduleName = decodeURIComponent(params.module);

    const brandingProps = {
        academyName: searchParams.get('academyName') || 'TalantaTrack Academy',
        contactInfo: searchParams.get('contactInfo') || '123 Football Lane, Nairobi, Kenya | +254 700 000 000',
        signatory1Name: searchParams.get('s1Name') || 'John Omondi',
        signatory1Title: searchParams.get('s1Title') || 'Head Coach',
        signatory2Name: searchParams.get('s2Name') || 'Esther Chepkoech',
        signatory2Title: searchParams.get('s2Title') || 'Academy Director',
    };

    return <CertificateTemplate playerName={playerName} moduleName={moduleName} {...brandingProps} />;
}
