'use client';

import type { Player } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Award, BookCopy, Printer, Trophy, ShieldX, HeartPulse } from 'lucide-react';

const severityVariant = {
  Low: 'secondary',
  Medium: 'default',
  High: 'destructive',
} as const;

export function PlayerBook({ player }: { player: Player }) {

    const handlePrint = () => {
        window.print();
    }

  return (
    <>
     <style jsx global>{`
        @media print {
          body {
            background-color: white;
          }
          .no-print {
            display: none;
          }
          #player-book {
            border: none;
            box-shadow: none;
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
        <div className="absolute top-4 right-4 no-print">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print / Download PDF</Button>
        </div>
        <div id="player-book" className="max-w-4xl mx-auto p-8 bg-background text-foreground rounded-lg shadow-lg border">
        
        <header className="flex flex-col items-center text-center pb-8 border-b-2 border-primary">
            <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary ring-offset-4 ring-offset-background">
              <AvatarImage src={player.avatarUrl} alt={player.name} />
              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold font-headline">{player.name}</h1>
            <h2 className="text-xl text-muted-foreground font-medium">{player.position}</h2>
            <div className="flex gap-4 mt-4 text-sm">
                <span>Team: <span className="font-semibold">{player.team}</span></span>
                <span>Age: <span className="font-semibold">{player.age}</span></span>
                <span>Rank: <span className="font-semibold">#{player.rank}</span></span>
            </div>
        </header>

        <main className="mt-8 space-y-12">
            {/* Performance Metrics */}
            <section>
                <h3 className="text-2xl font-semibold font-headline mb-4">Skills Assessment</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Physical</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(player.performanceMetrics.physical).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <h5 className="capitalize font-medium text-sm text-muted-foreground">{key}</h5>
                                <Progress value={value} aria-label={`${key} score`} />
                                <p className="text-right font-bold">{value}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-3 text-primary">Technical</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(player.performanceMetrics.technical).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <h5 className="capitalize font-medium text-sm text-muted-foreground">{key}</h5>
                                <Progress value={value} aria-label={`${key} score`} />
                                <p className="text-right font-bold">{value}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-3 text-primary">Tactical & Psycho-Social</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(player.performanceMetrics.tactical).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <h5 className="capitalize font-medium text-sm text-muted-foreground">{key}</h5>
                                <Progress value={value} aria-label={`${key} score`} />
                                <p className="text-right font-bold">{value}</p>
                            </div>
                        ))}
                        {Object.entries(player.performanceMetrics.psychoSocial).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <h5 className="capitalize font-medium text-sm text-muted-foreground">{key}</h5>
                                <Progress value={value} aria-label={`${key} score`} />
                                <p className="text-right font-bold">{value}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </section>
            
            <Separator />
            
            {/* History Section */}
            <section className="grid md:grid-cols-2 gap-12">
                <div>
                     <h3 className="text-2xl font-semibold font-headline mb-4 flex items-center gap-2"><ShieldX /> Disciplinary Log</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Infraction</TableHead>
                                <TableHead>Severity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {player.disciplinaryLog.length > 0 ? (
                                player.disciplinaryLog.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.infraction}</TableCell>
                                        <TableCell><Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">No infractions recorded.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <div>
                     <h3 className="text-2xl font-semibold font-headline mb-4 flex items-center gap-2"><HeartPulse/> Injury Log</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Injury</TableHead>
                                <TableHead>Severity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {player.injuryLog.length > 0 ? (
                                player.injuryLog.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.injury}</TableCell>
                                        <TableCell><Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">No injuries recorded.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
            
            <Separator />

             {/* Achievements */}
            <section>
                <h3 className="text-2xl font-semibold font-headline mb-4 flex items-center gap-2"><Trophy /> Achievements & Certificates</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Achievement / Certificate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {player.certificates.length > 0 ? (
                            player.certificates.map((cert) => (
                                <TableRow key={cert.id}>
                                    <TableCell>{new Date(cert.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Award className="h-4 w-4 text-muted-foreground" />
                                        {cert.moduleName}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={2} className="h-24 text-center">No certificates earned.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </section>
        </main>
        
        <footer className="mt-12 pt-4 border-t text-xs text-muted-foreground text-center">
            <p>TalantaTrack Player Book &copy; {new Date().getFullYear()}</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
        </footer>
    </div>
    </>
  );
}
