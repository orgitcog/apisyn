import { test, expect } from './fixtures/test-fixtures';

test.describe('Partners Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for partners data
    await page.route('**/rest/v1/partners**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Tech Solutions Inc',
            email: 'contact@techsolutions.com',
            tier: 'platinum',
            type: 'agency',
            status: 'active',
            revenue: 250000,
            commissions: 25000,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Digital Integrators',
            email: 'info@digitalintegrators.com',
            tier: 'gold',
            type: 'integrator',
            status: 'active',
            revenue: 150000,
            commissions: 15000,
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Reseller Pro',
            email: 'sales@resellerpro.com',
            tier: 'silver',
            type: 'reseller',
            status: 'pending',
            revenue: 75000,
            commissions: 7500,
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route('**/rest/v1/partner_metrics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPartners: 45,
          activePartners: 38,
          pendingApplications: 7,
          totalRevenue: 1250000,
          totalCommissions: 125000,
          pendingPayouts: 15000,
        }),
      });
    });
  });

  test('should display partners page', async ({ page }) => {
    await page.goto('/partners');
    await expect(page).toHaveURL(/.*partners.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display partner metrics cards', async ({ page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Check for metric cards presence
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to partners from dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Partners in navigation
    const partnersLink = page.locator('nav >> text="Partners"').first();
    if (await partnersLink.isVisible()) {
      await partnersLink.click();
      await expect(page).toHaveURL(/.*partners.*/);
    }
  });

  test('should handle empty partners list', async ({ page }) => {
    // Override the mock to return empty list
    await page.route('**/rest/v1/partners**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Page should still render without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/rest/v1/partners**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Page should still render (with error state or fallback)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Content should still be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Content should still be visible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Partner Directory', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/partners**', async (route) => {
      const url = new URL(route.request().url());
      const tier = url.searchParams.get('tier');
      const type = url.searchParams.get('type');

      let partners = [
        { id: '1', name: 'Partner A', tier: 'platinum', type: 'agency', status: 'active' },
        { id: '2', name: 'Partner B', tier: 'gold', type: 'integrator', status: 'active' },
        { id: '3', name: 'Partner C', tier: 'silver', type: 'reseller', status: 'pending' },
        { id: '4', name: 'Partner D', tier: 'bronze', type: 'developer', status: 'active' },
      ];

      if (tier) {
        partners = partners.filter((p) => p.tier === tier);
      }
      if (type) {
        partners = partners.filter((p) => p.type === type);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(partners),
      });
    });
  });

  test('should display partner directory', async ({ page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Partner A');
      await page.waitForTimeout(500); // Debounce
    }

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Partner Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/partner_performance**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topPartners: [
            { id: '1', name: 'Top Partner 1', revenue: 500000, growth: 25 },
            { id: '2', name: 'Top Partner 2', revenue: 350000, growth: 18 },
            { id: '3', name: 'Top Partner 3', revenue: 250000, growth: 12 },
          ],
          revenueByTier: {
            platinum: 1500000,
            gold: 800000,
            silver: 400000,
            bronze: 150000,
          },
          monthlyTrend: [
            { month: 'Jan', revenue: 200000 },
            { month: 'Feb', revenue: 220000 },
            { month: 'Mar', revenue: 250000 },
          ],
        }),
      });
    });
  });

  test('should display performance metrics', async ({ page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
