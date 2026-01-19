import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as ShopifyAPI from "../lib/shopify";

// Configure the query client
const queryClient = new QueryClient();

// Hook for shop information
export const useShopInfo = () => {
  return useQuery({
    queryKey: ["shopInfo"],
    queryFn: () => ShopifyAPI.getShopInfo(),
  });
};

// Hook for products
export const useProducts = (limit = 10) => {
  return useQuery({
    queryKey: ["products", limit],
    queryFn: () => ShopifyAPI.getProducts(limit),
  });
};

// Hook for orders
export const useOrders = (limit = 10) => {
  return useQuery({
    queryKey: ["orders", limit],
    queryFn: () => ShopifyAPI.getOrders(limit),
  });
};

// Hook for customers
export const useCustomers = (limit = 10) => {
  return useQuery({
    queryKey: ["customers", limit],
    queryFn: () => ShopifyAPI.getCustomers(limit),
  });
};

// Hook for analytics
export const useAnalytics = (interval = "MONTH") => {
  return useQuery({
    queryKey: ["analytics", interval],
    queryFn: () => ShopifyAPI.getAnalytics(interval),
  });
};

// Hook for syncing Shopify data to Supabase
export const useSyncShopifyData = () => {
  return useMutation({
    mutationFn: ShopifyAPI.syncShopifyDataToSupabase,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["storeData"] });
    },
  });
};
