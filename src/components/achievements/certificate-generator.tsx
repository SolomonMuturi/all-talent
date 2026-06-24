// components/achievements/certificate-generator.tsx
'use client';

import { Download, Award, CheckCircle, AlertCircle, List, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { courses } from '@/lib/courses';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

interface Achievement {
  id: string;
  playerId: number;
  playerName: string;
  achievement: string;
  module: string;
  date: string;
  description?: string | null;
}

const onPitchModules = [
  'Advanced Dribbling & Ball Control',
  'Defensive Positioning Masterclass',
  'Finishing & Shot Power',
  'Passing Accuracy & Vision',
  'Goalkeeping Fundamentals',
  'Set Piece Specialist',
];

const tacticalModules = [
  'Tactical Awareness & Game Reading',
  'Team Formation & Strategy',
  'Counter-Attack Execution',
  'Press Resistance Training'
];

const offPitchModules = courses.map(course => course.title);

interface CertificateGeneratorProps {
  branding: {
    academyName: string;
    contactInfo: string;
    signatory1: { name: string; title: string };
    signatory2: { name: string; title: string };
  }
}

export function CertificateGenerator({ branding }: CertificateGeneratorProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerAchievements, setPlayerAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    fetchPlayers();
    fetchAchievements();
  }, []);

  useEffect(() => {
    if (selectedPlayer && achievements.length > 0) {
      const filtered = achievements.filter(a => a.playerId === parseInt(selectedPlayer));
      // Sort by date (newest first)
      const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPlayerAchievements(sorted);
    } else {
      setPlayerAchievements([]);
    }
  }, [selectedPlayer, achievements]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players?limit=1000');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.players) {
          setPlayers(data.data.players);
        }
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  };

  const handleGenerate = () => {
    if (selectedPlayer && playerAchievements.length > 0) {
      const player = players.find(p => p.id === parseInt(selectedPlayer));
      
      if (player) {
        // Pass all achievements as a JSON string
        const achievementsData = playerAchievements.map(a => ({
          achievement: a.achievement,
          module: a.module,
          date: a.date,
          description: a.description
        }));
        
        const query = new URLSearchParams({
          playerName: player.name,
          achievements: JSON.stringify(achievementsData),
          achievementCount: String(playerAchievements.length),
          academyName: branding.academyName,
          contactInfo: branding.contactInfo,
          s1Name: branding.signatory1.name,
          s1Title: branding.signatory1.title,
          s2Name: branding.signatory2.name,
          s2Title: branding.signatory2.title,
        });
        router.push(`/achievements/certificate?${query.toString()}`);
      }
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === parseInt(playerId));
    return player?.name || 'Unknown Player';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Award className="size-5" /> Certificate Generation
        </CardTitle>
        <CardDescription>
          Generate a comprehensive certificate showing all achievements for a player.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Selection */}
        <div>
          <label className="text-sm font-medium">Select Player</label>
          <Select 
            onValueChange={setSelectedPlayer} 
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading players..." : "Select a player"} />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={String(player.id)}>
                  {player.name} ({player.certificate_count || 0} achievements)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Achievements List */}
        {selectedPlayer && (
          <div>
            {playerAchievements.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {playerAchievements.length} Achievement{playerAchievements.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(playerAchievements[0]?.date).getFullYear() || 'Current'}
                  </Badge>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="p-3 space-y-3">
                    {playerAchievements.map((achievement, index) => (
                      <div key={achievement.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{achievement.achievement}</p>
                            <p className="text-xs text-muted-foreground">{achievement.module}</p>
                            {achievement.description && (
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                "{achievement.description}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {formatDate(achievement.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">No Achievements Found</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This player hasn't earned any achievements yet. 
                    Go to the Achievements tab to award one.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Section */}
        {selectedPlayer && playerAchievements.length > 0 && (
          <div className="mt-2 border rounded-lg p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Certificate Preview</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Player:</strong> {getPlayerName(selectedPlayer)}</p>
              <p><strong>Total Achievements:</strong> {playerAchievements.length}</p>
              <p><strong>Latest Achievement:</strong> {playerAchievements[0]?.achievement}</p>
              <p><strong>Latest Date:</strong> {formatDate(playerAchievements[0]?.date)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Certificate will show all {playerAchievements.length} achievements in a list
              </p>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          disabled={!selectedPlayer || playerAchievements.length === 0 || loading} 
          onClick={handleGenerate}
        >
          <Download className="mr-2 h-4 w-4" />
          Generate Certificate ({playerAchievements.length} achievements)
        </Button>

        {/* Achievement Summary Badges */}
        {selectedPlayer && playerAchievements.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground text-center mb-2">
              All achievements for {getPlayerName(selectedPlayer)}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {playerAchievements.slice(0, 5).map((a) => (
                <Badge key={a.id} variant="outline" className="text-[10px]">
                  {a.achievement}
                </Badge>
              ))}
              {playerAchievements.length > 5 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{playerAchievements.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}