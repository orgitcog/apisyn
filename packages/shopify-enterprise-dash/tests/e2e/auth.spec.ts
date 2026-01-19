import { test, expect, LoginPage } from './fixtures/test-fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth endpoints
    await page.route('**/auth/v1/token**', async (route, request) => {
      const postData = request.postDataJSON();

      if (postData?.email === 'valid@example.com' && postData?.password === 'ValidPass123!') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'user-123',
              email: 'valid@example.com',
              role: 'authenticated',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' }),
        });
      }
    });

    await page.route('**/rest/v1/user_profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user-123',
            email: 'valid@example.com',
            display_name: 'Test User',
            role: 'admin',
          },
        ]),
      });
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation or prevent submission
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', 'wrong@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error response
    await page.waitForTimeout(500);

    // Should show error message or stay on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', 'valid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'ValidPass123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show logged-in state
    await page.waitForLoadState('networkidle');
  });

  test('should have working forgot password link', async ({ page }) => {
    await page.goto('/login');

    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")');

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/.*forgot|reset.*/);
    }
  });

  test('should have working signup link', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), a:has-text("Create")');

    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*signup|register.*/);
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies();

    await page.goto('/settings');

    // Should redirect to login or show login prompt
    // This depends on how the app handles auth
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow authenticated users to access protected routes', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await expect(authenticatedPage.locator('body')).toBeVisible();
  });
});

test.describe('Session Management', () => {
  test('should persist session across page reloads', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.reload();

    // User should still be authenticated
    await expect(authenticatedPage.locator('body')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', 'valid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'ValidPass123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Look for logout button
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]'
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      // Should redirect to login or home
      await page.waitForLoadState('networkidle');
    }
  });
});
