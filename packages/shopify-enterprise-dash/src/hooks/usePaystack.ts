import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as PaystackAPI from "../lib/paystack";

// Configure the query client
const queryClient = new QueryClient();

// Transactions
export const useInitializeTransaction = () => {
  return useMutation({
    mutationFn: PaystackAPI.initializeTransaction,
  });
};

export const useVerifyTransaction = (reference: string) => {
  return useQuery({
    queryKey: ["paystackTransaction", reference],
    queryFn: () => PaystackAPI.verifyTransaction(reference),
    enabled: !!reference,
  });
};

export const useTransactions = (params?: {
  perPage?: number;
  page?: number;
  customer?: number;
  status?: string;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["paystackTransactions", params],
    queryFn: () => PaystackAPI.listTransactions(params),
  });
};

// Customers
export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: PaystackAPI.createCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["paystackCustomer", data.email],
      });
    },
  });
};

export const useCustomer = (emailOrId: string | number) => {
  return useQuery({
    queryKey: ["paystackCustomer", emailOrId],
    queryFn: () => PaystackAPI.getCustomer(emailOrId),
    enabled: !!emailOrId,
  });
};

// Plans
export const usePlans = () => {
  return useQuery({
    queryKey: ["paystackPlans"],
    queryFn: PaystackAPI.listPlans,
  });
};

export const useCreatePlan = () => {
  return useMutation({
    mutationFn: PaystackAPI.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paystackPlans"] });
    },
  });
};

// Subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["paystackSubscriptions"],
    queryFn: PaystackAPI.listSubscriptions,
  });
};

export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: PaystackAPI.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paystackSubscriptions"] });
    },
  });
};

// Transfers
export const useInitiateTransfer = () => {
  return useMutation({
    mutationFn: PaystackAPI.initiateTransfer,
  });
};
