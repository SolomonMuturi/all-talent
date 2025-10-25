'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  Calendar,
  MessageSquare,
  Smartphone,
  Repeat,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { players, teamMembers, messages, type Message } from '@/lib/data';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const channelIcons = {
  'In-App': <MessageSquare className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
  WhatsApp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.43.28.56.44.14.16.27.35.38.56.1.2.18.42.24.66.06.24.09.48.09.73 0 .26-.03.51-.09.75-.06.24-.15.47-.27.68-.12.21-.28.4-.47.56-.2.16-.42.28-.68.37-.26.09-.54.14-.84.14-.38 0-.74-.07-1.08-.2-2.13-.8-3.93-2.22-5.4-4.23-1.25-1.7-1.87-3.44-1.87-5.22 0-.3.05-.58.14-.84.09-.26.22-.5.38-.7.16-.2.35-.36.56-.47.2-.12.43-.2.66-.24.24-.06.48-.09.73-.09.26 0 .51.03.75.09.24.06.46.15.66.27.2.12.38.28.5.47.13.2.22.4.28.63.06.23.09.46.09.7 0 .22-.03.43-.09.63-.06.2-.15.38-.27.54-.12.16-.28.3-.47.42-.2.12-.4.2-.6.24-.08.02-.15.03-.22.03-.1 0-.2.02-.3.05-.1.03-.2.08-.3.15-.1.07-.18.15-.25.25-.07.1-.12.2-.15.3-.03.1-.05.2-.05.3 0 .07.02.13.05.2.03.07.08.13.15.2.07.07.15.12.25.15.1.03.2.05.3.05h.03c.1-.02.2-.05.3-.1.1-.05.2-.12.3-.2.1-.08.2-.18.3-.28.1-.1.2-.22.3-.34.1-.12.2-.25.3-.38.1-.13.22-.25.34-.35.12-.1.25-.18.38-.22.13-.04.26-.06.4-.06.25 0 .48.05.7.14Z"/></svg>,
};

export function CommunicationsHub() {
  const { toast } = useToast();
  const [channel, setChannel] = useState('In-App');
  const [message, setMessage] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('all-players');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Message is empty',
        description: 'Please write a message before sending.',
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: `Your ${channel} message has been sent to ${recipientGroup.replace('-', ' ')}.`,
      });
      setMessage('');
      setScheduledDate(undefined);
      setIsLoading(false);
    }, 1500);
  };
  
  const getBadgeVariant = (status: Message['status']): 'default' | 'secondary' | 'destructive' => {
      switch(status) {
          case 'Sent': return 'default';
          case 'Scheduled': return 'secondary';
          case 'Failed': return 'destructive';
          default: return 'outline';
      }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={channel} onValueChange={setChannel}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="In-App">
                {channelIcons['In-App']} In-App
              </TabsTrigger>
              <TabsTrigger value="SMS">
                {channelIcons['SMS']} SMS
              </TabsTrigger>
              <TabsTrigger value="WhatsApp">
                {channelIcons['WhatsApp']} WhatsApp
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-4 mt-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your ${channel} message here...`}
              rows={6}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Recipient Group</label>
                <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-players">All Players</SelectItem>
                    <SelectItem value="u19-players">U-19 Players</SelectItem>
                    <SelectItem value="u17-players">U-17 Players</SelectItem>
                    <SelectItem value="u15-players">U-15 Players</SelectItem>
                    <SelectItem value="all-staff">All Staff</SelectItem>
                    <SelectItem value="coaches">Coaches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                 <label className="text-sm font-medium">Schedule (Optional)</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                        )}
                        >
                        <Calendar className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button onClick={handleSend} disabled={isLoading} className="w-full">
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (scheduledDate ? <Clock className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />) }
              {isLoading ? 'Sending...' : (scheduledDate ? 'Schedule Message' : 'Send Now')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Messages
          </CardTitle>
           <CardDescription>A log of your recent communications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            {channelIcons[msg.channel]}
                            <span className="text-sm font-semibold">{msg.recipientGroup}</span>
                        </div>
                        <Badge variant={getBadgeVariant(msg.status)}>{msg.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
