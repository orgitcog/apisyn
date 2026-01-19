import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as NetSuiteAPI from "../lib/netsuite";

// Configure the query client
const queryClient = new QueryClient();

// Hook for customers
export const useNetSuiteCustomers = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["netsuiteCustomers", limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return NetSuiteAPI.getMockCustomers();
      // In production, use: return NetSuiteAPI.getCustomers(limit, offset);
    },
  });
};

export const useNetSuiteCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["netsuiteCustomer", customerId],
    queryFn: () => NetSuiteAPI.getCustomer(customerId),
    enabled: !!customerId,
  });
};

// Hook for transactions
export const useNetSuiteTransactions = (
  type?: string,
  startDate?: string,
  endDate?: string,
  limit = 20,
  offset = 0,
) => {
  return useQuery({
    queryKey: ["netsuiteTransactions", type, startDate, endDate, limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return NetSuiteAPI.getMockTransactions();
      // In production, use: return NetSuiteAPI.getTransactions(type, startDate, endDate, limit, offset);
    },
  });
};

export const useNetSuiteTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ["netsuiteTransaction", transactionId],
    queryFn: () => NetSuiteAPI.getTransaction(transactionId),
    enabled: !!transactionId,
  });
};

// Hook for subsidiaries
export const useNetSuiteSubsidiaries = () => {
  return useQuery({
    queryKey: ["netsuiteSubsidiaries"],
    queryFn: () => {
      // Use the mock function during development
      return NetSuiteAPI.getMockSubsidiaries();
      // In production, use: return NetSuiteAPI.getSubsidiaries();
    },
  });
};

export const useNetSuiteSubsidiary = (subsidiaryId: string) => {
  return useQuery({
    queryKey: ["netsuiteSubsidiary", subsidiaryId],
    queryFn: () => NetSuiteAPI.getSubsidiary(subsidiaryId),
    enabled: !!subsidiaryId,
  });
};

// Hook for financial data
export const useNetSuiteFinancialData = (
  period: string,
  subsidiaryId?: string,
) => {
  return useQuery({
    queryKey: ["netsuiteFinancialData", period, subsidiaryId],
    queryFn: () => {
      // Use the mock function during development
      return NetSuiteAPI.getMockFinancialData();
      // In production, use: return NetSuiteAPI.getFinancialData(period, subsidiaryId);
    },
    enabled: !!period,
  });
};

// Hook for syncing NetSuite data
export const useSyncNetSuiteData = () => {
  return useMutation({
    mutationFn: NetSuiteAPI.syncNetSuiteData,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["netsuiteCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["netsuiteTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["netsuiteFinancialData"] });
    },
  });
};
