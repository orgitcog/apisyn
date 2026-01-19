# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

Shopify Enterprise Dashboard - A multi-store management platform built with React, Remix, Shopify Polaris, and Supabase. The application provides centralized control for multiple Shopify stores with analytics, user management, role-based access control, and integrations with accounting systems.

## Tech Stack

- **Framework**: Remix 2.x with React 18 (v3 future flags enabled)
- **Language**: TypeScript (strict mode)
- **UI**: Shopify Polaris v12 (BlockStack, InlineStack components)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **State Management**: Zustand + TanStack Query v5
- **Charts**: Recharts + Chart.js
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: Yarn 4.x (via Corepack, use `yarn`, not `npm`)

## Project Structure

```
app/                    # Main Remix application (primary codebase)
├── components/         # UI components
│   ├── Analytics/      # Analytics visualizations
│   ├── Dashboard/      # Dashboard widgets
│   ├── GnuCash/        # GnuCash integration components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   └── Partners/       # Partner management components
├── lib/               # API clients (shopify.ts, supabase.ts)
├── routes/            # Remix routes
│   ├── _index.tsx     # Home/Dashboard
│   ├── analytics.tsx  # Analytics page
│   ├── integrations.gnucash.tsx  # GnuCash integration
│   ├── partners.tsx   # Partner management
│   ├── reports.tsx    # Reports
│   ├── roles.tsx      # Role management
│   ├── settings.tsx   # Settings
│   └── users.tsx      # User management
├── styles/            # Tailwind CSS
└── root.tsx           # Root layout with providers

src/                   # Legacy/secondary source (hooks, contexts, pages)
├── components/        # Additional components
├── context/           # React contexts (AuthContext, TestModeContext)
├── hooks/             # Custom hooks (useShopifyData, useOpenAI, etc.)
├── lib/               # Utility libraries
├── pages/             # Legacy page components
└── store/             # Zustand stores

tests/
├── unit/              # Vitest unit tests
├── e2e/               # Playwright E2E tests
├── mocks/             # MSW handlers
├── utils/             # Test utilities
└── setup.ts           # Test setup file

supabase/              # Database migrations
scripts/               # Build scripts (prevent-npm.js)
.github/workflows/     # CI/CD (ci.yml, release.yml, codeql.yml)
```

## Common Commands

```bash
# Development
yarn dev               # Start Remix dev server
yarn build             # Production build
yarn build:production  # Production build with NODE_ENV=production
yarn start             # Start production server

# Testing
yarn test              # Run unit tests (Vitest)
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
yarn test:ui           # Vitest UI
yarn test:e2e          # Run E2E tests (Playwright)
yarn test:e2e:ui       # Playwright UI mode
yarn test:e2e:headed   # Playwright headed mode
yarn test:all          # Run both unit and E2E tests

# Code Quality
yarn typecheck         # TypeScript type checking
yarn lint              # ESLint (max 50 warnings allowed)
yarn lint:fix          # Auto-fix lint issues
yarn format            # Prettier formatting
yarn format:check      # Check formatting

# Release
yarn release           # Semantic release
yarn clean             # Remove dist, build, node_modules
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Use explicit types for function parameters and return values
- Prefix unused variables with underscore (`_unused`)
- Avoid `any` - use specific types or `unknown`

### React/Remix
- Use Shopify Polaris components (BlockStack, InlineStack, Card, Page, etc.)
- Data fetching via TanStack Query hooks
- Routes follow Remix conventions (`_index.tsx` for index routes)
- Path aliases: `~` for `app/`, `@` for `src/`

### Testing
- Unit tests: `tests/unit/**/*.test.{ts,tsx}` or `src/**/*.test.{ts,tsx}`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Use test utilities from `tests/utils/test-utils.tsx`
- Mock external APIs using MSW handlers in `tests/mocks/`
- Coverage thresholds: lines: 2%, functions: 10%, branches: 20%

### ESLint Rules
- React Hooks rules enforced
- No unused variables (except `_` prefixed)
- `@typescript-eslint/no-explicit-any` is a warning (avoid when possible)
- Max 50 warnings allowed
- Test files have relaxed rules

## Environment Variables

Required variables (see `.env.example`):

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Shopify
VITE_SHOPIFY_API_KEY=your-shopify-api-key
VITE_SHOPIFY_API_SECRET=your-shopify-api-secret
VITE_SHOPIFY_SCOPES=read_products,read_orders,read_customers
VITE_SHOPIFY_ADMIN_API_URL=your-admin-api-url
VITE_SHOPIFY_ACCESS_TOKEN=your-access-token

# OpenAI (for AI features)
VITE_OPENAI_API_KEY=your-openai-api-key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# NetSuite Integration
NETSUITE_ACCOUNT_ID=your-account-id
NETSUITE_CONSUMER_KEY=your-consumer-key
NETSUITE_CONSUMER_SECRET=your-consumer-secret
NETSUITE_TOKEN_ID=your-token-id
NETSUITE_TOKEN_SECRET=your-token-secret

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID=your-client-id
QUICKBOOKS_CLIENT_SECRET=your-client-secret

# Feature Flags
VITE_TEST_MODE=false              # Enable mock data
VITE_ENABLE_AI_INSIGHTS=true      # AI analytics features
VITE_ENABLE_ANALYTICS=true        # Analytics dashboard
```

The app works with mock data if `VITE_TEST_MODE=true` or env vars are not configured.

## Key Integrations

- **Shopify Admin API**: Store management, products, orders, customers
- **Supabase**: Auth, database with RLS, realtime subscriptions
- **OpenAI/LangChain**: AI-powered analytics and insights
- **Stripe**: Payment processing
- **GnuCash**: Accounting integration
- **NetSuite**: ERP integration
- **QuickBooks**: Accounting integration

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- **ci.yml**: Lint, typecheck, test, build on PRs and pushes
- **release.yml**: Semantic versioning and releases
- **codeql.yml**: Security analysis
- **dependency-review.yml**: Dependency security checks

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build image directly
docker build -t shopify-dashboard .
docker run -p 3000:3000 shopify-dashboard
```

## Important Notes

1. **Package Manager**: Always use `yarn`, never `npm` (enforced by `prevent-npm.js`)
2. **Polaris Components**: Use Shopify Polaris v12 component patterns
3. **Database Security**: All tables use Row-Level Security (RLS)
4. **Dual Codebase**: Primary code in `app/`, legacy code in `src/` - prefer `app/` for new work
5. **Remix v3 Flags**: Future flags enabled for v3 migration readiness
6. **Test Mode**: Set `VITE_TEST_MODE=true` to use mock data during development

## Troubleshooting

- **Build failures**: Run `yarn typecheck` to check for type errors
- **Lint errors**: Run `yarn lint:fix` to auto-fix, or check max-warnings limit
- **Test failures**: Check `tests/setup.ts` for proper test configuration
- **Module errors**: Ensure `serverDependenciesToBundle` in `remix.config.js` includes needed packages
