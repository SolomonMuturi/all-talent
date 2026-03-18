'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  // Simulated user settings state (replace with real API integration)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    theme: 'system',
    language: 'en',
    displayName: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    accountPrivacy: 'private',
    twoFactorAuth: false,
  });
  const [loading, setLoading] = useState(false);

  // Simulate fetching user settings from API
  useEffect(() => {
    // Replace with real fetch
    setSettings((prev) => ({
      ...prev,
      displayName: 'John Doe',
    }));
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Replace with real API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated.',
      });
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure your preferences and account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Profile */}
            <div>
              <h3 className="font-semibold mb-2">Profile</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Display Name</label>
                <Input
                  value={settings.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="flex items-center justify-between py-2">
                <span>Email Notifications</span>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => handleChange('emailNotifications', v)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span>SMS Notifications</span>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(v) => handleChange('smsNotifications', v)}
                />
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="font-semibold mb-2">Theme</h3>
              <Select
                value={settings.theme}
                onValueChange={(v) => handleChange('theme', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <h3 className="font-semibold mb-2">Language</h3>
              <Select
                value={settings.language}
                onValueChange={(v) => handleChange('language', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Zone */}
            <div>
              <h3 className="font-semibold mb-2">Time Zone</h3>
              <Input
                value={settings.timeZone}
                onChange={(e) => handleChange('timeZone', e.target.value)}
                placeholder="Time Zone"
                disabled
              />
              <div className="text-xs text-muted-foreground mt-1">
                Detected automatically from your browser.
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="font-semibold mb-2">Privacy</h3>
              <Select
                value={settings.accountPrivacy}
                onValueChange={(v) => handleChange('accountPrivacy', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Private: Only you and admins can view your profile. Public: Anyone in the academy can view your profile.
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <div className="flex items-center justify-between py-2">
                <span>Two-Factor Authentication</span>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(v) => handleChange('twoFactorAuth', v)}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Add an extra layer of security to your account.
              </div>
              <Button variant="outline" className="mt-2" disabled>
                Change Password (Coming Soon)
              </Button>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
