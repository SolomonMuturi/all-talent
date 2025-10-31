import { ClubManagementDashboard } from "@/components/platform/club-management-dashboard";

export default function PlatformManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Platform Management</h1>
        <p className="text-muted-foreground">
          Onboard new clubs, manage subscriptions, and oversee the entire platform.
        </p>
      </div>
      <ClubManagementDashboard />
    </div>
  );
}
