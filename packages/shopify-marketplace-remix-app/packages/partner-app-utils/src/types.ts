/**
 * Common types for Shopify Partner marketplace applications
 */

export interface AppConfig {
  baseUrl: string;
  port: number;
}

export interface AdminAppConfig extends AppConfig {}

export interface MarketAppConfig extends AppConfig {}

export interface BuyerAppConfig extends AppConfig {}

export interface MultiAppConfig {
  adminApp: AdminAppConfig;
  marketApp: MarketAppConfig;
  buyerApp: BuyerAppConfig;
}

export interface Organization {
  id: string;
  name: string;
  status: string;
  vendorCount: number;
  productCount: number;
  monthlyRevenue: string;
}

export interface VendorApplication {
  id: string;
  vendorName: string;
  orgId: string;
  appliedDate: string;
  status: string;
  email: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  status: string;
  productCount: number;
  totalSales: string;
  joinDate: string;
}

export interface Product {
  id: string;
  title: string;
  vendor: string;
  status: string;
  price: string;
  addedDate: string;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string;
}

export interface Order {
  id: string;
  buyerName: string;
  company: string;
  amount: string;
  status: string;
  orderDate: string;
  items: number;
}

export interface HealthCheckResult {
  adminApp: boolean;
  marketApp: boolean;
  buyerApp: boolean;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}
