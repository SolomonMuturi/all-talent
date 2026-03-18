'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Bell,
  Send,
  Calendar,
  MessageSquare,
  Smartphone,
  Clock,
  Loader2,
  Paperclip,
  Star,
  StarOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const channelIcons = {
  'In-App': <MessageSquare className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
  WhatsApp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.75 13.96c.25.13.43.28.56.44.14.16.27.35.38.56.1.2.18.42.24.66.06.24.09.48.09.73 0 .26-.03.51-.09.75-.06.24-.15.47-.27.68-.12.21-.28.4-.47.56-.2.16-.42.28-.68.37-.26.09-.54.14-.84.14-.38 0-.74-.07-1.08-.2-2.13-.8-3.93-2.22-5.4-4.23-1.25-1.7-1.87-3.44-1.87-5.22 0-.3.05-.58.14-.84.09-.26.22-.5.38-.7.16-.2.35-.36.56-.47.2-.12.43-.2.66-.24.24-.06.48-.09.73-.09.26 0 .51.03.75.09.24.06.46.15.66.27.2.12.38.28.5.47.13.2.22.4.28.63.06.23.09.46.09.7 0 .22-.03.43-.09.63-.06.2-.15.38-.27.54-.12.16-.28.3-.47.42-.2.12-.4.2-.6.24-.08.02-.15.03-.22.03-.1 0-.2.02-.3.05-.1.03-.2.08-.3.15-.1.07-.18.15-.25.25-.07.1-.12.2-.15.3-.03.1-.05.2-.05.3 0 .07.02.13.05.2.03.07.08.13.15.2.07.07.15.12.25.15.1.03.2.05.3.05h.03c.1-.02.2-.05.3-.1.1-.05.2-.12.3-.2.1-.08.2-.18.3-.28.1-.1.2-.22.3-.34.1-.12.2-.25.3-.38.1-.13.22-.25.34-.35.12-.1.25-.18.38-.22.13-.04.26-.06.4-.06.25 0 .48.05.7.14Z"/>
    </svg>
  ),
};

type Message = {
  id: string;
  channel: string;
  recipientGroup: string;
  subject: string;
  content: string;
  status: string;
  timestamp: string;
  priority: string;
  attachments?: string[];
};

export function CommunicationsHub() {
  const { toast } = useToast();
  const [channel, setChannel] = useState('In-App');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('all-players');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [priority, setPriority] = useState('Normal');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for messages, loading, error
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Fetch messages from API
  useEffect(() => {
    fetch('/api/messages')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data && Array.isArray(data.data)) {
          setMessages(data.data);
        } else if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessagesError('API response is not an array');
        }
      })
      .catch(err => setMessagesError(err.message))
      .finally(() => setMessagesLoading(false));
  }, []);

  // Handle file attachments
  const handleAttachmentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAttachments(Array.from(e.target.files || []));
  };

  // Send message to API
  const handleSend = async () => {
    if (!subject || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please provide both subject and message.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('channel', channel);
      formData.append('recipientGroup', recipientGroup);
      formData.append('subject', subject);
      formData.append('content', message);
      formData.append('priority', priority);
      formData.append('scheduledDate', scheduledDate ? scheduledDate.toISOString() : '');
      attachments.forEach((file, idx) => {
        formData.append(`attachment_${idx}`, file);
      });

      const res = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to send message');
      toast({
        title: 'Message Sent!',
        description: `Your ${channel} message has been sent to ${recipientGroup.replace('-', ' ')}.`,
      });
      setMessage('');
      setSubject('');
      setScheduledDate(undefined);
      setPriority('Normal');
      setAttachments([]);
      // Refresh messages list
      const updated = await fetch('/api/messages').then(r => r.json());
      if (Array.isArray(updated)) setMessages(updated);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Send Failed',
        description: err.message,
      });
    }
    setIsLoading(false);
  };

  const getBadgeVariant = (status: Message['status']): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Sent': return 'default';
      case 'Scheduled': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
  };

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
              <TabsTrigger value="In-App">{channelIcons['In-App']} In-App</TabsTrigger>
              <TabsTrigger value="SMS">{channelIcons['SMS']} SMS</TabsTrigger>
              <TabsTrigger value="WhatsApp">{channelIcons['WhatsApp']} WhatsApp</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-4 mt-4">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={isLoading}
            />
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your ${channel} message here...`}
              rows={6}
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Recipient Group</label>
                <Select value={recipientGroup} onValueChange={setRecipientGroup} disabled={isLoading}>
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
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal"><StarOff className="inline h-4 w-4 mr-1" />Normal</SelectItem>
                    <SelectItem value="High"><Star className="inline h-4 w-4 mr-1 text-destructive" />High</SelectItem>
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
                      disabled={isLoading}
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
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Paperclip className="h-4 w-4" /> Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                disabled={isLoading}
                className="block w-full"
              />
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, idx) => (
                    <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSend} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (scheduledDate ? <Clock className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />)}
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
        <CardContent>
          <div className="relative">
            {messagesLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading messages...</span>
              </div>
            )}
            {messagesError && (
              <div className="text-red-500 py-8 text-center">{messagesError}</div>
            )}
            {!messagesLoading && !messagesError && (
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className="p-4 bg-muted/50 rounded-lg flex gap-3 items-start hover:bg-muted transition-colors group"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-background border">
                        {channelIcons[msg.channel] || <MessageSquare className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold truncate">{msg.recipientGroup}</span>
                          <Badge variant={getBadgeVariant(msg.status)}>{msg.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary">{msg.subject}</span>
                          {msg.priority === 'High' && (
                            <Badge variant="destructive" className="ml-2"><Star className="h-3 w-3 mr-1" /> High</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.timestamp), "PPpp")}
                        </p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.attachments.map((file, idx) => (
                              <a
                                key={idx}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline flex items-center gap-1"
                              >
                                <Paperclip className="h-3 w-3" /> {file.split('/').pop()}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
