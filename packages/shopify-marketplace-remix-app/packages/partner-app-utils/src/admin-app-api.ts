import { getAppConfig } from './config';
import { makeAppRequest, postAppRequest } from './api-client';
import type { Organization, VendorApplication } from './types';

/**
 * Mock data for admin app when service is unavailable
 */
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "1",
    name: "Acme Vendors Inc",
    status: "active",
    vendorCount: 12,
    productCount: 145,
    monthlyRevenue: "$12,450",
  },
  {
    id: "2",
    name: "Global Marketplace Co",
    status: "pending",
    vendorCount: 8,
    productCount: 89,
    monthlyRevenue: "$8,720",
  },
  {
    id: "3",
    name: "Tech Partners Ltd",
    status: "active",
    vendorCount: 15,
    productCount: 203,
    monthlyRevenue: "$18,900",
  },
];

const MOCK_VENDOR_APPLICATIONS: VendorApplication[] = [
  {
    id: "1",
    vendorName: "Tech Gadgets Pro",
    orgId: "1",
    appliedDate: "2024-09-01",
    status: "pending",
    email: "contact@techgadgets.com",
  },
  {
    id: "2",
    vendorName: "Home Decor Plus",
    orgId: "2",
    appliedDate: "2024-09-05",
    status: "pending",
    email: "info@homedecor.com",
  },
];

/**
 * Admin App API client
 */
export class AdminAppApi {
  private baseUrl: string;

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.adminApp.baseUrl;
  }

  /**
   * Get all organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    const data = await makeAppRequest<Organization[]>(`${this.baseUrl}/api/organizations`);
    return data || MOCK_ORGANIZATIONS;
  }

  /**
   * Get a specific organization by ID
   */
  async getOrganization(id: string): Promise<Organization | null> {
    const data = await makeAppRequest<Organization>(`${this.baseUrl}/api/organizations/${id}`);
    return data || MOCK_ORGANIZATIONS.find(org => org.id === id) || null;
  }

  /**
   * Get all vendor applications
   */
  async getVendorApplications(): Promise<VendorApplication[]> {
    const data = await makeAppRequest<VendorApplication[]>(`${this.baseUrl}/api/vendor-applications`);
    return data || MOCK_VENDOR_APPLICATIONS;
  }

  /**
   * Approve a vendor application
   */
  async approveVendor(vendorId: string): Promise<{ success: boolean }> {
    const data = await postAppRequest<{ success: boolean }>(
      `${this.baseUrl}/api/vendors/${vendorId}/approve`,
      {}
    );
    return data || { success: true };
  }

  /**
   * Reject a vendor application
   */
  async rejectVendor(vendorId: string, reason: string): Promise<{ success: boolean }> {
    const data = await postAppRequest<{ success: boolean }>(
      `${this.baseUrl}/api/vendors/${vendorId}/reject`,
      { reason }
    );
    return data || { success: true };
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData: Partial<Organization>): Promise<Organization | null> {
    const data = await postAppRequest<Organization>(
      `${this.baseUrl}/api/organizations`,
      orgData
    );
    return data;
  }
}

/**
 * Create a new instance of the Admin App API client
 */
export function createAdminAppApi(): AdminAppApi {
  return new AdminAppApi();
}
