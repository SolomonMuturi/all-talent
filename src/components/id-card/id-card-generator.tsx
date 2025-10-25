'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function IdCardGenerator() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(String(players[0].id));

  const selectedPlayer = players.find(p => p.id === parseInt(selectedPlayerId)) || players[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Digital ID Card Generator</CardTitle>
        <CardDescription>Select a player to generate their digital ID card with a unique QR code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium">Player</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                {players.map((player) => (
                    <SelectItem key={player.id} value={String(player.id)}>
                    {player.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        <div className="flex justify-center">
            <div className="border rounded-lg p-6 bg-muted/20 w-full max-w-sm shadow-md">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedPlayer.avatarUrl} alt={selectedPlayer.name} />
                        <AvatarFallback>{selectedPlayer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-xl font-headline">{selectedPlayer.name}</h3>
                        <p className="text-muted-foreground">{selectedPlayer.position}</p>
                        <p className="text-sm text-primary font-semibold">UPID: TT-{String(selectedPlayer.id).padStart(4, '0')}</p>
                    </div>
                </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Team</p>
                  <p className="font-semibold">{selectedPlayer.team}</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-semibold">{selectedPlayer.age}</p>
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
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=UPID:TT-${String(selectedPlayer.id).padStart(4, '0')}`}
                      width={120}
                      height={120}
                      alt="Player QR Code"
                    />
                </div>
              <p className="text-xs text-muted-foreground text-center">Scan for verification & access</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
