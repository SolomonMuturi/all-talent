'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { players, teamMembers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '@/lib/utils';
import { Logo } from '../icons';

type Person = {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  team?: string;
};

const allPersonnel: Person[] = [
  ...players.map(p => ({ id: `player-${p.id}`, name: p.name, avatarUrl: p.avatarUrl, role: p.position, team: p.team })),
  ...teamMembers.map(m => ({ id: `staff-${m.id}`, name: m.name, avatarUrl: m.avatarUrl, role: m.role })),
];

export function IdCardGenerator() {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(allPersonnel[0].id);

  const selectedPerson = allPersonnel.find(p => p.id === selectedPersonId) || allPersonnel[0];

  // Dummy logic for expiration
  const issueDate = new Date('2024-01-01');
  const expiryDate = new Date('2025-01-01');
  const isExpiringSoon = new Date() > new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Digital ID Card Generator</CardTitle>
        <CardDescription>Select a person to generate their digital ID card with a unique QR code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium">Player or Staff Member</label>
          <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select a person" />
            </SelectTrigger>
            <SelectContent>
              {allPersonnel.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name} ({person.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isExpiringSoon && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Renewal Required</AlertTitle>
                <AlertDescription>
                    This person's ID card is expiring soon and requires renewal.
                </AlertDescription>
            </Alert>
        )}

        <div className="flex justify-center">
          <div className={cn("border rounded-lg p-6 bg-muted/20 w-full max-w-sm shadow-md relative overflow-hidden", isExpiringSoon && "border-destructive")}>
            <div className="flex justify-between items-start mb-6">
                <div className="text-left text-xs text-muted-foreground">
                    <p className="font-bold text-card-foreground">TalantaTrack Academy</p>
                    <p>123 Football Lane, Nairobi, Kenya</p>
                    <p>+254 700 000 000</p>
                </div>
                <Logo className="h-12 w-12" />
            </div>

            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={selectedPerson.avatarUrl} alt={selectedPerson.name} />
                    <AvatarFallback>{selectedPerson.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-xl font-headline">{selectedPerson.name}</h3>
                    <p className="text-muted-foreground">{selectedPerson.role}</p>
                    <p className="text-sm text-primary font-semibold">UPID: TT-{String(selectedPerson.id.split('-')[1]).padStart(4, '0')}</p>
                </div>
            </div>
            
            <Separator className="my-4"/>
            
            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                {selectedPerson.team && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Team</p>
                      <p className="font-semibold">{selectedPerson.team}</p>
                    </div>
                    <div></div>
                  </>
                )}
                <div>
                  <p className="text-muted-foreground">Issued</p>
                  <p className="font-semibold">{issueDate.toLocaleDateString()}</p>
                </div>
                <div className={cn("text-right", isExpiringSoon && "text-destructive")}>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-semibold">{expiryDate.toLocaleDateString()}</p>
                </div>
            </div>
            
            <div className="flex justify-center my-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=UPID:TT-${String(selectedPerson.id.split('-')[1]).padStart(4, '0')}`}
                  width={120}
                  height={120}
                  alt="Player QR Code"
                />
            </div>
            <p className="text-xs text-muted-foreground text-center mb-6">Scan for verification & access</p>

            <div className="text-center text-xs text-muted-foreground absolute bottom-2 left-0 right-0">
                <p>If found, please return to the address above.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
