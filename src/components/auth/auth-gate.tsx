'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is still loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If there's no user and we're not on the login page, redirect to login.
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Render a loading state if authentication is in progress.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // If user is not loaded and we are not on login page, show loading to prevent flicker
  if (!user && pathname !== '/login') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  // If auth is done, render the application.
  return <>{children}</>;
}
