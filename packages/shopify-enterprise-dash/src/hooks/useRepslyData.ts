import { useState, useEffect, useCallback } from "react";
import {
  repslyApi,
  getMockData,
  RepslyRepresentative,
  RepslyClient,
  RepslyVisit,
  RepslyInventoryItem,
  RepslyCredentials,
  syncRepslyWithShopify,
} from "../lib/repsly";

// Validation helper functions
const isValidDateString = (dateString: string): boolean => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  const simpleDate = /^\d{4}-\d{2}-\d{2}$/;
  return iso8601Regex.test(dateString) || simpleDate.test(dateString);
};

const isValidId = (id: string): boolean => {
  // Allow alphanumeric characters, hyphens, and underscores, reasonable length
  const idRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  return idRegex.test(id);
};

// Hook for managing Repsly authentication
export const useRepslyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    repslyApi.hasCredentials(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: RepslyCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      repslyApi.setCredentials(credentials);
      // Test authentication
      await repslyApi.getRepresentatives();
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      repslyApi.clearCredentials();
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    repslyApi.clearCredentials();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};

// Hook for fetching and managing representatives
export const useRepresentatives = (useMockData: boolean = false) => {
  const [representatives, setRepresentatives] = useState<
    RepslyRepresentative[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepresentatives = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (useMockData) {
        const { mockReps } = getMockData();
        setRepresentatives(mockReps);
      } else {
        const reps = await repslyApi.getRepresentatives();
        setRepresentatives(reps);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch representatives";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    fetchRepresentatives();
  }, [fetchRepresentatives]);

  return {
    representatives,
    isLoading,
    error,
    refetch: fetchRepresentatives,
  };
};

// Hook for fetching and managing clients (stores)
export const useClients = (useMockData: boolean = false) => {
  const [clients, setClients] = useState<RepslyClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const { mockClients } = getMockData();
          if (search) {
            const filtered = mockClients.filter(
              (client) =>
                client.name.toLowerCase().includes(search.toLowerCase()) ||
                client.address.toLowerCase().includes(search.toLowerCase()) ||
                client.city.toLowerCase().includes(search.toLowerCase()),
            );
            setClients(filtered);
          } else {
            setClients(mockClients);
          }
        } else {
          const fetchedClients = await repslyApi.getClients(100, 0, search);
          setClients(fetchedClients);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch clients";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [useMockData],
  );

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients,
    search: fetchClients,
  };
};

// Hook for fetching and managing visits
export const useVisits = (useMockData: boolean = false) => {
  const [visits, setVisits] = useState<RepslyVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(
    async (params?: {
      startDate?: string;
      endDate?: string;
      repId?: string;
      clientId?: string;
      status?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        // Input validation
        if (params?.startDate && !isValidDateString(params.startDate)) {
          throw new Error("Invalid start date format");
        }
        if (params?.endDate && !isValidDateString(params.endDate)) {
          throw new Error("Invalid end date format");
        }
        if (params?.repId && !isValidId(params.repId)) {
          throw new Error("Invalid rep ID format");
        }
        if (params?.clientId && !isValidId(params.clientId)) {
          throw new Error("Invalid client ID format");
        }

        if (useMockData) {
          const { mockVisits } = getMockData();
          let filtered = [...mockVisits];

          if (params) {
            if (params.repId) {
              filtered = filtered.filter(
                (visit) => visit.repId === params.repId,
              );
            }
            if (params.clientId) {
              filtered = filtered.filter(
                (visit) => visit.clientId === params.clientId,
              );
            }
            if (params.status) {
              filtered = filtered.filter(
                (visit) => visit.status === params.status,
              );
            }
            if (params.startDate) {
              const startDate = new Date(params.startDate);
              if (isNaN(startDate.getTime())) {
                throw new Error("Invalid start date");
              }
              filtered = filtered.filter(
                (visit) => new Date(visit.checkInTime) >= startDate,
              );
            }
            if (params.endDate) {
              const endDate = new Date(params.endDate);
              if (isNaN(endDate.getTime())) {
                throw new Error("Invalid end date");
              }
              filtered = filtered.filter(
                (visit) => new Date(visit.checkInTime) <= endDate,
              );
            }
          }

          setVisits(filtered);
        } else {
          const fetchedVisits = await repslyApi.getVisits(
            params?.startDate,
            params?.endDate,
            params?.repId,
            params?.clientId,
            params?.status,
          );
          setVisits(fetchedVisits);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch visits";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [useMockData],
  );

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return {
    visits,
    isLoading,
    error,
    refetch: fetchVisits,
    filter: fetchVisits,
  };
};

// Hook for fetching and managing inventory
export const useInventory = (useMockData: boolean = false) => {
  const [inventory, setInventory] = useState<RepslyInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(
    async (clientId?: string, productId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // Input validation
        if (clientId && !isValidId(clientId)) {
          throw new Error("Invalid client ID format");
        }
        if (productId && !isValidId(productId)) {
          throw new Error("Invalid product ID format");
        }

        if (useMockData) {
          const { mockInventory } = getMockData();
          let filtered = [...mockInventory];

          if (clientId) {
            filtered = filtered.filter((item) => item.clientId === clientId);
          }
          if (productId) {
            filtered = filtered.filter((item) => item.productId === productId);
          }

          setInventory(filtered);
        } else {
          const fetchedInventory = await repslyApi.getInventory(
            clientId,
            productId,
          );
          setInventory(fetchedInventory);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch inventory";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [useMockData],
  );

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    isLoading,
    error,
    refetch: fetchInventory,
    filter: fetchInventory,
  };
};

// Hook for syncing Repsly with Shopify
export const useSyncRepslyShopify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const syncResult = await syncRepslyWithShopify();
      setResult(syncResult);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sync data";
      setError(errorMessage);
      setResult({ success: false, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    result,
    error,
    syncData,
  };
};
