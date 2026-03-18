'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  hourly_rate?: number;
  hours_worked?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AcademyOperationsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/academy-operations?type=team");
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.team)) {
          setTeam(json.data.team);
        } else {
          setTeam([]);
          setError(json.error || "Failed to load team data.");
        }
      } catch (err) {
        setTeam([]);
        setError("Failed to load team data.");
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight font-headline">Academy Operations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <ul>
              {team.length > 0 ? (
                team.map(member => (
                  <li key={member.id}>
                    {member.name} ({member.role}) - {member.email}
                  </li>
                ))
              ) : (
                <li>No team members found.</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
      {/* Add more sections for attendance, inventory, etc. as needed */}
    </div>
  );
}
