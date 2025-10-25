import { ScoutingPortal } from "@/components/scouting/scouting-portal";

export default function ScoutingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Scout Management Portal</h1>
        <p className="text-muted-foreground">
          A restricted portal for verified scouts to view objective, verified player data.
        </p>
      </div>
      <ScoutingPortal />
    </div>
  );
}
