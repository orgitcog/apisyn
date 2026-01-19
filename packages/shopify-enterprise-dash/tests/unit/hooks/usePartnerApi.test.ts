import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  usePartnerApi,
  useAppEvents,
  useTransactions,
  useApp,
  usePartnerStats,
} from '../../../src/hooks/usePartnerApi';
import { PartnerApiClient, createPartnerApiClientWithCredentials } from '../../../src/lib/partnerApi';

// Mock the partnerApi module
vi.mock('../../../src/lib/partnerApi', () => ({
  PartnerApiClient: vi.fn(),
  createPartnerApiClientWithCredentials: vi.fn(),
}));

const MockPartnerApiClient = vi.mocked(PartnerApiClient);

describe('usePartnerApi', () => {
  let mockClient: {
    getApiVersions: ReturnType<typeof vi.fn>;
    getApp: ReturnType<typeof vi.fn>;
    getAppEvents: ReturnType<typeof vi.fn>;
    getTransactions: ReturnType<typeof vi.fn>;
    getOrganizationId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      getApiVersions: vi.fn().mockResolvedValue([{ handle: '2026-01', supported: true }]),
      getApp: vi.fn(),
      getAppEvents: vi.fn(),
      getTransactions: vi.fn(),
      getOrganizationId: vi.fn().mockReturnValue('3604544'),
    };

    MockPartnerApiClient.mockImplementation(() => mockClient as any);
    
    // Mock createPartnerApiClientWithCredentials
    vi.mocked(createPartnerApiClientWithCredentials).mockReturnValue(mockClient as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePartnerApi hook', () => {
    it('should return null client when config is null', async () => {
      const { result } = renderHook(() => usePartnerApi(null));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.client).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it('should create client and test connection', async () => {
      const config = { organizationId: '3604544', accessToken: 'test_token' };
      
      const { result } = renderHook(() => usePartnerApi(config));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle connection error', async () => {
      mockClient.getApiVersions.mockRejectedValueOnce(new Error('Connection failed'));

      const config = { organizationId: '3604544', accessToken: 'test_token' };
      const { result } = renderHook(() => usePartnerApi(config));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Connection failed');
    });

    it('should handle empty API versions response', async () => {
      mockClient.getApiVersions.mockResolvedValueOnce([]);

      const config = { organizationId: '3604544', accessToken: 'test_token' };
      const { result } = renderHook(() => usePartnerApi(config));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Failed to connect to Partner API');
    });
  });

  describe('useAppEvents hook', () => {
    it('should return empty state when client is null', async () => {
      const { result } = renderHook(() => useAppEvents(null, 'app123'));

      expect(result.current.events).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty state when appId is null', async () => {
      const { result } = renderHook(() => useAppEvents(mockClient as any, null));

      expect(result.current.events).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch events successfully', async () => {
      const mockEvents = {
        edges: [{ node: { type: 'AppInstallEvent', occurredAt: '2026-01-01' }, cursor: 'c1' }],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      };
      mockClient.getAppEvents.mockResolvedValueOnce(mockEvents);

      const { result } = renderHook(() => useAppEvents(mockClient as any, 'app123', 50));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.events).toEqual(mockEvents);
      expect(mockClient.getAppEvents).toHaveBeenCalledWith('app123', 50);
    });

    it('should handle fetch error', async () => {
      mockClient.getAppEvents.mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() => useAppEvents(mockClient as any, 'app123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Fetch failed');
    });

    it('should refetch events', async () => {
      const mockEvents = { edges: [], pageInfo: {} };
      mockClient.getAppEvents.mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useAppEvents(mockClient as any, 'app123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockClient.getAppEvents).toHaveBeenCalledTimes(2);
    });
  });

  describe('useTransactions hook', () => {
    it('should return empty state when client is null', async () => {
      const { result } = renderHook(() => useTransactions(null));

      expect(result.current.transactions).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch transactions successfully', async () => {
      const mockTransactions = {
        edges: [{ node: { id: 't1', createdAt: '2026-01-01' }, cursor: 'c1' }],
        pageInfo: { hasNextPage: true, hasPreviousPage: false },
      };
      mockClient.getTransactions.mockResolvedValueOnce(mockTransactions);

      const { result } = renderHook(() => useTransactions(mockClient as any));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.hasMore).toBe(true);
    });

    it('should pass filter options', async () => {
      mockClient.getTransactions.mockResolvedValueOnce({ edges: [], pageInfo: {} });

      const options = {
        first: 10,
        appId: 'app123',
        createdAtMin: '2026-01-01',
      };

      renderHook(() => useTransactions(mockClient as any, options));

      await waitFor(() => {
        expect(mockClient.getTransactions).toHaveBeenCalledWith(expect.objectContaining(options));
      });
    });

    it('should handle load more', async () => {
      const page1 = {
        edges: [{ node: { id: 't1' }, cursor: 'c1' }],
        pageInfo: { hasNextPage: true },
      };
      const page2 = {
        edges: [{ node: { id: 't2' }, cursor: 'c2' }],
        pageInfo: { hasNextPage: false },
      };
      mockClient.getTransactions
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const { result } = renderHook(() => useTransactions(mockClient as any));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      // Should have both pages of data
      expect(result.current.transactions?.edges).toHaveLength(2);
    });
  });

  describe('useApp hook', () => {
    it('should return empty state when client is null', async () => {
      const { result } = renderHook(() => useApp(null, 'app123'));

      expect(result.current.app).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty state when appId is null', async () => {
      const { result } = renderHook(() => useApp(mockClient as any, null));

      expect(result.current.app).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch app successfully', async () => {
      const mockApp = { id: 'app123', name: 'Test App', apiKey: 'key123' };
      mockClient.getApp.mockResolvedValueOnce(mockApp);

      const { result } = renderHook(() => useApp(mockClient as any, 'app123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.app).toEqual(mockApp);
    });

    it('should handle fetch error', async () => {
      mockClient.getApp.mockRejectedValueOnce(new Error('App not found'));

      const { result } = renderHook(() => useApp(mockClient as any, 'app123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('App not found');
    });
  });

  describe('usePartnerStats hook', () => {
    it('should return empty state when client is null', async () => {
      const { result } = renderHook(() => usePartnerStats(null));

      expect(result.current.stats).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should calculate stats from API data', async () => {
      mockClient.getApiVersions.mockResolvedValueOnce([
        { handle: '2025-10' },
        { handle: '2026-01' },
      ]);
      mockClient.getTransactions.mockResolvedValueOnce({
        edges: [
          { node: { id: 't1' } },
          { node: { id: 't2' } },
        ],
      });
      mockClient.getAppEvents.mockResolvedValueOnce({
        edges: [
          { node: { type: 'AppInstallEvent', occurredAt: new Date().toISOString() } },
          { node: { type: 'AppInstallEvent', occurredAt: new Date().toISOString() } },
          { node: { type: 'AppUninstallEvent', occurredAt: new Date().toISOString() } },
        ],
      });

      const { result } = renderHook(() => usePartnerStats(mockClient as any, 'app123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual({
        totalTransactions: 2,
        totalAppInstalls: 2,
        totalAppUninstalls: 1,
        recentEvents: 3,
        apiVersions: 2,
      });
    });

    it('should handle stats fetch error', async () => {
      mockClient.getApiVersions.mockRejectedValueOnce(new Error('Stats error'));

      const { result } = renderHook(() => usePartnerStats(mockClient as any));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Stats error');
    });
  });
});
