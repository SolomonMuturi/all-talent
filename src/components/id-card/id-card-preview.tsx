'use client';

import Image from 'next/image';
import { Ticket, User, Calendar, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function IdCardPreview() {
  const player = players[0]; // Example player

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Digital ID Card Preview</CardTitle>
        <CardDescription>This is an example of a player's digital ID card with QR code access.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <div className="border rounded-lg p-6 bg-card w-full max-w-sm shadow-md">
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-xl font-headline">{player.name}</h3>
                    <p className="text-muted-foreground">{player.position}</p>
                    <p className="text-sm text-primary font-semibold">UPID: TT-{String(player.id).padStart(4, '0')}</p>
                </div>
            </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 my-4 text-sm">
            <div>
              <p className="text-muted-foreground">Team</p>
              <p className="font-semibold">{player.team}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Age</p>
                <p className="font-semibold">{player.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issued</p>
              <p className="font-semibold">2024-01-01</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Expires</p>
              <p className="font-semibold">2025-01-01</p>
            </div>
          </div>
           <div className="flex justify-center my-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=UPID:TT-${String(player.id).padStart(4, '0')}`}
                  width={120}
                  height={120}
                  alt="Player QR Code"
                />
            </div>
          <p className="text-xs text-muted-foreground text-center">Scan for verification & access</p>
        </div>
      </CardContent>
    </Card>
  );
}