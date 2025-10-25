import { IdCardPreview } from "@/components/id-card/id-card-preview";

export default function IdCardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">ID & Access Control</h1>
        <p className="text-muted-foreground">
          Manage and issue digital ID cards for players and staff.
        </p>
      </div>
      <IdCardPreview />
    </div>
  );
}
