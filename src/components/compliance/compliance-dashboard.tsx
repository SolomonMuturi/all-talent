import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileCheck, ShieldCheck, Building } from "lucide-react";

export function ComplianceDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <FileCheck className="size-5 text-primary" />
                    Player Registrations
                </CardTitle>
                <CardDescription>
                    Track official player registrations with football federations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Manage registration status, renewal dates, and required documentation for all players.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    Staff Certifications
                </CardTitle>
                <CardDescription>
                    Ensure all coaches and staff hold valid certifications.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Monitor license expiration dates, upload certificates, and track continuous professional development (CPD) points.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Building className="size-5 text-primary" />
                    Facility & Safety Audits
                </CardTitle>
                <CardDescription>
                    Log and manage safety audits for all academy facilities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Schedule regular safety inspections, document findings, and track corrective actions to ensure a safe environment.</p>
            </CardContent>
        </Card>
    </div>
  );
}
