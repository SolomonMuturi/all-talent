import Link from 'next/link';
import { ScoutingPortal } from "@/components/scouting/scouting-portal";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { players } from "@/lib/data";
import { Users, User, Eye } from "lucide-react";

export default function ScoutingPage() {
  const totalProspects = players.length;
  const topProspect = players.sort((a, b) => a.rank - b.rank)[0];
  // Simple logic for "one to watch" - e.g., a high-potential younger player
  const oneToWatch = players.find(p => p.id === 5); // David Odhiambo

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Scout Management Portal</h1>
        <p className="text-muted-foreground">
          A restricted portal for verified scouts to view objective, verified player data.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/players/${topProspect.id}`}>
            <KpiCard
            title="Top Prospect"
            value={topProspect.name}
            icon={<User className="size-5 text-muted-foreground" />}
            description={`Rank #${topProspect.rank}, ${topProspect.position}`}
            />
        </Link>
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
