'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
  UsersRound,
  FileText,
  PieChart,
  Ticket,
  UserSquare,
  ClipboardList,
  CalendarDays,
  Boxes,
  Trophy,
  HeartPulse,
  UserCheck,
  GraduationCap,
  Bell,
  ShieldCheck,
  Store,
  Newspaper,
  BarChart,
  ChevronDown,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bi-dashboard', icon: PieChart, label: 'BI Dashboard' },
  {
    label: 'Player Management',
    icon: Users,
    subItems: [
      { href: '/players', label: 'Player Roster' },
      { href: '/standings', label: 'Standings' },
      { href: '/achievements', label: 'Achievements' },
      { href: '/id-card', label: 'ID & Access' },
      { href: '/scouting', label: 'Scouting' },
    ],
  },
  {
    label: 'Financial Tools',
    icon: Banknote,
    subItems: [
      { href: '/finances', label: 'Transactions' },
      { href: '/fraud-detection', label: 'Fraud Detection' },
      { href: '/reporting', label: 'Reporting' },
    ],
  },
  {
    label: 'Events & Ticketing',
    icon: CalendarDays,
    subItems: [
      { href: '/events', label: 'Marketplace' },
      { href: '/ticketing', label: 'Ticket Management' },
      { href: '/book-ticket', label: 'Book a Ticket', isPublic: true },
    ],
  },
  {
    label: 'Store Management',
    icon: Store,
    subItems: [
        { href: '/merchandise', label: 'Store Front' },
        { href: '/merchandise/manage', label: 'Manage Products' },
    ]
  },
  {
    label: 'Academy Operations',
    icon: Settings,
    subItems: [
        { href: '/team', label: 'Team Management' },
        { href: '/inventory', label: 'Inventory' },
        { href: '/communications', label: 'Communications' },
        { href: '/compliance', label: 'Compliance' },
    ]
  },
  { href: '/training-hub', icon: GraduationCap, label: 'Training Hub' },
  { href: '/blog', icon: Newspaper, label: 'Blog' },
];

const NavItem = ({ item, pathname }: { item: any, pathname: string }) => {
  const isSubActive = item.subItems?.some((subItem: any) => pathname.startsWith(subItem.href));

  if (item.subItems) {
    return (
      <Collapsible defaultOpen={isSubActive}>
        <CollapsibleTrigger asChild>
           <SidebarMenuButton
            isActive={isSubActive}
            className="justify-between"
            >
             <div className='flex items-center gap-2'>
                <item.icon />
                <span>{item.label}</span>
             </div>
             <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <SidebarMenuSub>
                {item.subItems.filter((subItem: any) => !subItem.isPublic).map((subItem: any) => (
                    <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href} passHref legacyBehavior>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                <a>{subItem.label}</a>
                            </SidebarMenuSubButton>
                         </Link>
                    </SidebarMenuSubItem>
                ))}
            </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link href={item.href} passHref>
      <SidebarMenuButton isActive={pathname === item.href} tooltip={{ children: item.label }}>
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </Link>
  );
};


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="size-8" />
            <h1 className="font-headline text-lg font-semibold text-primary">
              TalantaTrack
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.filter(item => !item.isPublic).map((item) => (
              <SidebarMenuItem key={item.href || item.label}>
                <NavItem item={item} pathname={pathname} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://picsum.photos/seed/a1/100/100"
                      alt="Admin"
                    />
                    <AvatarFallback>EC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppShell;
