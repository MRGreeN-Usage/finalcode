'use client';

import { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Menu, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ParticlesBackground } from '@/components/shared/particles-background';
import { usePreferences } from '@/firebase/firestore/use-preferences';
import { TransactionDialog } from '@/components/transactions/transaction-dialog';
import type { Transaction } from '@/lib/types';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();

  // Initialize preferences hook to apply theme
  usePreferences();

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    
    const collectionRef = collection(firestore, 'users', user.uid, 'transactions');
    addDocumentNonBlocking(collectionRef, { ...transactionData, userId: user.uid });
  };


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
                <SheetContent side="left" className="flex flex-col p-0">
                  <Sidebar onLinkClick={() => setOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="w-full flex-1" />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsQuickAddOpen(true)} className="shrink-0">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>

                <UserNav />
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 bg-secondary/10 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>

        <TransactionDialog 
            isOpen={isQuickAddOpen}
            setIsOpen={setIsQuickAddOpen}
            onSave={handleSaveTransaction}
        />
      </AuthGate>
  );
}
