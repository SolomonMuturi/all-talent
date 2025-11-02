import { notFound } from 'next/navigation';
import { players } from '@/lib/data';
import { PlayerBook } from '@/components/players/player-book';

export default function PlayerBookPage({ params }: { params: { id: string } }) {
  const player = players.find(p => p.id === parseInt(params.id));

  if (!player) {
    notFound();
  }

  return <PlayerBook player={player} />;
}
