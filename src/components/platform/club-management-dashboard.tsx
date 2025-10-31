'use client';

import * as React from 'react';
import { clubs as initialClubs, subscriptionPlans, type Club, type SubscriptionPlan } from '@/lib/platform-data';
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
import { MoreHorizontal, PlusCircle, UserCog, KeySquare, FileText, Trash2, Smartphone, Sparkles, X } from 'lucide-react';
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
  const [data, setData] = React.useState(initialClubs);
  const [isNewClubDialogOpen, setNewClubDialogOpen] = React.useState(false);
  const [isManageDialogOpen, setManageDialogOpen] = React.useState(false);
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false);
  const [selectedClub, setSelectedClub] = React.useState<Club | null>(null);
  const { toast } = useToast();

  const handleImpersonate = (clubName: string) => {
    toast({
        title: "Impersonation Mode",
        description: `You are now viewing the platform as an admin for ${clubName}.`
    });
  }
  
  const handleManageClub = (club: Club) => {
    setSelectedClub(club);
    setManageDialogOpen(true);
  };
  
  const handleViewInvoice = (club: Club) => {
    setSelectedClub(club);
    setInvoiceDialogOpen(true);
  };

  const columns: ColumnDef<Club>[] = [
    {
      accessorKey: 'name',
      header: 'Club',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.logoUrl} alt={row.original.name} data-ai-hint="football club logo"/>
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.adminEmail}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'subscriptionPlan',
      header: 'Plan',
      cell: ({ row }) => <Badge variant="outline">{row.original.subscriptionPlan.name}</Badge>,
    },
     {
      accessorKey: 'mrr',
      header: () => <div className="text-right">MRR</div>,
      cell: ({ row }) => <div className="text-right">KES {row.original.mrr.toLocaleString()}</div>
    },
    {
      accessorKey: 'playerCount',
      header: 'Players',
    },
    {
      accessorKey: 'status',
      header: 'Status',
       cell: ({ row }) => <Badge variant={getStatusVariant(row.original.status)}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'renewalDate',
      header: 'Next Renewal',
      cell: ({ row }) => new Date(row.original.renewalDate).toLocaleDateString(),
    },
    {
      id: 'actions',
       cell: ({ row }) => {
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
                <DropdownMenuItem onClick={() => handleViewInvoice(row.original)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Last Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleManageClub(row.original)}>
                    <KeySquare className="mr-2 h-4 w-4" />
                    Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleImpersonate(row.original.name)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Impersonate Admin
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
              <DialogTrigger asChild>
                <Button onClick={() => setNewClubDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Onboard New Club
                </Button>
              </DialogTrigger>
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
      
      {/* Onboard New Club Dialog */}
      <Dialog open={isNewClubDialogOpen} onOpenChange={setNewClubDialogOpen}>
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
                    <Input id="club-name" placeholder="e.g., Kisumu All-Stars" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="admin-email" className="text-right">Admin Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@kisumustars.com" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => {
                  toast({title: "Invite Sent!", description: "An onboarding link has been sent to the new admin."});
                  setNewClubDialogOpen(false);
                }}>Send Invite</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                        <Select defaultValue={selectedClub?.subscriptionPlan.id}>
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
                        <Select defaultValue={selectedClub?.status}>
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
                           <Smartphone className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="font-medium">SMS Credits</p>
                                <p className="text-xs text-muted-foreground">For alerts and notifications</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Input type="number" defaultValue={selectedClub?.smsCredits} className="w-24"/>
                           <span>credits</span>
                        </div>
                   </div>
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="font-medium">AI Analysis Credits</p>
                                <p className="text-xs text-muted-foreground">For fraud detection & report generation</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Input type="number" defaultValue={selectedClub?.aiCredits} className="w-24"/>
                           <span>credits</span>
                        </div>
                   </div>
               </div>
            </div>
            <DialogFooter>
                 <Button variant="destructive" onClick={() => setManageDialogOpen(false)}><X className="mr-2 h-4 w-4"/> Cancel Subscription</Button>
                <Button onClick={() => {
                  toast({title: "Subscription Updated", description: `${selectedClub?.name}'s subscription details have been saved.`});
                  setManageDialogOpen(false);
                }}>Save Changes</Button>
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
