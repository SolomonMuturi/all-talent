import { StandingsTable } from "@/components/standings/standings-table";

export default function StandingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Team Standings</h1>
        <p className="text-muted-foreground">
          View player points and league tables for each team.
        </p>
      </div>
      <StandingsTable />
    </div>
  );
}
