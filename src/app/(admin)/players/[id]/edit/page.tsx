// app/players/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { EnrollmentForm } from '@/components/players/enrollment-form';
import { query } from '@/lib/db';

interface EditPlayerPageProps {
  params: {
    id: string;
  };
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const playerId = parseInt(params.id);
  
  if (isNaN(playerId)) {
    notFound();
  }

  const players = await query('SELECT * FROM players WHERE id = ?', [playerId]);
  const player = players?.[0];

  if (!player) {
    notFound();
  }

  // Format the player data for the form
  const existingPlayer = {
    id: player.id,
    name: player.name,
    dateOfBirth: player.date_of_birth || player.dateOfBirth,
    position: player.position,
    team: player.team,
    phoneNumber: player.phone_number || player.phoneNumber || '',
    email: player.email || '',
    avatar_url: player.avatar_url || player.avatarUrl || null,
  };

  return (
    <div className="container mx-auto py-8">
      <EnrollmentForm existingPlayer={existingPlayer} mode="edit" />
    </div>
  );
}