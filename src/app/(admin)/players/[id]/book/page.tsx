import { notFound } from 'next/navigation';
import { PlayerBook } from '@/components/players/player-book';

export default async function PlayerBookPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/players/${params.id}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const data = await res.json();
  if (!data.success || !data.data) notFound();

  return <PlayerBook player={data.data} />;
}
