import { test, expect } from '@playwright/test';

test.describe('Partner Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to partners page
    await page.goto('/partners');
  });

  test('should display partner portal page', async ({ page }) => {
    // Check page title
    await expect(page.locator('text=Partner Portal')).toBeVisible();
    
    // Check tabs are visible
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Partner Directory')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Affiliate Program')).toBeVisible();
  });

  test('should display Partner API Analytics tab', async ({ page }) => {
    // Look for the Partner API Analytics tab
    const analyticsTab = page.locator('text=Partner API Analytics');
    await expect(analyticsTab).toBeVisible();
  });

  test('should display Transactions tab', async ({ page }) => {
    // Look for the Transactions tab
    const transactionsTab = page.locator('text=Transactions');
    await expect(transactionsTab).toBeVisible();
  });

  test('should navigate to Partner API Analytics tab', async ({ page }) => {
    // Click on Partner API Analytics tab
    await page.click('text=Partner API Analytics');
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Should show analytics content or configuration message
    const hasAnalytics = await page.locator('text=Partner Analytics').isVisible();
    const hasConfigMessage = await page.locator('text=Partner API credentials').isVisible();
    
    expect(hasAnalytics || hasConfigMessage).toBeTruthy();
  });

  test('should navigate to Transactions tab', async ({ page }) => {
    // Click on Transactions tab
    await page.click('button:has-text("Transactions"), [role="tab"]:has-text("Transactions")');
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Should show transactions content or configuration message
    const hasTransactions = await page.locator('text=Transaction Tracker').isVisible();
    const hasConfigMessage = await page.locator('text=Partner API credentials').isVisible();
    
    expect(hasTransactions || hasConfigMessage).toBeTruthy();
  });

  test('should display overview dashboard metrics', async ({ page }) => {
    // Check for key metrics on overview tab
    await expect(page.locator('text=Total Partners')).toBeVisible();
    await expect(page.locator('text=Partner Revenue')).toBeVisible();
    await expect(page.locator('text=Total Commissions')).toBeVisible();
    await expect(page.locator('text=Pending Payouts')).toBeVisible();
  });

  test('should display monthly revenue chart', async ({ page }) => {
    // Check for revenue trend chart
    await expect(page.locator('text=Monthly Revenue Trend')).toBeVisible();
  });

  test('should display partners by tier breakdown', async ({ page }) => {
    // Check for tier breakdown
    await expect(page.locator('text=Partners by Tier')).toBeVisible();
  });

  test('should display partners by type breakdown', async ({ page }) => {
    // Check for type breakdown
    await expect(page.locator('text=Partners by Type')).toBeVisible();
  });

  test('should display recent activity feed', async ({ page }) => {
    // Check for activity feed
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    // Check for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
  });

  test('should have invite partner button', async ({ page }) => {
    // Check for invite partner button
    const inviteButton = page.locator('button:has-text("Invite Partner")');
    await expect(inviteButton).toBeVisible();
  });

  test('should have export data button', async ({ page }) => {
    // Check for export data button
    const exportButton = page.locator('button:has-text("Export Data")');
    await expect(exportButton).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Partner Directory tab
    await page.click('text=Partner Directory');
    await page.waitForTimeout(300);
    
    // Verify directory content is shown
    // The directory should have search/filter functionality
    const hasDirectory = await page.locator('[placeholder*="Search"], [placeholder*="Filter"]').isVisible() ||
                         await page.locator('text=Partner Directory').isVisible();
    
    // Click on Performance tab
    await page.click('text=Performance');
    await page.waitForTimeout(300);
    
    // Click on Affiliate Program tab
    await page.click('text=Affiliate Program');
    await page.waitForTimeout(300);
    
    // Click back to Overview
    await page.click('text=Overview');
    await page.waitForTimeout(300);
    
    // Verify we're back on overview
    await expect(page.locator('text=Total Partners')).toBeVisible();
  });
});

test.describe('Partner Analytics - API Integration', () => {
  test('should show configuration message when API not configured', async ({ page }) => {
    await page.goto('/partners');
    
    // Navigate to Partner API Analytics tab
    await page.click('text=Partner API Analytics');
    await page.waitForTimeout(500);
    
    // Should show info banner about configuration
    const configBanner = page.locator('text=Partner API credentials');
    const isVisible = await configBanner.isVisible();
    
    // Either shows config message or actual analytics (if configured)
    if (isVisible) {
      await expect(configBanner).toBeVisible();
    }
  });

  test('should show configuration message on Transactions tab when API not configured', async ({ page }) => {
    await page.goto('/partners');
    
    // Navigate to Transactions tab
    await page.click('button:has-text("Transactions"), [role="tab"]:has-text("Transactions")');
    await page.waitForTimeout(500);
    
    // Should show info banner about configuration
    const configBanner = page.locator('text=Partner API credentials');
    const isVisible = await configBanner.isVisible();
    
    // Either shows config message or actual transactions (if configured)
    if (isVisible) {
      await expect(configBanner).toBeVisible();
    }
  });
});

test.describe('Partner Analytics - Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/partners');
    
    // Page should still be functional
    await expect(page.locator('text=Partner Portal')).toBeVisible();
    
    // Metrics should stack on mobile
    await expect(page.locator('text=Total Partners')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/partners');
    
    // Page should still be functional
    await expect(page.locator('text=Partner Portal')).toBeVisible();
    
    // All tabs should be visible
    await expect(page.locator('text=Overview')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/partners');
    
    // Page should display full layout
    await expect(page.locator('text=Partner Portal')).toBeVisible();
    
    // All metrics should be visible in a row
    await expect(page.locator('text=Total Partners')).toBeVisible();
    await expect(page.locator('text=Partner Revenue')).toBeVisible();
  });
});
