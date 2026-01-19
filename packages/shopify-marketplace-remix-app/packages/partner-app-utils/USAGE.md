# Usage Examples

This document provides practical examples of using `@shopify-marketplace/partner-app-utils` in your Shopify Partner app.

## Installation

If you're using this package in a monorepo:

```bash
# In your root package.json, add to workspaces
{
  "workspaces": {
    "packages": [
      "packages/*"
    ]
  }
}

# Add as a dependency
npm install @shopify-marketplace/partner-app-utils
```

For external use (when published to npm):

```bash
npm install @shopify-marketplace/partner-app-utils
```

## Basic Setup

### Environment Configuration

Create a `.env` file with your app URLs:

```env
# Development (defaults to localhost)
NODE_ENV=development

# Production
ADMIN_APP_URL=https://admin.yourmarketplace.com
MARKET_APP_URL=https://market.yourmarketplace.com
BUYER_APP_URL=https://buyer.yourmarketplace.com
```

## Remix Integration Examples

### Example 1: Dashboard Loader

```typescript
// app/routes/app.dashboard.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  createAdminAppApi, 
  createMarketAppApi,
  getHealthSummary 
} from "@shopify-marketplace/partner-app-utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const adminApi = createAdminAppApi();
  const marketApi = createMarketAppApi();

  // Fetch data in parallel
  const [organizations, vendors, products, health] = await Promise.all([
    adminApi.getOrganizations(),
    marketApi.getVendors(),
    marketApi.getProducts(),
    getHealthSummary(),
  ]);

  return json({ 
    organizations, 
    vendors, 
    products,
    health 
  });
}

export default function Dashboard() {
  const { organizations, vendors, products, health } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Marketplace Dashboard</h1>
      
      <div>
        <h2>System Health</h2>
        <p>{health.healthy}/{health.total} apps healthy</p>
      </div>

      <div>
        <h2>Organizations: {organizations.length}</h2>
        {organizations.map(org => (
          <div key={org.id}>
            <h3>{org.name}</h3>
            <p>Status: {org.status}</p>
            <p>Vendors: {org.vendorCount}</p>
            <p>Revenue: {org.monthlyRevenue}</p>
          </div>
        ))}
      </div>

      <div>
        <h2>Vendors: {vendors.length}</h2>
        {/* Vendor list */}
      </div>
    </div>
  );
}
```

### Example 2: Vendor Approval Action

```typescript
// app/routes/app.vendors.approve.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createAdminAppApi } from "@shopify-marketplace/partner-app-utils";

export async function action({ request }: ActionFunctionArgs) {
  const adminApi = createAdminAppApi();
  const formData = await request.formData();
  const vendorId = formData.get("vendorId") as string;

  try {
    const result = await adminApi.approveVendor(vendorId);
    
    return json({ 
      success: true, 
      message: "Vendor approved successfully" 
    });
  } catch (error) {
    return json({ 
      success: false, 
      error: "Failed to approve vendor" 
    }, { status: 500 });
  }
}
```

### Example 3: Product Management

```typescript
// app/routes/app.products.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { createMarketAppApi } from "@shopify-marketplace/partner-app-utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const marketApi = createMarketAppApi();
  const products = await marketApi.getProducts();
  
  return json({ products });
}

export async function action({ request }: ActionFunctionArgs) {
  const marketApi = createMarketAppApi();
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const productId = formData.get("productId") as string;

  if (action === "approve") {
    await marketApi.approveProduct(productId);
    return json({ success: true });
  } else if (action === "reject") {
    const reason = formData.get("reason") as string;
    await marketApi.rejectProduct(productId, reason);
    return json({ success: true });
  }

  return json({ success: false }, { status: 400 });
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>Vendor: {product.vendor}</p>
          <p>Price: {product.price}</p>
          <p>Status: {product.status}</p>
          
          {product.status === "pending" && (
            <fetcher.Form method="post">
              <input type="hidden" name="productId" value={product.id} />
              <button name="action" value="approve">Approve</button>
              <button name="action" value="reject">Reject</button>
            </fetcher.Form>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Health Monitoring

```typescript
// app/routes/app.health.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  checkAllAppsHealth, 
  getHealthSummary 
} from "@shopify-marketplace/partner-app-utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const [health, summary] = await Promise.all([
    checkAllAppsHealth(),
    getHealthSummary(),
  ]);

  return json({ health, summary });
}

export default function HealthMonitor() {
  const { health, summary } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>System Health</h1>
      
      <div>
        <h2>Overview</h2>
        <p>Healthy: {summary.healthy}/{summary.total}</p>
        <p>Unhealthy: {summary.unhealthy}/{summary.total}</p>
      </div>

      <div>
        <h2>Services</h2>
        <div>
          <strong>Admin App:</strong> 
          {health.adminApp ? "✅ Healthy" : "❌ Unhealthy"}
        </div>
        <div>
          <strong>Market App:</strong> 
          {health.marketApp ? "✅ Healthy" : "❌ Unhealthy"}
        </div>
        <div>
          <strong>Buyer App:</strong> 
          {health.buyerApp ? "✅ Healthy" : "❌ Unhealthy"}
        </div>
      </div>
    </div>
  );
}
```

### Example 5: Buyer and Order Management

```typescript
// app/routes/app.buyers.$buyerId.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBuyerAppApi } from "@shopify-marketplace/partner-app-utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const buyerApi = createBuyerAppApi();
  const buyerId = params.buyerId!;

  const [buyer, orders, analytics] = await Promise.all([
    buyerApi.getBuyer(buyerId),
    buyerApi.getBuyerOrders(buyerId),
    buyerApi.getBuyerAnalytics(buyerId),
  ]);

  return json({ buyer, orders, analytics });
}

export default function BuyerDetail() {
  const { buyer, orders, analytics } = useLoaderData<typeof loader>();

  if (!buyer) {
    return <div>Buyer not found</div>;
  }

  return (
    <div>
      <h1>{buyer.name}</h1>
      <p>Email: {buyer.email}</p>
      <p>Company: {buyer.company}</p>
      <p>Status: {buyer.status}</p>

      <h2>Analytics</h2>
      <p>Total Spent: {analytics.totalSpent}</p>
      <p>Total Orders: {analytics.totalOrders}</p>
      <p>Average Order: {analytics.averageOrderValue}</p>

      <h2>Recent Orders</h2>
      {orders.map(order => (
        <div key={order.id}>
          <p>Order #{order.id}</p>
          <p>Amount: {order.amount}</p>
          <p>Status: {order.status}</p>
          <p>Date: {order.orderDate}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Custom API Requests

For endpoints not covered by the API clients:

```typescript
import { makeAppRequest, postAppRequest } from "@shopify-marketplace/partner-app-utils";

// GET request with custom options
const customData = await makeAppRequest("https://api.example.com/custom", {
  timeout: 10000,     // 10 second timeout
  retries: 3,         // Retry 3 times
  retryDelay: 2000,   // Wait 2 seconds between retries
  headers: {
    "Authorization": "Bearer token",
  }
});

// POST request
const result = await postAppRequest("https://api.example.com/create", {
  name: "New Item",
  value: "123",
}, {
  timeout: 5000,
  retries: 2,
});
```

## TypeScript Types

The package exports comprehensive TypeScript types:

```typescript
import type {
  Organization,
  Vendor,
  Product,
  Buyer,
  Order,
  VendorApplication,
  HealthCheckResult,
  MultiAppConfig,
  RequestOptions,
} from "@shopify-marketplace/partner-app-utils";

// Use in your own functions
function processOrganization(org: Organization) {
  console.log(org.name, org.vendorCount);
}

// Define custom API responses
interface CustomApiResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
  };
}
```

## Error Handling

The package handles errors gracefully with automatic retries and fallback to mock data:

```typescript
import { createAdminAppApi } from "@shopify-marketplace/partner-app-utils";

const adminApi = createAdminAppApi();

// If the API is unavailable, you'll get mock data instead
const orgs = await adminApi.getOrganizations();
// Returns mock organizations if service is down

// Always check for null on custom requests
const customData = await makeAppRequest("https://api.example.com/data");
if (customData === null) {
  console.log("Service unavailable, using default data");
  // Handle the error case
}
```

## Best Practices

1. **Parallel Requests**: Use `Promise.all()` for independent requests
2. **Error Handling**: Always handle null returns from API calls
3. **Health Monitoring**: Check app health before critical operations
4. **Type Safety**: Use TypeScript types for better development experience
5. **Configuration**: Set proper environment variables in production
6. **Caching**: Consider caching frequently accessed data

## Advanced Usage

### Custom API Client Configuration

```typescript
import { getAppConfig, validateConfig } from "@shopify-marketplace/partner-app-utils";

// Get current configuration
const config = getAppConfig();
console.log("Admin app URL:", config.adminApp.baseUrl);

// Validate configuration in production
const { valid, errors } = validateConfig();
if (!valid) {
  console.error("Configuration errors:", errors);
  // Handle configuration issues
}
```

### Combining Multiple API Calls

```typescript
import { 
  createAdminAppApi,
  createMarketAppApi,
  createBuyerAppApi 
} from "@shopify-marketplace/partner-app-utils";

async function getDashboardData() {
  const [adminApi, marketApi, buyerApi] = [
    createAdminAppApi(),
    createMarketAppApi(),
    createBuyerAppApi(),
  ];

  // Fetch everything in parallel
  const [orgs, vendors, products, buyers, orders] = await Promise.all([
    adminApi.getOrganizations(),
    marketApi.getVendors(),
    marketApi.getProducts(),
    buyerApi.getBuyers(),
    buyerApi.getOrders(),
  ]);

  return { orgs, vendors, products, buyers, orders };
}
```

## Testing

The package includes mock data that's automatically used when services are unavailable, making it easy to develop and test without running all services:

```typescript
// In development, you can work without running sub-apps
// The package will return realistic mock data

const adminApi = createAdminAppApi();
const orgs = await adminApi.getOrganizations();
// Returns mock organizations if admin-app is not running
```

## Support

For more information, see the [README.md](./README.md) file.
