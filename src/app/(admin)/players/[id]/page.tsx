// Player profile page - dynamic route
import { PlayerDetails } from '@/components/players/player-details';
import { notFound } from 'next/navigation';

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const playerId = parseInt(id);
  
  if (isNaN(playerId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Player Profile</h1>
        <p className="text-muted-foreground">View detailed information about the player</p>
      </div>
      
      <PlayerDetails playerId={playerId} />
    </div>
  );
}