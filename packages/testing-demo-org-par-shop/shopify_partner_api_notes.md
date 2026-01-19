# Shopify Partner API - Key Findings

## Overview
The Shopify Partner API is a GraphQL-based API that provides access to data in the Partners Dashboard. It allows partners to automate front and back-office operations.

## Authentication
- **Organization ID**: Found in the URL of Partners Dashboard (e.g., https://partners.shopify.com/{organization_id}/api/2026-01/graphql.json)
- **Access Token**: Partner API client access token via `X-Shopify-Access-Token` header
- API clients are created through Partner Dashboard > Settings > Partner API clients

## API Endpoint
```
POST https://partners.shopify.com/{org_id}/api/2026-01/graphql.json
```

## Permissions/Scopes
1. **View financials**: Access Transaction resources (all transactions impacting Partner earnings)
2. **Manage apps**: Access App resources (installs, uninstalls, charges for public/private apps)
3. **Manage themes**: Access Theme resources (Shopify themes managed by organization)
4. **Manage jobs**: Access Conversation and Job resources (Experts Marketplace)

## Rate Limits
- 4 requests per second per Partner API client
- Returns 429 error when exceeded

## Available Data/Queries
Based on documentation:

### Transactions
- `AppSubscriptionSale` - Monthly/annual recurring app charges
- `ServiceSale` - Service-related transactions
- Transaction fields: createdAt, payout amount, app info, store info

### Apps
- App information and events
- Installs, uninstalls, charges

### Themes
- Theme resources managed by organization

### Conversations (Experts Marketplace)
- Unread messages
- Merchant user information
- Job resources

## Key Use Cases
1. **SaaS Metrics**: MRR, churn, LTV, ARPU calculations
2. **Marketing Attribution**: Campaign effectiveness tracking
3. **Support/CRM Integration**: Merchant history and billing info
4. **Partner Programs**: Referral calculations
5. **Forecasting**: Business planning tools

## API Versions
The API is versioned - use supported version in URL (e.g., 2026-01)

## Notes
- GraphQL only (no REST)
- Query-only API (no mutations currently)
- Pagination uses cursor-based approach
- Up to 100 results per request
