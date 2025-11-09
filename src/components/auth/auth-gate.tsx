'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user state is determined
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (firestore && user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          // If user document doesn't exist, create it.
          // This is a one-time operation.
          setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            createdAt: serverTimestamp(),
          }).catch(error => {
            console.error("AuthGate: Error creating user document:", error);
            // Handle error, maybe sign out user and redirect to an error page
          });
        }
      }).catch(error => {
        console.error("AuthGate: Error checking user document:", error);
      });
    }
  }, [user, isUserLoading, firestore, router]);

  if (isUserLoading || !user) {
    // Show a loading screen while checking auth state or if user is not logged in yet.
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

  // If user is authenticated and profile creation is handled, render children.
  return <>{children}</>;
}
