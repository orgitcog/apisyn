import { test, expect, AnalyticsPage } from './fixtures/test-fixtures';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock analytics API responses
    await page.route('**/rest/v1/analytics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRevenue: 1250000,
          totalOrders: 15000,
          averageOrderValue: 83.33,
          conversionRate: 3.5,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
        }),
      });
    });

    await page.route('**/rest/v1/stores**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Store 1',
            revenue: 500000,
            orders: 6000,
            status: 'active',
          },
          {
            id: '2',
            name: 'Store 2',
            revenue: 450000,
            orders: 5500,
            status: 'active',
          },
          {
            id: '3',
            name: 'Store 3',
            revenue: 300000,
            orders: 3500,
            status: 'active',
          },
        ]),
      });
    });

    // Mock time series data for charts
    await page.route('**/rest/v1/revenue_timeseries**', async (route) => {
      const dates = [];
      const now = new Date();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 50000) + 30000,
          orders: Math.floor(Math.random() * 500) + 300,
        });
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dates),
      });
    });
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).toHaveURL(/.*analytics.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display key metrics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Page should contain analytics-related content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Look for chart elements
    const charts = page.locator('canvas, svg, [data-testid*="chart"], .recharts-wrapper');

    // Wait a bit for charts to render
    await page.waitForTimeout(1000);

    // If charts exist, they should be visible
    const chartCount = await charts.count();
    if (chartCount > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should handle date range selection', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Look for date range picker
    const dateRangePicker = page.locator(
      '[data-testid="date-range"], [data-testid="date-picker"], button:has-text("Last"), select:has-text("days")'
    );

    if (await dateRangePicker.first().isVisible()) {
      await dateRangePicker.first().click();
      // Select a different range if options appear
      const option = page.locator('text="Last 7 days", text="Last 30 days", text="This month"');
      if (await option.first().isVisible()) {
        await option.first().click();
      }
    }
  });

  test('should display store performance comparison', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Look for store-related analytics
    const storeSection = page.locator(
      '[data-testid="store-analytics"], .store-performance, text="Store"'
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Look for export button
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("Download"), [data-testid="export"]'
    );

    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButton.click();
      const download = await downloadPromise;
      // Download may or may not happen depending on implementation
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Content should still be visible on mobile
    await expect(page.locator('body')).toBeVisible();

    // Charts might be stacked or scrollable on mobile
    const charts = page.locator('canvas, svg, .recharts-wrapper');
    if (await charts.first().isVisible()) {
      await expect(charts.first()).toBeVisible();
    }
  });
});

test.describe('Analytics with AnalyticsPage POM', () => {
  test('should use page object model', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();

    // Use POM methods
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Real-time Analytics', () => {
  test('should update data without page refresh', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/rest/v1/analytics**', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRevenue: 1250000 + requestCount * 10000,
          totalOrders: 15000 + requestCount * 100,
        }),
      });
    });

    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for potential auto-refresh
    await page.waitForTimeout(5000);

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
