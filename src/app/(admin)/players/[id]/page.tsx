import { notFound } from 'next/navigation';
import { players } from '@/lib/data';
import { PlayerDetails } from '@/components/players/player-details';

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = players.find(p => p.id === parseInt(params.id));

  if (!player) {
    notFound();
  }

  return <PlayerDetails player={player} />;
}
