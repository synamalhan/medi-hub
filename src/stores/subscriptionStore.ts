import { create } from 'zustand';
import { getCustomerInfo, getPackages, purchasePackage, restorePurchases } from '../lib/revenuecat';

interface SubscriptionState {
  customerInfo: any | null;
  offerings: any | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomerInfo: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchase: (packageToPurchase: any) => Promise<void>;
  restore: () => Promise<void>;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  customerInfo: null,
  offerings: null,
  isLoading: false,
  error: null,

  fetchCustomerInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const customerInfo = await getCustomerInfo();
      set({ customerInfo, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchOfferings: async () => {
    set({ isLoading: true, error: null });
    try {
      const offerings = await getPackages();
      set({ offerings, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  purchase: async (packageToPurchase) => {
    set({ isLoading: true, error: null });
    try {
      const customerInfo = await purchasePackage(packageToPurchase);
      set({ customerInfo, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  restore: async () => {
    set({ isLoading: true, error: null });
    try {
      const customerInfo = await restorePurchases();
      set({ customerInfo, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clear: () => {
    set({ customerInfo: null, offerings: null, isLoading: false, error: null });
  },
})); 