'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { players } from '@/lib/data';

type BreadcrumbItem = {
  label: string;
  href: string;
};

const Breadcrumb = () => {
  const pathname = usePathname();
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (segment === 'players' && pathSegments[index + 1]) {
        const playerId = parseInt(pathSegments[index + 1]);
        const player = players.find(p => p.id === playerId);
        if (player) {
          label = player.name;
        }
      } else if (segment === 'bi-dashboard') {
        label = "BI Dashboard";
      } else if (segment === 'training-hub') {
        label = 'Training Hub';
      } else if (segment === 'id-card') {
        label = 'ID Card';
      }
      else if (!isNaN(parseInt(segment))) {
        // This is a dynamic segment for a player ID, so we skip it as the previous segment handled it.
        return;
      }
      
      breadcrumbItems.push({
        label,
        href: currentPath,
      });
    });
    
    // A simple fix to prevent duplicate 'Home' on the root path
    if (breadcrumbItems.length > 1 && breadcrumbItems[1].label === 'Home') {
        setItems([breadcrumbItems[0]]);
    } else if (breadcrumbItems.length > 2 && breadcrumbItems[1].href === breadcrumbItems[0].href) {
        // This case handles when the first segment is the same as home, e.g. /
        setItems([breadcrumbItems[0], ...breadcrumbItems.slice(2)]);
    }
    else {
        setItems(breadcrumbItems);
    }

  }, [pathname]);

  return (
    <nav aria-label="breadcrumb" className="hidden md:flex">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <li>
              <Link
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  index === items.length - 1 && 'font-medium text-foreground'
                )}
              >
                {item.label}
              </Link>
            </li>
            {index < items.length - 1 && (
              <li role="presentation">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
