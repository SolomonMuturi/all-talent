'use client';

import { AcademyEvent } from "@/lib/data";
import { Badge } from "../ui/badge";

interface TeamFormationProps {
    lineup: AcademyEvent['details']['lineup'];
}

const PlayerMarker = ({ number, name }: { number: number, name: string }) => (
    <div className="flex flex-col items-center group cursor-pointer">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm border-2 border-primary-foreground shadow-md group-hover:scale-110 transition-transform">
            {number}
        </div>
        <div className="text-xs font-semibold mt-1 bg-black/50 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {name}
        </div>
    </div>
);

export function TeamFormation({ lineup }: TeamFormationProps) {
    if (!lineup) {
        return null;
    }
    
    const { formation, squad } = lineup;

    const goalkeepers = squad.filter(p => p.position === 'Goalkeeper');
    const defenders = squad.filter(p => p.position === 'Defender');
    const midfielders = squad.filter(p => p.position === 'Midfielder');
    const forwards = squad.filter(p => p.position === 'Forward');

    return (
        <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-center items-center mb-4">
                <Badge variant="secondary" className="text-base">Formation: {formation}</Badge>
            </div>
            <div className="relative aspect-[7/5] bg-green-600/80 rounded-lg overflow-hidden border-4 border-green-400/50">
                {/* Pitch markings */}
                <div className="absolute inset-0 border-[3px] border-green-400/50"></div>
                <div className="absolute top-1/2 left-0 w-full h-[3px] bg-green-400/50 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-[3px] border-green-400/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Goal Areas */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-16 border-y-[3px] border-r-[3px] border-green-400/50 rounded-r-lg"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/5 w-8 border-y-[3px] border-r-[3px] border-green-400/50 rounded-r-lg"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3/5 w-16 border-y-[3px] border-l-[3px] border-green-400/50 rounded-l-lg"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2/5 w-8 border-y-[3px] border-l-[3px] border-green-400/50 rounded-l-lg"></div>

                <div className="relative w-full h-full z-10 flex flex-col justify-around">
                    {/* Goalkeeper */}
                    <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '8%' }}>
                         {goalkeepers.map(player => <PlayerMarker key={player.number} {...player} />)}
                    </div>
                    {/* Defenders */}
                     <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '20%'}}>
                         {defenders.map(player => <PlayerMarker key={player.number} {...player} />)}
                    </div>
                    {/* Midfielders */}
                     <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '45%', paddingRight: '15%'}}>
                         {midfielders.map(player => <PlayerMarker key={player.number} {...player} />)}
                    </div>
                     {/* Forwards */}
                     <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '70%', paddingRight: '5%'}}>
                         {forwards.map(player => <PlayerMarker key={player.number} {...player} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
