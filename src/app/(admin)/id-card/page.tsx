'use client';

import Link from 'next/link';
import { IdCardGenerator } from "@/components/id-card/id-card-generator";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, AlertTriangle, Building } from "lucide-react";
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

export default function IdCardPage() {
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
        <div className="text-lg">Loading ID cards...</div>
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

  const totalIDs = players.length;
  const expiringSoon = 0; // Can be updated based on ID expiry data from database
  const accessPoints = 5; // Dummy data - would need separate table

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">ID & Access Control</h1>
        <p className="text-muted-foreground">
          Manage and issue digital ID cards for players and staff.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Link href="/players">
            <KpiCard
                title="Total Active IDs"
                value={String(totalIDs)}
                icon={<Users className="size-5 text-muted-foreground" />}
                description="Across players & staff"
            />
        </Link>
        <KpiCard
            title="IDs Expiring Soon"
            value={String(expiringSoon)}
            icon={<AlertTriangle className="size-5 text-muted-foreground" />}
            description="Due for renewal in 30 days"
        />
        <KpiCard
            title="Managed Access Points"
            value={String(accessPoints)}
            icon={<Building className="size-5 text-muted-foreground" />}
            description="e.g., Gym, Main Pitch"
        />
      </div>

      <IdCardGenerator />
    </div>
  );
}
