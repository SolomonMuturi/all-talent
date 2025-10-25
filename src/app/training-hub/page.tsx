import { CourseList } from '@/components/training-hub/course-list';
import { courses } from '@/lib/courses';

export default function TrainingHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Training Hub</h1>
        <p className="text-muted-foreground">
          Browse and enroll in self-paced courses to enhance your skills on and off the pitch.
        </p>
      </div>
      <CourseList courses={courses} />
    </div>
  );
}
