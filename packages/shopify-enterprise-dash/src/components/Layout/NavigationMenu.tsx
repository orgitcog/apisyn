import React from "react";
import { Navigation } from "@shopify/polaris";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  FileText,
  Settings,
  PlayCircle,
  Network,
  Box,
  GitBranch,
  Braces,
  Code2,
} from "lucide-react";
import { useTestMode } from "../../context/TestModeContext";

interface NavigationItem {
  label: string;
  icon: React.ComponentType<any>;
  url: string;
  selected: boolean;
  badge?: string;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export function NavigationMenu({ _items }: NavigationMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTestMode } = useTestMode();

  const mainItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      url: "/",
      selected: location.pathname === "/",
    },
    {
      label: "Playground",
      icon: PlayCircle,
      url: "/playground",
      selected: location.pathname === "/playground",
      badge: isTestMode ? "Test Mode" : undefined,
    },
    {
      label: "Users",
      icon: Users,
      url: "/users",
      selected: location.pathname.startsWith("/users"),
    },
    {
      label: "Roles",
      icon: ShieldCheck,
      url: "/roles",
      selected: location.pathname.startsWith("/roles"),
    },
    {
      label: "Analytics",
      icon: BarChart3,
      url: "/analytics",
      selected: location.pathname.startsWith("/analytics"),
    },
    {
      label: "Reports",
      icon: FileText,
      url: "/reports",
      selected: location.pathname.startsWith("/reports"),
    },
    {
      label: "Settings",
      icon: Settings,
      url: "/settings",
      selected: location.pathname.startsWith("/settings"),
    },
  ];

  return (
    <Navigation location="/">
      <Navigation.Section
        items={mainItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          url: item.url,
          selected: item.selected,
          badge: item.badge,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            navigate(item.url);
          },
        }))}
      />

      <Navigation.Section
        title="Infrastructure"
        items={[
          {
            label: "Architectures",
            icon: Box,
            url: "/architectures",
            selected: location.pathname.startsWith("/architectures"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/architectures");
            },
          },
          {
            label: "Networks",
            icon: Network,
            url: "/networks",
            selected: location.pathname.startsWith("/networks"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/networks");
            },
          },
          {
            label: "Orchestrations",
            icon: GitBranch,
            url: "/orchestrations",
            selected: location.pathname.startsWith("/orchestrations"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/orchestrations");
            },
          },
        ]}
      />

      <Navigation.Section
        title="Development"
        items={[
          {
            label: "Mermaid AI",
            icon: Braces,
            url: "/mermaid",
            selected: location.pathname.startsWith("/mermaid"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/mermaid");
            },
          },
          {
            label: "Simulations",
            icon: PlayCircle,
            url: "/simulations",
            selected: location.pathname.startsWith("/simulations"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/simulations");
            },
          },
          {
            label: "Webcontainers",
            icon: Code2,
            url: "/webcontainers",
            selected: location.pathname.startsWith("/webcontainers"),
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              navigate("/webcontainers");
            },
          },
        ]}
      />
    </Navigation>
  );
}
