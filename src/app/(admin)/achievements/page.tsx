'use client';

import { AchievementTracker } from "@/components/achievements/achievement-tracker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Award, Medal, FileText, Trophy } from "lucide-react";
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

export default function AchievementsPage() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/players?limit=1000');
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.players) {
        setPlayers(data.data.players);
      } else {
        throw new Error(data.message || 'Failed to load players');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
      // For demo purposes, create mock data if API fails
      createMockPlayers();
    } finally {
      setLoading(false);
    }
  };

  const createMockPlayers = () => {
    const mockPlayers: DatabasePlayer[] = [
      {
        id: 1,
        name: 'Michael Olunga',
        age: 29,
        position: 'Striker',
        avatar_url: null,
        team: 'Senior Team',
        attendance: 95,
        discipline_score: 90,
        rank: 1,
        points: 450,
        stats_played: 20,
        stats_wins: 15,
        stats_draws: 3,
        stats_losses: 2,
        highlights: 'Top scorer, Team captain',
        gps_max_speed: 32.5,
        gps_distance_covered: 10500,
        gps_player_load: 850,
        physical_speed: 90,
        physical_stamina: 85,
        physical_strength: 80,
        technical_dribbling: 88,
        technical_shooting: 95,
        technical_passing: 75,
        tactical_positioning: 85,
        tactical_game_reading: 80,
        psycho_leadership: 90,
        psycho_teamwork: 85,
        certificate_count: 3,
        infraction_count: 0,
        injury_count: 1
      },
      {
        id: 2,
        name: 'Victor Wanyama',
        age: 32,
        position: 'Midfielder',
        avatar_url: null,
        team: 'Senior Team',
        attendance: 88,
        discipline_score: 92,
        rank: 2,
        points: 420,
        stats_played: 18,
        stats_wins: 12,
        stats_draws: 4,
        stats_losses: 2,
        highlights: 'Key playmaker, Set piece specialist',
        gps_max_speed: 30.2,
        gps_distance_covered: 12500,
        gps_player_load: 920,
        physical_speed: 82,
        physical_stamina: 90,
        physical_strength: 88,
        technical_dribbling: 80,
        technical_shooting: 75,
        technical_passing: 90,
        tactical_positioning: 88,
        tactical_game_reading: 92,
        psycho_leadership: 95,
        psycho_teamwork: 90,
        certificate_count: 2,
        infraction_count: 1,
        injury_count: 0
      },
      {
        id: 3,
        name: 'Joseph Okumu',
        age: 26,
        position: 'Defender',
        avatar_url: null,
        team: 'Senior Team',
        attendance: 92,
        discipline_score: 85,
        rank: 3,
        points: 400,
        stats_played: 22,
        stats_wins: 14,
        stats_draws: 5,
        stats_losses: 3,
        highlights: 'Solid defense, Aerial dominance',
        gps_max_speed: 31.8,
        gps_distance_covered: 11000,
        gps_player_load: 890,
        physical_speed: 85,
        physical_stamina: 88,
        physical_strength: 92,
        technical_dribbling: 70,
        technical_shooting: 65,
        technical_passing: 80,
        tactical_positioning: 90,
        tactical_game_reading: 85,
        psycho_leadership: 80,
        psycho_teamwork: 85,
        certificate_count: 1,
        infraction_count: 2,
        injury_count: 1
      }
    ];
    setPlayers(mockPlayers);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg">Loading achievements...</div>
      </div>
    );
  }

  const totalAwards = players.reduce((total, player) => total + (player.certificate_count || 0), 0);
  const topPlayer = players.length > 0 ? [...players].sort((a, b) => (b.certificate_count || 0) - (a.certificate_count || 0))[0] : null;
  const topAwardCount = topPlayer ? topPlayer.certificate_count || 0 : 0;
  const uniquePlayersAwarded = players.filter(p => (p.certificate_count || 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Achievements & Certificates</h1>
          <p className="text-muted-foreground">
            Track player awards and generate certificates for completed training modules.
          </p>
        </div>
        {error && (
          <Button 
            variant="outline" 
            onClick={fetchPlayers}
            className="whitespace-nowrap"
          >
            Retry Loading
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-medium">API Error: {error}</p>
          <p className="text-sm text-muted-foreground mt-1">Showing demo data. Real data will load when API is available.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Awards"
          value={String(totalAwards)}
          icon={<Award className="size-5 text-muted-foreground" />}
          description="Certificates issued"
          trend={totalAwards > 0 ? "positive" : "neutral"}
        />
        <KpiCard
          title="Top Player"
          value={topPlayer?.name?.split(' ')[0] || 'N/A'}
          icon={<Trophy className="size-5 text-muted-foreground" />}
          description={`${topAwardCount} certificates`}
          trend="positive"
        />
        <KpiCard
          title="Players Awarded"
          value={String(uniquePlayersAwarded)}
          icon={<Medal className="size-5 text-muted-foreground" />}
          description="Of total players"
          trend={uniquePlayersAwarded > 0 ? "positive" : "neutral"}
        />
        <KpiCard
          title="Certificates"
          value={String(totalAwards)}
          icon={<FileText className="size-5 text-muted-foreground" />}
          description="Generated"
          trend={totalAwards > 0 ? "positive" : "neutral"}
        />
      </div>

      <AchievementTracker />
    </div>
  );
}