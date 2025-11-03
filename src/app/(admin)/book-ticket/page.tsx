import { Suspense } from 'react';
import { BookTicketClient } from './book-ticket-client';
import { Skeleton } from '@/components/ui/skeleton';

function BookTicketLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex justify-center">
                <div className="w-full max-w-lg space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    )
}

export default function BookTicketPage() {
  return (
    <Suspense fallback={<BookTicketLoading />} >
      <BookTicketClient />
    </Suspense>
  );
}
