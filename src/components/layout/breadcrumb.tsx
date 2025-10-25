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
    
    // A simple fix to prevent duplicate "Scouting" breadcrumb on the scouting page
    if (pathname === '/scouting') {
      const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
      if(lastItem.label === 'Scouting') {
        const secondLastItem = breadcrumbItems[breadcrumbItems.length - 2];
        if (secondLastItem && secondLastItem.label === 'Home' ) {
           // a no-op, this is what we want
        }
      }
    }


    setItems(breadcrumbItems);
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
