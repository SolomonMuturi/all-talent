'use client';

import { Logo } from '@/components/icons';
import { Button } from '../ui/button';
import { Download, Printer } from 'lucide-react';
import { Club, ADDON_PRICES } from '@/lib/platform-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import Image from 'next/image';

interface InvoiceTemplateProps {
    club: Club;
}

export function InvoiceTemplate({ club }: InvoiceTemplateProps) {
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(invoiceDate.getDate() + 14);

  const lineItems = [
      { description: `Subscription: ${club.subscriptionPlan.name} Plan`, price: club.subscriptionPlan.price, details: `For period ${invoiceDate.toLocaleString('default', { month: 'long' })} ${invoiceDate.getFullYear()}`},
      ...(club.smsCredits > 0 ? [{ description: `SMS Credits Bundle`, price: club.smsCredits * ADDON_PRICES.smsCredit, details: `${club.smsCredits} credits @ KES ${ADDON_PRICES.smsCredit} each` }] : []),
      ...(club.aiCredits > 0 ? [{ description: `AI Analysis Credits`, price: club.aiCredits * ADDON_PRICES.aiCredit, details: `${club.aiCredits} credits @ KES ${ADDON_PRICES.aiCredit} each` }] : []),
  ]

  const subtotal = lineItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const paymentData = `M-Pesa Paybill: 123456, Account: ${club.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentData)}`;


  const handlePrint = () => {
    window.print();
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-to-print, #invoice-to-print * {
            visibility: visible;
          }
          #invoice-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            min-height: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div id="invoice-to-print" className="bg-background p-4 sm:p-8">
        <div className="w-full max-w-2xl mx-auto bg-card text-card-foreground rounded-lg shadow-lg">
            <div className="p-8">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <Logo className="h-16 w-16 mb-4" />
                        <h2 className="font-bold text-lg">TalantaTrack Inc.</h2>
                        <p className="text-sm text-muted-foreground">Nairobi, Kenya</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold font-headline text-primary">INVOICE</h1>
                        <p className="text-muted-foreground">#INV-{String(club.id.split('_')[1]).padStart(4, '0')}-{invoiceDate.getFullYear()}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">BILL TO</h3>
                        <div className='flex items-center gap-3'>
                             <Image
                                src={club.logoUrl}
                                alt={`${club.name} logo`}
                                width={40}
                                height={40}
                                className="rounded-md object-contain"
                            />
                            <div>
                                <p className="font-bold">{club.name}</p>
                                <p className="text-muted-foreground">{club.adminEmail}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold">Invoice Date:</span> {invoiceDate.toLocaleDateString()}</p>
                        <p><span className="font-semibold">Due Date:</span> {dueDate.toLocaleDateString()}</p>
                    </div>
                </section>

                <section>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount (KES)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lineItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <p className="font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">{item.details}</p>
                                    </TableCell>
                                    <TableCell className="text-right">{item.price.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>KES {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VAT (16%)</span>
                            <span>KES {tax.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Due</span>
                            <span>KES {total.toLocaleString()}</span>
                        </div>
                    </div>
                </section>
                
                 <footer className="mt-16 flex justify-between items-end">
                    <div className="text-left text-xs text-muted-foreground">
                        <p className="font-semibold">Thank you for your business!</p>
                        <p>Payments can be made via M-Pesa Paybill 123456, Account: {club.id}.</p>
                    </div>
                    <div className="text-center">
                        <Image src={qrCodeUrl} width={80} height={80} alt="Payment QR Code" />
                        <p className="text-xs text-muted-foreground mt-1">Scan to Pay</p>
                    </div>
                </footer>
            </div>
            <div className="bg-muted/50 p-4 flex justify-end gap-2 no-print rounded-b-lg">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </div>
        </div>
      </div>
    </>
  );
}
