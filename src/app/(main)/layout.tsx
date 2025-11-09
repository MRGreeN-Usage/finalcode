'use client';

import { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ParticlesBackground } from '@/components/shared/particles-background';
import { usePreferences } from '@/firebase/firestore/use-preferences';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  // Initialize preferences hook to apply theme
  usePreferences();

  return (
      <AuthGate>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <ParticlesBackground />
          <Sidebar className="hidden md:block z-10" />
          <div className="flex flex-col z-10">
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
  );
}
