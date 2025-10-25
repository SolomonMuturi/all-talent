import { AchievementTracker } from "@/components/achievements/achievement-tracker";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Achievements & Certificates</h1>
        <p className="text-muted-foreground">
          Track player awards and generate certificates for completed training modules.
        </p>
      </div>
      <AchievementTracker />
    </div>
  );
}
