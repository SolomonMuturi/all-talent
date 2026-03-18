'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  // Replace with real user data from auth/session
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Coach',
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>Manage your profile and account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-semibold">Name</div>
              <div>{user.name}</div>
            </div>
            <div>
              <div className="font-semibold">Email</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div className="font-semibold">Role</div>
              <div>{user.role}</div>
            </div>
            <Button variant="outline" className="mt-4" disabled>
              Edit Profile (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
