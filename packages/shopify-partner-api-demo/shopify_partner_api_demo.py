#!/usr/bin/env python3
"""
Shopify Partner API Demo Script
================================
A comprehensive demonstration of the Shopify Partner API capabilities.

This script provides a complete toolkit for interacting with the Shopify Partner API,
including authentication, querying transactions, apps, and more.

Author: Manus AI
Organization ID: 3604544
API Version: 2026-01
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from enum import Enum

# =============================================================================
# CONFIGURATION
# =============================================================================

class Config:
    """API Configuration"""
    ORGANIZATION_ID = "3604544"
    API_VERSION = "2026-01"
    BASE_URL = f"https://partners.shopify.com/{ORGANIZATION_ID}/api/{API_VERSION}/graphql.json"
    ACCESS_TOKEN = os.environ.get("SHOPIFY_PARTNER_CLIENT_API", "")
    
    # Rate limiting: 4 requests per second
    RATE_LIMIT = 4
    REQUEST_DELAY = 0.25  # seconds between requests

# =============================================================================
# ENUMS
# =============================================================================

class TransactionType(Enum):
    """Available transaction types in the Partner API"""
    SERVICE_SALE = "SERVICE_SALE"
    SERVICE_SALE_ADJUSTMENT = "SERVICE_SALE_ADJUSTMENT"
    THEME_SALE = "THEME_SALE"
    THEME_SALE_ADJUSTMENT = "THEME_SALE_ADJUSTMENT"
    APP_ONE_TIME_SALE = "APP_ONE_TIME_SALE"
    APP_SUBSCRIPTION_SALE = "APP_SUBSCRIPTION_SALE"
    APP_USAGE_SALE = "APP_USAGE_SALE"
    APP_SALE_CREDIT = "APP_SALE_CREDIT"
    APP_SALE_ADJUSTMENT = "APP_SALE_ADJUSTMENT"
    REFERRAL = "REFERRAL"
    REFERRAL_ADJUSTMENT = "REFERRAL_ADJUSTMENT"
    TAX = "TAX"
    LEGACY = "LEGACY"

# =============================================================================
# API CLIENT
# =============================================================================

class ShopifyPartnerAPI:
    """
    Shopify Partner API Client
    
    Provides methods to interact with the Shopify Partner GraphQL API.
    
    Usage:
        api = ShopifyPartnerAPI()
        
        # Get API versions
        versions = api.get_api_versions()
        
        # Get transactions
        transactions = api.get_transactions(first=10)
        
        # Get app by ID
        app = api.get_app(app_id="gid://partners/App/12345")
    """
    
    def __init__(self, access_token: str = None, organization_id: str = None):
        """
        Initialize the API client.
        
        Args:
            access_token: Partner API access token (defaults to env var)
            organization_id: Partner organization ID (defaults to config)
        """
        self.access_token = access_token or Config.ACCESS_TOKEN
        self.organization_id = organization_id or Config.ORGANIZATION_ID
        self.base_url = f"https://partners.shopify.com/{self.organization_id}/api/{Config.API_VERSION}/graphql.json"
        
        if not self.access_token:
            raise ValueError("Access token is required. Set SHOPIFY_PARTNER_CLIENT_API environment variable.")
        
        self.headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.access_token
        }
    
    def execute_query(self, query: str, variables: Dict = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query.
        
        Args:
            query: GraphQL query string
            variables: Optional query variables
            
        Returns:
            API response as dictionary
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        response = requests.post(self.base_url, headers=self.headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if "errors" in result:
            error_messages = [e.get("message", "Unknown error") for e in result["errors"]]
            raise Exception(f"GraphQL Errors: {'; '.join(error_messages)}")
        
        return result
    
    # =========================================================================
    # API VERSION QUERIES
    # =========================================================================
    
    def get_api_versions(self) -> List[Dict]:
        """
        Get available API versions.
        
        Returns:
            List of API version information
        """
        query = """
        query GetApiVersions {
            publicApiVersions {
                handle
                displayName
                supported
            }
        }
        """
        result = self.execute_query(query)
        return result.get("data", {}).get("publicApiVersions", [])
    
    # =========================================================================
    # APP QUERIES
    # =========================================================================
    
    def get_app(self, app_id: str) -> Optional[Dict]:
        """
        Get app details by ID.
        
        Args:
            app_id: App GID (e.g., "gid://partners/App/12345")
            
        Returns:
            App details dictionary
        """
        query = """
        query GetApp($id: ID!) {
            app(id: $id) {
                id
                name
                apiKey
                events(first: 10) {
                    edges {
                        node {
                            type
                            occurredAt
                            shop {
                                name
                                myshopifyDomain
                            }
                        }
                    }
                }
            }
        }
        """
        result = self.execute_query(query, {"id": app_id})
        return result.get("data", {}).get("app")
    
    def get_app_events(self, app_id: str, first: int = 20) -> List[Dict]:
        """
        Get app events (installs, uninstalls, etc.).
        
        Args:
            app_id: App GID
            first: Number of events to retrieve
            
        Returns:
            List of app events
        """
        query = """
        query GetAppEvents($id: ID!, $first: Int!) {
            app(id: $id) {
                name
                events(first: $first) {
                    edges {
                        node {
                            type
                            occurredAt
                            shop {
                                name
                                myshopifyDomain
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
            }
        }
        """
        result = self.execute_query(query, {"id": app_id, "first": first})
        app_data = result.get("data", {}).get("app", {})
        events = app_data.get("events", {}).get("edges", [])
        return [e["node"] for e in events]
    
    # =========================================================================
    # TRANSACTION QUERIES
    # =========================================================================
    
    def get_transactions(
        self,
        first: int = 20,
        after: str = None,
        types: List[TransactionType] = None,
        shop_id: str = None,
        app_id: str = None,
        created_at_min: datetime = None,
        created_at_max: datetime = None
    ) -> Dict[str, Any]:
        """
        Get transactions with optional filters.
        
        Args:
            first: Number of transactions to retrieve (max 100)
            after: Cursor for pagination
            types: Filter by transaction types
            shop_id: Filter by shop ID
            app_id: Filter by app ID
            created_at_min: Filter by minimum creation date
            created_at_max: Filter by maximum creation date
            
        Returns:
            Dictionary with transactions and pagination info
        """
        # Build query with all transaction type fragments
        query = """
        query GetTransactions(
            $first: Int!,
            $after: String,
            $types: [TransactionType!],
            $shopId: ID,
            $appId: ID,
            $createdAtMin: DateTime,
            $createdAtMax: DateTime
        ) {
            transactions(
                first: $first,
                after: $after,
                types: $types,
                shopId: $shopId,
                appId: $appId,
                createdAtMin: $createdAtMin,
                createdAtMax: $createdAtMax
            ) {
                edges {
                    cursor
                    node {
                        id
                        createdAt
                        __typename
                        ... on AppSubscriptionSale {
                            app { name id }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                            grossAmount { amount currencyCode }
                            billingInterval
                            chargeId
                        }
                        ... on AppOneTimeSale {
                            app { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                            grossAmount { amount currencyCode }
                        }
                        ... on AppUsageSale {
                            app { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                            grossAmount { amount currencyCode }
                        }
                        ... on AppSaleAdjustment {
                            app { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                        }
                        ... on AppSaleCredit {
                            app { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                        }
                        ... on ServiceSale {
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                            grossAmount { amount currencyCode }
                        }
                        ... on ServiceSaleAdjustment {
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                        }
                        ... on ThemeSale {
                            theme { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                            grossAmount { amount currencyCode }
                        }
                        ... on ThemeSaleAdjustment {
                            theme { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                        }
                        ... on ReferralTransaction {
                            shop { name myshopifyDomain }
                        }
                        ... on TaxTransaction {
                            amount { amount currencyCode }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                }
            }
        }
        """
        
        variables = {
            "first": min(first, 100),  # Max 100 per request
            "after": after,
            "types": [t.value for t in types] if types else None,
            "shopId": shop_id,
            "appId": app_id,
            "createdAtMin": created_at_min.isoformat() if created_at_min else None,
            "createdAtMax": created_at_max.isoformat() if created_at_max else None
        }
        
        # Remove None values
        variables = {k: v for k, v in variables.items() if v is not None}
        
        result = self.execute_query(query, variables)
        
        transactions_data = result.get("data", {}).get("transactions", {})
        edges = transactions_data.get("edges", [])
        page_info = transactions_data.get("pageInfo", {})
        
        return {
            "transactions": [e["node"] for e in edges],
            "cursors": [e["cursor"] for e in edges],
            "has_next_page": page_info.get("hasNextPage", False),
            "has_previous_page": page_info.get("hasPreviousPage", False),
            "last_cursor": edges[-1]["cursor"] if edges else None
        }
    
    def get_all_transactions(
        self,
        types: List[TransactionType] = None,
        created_at_min: datetime = None,
        created_at_max: datetime = None,
        max_pages: int = 10
    ) -> List[Dict]:
        """
        Get all transactions with automatic pagination.
        
        Args:
            types: Filter by transaction types
            created_at_min: Filter by minimum creation date
            created_at_max: Filter by maximum creation date
            max_pages: Maximum number of pages to fetch
            
        Returns:
            List of all transactions
        """
        all_transactions = []
        cursor = None
        page = 0
        
        while page < max_pages:
            result = self.get_transactions(
                first=100,
                after=cursor,
                types=types,
                created_at_min=created_at_min,
                created_at_max=created_at_max
            )
            
            all_transactions.extend(result["transactions"])
            
            if not result["has_next_page"]:
                break
            
            cursor = result["last_cursor"]
            page += 1
        
        return all_transactions
    
    def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict]:
        """
        Get a specific transaction by ID.
        
        Args:
            transaction_id: Transaction GID
            
        Returns:
            Transaction details
        """
        query = """
        query GetTransaction($id: ID!) {
            transaction(id: $id) {
                id
                createdAt
                __typename
                ... on AppSubscriptionSale {
                    app { name id }
                    shop { name myshopifyDomain }
                    netAmount { amount currencyCode }
                    grossAmount { amount currencyCode }
                    billingInterval
                }
                ... on AppOneTimeSale {
                    app { name }
                    shop { name myshopifyDomain }
                    netAmount { amount currencyCode }
                }
            }
        }
        """
        result = self.execute_query(query, {"id": transaction_id})
        return result.get("data", {}).get("transaction")
    
    # =========================================================================
    # ANALYTICS HELPERS
    # =========================================================================
    
    def calculate_revenue_summary(
        self,
        transactions: List[Dict]
    ) -> Dict[str, Any]:
        """
        Calculate revenue summary from transactions.
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Revenue summary with totals by type and currency
        """
        summary = {
            "total_transactions": len(transactions),
            "by_type": {},
            "by_currency": {},
            "by_app": {},
            "by_shop": {}
        }
        
        for tx in transactions:
            tx_type = tx.get("__typename", "Unknown")
            
            # Count by type
            if tx_type not in summary["by_type"]:
                summary["by_type"][tx_type] = {"count": 0, "total": 0.0}
            summary["by_type"][tx_type]["count"] += 1
            
            # Sum amounts
            net_amount = tx.get("netAmount", {})
            if net_amount:
                amount = float(net_amount.get("amount", 0))
                currency = net_amount.get("currencyCode", "USD")
                
                summary["by_type"][tx_type]["total"] += amount
                
                if currency not in summary["by_currency"]:
                    summary["by_currency"][currency] = 0.0
                summary["by_currency"][currency] += amount
            
            # Track by app
            app = tx.get("app", {})
            if app:
                app_name = app.get("name", "Unknown")
                if app_name not in summary["by_app"]:
                    summary["by_app"][app_name] = {"count": 0, "total": 0.0}
                summary["by_app"][app_name]["count"] += 1
                if net_amount:
                    summary["by_app"][app_name]["total"] += float(net_amount.get("amount", 0))
            
            # Track by shop
            shop = tx.get("shop", {})
            if shop:
                shop_name = shop.get("name", "Unknown")
                if shop_name not in summary["by_shop"]:
                    summary["by_shop"][shop_name] = {"count": 0, "total": 0.0}
                summary["by_shop"][shop_name]["count"] += 1
                if net_amount:
                    summary["by_shop"][shop_name]["total"] += float(net_amount.get("amount", 0))
        
        return summary
    
    # =========================================================================
    # SCHEMA INTROSPECTION
    # =========================================================================
    
    def introspect_schema(self) -> Dict[str, Any]:
        """
        Get full schema introspection.
        
        Returns:
            Schema information
        """
        query = """
        query IntrospectionQuery {
            __schema {
                queryType { name }
                mutationType { name }
                types {
                    name
                    kind
                    description
                }
            }
        }
        """
        return self.execute_query(query)
    
    def introspect_type(self, type_name: str) -> Dict[str, Any]:
        """
        Get details about a specific type.
        
        Args:
            type_name: Name of the type to introspect
            
        Returns:
            Type information including fields
        """
        query = """
        query IntrospectType($name: String!) {
            __type(name: $name) {
                name
                kind
                description
                fields {
                    name
                    description
                    type {
                        name
                        kind
                    }
                }
                enumValues {
                    name
                    description
                }
                possibleTypes {
                    name
                }
            }
        }
        """
        return self.execute_query(query, {"name": type_name})


# =============================================================================
# DEMO FUNCTIONS
# =============================================================================

def demo_api_versions(api: ShopifyPartnerAPI):
    """Demonstrate API version querying"""
    print("\n" + "="*60)
    print("DEMO: Get API Versions")
    print("="*60)
    
    versions = api.get_api_versions()
    print(f"\nFound {len(versions)} API versions:\n")
    
    for v in versions:
        status = "✓ Supported" if v["supported"] else "○ Not Supported"
        print(f"  {v['displayName']:30} {status}")
    
    return versions


def demo_transactions(api: ShopifyPartnerAPI):
    """Demonstrate transaction querying"""
    print("\n" + "="*60)
    print("DEMO: Get Transactions")
    print("="*60)
    
    try:
        result = api.get_transactions(first=20)
        transactions = result["transactions"]
        
        print(f"\nRetrieved {len(transactions)} transactions")
        print(f"Has next page: {result['has_next_page']}")
        
        if transactions:
            print("\nTransaction Summary:")
            summary = api.calculate_revenue_summary(transactions)
            
            print(f"\n  Total Transactions: {summary['total_transactions']}")
            
            print("\n  By Type:")
            for tx_type, data in summary["by_type"].items():
                print(f"    {tx_type}: {data['count']} transactions, ${data['total']:.2f}")
            
            print("\n  By Currency:")
            for currency, total in summary["by_currency"].items():
                print(f"    {currency}: ${total:.2f}")
            
            if summary["by_app"]:
                print("\n  By App:")
                for app, data in summary["by_app"].items():
                    print(f"    {app}: {data['count']} transactions, ${data['total']:.2f}")
        else:
            print("\n  No transactions found.")
        
        return transactions
    
    except Exception as e:
        print(f"\n  Error: {e}")
        return []


def demo_app_subscription_transactions(api: ShopifyPartnerAPI):
    """Demonstrate filtering transactions by type"""
    print("\n" + "="*60)
    print("DEMO: Get App Subscription Transactions")
    print("="*60)
    
    try:
        result = api.get_transactions(
            first=10,
            types=[TransactionType.APP_SUBSCRIPTION_SALE]
        )
        
        transactions = result["transactions"]
        print(f"\nFound {len(transactions)} app subscription transactions")
        
        for tx in transactions[:5]:
            app_name = tx.get("app", {}).get("name", "Unknown")
            shop_name = tx.get("shop", {}).get("name", "Unknown")
            amount = tx.get("netAmount", {}).get("amount", "0")
            currency = tx.get("netAmount", {}).get("currencyCode", "USD")
            created = tx.get("createdAt", "Unknown")
            
            print(f"\n  App: {app_name}")
            print(f"  Shop: {shop_name}")
            print(f"  Amount: {currency} {amount}")
            print(f"  Date: {created}")
        
        return transactions
    
    except Exception as e:
        print(f"\n  Error: {e}")
        return []


def demo_schema_introspection(api: ShopifyPartnerAPI):
    """Demonstrate schema introspection"""
    print("\n" + "="*60)
    print("DEMO: Schema Introspection")
    print("="*60)
    
    # Introspect QueryRoot
    print("\n1. Available Queries (QueryRoot):")
    result = api.introspect_type("QueryRoot")
    fields = result.get("data", {}).get("__type", {}).get("fields", [])
    
    for field in fields:
        print(f"\n  {field['name']}:")
        print(f"    {field.get('description', 'No description')[:80]}...")
    
    # Introspect TransactionType enum
    print("\n\n2. Transaction Types (TransactionType enum):")
    result = api.introspect_type("TransactionType")
    enum_values = result.get("data", {}).get("__type", {}).get("enumValues", [])
    
    for ev in enum_values:
        print(f"\n  {ev['name']}:")
        desc = ev.get('description', 'No description')
        print(f"    {desc[:80]}..." if len(desc) > 80 else f"    {desc}")
    
    # Introspect App type
    print("\n\n3. App Type Fields:")
    result = api.introspect_type("App")
    fields = result.get("data", {}).get("__type", {}).get("fields", [])
    
    for field in fields:
        print(f"  - {field['name']}: {field.get('description', 'No description')[:50]}...")


def demo_date_filtered_transactions(api: ShopifyPartnerAPI):
    """Demonstrate date-filtered transaction querying"""
    print("\n" + "="*60)
    print("DEMO: Date-Filtered Transactions (Last 30 Days)")
    print("="*60)
    
    try:
        # Get transactions from the last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        result = api.get_transactions(
            first=50,
            created_at_min=start_date,
            created_at_max=end_date
        )
        
        transactions = result["transactions"]
        print(f"\nFound {len(transactions)} transactions in the last 30 days")
        print(f"Date range: {start_date.date()} to {end_date.date()}")
        
        if transactions:
            summary = api.calculate_revenue_summary(transactions)
            
            print("\nRevenue by Currency:")
            for currency, total in summary["by_currency"].items():
                print(f"  {currency}: ${total:.2f}")
        
        return transactions
    
    except Exception as e:
        print(f"\n  Error: {e}")
        return []


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """Run all demos"""
    print("="*60)
    print("SHOPIFY PARTNER API DEMO")
    print("="*60)
    print(f"\nOrganization ID: {Config.ORGANIZATION_ID}")
    print(f"API Version: {Config.API_VERSION}")
    print(f"Endpoint: {Config.BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Initialize API client
    try:
        api = ShopifyPartnerAPI()
        print("\n✓ API client initialized successfully")
    except ValueError as e:
        print(f"\n✗ Failed to initialize API client: {e}")
        return
    
    # Run demos
    demo_api_versions(api)
    demo_schema_introspection(api)
    demo_transactions(api)
    demo_app_subscription_transactions(api)
    demo_date_filtered_transactions(api)
    
    # Final summary
    print("\n" + "="*60)
    print("DEMO COMPLETE")
    print("="*60)
    print("""
The Shopify Partner API provides access to:

1. API Versions
   - Query supported API versions
   - Check for release candidates

2. Transactions
   - App subscription sales
   - One-time app charges
   - Usage-based charges
   - Theme sales
   - Service sales
   - Referral commissions
   - Tax transactions

3. Apps
   - App details by ID
   - App events (installs, uninstalls)

4. Schema Introspection
   - Discover available types
   - Explore field definitions

For more information, visit:
https://shopify.dev/docs/api/partner/latest
""")


if __name__ == "__main__":
    main()
