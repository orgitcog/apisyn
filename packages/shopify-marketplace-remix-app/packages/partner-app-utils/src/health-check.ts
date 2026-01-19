import { getAppConfig } from './config';
import { checkHealth } from './api-client';
import type { HealthCheckResult } from './types';

/**
 * Check the health status of all sub-applications
 */
export async function checkAllAppsHealth(): Promise<HealthCheckResult> {
  const config = getAppConfig();
  
  const healthChecks = await Promise.allSettled([
    checkHealth(config.adminApp.baseUrl),
    checkHealth(config.marketApp.baseUrl),
    checkHealth(config.buyerApp.baseUrl),
  ]);

  return {
    adminApp: healthChecks[0].status === "fulfilled" && healthChecks[0].value === true,
    marketApp: healthChecks[1].status === "fulfilled" && healthChecks[1].value === true,
    buyerApp: healthChecks[2].status === "fulfilled" && healthChecks[2].value === true,
  };
}

/**
 * Check if all apps are healthy
 */
export async function areAllAppsHealthy(): Promise<boolean> {
  const health = await checkAllAppsHealth();
  return health.adminApp && health.marketApp && health.buyerApp;
}

/**
 * Get a summary of app health statuses
 */
export async function getHealthSummary(): Promise<{
  healthy: number;
  unhealthy: number;
  total: number;
  details: HealthCheckResult;
}> {
  const details = await checkAllAppsHealth();
  const healthyCount = [details.adminApp, details.marketApp, details.buyerApp].filter(Boolean).length;
  
  return {
    healthy: healthyCount,
    unhealthy: 3 - healthyCount,
    total: 3,
    details,
  };
}
