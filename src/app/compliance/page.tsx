import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard";

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Compliance Dashboard</h1>
        <p className="text-muted-foreground">
          Track and manage compliance with the Ministry of Sports and other governing bodies.
        </p>
      </div>
      <ComplianceDashboard />
    </div>
  );
}
