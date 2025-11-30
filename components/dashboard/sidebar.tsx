'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  UsersRound,
  Webhook,
  Settings,
  Phone,
  UserCog,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Instances',
    href: '/instances',
    icon: Phone,
  },
  {
    name: 'Conversations',
    href: '/conversations',
    icon: MessageSquare,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    name: 'Groups',
    href: '/groups',
    icon: UsersRound,
  },
  {
    name: 'Webhooks',
    href: '/webhooks',
    icon: Webhook,
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserCog,
    permission: 'users.read',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Filter navigation based on permissions
  const visibleNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return session?.user?.permissions?.includes(item.permission);
  });

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg">WhatsApp Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 space-y-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {session.user.name?.[0]?.toUpperCase() || session.user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.role || 'No role'}</p>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <div className="text-xs text-muted-foreground">
          <p>Evolution API v2</p>
          <p className="mt-1">Dashboard v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
