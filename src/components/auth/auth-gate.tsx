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
  const [status, setStatus] = useState<'loading' | 'creating_profile' | 'ready'>('loading');

  useEffect(() => {
    if (isUserLoading) {
      setStatus('loading');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const checkOrCreateProfile = async () => {
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setStatus('ready');
          } else {
            setStatus('creating_profile');
            await setDoc(userDocRef, {
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'New User',
              createdAt: serverTimestamp(),
            });
            setStatus('ready');
          }
        } catch (error) {
          console.error("AuthGate: Error checking or creating profile:", error);
          // Optional: handle error state, e.g., redirect to an error page
        }
      };

      checkOrCreateProfile();
    }
  }, [user, isUserLoading, firestore, router]);
  

  if (status !== 'ready') {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {status === 'loading' && 'Authenticating...'}
            {status === 'creating_profile' && 'Setting up your account...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
