import { TeamTable } from "@/components/team/team-table";

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Team Management</h1>
        <p className="text-muted-foreground">
          Manage staff roles, payroll, and system access for your team members.
        </p>
      </div>
      <TeamTable />
    </div>
  );
}
