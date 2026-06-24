// app/players/enroll/page.tsx
import { EnrollmentForm } from '@/components/players/enrollment-form';

export default function EnrollPlayerPage() {
  return (
    <div className="container mx-auto py-8">
      <EnrollmentForm mode="create" />
    </div>
  );
}