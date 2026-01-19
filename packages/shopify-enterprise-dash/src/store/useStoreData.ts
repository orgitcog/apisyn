import { create } from "zustand";
import {
  getStores,
  updateStore,
  createStore,
  deleteStore,
} from "../lib/supabase";

export interface Store {
  id: string;
  name: string;
  url: string;
  revenue: number;
  orders: number;
  status: "active" | "inactive" | "pending";
  lastSync: string;
}

interface StoreState {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
  updateStore: (
    id: string,
    updates: Partial<Omit<Store, "id">>,
  ) => Promise<void>;
  createStore: (store: {
    name: string;
    url: string;
    status?: string;
  }) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
}

export const useStoreData = create<StoreState>((set, get) => ({
  stores: [],
  isLoading: false,
  error: null,
  fetchStores: async () => {
    set({ isLoading: true, error: null });
    try {
      // First attempt to fetch from the database
      const dbStores = await getStores();

      if (dbStores.length > 0) {
        // Convert the database format to our application format
        const appStores = dbStores.map((store) => ({
          id: store.id,
          name: store.name,
          url: store.url,
          revenue: store.revenue,
          orders: store.orders,
          status: store.status as "active" | "inactive" | "pending",
          lastSync: store.last_sync,
        }));

        set({ stores: appStores, isLoading: false });
        return;
      }

      // If no stores in the database, use mock data
      const mockStores: Store[] = [
        {
          id: "1",
          name: "Fashion Boutique",
          url: "fashion-boutique.myshopify.com",
          revenue: 125350,
          orders: 1423,
          status: "active",
          lastSync: "2025-03-28T15:24:32Z",
        },
        {
          id: "2",
          name: "Tech Gadgets",
          url: "tech-gadgets.myshopify.com",
          revenue: 89720,
          orders: 742,
          status: "active",
          lastSync: "2025-03-28T16:45:12Z",
        },
        {
          id: "3",
          name: "Home Decor",
          url: "home-decor.myshopify.com",
          revenue: 67890,
          orders: 531,
          status: "inactive",
          lastSync: "2025-03-27T09:12:45Z",
        },
        {
          id: "4",
          name: "Beauty Products",
          url: "beauty-products.myshopify.com",
          revenue: 102450,
          orders: 891,
          status: "active",
          lastSync: "2025-03-28T14:30:22Z",
        },
        {
          id: "5",
          name: "Sports Equipment",
          url: "sports-equipment.myshopify.com",
          revenue: 75640,
          orders: 623,
          status: "pending",
          lastSync: "2025-03-28T11:18:36Z",
        },
        {
          id: "6",
          name: "Pet Supplies",
          url: "pet-supplies.myshopify.com",
          revenue: 43290,
          orders: 387,
          status: "active",
          lastSync: "2025-03-28T13:52:19Z",
        },
      ];

      set({ stores: mockStores, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateStore: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Format the updates to match the database column names
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.url) dbUpdates.url = updates.url;
      if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue;
      if (updates.orders !== undefined) dbUpdates.orders = updates.orders;
      if (updates.status) dbUpdates.status = updates.status;

      const updatedStore = await updateStore(id, dbUpdates);

      if (updatedStore) {
        const currentStores = get().stores;
        const updatedStores = currentStores.map((store) =>
          store.id === id
            ? {
                ...store,
                ...updates,
              }
            : store,
        );

        set({ stores: updatedStores, isLoading: false });
      } else {
        set({ isLoading: false, error: "Failed to update store" });
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createStore: async (storeData) => {
    set({ isLoading: true, error: null });
    try {
      const newStore = await createStore(storeData);

      if (newStore) {
        const appStore: Store = {
          id: newStore.id,
          name: newStore.name,
          url: newStore.url,
          revenue: newStore.revenue,
          orders: newStore.orders,
          status: newStore.status as "active" | "inactive" | "pending",
          lastSync: newStore.last_sync,
        };

        set((state) => ({
          stores: [...state.stores, appStore],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: "Failed to create store" });
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteStore: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteStore(id);

      if (success) {
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== id),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: "Failed to delete store" });
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
