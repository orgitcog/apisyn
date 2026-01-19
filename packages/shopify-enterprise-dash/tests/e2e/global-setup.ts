import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Starting Playwright global setup...');

  // You can add any global setup here, such as:
  // - Setting up test database
  // - Creating test users
  // - Seeding test data
  // - Authentication state storage

  const { baseURL } = config.projects[0].use;

  // Verify the dev server is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Try to connect to the dev server
    await page.goto(baseURL || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    console.log('✅ Dev server is running and accessible');
  } catch (error) {
    console.error('❌ Could not connect to dev server:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Store authentication state for reuse
  // This is useful for tests that require authenticated users
  // const storageState = 'tests/e2e/.auth/storage-state.json';

  console.log('🎭 Global setup complete');
}

export default globalSetup;
