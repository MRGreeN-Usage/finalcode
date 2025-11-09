'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isProfileReady, setIsProfileReady] = useState(false);

  useEffect(() => {
    // If auth state is still loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If there's no user, redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }

    // If firestore isn't initialized, wait.
    if (!firestore) {
      return;
    }

    // If user is authenticated and profile is already checked, do nothing.
    if (isProfileReady) {
      return;
    }
    
    // Check for the user profile document in Firestore.
    const checkAndCreateUserProfile = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          // Profile exists, we are ready to proceed.
          setIsProfileReady(true);
        } else {
          // Profile doesn't exist, so create it.
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0],
            createdAt: serverTimestamp(),
          }, { merge: true });
          // After creating, mark profile as ready.
          setIsProfileReady(true);
        }
      } catch (error) {
        console.error("AuthGate: Error checking or creating user profile:", error);
        // Optional: handle error state, e.g., show an error message
      }
    };

    checkAndCreateUserProfile();

  }, [user, isUserLoading, firestore, router, isProfileReady]);


  // Render a loading state if authentication is in progress or profile isn't ready.
  if (isUserLoading || !isProfileReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isUserLoading ? 'Authenticating...' : 'Preparing your session...'}
          </p>
        </div>
      </div>
    );
  }

  // If auth is done and profile is ready, render the application.
  return <>{children}</>;
}
