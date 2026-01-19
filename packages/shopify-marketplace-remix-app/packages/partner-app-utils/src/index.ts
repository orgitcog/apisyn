/**
 * @shopify-marketplace/partner-app-utils
 * 
 * Utilities and common patterns for building Shopify Partner marketplace applications
 */

// Configuration
export { getAppConfig, validateConfig } from './config';

// API Clients
export { 
  makeAppRequest, 
  postAppRequest, 
  putAppRequest, 
  deleteAppRequest,
  checkHealth 
} from './api-client';

// Admin App API
export { AdminAppApi, createAdminAppApi } from './admin-app-api';

// Market App API
export { MarketAppApi, createMarketAppApi } from './market-app-api';

// Buyer App API
export { BuyerAppApi, createBuyerAppApi } from './buyer-app-api';

// Health Check
export { 
  checkAllAppsHealth, 
  areAllAppsHealthy, 
  getHealthSummary 
} from './health-check';

// Types
export type {
  AppConfig,
  AdminAppConfig,
  MarketAppConfig,
  BuyerAppConfig,
  MultiAppConfig,
  Organization,
  VendorApplication,
  Vendor,
  Product,
  Buyer,
  Order,
  HealthCheckResult,
  ApiErrorResponse,
} from './types';

// Re-export request options type
export type { RequestOptions } from './api-client';
