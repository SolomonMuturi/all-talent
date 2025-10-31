import { ClubManagementDashboard } from "@/components/platform/club-management-dashboard";
import { clubs, subscriptionPlans } from "@/lib/platform-data";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, Users, Building, Percent } from "lucide-react";

export default function PlatformManagementPage() {
  const totalClubs = clubs.length;
  const totalPlayers = clubs.reduce((acc, club) => acc + club.playerCount, 0);
  const totalMRR = clubs.filter(c => c.status === 'Active').reduce((acc, club) => acc + club.mrr, 0);
  const churnedClubs = clubs.filter(c => c.status === 'Canceled').length;
  const churnRate = totalClubs > 0 ? (churnedClubs / totalClubs) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Platform Management</h1>
        <p className="text-muted-foreground">
          Onboard new clubs, manage subscriptions, and oversee the entire platform.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
            title="Total Monthly Revenue"
            value={`KES ${totalMRR.toLocaleString()}`}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="Across all active clubs"
        />
        <KpiCard
            title="Total Clubs"
            value={String(totalClubs)}
            icon={<Building className="size-5 text-muted-foreground" />}
            description="Active, Trialing & Canceled"
        />
         <KpiCard
            title="Total Active Players"
            value={totalPlayers.toLocaleString()}
            icon={<Users className="size-5 text-muted-foreground" />}
            description="Across all clubs"
        />
         <KpiCard
            title="Monthly Churn Rate"
            value={`${churnRate.toFixed(1)}%`}
            icon={<Percent className="size-5 text-muted-foreground" />}
            description={`${churnedClubs} clubs canceled`}
        />
      </div>

      <ClubManagementDashboard />
    </div>
  );
}
