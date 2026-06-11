'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Message {
  id: number;
  content: string;
  channel: string;
  recipient_group: string;
  status: string;
  timestamp: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/messages', window.location.origin).href;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`status=${response.status} message=${errorText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected API response format');
      }

      setMessages(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      const response = await fetch('/api/messages', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages([]);
        setUnreadCount(0);
        setShowClearDialog(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to clear messages:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="relative rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleMarkAsRead}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-sm">Notifications</h2>
              <p className="text-xs text-gray-500">You have {unreadCount} new messages</p>
            </div>
            <ScrollArea className="h-96">
              {messages.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading messages...' : 'No messages yet'}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {message.channel} • {message.recipient_group}
                          </p>
                          <p className="text-sm text-gray-800 line-clamp-3">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-3 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  router.push('/messages');
                  setIsOpen(false);
                }}
              >
                View All Messages
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-destructive hover:text-destructive"
                  onClick={() => setShowClearDialog(true)}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all messages? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
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
    </>
  );
}
