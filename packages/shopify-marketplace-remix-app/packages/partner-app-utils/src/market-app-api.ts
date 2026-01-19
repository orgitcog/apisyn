import { getAppConfig } from './config';
import { makeAppRequest, postAppRequest } from './api-client';
import type { Vendor, Product } from './types';

/**
 * Mock data for market app when service is unavailable
 */
const MOCK_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "Tech Solutions Pro",
    email: "contact@techsolutions.com",
    status: "active",
    productCount: 24,
    totalSales: "$5,240",
    joinDate: "2024-08-15",
  },
  {
    id: "2",
    name: "Fashion Hub",
    email: "info@fashionhub.com",
    status: "active",
    productCount: 18,
    totalSales: "$3,890",
    joinDate: "2024-08-20",
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Wireless Bluetooth Headphones",
    vendor: "Tech Solutions Pro",
    status: "published",
    price: "$89.99",
    addedDate: "2024-09-08",
  },
  {
    id: "2",
    title: "Smart Watch Series 5",
    vendor: "Tech Solutions Pro",
    status: "published",
    price: "$199.99",
    addedDate: "2024-09-10",
  },
  {
    id: "3",
    title: "Designer Leather Handbag",
    vendor: "Fashion Hub",
    status: "pending",
    price: "$149.99",
    addedDate: "2024-09-12",
  },
];

/**
 * Market App API client
 */
export class MarketAppApi {
  private baseUrl: string;

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.marketApp.baseUrl;
  }

  /**
   * Get all vendors
   */
  async getVendors(): Promise<Vendor[]> {
    const data = await makeAppRequest<Vendor[]>(`${this.baseUrl}/api/vendors`);
    return data || MOCK_VENDORS;
  }

  /**
   * Get a specific vendor by ID
   */
  async getVendor(id: string): Promise<Vendor | null> {
    const data = await makeAppRequest<Vendor>(`${this.baseUrl}/api/vendors/${id}`);
    return data || MOCK_VENDORS.find(vendor => vendor.id === id) || null;
  }

  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    const data = await makeAppRequest<Product[]>(`${this.baseUrl}/api/products`);
    return data || MOCK_PRODUCTS;
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    const data = await makeAppRequest<Product>(`${this.baseUrl}/api/products/${id}`);
    return data || MOCK_PRODUCTS.find(product => product.id === id) || null;
  }

  /**
   * Approve a product
   */
  async approveProduct(productId: string): Promise<{ success: boolean }> {
    const data = await postAppRequest<{ success: boolean }>(
      `${this.baseUrl}/api/products/${productId}/approve`,
      {}
    );
    return data || { success: true };
  }

  /**
   * Reject a product
   */
  async rejectProduct(productId: string, reason: string): Promise<{ success: boolean }> {
    const data = await postAppRequest<{ success: boolean }>(
      `${this.baseUrl}/api/products/${productId}/reject`,
      { reason }
    );
    return data || { success: true };
  }

  /**
   * Get vendor analytics
   */
  async getVendorAnalytics(vendorId: string): Promise<any> {
    const data = await makeAppRequest(`${this.baseUrl}/api/vendors/${vendorId}/analytics`);
    return data || {
      totalSales: "$0",
      totalOrders: 0,
      averageOrderValue: "$0",
      topProducts: [],
    };
  }
}

/**
 * Create a new instance of the Market App API client
 */
export function createMarketAppApi(): MarketAppApi {
  return new MarketAppApi();
}
