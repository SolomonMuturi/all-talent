'use client';

import { useState, useEffect } from 'react';
import { Course, CourseModule } from '@/lib/courses';
import { players } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Video, HelpCircle, User, UserX } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<CourseModule | undefined>(course.modules[0]);
  const [completedModules, setCompletedModules] = useState(1);
  
  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`course_${course.id}_progress`);
    if (savedProgress) {
      setCompletedModules(parseInt(savedProgress));
    }
  }, [course.id]);

  const totalDuration = course.modules.reduce((sum, module) => sum + module.duration, 0);
  const progress = (completedModules / course.modules.length) * 100;

  const activeStudentIds = new Set(course.accessLog.map(log => log.studentId));
  const inactiveEnrolledStudents = course.enrolledStudentIds
    .filter(id => !activeStudentIds.has(id))
    .map(id => players.find(p => p.id === id))
    .filter(p => p !== undefined);

  const handleModuleComplete = (moduleId: string) => {
    const newCompleted = Math.min(completedModules + 1, course.modules.length);
    setCompletedModules(newCompleted);
    localStorage.setItem(`course_${course.id}_progress`, newCompleted.toString());
    toast({
      title: "Module Completed!",
      description: `Great job! You've completed ${newCompleted} of ${course.modules.length} modules.`,
    });
  };

  const sendReminder = (studentName: string) => {
    toast({
      title: "Reminder Sent",
      description: `A reminder has been sent to ${studentName}.`,
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Tabs defaultValue="course" className="w-full">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                {activeModule?.contentType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black text-white">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p>Video Player: {activeModule.title}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => handleModuleComplete(activeModule.id)}
                      >
                        Mark as Complete
                      </Button>
                    </div>
                  </div>
                ) : activeModule?.contentType === 'document' ? (
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p>Document Viewer: {activeModule.title}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => handleModuleComplete(activeModule.id)}
                      >
                        Mark as Complete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <HelpCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a module to begin.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h1 className="text-2xl font-bold font-headline">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="mt-4">
              <TabsList>
                <TabsTrigger value="course">Course Details</TabsTrigger>
                <TabsTrigger value="activity">Student Activity</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="course" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">{completedModules} of {course.modules.length} modules completed</p>
                <Progress value={progress} className="mb-4" />
                {progress === 100 && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Congratulations! You've completed this course!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    Active Students
                  </CardTitle>
                  <CardDescription>Students who have started this course.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Last Accessed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.accessLog.length > 0 ? (
                        course.accessLog
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map(log => {
                            const player = players.find(p => p.id === log.studentId);
                            if (!player) return null;
                            return (
                              <TableRow key={log.studentId}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src={player.avatarUrl} alt={player.name} />
                                      <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{player.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </TableCell>
                              </TableRow>
                            )
                          })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            No student has accessed this course yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="size-5 text-muted-foreground" />
                    Enrolled, Not Started
                  </CardTitle>
                  <CardDescription>Students who are enrolled but have not yet started the course.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveEnrolledStudents.length > 0 ? (
                        inactiveEnrolledStudents.map(player => {
                          if (!player) return null;
                          return (
                            <TableRow key={player.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                                    <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{player.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => sendReminder(player.name)}>
                                  Send Reminder
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            All enrolled students have started the course.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-4 ${
                    activeModule?.id === module.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
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
                  <CheckCircle className={`h-5 w-5 ${index < completedModules ? 'text-green-500' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}