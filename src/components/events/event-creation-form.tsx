'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Calendar as CalendarIcon, UploadCloud } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  // These field names MUST match what your API expects
  title: z.string().min(1, { message: "Event name is required." }),
  subtitle: z.string().optional(),
  organizer: z.string().min(1, { message: "Organizer name is required." }),
  event_date: z.date({ required_error: 'Please select a date for the event.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  venue: z.string().min(1, { message: 'Venue is required.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  description: z.string().optional(),
  country: z.string().optional(),
  game_type: z.string().optional(),
  tournament_type: z.string().optional(),
  team_count: z.coerce.number().optional(),
  lineup_formation: z.string().optional(),
  lineup_squad: z.array(z.any()).optional(),
});

export function EventCreationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      organizer: '',
      event_date: undefined,
      category: '',
      venue: '',
      location: '',
      description: '',
      country: '',
      game_type: '',
      tournament_type: 'N/A',
      team_count: 0,
      lineup_formation: '',
      lineup_squad: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Prepare form data with all fields
      const formData = {
        ...values,
        event_date: format(values.event_date, 'yyyy-MM-dd'),
        team_count: values.team_count || 0,
        tournament_type: values.tournament_type || 'N/A',
        lineup_squad: values.lineup_squad || [],
      };

      // If there's a logo file, you might want to upload it first
      let logo_url = '';
      if (logoFile) {
        // Here you would typically upload the file to your storage
        // For now, we'll just simulate it
        logo_url = `/uploads/${logoFile.name}`;
        formData.logo_url = logo_url;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Event Created Successfully',
          description: `${values.title} has been created and is now live.`,
          variant: 'default',
        });
        form.reset();
        setLogoFile(null);
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Event creation error:', error);
      toast({
        title: 'Error Creating Event',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      toast({
        title: 'Logo Uploaded',
        description: `${file.name} has been selected.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Event Details</CardTitle>
        <CardDescription>Provide the details for your event below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organizer Name - maps to 'organizer' in API */}
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TalantaTrack Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Name - maps to 'title' in API */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., U-17 Regional Finals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Subtitle - maps to 'subtitle' in API */}
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Season Opener" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Date - maps to 'event_date' in API */}
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Event *</FormLabel>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Category - maps to 'category' in API */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tournament">Tournament</SelectItem>
                        <SelectItem value="Match">Match</SelectItem>
                        <SelectItem value="Trial">Trial</SelectItem>
                        <SelectItem value="Concert">Concert</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Venue - maps to 'venue' in API */}
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kasarani Stadium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Location - maps to 'location' in API */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Country - maps to 'country' in API */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kenya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Game Type - maps to 'game_type' in API */}
              <FormField
                control={form.control}
                name="game_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select game type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Rugby">Rugby</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Athletics">Athletics</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tournament Type - maps to 'tournament_type' in API */}
              <FormField
                control={form.control}
                name="tournament_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tournament type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="N/A">Not Applicable</SelectItem>
                        <SelectItem value="Knockout">Knockout</SelectItem>
                        <SelectItem value="League">League</SelectItem>
                        <SelectItem value="Group Stage">Group Stage</SelectItem>
                        <SelectItem value="Friendly">Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Team Count - maps to 'team_count' in API */}
              <FormField
                control={form.control}
                name="team_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Teams (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 8" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Lineup Formation - maps to 'lineup_formation' in API */}
              <FormField
                control={form.control}
                name="lineup_formation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lineup Formation (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select formation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4-4-2">4-4-2</SelectItem>
                        <SelectItem value="4-3-3">4-3-3</SelectItem>
                        <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                        <SelectItem value="3-5-2">3-5-2</SelectItem>
                        <SelectItem value="4-5-1">4-5-1</SelectItem>
                        <SelectItem value="3-4-3">3-4-3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Description - maps to 'description' in API */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A brief description of the event..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Logo Upload */}
            <div className="space-y-2">
              <FormLabel>Event Logo/Flyer (Optional)</FormLabel>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or SVG</p>
                    {logoFile && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {logoFile.name}
                      </p>
                    )}
                  </div>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}