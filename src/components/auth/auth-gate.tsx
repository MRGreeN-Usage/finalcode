'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the initial auth check is happening, wait.
    if (isUserLoading) {
      return; 
    }

    // After loading, if there's no user, redirect to login.
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading or if there's no user (before the redirect happens), show a loading screen.
  if (isUserLoading || !user) {
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

  // If the user exists and loading is false, render the protected content.
  return <>{children}</>;
}
