import type { MultiAppConfig, AdminAppConfig, MarketAppConfig, BuyerAppConfig } from './types';

/**
 * Get application configuration based on environment
 */
export function getAppConfig(): MultiAppConfig {
  const isDev = process.env.NODE_ENV === "development";
  
  return {
    adminApp: {
      baseUrl: isDev ? "http://localhost:3001" : process.env.ADMIN_APP_URL || "",
      port: 3001,
    } as AdminAppConfig,
    marketApp: {
      baseUrl: isDev ? "http://localhost:3002" : process.env.MARKET_APP_URL || "",
      port: 3002,
    } as MarketAppConfig,
    buyerApp: {
      baseUrl: isDev ? "http://localhost:3003" : process.env.BUYER_APP_URL || "",
      port: 3003,
    } as BuyerAppConfig,
  };
}

/**
 * Validate that required environment variables are set for production
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const isDev = process.env.NODE_ENV === "development";
  
  // Skip validation in development
  if (isDev) {
    return { valid: true, errors: [] };
  }
  
  // Check required production environment variables
  if (!process.env.ADMIN_APP_URL) {
    errors.push("ADMIN_APP_URL is required in production");
  }
  if (!process.env.MARKET_APP_URL) {
    errors.push("MARKET_APP_URL is required in production");
  }
  if (!process.env.BUYER_APP_URL) {
    errors.push("BUYER_APP_URL is required in production");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
