# CLAUDE.md - Claude Code Project Instructions

This file provides guidance for Claude Code when working with this repository.

## Project Overview

This is a **Shopify Marketplace Remix App** - a multi-tenant marketplace platform built on Shopify's ecosystem. The system consists of multiple integrated applications:

- **Main App** (Remix): Primary marketplace application at the root
- **Market App** (`apps/market-app/`): Vendor marketplace management
- **Admin App** (`apps/admin-app/`): Legacy Express.js admin application
- **Buyer App** (`apps/buyer-app/`): Next.js customer-facing frontend
- **Partner App Utils** (`packages/partner-app-utils/`): Shared utilities package

## Repository Structure

```
shopify-marketplace-remix-app/
├── app/                      # Main Remix application routes & components
│   ├── routes/               # Remix routes (app.*.tsx pattern)
│   └── utils/                # Utility functions (e.g., app-integration.ts)
├── apps/                     # Sub-applications
│   ├── admin-app/            # Express.js + React admin (Port 3001)
│   ├── market-app/           # Remix marketplace (Port 3002)
│   └── buyer-app/            # Next.js buyer portal (Port 3003)
├── docs/                     # Architecture & specification docs
│   ├── architecture/         # System design documentation
│   └── *.zpp                 # Z++ formal specifications
├── extensions/               # Shopify theme app extensions
├── packages/                 # Shared NPM packages
│   └── partner-app-utils/    # @shopify-marketplace/partner-app-utils
├── prisma/                   # Prisma schema and migrations
├── public/                   # Static assets
└── .github/agents/           # RegimA-Org AI agent personas
```

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Build all packages and app
npm run build

# Build just the shared package
npm run build:package

# Development server (uses Shopify CLI)
npm run dev

# Linting
npm run lint

# Database setup (Prisma)
npm run setup

# Deploy to Shopify
npm run deploy
```

## Key Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Remix | 2.16.1 |
| React | React | 19.1.1 |
| Build Tool | Vite | 7.1.3 |
| ORM | Prisma | 6.2.1 |
| UI Components | Shopify Polaris | 13.9.5 |
| TypeScript | TypeScript | 5.2.2 |
| Shopify Integration | @shopify/shopify-app-remix | 3.7.0 |

## Important Patterns

### Route Naming Convention
- Main app routes: `app/routes/app.*.tsx`
- Authentication: Uses `shopify.authenticate.admin(request)`
- GraphQL queries: Use the `admin.graphql()` function from Shopify authentication

### Shopify API Integration
```typescript
// Authentication pattern
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);
  const response = await admin.graphql(`{ query }`);
  return response.json();
}
```

### Cross-App Communication
- Use `app/utils/app-integration.ts` for cross-app API calls
- Fallback mock data is available when sub-apps are offline
- Health checks available via `checkAllAppsHealth()`

## Configuration Files

- `shopify.app.toml` - Shopify app configuration
- `shopify.web.toml` - Web configuration for Shopify CLI
- `prisma/schema.prisma` - Database schema
- `vite.config.ts` - Vite build configuration
- `.graphqlrc.ts` - GraphQL configuration

## Database

- **Development**: SQLite (default)
- **Production**: PostgreSQL (recommended)
- **Session Storage**: Prisma-based session storage
- **Metaobjects**: Shopify native storage for vendor/product metadata

## Testing Guidelines

- Main app uses Vite for testing
- Admin app uses Jest
- Prefer integration tests for Shopify API interactions
- Use mock data from `partner-app-utils` for development

## Coding Conventions

1. **TypeScript**: All new code should be TypeScript
2. **Polaris Components**: Use Shopify Polaris for UI components
3. **Error Handling**: Use Remix error boundaries for route-level errors
4. **GraphQL**: Use typed GraphQL queries with codegen
5. **Imports**: Use absolute imports with tsconfig paths

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/shopify.server.ts` | Shopify app configuration |
| `app/routes/app.tsx` | Main app layout and navigation |
| `app/utils/app-integration.ts` | Cross-app API integration |
| `packages/partner-app-utils/src/index.ts` | Shared utilities entry |
| `prisma/schema.prisma` | Database schema |

## Formal Specification

The project includes comprehensive Z++ formal specifications in `docs/`:
- `FORMAL_SPECIFICATION.zpp` - Main specification (850+ lines)
- `FORMAL_SPECIFICATION_GUIDE.md` - How to read the specs
- `Z++_NOTATION_REFERENCE.md` - Quick reference

## Agent Personas (RegimA-Org)

The `.github/agents/` directory contains AI agent personas for the RegimA-Org ecosystem:
- `cogprime.md` - Integrative AGI agent
- `hypercog.md` - Meta-cognitive intelligence agent
- `siliconsage.md` - Wisdom-seeking AGI
- `vervaeke.md` - Meaning crisis scholar
- See `ORGIMA.md` for full ecosystem documentation

## Common Tasks

### Adding a New Route
1. Create file in `app/routes/app.new-route.tsx`
2. Use `NavMenu` from `@shopify/app-bridge-react` for navigation
3. Add authentication via `shopify.authenticate.admin(request)`

### Working with Metaobjects
- Vendors and products use Shopify Metaobjects
- Query via GraphQL Admin API
- See `docs/architecture/` for data flow

### Adding to Shared Package
1. Add code to `packages/partner-app-utils/src/`
2. Export from `packages/partner-app-utils/src/index.ts`
3. Run `npm run build:package`
4. Import with `@shopify-marketplace/partner-app-utils`

## Environment Variables

Required environment variables (set by Shopify CLI during dev):
- `SHOPIFY_API_KEY` - App API key
- `SHOPIFY_API_SECRET` - App secret
- `SCOPES` - OAuth scopes
- `HOST` - App host URL

## Troubleshooting

- **Database errors**: Run `npm run setup` to regenerate Prisma client
- **Type errors after changes**: Restart TypeScript server
- **Build issues**: Clear `node_modules/.cache` and rebuild
- **Shopify CLI issues**: Run `shopify app config link` to reconnect

## Security Considerations

- Never commit `.env` files
- Use HMAC validation for webhooks
- Validate all user input before Shopify API calls
- Use Prisma parameterized queries to prevent SQL injection
