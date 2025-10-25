import { CertificateTemplate } from "@/components/achievements/certificate-template";
import { notFound } from "next/navigation";

export default function CertificatePage({ params }: { params: { player: string, module: string } }) {
    if (!params.player || !params.module) {
        notFound();
    }
    
    const playerName = decodeURIComponent(params.player);
    const moduleName = decodeURIComponent(params.module);

    return <CertificateTemplate playerName={playerName} moduleName={moduleName} />;
}
