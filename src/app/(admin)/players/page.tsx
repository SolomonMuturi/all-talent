// app/players/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Edit, Eye, Search, 
  PlusCircle, Trophy, Users, Cake, Shield, Filter, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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

export default function PlayersPage() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Get unique teams and positions for filters
  const uniqueTeams = [...new Set(players.map(p => p.team))].filter(Boolean);
  const uniquePositions = [...new Set(players.map(p => p.position))].filter(Boolean);

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
      
      if (data.success) {
        setPlayers(data.data.players || []);
      } else {
        setError(data.message || 'Failed to load players');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/players?id=${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Player Deleted',
          description: `${deleteName} has been removed from the academy.`,
        });
        setPlayers(players.filter(p => p.id !== deleteId));
        setDeleteId(null);
        setDeleteName('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: data.message || 'Failed to delete player',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'An unexpected error occurred',
      });
    }
  };

  // Filter players based on search, team, and position
  const filteredPlayers = players.filter(player => {
    // Search filter
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
                         player.position.toLowerCase().includes(search.toLowerCase()) ||
                         player.team.toLowerCase().includes(search.toLowerCase());
    
    // Team filter
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
    
    // Position filter
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const totalPlayers = filteredPlayers.length;
  const averageAge = filteredPlayers.length > 0 
    ? filteredPlayers.reduce((acc, p) => acc + p.age, 0) / totalPlayers 
    : 0;

  const teamCounts = filteredPlayers.reduce((acc, player) => {
    acc[player.team] = (acc[player.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopulousTeam = totalPlayers > 0 
    ? Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'No teams';
  
  const playersByTeam = filteredPlayers.reduce((acc, player) => {
    const team = player.team;
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, DatabasePlayer[]>);

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setTeamFilter('all');
    setPositionFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = search !== '' || teamFilter !== 'all' || positionFilter !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading players...</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Player Roster</h1>
          <p className="text-muted-foreground">
            Browse and manage all players in the academy. Total: {totalPlayers} players
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPlayers}>
            Refresh
          </Button>
          <Button asChild>
            <Link href="/players/enroll">
              <PlusCircle className="mr-2 h-4 w-4" />
              Enroll Player
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Scholars</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <Label htmlFor="team-filter">Team Filter</Label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger id="team-filter">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {uniqueTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <Label htmlFor="position-filter">Position</Label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger id="position-filter">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setSearch('')}
                  />
                </Badge>
              )}
              {teamFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Team: {teamFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setTeamFilter('all')}
                  />
                </Badge>
              )}
              {positionFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Position: {positionFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setPositionFilter('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/players">
          <KpiCard
            title="Total Players"
            value={String(totalPlayers)}
            icon={<Users className="size-5 text-muted-foreground" />}
            description="Across all teams"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Average Age"
            value={averageAge.toFixed(1)}
            icon={<Cake className="size-5 text-muted-foreground" />}
            description="Average player age"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Most Populous Team"
            value={mostPopulousTeam}
            icon={<Shield className="size-5 text-muted-foreground" />}
            description={totalPlayers > 0 ? `${teamCounts[mostPopulousTeam]} players` : 'No players'}
          />
        </Link>
      </div>

      {/* Players Grid by Team */}
      {Object.entries(playersByTeam).map(([team, teamPlayers]) => (
        <div key={team}>
          <h2 className="text-xl font-semibold tracking-tight font-headline mb-4 flex items-center gap-2">
            {team}
            <Badge variant="secondary">{teamPlayers.length} players</Badge>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {teamPlayers.sort((a, b) => a.rank - b.rank).map((player) => (
              <Card key={player.id} className="hover:shadow-lg transition-all duration-200 relative group">
                <Badge className="absolute top-2 right-2 flex gap-1 items-center" 
                       variant={player.rank === 1 ? 'default' : 'secondary'}>
                  <Trophy className="h-3 w-3" />
                  Rank #{player.rank}
                </Badge>
                
                {/* Action buttons - appears on hover */}
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/players/${player.id}`}>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-7 w-7 bg-background/80 backdrop-blur hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/players/${player.id}/edit`}>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-7 w-7 bg-background/80 backdrop-blur hover:bg-blue-500/10 hover:text-blue-500"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-7 w-7 bg-background/80 backdrop-blur hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => {
                          setDeleteId(player.id);
                          setDeleteName(player.name);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Player</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{player.name}</strong>? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Link href={`/players/${player.id}`}>
                  <CardContent className="flex flex-col items-center p-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage 
                        src={player.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=128`} 
                        alt={player.name}
                      />
                      <AvatarFallback>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-center">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Age: {player.age}</span>
                      <span>•</span>
                      <span>Pts: {player.points}</span>
                    </div>
                    <div className="mt-3 flex gap-1 flex-wrap justify-center">
                      <Badge variant="outline" className="text-[10px]">
                        {player.stats_played} Games
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {player.attendance}% Attendance
                      </Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {totalPlayers === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? 'No players match your filters' : 'No Players Found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by enrolling your first player.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/players/enroll">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Enroll First Player
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}