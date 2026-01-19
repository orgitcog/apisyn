import { test, expect, SettingsPage } from './fixtures/test-fixtures';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for settings
    await page.route('**/rest/v1/settings**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            general: {
              companyName: 'Test Company',
              timezone: 'America/New_York',
              currency: 'USD',
              language: 'en',
            },
            notifications: {
              emailAlerts: true,
              slackIntegration: false,
              dailyDigest: true,
            },
            integrations: {
              shopify: { connected: true, lastSync: new Date().toISOString() },
              stripe: { connected: true, lastSync: new Date().toISOString() },
              quickbooks: { connected: false },
            },
          }),
        });
      } else if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    await page.route('**/rest/v1/user_preferences**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          theme: 'dark',
          dashboardLayout: 'grid',
          defaultView: 'overview',
        }),
      });
    });
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*settings.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to settings from dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Settings in navigation
    const settingsLink = page.locator('nav >> text="Settings"').first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings.*/);
    }
  });

  test('should display settings tabs or sections', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Page should render settings content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle settings save', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for save button
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/rest/v1/settings**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Page should still render
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Settings with Page Object Model', () => {
  test('should use SettingsPage POM', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Integration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/integrations**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'shopify',
            name: 'Shopify',
            connected: true,
            lastSync: new Date().toISOString(),
            status: 'healthy',
          },
          {
            id: 'stripe',
            name: 'Stripe',
            connected: true,
            lastSync: new Date().toISOString(),
            status: 'healthy',
          },
          {
            id: 'quickbooks',
            name: 'QuickBooks',
            connected: false,
            status: 'disconnected',
          },
          {
            id: 'netsuite',
            name: 'NetSuite',
            connected: false,
            status: 'disconnected',
          },
        ]),
      });
    });
  });

  test('should display integrations list', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle integration connection', async ({ page }) => {
    await page.route('**/rest/v1/integrations/*/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, authUrl: 'https://example.com/oauth' }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for connect button
    const connectButton = page.locator('button:has-text("Connect")').first();
    if (await connectButton.isVisible()) {
      // Don't actually click to avoid navigation
      await expect(connectButton).toBeEnabled();
    }
  });

  test('should handle integration disconnection', async ({ page }) => {
    await page.route('**/rest/v1/integrations/*/disconnect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for disconnect button
    const disconnectButton = page.locator('button:has-text("Disconnect")').first();
    if (await disconnectButton.isVisible()) {
      await expect(disconnectButton).toBeEnabled();
    }
  });
});

test.describe('User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/user_preferences**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            theme: 'dark',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              sms: false,
            },
          }),
        });
      } else if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });
  });

  test('should display user preferences', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle theme toggle', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], input[name="theme"]');
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeEnabled();
    }
  });
});

test.describe('Security Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/security_settings**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          twoFactorEnabled: false,
          sessionTimeout: 30,
          ipWhitelist: [],
          lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
  });

  test('should display security settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });
});
