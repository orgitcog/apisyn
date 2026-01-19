#!/usr/bin/env python3
"""
Intuit QuickBooks Online API Demo Script
=========================================

This script demonstrates the capabilities of the Intuit QuickBooks Online API,
including OAuth 2.0 authentication, token management, and various API operations.

Features demonstrated:
- OAuth 2.0 token exchange and refresh
- Company information retrieval
- Customer management (CRUD operations)
- Invoice operations
- Account queries
- Batch operations
- Change data capture

Author: Manus AI
Date: January 2026
"""

import os
import json
import base64
import requests
from datetime import datetime
from typing import Optional, Dict, Any, List


class IntuitQuickBooksAPI:
    """
    A comprehensive client for the Intuit QuickBooks Online API.
    
    This class provides methods for OAuth 2.0 authentication and
    interaction with QuickBooks Online data including customers,
    invoices, accounts, and more.
    """
    
    # API Endpoints
    SANDBOX_BASE_URL = "https://sandbox-quickbooks.api.intuit.com"
    PRODUCTION_BASE_URL = "https://quickbooks.api.intuit.com"
    TOKEN_ENDPOINT = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    REVOKE_ENDPOINT = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke"
    USERINFO_ENDPOINT = "https://accounts.platform.intuit.com/v1/openid_connect/userinfo"
    
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        realm_id: str,
        use_sandbox: bool = True
    ):
        """
        Initialize the QuickBooks API client.
        
        Args:
            client_id: OAuth 2.0 Client ID from Intuit Developer Portal
            client_secret: OAuth 2.0 Client Secret
            realm_id: QuickBooks company ID (realmId)
            use_sandbox: Use sandbox environment (default: True)
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.realm_id = realm_id
        self.base_url = self.SANDBOX_BASE_URL if use_sandbox else self.PRODUCTION_BASE_URL
        
        # Token storage
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        
        # API version
        self.minor_version = 73  # Latest minor version
        
    def _get_auth_header(self) -> str:
        """Generate Base64 encoded authorization header for token requests."""
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"
    
    def _get_api_headers(self) -> Dict[str, str]:
        """Generate headers for API requests."""
        if not self.access_token:
            raise ValueError("No access token available. Please authenticate first.")
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    def exchange_code_for_tokens(
        self,
        authorization_code: str,
        redirect_uri: str = "https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl"
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens.
        
        This is Step 12 in the OAuth 2.0 flow - exchanging the authorization
        code received after user consent for actual tokens.
        
        Args:
            authorization_code: The code received from OAuth callback
            redirect_uri: The redirect URI registered with your app
            
        Returns:
            Dictionary containing access_token, refresh_token, and expiry info
        """
        print("\n" + "="*60)
        print("OAUTH 2.0 TOKEN EXCHANGE")
        print("="*60)
        
        headers = {
            "Authorization": self._get_auth_header(),
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": redirect_uri
        }
        
        print(f"Token Endpoint: {self.TOKEN_ENDPOINT}")
        print(f"Grant Type: authorization_code")
        print(f"Redirect URI: {redirect_uri}")
        
        response = requests.post(self.TOKEN_ENDPOINT, headers=headers, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data.get("access_token")
            self.refresh_token = token_data.get("refresh_token")
            
            expires_in = token_data.get("expires_in", 3600)
            self.token_expires_at = datetime.now()
            
            print("\n✓ Token exchange successful!")
            print(f"  Access Token: {self.access_token[:50]}...")
            print(f"  Refresh Token: {self.refresh_token[:30]}...")
            print(f"  Expires In: {expires_in} seconds")
            print(f"  Token Type: {token_data.get('token_type')}")
            
            return token_data
        else:
            print(f"\n✗ Token exchange failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return {"error": response.text, "status_code": response.status_code}
    
    def refresh_access_token(self) -> Dict[str, Any]:
        """
        Refresh the access token using the refresh token.
        
        Access tokens expire after 1 hour. Use this method to get a new
        access token without requiring user re-authorization.
        
        Returns:
            Dictionary containing new access_token and refresh_token
        """
        print("\n" + "="*60)
        print("REFRESHING ACCESS TOKEN")
        print("="*60)
        
        if not self.refresh_token:
            raise ValueError("No refresh token available.")
        
        headers = {
            "Authorization": self._get_auth_header(),
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token
        }
        
        response = requests.post(self.TOKEN_ENDPOINT, headers=headers, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data.get("access_token")
            self.refresh_token = token_data.get("refresh_token")
            
            print("✓ Token refresh successful!")
            print(f"  New Access Token: {self.access_token[:50]}...")
            
            return token_data
        else:
            print(f"✗ Token refresh failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return {"error": response.text}
    
    def set_tokens(self, access_token: str, refresh_token: Optional[str] = None):
        """
        Manually set tokens (useful for testing or token persistence).
        
        Args:
            access_token: The OAuth 2.0 access token
            refresh_token: The OAuth 2.0 refresh token (optional)
        """
        self.access_token = access_token
        if refresh_token:
            self.refresh_token = refresh_token
        print("✓ Tokens set successfully")
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Make an API request to QuickBooks Online.
        
        Args:
            method: HTTP method (GET, POST, DELETE)
            endpoint: API endpoint path
            data: Request body for POST requests
            params: Query parameters
            
        Returns:
            API response as dictionary
        """
        url = f"{self.base_url}/v3/company/{self.realm_id}/{endpoint}"
        
        if params is None:
            params = {}
        params["minorversion"] = self.minor_version
        
        headers = self._get_api_headers()
        
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, params=params)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            return {
                "error": True,
                "status_code": response.status_code,
                "message": response.text
            }
    
    # =========================================================================
    # COMPANY INFORMATION
    # =========================================================================
    
    def get_company_info(self) -> Dict[str, Any]:
        """
        Retrieve company information for the connected QuickBooks company.
        
        Returns basic company details including name, address, and settings.
        
        Returns:
            Company information dictionary
        """
        print("\n" + "="*60)
        print("COMPANY INFORMATION")
        print("="*60)
        
        result = self._make_request("GET", f"companyinfo/{self.realm_id}")
        
        if "CompanyInfo" in result:
            info = result["CompanyInfo"]
            print(f"✓ Company: {info.get('CompanyName')}")
            print(f"  Legal Name: {info.get('LegalName')}")
            print(f"  Country: {info.get('Country')}")
            print(f"  Email: {info.get('Email', {}).get('Address', 'N/A')}")
            print(f"  Fiscal Year Start: {info.get('FiscalYearStartMonth')}")
        
        return result
    
    # =========================================================================
    # CUSTOMER OPERATIONS
    # =========================================================================
    
    def query_customers(self, max_results: int = 10) -> Dict[str, Any]:
        """
        Query customers from QuickBooks.
        
        Uses the SQL-like query language supported by the API.
        
        Args:
            max_results: Maximum number of customers to return
            
        Returns:
            Query response with customer list
        """
        print("\n" + "="*60)
        print("QUERYING CUSTOMERS")
        print("="*60)
        
        query = f"SELECT * FROM Customer MAXRESULTS {max_results}"
        result = self._make_request("GET", "query", params={"query": query})
        
        if "QueryResponse" in result:
            customers = result["QueryResponse"].get("Customer", [])
            print(f"✓ Found {len(customers)} customers")
            for cust in customers[:5]:
                print(f"  - {cust.get('DisplayName')} (ID: {cust.get('Id')})")
        
        return result
    
    def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """
        Get a specific customer by ID.
        
        Args:
            customer_id: The QuickBooks customer ID
            
        Returns:
            Customer details
        """
        print(f"\n→ Getting customer ID: {customer_id}")
        return self._make_request("GET", f"customer/{customer_id}")
    
    def create_customer(
        self,
        display_name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        company_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new customer in QuickBooks.
        
        Args:
            display_name: Customer display name (required, must be unique)
            email: Customer email address
            phone: Customer phone number
            company_name: Customer's company name
            
        Returns:
            Created customer details
        """
        print("\n" + "="*60)
        print("CREATING CUSTOMER")
        print("="*60)
        
        customer_data = {
            "DisplayName": display_name
        }
        
        if email:
            customer_data["PrimaryEmailAddr"] = {"Address": email}
        if phone:
            customer_data["PrimaryPhone"] = {"FreeFormNumber": phone}
        if company_name:
            customer_data["CompanyName"] = company_name
        
        print(f"Creating customer: {display_name}")
        result = self._make_request("POST", "customer", data=customer_data)
        
        if "Customer" in result:
            cust = result["Customer"]
            print(f"✓ Customer created successfully!")
            print(f"  ID: {cust.get('Id')}")
            print(f"  Display Name: {cust.get('DisplayName')}")
        
        return result
    
    def update_customer(
        self,
        customer_id: str,
        sync_token: str,
        updates: Dict[str, Any],
        sparse: bool = True
    ) -> Dict[str, Any]:
        """
        Update an existing customer.
        
        Args:
            customer_id: Customer ID to update
            sync_token: Current sync token (for optimistic locking)
            updates: Dictionary of fields to update
            sparse: Use sparse update (only update specified fields)
            
        Returns:
            Updated customer details
        """
        print(f"\n→ Updating customer ID: {customer_id}")
        
        update_data = {
            "Id": customer_id,
            "SyncToken": sync_token,
            "sparse": sparse,
            **updates
        }
        
        return self._make_request("POST", "customer", data=update_data)
    
    # =========================================================================
    # ACCOUNT OPERATIONS
    # =========================================================================
    
    def query_accounts(self, account_type: Optional[str] = None, max_results: int = 20) -> Dict[str, Any]:
        """
        Query accounts from the chart of accounts.
        
        Args:
            account_type: Filter by account type (e.g., 'Bank', 'Expense')
            max_results: Maximum number of accounts to return
            
        Returns:
            Query response with account list
        """
        print("\n" + "="*60)
        print("QUERYING ACCOUNTS")
        print("="*60)
        
        if account_type:
            query = f"SELECT * FROM Account WHERE AccountType = '{account_type}' MAXRESULTS {max_results}"
        else:
            query = f"SELECT * FROM Account MAXRESULTS {max_results}"
        
        result = self._make_request("GET", "query", params={"query": query})
        
        if "QueryResponse" in result:
            accounts = result["QueryResponse"].get("Account", [])
            print(f"✓ Found {len(accounts)} accounts")
            for acc in accounts[:10]:
                print(f"  - {acc.get('Name')} ({acc.get('AccountType')}) - Balance: {acc.get('CurrentBalance', 0)}")
        
        return result
    
    # =========================================================================
    # INVOICE OPERATIONS
    # =========================================================================
    
    def query_invoices(self, max_results: int = 10) -> Dict[str, Any]:
        """
        Query invoices from QuickBooks.
        
        Args:
            max_results: Maximum number of invoices to return
            
        Returns:
            Query response with invoice list
        """
        print("\n" + "="*60)
        print("QUERYING INVOICES")
        print("="*60)
        
        query = f"SELECT * FROM Invoice MAXRESULTS {max_results}"
        result = self._make_request("GET", "query", params={"query": query})
        
        if "QueryResponse" in result:
            invoices = result["QueryResponse"].get("Invoice", [])
            print(f"✓ Found {len(invoices)} invoices")
            for inv in invoices[:5]:
                print(f"  - Invoice #{inv.get('DocNumber')} - Total: ${inv.get('TotalAmt', 0)}")
        
        return result
    
    def create_invoice(
        self,
        customer_id: str,
        line_items: List[Dict[str, Any]],
        due_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new invoice.
        
        Args:
            customer_id: Customer ID for the invoice
            line_items: List of line items with Amount, Description, etc.
            due_date: Invoice due date (YYYY-MM-DD format)
            
        Returns:
            Created invoice details
        """
        print("\n" + "="*60)
        print("CREATING INVOICE")
        print("="*60)
        
        invoice_data = {
            "CustomerRef": {"value": customer_id},
            "Line": line_items
        }
        
        if due_date:
            invoice_data["DueDate"] = due_date
        
        result = self._make_request("POST", "invoice", data=invoice_data)
        
        if "Invoice" in result:
            inv = result["Invoice"]
            print(f"✓ Invoice created successfully!")
            print(f"  ID: {inv.get('Id')}")
            print(f"  Doc Number: {inv.get('DocNumber')}")
            print(f"  Total: ${inv.get('TotalAmt')}")
        
        return result
    
    # =========================================================================
    # ITEM (PRODUCT/SERVICE) OPERATIONS
    # =========================================================================
    
    def query_items(self, max_results: int = 20) -> Dict[str, Any]:
        """
        Query items (products and services) from QuickBooks.
        
        Args:
            max_results: Maximum number of items to return
            
        Returns:
            Query response with item list
        """
        print("\n" + "="*60)
        print("QUERYING ITEMS (PRODUCTS/SERVICES)")
        print("="*60)
        
        query = f"SELECT * FROM Item MAXRESULTS {max_results}"
        result = self._make_request("GET", "query", params={"query": query})
        
        if "QueryResponse" in result:
            items = result["QueryResponse"].get("Item", [])
            print(f"✓ Found {len(items)} items")
            for item in items[:10]:
                print(f"  - {item.get('Name')} ({item.get('Type')}) - ${item.get('UnitPrice', 0)}")
        
        return result
    
    # =========================================================================
    # VENDOR OPERATIONS
    # =========================================================================
    
    def query_vendors(self, max_results: int = 10) -> Dict[str, Any]:
        """
        Query vendors from QuickBooks.
        
        Args:
            max_results: Maximum number of vendors to return
            
        Returns:
            Query response with vendor list
        """
        print("\n" + "="*60)
        print("QUERYING VENDORS")
        print("="*60)
        
        query = f"SELECT * FROM Vendor MAXRESULTS {max_results}"
        result = self._make_request("GET", "query", params={"query": query})
        
        if "QueryResponse" in result:
            vendors = result["QueryResponse"].get("Vendor", [])
            print(f"✓ Found {len(vendors)} vendors")
            for vendor in vendors[:5]:
                print(f"  - {vendor.get('DisplayName')} (ID: {vendor.get('Id')})")
        
        return result
    
    # =========================================================================
    # BATCH OPERATIONS
    # =========================================================================
    
    def batch_request(self, batch_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute multiple operations in a single batch request.
        
        Batch operations improve performance by reducing network round trips.
        
        Args:
            batch_items: List of batch item requests
            
        Returns:
            Batch response with results for each operation
        """
        print("\n" + "="*60)
        print("BATCH REQUEST")
        print("="*60)
        
        batch_data = {
            "BatchItemRequest": batch_items
        }
        
        result = self._make_request("POST", "batch", data=batch_data)
        
        if "BatchItemResponse" in result:
            responses = result["BatchItemResponse"]
            print(f"✓ Batch completed with {len(responses)} responses")
        
        return result
    
    # =========================================================================
    # CHANGE DATA CAPTURE
    # =========================================================================
    
    def get_changes(self, entities: List[str], since: str) -> Dict[str, Any]:
        """
        Get entities that have changed since a specific time.
        
        Useful for syncing data with external systems.
        
        Args:
            entities: List of entity types (e.g., ['Customer', 'Invoice'])
            since: ISO 8601 timestamp (e.g., '2024-01-01T00:00:00-08:00')
            
        Returns:
            Changed entities grouped by type
        """
        print("\n" + "="*60)
        print("CHANGE DATA CAPTURE")
        print("="*60)
        
        entities_param = ",".join(entities)
        params = {
            "entities": entities_param,
            "changedSince": since
        }
        
        result = self._make_request("GET", "cdc", params=params)
        
        if "CDCResponse" in result:
            print(f"✓ Retrieved changes since {since}")
        
        return result
    
    # =========================================================================
    # REPORTS
    # =========================================================================
    
    def get_profit_and_loss(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get Profit and Loss report.
        
        Args:
            start_date: Report start date (YYYY-MM-DD)
            end_date: Report end date (YYYY-MM-DD)
            
        Returns:
            Profit and Loss report data
        """
        print("\n" + "="*60)
        print("PROFIT AND LOSS REPORT")
        print("="*60)
        
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        result = self._make_request("GET", "reports/ProfitAndLoss", params=params)
        
        if "Header" in result:
            print(f"✓ Report: {result['Header'].get('ReportName')}")
            print(f"  Period: {result['Header'].get('StartPeriod')} to {result['Header'].get('EndPeriod')}")
        
        return result
    
    def get_balance_sheet(
        self,
        as_of_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get Balance Sheet report.
        
        Args:
            as_of_date: Report as-of date (YYYY-MM-DD)
            
        Returns:
            Balance Sheet report data
        """
        print("\n" + "="*60)
        print("BALANCE SHEET REPORT")
        print("="*60)
        
        params = {}
        if as_of_date:
            params["date"] = as_of_date
        
        result = self._make_request("GET", "reports/BalanceSheet", params=params)
        
        if "Header" in result:
            print(f"✓ Report: {result['Header'].get('ReportName')}")
        
        return result


def run_demo():
    """
    Run a comprehensive demonstration of the QuickBooks Online API.
    """
    print("\n" + "="*70)
    print("   INTUIT QUICKBOOKS ONLINE API DEMONSTRATION")
    print("="*70)
    print(f"\nDemo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get credentials from environment
    client_id = os.environ.get("Client_Id")
    client_secret = os.environ.get("Client_Secret")
    realm_id = os.environ.get("realmId")
    auth_code = os.environ.get("code")
    
    if not all([client_id, client_secret, realm_id]):
        print("\n✗ Error: Missing required environment variables")
        print("  Required: Client_Id, Client_Secret, realmId")
        return
    
    print(f"\nConfiguration:")
    print(f"  Client ID: {client_id[:20]}...")
    print(f"  Realm ID: {realm_id}")
    print(f"  Environment: Sandbox")
    
    # Initialize the API client
    api = IntuitQuickBooksAPI(
        client_id=client_id,
        client_secret=client_secret,
        realm_id=realm_id,
        use_sandbox=True
    )
    
    # Step 1: Exchange authorization code for tokens
    if auth_code:
        print("\n" + "-"*70)
        print("STEP 1: OAuth 2.0 Token Exchange")
        print("-"*70)
        token_result = api.exchange_code_for_tokens(auth_code)
        
        if "error" in token_result:
            print("\n⚠ Token exchange failed. This may be because:")
            print("  - The authorization code has expired (codes are single-use)")
            print("  - The code was already used")
            print("\nTo get a new code, visit the OAuth Playground:")
            print("  https://developer.intuit.com/app/developer/playground")
            
            # For demo purposes, we'll show what the API can do
            print("\n" + "="*70)
            print("DEMONSTRATING API CAPABILITIES (Documentation Mode)")
            print("="*70)
            demonstrate_capabilities()
            return
    else:
        print("\n⚠ No authorization code found. Running in documentation mode.")
        demonstrate_capabilities()
        return
    
    # Step 2: Test API endpoints
    print("\n" + "-"*70)
    print("STEP 2: Testing API Endpoints")
    print("-"*70)
    
    # Get company info
    api.get_company_info()
    
    # Query customers
    api.query_customers(max_results=5)
    
    # Query accounts
    api.query_accounts(max_results=10)
    
    # Query invoices
    api.query_invoices(max_results=5)
    
    # Query items
    api.query_items(max_results=10)
    
    # Query vendors
    api.query_vendors(max_results=5)
    
    # Get reports
    api.get_profit_and_loss()
    api.get_balance_sheet()
    
    print("\n" + "="*70)
    print("DEMO COMPLETED SUCCESSFULLY")
    print("="*70)


def demonstrate_capabilities():
    """
    Demonstrate API capabilities without making actual API calls.
    Shows the structure and usage of the API.
    """
    print("\n" + "="*60)
    print("QUICKBOOKS ONLINE API CAPABILITIES")
    print("="*60)
    
    capabilities = """
    
    The Intuit QuickBooks Online API provides comprehensive access to 
    accounting and business management features:
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ ENTITY MANAGEMENT                                               │
    ├─────────────────────────────────────────────────────────────────┤
    │ • Customers    - Create, read, update, query customers          │
    │ • Vendors      - Manage supplier/vendor information             │
    │ • Employees    - Employee records and payroll data              │
    │ • Items        - Products, services, and inventory              │
    │ • Accounts     - Chart of accounts management                   │
    └─────────────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ TRANSACTION PROCESSING                                          │
    ├─────────────────────────────────────────────────────────────────┤
    │ • Invoices     - Create and manage sales invoices               │
    │ • Bills        - Track accounts payable                         │
    │ • Payments     - Record customer payments                       │
    │ • Purchases    - Purchase orders and receipts                   │
    │ • Estimates    - Quotes and estimates                           │
    │ • Credit Memos - Customer credits and refunds                   │
    └─────────────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ FINANCIAL REPORTS                                               │
    ├─────────────────────────────────────────────────────────────────┤
    │ • Profit & Loss       - Income statement                        │
    │ • Balance Sheet       - Assets, liabilities, equity             │
    │ • Cash Flow           - Cash flow statement                     │
    │ • General Ledger      - Detailed transaction history            │
    │ • Aging Reports       - AR/AP aging summaries                   │
    └─────────────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ ADVANCED FEATURES                                               │
    ├─────────────────────────────────────────────────────────────────┤
    │ • Batch Operations    - Multiple operations in one request      │
    │ • Change Data Capture - Track entity changes over time          │
    │ • Webhooks            - Real-time event notifications           │
    │ • Attachments         - File attachments to transactions        │
    │ • Custom Fields       - Extended entity attributes              │
    └─────────────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ QUERY LANGUAGE                                                  │
    ├─────────────────────────────────────────────────────────────────┤
    │ The API supports a SQL-like query language:                     │
    │                                                                 │
    │ SELECT * FROM Customer WHERE Active = true                      │
    │ SELECT * FROM Invoice WHERE TotalAmt > '1000'                   │
    │ SELECT * FROM Account WHERE AccountType = 'Bank'                │
    │ SELECT Id, DisplayName FROM Customer MAXRESULTS 100             │
    └─────────────────────────────────────────────────────────────────┘
    
    """
    print(capabilities)
    
    # Show example code
    print("\n" + "="*60)
    print("EXAMPLE USAGE")
    print("="*60)
    
    example_code = '''
    # Initialize the API client
    api = IntuitQuickBooksAPI(
        client_id="your_client_id",
        client_secret="your_client_secret",
        realm_id="your_realm_id",
        use_sandbox=True
    )
    
    # Exchange authorization code for tokens
    api.exchange_code_for_tokens(authorization_code)
    
    # Get company information
    company = api.get_company_info()
    
    # Query customers
    customers = api.query_customers(max_results=10)
    
    # Create a new customer
    new_customer = api.create_customer(
        display_name="Acme Corporation",
        email="contact@acme.com",
        phone="555-123-4567"
    )
    
    # Create an invoice
    invoice = api.create_invoice(
        customer_id="123",
        line_items=[{
            "Amount": 100.00,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {
                "ItemRef": {"value": "1"}
            }
        }]
    )
    
    # Get financial reports
    pnl = api.get_profit_and_loss(
        start_date="2024-01-01",
        end_date="2024-12-31"
    )
    '''
    print(example_code)


if __name__ == "__main__":
    run_demo()
