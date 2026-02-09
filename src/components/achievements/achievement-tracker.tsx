'use client';

import { Award, Star, Trophy, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CertificateGenerator } from './certificate-generator';
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

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
  description?: string;
}

export function AchievementTracker() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [signatory1, setSignatory1] = useState({ name: 'John Omondi', title: 'Head Coach' });
  const [signatory2, setSignatory2] = useState({ name: 'Esther Chepkoech', title: 'Academy Director' });
  const [academyName, setAcademyName] = useState('TalantaTrack Academy');
  const [contactInfo, setContactInfo] = useState('123 Football Lane, Nairobi, Kenya | +254 700 000 000');
  
  // Mock achievements data
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      playerId: 1,
      playerName: 'Michael Olunga',
      achievement: 'Advanced Dribbling Certificate',
      module: 'Advanced Dribbling & Ball Control',
      date: '2024-01-15',
      description: 'Mastered advanced dribbling techniques'
    },
    {
      id: '2',
      playerId: 2,
      playerName: 'Victor Wanyama',
      achievement: 'Leadership Award',
      module: 'Leadership & Teamwork',
      date: '2024-01-10',
      description: 'Demonstrated exceptional leadership skills'
    },
    {
      id: '3',
      playerId: 3,
      playerName: 'Joseph Okumu',
      achievement: 'Defensive Specialist',
      module: 'Defensive Positioning Masterclass',
      date: '2024-01-05',
      description: 'Excelled in defensive positioning drills'
    }
  ]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players?limit=1000');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.players) {
          setPlayers(data.data.players);
          // If we have real certificate data from players, update achievements
          updateAchievementsFromPlayers(data.data.players);
        }
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
      // For demo purposes, create some mock players if API fails
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
      }
    ];
    setPlayers(mockPlayers);
    updateAchievementsFromPlayers(mockPlayers);
  };

  const updateAchievementsFromPlayers = (playerList: DatabasePlayer[]) => {
    const newAchievements: Achievement[] = [];
    const modules = [
      'Advanced Dribbling & Ball Control',
      'Defensive Positioning Masterclass',
      'Finishing & Shot Power',
      'Leadership & Teamwork',
      'Sports Nutrition Fundamentals',
      'Tactical Awareness & Game Reading'
    ];

    playerList.forEach(player => {
      if (player.certificate_count && player.certificate_count > 0) {
        // Create achievements based on certificate count
        for (let i = 0; i < Math.min(player.certificate_count, 3); i++) {
          const module = modules[Math.floor(Math.random() * modules.length)];
          const achievementType = i === 0 ? 'Certificate' : i === 1 ? 'Award' : 'Honor';
          
          newAchievements.push({
            id: `${player.id}-${i}`,
            playerId: player.id,
            playerName: player.name,
            achievement: `${module.split(' ')[0]} ${achievementType}`,
            module: module,
            date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `Completed ${module} with excellence`
          });
        }
      }
    });

    // Sort by date, newest first
    newAchievements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAchievements(newAchievements);
  };

  const handleAddManualAchievement = () => {
    if (players.length === 0) return;
    
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const modules = [
      'Advanced Dribbling & Ball Control',
      'Defensive Positioning Masterclass',
      'Finishing & Shot Power',
      'Leadership & Teamwork'
    ];
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      playerId: randomPlayer.id,
      playerName: randomPlayer.name,
      achievement: `${randomModule.split(' ')[0]} Certificate`,
      module: randomModule,
      date: new Date().toISOString().split('T')[0],
      description: `Successfully completed ${randomModule} training`
    };
    
    setAchievements(prev => [newAchievement, ...prev]);
    
    // Update player certificate count
    setPlayers(prev => prev.map(p => 
      p.id === randomPlayer.id 
        ? { ...p, certificate_count: (p.certificate_count || 0) + 1 }
        : p
    ));
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Trophy className="size-5" /> Recent Awards
                        </CardTitle>
                        <CardDescription>
                          A log of all individual player awards and honors.
                        </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleAddManualAchievement}
                      disabled={players.length === 0}
                    >
                        <Award className="mr-2 h-4 w-4" />
                        Add Test Achievement
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading achievements...</div>
                    ) : achievements.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p>No achievements recorded yet</p>
                        <p className="text-sm mt-2">Generate certificates to see achievements here</p>
                      </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Award</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {achievements.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">
                                      <Link href={`/players/${item.playerId}`} className="hover:underline flex items-center gap-2">
                                        <div className="flex items-center justify-center size-8 bg-primary/10 rounded-full">
                                          <Award className="size-4 text-primary" />
                                        </div>
                                        {item.playerName}
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                            <Star className="size-3" />
                                            {item.achievement}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.module}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => {
                                          const query = new URLSearchParams({
                                            playerName: item.playerName,
                                            moduleName: item.module,
                                            academyName,
                                            contactInfo,
                                            s1Name: signatory1.name,
                                            s1Title: signatory1.title,
                                            s2Name: signatory2.name,
                                            s2Title: signatory2.title,
                                          });
                                          window.open(`/achievements/certificate?${query.toString()}`, '_blank');
                                        }}
                                      >
                                        <Download className="size-4" />
                                      </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Edit className="size-5" />
                        Customize Certificate Branding
                    </CardTitle>
                    <CardDescription>Edit the details that appear on every certificate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Academy Name</Label>
                            <Input 
                              value={academyName} 
                              onChange={(e) => setAcademyName(e.target.value)}
                              placeholder="Enter academy name"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Academy Contact Info</Label>
                            <Input 
                              value={contactInfo} 
                              onChange={(e) => setContactInfo(e.target.value)}
                              placeholder="Address | Phone | Email"
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Signatory 1 Name</Label>
                            <Input 
                              value={signatory1.name} 
                              onChange={(e) => setSignatory1({ ...signatory1, name: e.target.value })}
                              placeholder="Enter name"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Signatory 1 Title</Label>
                            <Input 
                              value={signatory1.title} 
                              onChange={(e) => setSignatory1({ ...signatory1, title: e.target.value })}
                              placeholder="Enter title"
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Signatory 2 Name</Label>
                            <Input 
                              value={signatory2.name} 
                              onChange={(e) => setSignatory2({ ...signatory2, name: e.target.value })}
                              placeholder="Enter name"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Signatory 2 Title</Label>
                            <Input 
                              value={signatory2.title} 
                              onChange={(e) => setSignatory2({ ...signatory2, title: e.target.value })}
                              placeholder="Enter title"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <CertificateGenerator branding={{ academyName, contactInfo, signatory1, signatory2 }} />
        </div>
    </div>
  );
}