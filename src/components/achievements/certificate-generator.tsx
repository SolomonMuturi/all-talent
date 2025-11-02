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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { players } from '@/lib/data';
import { courses } from '@/lib/courses';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const onPitchModules = [
    'Advanced Dribbling & Ball Control',
    'Defensive Positioning Masterclass',
    'Finishing & Shot Power',
];

const tacticalModules = [
    'Tactical Awareness & Game Reading'
]

const offPitchModules = courses.map(course => course.title);

interface CertificateGeneratorProps {
    branding: {
        academyName: string;
        contactInfo: string;
        signatory1: { name: string; title: string };
        signatory2: { name: string; title: string };
    }
}

export function CertificateGenerator({ branding }: CertificateGeneratorProps) {
    const router = useRouter();
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    
    const handleGenerate = () => {
        if(selectedPlayer && selectedModule) {
            const playerName = players.find(p => p.id === parseInt(selectedPlayer))?.name;
            if (playerName) {
              const query = new URLSearchParams({
                  academyName: branding.academyName,
                  contactInfo: branding.contactInfo,
                  s1Name: branding.signatory1.name,
                  s1Title: branding.signatory1.title,
                  s2Name: branding.signatory2.name,
                  s2Title: branding.signatory2.title,
              });
              router.push(`/achievements/certificate/${encodeURIComponent(playerName)}/${encodeURIComponent(selectedModule)}?${query.toString()}`);
            }
        }
    }

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
                  <SelectGroup>
                    <SelectLabel>On-Pitch Skills</SelectLabel>
                    {onPitchModules.map((module) => (
                        <SelectItem key={module} value={module}>
                        {module}
                        </SelectItem>
                    ))}
                  </SelectGroup>
                   <SelectGroup>
                    <SelectLabel>Tactical & Mental</SelectLabel>
                    {tacticalModules.map((module) => (
                        <SelectItem key={module} value={module}>
                        {module}
                        </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Off-Pitch Development</SelectLabel>
                    {offPitchModules.map((module) => (
                        <SelectItem key={module} value={module}>
                        {module}
                        </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
            </Select>
        </div>

        <Button className="w-full" disabled={!selectedPlayer || !selectedModule} onClick={handleGenerate}>
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
