# @shopify-marketplace/partner-app-utils

Utilities and common patterns for building Shopify Partner marketplace applications. This package provides a unified interface for managing multiple marketplace sub-applications (admin, market, and buyer portals) with built-in health checking, API clients, and mock data fallbacks.

## Features

- 🔧 **Configuration Management** - Environment-based configuration for multi-app setups
- 🌐 **API Clients** - Ready-to-use clients for Admin, Market, and Buyer apps
- 🔄 **Retry Logic** - Automatic retry with exponential backoff for failed requests
- ❤️ **Health Checking** - Monitor the status of all sub-applications
- 🎭 **Mock Data** - Built-in mock data for development and testing
- 📘 **TypeScript** - Full TypeScript support with comprehensive types
- 🔌 **Extensible** - Easy to extend and customize for your needs

## Installation

```bash
npm install @shopify-marketplace/partner-app-utils
```

## Quick Start

### Basic Usage

```typescript
import { 
  createAdminAppApi, 
  createMarketAppApi, 
  createBuyerAppApi,
  checkAllAppsHealth 
} from '@shopify-marketplace/partner-app-utils';

// Create API clients
const adminApi = createAdminAppApi();
const marketApi = createMarketAppApi();
const buyerApi = createBuyerAppApi();

// Fetch data from different apps
const organizations = await adminApi.getOrganizations();
const vendors = await marketApi.getVendors();
const buyers = await buyerApi.getBuyers();

// Check health of all apps
const health = await checkAllAppsHealth();
console.log('Admin app healthy:', health.adminApp);
console.log('Market app healthy:', health.marketApp);
console.log('Buyer app healthy:', health.buyerApp);
```

## Configuration

### Environment Variables

Set these environment variables in production:

```bash
ADMIN_APP_URL=https://admin.example.com
MARKET_APP_URL=https://market.example.com
BUYER_APP_URL=https://buyer.example.com
```

In development, the package automatically uses `localhost` URLs:
- Admin App: `http://localhost:3001`
- Market App: `http://localhost:3002`
- Buyer App: `http://localhost:3003`

### Validate Configuration

```typescript
import { validateConfig } from '@shopify-marketplace/partner-app-utils';

const { valid, errors } = validateConfig();
if (!valid) {
  console.error('Configuration errors:', errors);
}
```

## API Clients

### Admin App API

```typescript
import { createAdminAppApi } from '@shopify-marketplace/partner-app-utils';

const adminApi = createAdminAppApi();

// Get all organizations
const orgs = await adminApi.getOrganizations();

// Get specific organization
const org = await adminApi.getOrganization('org-123');

// Get vendor applications
const applications = await adminApi.getVendorApplications();

// Approve vendor
await adminApi.approveVendor('vendor-123');

// Reject vendor with reason
await adminApi.rejectVendor('vendor-123', 'Incomplete documentation');

// Create organization
const newOrg = await adminApi.createOrganization({
  name: 'New Marketplace',
  status: 'active',
});
```

### Market App API

```typescript
import { createMarketAppApi } from '@shopify-marketplace/partner-app-utils';

const marketApi = createMarketAppApi();

// Get all vendors
const vendors = await marketApi.getVendors();

// Get specific vendor
const vendor = await marketApi.getVendor('vendor-123');

// Get all products
const products = await marketApi.getProducts();

// Approve product
await marketApi.approveProduct('product-123');

// Reject product with reason
await marketApi.rejectProduct('product-123', 'Quality standards not met');

// Get vendor analytics
const analytics = await marketApi.getVendorAnalytics('vendor-123');
```

### Buyer App API

```typescript
import { createBuyerAppApi } from '@shopify-marketplace/partner-app-utils';

const buyerApi = createBuyerAppApi();

// Get all buyers
const buyers = await buyerApi.getBuyers();

// Get specific buyer
const buyer = await buyerApi.getBuyer('buyer-123');

// Get all orders
const orders = await buyerApi.getOrders();

// Get orders for specific buyer
const buyerOrders = await buyerApi.getBuyerOrders('buyer-123');

// Update order status
await buyerApi.updateOrderStatus('order-123', 'shipped');

// Get buyer analytics
const analytics = await buyerApi.getBuyerAnalytics('buyer-123');
```

## Health Checking

### Check All Apps

```typescript
import { checkAllAppsHealth, areAllAppsHealthy, getHealthSummary } from '@shopify-marketplace/partner-app-utils';

// Get detailed health status
const health = await checkAllAppsHealth();
// Returns: { adminApp: true, marketApp: false, buyerApp: true }

// Simple boolean check
const allHealthy = await areAllAppsHealthy();
// Returns: false (because marketApp is down)

// Get summary with counts
const summary = await getHealthSummary();
// Returns: { healthy: 2, unhealthy: 1, total: 3, details: {...} }
```

## Custom API Requests

For custom endpoints not covered by the API clients:

```typescript
import { makeAppRequest, postAppRequest } from '@shopify-marketplace/partner-app-utils';

// GET request
const data = await makeAppRequest('https://api.example.com/custom', {
  timeout: 5000,
  retries: 2,
  retryDelay: 1000,
});

// POST request
const result = await postAppRequest('https://api.example.com/custom', {
  key: 'value'
}, {
  timeout: 5000,
});
```

## Mock Data

When sub-applications are unavailable, the package automatically falls back to mock data. This is useful for:

- Development without running all services
- Testing in CI/CD environments
- Demonstrating functionality without infrastructure

The mock data includes realistic sample data for:
- Organizations
- Vendor applications
- Vendors and products
- Buyers and orders

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import type { 
  Organization, 
  Vendor, 
  Product, 
  Buyer, 
  Order,
  HealthCheckResult 
} from '@shopify-marketplace/partner-app-utils';

const org: Organization = {
  id: '1',
  name: 'Acme Inc',
  status: 'active',
  vendorCount: 10,
  productCount: 100,
  monthlyRevenue: '$10,000',
};
```

## Integration with Remix

### Loader Example

```typescript
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { createAdminAppApi, createMarketAppApi } from '@shopify-marketplace/partner-app-utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const adminApi = createAdminAppApi();
  const marketApi = createMarketAppApi();

  const [organizations, vendors] = await Promise.all([
    adminApi.getOrganizations(),
    marketApi.getVendors(),
  ]);

  return json({ organizations, vendors });
}
```

### Action Example

```typescript
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { createAdminAppApi } from '@shopify-marketplace/partner-app-utils';

export async function action({ request }: ActionFunctionArgs) {
  const adminApi = createAdminAppApi();
  const formData = await request.formData();
  const vendorId = formData.get('vendorId') as string;

  const result = await adminApi.approveVendor(vendorId);

  return json(result);
}
```

## Error Handling

The package handles errors gracefully:

- Failed requests automatically retry with exponential backoff
- After all retries fail, returns `null` or mock data
- Logs errors to console for debugging
- Timeouts prevent hanging requests

## Best Practices

1. **Environment Variables**: Always set proper URLs in production
2. **Error Handling**: Check for `null` returns from API methods
3. **Health Checks**: Monitor app health regularly in production
4. **Caching**: Consider caching responses for better performance
5. **Retry Configuration**: Adjust retry settings based on your needs

## Examples

### Complete Remix Route

```typescript
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { 
  createAdminAppApi, 
  createMarketAppApi,
  getHealthSummary 
} from '@shopify-marketplace/partner-app-utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const adminApi = createAdminAppApi();
  const marketApi = createMarketAppApi();

  const [organizations, vendors, healthSummary] = await Promise.all([
    adminApi.getOrganizations(),
    marketApi.getVendors(),
    getHealthSummary(),
  ]);

  return json({ 
    organizations, 
    vendors, 
    health: healthSummary 
  });
}

export default function Dashboard() {
  const { organizations, vendors, health } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Marketplace Dashboard</h1>
      <p>Apps Status: {health.healthy}/{health.total} healthy</p>
      <h2>Organizations ({organizations.length})</h2>
      <h2>Vendors ({vendors.length})</h2>
    </div>
  );
}
```

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
