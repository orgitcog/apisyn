import { test as base, expect, Page } from '@playwright/test';

// Extend the base test with custom fixtures
interface TestFixtures {
  // Authenticated page
  authenticatedPage: Page;
  // Test data helpers
  testData: {
    user: {
      email: string;
      password: string;
    };
    store: {
      name: string;
      url: string;
    };
  };
}

export const test = base.extend<TestFixtures>({
  // Mock authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication state
    await page.addInitScript(() => {
      // Mock localStorage auth state
      localStorage.setItem(
        'sb-auth-token',
        JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000,
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'admin',
          },
        })
      );
    });

    await use(page);
  },

  // Test data fixture
  testData: async ({}, use) => {
    const data = {
      user: {
        email: 'test@example.com',
        password: 'TestPassword123!',
      },
      store: {
        name: 'E2E Test Store',
        url: 'e2e-test-store.myshopify.com',
      },
    };

    await use(data);
  },
});

export { expect };

// Page Object Models for reusable interactions
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }

  async navigateTo(section: string) {
    await this.page.click(`nav >> text="${section}"`);
    await this.page.waitForLoadState('networkidle');
  }

  async getKPICard(title: string) {
    return this.page.locator(`[data-testid="kpi-card"]:has-text("${title}")`);
  }

  async waitForDataLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // Allow for any animations
  }
}

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async getErrorMessage() {
    return this.page.locator('.error-message, [role="alert"]').textContent();
  }

  async isLoggedIn() {
    // Check for dashboard elements or user menu
    return this.page.locator('[data-testid="user-menu"], .dashboard').isVisible();
  }
}

export class StoresPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/stores');
    await this.page.waitForLoadState('networkidle');
  }

  async getStoreCards() {
    return this.page.locator('[data-testid="store-card"]').all();
  }

  async getStoreByName(name: string) {
    return this.page.locator(`[data-testid="store-card"]:has-text("${name}")`);
  }

  async clickAddStore() {
    await this.page.click('button:has-text("Add Store")');
  }

  async fillStoreForm(name: string, url: string) {
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="url"]', url);
  }

  async submitStoreForm() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }
}

export class AnalyticsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/analytics');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForCharts() {
    await this.page.waitForSelector('canvas, [data-testid="chart"]', { timeout: 10000 });
  }

  async getMetricValue(metricName: string) {
    const metricCard = this.page.locator(`text="${metricName}"`).locator('..');
    return metricCard.locator('.metric-value, .value').textContent();
  }

  async selectDateRange(range: string) {
    await this.page.click('[data-testid="date-range-picker"]');
    await this.page.click(`text="${range}"`);
  }
}

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToTab(tabName: string) {
    await this.page.click(`[role="tab"]:has-text("${tabName}")`);
    await this.page.waitForLoadState('networkidle');
  }

  async updateSetting(settingName: string, value: string) {
    await this.page.fill(`input[name="${settingName}"]`, value);
  }

  async saveSettings() {
    await this.page.click('button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}
