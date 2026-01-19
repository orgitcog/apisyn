# Shopify Zone Test API — Capabilities Brief

**Store:** zone-teste.myshopify.com  
**Author:** Manus AI  
**Date:** January 19, 2026

---

## Executive Summary

The Shopify Zone Test API provides comprehensive programmatic access to the `zone-teste.myshopify.com` store, a South African-based development/partner test store operating in ZAR currency. The API credentials grant access to **154 distinct access scopes**, enabling full control over products, customers, orders, inventory, fulfillments, discounts, themes, and more. Both the **Admin REST API** and the **Storefront GraphQL API** are fully functional and have been successfully tested.

---

## Store Configuration

| Property | Value |
|----------|-------|
| **Store Name** | Zone-Testee |
| **Domain** | zone-teste.myshopify.com |
| **Email** | org@regima.zone |
| **Country** | South Africa |
| **Currency** | ZAR (South African Rand) |
| **Plan** | Developer Preview (Partner Test) |
| **Primary Location ID** | 75184308461 |
| **API Version** | 2024-01 |
| **Multi-location Enabled** | Yes |
| **Storefront Enabled** | Yes |

---

## API Authentication

The store provides four distinct credentials for different use cases:

| Credential | Purpose | Header |
|------------|---------|--------|
| **API Key** | App identification | N/A |
| **API Secret Key** | App authentication | N/A |
| **Admin API Access Token** | Server-side operations | `X-Shopify-Access-Token` |
| **Storefront API Access Token** | Client-side operations | `X-Shopify-Storefront-Access-Token` |

### Base URLs

- **Admin API:** `https://zone-teste.myshopify.com/admin/api/2024-01/`
- **Storefront API:** `https://zone-teste.myshopify.com/api/2024-01/graphql.json`

---

## Admin API Capabilities

The Admin REST API provides extensive capabilities organized into the following categories:

### Shop Management

The Shop API provides read access to store configuration and settings. This includes store name, email, currency, timezone, country, and plan information. The API also exposes location data for multi-location inventory management.

**Key Endpoints:**
- `GET /admin/api/2024-01/shop.json` — Retrieve shop information
- `GET /admin/api/2024-01/locations.json` — List all locations
- `GET /admin/oauth/access_scopes.json` — View granted access scopes

### Product Management

Full CRUD operations are available for products, variants, and images. Products can be organized with tags, vendors, and product types. Metafields enable custom data storage on products.

**Key Endpoints:**
- `GET /products.json` — List products
- `POST /products.json` — Create a product
- `PUT /products/{id}.json` — Update a product
- `DELETE /products/{id}.json` — Delete a product
- `GET /products/{id}/variants.json` — List variants
- `POST /products/{id}/variants.json` — Create a variant

**Example — Create Product:**
```python
product_data = {
    "title": "Demo Product",
    "body_html": "<p>Product description</p>",
    "vendor": "Zone",
    "product_type": "Electronics",
    "variants": [{"price": "199.99", "sku": "DEMO-001"}]
}
api.create_product(product_data)
```

### Customer Management

Complete customer lifecycle management including creation, updates, search, and deletion. Customer addresses, tags, and notes are fully supported.

**Key Endpoints:**
- `GET /customers.json` — List customers
- `POST /customers.json` — Create a customer
- `PUT /customers/{id}.json` — Update a customer
- `DELETE /customers/{id}.json` — Delete a customer
- `GET /customers/search.json?query=` — Search customers

**Example — Create Customer:**
```python
customer_data = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "addresses": [{
        "address1": "123 Main St",
        "city": "Cape Town",
        "country": "South Africa"
    }]
}
api.create_customer(customer_data)
```

### Order Management

Orders can be created, retrieved, updated, closed, and cancelled. Draft orders enable quote-to-order workflows. Fulfillment management is integrated for shipping operations.

**Key Endpoints:**
- `GET /orders.json` — List orders
- `POST /orders.json` — Create an order
- `PUT /orders/{id}.json` — Update an order
- `POST /orders/{id}/close.json` — Close an order
- `POST /orders/{id}/cancel.json` — Cancel an order
- `GET /draft_orders.json` — List draft orders
- `PUT /draft_orders/{id}/complete.json` — Convert draft to order

### Collection Management

Products can be organized into custom collections (manually curated) or smart collections (rule-based automatic inclusion).

**Key Endpoints:**
- `GET /custom_collections.json` — List custom collections
- `POST /custom_collections.json` — Create a custom collection
- `GET /smart_collections.json` — List smart collections
- `POST /collects.json` — Add product to collection

### Inventory Management

Multi-location inventory tracking with the ability to set and adjust inventory levels per location.

**Key Endpoints:**
- `GET /inventory_levels.json` — Get inventory levels
- `POST /inventory_levels/set.json` — Set inventory level
- `POST /inventory_levels/adjust.json` — Adjust inventory level

### Discounts & Price Rules

Create percentage or fixed-amount discounts with configurable conditions and usage limits.

**Key Endpoints:**
- `GET /price_rules.json` — List price rules
- `POST /price_rules.json` — Create a price rule
- `POST /price_rules/{id}/discount_codes.json` — Create discount code

### Webhooks

Subscribe to store events for real-time notifications. Supports JSON and XML formats.

**Key Endpoints:**
- `GET /webhooks.json` — List webhooks
- `POST /webhooks.json` — Create a webhook
- `DELETE /webhooks/{id}.json` — Delete a webhook

**Common Webhook Topics:**
- `orders/create`, `orders/updated`, `orders/cancelled`
- `products/create`, `products/update`, `products/delete`
- `customers/create`, `customers/update`
- `inventory_levels/update`
- `fulfillments/create`

---

## Storefront API Capabilities

The Storefront GraphQL API is designed for customer-facing applications and provides the following capabilities:

### Shop Information

Retrieve public shop information including name, description, domain, and payment settings.

```graphql
{
  shop {
    name
    description
    primaryDomain { url host }
    paymentSettings { currencyCode acceptedCardBrands }
  }
}
```

### Product & Collection Browsing

Query products and collections with filtering, sorting, and pagination. Access pricing, availability, and variant information.

```graphql
query getProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        priceRange {
          minVariantPrice { amount currencyCode }
        }
        variants(first: 5) {
          edges {
            node { id title availableForSale }
          }
        }
      }
    }
  }
}
```

### Cart Management

Create and manage shopping carts with line items. Generate checkout URLs for completing purchases.

```graphql
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      cost { totalAmount { amount currencyCode } }
    }
  }
}
```

---

## Access Scopes

The API token has been granted **154 access scopes**, providing comprehensive read and write access to the store. Below is a categorized summary:

| Category | Read Scopes | Write Scopes |
|----------|-------------|--------------|
| Products | `read_products`, `read_product_listings` | `write_products`, `write_product_listings` |
| Customers | `read_customers`, `read_customer_events` | `write_customers`, `write_customer_merge` |
| Orders | `read_orders`, `read_all_orders` | `write_orders`, `write_order_edits` |
| Inventory | `read_inventory` | `write_inventory` |
| Fulfillment | `read_fulfillments`, `read_assigned_fulfillment_orders` | `write_fulfillments`, `write_merchant_managed_fulfillment_orders` |
| Discounts | `read_discounts`, `read_price_rules` | `write_discounts`, `write_price_rules` |
| Themes | `read_themes` | `write_themes`, `write_theme_code` |
| Content | `read_content`, `read_locales` | `write_content`, `write_locales` |
| Analytics | `read_analytics`, `read_reports` | `write_reports` |
| Shipping | `read_shipping` | `write_shipping` |
| Files | `read_files` | `write_files` |
| Markets | `read_markets` | `write_markets` |

---

## Rate Limits

| API | Limit | Details |
|-----|-------|---------|
| **Admin REST API** | 2 requests/second | Bucket of 40 requests; refills at 2/sec |
| **Storefront GraphQL API** | 100 cost points/second | Cost varies by query complexity |

---

## Demo Script Features

The provided Python demo script (`shopify_api_demo.py`) includes:

1. **ShopifyAdminAPI Class** — A complete REST client for the Admin API with methods for:
   - Shop information retrieval
   - Product CRUD operations
   - Customer management
   - Order management
   - Collection management
   - Inventory management
   - Webhook management
   - Price rules and discounts
   - Metafields

2. **ShopifyStorefrontAPI Class** — A GraphQL client for the Storefront API with methods for:
   - Shop information
   - Product and collection browsing
   - Cart creation and management
   - Product search

3. **Demo Functions** — Executable demonstrations of:
   - Admin API capabilities
   - Storefront API capabilities
   - Product CRUD operations (create, update, retrieve, delete)
   - Customer operations (create, update, search, delete)

---

## Verified Operations

The following operations were successfully tested during the demo:

| Operation | Status | Details |
|-----------|--------|---------|
| Get Shop Info | ✅ Success | Retrieved store name, email, currency |
| Get Locations | ✅ Success | Found 1 location (Shop location) |
| Get Collections | ✅ Success | Found "Home page" collection |
| Get Access Scopes | ✅ Success | 154 scopes available |
| Create Product | ✅ Success | Product ID: 9248286998765 |
| Update Product | ✅ Success | Title updated |
| Delete Product | ✅ Success | Product removed |
| Create Customer | ✅ Success | Customer ID: 9306651787501 |
| Update Customer | ✅ Success | Note added |
| Delete Customer | ✅ Success | Customer removed |
| Storefront Shop Info | ✅ Success | GraphQL query successful |
| Create Cart | ✅ Success | Cart created with checkout URL |

---

## Usage Examples

### Initialize the API Client

```python
from shopify_api_demo import ShopifyAdminAPI, ShopifyStorefrontAPI

# Admin API (uses environment variables by default)
admin = ShopifyAdminAPI()

# Storefront API
storefront = ShopifyStorefrontAPI()
```

### Create a Product with Variants

```python
product = admin.create_product({
    "title": "Premium Widget",
    "body_html": "<p>High-quality widget for all your needs.</p>",
    "vendor": "Zone",
    "product_type": "Widgets",
    "variants": [
        {"price": "99.99", "sku": "WIDGET-SM", "option1": "Small"},
        {"price": "149.99", "sku": "WIDGET-LG", "option1": "Large"}
    ],
    "options": [{"name": "Size"}]
})
```

### Create a Discount Code

```python
# Create a price rule
price_rule = admin.create_price_rule({
    "title": "20% Off",
    "target_type": "line_item",
    "target_selection": "all",
    "allocation_method": "across",
    "value_type": "percentage",
    "value": "-20.0",
    "customer_selection": "all",
    "starts_at": "2024-01-01T00:00:00Z"
})

# Create a discount code for the rule
discount = admin.create_discount_code(
    price_rule["price_rule"]["id"],
    "SAVE20"
)
```

### Set Up a Webhook

```python
webhook = admin.create_webhook(
    topic="orders/create",
    address="https://your-server.com/webhooks/orders",
    format="json"
)
```

---

## References

- [Shopify Admin REST API Documentation](https://shopify.dev/docs/api/admin-rest)
- [Shopify Storefront API Documentation](https://shopify.dev/docs/api/storefront)
- [Shopify API Versioning](https://shopify.dev/docs/api/usage/versioning)
- [Shopify Rate Limits](https://shopify.dev/docs/api/usage/rate-limits)

---

## Files Included

| File | Description |
|------|-------------|
| `shopify_api_demo.py` | Complete Python demo script with API classes |
| `demo_output.txt` | Full output from demo execution |
| `README.md` | Quick start documentation |
| `SHOPIFY_API_CAPABILITIES_BRIEF.md` | This comprehensive capabilities document |
