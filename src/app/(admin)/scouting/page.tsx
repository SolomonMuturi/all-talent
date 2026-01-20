'use client';

import Link from 'next/link';
import { ScoutingPortal } from "@/components/scouting/scouting-portal";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, User, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DatabasePlayer {
  id: number;
  name: string;
  age: number;
  position: string;
  avatar_url: string | null;
  team: string;
  attendance: number;
  discipline_score: number;
  rank: number;
  points: number;
  stats_played: number;
  stats_wins: number;
  stats_draws: number;
  stats_losses: number;
  highlights: string;
  gps_max_speed: number | null;
  gps_distance_covered: number | null;
  gps_player_load: number | null;
  physical_speed: number;
  physical_stamina: number;
  physical_strength: number;
  technical_dribbling: number;
  technical_shooting: number;
  technical_passing: number;
  tactical_positioning: number;
  tactical_game_reading: number;
  psycho_leadership: number;
  psycho_teamwork: number;
  certificate_count: number;
  infraction_count: number;
  injury_count: number;
}

export default function ScoutingPage() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players?limit=1000');
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.players) {
        setPlayers(data.data.players);
      } else {
        setError(data.message || 'Failed to load players');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading prospects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <Button onClick={fetchPlayers}>Retry</Button>
      </div>
    );
  }

  const totalProspects = players.length;
  const topProspect = players.length > 0 ? [...players].sort((a, b) => a.rank - b.rank)[0] : null;
  // One to watch - e.g., high-potential younger player with good stats
  const oneToWatch = players.length > 0 
    ? [...players].sort((a, b) => {
        const aScore = (b.physical_speed + b.technical_shooting + b.physical_stamina) / 3;
        const bScore = (a.physical_speed + a.technical_shooting + a.physical_stamina) / 3;
        return bScore - aScore;
      })[0] 
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Scout Management Portal</h1>
        <p className="text-muted-foreground">
          A restricted portal for verified scouts to view objective, verified player data.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        {topProspect && (
          <Link href={`/players/${topProspect.id}`}>
              <KpiCard
              title="Top Prospect"
              value={topProspect.name}
              icon={<User className="size-5 text-muted-foreground" />}
              description={`Rank #${topProspect.rank}, ${topProspect.position}`}
              />
          </Link>
        )}
        {oneToWatch && (
          <Link href={`/players/${oneToWatch.id}`}>
            <KpiCard
              title="One to Watch"
              value={oneToWatch.name}
              icon={<Eye className="size-5 text-muted-foreground" />}
              description={`${oneToWatch.age} years old, ${oneToWatch.position}`}
            />
          </Link>
        )}
        <Link href="/players">
            <KpiCard
                title="Total Prospects"
                value={String(totalProspects)}
                icon={<Users className="size-5 text-muted-foreground" />}
                description="Players in the academy"
            />
        </Link>
      </div>

      <ScoutingPortal />
    </div>
  );
}
