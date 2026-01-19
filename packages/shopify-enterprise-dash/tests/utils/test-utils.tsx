import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter } from 'react-router-dom';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider i18n={enTranslations}>
        <BrowserRouter>{children}</BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper to create a mock store for Zustand testing
export const createMockStore = <T extends object>(initialState: T) => {
  let state = initialState;
  const listeners = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };
};

// Wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.png',
  ...overrides,
});

export const generateMockStore = (overrides = {}) => ({
  id: 'test-store-id',
  name: 'Test Store',
  url: 'test-store.myshopify.com',
  revenue: 50000,
  orders: 500,
  status: 'active' as const,
  lastSync: new Date().toISOString(),
  ...overrides,
});

export const generateMockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  title: 'Test Product',
  description: 'A test product description',
  price: 99.99,
  vendor: 'Test Vendor',
  product_type: 'Test Type',
  status: 'active',
  ...overrides,
});

export const generateMockOrder = (overrides = {}) => ({
  id: 'test-order-id',
  order_number: 1001,
  total_price: '100.00',
  subtotal_price: '90.00',
  total_tax: '10.00',
  currency: 'USD',
  financial_status: 'paid',
  fulfillment_status: 'fulfilled',
  created_at: new Date().toISOString(),
  ...overrides,
});
