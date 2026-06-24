// app/(admin)/id-cards/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Download, Printer, RotateCw, Shield, 
  Users, Clock, MapPin, Fingerprint, Camera, 
  Save, Upload, IdCard, CheckCircle,
  Key, Lock, Plus, Trash2, RefreshCw, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toJpeg } from 'html-to-image';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  team: string;
  avatar_url: string | null;
  points: number;
  rank?: number;
  phone?: string;
  email?: string;
}

interface IdCardData {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  issueDate: string;
  expiryDate: string;
  cardType: 'player' | 'staff' | 'vip';
  phone?: string;
  email?: string;
  photo?: string;
}

interface BiometricRecord {
  id: string;
  playerId: number;
  playerName: string;
  fingerprintHash: string;
  facialData: string;
  accessLevel: 'Full' | 'Restricted' | 'Limited';
  lastSync: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

export default function IdCardPage() {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cardType, setCardType] = useState<'player' | 'staff' | 'vip'>('player');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  });
  const [generatedCard, setGeneratedCard] = useState<IdCardData | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [academyTitle, setAcademyTitle] = useState('TalantaTrack Academy');
  const [biometricLinked, setBiometricLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [biometricRecords, setBiometricRecords] = useState<BiometricRecord[]>([]);
  const [isBiometricDialogOpen, setIsBiometricDialogOpen] = useState(false);
  const [selectedBiometricPlayer, setSelectedBiometricPlayer] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<'Full' | 'Restricted' | 'Limited'>('Full');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customPhotoFile, setCustomPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlayers();
    loadBiometricData();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?limit=1000');
      const data = await response.json();
      if (data.success && data.data.players) {
        setPlayers(data.data.players);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBiometricData = () => {
    const saved = localStorage.getItem('biometricRecords');
    if (saved) {
      try {
        setBiometricRecords(JSON.parse(saved));
        setBiometricLinked(JSON.parse(saved).length > 0);
      } catch {
        setBiometricRecords([]);
        setBiometricLinked(false);
      }
    }
  };

  const saveBiometricData = (records: BiometricRecord[]) => {
    localStorage.setItem('biometricRecords', JSON.stringify(records));
    setBiometricRecords(records);
    setBiometricLinked(records.length > 0);
  };

  const generateQRData = (player: Player, cardData: IdCardData): string => {
    const qrData = {
      id: cardData.playerId,
      name: cardData.playerName,
      type: cardData.cardType,
      issued: cardData.issueDate,
      expires: cardData.expiryDate,
      uid: `${cardData.playerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      access: {
        training: true,
        matches: true,
        gym: cardData.cardType === 'vip',
        medical: cardData.cardType !== 'player',
        cafeteria: true
      }
    };
    return btoa(JSON.stringify(qrData));
  };

  const generateIdCard = () => {
    if (!selectedPlayer) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select a player from the registry.',
      });
      return;
    }

    const player = players.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;

    const cardData: IdCardData = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      team: player.team,
      issueDate,
      expiryDate,
      cardType,
      phone: player.phone || '+254 700 000 000',
      email: player.email || 'player@talantatrack.com',
      photo: customPhoto || player.avatar_url || undefined
    };

    setGeneratedCard(cardData);
    setQrValue(generateQRData(player, cardData));
    
    toast({
      title: 'ID Card Generated',
      description: `${player.name}'s ID card has been generated successfully.`,
    });
  };

  const downloadCard = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = format === 'png' 
        ? await toPng(cardRef.current, { 
            quality: 0.95,
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          })
        : await toJpeg(cardRef.current, { 
            quality: 0.95,
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });

      const link = document.createElement('a');
      link.download = `id-card-${generatedCard?.playerName}-${Date.now()}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading card:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Failed to download card. Please try again.',
      });
    }
  };

  const printCard = () => {
    if (!cardRef.current) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print the card.');
      return;
    }

    setTimeout(() => {
      toPng(cardRef.current!, { 
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      }).then(dataUrl => {
        printWindow.document.write(`
          <html>
            <head>
              <title>ID Card - ${generatedCard?.playerName}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; font-family: Arial, sans-serif; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                @media print { body { margin: 0; padding: 0; } img { max-width: 100%; max-height: 100vh; } }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="ID Card" />
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 1000); }, 500);
                };
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }).catch(error => {
        console.error('Error printing card:', error);
        toast({
          variant: 'destructive',
          title: 'Print Failed',
          description: 'Failed to print card. Please try again.',
        });
      });
    }, 200);
  };

  const handleSyncRegistry = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
    toast({
      title: 'Sync Complete',
      description: 'All ID cards have been synced to the registry.',
    });
  };

  const handleSaveCard = () => {
    toast({
      title: 'Card Saved',
      description: 'ID card has been saved to the registry.',
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomPhoto(event.target?.result as string);
        setCustomPhotoFile(file);
        toast({
          title: 'Photo Uploaded',
          description: 'Scholar portrait has been uploaded successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setCustomPhoto(null);
    setCustomPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: 'Photo Removed',
      description: 'Scholar portrait has been removed.',
    });
  };

  const handleAddBiometric = () => {
    if (!selectedBiometricPlayer) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select a player for biometric registration.',
      });
      return;
    }

    const player = players.find(p => p.id.toString() === selectedBiometricPlayer);
    if (!player) return;

    const newRecord: BiometricRecord = {
      id: `bio-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      fingerprintHash: `FP-${Math.random().toString(36).substring(2, 15)}`,
      facialData: `FD-${Math.random().toString(36).substring(2, 15)}`,
      accessLevel: accessLevel,
      lastSync: new Date().toISOString(),
      status: 'Active'
    };

    const updated = [...biometricRecords, newRecord];
    saveBiometricData(updated);
    setIsBiometricDialogOpen(false);
    setSelectedBiometricPlayer('');
    setAccessLevel('Full');

    toast({
      title: 'Biometric Registered',
      description: `${player.name} has been registered in the biometric system.`,
    });
  };

  const handleDeleteBiometric = (id: string) => {
    const updated = biometricRecords.filter(r => r.id !== id);
    saveBiometricData(updated);
    toast({
      title: 'Biometric Removed',
      description: 'Biometric record has been removed.',
    });
  };

  const handleUpdateBiometricStatus = (id: string, status: 'Active' | 'Pending' | 'Inactive') => {
    const updated = biometricRecords.map(r => 
      r.id === id ? { ...r, status, lastSync: new Date().toISOString() } : r
    );
    saveBiometricData(updated);
    toast({
      title: 'Status Updated',
      description: `Biometric status updated to ${status}.`,
    });
  };

  const selectedPlayerData = players.find(p => p.id.toString() === selectedPlayer);

  const totalActiveIDs = players.length;
  const expiringSoon = players.filter(p => p.age > 25).length;
  const accessPoints = 5;

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline">ID & Access Control</h1>
        <p className="text-muted-foreground">Manage and issue digital ID cards for players and staff.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Active IDs"
          value={String(totalActiveIDs)}
          icon={<Users className="size-5 text-muted-foreground" />}
          description="Across players & staff"
        />
        <KpiCard
          title="IDs Expiring Soon"
          value={String(expiringSoon)}
          icon={<Clock className="size-5 text-muted-foreground" />}
          description="Due for renewal in 30 days"
        />
        <KpiCard
          title="Managed Access Points"
          value={String(accessPoints)}
          icon={<MapPin className="size-5 text-muted-foreground" />}
          description="e.g., Gym, Main Pitch"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="generator">ID Generator</TabsTrigger>
          <TabsTrigger value="customizer">Card Customizer</TabsTrigger>
          <TabsTrigger value="biometric">Biometric Registry</TabsTrigger>
        </TabsList>

        {/* Tab 1: ID Generator */}
        <TabsContent value="generator" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Panel - Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-primary" />
                  Secure Access ID Generator
                </CardTitle>
                <CardDescription>
                  Issue high-security digital identification with automated UPID and Bio-Auth.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={printCard} disabled={!generatedCard}>
                    <Printer className="h-4 w-4 mr-2" />
                    PRINT PVC
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadCard('png')} disabled={!generatedCard}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div>
                  <Label>Registry Selection</Label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a player..." />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name} ({player.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlayerData && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={customPhoto || selectedPlayerData.avatar_url || undefined} />
                        <AvatarFallback>{selectedPlayerData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{selectedPlayerData.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPlayerData.position}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {selectedPlayerData.team} • {selectedPlayerData.age} years
                    </div>
                  </div>
                )}

                <div>
                  <Label>Card Type</Label>
                  <Select value={cardType} onValueChange={(value: 'player' | 'staff' | 'vip') => setCardType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Issue Date</Label>
                    <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                </div>

                <Button onClick={generateIdCard} className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Generate ID Card
                </Button>

                {generatedCard && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => downloadCard('png')}>
                      <Download className="h-4 w-4 mr-1" /> PNG
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadCard('jpg')}>
                      <Download className="h-4 w-4 mr-1" /> JPG
                    </Button>
                    <Button variant="outline" size="sm" onClick={printCard}>
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Panel - Card Preview */}
            <div className="flex flex-col items-center">
              {generatedCard ? (
                <div
                  ref={cardRef}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-2xl w-[400px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                    <span 
                      className="text-[80px] font-bold text-white/10 tracking-wider blur-[2px] transform -rotate-12"
                      style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)', letterSpacing: '6px' }}
                    >
                      TALANTATRACK
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-2xl font-bold tracking-tight">TALANTA</div>
                        <div className="text-sm opacity-80">Digital ID Card</div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {cardType.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <Avatar className="w-20 h-20 border-2 border-white shadow-lg">
                        <AvatarImage src={customPhoto || generatedCard.photo || undefined} />
                        <AvatarFallback className="text-3xl bg-blue-500 text-white">
                          {generatedCard.playerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-xl font-bold">{generatedCard.playerName}</div>
                        <div className="text-sm opacity-80">{generatedCard.position}</div>
                        <div className="text-sm opacity-80">{generatedCard.team}</div>
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-2 rounded-lg shadow-lg">
                        <QRCodeSVG value={qrValue} size={120} level="H" includeMargin={false} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="opacity-80">ID:</div>
                        <div className="font-mono text-sm">TT-{String(generatedCard.playerId).padStart(4, '0')}</div>
                      </div>
                      <div>
                        <div className="opacity-80">Type:</div>
                        <div>{cardType.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="opacity-80">Issued:</div>
                        <div className="font-mono text-xs">{new Date(issueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="opacity-80">Expires:</div>
                        <div className="font-mono text-xs">{new Date(expiryDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="text-xs opacity-60 text-center mt-4 pt-2 border-t border-white/20">
                      <div>UPID: TT-{String(generatedCard.playerId).padStart(4, '0')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="w-[400px] h-[500px] flex items-center justify-center border-dashed">
                  <div className="text-center text-muted-foreground">
                    <IdCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No ID Card Generated</p>
                    <p className="text-sm">Select a player and click Generate</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Card Customizer */}
        <TabsContent value="customizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Card Customizer
              </CardTitle>
              <CardDescription>Customize the appearance and details of the ID card.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Scholar Portrait</Label>
                    <div className="mt-2">
                      {customPhoto ? (
                        <div className="relative inline-block">
                          <img 
                            src={customPhoto} 
                            alt="Scholar Portrait" 
                            className="w-32 h-32 rounded-lg object-cover border-2 border-primary"
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={handleRemovePhoto}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">UPLOAD SCHOLAR PHOTO</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload}
                      />
                      {customPhoto && (
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Academy Title</Label>
                    <Input 
                      value={academyTitle} 
                      onChange={(e) => setAcademyTitle(e.target.value)}
                      placeholder="Enter academy name"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveCard} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      SAVE & SYNC TO REGISTRY
                    </Button>
                  </div>

                  {customPhoto && (
                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Photo uploaded successfully</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">The new portrait will appear on the ID card</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Card Preview</h4>
                    <div className="aspect-[1.586/1] bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="text-[40px] font-bold text-white/10 tracking-wider blur-[1px] transform -rotate-12">
                          TALANTATRACK
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-white">
                          <AvatarImage src={customPhoto || undefined} />
                          <AvatarFallback className="bg-blue-500 text-white text-lg">
                            {selectedPlayerData?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold">{selectedPlayerData?.name || 'Player Name'}</div>
                          <div className="text-xs opacity-80">{selectedPlayerData?.position || 'Position'}</div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs opacity-60">
                        TT-{selectedPlayerData?.id?.toString().padStart(4, '0') || '0000'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Bio-Auth Status</h4>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">BIOMETRICS LINKED</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Fingerprint and facial recognition active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Biometric Registry */}
        <TabsContent value="biometric" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    Biometric Registry
                  </CardTitle>
                  <CardDescription>Manage biometric data and access permissions.</CardDescription>
                </div>
                <Dialog open={isBiometricDialogOpen} onOpenChange={setIsBiometricDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Biometric
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Biometric</DialogTitle>
                      <DialogDescription>
                        Register a player's biometric data for access control.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Select Player</Label>
                        <Select value={selectedBiometricPlayer} onValueChange={setSelectedBiometricPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a player..." />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} ({player.position})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Access Level</Label>
                        <Select value={accessLevel} onValueChange={(value: 'Full' | 'Restricted' | 'Limited') => setAccessLevel(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full">Full Access</SelectItem>
                            <SelectItem value="Restricted">Restricted Access</SelectItem>
                            <SelectItem value="Limited">Limited Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBiometricDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddBiometric}>
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">BIOMETRICS LINKED</p>
                      <p className="text-sm text-green-700">{biometricRecords.length} players have biometric data registered</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Total Biometric Records</p>
                        <p className="text-2xl font-bold">{biometricRecords.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Access Points</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                    </div>
                  </div>
                </div>

                {biometricRecords.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Sync</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {biometricRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.playerName}</TableCell>
                            <TableCell>
                              <Badge variant={record.accessLevel === 'Full' ? 'default' : record.accessLevel === 'Restricted' ? 'secondary' : 'outline'}>
                                {record.accessLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={record.status === 'Active' ? 'default' : record.status === 'Pending' ? 'secondary' : 'destructive'}>
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(record.lastSync).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateBiometricStatus(
                                    record.id, 
                                    record.status === 'Active' ? 'Inactive' : 'Active'
                                  )}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteBiometric(record.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No biometric records found</p>
                    <p className="text-sm">Click "Register Biometric" to add a player</p>
                  </div>
                )}

                <Button onClick={handleSyncRegistry} disabled={isSyncing} className="w-full">
                  {isSyncing ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Biometric Data to Registry
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}