'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
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
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }
    
    if (user && !isProfileReady) {
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
            setIsProfileReady(true); // Now we can be sure it's ready
          }
        } catch (error) {
          console.error("AuthGate: Error checking or creating profile:", error);
          // Optional: handle error state, e.g., redirect to an error page
        }
      };

      checkOrCreateProfile(user);
    }

  }, [user, isUserLoading, firestore, router, pathname, isProfileReady]);
  

  if (isUserLoading || !isProfileReady) {
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

  return <>{children}</>;
}
