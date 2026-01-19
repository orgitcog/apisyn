import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as AppDirectAPI from "../lib/appdirect";

// Configure the query client
const queryClient = new QueryClient();

// Hook for applications
export const useApplications = () => {
  return useQuery({
    queryKey: ["appDirectApplications"],
    queryFn: () => {
      // Use the mock function during development
      return AppDirectAPI.getMockApplications();
      // In production, use: return AppDirectAPI.getApplications();
    },
  });
};

export const useApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ["appDirectApplication", applicationId],
    queryFn: () => AppDirectAPI.getApplication(applicationId),
    enabled: !!applicationId,
  });
};

// Hook for subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["appDirectSubscriptions"],
    queryFn: () => {
      // Use the mock function during development
      return AppDirectAPI.getMockSubscriptions();
      // In production, use: return AppDirectAPI.getSubscriptions();
    },
  });
};

export const useSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: ["appDirectSubscription", subscriptionId],
    queryFn: () => AppDirectAPI.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
  });
};

// Hook for creating a subscription
export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: ({
      applicationId,
      plan,
      account,
    }: {
      applicationId: string;
      plan: string;
      account: any;
    }) => AppDirectAPI.createSubscription(applicationId, plan, account),
    onSuccess: () => {
      // Invalidate subscriptions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["appDirectSubscriptions"] });
    },
  });
};

// Hook for cancelling a subscription
export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: ({
      subscriptionId,
      reason,
    }: {
      subscriptionId: string;
      reason: string;
    }) => AppDirectAPI.cancelSubscription(subscriptionId, reason),
    onSuccess: () => {
      // Invalidate subscriptions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["appDirectSubscriptions"] });
    },
  });
};

// Hook for users
export const useUsers = () => {
  return useQuery({
    queryKey: ["appDirectUsers"],
    queryFn: () => AppDirectAPI.getUsers(),
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["appDirectUser", userId],
    queryFn: () => AppDirectAPI.getUser(userId),
    enabled: !!userId,
  });
};

// Hook for creating a user
export const useCreateUser = () => {
  return useMutation({
    mutationFn: (userData: Partial<AppDirectAPI.AppDirectUser>) =>
      AppDirectAPI.createUser(userData),
    onSuccess: () => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["appDirectUsers"] });
    },
  });
};

// Hook for events
export const useEvents = () => {
  return useQuery({
    queryKey: ["appDirectEvents"],
    queryFn: () => AppDirectAPI.getEvents(),
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ["appDirectEvent", eventId],
    queryFn: () => AppDirectAPI.getEvent(eventId),
    enabled: !!eventId,
  });
};
