'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="relative aspect-video">
                <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="rounded-t-lg object-cover"
                    data-ai-hint={course.thumbnailHint}
                />
            </div>
            <CardTitle className="mt-4 font-headline text-lg">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Button asChild className="w-full mt-auto">
              <Link href={`/training-hub/${course.id}`}>View Course</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
