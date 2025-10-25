import { EnrollmentForm } from "@/components/players/enrollment-form";

export default function EnrollPlayerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Player Enrollment</h1>
        <p className="text-muted-foreground">
          Follow the steps to register a new player for the academy.
        </p>
      </div>
      <EnrollmentForm />
    </div>
  );
}
