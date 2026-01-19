import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as POSAPI from "../lib/pos";

// Configure the query client
const queryClient = new QueryClient();

// Hook for registers
export const useRegisters = () => {
  return useQuery({
    queryKey: ["posRegisters"],
    queryFn: () => {
      // Use the mock function during development
      return POSAPI.getMockRegisters();
      // In production, use: return POSAPI.getRegisters();
    },
  });
};

export const useRegister = (registerId: string) => {
  return useQuery({
    queryKey: ["posRegister", registerId],
    queryFn: () => POSAPI.getRegister(registerId),
    enabled: !!registerId,
  });
};

// Hook for transactions
export const useTransactions = (
  locationId?: string,
  registerId?: string,
  startDate?: string,
  endDate?: string,
  limit = 20,
  offset = 0,
) => {
  return useQuery({
    queryKey: [
      "posTransactions",
      locationId,
      registerId,
      startDate,
      endDate,
      limit,
      offset,
    ],
    queryFn: () => {
      // Use the mock function during development
      return POSAPI.getMockTransactions();
      // In production, use: return POSAPI.getTransactions(locationId, registerId, startDate, endDate, limit, offset);
    },
  });
};

export const useTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ["posTransaction", transactionId],
    queryFn: () => POSAPI.getTransaction(transactionId),
    enabled: !!transactionId,
  });
};

// Hook for shifts
export const useShifts = (
  locationId?: string,
  registerId?: string,
  staffId?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: [
      "posShifts",
      locationId,
      registerId,
      staffId,
      status,
      startDate,
      endDate,
    ],
    queryFn: () => {
      // Use the mock function during development
      return POSAPI.getMockShifts();
      // In production, use: return POSAPI.getShifts(locationId, registerId, staffId, status, startDate, endDate);
    },
  });
};

export const useShift = (shiftId: string) => {
  return useQuery({
    queryKey: ["posShift", shiftId],
    queryFn: () => POSAPI.getShift(shiftId),
    enabled: !!shiftId,
  });
};

// Hook for staff members
export const useStaffMembers = (locationId?: string) => {
  return useQuery({
    queryKey: ["posStaffMembers", locationId],
    queryFn: () => {
      // Use the mock function during development
      return POSAPI.getMockStaffMembers();
      // In production, use: return POSAPI.getStaffMembers(locationId);
    },
  });
};

export const useStaffMember = (staffId: string) => {
  return useQuery({
    queryKey: ["posStaffMember", staffId],
    queryFn: () => POSAPI.getStaffMember(staffId),
    enabled: !!staffId,
  });
};

// Hook for analytics
export const usePOSAnalytics = (
  period: "day" | "week" | "month" | "year" = "month",
  locationId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ["posAnalytics", period, locationId, startDate, endDate],
    queryFn: () => {
      // Use the mock function during development
      return POSAPI.getMockAnalytics();
      // In production, use: return POSAPI.getAnalytics(period, locationId, startDate, endDate);
    },
  });
};

// Hook for syncing POS data
export const useSyncPOSData = () => {
  return useMutation({
    mutationFn: POSAPI.syncPOSData,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["posRegisters"] });
      queryClient.invalidateQueries({ queryKey: ["posTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["posShifts"] });
      queryClient.invalidateQueries({ queryKey: ["posStaffMembers"] });
      queryClient.invalidateQueries({ queryKey: ["posAnalytics"] });
    },
  });
};
