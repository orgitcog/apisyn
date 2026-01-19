# Changelog

All notable changes to `@shopify-marketplace/partner-app-utils` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-18

### Added

- Initial release of `@shopify-marketplace/partner-app-utils`
- Core configuration utilities (`getAppConfig`, `validateConfig`)
- Generic API client with retry logic and timeouts
- Admin App API client with organization and vendor management
- Market App API client with vendor and product management
- Buyer App API client with buyer and order management
- Health checking utilities for monitoring sub-applications
- Comprehensive TypeScript type definitions
- Mock data fallbacks for development and testing
- ES Module output for modern JavaScript environments
- Full documentation and usage examples

### Features

#### Configuration Management
- Environment-based configuration for dev/prod
- Validation of required environment variables
- Support for custom app URLs

#### API Clients
- `AdminAppApi` - Organization and vendor application management
- `MarketAppApi` - Vendor and product management
- `BuyerAppApi` - Buyer and order management
- Generic request utilities (`makeAppRequest`, `postAppRequest`, etc.)
- Automatic retry with configurable attempts and delays
- Request timeout support
- Built-in error handling

#### Health Monitoring
- `checkAllAppsHealth()` - Check status of all sub-apps
- `areAllAppsHealthy()` - Simple boolean health check
- `getHealthSummary()` - Detailed health statistics

#### Developer Experience
- Full TypeScript support with exported types
- Mock data for development without running services
- Comprehensive documentation and examples
- ES Module format for optimal bundler support

### TypeScript Types
- `Organization` - Organization entity type
- `Vendor` - Vendor entity type
- `Product` - Product entity type
- `Buyer` - Buyer entity type
- `Order` - Order entity type
- `VendorApplication` - Vendor application type
- `HealthCheckResult` - Health check result type
- `MultiAppConfig` - Multi-app configuration type
- `RequestOptions` - API request options type

### Documentation
- Comprehensive README with installation and usage guides
- USAGE.md with practical Remix integration examples
- Inline JSDoc comments for all public APIs
- TypeScript type definitions for IntelliSense support

[1.0.0]: https://github.com/rzonedevops/shopify-marketplace-remix-app/releases/tag/v1.0.0
