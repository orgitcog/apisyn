# AppQBeast - Intuit QuickBooks Online API Demo

A comprehensive demonstration of the Intuit QuickBooks Online API, featuring OAuth 2.0 authentication and various API operations for accounting automation.

## Overview

This repository contains a Python-based demo script and documentation for integrating with the QuickBooks Online Accounting API. The API provides programmatic access to core accounting functions including:

- Customer and vendor management
- Invoice creation and tracking
- Expense and bill management
- Financial reporting (P&L, Balance Sheet, Cash Flow)
- Batch operations and change data capture

## Files

| File | Description |
|------|-------------|
| `intuit_qbo_demo.py` | Main Python demo script with API client class |
| `intuit_qbo_api_brief.md` | Comprehensive API capability documentation |
| `QUICKSTART.md` | Quick start guide for running the demo |
| `intuit_api_research.md` | Research notes and API reference |

## Quick Start

### Prerequisites

- Python 3.8+
- Intuit Developer account
- Registered QuickBooks Online app
- Sandbox company for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/orgitcog/appqbeast.git
cd appqbeast

# Install dependencies
pip install requests
```

### Configuration

Set the following environment variables:

```bash
export Client_Id="your_client_id"
export Client_Secret="your_client_secret"
export realmId="your_realm_id"
export code="your_authorization_code"
```

### Running the Demo

```bash
python3 intuit_qbo_demo.py
```

## OAuth 2.0 Authentication

The API uses OAuth 2.0 for secure authentication. The demo script handles:

1. Authorization code exchange for tokens
2. Access token refresh
3. Secure API request signing

To obtain a fresh authorization code, visit the [OAuth 2.0 Playground](https://developer.intuit.com/app/developer/playground).

## API Capabilities

### Entity Management
- Customers, Vendors, Employees
- Products and Services (Items)
- Chart of Accounts

### Transaction Processing
- Invoices, Bills, Payments
- Estimates, Credit Memos
- Journal Entries

### Financial Reports
- Profit & Loss
- Balance Sheet
- Cash Flow Statement
- Aging Reports

### Advanced Features
- Batch Operations
- Change Data Capture
- Webhooks
- Attachments

## Resources

- [Intuit Developer Portal](https://developer.intuit.com)
- [API Documentation](https://developer.intuit.com/app/developer/qbo/docs/develop)
- [OAuth Playground](https://developer.intuit.com/app/developer/playground)

## License

MIT License

## Author

Created by Manus AI - January 2026
