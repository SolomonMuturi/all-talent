'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, UploadCloud, FileText, User, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: '01', name: 'Personal Details' },
  { id: '02', name: 'Upload Documents' },
  { id: '03', name: 'Profile Picture' },
  { id: '04', name: 'Review & Submit' },
];

export function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: new Date(new Date().getFullYear() - 16, 0, 1), // Default to 16 years ago
    position: '',
    team: '',
    phoneNumber: '',
    email: ''
  });
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [releaseLetter, setReleaseLetter] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateOfBirth: date }));
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setPreview?: (preview: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      if (setPreview) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.name.trim()) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Full name is required"
          });
          return false;
        }
        if (!formData.position) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Position is required"
          });
          return false;
        }
        if (!formData.team) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Team is required"
          });
          return false;
        }
        const age = calculateAge(formData.dateOfBirth);
        if (age < 5 || age > 30) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Player must be between 5 and 30 years old"
          });
          return false;
        }
        return true;
      
      case 1:
        if (!birthCertificate) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Birth certificate is required"
          });
          return false;
        }
        return true;
      
      case 2:
        // Profile picture is optional
        return true;
      
      default:
        return true;
    }
  };

  const next = async () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
      await handleSubmit();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const age = calculateAge(formData.dateOfBirth);
      
      // Generate avatar URL from name if no profile picture
      const avatarUrl = profilePicturePreview 
        ? profilePicturePreview 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&size=256`;
      
      const playerData = {
        name: formData.name.trim(),
        age: age,
        position: formData.position,
        team: formData.team,
        avatar_url: avatarUrl,
        attendance: 0,
        discipline_score: 100,
        rank: 0,
        points: 0,
        stats_played: 0,
        stats_wins: 0,
        stats_draws: 0,
        stats_losses: 0,
        highlights: JSON.stringify([]),
        physical_speed: 50,
        physical_stamina: 50,
        physical_strength: 50,
        technical_dribbling: 50,
        technical_shooting: 50,
        technical_passing: 50,
        tactical_positioning: 50,
        tactical_game_reading: 50,
        psycho_leadership: 50,
        psycho_teamwork: 50
      };

      console.log('Submitting player data:', playerData);

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      const data = await response.json();

      if (data.success) {
        toast({ 
          title: "Player Enrolled", 
          description: "The new player has been successfully registered." 
        });
        
        // Redirect to player details or players list
        setTimeout(() => {
          if (data.playerId) {
            router.push(`/players/${data.playerId}`);
          } else {
            router.push('/players');
          }
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll player"
        });
      }
    } catch (error) {
      console.error('Error enrolling player:', error);
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2",
            index === currentStep 
              ? "border-primary bg-primary text-primary-foreground" 
              : index < currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 text-muted-foreground"
          )}>
            {index < currentStep ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-sm font-medium">{step.id}</span>
            )}
          </div>
          <span className={cn(
            "ml-2 text-sm font-medium",
            index === currentStep 
              ? "text-primary" 
              : index < currentStep
                ? "text-primary"
                : "text-muted-foreground"
          )}>
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-12 h-0.5 mx-4",
              index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <StepIndicator />
          
          <div className="mt-8">
            {currentStep === 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      placeholder="e.g., John Doe" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Player's full legal name</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Date of Birth <span className="text-destructive">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? (
                            format(formData.dateOfBirth, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateOfBirth}
                          onSelect={handleDateChange}
                          disabled={(date) => {
                            const maxDate = new Date();
                            maxDate.setFullYear(maxDate.getFullYear() - 5);
                            const minDate = new Date();
                            minDate.setFullYear(minDate.getFullYear() - 30);
                            return date > maxDate || date < minDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Position <span className="text-destructive">*</span>
                    </label>
                    <Select 
                      value={formData.position} 
                      onValueChange={(value) => handleSelectChange('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                        <SelectItem value="Defender">Defender</SelectItem>
                        <SelectItem value="Midfielder">Midfielder</SelectItem>
                        <SelectItem value="Forward">Forward</SelectItem>
                        <SelectItem value="Utility">Utility Player</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Primary playing position</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Team <span className="text-destructive">*</span>
                    </label>
                    <Select 
                      value={formData.team} 
                      onValueChange={(value) => handleSelectChange('team', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="U-15">U-15 (Under 15)</SelectItem>
                        <SelectItem value="U-17">U-17 (Under 17)</SelectItem>
                        <SelectItem value="U-19">U-19 (Under 19)</SelectItem>
                        <SelectItem value="U-21">U-21 (Under 21)</SelectItem>
                        <SelectItem value="Senior">Senior Team</SelectItem>
                        <SelectItem value="Development">Development Squad</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Team assignment</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Phone Number (Guardian)
                    </label>
                    <Input 
                      placeholder="e.g., 254712345678" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      type="tel"
                    />
                    <p className="text-xs text-muted-foreground">Contact number for emergencies</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Email (Guardian)
                    </label>
                    <Input 
                      type="email"
                      placeholder="e.g., guardian@example.com" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">For official communication</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Please upload required documents for player registration
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Birth Certificate <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="birth-certificate" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {birthCertificate ? (
                            <>
                              <FileText className="w-8 h-8 mb-2 text-primary" />
                              <p className="mb-1 text-sm font-medium">{birthCertificate.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(birthCertificate.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> Birth Certificate
                              </p>
                              <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX 5MB)</p>
                            </>
                          )}
                        </div>
                        <Input 
                          id="birth-certificate" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, setBirthCertificate)} 
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required for age verification. Upload clear scan of official document.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Release Letter (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="release-letter" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {releaseLetter ? (
                            <>
                              <FileText className="w-8 h-8 mb-2 text-primary" />
                              <p className="mb-1 text-sm font-medium">{releaseLetter.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(releaseLetter.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> Release Letter
                              </p>
                              <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX 5MB)</p>
                            </>
                          )}
                        </div>
                        <Input 
                          id="release-letter" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, setReleaseLetter)} 
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If transferring from another club. Not required for new players.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a clear portrait photo for player identification
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="profile-picture" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {profilePicturePreview ? (
                          <>
                            <img 
                              src={profilePicturePreview} 
                              alt="Profile preview" 
                              className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-background shadow-lg"
                            />
                            <p className="text-sm text-muted-foreground">Click to change photo</p>
                          </>
                        ) : (
                          <>
                            <User className="w-12 h-12 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> a profile picture
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x800px, 2MB)</p>
                          </>
                        )}
                      </div>
                      <Input 
                        id="profile-picture" 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handleFileChange(e, setProfilePicture, setProfilePicturePreview)} 
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Optional. If not provided, a generated avatar will be used.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Review & Submit</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Please review all information before submitting
                </p>
                <div className="space-y-6 p-6 border rounded-lg bg-muted/20">
                  <div>
                    <h4 className="font-semibold text-primary mb-3">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{formData.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">
                          {format(formData.dateOfBirth, "PPP")} 
                          <span className="text-sm text-muted-foreground ml-2">
                            ({calculateAge(formData.dateOfBirth)} years)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium">{formData.position || 'Not selected'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team</p>
                        <p className="font-medium">{formData.team || 'Not selected'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guardian Phone</p>
                        <p className="font-medium">{formData.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guardian Email</p>
                        <p className="font-medium">{formData.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-3">Documents</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Birth Certificate: {birthCertificate ? '✓ Uploaded' : '✗ Not uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Release Letter: {releaseLetter ? '✓ Uploaded' : '✗ Not uploaded (optional)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-3">Profile Picture</h4>
                    <div className="flex items-center gap-4">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Profile preview" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {profilePicture ? '✓ Custom photo uploaded' : '✓ Will use generated avatar'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profilePicture ? profilePicture.name : 'Avatar based on name'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Player ID</h4>
                    <p className="text-sm">
                      Upon submission, the player will receive a unique ID: <span className="font-mono font-bold">TT-XXXXX</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This ID will be used for all academy activities and identification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              onClick={prev}
              disabled={currentStep === 0 || loading}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {steps[currentStep].name}
              </p>
            </div>
            
            <Button 
              type="button" 
              onClick={next}
              disabled={loading}
              className="gap-2 min-w-32"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Submit Enrollment
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}