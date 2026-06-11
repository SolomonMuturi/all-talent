'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  channel: string;
  recipient_group: string;
  status: string;
  timestamp: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      const response = await fetch('/api/messages', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages([]);
        setShowClearDialog(false);
        toast({
          title: 'Success',
          description: 'All messages cleared',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to clear messages',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to clear messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear messages',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-gray-500 mt-2">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setShowClearDialog(true)}
            disabled={isClearing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isClearing ? 'Clearing...' : 'Clear All Messages'}
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center min-h-96">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-96">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No messages yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{message.channel}</CardTitle>
                    <CardDescription>
                      {message.recipient_group} • {message.status}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {message.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all messages? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
