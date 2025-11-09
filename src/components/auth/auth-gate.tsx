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
    if (isUserLoading) {
      return; // Wait for user authentication to settle
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (!firestore) {
        // Firestore is not ready yet, wait.
        return;
    }

    const checkAndCreateUserProfile = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setIsProfileReady(true);
        } else {
          // Profile doesn't exist, so create it
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0],
            createdAt: serverTimestamp(),
          }, { merge: true });
          setIsProfileReady(true); // Profile is now ready
        }
      } catch (error) {
        console.error("Error checking or creating user profile:", error);
        // Potentially handle this error, e.g., by showing an error message
        // For now, we'll assume it might be a transient issue and not block forever
      }
    };

    checkAndCreateUserProfile();

  }, [user, isUserLoading, firestore, router]);

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

  // If loading is finished and profile is ready, render the children.
  if (user && isProfileReady) {
    return <>{children}</>;
  }

  // Fallback, should ideally not be reached if logic is correct
  return null;
}
