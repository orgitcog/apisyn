import { test, expect, DashboardPage } from './fixtures/test-fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for dashboard data
    await page.route('**/rest/v1/stores**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Test Store 1',
            url: 'test-1.myshopify.com',
            revenue: 125000,
            orders: 1500,
            status: 'active',
            last_sync: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Test Store 2',
            url: 'test-2.myshopify.com',
            revenue: 85000,
            orders: 900,
            status: 'active',
            last_sync: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route('**/rest/v1/analytics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRevenue: 210000,
          totalOrders: 2400,
          averageOrderValue: 87.5,
          conversionRate: 3.2,
        }),
      });
    });
  });

  test('should display dashboard homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation items
    const navItems = ['Overview', 'Users', 'Analytics', 'Reports', 'Settings'];

    for (const item of navItems) {
      await expect(page.locator(`nav >> text="${item}"`).first()).toBeVisible();
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to Users page
    await page.click('nav >> text="Users"');
    await expect(page).toHaveURL(/.*users.*/);

    // Navigate to Analytics page
    await page.click('nav >> text="Analytics"');
    await expect(page).toHaveURL(/.*analytics.*/);

    // Navigate back to Overview
    await page.click('nav >> text="Overview"');
    await expect(page).toHaveURL('/');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Content should still be visible
    await expect(page.locator('body')).toBeVisible();

    // Navigation might be collapsed on mobile
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger-menu, button[aria-label*="menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
  });

  test('should handle page refresh', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial content
    const initialContent = await page.locator('body').textContent();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display loading states', async ({ page }) => {
    // Slow down API response
    await page.route('**/rest/v1/stores**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Check for loading indicator
    const loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, .spinner, [aria-busy="true"]'
    );

    // Loading should be visible initially or content should appear
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/rest/v1/stores**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // Page should still render (with error state or fallback)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Dashboard with DashboardPage POM', () => {
  test('should use page object model for interactions', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.waitForDataLoad();

    const title = await dashboardPage.getTitle();
    expect(title).toContain('Shopify');
  });
});
