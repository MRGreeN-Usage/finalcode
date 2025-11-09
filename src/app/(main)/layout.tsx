'use client';

import { useState } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FirebaseClientProvider } from '@/firebase';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <FirebaseClientProvider>
      <AuthGate>
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
      </AuthGate>
    </FirebaseClientProvider>
  );
}
