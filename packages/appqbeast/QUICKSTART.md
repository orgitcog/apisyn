# QuickBooks Online API Demo - Quick Start Guide

## Prerequisites

Before running the demo script, ensure you have:

1. An Intuit Developer account at https://developer.intuit.com
2. A registered application with QuickBooks Online scope
3. A sandbox company for testing

## Getting a Fresh Authorization Code

The authorization code provided has expired (codes are single-use and valid for 10 minutes). To get a new one:

1. Visit the [OAuth 2.0 Playground](https://developer.intuit.com/app/developer/playground)
2. Select your app from the dropdown
3. Choose the QuickBooks Online Accounting scope
4. Click "Get authorization code"
5. Sign in and authorize the app
6. Copy the new authorization code from the URL

## Setting Environment Variables

```bash
export Client_Id="your_client_id"
export Client_Secret="your_client_secret"
export realmId="your_realm_id"
export code="your_fresh_authorization_code"
```

## Running the Demo

```bash
python3 intuit_qbo_demo.py
```

## Expected Output

When running with valid credentials and a fresh authorization code:

```
======================================================================
   INTUIT QUICKBOOKS ONLINE API DEMONSTRATION
======================================================================

STEP 1: OAuth 2.0 Token Exchange
----------------------------------------------------------------------
✓ Token exchange successful!
  Access Token: eyJlbmMi...
  Refresh Token: AB11768...
  Expires In: 3600 seconds

STEP 2: Testing API Endpoints
----------------------------------------------------------------------
✓ Company: Sandbox Company US
✓ Found 5 customers
✓ Found 10 accounts
✓ Found 3 invoices
...
```

## Using the API Client in Your Code

```python
from intuit_qbo_demo import IntuitQuickBooksAPI

# Initialize
api = IntuitQuickBooksAPI(
    client_id="your_client_id",
    client_secret="your_client_secret",
    realm_id="your_realm_id",
    use_sandbox=True
)

# Authenticate
api.exchange_code_for_tokens("your_auth_code")

# Use the API
company = api.get_company_info()
customers = api.query_customers(max_results=10)
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `invalid_grant` | Authorization code expired or already used. Get a new one from OAuth Playground. |
| `401 Unauthorized` | Access token expired. Use `refresh_access_token()` method. |
| `403 Forbidden` | App doesn't have required scope. Check app configuration. |
| `404 Not Found` | Invalid realm ID or entity ID. |
| `429 Too Many Requests` | Rate limit exceeded. Wait and retry with exponential backoff. |

## Files Included

| File | Description |
|------|-------------|
| `intuit_qbo_demo.py` | Main demo script with API client class |
| `intuit_qbo_api_brief.md` | Comprehensive API capability documentation |
| `intuit_api_research.md` | Research notes and API reference |
| `QUICKSTART.md` | This quick start guide |
