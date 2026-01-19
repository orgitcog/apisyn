import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useShopInfo,
  useProducts,
  useOrders,
  useCustomers,
  useAnalytics,
  useSyncShopifyData,
} from '@/hooks/useShopifyData';

// Mock the Shopify API module
vi.mock('@/lib/shopify', () => ({
  getShopInfo: vi.fn(),
  getProducts: vi.fn(),
  getOrders: vi.fn(),
  getCustomers: vi.fn(),
  getAnalytics: vi.fn(),
  syncShopifyDataToSupabase: vi.fn(),
}));

import * as ShopifyAPI from '@/lib/shopify';

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

describe('useShopifyData Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useShopInfo', () => {
    it('should fetch shop info successfully', async () => {
      const mockShopInfo = {
        id: 'shop-123',
        name: 'Test Shop',
        email: 'test@shop.com',
        domain: 'test-shop.myshopify.com',
      };
      vi.mocked(ShopifyAPI.getShopInfo).mockResolvedValue(mockShopInfo);

      const { result } = renderHook(() => useShopInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockShopInfo);
      expect(ShopifyAPI.getShopInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle shop info fetch error', async () => {
      const error = new Error('Failed to fetch shop info');
      vi.mocked(ShopifyAPI.getShopInfo).mockRejectedValue(error);

      const { result } = renderHook(() => useShopInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useProducts', () => {
    it('should fetch products with default limit', async () => {
      const mockProducts = [
        { id: 'prod-1', title: 'Product 1', price: '10.00' },
        { id: 'prod-2', title: 'Product 2', price: '20.00' },
      ];
      vi.mocked(ShopifyAPI.getProducts).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProducts);
      expect(ShopifyAPI.getProducts).toHaveBeenCalledWith(10);
    });

    it('should fetch products with custom limit', async () => {
      const mockProducts = Array(25).fill(null).map((_, i) => ({
        id: `prod-${i}`,
        title: `Product ${i}`,
        price: `${i * 10}.00`,
      }));
      vi.mocked(ShopifyAPI.getProducts).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProducts(25), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(25);
      expect(ShopifyAPI.getProducts).toHaveBeenCalledWith(25);
    });
  });

  describe('useOrders', () => {
    it('should fetch orders with default limit', async () => {
      const mockOrders = [
        { id: 'order-1', total: '100.00', status: 'fulfilled' },
        { id: 'order-2', total: '200.00', status: 'pending' },
      ];
      vi.mocked(ShopifyAPI.getOrders).mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrders);
      expect(ShopifyAPI.getOrders).toHaveBeenCalledWith(10);
    });

    it('should fetch orders with custom limit', async () => {
      const mockOrders = Array(50).fill(null).map((_, i) => ({
        id: `order-${i}`,
        total: `${i * 100}.00`,
        status: i % 2 === 0 ? 'fulfilled' : 'pending',
      }));
      vi.mocked(ShopifyAPI.getOrders).mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useOrders(50), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(50);
      expect(ShopifyAPI.getOrders).toHaveBeenCalledWith(50);
    });
  });

  describe('useCustomers', () => {
    it('should fetch customers with default limit', async () => {
      const mockCustomers = [
        { id: 'cust-1', email: 'customer1@test.com', name: 'Customer 1' },
        { id: 'cust-2', email: 'customer2@test.com', name: 'Customer 2' },
      ];
      vi.mocked(ShopifyAPI.getCustomers).mockResolvedValue(mockCustomers);

      const { result } = renderHook(() => useCustomers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCustomers);
      expect(ShopifyAPI.getCustomers).toHaveBeenCalledWith(10);
    });
  });

  describe('useAnalytics', () => {
    it('should fetch analytics with default interval', async () => {
      const mockAnalytics = {
        totalRevenue: 50000,
        totalOrders: 500,
        averageOrderValue: 100,
        conversionRate: 3.5,
      };
      vi.mocked(ShopifyAPI.getAnalytics).mockResolvedValue(mockAnalytics);

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(ShopifyAPI.getAnalytics).toHaveBeenCalledWith('MONTH');
    });

    it('should fetch analytics with custom interval', async () => {
      const mockAnalytics = {
        totalRevenue: 150000,
        totalOrders: 1500,
        averageOrderValue: 100,
        conversionRate: 4.0,
      };
      vi.mocked(ShopifyAPI.getAnalytics).mockResolvedValue(mockAnalytics);

      const { result } = renderHook(() => useAnalytics('YEAR'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(ShopifyAPI.getAnalytics).toHaveBeenCalledWith('YEAR');
    });
  });

  describe('useSyncShopifyData', () => {
    it('should sync data successfully', async () => {
      const mockSyncResult = { success: true, synced: 100 };
      vi.mocked(ShopifyAPI.syncShopifyDataToSupabase).mockResolvedValue(mockSyncResult);

      const { result } = renderHook(() => useSyncShopifyData(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSyncResult);
      expect(ShopifyAPI.syncShopifyDataToSupabase).toHaveBeenCalledTimes(1);
    });

    it('should handle sync error', async () => {
      const error = new Error('Sync failed');
      vi.mocked(ShopifyAPI.syncShopifyDataToSupabase).mockRejectedValue(error);

      const { result } = renderHook(() => useSyncShopifyData(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
