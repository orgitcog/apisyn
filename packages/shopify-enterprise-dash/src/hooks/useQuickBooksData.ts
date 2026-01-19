import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as QuickBooksAPI from "../lib/quickbooks";

// Configure the query client
const queryClient = new QueryClient();

// Hook for customers
export const useQuickBooksCustomers = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["quickbooksCustomers", limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return QuickBooksAPI.getMockCustomers();
      // In production, use: return QuickBooksAPI.getCustomers(limit, offset);
    },
  });
};

export const useQuickBooksCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["quickbooksCustomer", customerId],
    queryFn: () => QuickBooksAPI.getCustomer(customerId),
    enabled: !!customerId,
  });
};

// Hook for items (products/services)
export const useQuickBooksItems = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["quickbooksItems", limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return QuickBooksAPI.getMockItems();
      // In production, use: return QuickBooksAPI.getItems(limit, offset);
    },
  });
};

export const useQuickBooksItem = (itemId: string) => {
  return useQuery({
    queryKey: ["quickbooksItem", itemId],
    queryFn: () => QuickBooksAPI.getItem(itemId),
    enabled: !!itemId,
  });
};

// Hook for invoices
export const useQuickBooksInvoices = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["quickbooksInvoices", limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return QuickBooksAPI.getMockInvoices();
      // In production, use: return QuickBooksAPI.getInvoices(limit, offset);
    },
  });
};

export const useQuickBooksInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ["quickbooksInvoice", invoiceId],
    queryFn: () => QuickBooksAPI.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};

// Hook for payments
export const useQuickBooksPayments = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["quickbooksPayments", limit, offset],
    queryFn: () => {
      // Use the mock function during development
      return QuickBooksAPI.getMockPayments();
      // In production, use: return QuickBooksAPI.getPayments(limit, offset);
    },
  });
};

export const useQuickBooksPayment = (paymentId: string) => {
  return useQuery({
    queryKey: ["quickbooksPayment", paymentId],
    queryFn: () => QuickBooksAPI.getPayment(paymentId),
    enabled: !!paymentId,
  });
};

// Hook for financial reports
export const useQuickBooksFinancialData = () => {
  return useQuery({
    queryKey: ["quickbooksFinancialData"],
    queryFn: () => {
      // Use the mock function during development
      return QuickBooksAPI.getMockFinancialData();
      // In production, use: return QuickBooksAPI.getReport('ProfitAndLoss', { period: 'ThisQuarter' });
    },
  });
};

// Hook for syncing QuickBooks data
export const useSyncQuickBooksData = () => {
  return useMutation({
    mutationFn: QuickBooksAPI.syncQuickBooksData,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["quickbooksCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["quickbooksItems"] });
      queryClient.invalidateQueries({ queryKey: ["quickbooksInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["quickbooksPayments"] });
      queryClient.invalidateQueries({ queryKey: ["quickbooksFinancialData"] });
    },
  });
};
