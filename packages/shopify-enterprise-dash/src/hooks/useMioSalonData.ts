import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as MioSalonAPI from "../lib/miosalon";

// Configure the query client
const queryClient = new QueryClient();

// Salons
export const useSalons = () => {
  return useQuery({
    queryKey: ["salons"],
    queryFn: () => {
      // Use mock data during development
      return MioSalonAPI.getMockSalons();
      // In production: return MioSalonAPI.getSalons();
    },
  });
};

export const useSalon = (salonId: string) => {
  return useQuery({
    queryKey: ["salon", salonId],
    queryFn: () => MioSalonAPI.getSalonById(salonId),
    enabled: !!salonId,
  });
};

export const useCreateSalon = () => {
  return useMutation({
    mutationFn: (salonData: Omit<MioSalonAPI.Salon, "id" | "created_at">) =>
      MioSalonAPI.createSalon(salonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salons"] });
    },
  });
};

export const useUpdateSalon = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MioSalonAPI.Salon>;
    }) => MioSalonAPI.updateSalon(id, updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["salons"] });
        queryClient.invalidateQueries({ queryKey: ["salon", data.id] });
      }
    },
  });
};

export const useDeleteSalon = () => {
  return useMutation({
    mutationFn: (id: string) => MioSalonAPI.deleteSalon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salons"] });
    },
  });
};

// Staff
export const useSalonStaff = (salonId: string) => {
  return useQuery({
    queryKey: ["salonStaff", salonId],
    queryFn: () => {
      if (!salonId) return [];

      // Use mock data during development
      return MioSalonAPI.getMockStaff(salonId);
      // In production: return MioSalonAPI.getStaffBySalon(salonId);
    },
    enabled: !!salonId,
  });
};

export const useCreateStaff = () => {
  return useMutation({
    mutationFn: (staffData: Omit<MioSalonAPI.Staff, "id" | "created_at">) =>
      MioSalonAPI.createStaff(staffData),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["salonStaff", data.salon_id],
        });
      }
    },
  });
};

// Services
export const useSalonServices = (salonId: string) => {
  return useQuery({
    queryKey: ["salonServices", salonId],
    queryFn: () => {
      if (!salonId) return [];

      // Use mock data during development
      return MioSalonAPI.getMockServices(salonId);
      // In production: return MioSalonAPI.getServicesBySalon(salonId);
    },
    enabled: !!salonId,
  });
};

export const useCreateService = () => {
  return useMutation({
    mutationFn: (serviceData: Omit<MioSalonAPI.Service, "id" | "created_at">) =>
      MioSalonAPI.createService(serviceData),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["salonServices", data.salon_id],
        });
      }
    },
  });
};

// Appointments
export const useSalonAppointments = (
  salonId: string,
  startDate?: string,
  endDate?: string,
  status?: MioSalonAPI.Appointment["status"],
) => {
  return useQuery({
    queryKey: ["salonAppointments", salonId, startDate, endDate, status],
    queryFn: () => {
      if (!salonId) return [];

      // Use mock data during development
      return MioSalonAPI.getMockAppointments(salonId);
      // In production: return MioSalonAPI.getAppointmentsBySalon(salonId, startDate, endDate, status);
    },
    enabled: !!salonId,
  });
};

export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (
      appointmentData: Omit<
        MioSalonAPI.Appointment,
        "id" | "created_at" | "updated_at"
      >,
    ) => MioSalonAPI.createAppointment(appointmentData),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["salonAppointments", data.salon_id],
        });
      }
    },
  });
};

export const useUpdateAppointment = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MioSalonAPI.Appointment>;
    }) => MioSalonAPI.updateAppointment(id, updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["salonAppointments", data.salon_id],
        });
      }
    },
  });
};

// Clients
export const useSalonClients = (salonId: string) => {
  return useQuery({
    queryKey: ["salonClients", salonId],
    queryFn: () => {
      if (!salonId) return [];

      // Use mock data during development
      return MioSalonAPI.getMockClients(salonId);
      // In production: return MioSalonAPI.getClientsBySalon(salonId);
    },
    enabled: !!salonId,
  });
};

export const useCreateClient = () => {
  return useMutation({
    mutationFn: (
      clientData: Omit<
        MioSalonAPI.Client,
        "id" | "created_at" | "total_visits" | "total_spent"
      >,
    ) => MioSalonAPI.createClient(clientData),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["salonClients", data.salon_id],
        });
      }
    },
  });
};

// Analytics
export const useSalonAnalytics = (
  salonId: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ["salonAnalytics", salonId, startDate, endDate],
    queryFn: () => {
      if (!salonId) return null;

      // Use mock data during development
      return MioSalonAPI.getMockSalonAnalytics();
      // In production: return MioSalonAPI.getSalonAnalytics(salonId, startDate, endDate);
    },
    enabled: !!salonId,
  });
};

// Shopify Integration
export const useSyncWithShopify = () => {
  return useMutation({
    mutationFn: ({
      salonId,
      shopifyStoreId,
    }: {
      salonId: string;
      shopifyStoreId: string;
    }) => MioSalonAPI.syncWithShopify(salonId, shopifyStoreId),
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.invalidateQueries({ queryKey: ["salons"] });
        queryClient.invalidateQueries({ queryKey: ["salon", data.data.id] });
      }
    },
  });
};
