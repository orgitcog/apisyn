# Packages

This repository uses npm workspaces to manage multiple packages. The `packages/` directory contains reusable packages that can be used across different Shopify Partner applications.

## Available Packages

### @shopify-marketplace/partner-app-utils

**Location:** `packages/partner-app-utils/`

A comprehensive utilities package for building Shopify Partner marketplace applications. This package provides:

- **API Clients**: Pre-built clients for Admin, Market, and Buyer applications
- **Configuration Management**: Environment-based configuration utilities
- **Health Monitoring**: Tools to monitor the status of sub-applications
- **TypeScript Support**: Full type definitions and IntelliSense support
- **Mock Data**: Built-in fallbacks for development and testing
- **Retry Logic**: Automatic retry mechanisms for failed requests

#### Installation

This package is part of the workspace and is automatically available to other packages in the monorepo:

```json
{
  "dependencies": {
    "@shopify-marketplace/partner-app-utils": "*"
  }
}
```

#### Usage

```typescript
import { 
  createAdminAppApi,
  createMarketAppApi,
  createBuyerAppApi,
  checkAllAppsHealth 
} from "@shopify-marketplace/partner-app-utils";

// Create API clients
const adminApi = createAdminAppApi();
const marketApi = createMarketAppApi();
const buyerApi = createBuyerAppApi();

// Fetch data
const organizations = await adminApi.getOrganizations();
const vendors = await marketApi.getVendors();
const buyers = await buyerApi.getBuyers();

// Check health
const health = await checkAllAppsHealth();
```

#### Documentation

- [README.md](./packages/partner-app-utils/README.md) - Complete package documentation
- [USAGE.md](./packages/partner-app-utils/USAGE.md) - Practical usage examples
- [CHANGELOG.md](./packages/partner-app-utils/CHANGELOG.md) - Version history

## Package Management

### Building Packages

To build all packages:

```bash
npm run build:package
```

To build the main app (which includes building packages):

```bash
npm run build
```

### Adding a New Package

1. Create a new directory in `packages/`:
   ```bash
   mkdir packages/my-new-package
   cd packages/my-new-package
   ```

2. Initialize the package with scoped naming:
   ```bash
   npm init --scope=@shopify-marketplace
   ```
   
   Or manually create `package.json` with the proper scope:
   ```json
   {
     "name": "@shopify-marketplace/my-new-package",
     "version": "1.0.0",
     "description": "Description of your package"
   }
   ```

3. Add the package to the root workspace (already configured in root `package.json`):
   ```json
   {
     "workspaces": {
       "packages": [
         "extensions/*",
         "packages/*"
       ]
     }
   }
   ```

4. Install dependencies from root:
   ```bash
   cd ../..
   npm install
   ```

### Using Packages in the Main App

Packages in the workspace are automatically linked. To use a package:

1. Add it to `package.json` dependencies:
   ```json
   {
     "dependencies": {
       "@your-scope/package-name": "*"
     }
   }
   ```

2. Import and use:
   ```typescript
   import { feature } from "@your-scope/package-name";
   ```

## Workspace Structure

```
shopify-marketplace-remix-app/
├── app/                          # Main Remix application
├── apps/                         # Sub-applications
│   ├── admin-app/               # Admin application
│   ├── market-app/              # Market application
│   └── buyer-app/               # Buyer application
├── packages/                     # Reusable packages
│   └── partner-app-utils/       # Partner app utilities
├── extensions/                   # Shopify app extensions
├── package.json                 # Root workspace config
└── PACKAGES.md                  # This file
```

## Benefits of Monorepo Approach

1. **Code Reusability**: Share common utilities across applications
2. **Type Safety**: Shared TypeScript types ensure consistency
3. **Simplified Dependencies**: Managed centrally in the workspace
4. **Atomic Changes**: Update package and consumers in same commit
5. **Easier Testing**: Test packages alongside their consumers
6. **Better Documentation**: Package docs live with the code

## Publishing Packages

To publish a package to npm:

1. Navigate to the package directory:
   ```bash
   cd packages/partner-app-utils
   ```

2. Build the package:
   ```bash
   npm run build
   ```

3. Login to npm (if not already logged in):
   ```bash
   npm login
   ```

4. Publish:
   ```bash
   npm publish --access public
   ```

Note: Make sure to update the version in `package.json` before publishing.

## Best Practices

1. **Version Management**: Use semantic versioning for all packages
2. **Documentation**: Keep README and USAGE docs up to date
3. **TypeScript**: Use TypeScript for better type safety
4. **Testing**: Add tests for critical functionality
5. **Dependencies**: Keep peer dependencies minimal
6. **Exports**: Use proper ES module exports
7. **Build Output**: Exclude build artifacts from git (use .gitignore)

## Troubleshooting

### Package not found after installation

Run from the root directory:
```bash
npm install
```

### Build issues

Clean and rebuild:
```bash
cd packages/partner-app-utils
npm run clean
npm run build
```

### Type errors in IDE

Restart TypeScript server or reload your IDE.

## Contributing

When contributing packages:

1. Follow the existing package structure
2. Include comprehensive documentation
3. Add TypeScript types for all public APIs
4. Include usage examples
5. Update CHANGELOG.md for new versions
6. Test integration with main app before committing

## Support

For package-specific issues, refer to the individual package documentation in their respective directories.
