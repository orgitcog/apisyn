# Intuit QuickBooks Online API - Capability Brief

## Executive Summary

The **Intuit QuickBooks Online API** is a RESTful API that enables developers to integrate with QuickBooks Online, Intuit's cloud-based accounting software used by millions of small and medium businesses worldwide. The API provides programmatic access to core accounting functions including customer management, invoicing, expense tracking, and financial reporting.

This document provides a comprehensive overview of the API's capabilities, authentication requirements, and practical usage examples based on the credentials and configuration provided through the Intuit Developer Portal.

---

## API Overview

The QuickBooks Online API uses the **REST architectural style** with JSON for data exchange. It supports standard HTTP methods (GET, POST, DELETE) and implements OAuth 2.0 for secure authentication.

| Attribute | Details |
|-----------|---------|
| **API Style** | RESTful with JSON payloads |
| **Authentication** | OAuth 2.0 with access and refresh tokens |
| **Base URL (Sandbox)** | `https://sandbox-quickbooks.api.intuit.com` |
| **Base URL (Production)** | `https://quickbooks.api.intuit.com` |
| **API Version** | v3 with minor versions (current: 73) |
| **Rate Limiting** | 500 requests per minute per realm |

---

## Authentication Flow

The API uses OAuth 2.0 for authentication, which involves a multi-step authorization flow to obtain access tokens.

### OAuth 2.0 Flow Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Your App   │────▶│  Intuit OAuth    │────▶│  QuickBooks     │
│              │     │  2.0 Server      │     │  Online Company │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                     │                        │
       │  1. Authorization   │                        │
       │     Request         │                        │
       │────────────────────▶│                        │
       │                     │  2. User Consent       │
       │                     │     Page               │
       │                     │───────────────────────▶│
       │                     │                        │
       │                     │  3. Authorization      │
       │  4. Auth Code       │     Code               │
       │◀────────────────────│◀───────────────────────│
       │                     │                        │
       │  5. Token Exchange  │                        │
       │────────────────────▶│                        │
       │                     │                        │
       │  6. Access Token    │                        │
       │     + Refresh Token │                        │
       │◀────────────────────│                        │
       │                     │                        │
       │  7. API Calls with  │                        │
       │     Access Token    │                        │
       │─────────────────────────────────────────────▶│
```

### Key Authentication Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **Authorization** | `https://appcenter.intuit.com/connect/oauth2` | Initiate user consent flow |
| **Token** | `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer` | Exchange code for tokens |
| **Revoke** | `https://developer.api.intuit.com/v2/oauth2/tokens/revoke` | Revoke tokens |
| **User Info** | `https://accounts.platform.intuit.com/v1/openid_connect/userinfo` | Get user profile |

### Token Lifecycle

Access tokens are short-lived (1 hour) while refresh tokens have a longer lifespan (100 days). The refresh token should be used to obtain new access tokens without requiring user re-authorization.

| Token Type | Lifespan | Max Length |
|------------|----------|------------|
| Access Token | 1 hour (3600 seconds) | 4096 characters |
| Refresh Token | 100 days | 512 characters |

---

## Available API Scopes

Scopes define what data and functionality your application can access. The primary scopes for QuickBooks Online are:

| Scope | Description |
|-------|-------------|
| `com.intuit.quickbooks.accounting` | Full access to QuickBooks Online Accounting API |
| `com.intuit.quickbooks.payment` | Access to QuickBooks Payments API |
| `openid` | OpenID Connect authentication |
| `profile` | User profile information |
| `email` | User email address |
| `address` | User address information |
| `phone` | User phone number |

---

## Core API Entities

The API provides access to a comprehensive set of business entities organized into logical categories.

### List Entities (Master Data)

These entities represent the foundational data used across transactions.

| Entity | Description | Operations |
|--------|-------------|------------|
| **Account** | Chart of accounts entries | Create, Read, Update, Query |
| **Customer** | Customer/client records | Create, Read, Update, Query |
| **Vendor** | Supplier/vendor records | Create, Read, Update, Query |
| **Employee** | Employee records | Create, Read, Update, Query |
| **Item** | Products and services | Create, Read, Update, Query |
| **Class** | Transaction classification | Create, Read, Update, Query |
| **Department** | Business segments | Create, Read, Update, Query |

### Transaction Entities

These entities represent financial transactions and business documents.

| Entity | Description | Operations |
|--------|-------------|------------|
| **Invoice** | Sales invoices | Create, Read, Update, Delete, Query, Send |
| **Bill** | Accounts payable | Create, Read, Update, Delete, Query |
| **Payment** | Customer payments | Create, Read, Update, Delete, Query |
| **BillPayment** | Vendor payments | Create, Read, Update, Delete, Query |
| **Estimate** | Quotes/estimates | Create, Read, Update, Delete, Query |
| **CreditMemo** | Customer credits | Create, Read, Update, Delete, Query |
| **SalesReceipt** | Point-of-sale receipts | Create, Read, Update, Delete, Query |
| **Purchase** | Purchases and expenses | Create, Read, Update, Delete, Query |
| **JournalEntry** | Manual journal entries | Create, Read, Update, Delete, Query |
| **Transfer** | Bank transfers | Create, Read, Update, Delete, Query |
| **Deposit** | Bank deposits | Create, Read, Update, Delete, Query |

### Report Entities

Financial reports available through the API.

| Report | Description |
|--------|-------------|
| **ProfitAndLoss** | Income statement |
| **BalanceSheet** | Assets, liabilities, and equity |
| **CashFlow** | Cash flow statement |
| **GeneralLedger** | Detailed transaction history |
| **APAgingDetail** | Accounts payable aging |
| **ARAgingDetail** | Accounts receivable aging |
| **CustomerBalance** | Customer balance summary |
| **VendorBalance** | Vendor balance summary |

---

## API Operations

### Standard CRUD Operations

The API supports standard Create, Read, Update, and Delete operations with some QuickBooks-specific variations.

**Create Operation**
```http
POST /v3/company/{realmId}/customer
Content-Type: application/json

{
  "DisplayName": "Acme Corporation",
  "PrimaryEmailAddr": {"Address": "contact@acme.com"}
}
```

**Read Operation**
```http
GET /v3/company/{realmId}/customer/{customerId}
```

**Update Operation (Sparse)**
```http
POST /v3/company/{realmId}/customer
Content-Type: application/json

{
  "Id": "123",
  "SyncToken": "0",
  "sparse": true,
  "DisplayName": "Acme Corp Updated"
}
```

**Delete Operation**

Soft delete (for list entities):
```http
POST /v3/company/{realmId}/customer
Content-Type: application/json

{
  "Id": "123",
  "SyncToken": "0",
  "Active": false
}
```

Hard delete (for transactions):
```http
POST /v3/company/{realmId}/invoice?operation=delete
Content-Type: application/json

{
  "Id": "456",
  "SyncToken": "1"
}
```

### Query Operations

The API supports a SQL-like query language for retrieving data.

**Basic Query**
```http
GET /v3/company/{realmId}/query?query=SELECT * FROM Customer
```

**Filtered Query**
```http
GET /v3/company/{realmId}/query?query=SELECT * FROM Customer WHERE Active = true
```

**Query with Pagination**
```http
GET /v3/company/{realmId}/query?query=SELECT * FROM Invoice STARTPOSITION 1 MAXRESULTS 100
```

**Query Examples**

| Use Case | Query |
|----------|-------|
| Active customers | `SELECT * FROM Customer WHERE Active = true` |
| Recent invoices | `SELECT * FROM Invoice WHERE TxnDate > '2024-01-01'` |
| High-value invoices | `SELECT * FROM Invoice WHERE TotalAmt > '1000'` |
| Bank accounts | `SELECT * FROM Account WHERE AccountType = 'Bank'` |
| Specific fields | `SELECT Id, DisplayName, Balance FROM Customer` |

### Batch Operations

Execute multiple operations in a single request to improve performance.

```http
POST /v3/company/{realmId}/batch
Content-Type: application/json

{
  "BatchItemRequest": [
    {
      "bId": "1",
      "operation": "create",
      "Customer": {"DisplayName": "Customer 1"}
    },
    {
      "bId": "2",
      "operation": "query",
      "Query": "SELECT * FROM Account MAXRESULTS 5"
    }
  ]
}
```

### Change Data Capture

Track changes to entities over time for synchronization purposes.

```http
GET /v3/company/{realmId}/cdc?entities=Customer,Invoice&changedSince=2024-01-01T00:00:00-08:00
```

---

## Configuration Details

Based on the provided credentials, here is the configuration for the connected QuickBooks company:

| Parameter | Value |
|-----------|-------|
| **Client ID** | `ABlXHyKQ3cDaygbhwV2AcD69vrKvAIsj5mhw5DjQc6ETXwCRJq` |
| **Realm ID** | `123145779115972` |
| **Environment** | Sandbox |
| **State** | `PlaygroundAuth` |

The authorization code provided has been used or expired (authorization codes are single-use and expire after 10 minutes). To obtain a fresh authorization code, visit the [OAuth 2.0 Playground](https://developer.intuit.com/app/developer/playground).

---

## SDK Support

Intuit provides official SDKs for multiple programming languages:

| Language | SDK Repository |
|----------|----------------|
| **.NET** | [QuickBooks V3 .NET SDK](https://github.com/intuit/QuickBooks-V3-DotNET-SDK) |
| **Java** | [QuickBooks V3 Java SDK](https://github.com/intuit/QuickBooks-V3-Java-SDK) |
| **PHP** | [QuickBooks V3 PHP SDK](https://github.com/intuit/QuickBooks-V3-PHP-SDK) |
| **Node.js** | [QuickBooks Node.js SDK](https://github.com/intuit/oauth-jsclient) |
| **Python** | [QuickBooks Python SDK](https://github.com/intuit/QuickBooks-V3-Python-SDK) |
| **Ruby** | [QuickBooks Ruby SDK](https://github.com/ruckus/quickbooks-ruby) |

---

## Best Practices

### Token Management

Tokens should be securely stored and refreshed before expiration. Implement automatic token refresh logic to prevent authentication failures during API operations.

### Error Handling

The API returns standard HTTP status codes along with detailed error messages. Common error codes include 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), and 429 (Rate Limit Exceeded).

### Rate Limiting

The API enforces rate limits of 500 requests per minute per realm. Implement exponential backoff for retry logic when rate limits are encountered.

### Sparse Updates

Use sparse updates when modifying entities to prevent accidentally overwriting fields. This is especially important when your application only manages a subset of an entity's fields.

### Optimistic Locking

The API uses SyncToken for optimistic locking. Always include the current SyncToken when updating entities to prevent concurrent modification conflicts.

---

## Use Cases

The QuickBooks Online API enables a wide variety of business integrations:

| Use Case | Description |
|----------|-------------|
| **E-commerce Integration** | Sync orders, customers, and payments from online stores |
| **CRM Integration** | Synchronize customer data between CRM and accounting |
| **Expense Management** | Automate expense tracking and categorization |
| **Invoicing Automation** | Generate and send invoices programmatically |
| **Financial Reporting** | Extract financial data for dashboards and analytics |
| **Payroll Integration** | Sync employee and payroll data |
| **Inventory Management** | Track inventory levels and costs |
| **Bank Reconciliation** | Automate bank feed matching and reconciliation |

---

## Additional Resources

| Resource | URL |
|----------|-----|
| **Developer Portal** | https://developer.intuit.com |
| **API Explorer** | https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account |
| **OAuth Playground** | https://developer.intuit.com/app/developer/playground |
| **Documentation** | https://developer.intuit.com/app/developer/qbo/docs/develop |
| **Community Forums** | https://help.developer.intuit.com |
| **App Partner Program** | https://developer.intuit.com/app/developer/apppartnerprogram |

---

## Conclusion

The Intuit QuickBooks Online API provides comprehensive access to accounting and business management functionality. With proper OAuth 2.0 implementation and adherence to best practices, developers can build powerful integrations that automate accounting workflows, synchronize business data, and enhance the QuickBooks Online experience for end users.

The demo script provided (`intuit_qbo_demo.py`) demonstrates the key capabilities of the API including authentication, entity management, transaction processing, and financial reporting. To test with live data, obtain a fresh authorization code from the OAuth Playground and update the environment variables accordingly.
