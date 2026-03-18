'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, QrCode, Printer, RotateCw, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toJpeg } from 'html-to-image';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  team: string;
  avatar_url: string | null;
  points: number;
  rank?: number;
}

interface IdCardData {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  issueDate: string;
  expiryDate: string;
  cardType: 'player' | 'staff' | 'vip';
}

function IdCardGenerator() {
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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlayers();
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

  const generateQRData = (player: Player, cardData: IdCardData): string => {
    // Create a unique JSON string for the QR code
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
    
    // Return as base64 encoded JSON for smaller QR code
    return btoa(JSON.stringify(qrData));
  };

  const generateIdCard = () => {
    if (!selectedPlayer) {
      alert('Please select a player');
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
      cardType
    };

    setGeneratedCard(cardData);
    setQrValue(generateQRData(player, cardData));
  };

  const downloadCard = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;

    try {
      const dataUrl = format === 'png' 
        ? await toPng(cardRef.current, { quality: 0.95 })
        : await toJpeg(cardRef.current, { quality: 0.95 });

      const link = document.createElement('a');
      link.download = `id-card-${generatedCard?.playerName}-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  const printCard = () => {
    if (!cardRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    toPng(cardRef.current, { quality: 0.95 }).then(dataUrl => {
      printWindow.document.write(`
        <html>
          <head>
            <title>ID Card - ${generatedCard?.playerName}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100vh; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
  };

  const shareCard = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `id-card-${generatedCard?.playerName}.png`, { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: `ID Card - ${generatedCard?.playerName}`,
          text: `Digital ID card for ${generatedCard?.playerName}`,
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Card image copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('Copy to clipboard is not supported in this browser. You can download the image instead.');
        }
      }
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };

  const scanQRCode = () => {
    if (!qrValue) return;
    
    try {
      const qrData = JSON.parse(atob(qrValue));
      alert(`
        ID Card Details:
        Name: ${qrData.name}
        ID: ${qrData.id}
        Type: ${qrData.type}
        Issued: ${qrData.issued}
        Expires: ${qrData.expires}
        Access: ${Object.entries(qrData.access)
          .filter(([_, has]) => has)
          .map(([area]) => area)
          .join(', ')}
      `);
    } catch (error) {
      console.error('Error parsing QR code:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading players...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="player">Select Player</Label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger id="player">
                    <SelectValue placeholder="Choose a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name} - {player.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cardType">Card Type</Label>
                <Select value={cardType} onValueChange={(value: 'player' | 'staff' | 'vip') => setCardType(value)}>
                  <SelectTrigger id="cardType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <Button onClick={generateIdCard} className="w-full">
                Generate ID Card
              </Button>
            </div>

            {generatedCard && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadCard('png')}>
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCard('jpg')}>
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                  <Button variant="outline" size="sm" onClick={printCard}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareCard}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={scanQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generateIdCard()}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedCard && (
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-2xl w-[400px] relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
            </div>

            {/* Card Header */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold">TALANTA</div>
                  <div className="text-sm opacity-80">Digital ID Card</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono bg-white/20 px-2 py-1 rounded">
                    {cardType.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Player Info */}
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold border-2 border-white">
                  {generatedCard.playerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold">{generatedCard.playerName}</div>
                  <div className="text-sm opacity-80">{generatedCard.position}</div>
                  <div className="text-sm opacity-80">{generatedCard.team}</div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    value={qrValue}
                    size={150}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <div className="opacity-80">Issued:</div>
                  <div className="font-mono">{new Date(issueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="opacity-80">Expires:</div>
                  <div className="font-mono">{new Date(expiryDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="text-xs opacity-60 text-center mt-4 pt-2 border-t border-white/20">
                <div>ID: {generatedCard.playerId}</div>
                <div>This card is property of Talanta Sports</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IdCardGenerator;