'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UploadCloud, FileText, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { EnrollmentSteps } from './enrollment-steps';

const personalDetailsSchema = z.object({
  fullName: z.string().nonempty('Full name is required.'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  position: z.string().nonempty('Position is required.'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email address.').optional(),
});

type FormValues = z.infer<typeof personalDetailsSchema>;

const steps = [
  { id: '01', name: 'Personal Details', fields: ['fullName', 'dateOfBirth', 'position'] },
  { id: '02', name: 'Upload Documents' },
  { id: '03', name: 'Profile Picture' },
  { id: '04', name: 'Review & Submit' },
];

export function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [releaseLetter, setReleaseLetter] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setPreview?: (preview: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      if (setPreview) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };


  const form = useForm<FormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
        fullName: '',
        dateOfBirth: undefined,
        position: '',
        phoneNumber: '',
        email: ''
    }
  });

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
        // Handle final submission
        toast({ title: "Player Enrolled", description: "The new player has been successfully registered." });
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step + 1);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <EnrollmentSteps currentStep={currentStep} steps={steps} />
        <Form {...form}>
          <form className="mt-8 space-y-6">
            {currentStep === 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1980-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                            <SelectItem value="Defender">Defender</SelectItem>
                            <SelectItem value="Midfielder">Midfielder</SelectItem>
                            <SelectItem value="Forward">Forward</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Guardian)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 254712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Guardian)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., guardian@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
                 <div>
                    <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="birth-certificate" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> Birth Certificate</p>
                                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG</p>
                                </div>
                                <Input id="birth-certificate" type="file" className="hidden" onChange={(e) => handleFileChange(e, setBirthCertificate)} />
                            </label>
                        </div>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="release-letter" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> Release Letter (Optional)</p>
                                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG</p>
                                </div>
                                <Input id="release-letter" type="file" className="hidden" onChange={(e) => handleFileChange(e, setReleaseLetter)} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                     <div className="flex items-center justify-center w-full">
                        <label htmlFor="profile-picture" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {profilePicturePreview ? (
                                    <img src={profilePicturePreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover mb-2"/>
                                ) : (
                                    <User className="w-12 h-12 mb-2 text-muted-foreground" />
                                )}
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> a profile picture</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x800px)</p>
                            </div>
                            <Input id="profile-picture" type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, setProfilePicture, setProfilePicturePreview)} />
                        </label>
                    </div>
                </div>
            )}
             {currentStep === 3 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Review & Submit</h3>
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <h4 className="font-semibold">Personal Details</h4>
                        <p><strong>Name:</strong> {form.getValues().fullName}</p>
                        <p><strong>Date of Birth:</strong> {form.getValues().dateOfBirth ? format(form.getValues().dateOfBirth, "PPP") : 'N/A'}</p>
                        <p><strong>Position:</strong> {form.getValues().position}</p>
                        
                        <h4 className="font-semibold mt-4">Uploaded Documents</h4>
                        <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {birthCertificate?.name || 'No file selected'}</p>
                        {releaseLetter && <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {releaseLetter.name}</p>}


                        <h4 className="font-semibold mt-4">Profile Picture</h4>
                        {profilePicturePreview ? (
                           <img src={profilePicturePreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover"/>
                        ) : (
                           <p>No picture uploaded.</p>
                        )}

                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                onClick={prev}
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button type="button" onClick={next}>
                {currentStep === steps.length - 1 ? 'Submit Enrollment' : 'Next'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    