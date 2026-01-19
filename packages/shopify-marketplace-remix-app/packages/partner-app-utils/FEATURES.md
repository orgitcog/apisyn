# @shopify-marketplace/partner-app-utils - Features Overview

## 🎯 Purpose

This package provides a comprehensive set of utilities for building Shopify Partner marketplace applications. It abstracts common patterns for managing multiple sub-applications (admin, market, buyer) with unified API clients, health monitoring, and configuration management.

## ✨ Key Features

### 1. API Clients

Pre-built, production-ready API clients for all sub-applications:

#### Admin App API
- `getOrganizations()` - Fetch all marketplace organizations
- `getOrganization(id)` - Get specific organization details
- `getVendorApplications()` - List pending vendor applications
- `approveVendor(id)` - Approve a vendor application
- `rejectVendor(id, reason)` - Reject a vendor with reason
- `createOrganization(data)` - Create new organization

#### Market App API
- `getVendors()` - Fetch all marketplace vendors
- `getVendor(id)` - Get specific vendor details
- `getProducts()` - List all products
- `getProduct(id)` - Get specific product details
- `approveProduct(id)` - Approve a product listing
- `rejectProduct(id, reason)` - Reject a product with reason
- `getVendorAnalytics(id)` - Get vendor performance metrics

#### Buyer App API
- `getBuyers()` - Fetch all buyers
- `getBuyer(id)` - Get specific buyer details
- `getOrders()` - List all orders
- `getOrder(id)` - Get specific order details
- `getBuyerOrders(buyerId)` - Get orders for specific buyer
- `updateOrderStatus(orderId, status)` - Update order status
- `getBuyerAnalytics(buyerId)` - Get buyer analytics

### 2. Configuration Management

Smart configuration system that adapts to your environment:

```typescript
// Automatic development/production detection
const config = getAppConfig();
// Development: Uses localhost URLs
// Production: Uses environment variables

// Configuration validation
const { valid, errors } = validateConfig();
if (!valid) {
  console.error('Configuration issues:', errors);
}
```

**Features:**
- Environment-based URL configuration
- Automatic localhost fallback for development
- Production environment validation
- Custom port configuration
- Multi-app coordination

### 3. Health Monitoring

Real-time health checking for all sub-applications:

```typescript
// Check all apps
const health = await checkAllAppsHealth();
// Returns: { adminApp: true, marketApp: false, buyerApp: true }

// Simple boolean check
const allHealthy = await areAllAppsHealthy();

// Detailed summary
const summary = await getHealthSummary();
// Returns: { healthy: 2, unhealthy: 1, total: 3, details: {...} }
```

**Features:**
- Parallel health checks for performance
- Individual app status tracking
- Aggregate health summary
- Non-blocking (async) checks
- Automatic timeout handling

### 4. Automatic Retry Logic

Built-in retry mechanism for resilient API calls:

```typescript
const data = await makeAppRequest(url, {
  timeout: 5000,      // Request timeout in ms
  retries: 3,         // Number of retry attempts
  retryDelay: 1000,   // Delay between retries in ms
});
```

**Features:**
- Configurable retry attempts
- Exponential backoff support
- Per-request timeout configuration
- Graceful degradation
- Error logging for debugging

### 5. Mock Data Fallbacks

Automatic fallback to realistic mock data when services are unavailable:

**Mock Data Includes:**
- 3 sample organizations with various statuses
- 2 vendor applications (pending approval)
- 2 vendors with sales data
- 3 products across vendors
- 2 buyers with order history
- 3 sample orders with different statuses

**Benefits:**
- Develop without running all services
- Consistent demo data for presentations
- Testing in CI/CD environments
- Realistic data structures
- Zero configuration needed

### 6. TypeScript Support

Comprehensive type definitions for all entities and APIs:

**Exported Types:**
- `Organization` - Marketplace organization entity
- `Vendor` - Vendor entity with sales data
- `Product` - Product listing entity
- `Buyer` - Buyer/customer entity
- `Order` - Order entity
- `VendorApplication` - Vendor application entity
- `HealthCheckResult` - Health status result
- `MultiAppConfig` - Application configuration
- `RequestOptions` - API request options
- `ApiErrorResponse` - Error response structure

**Benefits:**
- IntelliSense in VS Code and IDEs
- Compile-time type checking
- Better documentation
- Reduced runtime errors
- Easier refactoring

### 7. ES Module Format

Modern JavaScript output for optimal bundling:

**Features:**
- Native ES module exports
- Tree-shaking support
- Fast bundling with Vite/Rollup/Webpack
- No CommonJS overhead
- Modern syntax (ES2020)

### 8. Error Handling

Comprehensive error handling throughout:

**Features:**
- Try-catch wrapping
- Null return on failure (not throws)
- Detailed error logging
- HTTP status code handling
- Network timeout handling
- Graceful degradation to mock data

### 9. Developer Experience

Built with developers in mind:

**Features:**
- Clear, consistent API design
- Comprehensive documentation (30KB+)
- Practical usage examples
- Inline JSDoc comments
- Minimal configuration required
- Works out-of-the-box

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Main Application                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │  @shopify-marketplace/partner-app-utils       │   │
│  │                                                │   │
│  │  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ Admin API    │  │ Market API   │          │   │
│  │  │              │  │              │          │   │
│  │  │ • getOrgs    │  │ • getVendors │          │   │
│  │  │ • approveVen │  │ • getProducts│          │   │
│  │  └──────┬───────┘  └──────┬───────┘          │   │
│  │         │                  │                   │   │
│  │  ┌──────▼──────────────────▼───┐              │   │
│  │  │    API Client Layer         │              │   │
│  │  │  • Retry Logic              │              │   │
│  │  │  • Timeout Handling         │              │   │
│  │  │  • Error Handling           │              │   │
│  │  └──────┬──────────────────────┘              │   │
│  │         │                                      │   │
│  │  ┌──────▼──────────────────────┐              │   │
│  │  │   Health Monitoring         │              │   │
│  │  │   Mock Data Fallbacks       │              │   │
│  │  └─────────────────────────────┘              │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────┬──┘
                    │                                 │
         ┌──────────▼────────┐         ┌─────────────▼────────┐
         │  Admin App        │         │  Market App          │
         │  (Port 3001)      │         │  (Port 3002)         │
         └───────────────────┘         └──────────────────────┘
                    │
         ┌──────────▼────────┐
         │  Buyer App        │
         │  (Port 3003)      │
         └───────────────────┘
```

## 📊 Performance

- **Build Time:** ~500ms (TypeScript compilation)
- **Bundle Size:** ~100KB (minified)
- **Zero Runtime Dependencies**
- **Tree-Shakeable:** Import only what you need
- **Async Operations:** Non-blocking API calls
- **Parallel Requests:** Multiple APIs simultaneously

## 🔐 Security

- **No Secret Storage:** Delegates to sub-apps
- **HMAC Ready:** Compatible with Shopify's security
- **Environment Variables:** Secure configuration
- **No Direct Database Access:** API-based only
- **Request Validation:** Type-safe requests

## 🎨 Use Cases

### 1. Dashboard Aggregation
Combine data from all sub-apps in a unified dashboard.

### 2. Admin Management
Centralized administration across all marketplace components.

### 3. Health Monitoring
Monitor the status and availability of all services.

### 4. Cross-App Analytics
Aggregate analytics from admin, market, and buyer portals.

### 5. Development & Testing
Develop with mock data without running all services.

### 6. CI/CD Integration
Test applications without external dependencies.

## 🚀 Getting Started

```bash
# Install
npm install @shopify-marketplace/partner-app-utils

# Import
import { createAdminAppApi } from "@shopify-marketplace/partner-app-utils";

# Use
const adminApi = createAdminAppApi();
const orgs = await adminApi.getOrganizations();
```

## 📚 Resources

- [README.md](./README.md) - Complete documentation
- [USAGE.md](./USAGE.md) - Practical examples
- [CHANGELOG.md](./CHANGELOG.md) - Version history

## 🤝 Contributing

This package is part of the Shopify marketplace monorepo. Contributions should:
- Follow existing code patterns
- Include TypeScript types
- Add documentation for new features
- Include usage examples
- Update CHANGELOG.md

## 📄 License

MIT
