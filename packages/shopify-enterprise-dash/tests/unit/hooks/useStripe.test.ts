import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useStripeCustomer,
  useCreateStripeCustomer,
  useUpdateStripeCustomer,
  useStripeProduct,
  useCreateStripeProduct,
  useStripePrice,
  useCreateStripePrice,
  useStripeSubscription,
  useCreateStripeSubscription,
  useCancelStripeSubscription,
  useCreatePaymentIntent,
  useStripeInvoice,
} from '@/hooks/useStripe';

// Mock the Stripe API module
vi.mock('@/lib/stripe', () => ({
  getCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  getPrice: vi.fn(),
  createPrice: vi.fn(),
  getSubscription: vi.fn(),
  createSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  createPaymentIntent: vi.fn(),
  getInvoice: vi.fn(),
}));

import * as StripeAPI from '@/lib/stripe';

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStripe Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStripeCustomer', () => {
    it('should fetch customer by ID', async () => {
      const mockCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test Customer',
      };
      vi.mocked(StripeAPI.getCustomer).mockResolvedValue(mockCustomer);

      const { result } = renderHook(() => useStripeCustomer('cus_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCustomer);
      expect(StripeAPI.getCustomer).toHaveBeenCalledWith('cus_123');
    });

    it('should not fetch when customerId is empty', () => {
      const { result } = renderHook(() => useStripeCustomer(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(StripeAPI.getCustomer).not.toHaveBeenCalled();
    });
  });

  describe('useCreateStripeCustomer', () => {
    it('should create a new customer', async () => {
      const mockCustomer = {
        id: 'cus_new',
        email: 'new@example.com',
        name: 'New Customer',
      };
      vi.mocked(StripeAPI.createCustomer).mockResolvedValue(mockCustomer);

      const { result } = renderHook(() => useCreateStripeCustomer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ email: 'new@example.com', name: 'New Customer' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCustomer);
    });
  });

  describe('useUpdateStripeCustomer', () => {
    it('should update customer data', async () => {
      const mockUpdatedCustomer = {
        id: 'cus_123',
        email: 'updated@example.com',
        name: 'Updated Customer',
      };
      vi.mocked(StripeAPI.updateCustomer).mockResolvedValue(mockUpdatedCustomer);

      const { result } = renderHook(() => useUpdateStripeCustomer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          customerId: 'cus_123',
          data: { email: 'updated@example.com', name: 'Updated Customer' },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUpdatedCustomer);
      expect(StripeAPI.updateCustomer).toHaveBeenCalledWith('cus_123', {
        email: 'updated@example.com',
        name: 'Updated Customer',
      });
    });
  });

  describe('useStripeProduct', () => {
    it('should fetch product by ID', async () => {
      const mockProduct = {
        id: 'prod_123',
        name: 'Test Product',
        description: 'A test product',
      };
      vi.mocked(StripeAPI.getProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useStripeProduct('prod_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProduct);
    });

    it('should not fetch when productId is empty', () => {
      const { result } = renderHook(() => useStripeProduct(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useCreateStripeProduct', () => {
    it('should create a new product', async () => {
      const mockProduct = {
        id: 'prod_new',
        name: 'New Product',
        description: 'A new product',
      };
      vi.mocked(StripeAPI.createProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useCreateStripeProduct(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ name: 'New Product', description: 'A new product' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProduct);
    });
  });

  describe('useStripePrice', () => {
    it('should fetch price by ID', async () => {
      const mockPrice = {
        id: 'price_123',
        unit_amount: 1000,
        currency: 'usd',
        product: 'prod_123',
      };
      vi.mocked(StripeAPI.getPrice).mockResolvedValue(mockPrice);

      const { result } = renderHook(() => useStripePrice('price_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPrice);
    });
  });

  describe('useCreateStripePrice', () => {
    it('should create a new price', async () => {
      const mockPrice = {
        id: 'price_new',
        unit_amount: 2000,
        currency: 'usd',
        product: 'prod_123',
      };
      vi.mocked(StripeAPI.createPrice).mockResolvedValue(mockPrice);

      const { result } = renderHook(() => useCreateStripePrice(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ unit_amount: 2000, currency: 'usd', product: 'prod_123' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPrice);
    });
  });

  describe('useStripeSubscription', () => {
    it('should fetch subscription by ID', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        current_period_end: Date.now() / 1000 + 86400 * 30,
      };
      vi.mocked(StripeAPI.getSubscription).mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => useStripeSubscription('sub_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSubscription);
    });
  });

  describe('useCreateStripeSubscription', () => {
    it('should create a new subscription', async () => {
      const mockSubscription = {
        id: 'sub_new',
        status: 'active',
        customer: 'cus_123',
      };
      vi.mocked(StripeAPI.createSubscription).mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => useCreateStripeSubscription(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ customer: 'cus_123', items: [{ price: 'price_123' }] });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSubscription);
    });
  });

  describe('useCancelStripeSubscription', () => {
    it('should cancel a subscription', async () => {
      const mockCancelledSubscription = {
        id: 'sub_123',
        status: 'canceled',
        customer: 'cus_123',
      };
      vi.mocked(StripeAPI.cancelSubscription).mockResolvedValue(mockCancelledSubscription);

      const { result } = renderHook(() => useCancelStripeSubscription(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('sub_123');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCancelledSubscription);
    });
  });

  describe('useCreatePaymentIntent', () => {
    it('should create a payment intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 5000,
        currency: 'usd',
        client_secret: 'pi_123_secret_abc',
      };
      vi.mocked(StripeAPI.createPaymentIntent).mockResolvedValue(mockPaymentIntent);

      const { result } = renderHook(() => useCreatePaymentIntent(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ amount: 5000, currency: 'usd' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPaymentIntent);
    });
  });

  describe('useStripeInvoice', () => {
    it('should fetch invoice by ID', async () => {
      const mockInvoice = {
        id: 'in_123',
        amount_due: 10000,
        status: 'paid',
        customer: 'cus_123',
      };
      vi.mocked(StripeAPI.getInvoice).mockResolvedValue(mockInvoice);

      const { result } = renderHook(() => useStripeInvoice('in_123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvoice);
    });

    it('should not fetch when invoiceId is empty', () => {
      const { result } = renderHook(() => useStripeInvoice(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });
  });
});
