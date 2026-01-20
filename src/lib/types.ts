// lib/types.ts
export interface Player {
  id: number;
  name: string;
  age: number;
  position: string;
  avatar_url: string | null;
  team: string | null;
  attendance: number;
  discipline_score: number;
  rank: number;
  points: number;
  stats_played: number;
  stats_wins: number;
  stats_draws: number;
  stats_losses: number;
  highlights: string | null;
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
  phone_number: string | null;
  email: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  player_id: number;
  module_name: string;
  date: string;
  created_at: string;
}

export interface DisciplinaryInfraction {
  id: number;
  player_id: number;
  date: string;
  infraction: string;
  severity: 'Low' | 'Medium' | 'High';
  sanction: string | null;
  created_at: string;
}

export interface Injury {
  id: number;
  player_id: number;
  date: string;
  injury: string;
  severity: 'Low' | 'Medium' | 'High';
  rtp_status: 'In Treatment' | 'Cleared for Light Training' | 'Cleared to Play';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}