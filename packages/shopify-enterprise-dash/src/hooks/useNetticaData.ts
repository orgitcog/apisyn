import { useQuery, _useMutation, QueryClient } from "@tanstack/react-query";
import * as NetticaAPI from "../lib/nettica";

// Configure the query client
const _queryClient = new QueryClient();

// Networks
export const useNetworks = () => {
  return useQuery({
    queryKey: ["netticaNetworks"],
    queryFn: () => {
      // Use mock data during development
      return NetticaAPI.getMockNetworks();
      // In production: return NetticaAPI.getNetworks();
    },
  });
};

export const useNetwork = (networkId: string) => {
  return useQuery({
    queryKey: ["netticaNetwork", networkId],
    queryFn: () => NetticaAPI.getNetwork(networkId),
    enabled: !!networkId,
  });
};

// Nodes
export const useNodes = (networkId: string) => {
  return useQuery({
    queryKey: ["netticaNodes", networkId],
    queryFn: () => {
      if (!networkId) return [];

      // Use mock data during development
      return NetticaAPI.getMockNodes(networkId);
      // In production: return NetticaAPI.getNodes(networkId);
    },
    enabled: !!networkId,
  });
};

export const useNode = (networkId: string, nodeId: string) => {
  return useQuery({
    queryKey: ["netticaNode", networkId, nodeId],
    queryFn: () => NetticaAPI.getNode(networkId, nodeId),
    enabled: !!networkId && !!nodeId,
  });
};

// Connections
export const useConnections = (networkId: string) => {
  return useQuery({
    queryKey: ["netticaConnections", networkId],
    queryFn: () => {
      if (!networkId) return [];

      // Use mock data during development
      return NetticaAPI.getMockConnections(networkId);
      // In production: return NetticaAPI.getConnections(networkId);
    },
    enabled: !!networkId,
  });
};

// Metrics
export const useNetworkMetrics = (
  networkId: string,
  period: "hour" | "day" | "week" | "month" = "day",
) => {
  return useQuery({
    queryKey: ["netticaMetrics", networkId, period],
    queryFn: () => {
      if (!networkId) return null;

      // Use mock data during development
      return NetticaAPI.getMockMetrics(networkId);
      // In production: return NetticaAPI.getNetworkMetrics(networkId, period);
    },
    enabled: !!networkId,
  });
};
