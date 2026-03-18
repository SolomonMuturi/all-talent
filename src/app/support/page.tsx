'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Contact support or find help resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-semibold">Help Center</div>
              <div>
                <a href="mailto:support@talenttrack.com" className="text-primary underline">
                  support@talenttrack.com
                </a>
              </div>
            </div>
            <div>
              <div className="font-semibold">FAQ</div>
              <div className="text-muted-foreground">Frequently asked questions (Coming Soon)</div>
            </div>
            <Button variant="outline" className="mt-4" asChild>
              <a href="mailto:support@talenttrack.com">Contact Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
