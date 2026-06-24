'use client';

import { Badge } from "@/components/ui/badge";

interface Player {
  id?: string;
  name?: string;
  position?: string;
  number?: number;
  [key: string]: any;
}

interface TeamFormationProps {
  lineup?: {
    formation?: string;
    squad?: Player[] | any;
  } | null;
}

const PlayerMarker = ({ number = 0, name = "Player" }: { number?: number, name?: string }) => (
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
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">No lineup data available.</p>
      </div>
    );
  }

  const formation = lineup.formation || '4-4-2';
  
  let squad: Player[] = [];
  try {
    if (Array.isArray(lineup.squad)) {
      squad = lineup.squad;
    } else if (lineup.squad && typeof lineup.squad === 'object') {
      squad = Object.values(lineup.squad);
    }
  } catch (error) {
    console.error('Error processing squad data:', error);
  }

  if (!Array.isArray(squad) || squad.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">No player data available for lineup.</p>
      </div>
    );
  }

  const safeFilterByPosition = (positionKeywords: string[]) => {
    return squad.filter(player => {
      if (!player || typeof player !== 'object') return false;
      
      const playerPosition = String(player.position || '').toLowerCase();
      return positionKeywords.some(keyword => 
        playerPosition.includes(keyword.toLowerCase())
      );
    });
  };

  const goalkeepers = safeFilterByPosition(['goalkeeper', 'gk', 'keeper']);
  const defenders = safeFilterByPosition(['defender', 'def', 'back', 'cb', 'rb', 'lb']);
  const midfielders = safeFilterByPosition(['midfielder', 'mid', 'cm', 'cam', 'cdm', 'lm', 'rm']);
  const forwards = safeFilterByPosition(['forward', 'striker', 'winger', 'attacker', 'fw', 'st', 'cf', 'lw', 'rw']);

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex justify-center items-center mb-4">
        <Badge variant="secondary" className="text-base">Formation: {formation}</Badge>
      </div>
      
      <div className="flex justify-center gap-4 mb-4 text-sm flex-wrap">
        <span className="text-muted-foreground">Total Players: {squad.length}</span>
        {goalkeepers.length > 0 && <span>GK: {goalkeepers.length}</span>}
        {defenders.length > 0 && <span>DEF: {defenders.length}</span>}
        {midfielders.length > 0 && <span>MID: {midfielders.length}</span>}
        {forwards.length > 0 && <span>FWD: {forwards.length}</span>}
      </div>

      {(goalkeepers.length + defenders.length + midfielders.length + forwards.length) > 0 && (
        <div className="relative aspect-[7/5] bg-green-600/80 rounded-lg overflow-hidden border-4 border-green-400/50 mb-4">
          <div className="absolute inset-0 border-[3px] border-green-400/50"></div>
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-green-400/50 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 border-[3px] border-green-400/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-16 border-y-[3px] border-r-[3px] border-green-400/50 rounded-r-lg"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/5 w-8 border-y-[3px] border-r-[3px] border-green-400/50 rounded-r-lg"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3/5 w-16 border-y-[3px] border-l-[3px] border-green-400/50 rounded-l-lg"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2/5 w-8 border-y-[3px] border-l-[3px] border-green-400/50 rounded-l-lg"></div>

          <div className="relative w-full h-full z-10 flex flex-col justify-around">
            {goalkeepers.length > 0 && (
              <div className="flex justify-center items-center" style={{ width: '100%' }}>
                {goalkeepers.map((player, index) => (
                  <div key={index} className="mx-2">
                    <PlayerMarker 
                      number={player.number || 1} 
                      name={player.name || `Player ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            {defenders.length > 0 && (
              <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '10%', paddingRight: '10%' }}>
                {defenders.map((player, index) => (
                  <div key={index} className="mx-1">
                    <PlayerMarker 
                      number={player.number || 2 + index} 
                      name={player.name || `Defender ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            {midfielders.length > 0 && (
              <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '5%', paddingRight: '5%' }}>
                {midfielders.map((player, index) => (
                  <div key={index} className="mx-1">
                    <PlayerMarker 
                      number={player.number || 6 + index} 
                      name={player.name || `Midfielder ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            {forwards.length > 0 && (
              <div className="flex justify-around items-center" style={{ width: '100%', paddingLeft: '25%', paddingRight: '25%' }}>
                {forwards.map((player, index) => (
                  <div key={index} className="mx-1">
                    <PlayerMarker 
                      number={player.number || 9 + index} 
                      name={player.name || `Forward ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Player Roster ({squad.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {squad.map((player, index) => (
            <div key={index} className="flex items-center justify-between border rounded-lg p-2">
              <div>
                <span className="font-medium">#{player.number || index + 1}</span>
                <span className="ml-2">{player.name || `Player ${index + 1}`}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {player.position || 'Unknown'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}