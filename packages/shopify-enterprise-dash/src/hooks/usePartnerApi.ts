import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PartnerApiClient,
  createPartnerApiClientWithCredentials,
  PartnerApp,
  AppEventConnection,
  TransactionConnection,
} from "../lib/partnerApi";

export interface UsePartnerApiConfig {
  organizationId: string;
  accessToken: string;
}

export interface UsePartnerApiResult {
  client: PartnerApiClient | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

/**
 * Hook to create and manage a Partner API client
 */
export function usePartnerApi(config: UsePartnerApiConfig | null): UsePartnerApiResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const client = useMemo(() => {
    if (!config?.organizationId || !config?.accessToken) {
      return null;
    }
    return createPartnerApiClientWithCredentials(config.organizationId, config.accessToken);
  }, [config?.organizationId, config?.accessToken]);

  useEffect(() => {
    async function testConnection() {
      if (!client) {
        setIsLoading(false);
        setIsConnected(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const versions = await client.getApiVersions();
        if (versions.length > 0) {
          setIsConnected(true);
        } else {
          setError("Failed to connect to Partner API");
          setIsConnected(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }

    testConnection();
  }, [client]);

  return { client, isLoading, error, isConnected };
}

export interface UseAppEventsResult {
  events: AppEventConnection | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch app events from the Partner API
 */
export function useAppEvents(
  client: PartnerApiClient | null,
  appId: string | null,
  first = 50
): UseAppEventsResult {
  const [events, setEvents] = useState<AppEventConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!client || !appId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await client.getAppEvents(appId, first);
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  }, [client, appId, first]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

export interface UseTransactionsResult {
  transactions: TransactionConnection | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseTransactionsOptions {
  first?: number;
  appId?: string;
  shopId?: string;
  myshopifyDomain?: string;
  createdAtMin?: string;
  createdAtMax?: string;
  types?: string[];
}

/**
 * Hook to fetch transactions from the Partner API with pagination
 */
export function useTransactions(
  client: PartnerApiClient | null,
  options: UseTransactionsOptions = {}
): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const fetchTransactions = useCallback(async (append = false) => {
    if (!client) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await client.getTransactions({
        ...options,
        after: append ? cursor : undefined,
      });

      if (result) {
        if (append && transactions) {
          setTransactions({
            ...result,
            edges: [...transactions.edges, ...result.edges],
          });
        } else {
          setTransactions(result);
        }

        const lastEdge = result.edges[result.edges.length - 1];
        setCursor(lastEdge?.cursor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [client, options, cursor, transactions]);

  useEffect(() => {
    fetchTransactions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, JSON.stringify(options)]);

  const loadMore = useCallback(async () => {
    await fetchTransactions(true);
  }, [fetchTransactions]);

  const refetch = useCallback(async () => {
    setCursor(undefined);
    await fetchTransactions(false);
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: transactions?.pageInfo?.hasNextPage ?? false,
  };
}

export interface UseAppResult {
  app: PartnerApp | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch app details from the Partner API
 */
export function useApp(client: PartnerApiClient | null, appId: string | null): UseAppResult {
  const [app, setApp] = useState<PartnerApp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApp = useCallback(async () => {
    if (!client || !appId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await client.getApp(appId);
      setApp(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch app");
    } finally {
      setIsLoading(false);
    }
  }, [client, appId]);

  useEffect(() => {
    fetchApp();
  }, [fetchApp]);

  return { app, isLoading, error, refetch: fetchApp };
}

export interface PartnerApiStats {
  totalTransactions: number;
  totalAppInstalls: number;
  totalAppUninstalls: number;
  recentEvents: number;
  apiVersions: number;
}

export interface UsePartnerStatsResult {
  stats: PartnerApiStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch aggregated Partner API statistics
 */
export function usePartnerStats(
  client: PartnerApiClient | null,
  appId?: string
): UsePartnerStatsResult {
  const [stats, setStats] = useState<PartnerApiStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!client) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [versions, transactions] = await Promise.all([
        client.getApiVersions(),
        client.getTransactions({ first: 100, appId }),
      ]);

      let installCount = 0;
      let uninstallCount = 0;
      let recentEventCount = 0;

      if (appId) {
        const events = await client.getAppEvents(appId, 100);
        if (events) {
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          events.edges.forEach(({ node }) => {
            if (node.type === "INSTALL" || node.type === "AppInstallEvent") {
              installCount++;
            } else if (node.type === "UNINSTALL" || node.type === "AppUninstallEvent") {
              uninstallCount++;
            }

            if (new Date(node.occurredAt) >= thirtyDaysAgo) {
              recentEventCount++;
            }
          });
        }
      }

      setStats({
        totalTransactions: transactions?.edges?.length || 0,
        totalAppInstalls: installCount,
        totalAppUninstalls: uninstallCount,
        recentEvents: recentEventCount,
        apiVersions: versions.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, [client, appId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
