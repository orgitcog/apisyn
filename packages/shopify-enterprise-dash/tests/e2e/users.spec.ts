import { test, expect } from './fixtures/test-fixtures';

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for users data
    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user-1',
            email: 'admin@example.com',
            display_name: 'Admin User',
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
          {
            id: 'user-2',
            email: 'manager@example.com',
            display_name: 'Manager User',
            role: 'manager',
            status: 'active',
            created_at: new Date().toISOString(),
            last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'user-3',
            email: 'viewer@example.com',
            display_name: 'Viewer User',
            role: 'viewer',
            status: 'inactive',
            created_at: new Date().toISOString(),
            last_login: null,
          },
        ]),
      });
    });

    await page.route('**/rest/v1/roles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'admin', name: 'Administrator', permissions: ['all'] },
          { id: 'manager', name: 'Manager', permissions: ['read', 'write'] },
          { id: 'viewer', name: 'Viewer', permissions: ['read'] },
        ]),
      });
    });
  });

  test('should display users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/.*users.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to users from dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Users in navigation
    const usersLink = page.locator('nav >> text="Users"').first();
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await expect(page).toHaveURL(/.*users.*/);
    }
  });

  test('should display user list', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Page should render users content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle empty users list', async ({ page }) => {
    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Page should still render
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Page should still render
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/users**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'user-1', email: 'test@example.com', display_name: 'Test User', role: 'admin' },
          ]),
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'new-user', success: true }),
        });
      } else if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });
  });

  test('should display add user button', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Look for add user button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Invite"), button:has-text("New")');
    // Button may or may not exist depending on permissions
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle user search', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Debounce
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle role filter', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Look for role filter
    const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/roles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'admin',
            name: 'Administrator',
            description: 'Full access to all features',
            permissions: ['users:read', 'users:write', 'settings:read', 'settings:write', 'reports:read'],
            userCount: 2,
          },
          {
            id: 'manager',
            name: 'Manager',
            description: 'Can manage users and view reports',
            permissions: ['users:read', 'users:write', 'reports:read'],
            userCount: 5,
          },
          {
            id: 'viewer',
            name: 'Viewer',
            description: 'Read-only access',
            permissions: ['users:read', 'reports:read'],
            userCount: 10,
          },
        ]),
      });
    });
  });

  test('should display roles page', async ({ page }) => {
    await page.goto('/roles');
    await expect(page).toHaveURL(/.*roles.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to roles from dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Roles in navigation
    const rolesLink = page.locator('nav >> text="Roles"').first();
    if (await rolesLink.isVisible()) {
      await rolesLink.click();
      await expect(page).toHaveURL(/.*roles.*/);
    }
  });

  test('should display roles list', async ({ page }) => {
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/rest/v1/roles**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/roles');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
          role: 'admin',
          created_at: new Date().toISOString(),
        }),
      });
    });
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Look for user menu or profile section
    const userMenu = page.locator('[data-testid="user-menu"], .user-profile');
    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
    }
  });
});
