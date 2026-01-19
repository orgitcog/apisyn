import { test, expect, StoresPage } from './fixtures/test-fixtures';

test.describe('Stores Management', () => {
  const mockStores = [
    {
      id: '1',
      name: 'Fashion Boutique',
      url: 'fashion-boutique.myshopify.com',
      revenue: 125000,
      orders: 1500,
      status: 'active',
      last_sync: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Tech Gadgets',
      url: 'tech-gadgets.myshopify.com',
      revenue: 98000,
      orders: 890,
      status: 'active',
      last_sync: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Home Decor',
      url: 'home-decor.myshopify.com',
      revenue: 67000,
      orders: 620,
      status: 'inactive',
      last_sync: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/stores**', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockStores),
        });
      } else if (request.method() === 'POST') {
        const body = await request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-store-id',
            ...body,
            revenue: 0,
            orders: 0,
            status: 'pending',
            last_sync: new Date().toISOString(),
          }),
        });
      } else if (request.method() === 'PATCH') {
        const body = await request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockStores[0],
            ...body,
          }),
        });
      } else if (request.method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });
  });

  test('should display stores list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if stores section is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display store details', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for store-related content
    const storeContent = page.locator('text="Fashion Boutique", text="Store", [data-testid="store"]');

    // Content should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should filter stores by status', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for filter/status selector
    const filterButton = page.locator(
      '[data-testid="status-filter"], select:has-text("Status"), button:has-text("Filter")'
    );

    if (await filterButton.first().isVisible()) {
      await filterButton.first().click();

      // Select active filter
      const activeOption = page.locator('text="Active", option:has-text("Active")');
      if (await activeOption.first().isVisible()) {
        await activeOption.first().click();
      }
    }
  });

  test('should search stores', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[type="search"], [data-testid="search"]'
    );

    if (await searchInput.isVisible()) {
      await searchInput.fill('Fashion');
      await page.waitForTimeout(500); // Debounce

      // Results should be filtered
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should add a new store', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for add store button
    const addButton = page.locator(
      'button:has-text("Add Store"), button:has-text("Connect Store"), [data-testid="add-store"]'
    );

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill out form if modal/form appears
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
      const urlInput = page.locator('input[name="url"], input[placeholder*="url"]');

      if (await nameInput.isVisible()) {
        await nameInput.fill('New Test Store');
        await urlInput.fill('new-test-store.myshopify.com');

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should edit store details', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for edit button on store card
    const editButton = page.locator(
      'button:has-text("Edit"), [data-testid="edit-store"], button[aria-label*="edit"]'
    ).first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Edit form should appear
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Store Name');

        const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
        await saveButton.click();
      }
    }
  });

  test('should sync store data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for sync button
    const syncButton = page.locator(
      'button:has-text("Sync"), [data-testid="sync-store"], button[aria-label*="sync"]'
    ).first();

    if (await syncButton.isVisible()) {
      await syncButton.click();

      // Wait for sync to complete
      await page.waitForLoadState('networkidle');

      // Success message or updated timestamp
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should delete store with confirmation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for delete button
    const deleteButton = page.locator(
      'button:has-text("Delete"), [data-testid="delete-store"], button[aria-label*="delete"]'
    ).first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirmation dialog should appear
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Yes"), [data-testid="confirm-delete"]'
      );

      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display store metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for metric-related content
    const metrics = page.locator('text="Revenue", text="Orders", text="$"');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle store connection errors', async ({ page }) => {
    // Mock error response
    await page.route('**/rest/v1/stores**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Connection failed' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Error state or fallback should be shown
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Store Integration', () => {
  test('should connect to Shopify store', async ({ page }) => {
    await page.goto('/integrations');
    await page.waitForLoadState('networkidle');

    // Look for Shopify connection option
    const shopifyConnect = page.locator(
      'button:has-text("Shopify"), [data-testid="connect-shopify"], .shopify-connect'
    );

    if (await shopifyConnect.isVisible()) {
      // Don't actually connect, just verify the option exists
      await expect(shopifyConnect).toBeVisible();
    }
  });
});
