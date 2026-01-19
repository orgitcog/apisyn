/**
 * Integration utilities for communicating with sub-apps
 * Now using @shopify-marketplace/partner-app-utils package
 */
import { json } from "@remix-run/node";
import {
  createAdminAppApi,
  createMarketAppApi,
  createBuyerAppApi,
  checkAllAppsHealth,
  type Organization,
  type VendorApplication,
  type Vendor,
  type Product,
  type Buyer,
  type Order,
  type HealthCheckResult,
} from "@shopify-marketplace/partner-app-utils";

// Create API client instances
const adminApi = createAdminAppApi();
const marketApi = createMarketAppApi();
const buyerApi = createBuyerAppApi();

// Admin App API calls
export const adminAppApi = {
  async getOrganizations(): Promise<Organization[]> {
    return await adminApi.getOrganizations();
  },

  async getVendorApplications(): Promise<VendorApplication[]> {
    return await adminApi.getVendorApplications();
  },

  async approveVendor(vendorId: string) {
    return await adminApi.approveVendor(vendorId);
  },
};

// Market App API calls
export const marketAppApi = {
  async getVendors(): Promise<Vendor[]> {
    return await marketApi.getVendors();
  },

  async getProducts(): Promise<Product[]> {
    return await marketApi.getProducts();
  },

  async approveProduct(productId: string) {
    return await marketApi.approveProduct(productId);
  },
};

// Buyer App API calls
export const buyerAppApi = {
  async getBuyers(): Promise<Buyer[]> {
    return await buyerApi.getBuyers();
  },

  async getOrders(): Promise<Order[]> {
    return await buyerApi.getOrders();
  },
};

// Utility to check if sub-apps are running
export async function checkAppHealth(): Promise<HealthCheckResult> {
  return await checkAllAppsHealth();
}

// Error handling for API responses
export function handleApiError(error: any) {
  console.error("API Error:", error);
  return json(
    { 
      error: "Service temporarily unavailable", 
      message: "Using cached data" 
    },
    { status: 503 }
  );
}

// Re-export types for convenience
export type {
  Organization,
  VendorApplication,
  Vendor,
  Product,
  Buyer,
  Order,
  HealthCheckResult,
};