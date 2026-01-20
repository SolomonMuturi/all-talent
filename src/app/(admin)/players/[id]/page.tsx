import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PlayerDetails } from '@/components/players/player-details';

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/players/${params.id}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      return {
        title: 'Player Not Found',
      };
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        title: `${data.data.name} - Player Profile`,
        description: `View ${data.data.name}'s profile, performance metrics, and statistics.`,
      };
    }
    
    return {
      title: 'Player Profile',
    };
  } catch {
    return {
      title: 'Player Profile',
    };
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const playerId = parseInt(params.id);
  
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