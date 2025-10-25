'use client';

import { Download, Award } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { players } from '@/lib/data';
import { useState } from 'react';

const trainingModules = [
    'Advanced Dribbling & Ball Control',
    'Defensive Positioning Masterclass',
    'Finishing & Shot Power',
    'Tactical Awareness & Game Reading'
];

export function CertificateGenerator() {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Award className="size-5" /> Certificate Generation
        </CardTitle>
        <CardDescription>
          Generate and download certificates for players who have completed training modules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <label className="text-sm font-medium">Player</label>
            <Select onValueChange={setSelectedPlayer}>
                <SelectTrigger>
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
         <div>
            <label className="text-sm font-medium">Training Module</label>
            <Select onValueChange={setSelectedModule}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                {trainingModules.map((module) => (
                    <SelectItem key={module} value={module}>
                    {module}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        <Button className="w-full" disabled={!selectedPlayer || !selectedModule}>
            <Download className="mr-2 h-4 w-4" />
            Generate Certificate
        </Button>

        {selectedPlayer && selectedModule && (
            <div className="mt-4 border rounded-lg p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                <p>Preview for <strong>{players.find(p => p.id === parseInt(selectedPlayer))?.name}</strong></p>
                <p>Module: <strong>{selectedModule}</strong></p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
