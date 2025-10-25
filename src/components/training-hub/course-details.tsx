'use client';

import { useState } from 'react';
import { Course, CourseModule } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Video, HelpCircle } from 'lucide-react';
import { Progress } from '../ui/progress';

interface CourseDetailsProps {
  course: Course;
}

const getIcon = (contentType: CourseModule['contentType']) => {
    switch (contentType) {
        case 'video':
            return <Video className="h-5 w-5 text-muted-foreground" />;
        case 'document':
            return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'quiz':
            return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
        default:
            return null;
    }
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const [activeModule, setActiveModule] = useState<CourseModule | undefined>(course.modules[0]);

  const totalDuration = course.modules.reduce((sum, module) => sum + module.duration, 0);
  const completedModules = 1; // Dummy data
  const progress = (completedModules / course.modules.length) * 100;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
            <CardContent className="p-0">
                {activeModule?.contentType === 'video' ? (
                     <div className="aspect-video bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Video player for: {activeModule.title}</p>
                    </div>
                ) : activeModule?.contentType === 'document' ? (
                    <div className="aspect-video bg-muted flex items-center justify-center p-6">
                        <p className="text-muted-foreground">Document viewer for: {activeModule.title}</p>
                    </div>
                ): (
                     <div className="aspect-video bg-muted flex items-center justify-center p-6">
                        <p className="text-muted-foreground">Select a module to begin.</p>
                    </div>
                )}
               
            </CardContent>
        </Card>
         <div className="mt-6">
            <h1 className="text-2xl font-bold font-headline">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
             <div className="mt-4">
                <p className="text-sm font-medium mb-2">{completedModules} of {course.modules.length} modules completed</p>
                <Progress value={progress} />
            </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Course Content</CardTitle>
                <CardDescription>
                    {course.modules.length} modules &middot; {totalDuration} min total
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {course.modules.map((module, index) => (
                        <button
                            key={module.id}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-4 ${activeModule?.id === module.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                            onClick={() => setActiveModule(module)}
                        >
                           {getIcon(module.contentType)}
                            <div className="flex-1">
                                <p className="font-medium text-sm">{module.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{module.duration} min</span>
                                </div>
                            </div>
                             <CheckCircle className={`h-5 w-5 ${index < completedModules ? 'text-primary' : 'text-muted/30'}`} />
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
