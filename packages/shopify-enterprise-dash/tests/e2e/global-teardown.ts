import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🎭 Starting Playwright global teardown...');

  // Add any global cleanup here, such as:
  // - Cleaning up test database
  // - Removing test users
  // - Clearing test data
  // - Resetting application state

  console.log('🎭 Global teardown complete');
}

export default globalTeardown;
