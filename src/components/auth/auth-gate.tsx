'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [gateMessage, setGateMessage] = useState("Authenticating...");

  useEffect(() => {
    // If auth state is still loading, do nothing yet.
    if (isUserLoading) {
      setGateMessage("Authenticating...");
      return;
    }

    // If there's no user and we're not on the login page, redirect to login.
    if (!user) {
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }
    
    // User is authenticated, now check/create profile.
    const checkOrCreateProfile = async (authedUser: User) => {
        if (!firestore) return;

        setGateMessage("Verifying your profile...");
        const userDocRef = doc(firestore, 'users', authedUser.uid);
        
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setIsProfileReady(true);
            } else {
                setGateMessage("Setting up your account...");
                await setDoc(userDocRef, {
                    id: authedUser.uid,
                    email: authedUser.email,
                    name: authedUser.displayName || authedUser.email?.split('@')[0] || 'New User',
                    createdAt: serverTimestamp(),
                });
                // After creating, we need to ensure we can read it back before proceeding
                // A short delay can help Firestore's backend propagate the change.
                setTimeout(() => setIsProfileReady(true), 500);
            }
        } catch (error) {
            console.error("AuthGate: Error checking or creating profile:", error);
            // Handle error appropriately, maybe redirect to an error page
        }
    };

    if (user && !isProfileReady) {
        checkOrCreateProfile(user);
    }

  }, [user, isUserLoading, firestore, router, pathname, isProfileReady]);
  

  // Show loading screen if we're still authenticating or profile isn't ready.
  if (!isProfileReady || isUserLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{gateMessage}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and profile is ready, render the application.
  return <>{children}</>;
}
