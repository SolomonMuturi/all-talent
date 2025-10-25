import { notFound } from 'next/navigation';
import { courses } from '@/lib/courses';
import { CourseDetails } from '@/components/training-hub/course-details';

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = courses.find(c => c.id === params.id);

  if (!course) {
    notFound();
  }

  return <CourseDetails course={course} />;
}
