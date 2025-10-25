'use client';

import Link from 'next/link';
import { IdCardGenerator } from "@/components/id-card/id-card-generator";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, AlertTriangle, Building } from "lucide-react";
import { players, teamMembers } from "@/lib/data";

export default function IdCardPage() {
    const totalIDs = players.length + teamMembers.length;
    const expiringSoon = 3; // Dummy data
    const accessPoints = 5; // Dummy data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">ID & Access Control</h1>
        <p className="text-muted-foreground">
          Manage and issue digital ID cards for players and staff.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Link href="/players">
            <KpiCard
                title="Total Active IDs"
                value={String(totalIDs)}
                icon={<Users className="size-5 text-muted-foreground" />}
                description="Across players & staff"
            />
        </Link>
        <KpiCard
            title="IDs Expiring Soon"
            value={String(expiringSoon)}
            icon={<AlertTriangle className="size-5 text-muted-foreground" />}
            description="Due for renewal in 30 days"
        />
        <KpiCard
            title="Managed Access Points"
            value={String(accessPoints)}
            icon={<Building className="size-5 text-muted-foreground" />}
            description="e.g., Gym, Main Pitch"
        />
      </div>

      <IdCardGenerator />
    </div>
  );
}
