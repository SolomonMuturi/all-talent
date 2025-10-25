import { PayrollTable } from "@/components/team/payroll-table";
import { TeamManagement } from "@/components/team/team-management";

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">User Role Management</h1>
        <p className="text-muted-foreground">
          Control system access and permissions for your team members.
        </p>
      </div>
      <TeamManagement />
      <div className="mt-8">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Coach & Staff Payroll</h1>
        <p className="text-muted-foreground">
          Automated wage calculation based on biometric attendance data.
        </p>
      </div>
      <PayrollTable />
    </div>
  );
}
