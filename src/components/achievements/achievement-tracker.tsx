// components/achievements/achievement-tracker.tsx
'use client';

import { Award, Star, Trophy, Download, Edit, Plus, X, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const ACHIEVEMENT_TYPES = [
  'Certificate of Excellence',
  'Player of the Month',
  'Most Improved Player',
  'Leadership Award',
  'Sportsmanship Award',
  'Top Scorer',
  'Best Defender',
  'Best Midfielder',
  'Best Forward',
  'Golden Boot',
  'Golden Glove',
  'Academic Excellence',
  'Attendance Award',
  'Team Player Award',
  'Coaches Award'
];

const MODULES = [
  'Advanced Dribbling & Ball Control',
  'Defensive Positioning Masterclass',
  'Finishing & Shot Power',
  'Leadership & Teamwork',
  'Sports Nutrition Fundamentals',
  'Tactical Awareness & Game Reading',
  'Speed & Agility Training',
  'Strength & Conditioning',
  'Passing & Vision',
  'Set Piece Specialist',
  'Goalkeeping Fundamentals',
  'Match Analysis & Review'
];

export function AchievementTracker() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form state for new achievement
  const [newAchievement, setNewAchievement] = useState({
    playerId: '',
    achievementType: '',
    module: '',
    description: '',
  });

  // Certificate branding
  const [signatory1, setSignatory1] = useState({ name: 'John Omondi', title: 'Head Coach' });
  const [signatory2, setSignatory2] = useState({ name: 'Esther Chepkoech', title: 'Academy Director' });
  const [academyName, setAcademyName] = useState('TalantaTrack Academy');
  const [contactInfo, setContactInfo] = useState('123 Football Lane, Nairobi, Kenya | +254 700 000 000');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPlayers(),
      fetchAchievements()
    ]);
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.players) {
          setPlayers(data.data.players);
        }
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching achievements...');
      const response = await fetch('/api/achievements');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Achievements data:', data);
      
      if (data.success) {
        setAchievements(data.data || []);
        console.log('Achievements loaded:', data.data?.length || 0);
      } else {
        setError(data.error || 'Failed to fetch achievements');
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async () => {
    // Validate form
    if (!newAchievement.playerId) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a player.',
      });
      return;
    }

    if (!newAchievement.achievementType) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select an achievement type.',
      });
      return;
    }

    if (!newAchievement.module) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a module.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedPlayer = players.find(p => p.id.toString() === newAchievement.playerId);
      
      const achievementData = {
        playerId: parseInt(newAchievement.playerId),
        playerName: selectedPlayer?.name || '',
        achievement: newAchievement.achievementType,
        module: newAchievement.module,
        description: newAchievement.description || '',
        date: new Date().toISOString().split('T')[0],
      };

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Achievement Added',
          description: `${newAchievement.achievementType} awarded to ${selectedPlayer?.name}`,
        });

        await fetchAchievements();
        
        setNewAchievement({
          playerId: '',
          achievementType: '',
          module: '',
          description: '',
        });
        setIsDialogOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Add Achievement',
          description: data.message || 'An error occurred.',
        });
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add achievement. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements?id=${achievementId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Achievement Deleted',
          description: 'Achievement has been removed.',
        });
        await fetchAchievements();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Delete',
          description: data.message || 'An error occurred.',
        });
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete achievement.',
      });
    }
  };

  // Generate certificate with ALL achievements for a player
  const generatePlayerCertificate = (playerId: number, playerName: string) => {
    const playerAchievements = achievements.filter(a => a.playerId === playerId);
    
    if (playerAchievements.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Achievements',
        description: `${playerName} has no achievements to generate a certificate for.`,
      });
      return;
    }

    const achievementsData = playerAchievements.map(a => ({
      achievement: a.achievement,
      module: a.module,
      date: a.date,
      description: a.description
    }));

    const query = new URLSearchParams({
      playerName: playerName,
      achievements: JSON.stringify(achievementsData),
      achievementCount: String(playerAchievements.length),
      academyName: academyName,
      contactInfo: contactInfo,
      s1Name: signatory1.name,
      s1Title: signatory1.title,
      s2Name: signatory2.name,
      s2Title: signatory2.title,
    });
    
    window.open(`/achievements/certificate?${query.toString()}`, '_blank');
  };

  // Generate certificate for a single achievement
  const generateSingleCertificate = (achievement: Achievement) => {
    const query = new URLSearchParams({
      playerName: achievement.playerName,
      moduleName: achievement.module,
      achievementType: achievement.achievement,
      academyName: academyName,
      contactInfo: contactInfo,
      s1Name: signatory1.name,
      s1Title: signatory1.title,
      s2Name: signatory2.name,
      s2Title: signatory2.title,
      date: achievement.date,
    });
    window.open(`/achievements/certificate?${query.toString()}`, '_blank');
  };

  // Group achievements by player
  const getPlayerAchievements = (playerId: number) => {
    return achievements.filter(a => a.playerId === playerId);
  };

  // If there's an error, show it with a retry button
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-red-600">
                <Award className="size-5" /> Error Loading Achievements
              </CardTitle>
              <CardDescription className="text-red-500">{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load achievements. Please try again.</p>
              <Button onClick={fetchAchievements} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                {loading ? 'Loading achievements...' : `${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} recorded`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAchievements}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Achievement</DialogTitle>
                    <DialogDescription>
                      Award an achievement to a player. Fill in all required fields.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Player <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newAchievement.playerId} 
                        onValueChange={(value) => setNewAchievement(prev => ({ ...prev, playerId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem key={player.id} value={String(player.id)}>
                              {player.name} - {player.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Achievement Type <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newAchievement.achievementType} 
                        onValueChange={(value) => setNewAchievement(prev => ({ ...prev, achievementType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select achievement type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACHIEVEMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Module <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newAchievement.module} 
                        onValueChange={(value) => setNewAchievement(prev => ({ ...prev, module: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODULES.map((module) => (
                            <SelectItem key={module} value={module}>
                              {module}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea 
                        placeholder="Add a brief description of the achievement..."
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setNewAchievement({
                          playerId: '',
                          achievementType: '',
                          module: '',
                          description: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddAchievement}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Add Achievement'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading achievements...</p>
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No achievements recorded yet</p>
                <p className="text-sm mt-2">Click "Add Achievement" to award a player</p>
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
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            title="Download single achievement certificate"
                            onClick={() => generateSingleCertificate(item)}
                          >
                            <Download className="size-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                title="View all achievements for this player"
                                className="text-primary"
                              >
                                <FileText className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                              <div className="px-2 py-1.5 text-sm font-medium">
                                {item.playerName}'s Achievements
                              </div>
                              <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                                {getPlayerAchievements(item.playerId).length} achievement(s)
                              </div>
                              {getPlayerAchievements(item.playerId).map((ach) => (
                                <DropdownMenuItem 
                                  key={ach.id}
                                  className="flex flex-col items-start gap-0.5 py-2"
                                  onClick={() => generateSingleCertificate(ach)}
                                >
                                  <span className="text-sm font-medium">{ach.achievement}</span>
                                  <span className="text-xs text-muted-foreground">{ach.module}</span>
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem 
                                className="border-t mt-1 text-primary font-medium"
                                onClick={() => generatePlayerCertificate(item.playerId, item.playerName)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Generate All Achievements
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAchievement(item.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
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