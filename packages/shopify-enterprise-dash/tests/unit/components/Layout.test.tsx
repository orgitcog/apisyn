import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../utils/test-utils';
import { Layout } from '@/components/Layout';

// Mock the useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/' })),
  };
});

// Mock lucide-react icons - include ALL icons used by Layout component
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    LayoutDashboard: () => <span data-testid="icon-dashboard" />,
    Users: () => <span data-testid="icon-users" />,
    ShieldCheck: () => <span data-testid="icon-roles" />,
    BarChart3: () => <span data-testid="icon-analytics" />,
    FileText: () => <span data-testid="icon-reports" />,
    Settings: () => <span data-testid="icon-settings" />,
    Handshake: () => <span data-testid="icon-partners" />,
    Calculator: () => <span data-testid="icon-calculator" />,
  };
});

// Mock the Layout subcomponents
vi.mock('@/components/Layout/TopBar', () => ({
  TopBar: () => <div data-testid="topbar">TopBar</div>,
}));

vi.mock('@/components/Layout/NavigationMenu', () => ({
  NavigationMenu: ({ items }: { items: any[] }) => (
    <nav data-testid="navigation-menu">
      {items.map((item) => (
        <a key={item.url} href={item.url} data-selected={item.selected}>
          {item.label}
        </a>
      ))}
    </nav>
  ),
}));

describe('Layout Component', () => {
  it('should render children content', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render TopBar component', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('topbar')).toBeInTheDocument();
  });

  it('should render NavigationMenu with correct items', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const navigation = screen.getByTestId('navigation-menu');
    expect(navigation).toBeInTheDocument();

    // Check for navigation items
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Partners')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('GnuCash')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should wrap children in padding container', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test</div>
      </Layout>
    );

    const child = screen.getByTestId('test-child');
    const parentDiv = child.parentElement;

    expect(parentDiv).toHaveClass('p-6');
  });
});
