import React from 'react';
import { Navigation } from '@shopify/polaris';
import { useNavigate, useLocation } from '@remix-run/react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  url: string;
  selected: boolean;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={items.map((item) => ({
          label: item.label,
          icon: item.icon,
          url: item.url,
          selected: item.selected,
          onClick: (e) => {
            e.preventDefault();
            navigate(item.url);
          }
        }))}
      />
    </Navigation>
  );
}