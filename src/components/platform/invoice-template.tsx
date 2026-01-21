'use client';

import { Logo } from '@/components/icons';
import { Button } from '../ui/button';
import { Printer, Download, Mail, CreditCard, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Club, ADDON_PRICES, subscriptionPlans } from '@/lib/platform-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface InvoiceTemplateProps {
  club: Club;
}

export function InvoiceTemplate({ club }: InvoiceTemplateProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchInvoiceData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/clubs/${club.id}/invoices`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setInvoice(data.invoice || null);
        }
      } catch {
        if (isMounted) setInvoice(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchInvoiceData();
    return () => { isMounted = false; };
  }, [club.id]);

  // Invoice dates
  const invoiceDate = invoice?.date ? new Date(invoice.date) : new Date();
  const dueDate = invoice?.dueDate ? new Date(invoice.dueDate) : (() => {
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + 14);
    return d;
  })();
  
  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;

  // Club and plan data
  const clubName = club?.name || "Unnamed Club";
  const planId = club?.subscription_plan_id || club?.subscriptionPlan?.id || "";
  const planObj = subscriptionPlans.find((p) => p.id === planId);
  const planName = planObj?.name || club?.subscriptionPlan?.name || planId || "N/A";
  const planPrice = planObj?.price || club?.subscriptionPlan?.price || club?.mrr || 0;

  // Invoice items
  const lineItems = invoice?.lineItems?.length > 0 
    ? invoice.lineItems 
    : [
        { 
          description: `${planName} Plan`, 
          price: planPrice, 
          details: `Monthly subscription for ${format(invoiceDate, 'MMMM yyyy')}`
        },
        ...(club.smsCredits > 0 ? [{ 
          description: `SMS Credits`, 
          price: club.smsCredits * ADDON_PRICES.smsCredit, 
          details: `${club.smsCredits} credits @ KES ${ADDON_PRICES.smsCredit.toLocaleString()} each`
        }] : []),
        ...(club.aiCredits > 0 ? [{ 
          description: `AI Analysis Credits`, 
          price: club.aiCredits * ADDON_PRICES.aiCredit, 
          details: `${club.aiCredits} credits @ KES ${ADDON_PRICES.aiCredit.toLocaleString()} each`
        }] : []),
      ];

  const subtotal = lineItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const tax = invoice?.tax ?? subtotal * 0.16;
  const total = invoice?.total ?? subtotal + tax;

  // Payment data
  const paymentData = `M-Pesa Paybill: 123456, Account: ${club.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentData)}`;

  const handlePrint = () => window.print();
  const handleDownload = () => console.log('Downloading invoice...');
  const handleEmail = () => console.log('Sending invoice via email...');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 100vh;
            background: white;
            padding: 2rem;
          }
          .no-print { display: none !important; }
        }
        @page { margin: 20mm; }
      `}</style>

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Invoice #{invoice?.number || `INV-${String(club.id.split('_')[1] || '0000').padStart(4, '0')}-${invoiceDate.getFullYear()}`}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(dueDate, "MMM dd, yyyy")}</span>
              </div>
              <Badge variant={isOverdue ? "destructive" : daysUntilDue <= 3 ? "secondary" : "outline"}>
                {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` : 
                 daysUntilDue === 0 ? "Due Today" :
                 `Due in ${daysUntilDue} days`}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 no-print">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <Card id="invoice-print" className="shadow-xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Logo className="h-12 w-12 text-primary-foreground" />
                <div>
                  <h2 className="text-2xl font-bold">TalantaTrack Inc.</h2>
                  <p className="text-primary-foreground/80">Nairobi, Kenya • VAT: KE123456789</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl md:text-4xl font-bold">INVOICE</h1>
                <p className="text-primary-foreground/80 mt-2">
                  #{invoice?.number || `INV-${String(club.id.split('_')[1] || '0000').padStart(4, '0')}-${invoiceDate.getFullYear()}`}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            {/* Bill To & Invoice Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-2 h-5 bg-primary rounded-full"></span>
                  BILL TO
                </h3>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="relative h-14 w-14 flex-shrink-0">
                    <Image
                      src={club.logoUrl}
                      alt={`${club.name} logo`}
                      fill
                      className="rounded-lg object-cover border"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{clubName}</p>
                    <p className="text-muted-foreground">{club.adminEmail}</p>
                    <p className="text-sm text-muted-foreground">ID: {club.id}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-2 h-5 bg-primary rounded-full"></span>
                  INVOICE DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{format(invoiceDate, "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {format(dueDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">Net 14 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="text-right font-semibold">Amount (KES)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">{item.details}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(item.price).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (16%)</span>
                  <span className="font-medium">KES {tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold bg-primary/5 p-4 rounded-lg">
                  <span>Total Due</span>
                  <span className="text-primary">KES {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mt-12 pt-8 border-t">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Payment Instructions
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>M-Pesa Paybill:</strong> 123456</p>
                    <p><strong>Account Number:</strong> {club.id}</p>
                    <p className="text-muted-foreground">Include invoice number as reference</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    Bank Transfer
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Bank:</strong> Equity Bank</p>
                    <p><strong>Account:</strong> 1234567890</p>
                    <p><strong>SWIFT:</strong> EQBLKENA</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg border shadow-sm">
                    <Image 
                      src={qrCodeUrl} 
                      width={120} 
                      height={120} 
                      alt="Payment QR Code" 
                      className="rounded"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scan with M-Pesa</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Thank you for your business! For questions, contact support@talantatrack.com</p>
              <p className="mt-1">This is an auto-generated invoice. No signature required.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}