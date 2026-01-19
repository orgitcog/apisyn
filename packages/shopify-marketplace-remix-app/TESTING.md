# Testing & CI/CD Documentation

This document describes the comprehensive testing and CI/CD infrastructure for the Shopify Marketplace Remix App.

## Overview

The project includes:
- **Unit Tests** for all packages using Vitest
- **Integration Tests** for API endpoints using Jest (Admin App)
- **E2E Tests** framework using Playwright (expandable)
- **Comprehensive CI/CD** with GitHub Actions
- **Build Artifacts** for all apps and packages
- **Docker Support** for containerized deployments

## Project Structure

```
shopify-marketplace-remix-app/
├── app/                          # Main Remix app
│   ├── test/                     # Test setup files
│   └── utils/*.test.ts           # Unit tests
├── packages/
│   └── partner-app-utils/        # Shared utilities package
│       └── src/*.test.ts         # Unit tests
├── apps/
│   ├── admin-app/                # Express + GraphQL admin app
│   │   └── server/tests/         # Jest integration tests
│   ├── market-app/               # Market management app
│   └── buyer-app/                # Next.js buyer frontend
├── e2e/                          # Playwright E2E tests
└── .github/workflows/            # CI/CD workflows
```

## Running Tests Locally

### Install Dependencies

```bash
npm install
```

### Unit Tests

#### Main App Tests
```bash
# Run once
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

#### Partner Utils Package Tests
```bash
# Run from root
npm run test:package

# Or from package directory
cd packages/partner-app-utils
npm test
```

#### Admin App Tests
```bash
# Run from root
npm run test:admin-app

# Or from app directory
cd apps/admin-app
npm test
```

#### All Unit Tests
```bash
npm run test:all
```

### E2E Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

**Note:** E2E tests are currently skipped by default. Remove `.skip()` from test definitions when you have a proper test environment set up.

## Building for Production

### Build All Packages

```bash
# Build everything
npm run build

# Build just the shared package
npm run build:package
```

### Individual App Builds

#### Main App
```bash
npm run build
```

#### Admin App
```bash
cd apps/admin-app
npm run build
```

#### Market App
```bash
cd apps/market-app
npm run build
```

#### Buyer App
```bash
cd apps/buyer-app
npm run build
```

### Docker Build

```bash
docker build -t shopify-marketplace-app .
docker run -p 3000:3000 shopify-marketplace-app
```

## CI/CD Pipeline

### Workflow: `comprehensive-ci.yml`

The CI/CD pipeline runs on:
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Pipeline Jobs

#### 1. Lint
- Runs ESLint on all apps and packages
- Matrix: Node.js 20 & 22
- Fast feedback on code quality

#### 2. Build
- Builds all apps and packages
- Matrix: Node.js 20 & 22
- Uploads build artifacts:
  - Main app build
  - Admin app build
  - Market app build
  - Buyer app build
  - Partner utils package dist

#### 3. Unit Tests
- Runs all unit tests
- Matrix: Node.js 20 & 22
- Uploads coverage reports
- Tests:
  - Main app (Vitest)
  - Partner utils package (Vitest)
  - Admin app (Jest)

#### 4. E2E Tests
- Placeholder for Playwright E2E tests
- Matrix: Node.js 20 & 22
- Runs after successful build
- Currently prints placeholder message

#### 5. Docker Build
- Only on push to `main` or `develop`
- Requires all tests to pass
- Builds and exports Docker image
- Uploads Docker image artifact

#### 6. Release Summary
- Runs after all jobs complete
- Generates summary report
- Shows status of all pipeline stages

## Test Coverage

### Current Coverage

- **Main App**: Basic utility function tests
- **Partner Utils Package**: Config and API client tests
- **Admin App**: GraphQL resolver tests

### Coverage Reports

After running tests with coverage:

```bash
# Main app
npm run test:coverage
open coverage/index.html

# Partner utils
cd packages/partner-app-utils
npm run test:coverage
open coverage/index.html
```

## Environment Variables for Testing

### Main App & Partner Utils
```bash
NODE_ENV=test
SHOPIFY_API_KEY=test-api-key
SHOPIFY_API_SECRET=test-api-secret
SCOPES=read_products,write_products
```

### Database (for integration tests)
```bash
DATABASE_URL=file:./test.db
```

## Adding New Tests

### Adding Unit Tests

1. Create a test file next to the code: `myModule.test.ts`
2. Import from vitest: `import { describe, it, expect } from 'vitest'`
3. Write your tests:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

4. Run: `npm test`

### Adding E2E Tests

1. Create a spec file in `e2e/`: `myFeature.spec.ts`
2. Import from Playwright: `import { test, expect } from '@playwright/test'`
3. Write your tests:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    await expect(page.locator('h1')).toContainText('Expected Title');
  });
});
```

4. Remove `.skip()` when ready to run
5. Run: `npm run test:e2e`

## Best Practices

### Unit Tests
- Test pure functions and business logic
- Mock external dependencies
- Aim for >80% coverage on critical paths
- Keep tests fast (<100ms per test)

### Integration Tests
- Test API endpoints and resolvers
- Use test databases
- Clean up after tests
- Test error cases

### E2E Tests
- Test critical user journeys
- Use data-testid attributes
- Keep tests independent
- Use page object models for complex flows

## Troubleshooting

### Tests Failing Locally

1. Clean and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Check environment variables are set

3. Rebuild packages:
```bash
npm run build:package
```

### CI/CD Failures

1. Check the job logs in GitHub Actions
2. Look for specific error messages
3. Verify dependencies are correctly specified
4. Check if environment variables are needed

### Playwright Issues

If Playwright browsers aren't installed:
```bash
npx playwright install
```

## Future Enhancements

### Planned Additions

- [ ] Expand E2E test coverage
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing (a11y)
- [ ] Add API contract testing
- [ ] Implement test data factories
- [ ] Add mutation testing
- [ ] Integrate SonarQube for code quality
- [ ] Add security scanning (Snyk, Dependabot)
- [ ] Implement canary deployments

### Test Categories to Add

1. **Component Tests**: Test React components in isolation
2. **API Tests**: Test REST/GraphQL APIs independently
3. **Database Tests**: Test Prisma models and migrations
4. **Performance Tests**: Load testing with k6 or Artillery
5. **Security Tests**: OWASP ZAP, security headers
6. **Accessibility Tests**: axe-core integration

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Shopify App Testing Guide](https://shopify.dev/docs/apps/tools/cli/testing)

## Support

For questions or issues:
1. Check the documentation above
2. Review existing tests for examples
3. Check CI/CD logs for specific errors
4. Consult team members or create an issue
