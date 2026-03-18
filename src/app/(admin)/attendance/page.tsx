import { RollCall } from "@/components/attendance/roll-call";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Roll Call & Attendance</h1>
        <p className="text-muted-foreground">
          Take daily attendance and monitor the live check-in feed.
        </p>
      </div>
      <RollCall />
    </div>
  );
}
