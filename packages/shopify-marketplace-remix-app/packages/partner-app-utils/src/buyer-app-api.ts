import { getAppConfig } from './config';
import { makeAppRequest, postAppRequest } from './api-client';
import type { Buyer, Order } from './types';

/**
 * Mock data for buyer app when service is unavailable
 */
const MOCK_BUYERS: Buyer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    company: "ABC Corp",
    status: "active",
    totalOrders: 12,
    totalSpent: "$2,450",
    lastOrder: "2024-09-05",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@techcorp.com",
    company: "Tech Corp",
    status: "active",
    totalOrders: 8,
    totalSpent: "$1,890",
    lastOrder: "2024-09-10",
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    buyerName: "John Smith",
    company: "ABC Corp",
    amount: "$145.50",
    status: "delivered",
    orderDate: "2024-09-05",
    items: 3,
  },
  {
    id: "ORD-002",
    buyerName: "Sarah Johnson",
    company: "Tech Corp",
    amount: "$299.99",
    status: "processing",
    orderDate: "2024-09-10",
    items: 2,
  },
  {
    id: "ORD-003",
    buyerName: "John Smith",
    company: "ABC Corp",
    amount: "$89.99",
    status: "shipped",
    orderDate: "2024-09-12",
    items: 1,
  },
];

/**
 * Buyer App API client
 */
export class BuyerAppApi {
  private baseUrl: string;

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.buyerApp.baseUrl;
  }

  /**
   * Get all buyers
   */
  async getBuyers(): Promise<Buyer[]> {
    const data = await makeAppRequest<Buyer[]>(`${this.baseUrl}/api/buyers`);
    return data || MOCK_BUYERS;
  }

  /**
   * Get a specific buyer by ID
   */
  async getBuyer(id: string): Promise<Buyer | null> {
    const data = await makeAppRequest<Buyer>(`${this.baseUrl}/api/buyers/${id}`);
    return data || MOCK_BUYERS.find(buyer => buyer.id === id) || null;
  }

  /**
   * Get all orders
   */
  async getOrders(): Promise<Order[]> {
    const data = await makeAppRequest<Order[]>(`${this.baseUrl}/api/orders`);
    return data || MOCK_ORDERS;
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    const data = await makeAppRequest<Order>(`${this.baseUrl}/api/orders/${id}`);
    return data || MOCK_ORDERS.find(order => order.id === id) || null;
  }

  /**
   * Get orders for a specific buyer
   */
  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const data = await makeAppRequest<Order[]>(`${this.baseUrl}/api/buyers/${buyerId}/orders`);
    return data || MOCK_ORDERS.filter(order => order.buyerName === MOCK_BUYERS.find(b => b.id === buyerId)?.name);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean }> {
    const data = await postAppRequest<{ success: boolean }>(
      `${this.baseUrl}/api/orders/${orderId}/status`,
      { status }
    );
    return data || { success: true };
  }

  /**
   * Get buyer analytics
   */
  async getBuyerAnalytics(buyerId: string): Promise<any> {
    const data = await makeAppRequest(`${this.baseUrl}/api/buyers/${buyerId}/analytics`);
    return data || {
      totalSpent: "$0",
      totalOrders: 0,
      averageOrderValue: "$0",
      lastOrderDate: null,
    };
  }
}

/**
 * Create a new instance of the Buyer App API client
 */
export function createBuyerAppApi(): BuyerAppApi {
  return new BuyerAppApi();
}
