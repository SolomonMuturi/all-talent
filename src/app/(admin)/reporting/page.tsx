import { ReportGenerator } from "@/components/reporting/report-generator";

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Automated Reporting</h1>
        <p className="text-muted-foreground">
          Generate AI-powered summaries for your financial and performance data.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
