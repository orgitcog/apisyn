# Intuit QuickBooks Online API Research

## Overview
The QuickBooks Online Accounting API uses the REST framework with standard HTTP methods and JSON for input/output.

## Key API Entities/Resources

### List Entities (Name Lists)
- **Account** - Track accounts
- **Customer** - Customer management
- **Vendor** - Vendor management
- **Employee** - Employee management

### Transaction Entities
- **Invoice** - Sales invoices
- **Bill** - Bills/expenses
- **Payment** - Payment processing
- **BillPayment** - Bill payments
- **Refund** - Refunds

### Reports Entities
- **ProfitandLoss** - P&L reports
- **GeneralLedger** - General ledger
- **CashFlow** - Cash flow reports

### Inventory Entities
- **Item** - Products, services, inventory

### Other
- **JournalEntry** - Accounting adjustments

## Basic Operations

### Single Requests
Standard CRUD operations processed individually

### Query Requests
SQL-like query language for data retrieval

### Batch Operations
Multiple API entities and operations in one request
- Improves performance
- Decreases network round trips
- Use for transactions, NOT for list resources

### Change Data Capture
Returns entities changed within a specific timeframe
- Useful for periodic polling and data sync

## Update Operations

### Sparse Updates
- Update specific fields only
- Prevents unintended overwrites
- Reduces payload sizes
- Use `sparse="true"` attribute

### Full Updates
- Updates all writable attributes
- Missing attributes are cleared/set to NULL

## Delete Operations

### Soft Deletes
- For list entities (customers, vendors, accounts)
- Marks entity as inactive
- Can be reactivated

### Hard Deletes
- For transaction entities (invoices, estimates, etc.)
- Permanently deletes
- Cannot be undone

## Related APIs
- QuickBooks Payments API
- QuickBooks Desktop API
- QuickBooks Time API (formerly T-Sheets)


## All Available API Entities (from API Explorer sidebar)

Based on the API Explorer, the following entities are available:

### Account Management
- Account
- AccountListDetail

### Aging Reports
- APAgingDetail
- APAgingSummary
- ARAgingDetail
- ARAgingSummary

### Attachments
- Attachable

### Financial Reports
- BalanceSheet

### Operations
- Batch

### Transactions
- Bill
- BillPayment
- Budget
- CashFlow
- ChangeDataCapture
- Class
- CompanyCurrency
- CompanyInfo
- CreditMemo
- CreditCardPayment
- Customer
- CustomerBalance
- CustomerBalanceDetail

(More entities available below in sidebar)

## Base URLs

- Production: https://quickbooks.api.intuit.com
- Sandbox: https://sandbox-quickbooks.api.intuit.com

## API Endpoint Format
```
POST /v3/company/<realmID>/<entity>
GET /v3/company/<realmID>/<entity>/<id>
```


## OAuth 2.0 Authentication Flow

### Overview
The Intuit QuickBooks API uses OAuth 2.0 for authentication and authorization. The flow involves:

1. **Create App** - Register on Intuit Developer Portal
2. **Get Credentials** - Obtain Client ID and Client Secret
3. **Authorization Request** - Redirect user to Intuit OAuth 2.0 Server
4. **User Consent** - User grants permission to access their QuickBooks data
5. **Authorization Code** - Intuit returns authorization code to your app
6. **Token Exchange** - Exchange authorization code for access and refresh tokens
7. **API Calls** - Use access tokens to make API calls

### Key Endpoints

| Endpoint Type | Sandbox URL | Production URL |
|---------------|-------------|----------------|
| Authorization | https://appcenter.intuit.com/connect/oauth2 | https://appcenter.intuit.com/connect/oauth2 |
| Token | https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer | https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer |
| API Base | https://sandbox-quickbooks.api.intuit.com | https://quickbooks.api.intuit.com |

### Authorization Request Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| client_id | App identifier from Developer Portal | Yes |
| scope | Permissions requested (e.g., com.intuit.quickbooks.accounting) | Yes |
| redirect_uri | Your app's callback URL | Yes |
| response_type | Always "code" | Yes |
| state | Anti-CSRF token | Yes |

### Token Response Fields

| Field | Description |
|-------|-------------|
| access_token | Token for API calls (max 4096 chars) |
| refresh_token | Token for refreshing access (max 512 chars) |
| expires_in | Access token lifetime in seconds (3600 = 1 hour) |
| x_refresh_token_expires_in | Refresh token lifetime in seconds |
| token_type | Always "bearer" |

### Available Scopes
- **com.intuit.quickbooks.accounting** - QuickBooks Online Accounting API
- **com.intuit.quickbooks.payment** - QuickBooks Payments API
- **openid** - OpenID Connect
- **profile** - User profile info
- **email** - User email
- **address** - User address
- **phone** - User phone

### SDKs Available
- .NET
- Java
- PHP
- Node.js
- Python
- Ruby

