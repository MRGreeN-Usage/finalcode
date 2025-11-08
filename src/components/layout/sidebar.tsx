'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AreaChart,
  ArrowRightLeft,
  LayoutDashboard,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/reports', icon: AreaChart, label: 'Reports' },
  { href: '/assistant', icon: Sparkles, label: 'AI Assistant' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
