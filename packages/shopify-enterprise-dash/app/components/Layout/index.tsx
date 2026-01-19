import React from 'react';
import { Frame } from '@shopify/polaris';
import { useLocation } from '@remix-run/react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  Settings 
} from 'lucide-react';
import { TopBar } from './TopBar';
import { NavigationMenu } from './NavigationMenu';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Overview',
      icon: LayoutDashboard,
      url: '/',
      selected: location.pathname === '/'
    },
    {
      label: 'Users',
      icon: Users,
      url: '/users',
      selected: location.pathname.startsWith('/users')
    },
    {
      label: 'Roles',
      icon: ShieldCheck,
      url: '/roles',
      selected: location.pathname.startsWith('/roles')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      url: '/analytics',
      selected: location.pathname.startsWith('/analytics')
    },
    {
      label: 'Reports',
      icon: FileText,
      url: '/reports',
      selected: location.pathname.startsWith('/reports')
    },
    {
      label: 'Settings',
      icon: Settings,
      url: '/settings',
      selected: location.pathname.startsWith('/settings')
    }
  ];

  return (
    <Frame
      topBar={<TopBar />}
      navigation={<NavigationMenu items={navigationItems} />}
    >
      <div className="p-6">
        {children}
      </div>
    </Frame>
  );
}