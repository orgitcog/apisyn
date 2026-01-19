import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as StripeAPI from "../lib/stripe";

// Configure the query client
const queryClient = new QueryClient();

// Customers
export const useStripeCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["stripeCustomer", customerId],
    queryFn: () => StripeAPI.getCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useCreateStripeCustomer = () => {
  return useMutation({
    mutationFn: StripeAPI.createCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stripeCustomer", data.id] });
    },
  });
};

export const useUpdateStripeCustomer = () => {
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Partial<StripeAPI.StripeCustomer>;
    }) => StripeAPI.updateCustomer(customerId, data),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["stripeCustomer", data.id],
        });
      }
    },
  });
};

// Products
export const useStripeProduct = (productId: string) => {
  return useQuery({
    queryKey: ["stripeProduct", productId],
    queryFn: () => StripeAPI.getProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateStripeProduct = () => {
  return useMutation({
    mutationFn: StripeAPI.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stripeProduct", data.id] });
    },
  });
};

// Prices
export const useStripePrice = (priceId: string) => {
  return useQuery({
    queryKey: ["stripePrice", priceId],
    queryFn: () => StripeAPI.getPrice(priceId),
    enabled: !!priceId,
  });
};

export const useCreateStripePrice = () => {
  return useMutation({
    mutationFn: StripeAPI.createPrice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stripePrice", data.id] });
    },
  });
};

// Subscriptions
export const useStripeSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: ["stripeSubscription", subscriptionId],
    queryFn: () => StripeAPI.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
  });
};

export const useCreateStripeSubscription = () => {
  return useMutation({
    mutationFn: StripeAPI.createSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["stripeSubscription", data.id],
      });
    },
  });
};

export const useCancelStripeSubscription = () => {
  return useMutation({
    mutationFn: StripeAPI.cancelSubscription,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["stripeSubscription", data.id],
        });
      }
    },
  });
};

// Payment Intents
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: StripeAPI.createPaymentIntent,
  });
};

// Invoices
export const useStripeInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ["stripeInvoice", invoiceId],
    queryFn: () => StripeAPI.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};
