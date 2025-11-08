'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial world...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex-1">
            {/* Can add a mobile nav trigger here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-secondary/50">
          {children}
        </main>
      </div>
    </div>
  );
}
