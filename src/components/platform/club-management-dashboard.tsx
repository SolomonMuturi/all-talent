'use client';

import * as React from 'react';
import { subscriptionPlans, type Club } from '@/lib/platform-data';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, UserCog, KeySquare, FileText, DollarSign, Smartphone, Sparkles, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { InvoiceTemplate } from './invoice-template';

const getStatusVariant = (status: Club['status']) => {
  switch (status) {
    case 'Active':
      return 'default';
    case 'Trialing':
      return 'secondary';
    case 'Canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function ClubManagementDashboard() {
  // State
  const [data, setData] = React.useState<Club[]>([]);
  const [isNewClubDialogOpen, setNewClubDialogOpen] = React.useState(false);
  const [isManageDialogOpen, setManageDialogOpen] = React.useState(false);
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false);
  const [isPayDialogOpen, setPayDialogOpen] = React.useState(false);
  const [isImpersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);

  const [selectedClub, setSelectedClub] = React.useState<Club | null>(null);
  const [impersonateClub, setImpersonateClub] = React.useState<Club | null>(null);

  // New club form state
  const [newClubName, setNewClubName] = React.useState('');
  const [newAdminEmail, setNewAdminEmail] = React.useState('');
  const [newPlan, setNewPlan] = React.useState('');
  const [newMRR, setNewMRR] = React.useState('');
  const [newPlayerCount, setNewPlayerCount] = React.useState('');
  const [newStatus, setNewStatus] = React.useState('Trialing');
  const [newRenewalDate, setNewRenewalDate] = React.useState('');
  const [newLogoUrl, setNewLogoUrl] = React.useState('');

  // Manage Subscription state
  const [managePlan, setManagePlan] = React.useState('');
  const [manageStatus, setManageStatus] = React.useState('');
  const [manageSmsCredits, setManageSmsCredits] = React.useState(0);
  const [manageAiCredits, setManageAiCredits] = React.useState(0);

  // Pay Subscription state
  const [payingPlan, setPayingPlan] = React.useState('');
  const [payingAmount, setPayingAmount] = React.useState(0);
  const [payingLoading, setPayingLoading] = React.useState(false);

  const { toast } = useToast();

  // Fetch clubs from API
  const fetchClubs = React.useCallback(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) setData(result);
        else if (result && Array.isArray(result.data)) setData(result.data);
        else if (result && result.data && Array.isArray(result.data.clubs)) setData(result.data.clubs);
      });
  }, []);

  React.useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // Onboard new club
  const handleOnboardClub = async () => {
    if (!newClubName.trim() || !newAdminEmail.trim()) {
      toast({ title: "Validation Error", description: "Club name and admin email are required.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClubName.trim(),
          adminEmail: newAdminEmail.trim(),
          logoUrl: newLogoUrl.trim(),
          subscriptionPlanId: newPlan || null,
          mrr: newMRR ? parseFloat(newMRR) : 0,
          playerCount: newPlayerCount ? parseInt(newPlayerCount) : 0,
          status: newStatus,
          renewalDate: newRenewalDate || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Club Onboarded!", description: "The club has been added to the platform." });
        setNewClubDialogOpen(false);
        setNewClubName('');
        setNewAdminEmail('');
        setNewPlan('');
        setNewMRR('');
        setNewPlayerCount('');
        setNewStatus('Trialing');
        setNewRenewalDate('');
        setNewLogoUrl('');
        fetchClubs();
      } else {
        throw new Error(data.error || "Failed to onboard club");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Manage Subscription
  const handleManageClub = (club: Club) => {
    setSelectedClub(club);
    setManagePlan(club.subscription_plan_id || '');
    setManageStatus(club.status || 'Trialing');
    setManageSmsCredits(club.smsCredits || 0);
    setManageAiCredits(club.aiCredits || 0);
    setManageDialogOpen(true);
  };

  const handleSaveManage = async () => {
    if (!selectedClub?.id) return;
    try {
      await fetch('/api/clubs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClub.id,
          subscription_plan_id: managePlan,
          status: manageStatus,
          sms_credits: manageSmsCredits,
          ai_credits: manageAiCredits,
        }),
      });
      toast({ title: "Subscription Updated", description: `${selectedClub.name}'s subscription details have been saved.` });
      setManageDialogOpen(false);
      fetchClubs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Pay Subscription
  const handlePaySubscription = (club: Club) => {
    setSelectedClub(club);
    setPayingPlan(club.subscription_plan_id || '');
    const planObj = subscriptionPlans.find(p => p.id === (club.subscription_plan_id || ''));
    setPayingAmount(planObj ? planObj.price : 0);
    setPayDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedClub?.id || !payingPlan) return;
    setPayingLoading(true);
    try {
      const planObj = subscriptionPlans.find(p => p.id === payingPlan);
      const mrr = planObj ? planObj.price : 0;
      // Calculate next renewal date (e.g., 1 month from today)
      const today = new Date();
      const nextRenewal = new Date(today.setMonth(today.getMonth() + 1));
      const renewalDate = nextRenewal.toISOString().slice(0, 10);

      await fetch('/api/clubs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClub.id,
          subscription_plan_id: payingPlan,
          status: 'Active',
          mrr,
          renewal_date: renewalDate,
        }),
      });
      toast({ title: "Payment Successful", description: "Subscription activated." });
      setPayDialogOpen(false);
      setSelectedClub(null);
      setPayingPlan('');
      setPayingAmount(0);
      fetchClubs();
    } catch (err: any) {
      toast({ title: "Payment Failed", description: err.message, variant: "destructive" });
    } finally {
      setPayingLoading(false);
    }
  };

  // View Invoice
  const handleViewInvoice = (club: Club) => {
    if (!club || typeof club.id === 'undefined' || club.id === null) {
      toast({
        variant: "destructive",
        title: "Invoice Error",
        description: "Club ID is missing. Cannot fetch invoice.",
      });
      setInvoiceDialogOpen(false);
      setSelectedClub(null);
      return;
    }
    setSelectedClub(club);
    setInvoiceDialogOpen(true);
  };

  // Impersonate Admin
  const handleImpersonate = (clubName: string, club?: Club) => {
    setImpersonateClub(club || null);
    setImpersonateDialogOpen(true);
  };

  const confirmImpersonate = () => {
    toast({
      title: "Impersonation Mode",
      description: `You are now viewing the platform as an admin for ${impersonateClub?.name}.`,
    });
    setImpersonateDialogOpen(false);
    setImpersonateClub(null);
  };

  // Table columns
  const columns: ColumnDef<Club>[] = [
    {
      accessorKey: 'name',
      header: 'Club',
      cell: ({ row }) => {
        const clubName = row.original?.name || 'Unnamed Club';
        const logoUrl = row.original?.logoUrl || '';
        const adminEmail = row.original?.adminEmail || '';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt={clubName} data-ai-hint="football club logo" />
              ) : (
                <AvatarFallback>{clubName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div className="grid gap-0.5">
              <span className="font-medium">{clubName}</span>
              <span className="text-xs text-muted-foreground">{adminEmail}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subscriptionPlan',
      header: 'Plan',
      cell: ({ row }) => {
        const planId = row.original?.subscription_plan_id;
        const planObj = subscriptionPlans.find(p => p.id === planId);
        const planName = planObj ? planObj.name : planId || 'N/A';
        return <Badge variant="outline">{planName}</Badge>;
      },
    },
    {
      accessorKey: 'mrr',
      header: () => <div className="text-right">MRR</div>,
      cell: ({ row }) => (
        <div className="text-right">
          KES {Number(row.original?.mrr || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'playerCount',
      header: 'Players',
      cell: ({ row }) => row.original?.playerCount ?? row.original?.player_count ?? 0,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original?.status)}>
          {row.original?.status || 'Unknown'}
        </Badge>
      ),
    },
    {
      accessorKey: 'renewalDate',
      header: 'Next Renewal',
      cell: ({ row }) => {
        const date = row.original?.renewalDate || row.original?.renewal_date;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const club = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleViewInvoice(club)}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Last Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleManageClub(club)}>
                  <KeySquare className="mr-2 h-4 w-4" />
                  Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleImpersonate(club?.name || '', club)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Impersonate Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlePaySubscription(club)} disabled={!club?.id}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay Subscription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Managed Clubs</CardTitle>
              <CardDescription>
                An overview of all clubs on the TalantaTrack platform.
              </CardDescription>
            </div>
            <Dialog open={isNewClubDialogOpen} onOpenChange={setNewClubDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Onboard New Club
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Onboard New Club</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new club and send an invite to their administrator.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="club-name" className="text-right">Club Name</Label>
                    <Input
                      id="club-name"
                      placeholder="e.g., Kisumu All-Stars"
                      className="col-span-3"
                      value={newClubName}
                      onChange={e => setNewClubName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="admin-email" className="text-right">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@kisumustars.com"
                      className="col-span-3"
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan" className="text-right">Plan</Label>
                    <Select value={newPlan} onValueChange={setNewPlan}>
                      <SelectTrigger id="plan" className="col-span-3">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mrr" className="text-right">MRR (KES)</Label>
                    <Input
                      id="mrr"
                      type="number"
                      min="0"
                      placeholder="0"
                      className="col-span-3"
                      value={newMRR}
                      onChange={e => setNewMRR(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="player-count" className="text-right">Players</Label>
                    <Input
                      id="player-count"
                      type="number"
                      min="0"
                      placeholder="0"
                      className="col-span-3"
                      value={newPlayerCount}
                      onChange={e => setNewPlayerCount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="status" className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Trialing">Trialing</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="renewal-date" className="text-right">Next Renewal</Label>
                    <Input
                      id="renewal-date"
                      type="date"
                      className="col-span-3"
                      value={newRenewalDate}
                      onChange={e => setNewRenewalDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="logo-url" className="text-right">Logo URL</Label>
                    <Input
                      id="logo-url"
                      placeholder="https://example.com/logo.png"
                      className="col-span-3"
                      value={newLogoUrl}
                      onChange={e => setNewLogoUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleOnboardClub}>
                    Send Invite & Create Club
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <TableRow key={row.original?.id ?? idx}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No clubs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Manage Subscription Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription: {selectedClub?.name}</DialogTitle>
            <DialogDescription>
              Adjust subscription plan, status, and add-on services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sub-plan">Subscription Plan</Label>
                <Select value={managePlan} onValueChange={setManagePlan}>
                  <SelectTrigger id="sub-plan">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name} (KES {plan.price}/mo)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sub-status">Status</Label>
                <Select value={manageStatus} onValueChange={setManageStatus}>
                  <SelectTrigger id="sub-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Trialing">Trialing</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Add-on Services</Label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Credits</p>
                    <p className="text-xs text-muted-foreground">For alerts and notifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={manageSmsCredits}
                    onChange={e => setManageSmsCredits(Number(e.target.value))}
                    className="w-24"
                  />
                  <span>credits</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">AI Analysis Credits</p>
                    <p className="text-xs text-muted-foreground">For fraud detection & report generation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={manageAiCredits}
                    onChange={e => setManageAiCredits(Number(e.target.value))}
                    className="w-24"
                  />
                  <span>credits</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setManageDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel Subscription
            </Button>
            <Button onClick={handleSaveManage}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Subscription Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Subscription</DialogTitle>
            <DialogDescription>
              Select a plan and confirm payment for <b>{selectedClub?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="pay-plan">Subscription Plan</Label>
            <Select
              value={payingPlan}
              onValueChange={val => {
                setPayingPlan(val);
                const planObj = subscriptionPlans.find(p => p.id === val);
                setPayingAmount(planObj ? planObj.price : 0);
              }}
              id="pay-plan"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (KES {plan.price}/mo)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label>Amount</Label>
              <div className="font-bold text-lg">KES {payingAmount.toLocaleString()}</div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleConfirmPayment}
              disabled={!payingPlan || payingLoading}
            >
              {payingLoading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Admin Dialog */}
      <Dialog open={isImpersonateDialogOpen} onOpenChange={setImpersonateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate Admin</DialogTitle>
            <DialogDescription>
              You are about to impersonate the admin of <b>{impersonateClub?.name}</b>. This will allow you to view the platform as if you are the club's admin.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <p className="text-sm text-muted-foreground">
              <b>Warning:</b> Any actions you take will be logged and visible to platform administrators.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setImpersonateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImpersonate}>
              Impersonate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          {selectedClub && <InvoiceTemplate club={selectedClub} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
