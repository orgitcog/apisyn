import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as CrmAPI from "../lib/crm";

// Configure the query client
const queryClient = new QueryClient();

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => {
      // Use mock data during development
      return CrmAPI.getMockCustomers();
      // In production: return CrmAPI.getCustomers();
    },
  });
};

export const useCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => CrmAPI.getCustomerById(customerId),
    // Don't fetch if no customerId is provided
    enabled: !!customerId,
  });
};

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: (customerData: Omit<CrmAPI.Customer, "id" | "created_at">) =>
      CrmAPI.createCustomer(customerData),
    onSuccess: () => {
      // Invalidate customers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CrmAPI.Customer>;
    }) => CrmAPI.updateCustomer(id, updates),
    onSuccess: (data) => {
      if (data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["customer", data.id] });
      }
    },
  });
};

export const useDeleteCustomer = () => {
  return useMutation({
    mutationFn: (id: string) => CrmAPI.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// Interactions
export const useCustomerInteractions = (customerId: string) => {
  return useQuery({
    queryKey: ["customerInteractions", customerId],
    queryFn: () => {
      if (!customerId) return [];

      // Use mock data during development
      return CrmAPI.getMockInteractions().filter(
        (interaction) => interaction.customer_id === customerId,
      );
      // In production: return CrmAPI.getInteractionsByCustomer(customerId);
    },
    enabled: !!customerId,
  });
};

export const useCreateInteraction = () => {
  return useMutation({
    mutationFn: (
      interactionData: Omit<CrmAPI.Interaction, "id" | "created_at">,
    ) => CrmAPI.createInteraction(interactionData),
    onSuccess: (data) => {
      if (data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["customerInteractions", data.customer_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["customer", data.customer_id],
        });
      }
    },
  });
};

// Deals
export const useDeals = () => {
  return useQuery({
    queryKey: ["deals"],
    queryFn: () => {
      // Use mock data during development
      return CrmAPI.getMockDeals();
      // In production: return CrmAPI.getAllDeals();
    },
  });
};

export const useCustomerDeals = (customerId: string) => {
  return useQuery({
    queryKey: ["customerDeals", customerId],
    queryFn: () => {
      if (!customerId) return [];

      // Use mock data during development
      return CrmAPI.getMockDeals().filter(
        (deal) => deal.customer_id === customerId,
      );
      // In production: return CrmAPI.getDealsByCustomer(customerId);
    },
    enabled: !!customerId,
  });
};

export const useCreateDeal = () => {
  return useMutation({
    mutationFn: (
      dealData: Omit<CrmAPI.Deal, "id" | "created_at" | "updated_at">,
    ) => CrmAPI.createDeal(dealData),
    onSuccess: (data) => {
      if (data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        queryClient.invalidateQueries({
          queryKey: ["customerDeals", data.customer_id],
        });
      }
    },
  });
};

export const useUpdateDeal = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CrmAPI.Deal>;
    }) => CrmAPI.updateDeal(id, updates),
    onSuccess: (data) => {
      if (data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        queryClient.invalidateQueries({
          queryKey: ["customerDeals", data.customer_id],
        });
      }
    },
  });
};

// Analytics
export const useCrmAnalytics = () => {
  return useQuery({
    queryKey: ["crmAnalytics"],
    queryFn: () => {
      // Calculate analytics from mock data
      const customers = CrmAPI.getMockCustomers();
      const deals = CrmAPI.getMockDeals();

      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(
        (c) => c.status === "active",
      ).length;
      const leads = customers.filter((c) => c.status === "lead").length;

      const totalDeals = deals.length;
      const openDeals = deals.filter(
        (d) => !["closed_won", "closed_lost"].includes(d.stage),
      ).length;
      const wonDeals = deals.filter((d) => d.stage === "closed_won").length;
      const lostDeals = deals.filter((d) => d.stage === "closed_lost").length;

      const pipeline = deals.reduce(
        (sum, deal) =>
          sum +
          (!["closed_won", "closed_lost"].includes(deal.stage)
            ? deal.value
            : 0),
        0,
      );

      const revenue = deals.reduce(
        (sum, deal) => sum + (deal.stage === "closed_won" ? deal.value : 0),
        0,
      );

      return {
        totalCustomers,
        activeCustomers,
        leads,
        totalDeals,
        openDeals,
        wonDeals,
        lostDeals,
        pipeline,
        revenue,
        conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
      };

      // In production: return CrmAPI.getCustomerAnalytics();
    },
  });
};
