'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, ImageIcon } from "lucide-react";

interface CourseListProps {
  courses: Course[];
}

interface PaymentDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PaymentDialog({ course, open, onOpenChange }: PaymentDialogProps) {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    if (!/^(0|7|1)\d{8}$/.test(phone)) {
        toast({
            variant: "destructive",
            title: "Invalid Phone Number",
            description: "Please enter a valid 9-digit phone number (e.g., 712345678).",
        });
        return;
    }
    
    setIsLoading(true);
    const mpesaNumber = `254${phone.replace(/^0+/, '')}`;
    console.log(`Initiating M-Pesa payment for ${course.title} to ${mpesaNumber}`);
    
    setTimeout(() => {
        setIsLoading(false);
        onOpenChange(false);
        setPhone("");
        toast({
            title: "Payment Initiated",
            description: `A payment request of KES ${course.price?.toLocaleString()} has been sent to ${mpesaNumber}.`,
        });
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in: {course.title}</DialogTitle>
          <DialogDescription>
            This is a paid course. Complete the payment to get access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold font-headline">KES {course.price?.toLocaleString()}</p>
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium">M-Pesa Phone Number</label>
             <div className="flex items-center">
                <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm">
                +254
                </div>
                <Input 
                    id="phone"
                    type="tel" 
                    placeholder="712345678" 
                    className="rounded-l-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePayment} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4"/>}
            {isLoading ? 'Processing...' : 'Pay & Enroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Image with fallback component
function CourseImage({ src, alt, hint }: { src: string; alt: string; hint?: string }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default placeholder image (data URI for a simple gray placeholder)
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23666'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff' font-size='20'%3EImage Not Available%3C/text%3E%3C/svg%3E";

  // If the image fails to load, use placeholder
  const imageSrc = imgError ? placeholderImage : src;

  return (
    <div className="relative aspect-video bg-muted">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 animate-pulse text-muted-foreground" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={`rounded-t-lg object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        data-ai-hint={hint}
        onError={() => setImgError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized={src.startsWith('data:')}
      />
    </div>
  );
}

export function CourseList({ courses }: CourseListProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleCourseAction = (course: Course) => {
    if (course.price && course.price > 0) {
      setSelectedCourse(course);
      setPaymentDialogOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
              <CourseImage 
                src={course.thumbnailUrl || '/images/placeholder-course.jpg'} 
                alt={course.title}
                hint={course.thumbnailHint}
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="font-headline text-lg line-clamp-1">{course.title}</CardTitle>
                  {course.price && course.price > 0 && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      KES {course.price.toLocaleString()}
                    </div>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end p-4 pt-0">
                {course.price && course.price > 0 ? (
                    <Button onClick={() => handleCourseAction(course)} className="w-full mt-auto">
                        Buy Course
                    </Button>
                ) : (
                    <Button asChild className="w-full mt-auto">
                        <Link href={`/training-hub/${course.id}`}>View Course</Link>
                    </Button>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedCourse && (
        <PaymentDialog 
            course={selectedCourse} 
            open={isPaymentDialogOpen} 
            onOpenChange={setPaymentDialogOpen} 
        />
      )}
    </>
  );
}