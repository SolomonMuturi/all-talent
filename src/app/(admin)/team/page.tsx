'use client';

import { TeamTable } from "@/components/team/team-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { teamMembers } from "@/lib/data";
import { Users, Wallet, Star } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
  const totalStaff = teamMembers.length;
  const totalPayroll = teamMembers.reduce((acc, member) => acc + (member.hoursWorked * member.hourlyRate), 0);
  
  const roleCounts = teamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonRole = Object.keys(roleCounts).reduce((a, b) => roleCounts[a] > roleCounts[b] ? a : b, '');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Team Management</h1>
        <p className="text-muted-foreground">
          Manage staff roles, payroll, and system access for your team members.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Staff Members"
          value={String(totalStaff)}
          icon={<Users className="size-5 text-muted-foreground" />}
          description="Across all departments"
        />
        <Link href="/finances">
          <KpiCard
            title="Total Monthly Payroll"
            value={`KES ${totalPayroll.toLocaleString()}`}
            icon={<Wallet className="size-5 text-muted-foreground" />}
            description="Calculated from hours & rate"
          />
        </Link>
        <KpiCard
          title="Most Common Role"
          value={mostCommonRole}
          icon={<Star className="size-5 text-muted-foreground" />}
          description={`${roleCounts[mostCommonRole]} members`}
        />
      </div>

      <TeamTable />
    </div>
  );
}
