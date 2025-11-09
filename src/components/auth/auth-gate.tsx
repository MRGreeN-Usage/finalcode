'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

/**
 * A client component that acts as a gatekeeper for authenticated routes.
 * It ensures that a user is authenticated and that their corresponding
 * user profile document exists in Firestore before rendering child components.
 * This prevents race conditions where the app tries to fetch data for a
 * user whose profile hasn't been created yet.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Create a memoized reference to the user's profile document.
  const userProfileDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  // Use the useDoc hook to listen for the profile document in real-time.
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileDocRef);

  useEffect(() => {
    // If authentication is done and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Determine the combined loading state.
  // We are loading if:
  // 1. The initial Firebase Auth check is running (`isUserLoading`).
  // 2. We have a user, but we are still waiting for their Firestore profile (`isProfileLoading`).
  const isLoading = isUserLoading || (!!user && isProfileLoading);

  // While loading, show a full-screen loader.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isUserLoading ? 'Authenticating...' : 'Loading your financial world...'}
          </p>
        </div>
      </div>
    );
  }

  // If loading is finished, we have a user, and their profile exists, render the children.
  if (user && userProfile) {
    return <>{children}</>;
  }
  
  // If we have a user but no profile (and we're not loading anymore), it might mean
  // the profile creation is pending. We stay in a loading state or redirect.
  // For now, showing the loader is safest to prevent rendering a broken UI.
  if (user && !userProfile) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Finalizing your setup...</p>
        </div>
      </div>
    );
  }

  // In any other case (e.g., redirecting), render nothing.
  return null;
}
