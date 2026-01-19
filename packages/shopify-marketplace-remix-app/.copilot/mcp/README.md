# Shopify Marketplace Remix App - MCP Configuration

This directory contains a comprehensive Model Context Protocol (MCP) configuration for optimal coding agent assistance in the Shopify marketplace monorepo.

## Configuration Files

### Primary Configuration
- **`copilot-config.json`** - Main configuration with repository structure, applications, and development workflows
- **`tools-config.json`** - Tool-specific configurations and commands
- **`patterns.json`** - Shopify and Remix patterns and best practices
- **`quick-reference.json`** - Quick reference guide for common tasks
- **`troubleshooting.json`** - Comprehensive troubleshooting guide for common issues
- **`index.json`** - Configuration index and metadata

### Documentation
- **`README.md`** - This overview and usage guide

### Legacy Configuration
- **`import-apps.json`** - One-time configuration for importing external apps (historical reference)

## Repository Structure

This is a monorepo containing multiple Shopify marketplace applications:

```
/                          # Main Remix app (TypeScript, Vite)
├── apps/
│   ├── market-app/        # Customer marketplace app (Remix)
│   ├── admin-app/         # Legacy admin app (React, Webpack)
│   └── buyer-app/         # Buyer app (Next.js)
├── extensions/            # Shopify app extensions
└── prisma/               # Database schema and migrations
```

## Tech Stack Overview

- **Primary**: Remix + TypeScript + Shopify APIs
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **UI**: Shopify Polaris design system
- **Build**: Vite (main), Webpack (admin), Next.js (buyer)
- **GraphQL**: Code generation with Shopify Admin API

## Usage for Coding Agents

When working with this repository, agents should:

1. **Identify the target application** based on the task requirements
2. **Use appropriate tech stack patterns** for the specific app
3. **Follow Shopify integration patterns** for API calls and UI
4. **Respect monorepo boundaries** and avoid cross-app dependencies
5. **Use proper development workflows** for building and testing

## Key Commands

```bash
# Development
npm run dev                    # Start main app
cd apps/{app} && npm run dev   # Start specific app

# Building
npm run build                  # Build main app
npm run setup                  # Initialize Prisma

# Quality
npm run lint                   # Lint code
npm run graphql-codegen       # Generate GraphQL types

# Shopify
shopify app dev               # Development with tunneling
shopify app deploy            # Deploy to Shopify
```

## Common Patterns

### Remix (Main & Market App)
- File-based routing in `app/routes/`
- Server-side data loading with `loader` functions
- Form handling with `action` functions
- Type-safe Shopify API integration

### Shopify Integration
- Authentication via `authenticate.admin(request)`
- GraphQL API calls with generated types
- App Bridge for embedded app functionality
- Polaris components for consistent UI

### Database
- Prisma schema in `prisma/schema.prisma`
- Type-safe database operations
- Migration-based schema changes

## Best Practices

1. **Type Safety**: Use generated GraphQL types and Prisma client
2. **Error Handling**: Implement proper error boundaries and API error handling
3. **Performance**: Respect Shopify API rate limits and implement caching
4. **Security**: Use proper authentication and input validation
5. **Testing**: Write tests for critical business logic and API integrations

## Troubleshooting

- **Build Issues**: Check Vite version conflicts in package.json
- **Type Errors**: Run GraphQL codegen and Prisma generate
- **Auth Issues**: Verify Shopify credentials and scopes
- **Dev Server**: Ensure proper environment variables are set

For detailed information, refer to the individual configuration files in this directory.