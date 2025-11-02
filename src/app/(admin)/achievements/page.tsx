import { AchievementTracker } from "@/components/achievements/achievement-tracker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { players } from "@/lib/data";
import { Award, Medal, FileText } from "lucide-react";

const achievements = [
  { playerId: 1, achievement: 'Player of the Match', date: '2024-07-10', event: 'U-17 Friendly' },
  { playerId: 2, achievement: 'Most Assists', date: '2024-06-15', event: 'League Season' },
  { playerId: 6, achievement: 'Golden Boot', date: '2024-06-15', event: 'League Season' },
  { playerId: 1, achievement: 'Player of the Match', date: '2024-05-25', event: 'Cup Final' },
];

const generatedCertificatesCount = players.reduce((total, player) => total + player.certificates.length, 0);

export default function AchievementsPage() {
  const totalAwards = achievements.length;
  
  const awardsByPlayer = achievements.reduce((acc, award) => {
    acc[award.playerId] = (acc[award.playerId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const topPlayerId = Object.keys(awardsByPlayer).reduce((a, b) => awardsByPlayer[Number(a)] > awardsByPlayer[Number(b)] ? a : b, '0');
  const topPlayer = players.find(p => p.id === parseInt(topPlayerId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Achievements & Certificates</h1>
        <p className="text-muted-foreground">
          Track player awards and generate certificates for completed training modules.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Awards Given"
          value={String(totalAwards)}
          icon={<Award className="size-5 text-muted-foreground" />}
          description="Across all players and events"
        />
        <KpiCard
          title="Top Awarded Player"
          value={topPlayer?.name || 'N/A'}
          icon={<Medal className="size-5 text-muted-foreground" />}
          description={`${awardsByPlayer[topPlayer?.id || 0] || 0} awards won`}
        />
        <KpiCard
          title="Certificates Generated"
          value={String(generatedCertificatesCount)}
          icon={<FileText className="size-5 text-muted-foreground" />}
          description="For completed training modules"
        />
      </div>

      <AchievementTracker />
    </div>
  );
}
