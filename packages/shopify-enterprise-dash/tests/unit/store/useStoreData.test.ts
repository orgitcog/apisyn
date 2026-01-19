import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useStoreData, Store } from '@/store/useStoreData';

// Mock the supabase functions
vi.mock('@/lib/supabase', () => ({
  getStores: vi.fn(),
  updateStore: vi.fn(),
  createStore: vi.fn(),
  deleteStore: vi.fn(),
}));

import { getStores, updateStore, createStore, deleteStore } from '@/lib/supabase';

describe('useStoreData Store', () => {
  const mockStores = [
    {
      id: '1',
      name: 'Test Store 1',
      url: 'test-1.myshopify.com',
      revenue: 50000,
      orders: 500,
      status: 'active' as const,
      last_sync: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Store 2',
      url: 'test-2.myshopify.com',
      revenue: 75000,
      orders: 750,
      status: 'active' as const,
      last_sync: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    // Reset the store state before each test
    useStoreData.setState({
      stores: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useStoreData());

      expect(result.current.stores).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchStores', () => {
    it('should fetch stores from database successfully', async () => {
      vi.mocked(getStores).mockResolvedValue(mockStores);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.fetchStores();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stores).toHaveLength(2);
      expect(result.current.stores[0].name).toBe('Test Store 1');
      expect(result.current.error).toBeNull();
    });

    it('should use mock data when database returns empty', async () => {
      vi.mocked(getStores).mockResolvedValue([]);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.fetchStores();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have mock stores
      expect(result.current.stores.length).toBeGreaterThan(0);
      expect(result.current.stores[0].name).toBe('Fashion Boutique');
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Database connection failed';
      vi.mocked(getStores).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.fetchStores();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(getStores).mockReturnValue(promise as any);

      const { result } = renderHook(() => useStoreData());

      act(() => {
        result.current.fetchStores();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockStores);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('createStore', () => {
    it('should create a new store successfully', async () => {
      const newStoreData = {
        name: 'New Store',
        url: 'new-store.myshopify.com',
        status: 'pending',
      };

      const createdStore = {
        id: '3',
        ...newStoreData,
        revenue: 0,
        orders: 0,
        last_sync: '2025-01-03T00:00:00Z',
      };

      vi.mocked(createStore).mockResolvedValue(createdStore);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.createStore(newStoreData);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stores).toHaveLength(1);
      expect(result.current.stores[0].name).toBe('New Store');
      expect(result.current.error).toBeNull();
    });

    it('should handle create failure', async () => {
      vi.mocked(createStore).mockResolvedValue(null);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.createStore({
          name: 'New Store',
          url: 'new-store.myshopify.com',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to create store');
    });
  });

  describe('updateStore', () => {
    it('should update store successfully', async () => {
      // Set initial stores
      useStoreData.setState({
        stores: [
          {
            id: '1',
            name: 'Original Name',
            url: 'test.myshopify.com',
            revenue: 1000,
            orders: 10,
            status: 'active',
            lastSync: '2025-01-01T00:00:00Z',
          },
        ],
      });

      const updates = { name: 'Updated Name' };
      vi.mocked(updateStore).mockResolvedValue({ ...mockStores[0], name: 'Updated Name' });

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.updateStore('1', updates);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stores[0].name).toBe('Updated Name');
      expect(result.current.error).toBeNull();
    });

    it('should handle update failure', async () => {
      useStoreData.setState({
        stores: [
          {
            id: '1',
            name: 'Test Store',
            url: 'test.myshopify.com',
            revenue: 1000,
            orders: 10,
            status: 'active',
            lastSync: '2025-01-01T00:00:00Z',
          },
        ],
      });

      vi.mocked(updateStore).mockResolvedValue(null);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.updateStore('1', { name: 'New Name' });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to update store');
    });
  });

  describe('deleteStore', () => {
    it('should delete store successfully', async () => {
      useStoreData.setState({
        stores: [
          {
            id: '1',
            name: 'Store to Delete',
            url: 'test.myshopify.com',
            revenue: 1000,
            orders: 10,
            status: 'active',
            lastSync: '2025-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Keep This Store',
            url: 'keep.myshopify.com',
            revenue: 2000,
            orders: 20,
            status: 'active',
            lastSync: '2025-01-02T00:00:00Z',
          },
        ],
      });

      vi.mocked(deleteStore).mockResolvedValue(true);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.deleteStore('1');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stores).toHaveLength(1);
      expect(result.current.stores[0].id).toBe('2');
      expect(result.current.error).toBeNull();
    });

    it('should handle delete failure', async () => {
      useStoreData.setState({
        stores: [
          {
            id: '1',
            name: 'Test Store',
            url: 'test.myshopify.com',
            revenue: 1000,
            orders: 10,
            status: 'active',
            lastSync: '2025-01-01T00:00:00Z',
          },
        ],
      });

      vi.mocked(deleteStore).mockResolvedValue(false);

      const { result } = renderHook(() => useStoreData());

      await act(async () => {
        await result.current.deleteStore('1');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to delete store');
      expect(result.current.stores).toHaveLength(1);
    });
  });
});
