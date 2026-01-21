'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear auth tokens/cookies here if needed
    // Example: document.cookie = 'token=; Max-Age=0; path=/;';
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-muted-foreground">Logging out...</span>
    </div>
  );
}
