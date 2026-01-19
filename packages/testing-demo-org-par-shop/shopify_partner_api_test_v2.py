#!/usr/bin/env python3
"""
Shopify Partner API Test Script v2
Tests various endpoints and demonstrates API capabilities
Based on actual schema introspection
"""

import os
import json
import requests
from datetime import datetime

# Configuration
ORGANIZATION_ID = "3604544"
API_VERSION = "2026-01"
BASE_URL = f"https://partners.shopify.com/{ORGANIZATION_ID}/api/{API_VERSION}/graphql.json"

# Get access token from environment
ACCESS_TOKEN = os.environ.get("SHOPIFY_PARTNER_CLIENT_API")

if not ACCESS_TOKEN:
    print("Error: SHOPIFY_PARTNER_CLIENT_API environment variable not set")
    exit(1)

# Headers for API requests
HEADERS = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": ACCESS_TOKEN
}

def execute_query(query, variables=None):
    """Execute a GraphQL query against the Partner API"""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    response = requests.post(BASE_URL, headers=HEADERS, json=payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.text}")
        return None

def test_full_introspection():
    """Full API introspection to discover all types and fields"""
    print("\n" + "="*60)
    print("TEST 1: Full API Introspection")
    print("="*60)
    
    query = """
    query IntrospectionQuery {
        __schema {
            types {
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
            }
        }
    }
    """
    
    result = execute_query(query)
    if result and 'data' in result:
        # Filter to show only relevant types
        types = result['data']['__schema']['types']
        relevant_types = [t for t in types if not t['name'].startswith('__') and t['fields']]
        print(f"\nFound {len(relevant_types)} types with fields")
        for t in relevant_types[:20]:  # Show first 20
            print(f"\n{t['name']} ({t['kind']}):")
            if t['fields']:
                for f in t['fields'][:5]:  # Show first 5 fields
                    print(f"  - {f['name']}: {f.get('description', 'No description')[:50]}...")
    return result

def test_api_versions():
    """Query available API versions"""
    print("\n" + "="*60)
    print("TEST 2: Query API Versions")
    print("="*60)
    
    query = """
    query GetApiVersions {
        publicApiVersions {
            handle
            displayName
            supported
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_transactions():
    """Query transactions with correct field structure"""
    print("\n" + "="*60)
    print("TEST 3: Query Transactions")
    print("="*60)
    
    query = """
    query GetTransactions {
        transactions(first: 20) {
            edges {
                cursor
                node {
                    id
                    createdAt
                    ... on AppSubscriptionSale {
                        app {
                            name
                            id
                        }
                        shop {
                            name
                            myshopifyDomain
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                        grossAmount {
                            amount
                            currencyCode
                        }
                        billingInterval
                    }
                    ... on AppOneTimeSale {
                        app {
                            name
                        }
                        shop {
                            name
                            myshopifyDomain
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on AppUsageSale {
                        app {
                            name
                        }
                        shop {
                            name
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on AppSaleAdjustment {
                        app {
                            name
                        }
                        shop {
                            name
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on AppSaleCredit {
                        app {
                            name
                        }
                        shop {
                            name
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on ReferralTransaction {
                        shop {
                            name
                            myshopifyDomain
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on ServiceSale {
                        shop {
                            name
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on ThemeSale {
                        theme {
                            name
                        }
                        shop {
                            name
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
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
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_app_by_id():
    """Query a specific app by ID"""
    print("\n" + "="*60)
    print("TEST 4: Query App Schema (Introspect App type)")
    print("="*60)
    
    # First, let's introspect the App type to see available fields
    query = """
    query IntrospectApp {
        __type(name: "App") {
            name
            fields {
                name
                description
                type {
                    name
                    kind
                }
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_transaction_types():
    """Introspect transaction types"""
    print("\n" + "="*60)
    print("TEST 5: Introspect Transaction Types")
    print("="*60)
    
    query = """
    query IntrospectTransactionTypes {
        __type(name: "Transaction") {
            name
            kind
            possibleTypes {
                name
                description
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_query_root():
    """Introspect QueryRoot to see all available queries"""
    print("\n" + "="*60)
    print("TEST 6: Introspect QueryRoot (All Available Queries)")
    print("="*60)
    
    query = """
    query IntrospectQueryRoot {
        __type(name: "QueryRoot") {
            name
            fields {
                name
                description
                args {
                    name
                    description
                    type {
                        name
                        kind
                        ofType {
                            name
                        }
                    }
                }
                type {
                    name
                    kind
                    ofType {
                        name
                    }
                }
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_transactions_with_types():
    """Query transactions filtered by type"""
    print("\n" + "="*60)
    print("TEST 7: Query Transactions with Type Filter")
    print("="*60)
    
    query = """
    query GetAppSubscriptionTransactions {
        transactions(first: 10, types: [APP_SUBSCRIPTION_SALE]) {
            edges {
                cursor
                node {
                    id
                    createdAt
                    ... on AppSubscriptionSale {
                        app {
                            name
                            id
                        }
                        shop {
                            name
                            myshopifyDomain
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                        grossAmount {
                            amount
                            currencyCode
                        }
                        billingInterval
                        chargeId
                    }
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_app_query_with_api_key():
    """Query app by API key"""
    print("\n" + "="*60)
    print("TEST 8: Query App by API Key (Schema Check)")
    print("="*60)
    
    # First check the app query arguments
    query = """
    query CheckAppQuery {
        __type(name: "QueryRoot") {
            fields(includeDeprecated: true) {
                name
                args {
                    name
                    type {
                        name
                        kind
                        ofType {
                            name
                        }
                    }
                }
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        # Find the app field
        fields = result.get('data', {}).get('__type', {}).get('fields', [])
        app_field = next((f for f in fields if f['name'] == 'app'), None)
        if app_field:
            print("App query arguments:")
            print(json.dumps(app_field, indent=2))
    return result

def test_referral_transactions():
    """Query referral transactions"""
    print("\n" + "="*60)
    print("TEST 9: Query Referral Transactions")
    print("="*60)
    
    query = """
    query GetReferralTransactions {
        transactions(first: 10, types: [REFERRAL_COMMISSION, REFERRAL_CREDIT]) {
            edges {
                cursor
                node {
                    id
                    createdAt
                    ... on ReferralTransaction {
                        shop {
                            name
                            myshopifyDomain
                        }
                        netAmount {
                            amount
                            currencyCode
                        }
                    }
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_all_transaction_types():
    """Query all types of transactions"""
    print("\n" + "="*60)
    print("TEST 10: Query All Transaction Types")
    print("="*60)
    
    query = """
    query GetAllTransactionTypes {
        transactions(first: 50) {
            edges {
                node {
                    id
                    createdAt
                    __typename
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
    """
    
    result = execute_query(query)
    if result and 'data' in result:
        # Count transaction types
        edges = result['data'].get('transactions', {}).get('edges', [])
        type_counts = {}
        for edge in edges:
            typename = edge['node'].get('__typename', 'Unknown')
            type_counts[typename] = type_counts.get(typename, 0) + 1
        
        print(f"\nTransaction Type Summary (from {len(edges)} transactions):")
        for typename, count in sorted(type_counts.items()):
            print(f"  {typename}: {count}")
        
        print("\nFull result:")
        print(json.dumps(result, indent=2))
    return result

def main():
    """Run all API tests"""
    print("="*60)
    print("SHOPIFY PARTNER API TEST SUITE v2")
    print(f"Organization ID: {ORGANIZATION_ID}")
    print(f"API Version: {API_VERSION}")
    print(f"Endpoint: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    # Run tests
    results = {}
    
    results['api_versions'] = test_api_versions()
    results['query_root'] = test_query_root()
    results['transaction_types'] = test_transaction_types()
    results['app_schema'] = test_app_by_id()
    results['transactions'] = test_transactions()
    results['app_subscription_transactions'] = test_transactions_with_types()
    results['referral_transactions'] = test_referral_transactions()
    results['all_transaction_types'] = test_all_transaction_types()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, result in results.items():
        if result is None:
            status = "✗ NO RESPONSE"
        elif 'errors' in result:
            status = "✗ ERRORS"
        elif 'data' in result:
            status = "✓ SUCCESS"
        else:
            status = "? UNKNOWN"
        print(f"{test_name}: {status}")
    
    # Save results to file
    with open('/home/ubuntu/partner_api_test_results_v2.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to /home/ubuntu/partner_api_test_results_v2.json")

if __name__ == "__main__":
    main()
