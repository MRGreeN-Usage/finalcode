'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/shared/logo';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { doc } from 'firebase/firestore';

function useUserProfile() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userProfileDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileDocRef);
  
  return { isProfileLoading, profileExists: !!userProfile };
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isProfileLoading, profileExists } = useUserProfile();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || (user && !isProfileLoading && !profileExists);

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

  if (!user || !profileExists) {
    return null; // Redirect is handled by the effect, or waiting for profile
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar className="hidden md:block" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <Sidebar onLinkClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-secondary/10">
          {children}
        </main>
      </div>
    </div>
  );
}
