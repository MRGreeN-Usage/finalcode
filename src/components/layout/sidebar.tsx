'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AreaChart,
  ArrowRightLeft,
  LayoutDashboard,
  Settings,
  Wallet,
  Wand2,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/analytics', icon: AreaChart, label: 'Analytics' },
  { href: '/assistant', icon: Wand2, label: 'AI Assistant' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <div className={cn("border-r bg-background", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                <Button
                  variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
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
