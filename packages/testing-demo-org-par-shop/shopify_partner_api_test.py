#!/usr/bin/env python3
"""
Shopify Partner API Test Script
Tests various endpoints and demonstrates API capabilities
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

def test_introspection():
    """Test API introspection to discover available types"""
    print("\n" + "="*60)
    print("TEST 1: API Introspection - Discover Available Types")
    print("="*60)
    
    query = """
    query IntrospectionQuery {
        __schema {
            queryType {
                name
                fields {
                    name
                    description
                }
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_apps_query():
    """Query apps managed by the organization"""
    print("\n" + "="*60)
    print("TEST 2: Query Apps")
    print("="*60)
    
    query = """
    query GetApps {
        apps(first: 10) {
            edges {
                node {
                    id
                    name
                    apiKey
                    createdAt
                    publiclyAvailable
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_transactions_query():
    """Query transactions (financial data)"""
    print("\n" + "="*60)
    print("TEST 3: Query Transactions")
    print("="*60)
    
    query = """
    query GetTransactions {
        transactions(first: 10) {
            edges {
                node {
                    id
                    createdAt
                    ... on AppSubscriptionSale {
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
                        grossAmount {
                            amount
                            currencyCode
                        }
                    }
                    ... on AppOneTimeSale {
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
                    ... on ServiceSale {
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
                endCursor
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_app_events_query():
    """Query app installation events"""
    print("\n" + "="*60)
    print("TEST 4: Query App Events (Installs/Uninstalls)")
    print("="*60)
    
    query = """
    query GetAppEvents {
        apps(first: 5) {
            edges {
                node {
                    name
                    events(first: 5) {
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
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_app_details():
    """Query detailed app information"""
    print("\n" + "="*60)
    print("TEST 5: Query App Details")
    print("="*60)
    
    query = """
    query GetAppDetails {
        apps(first: 5) {
            edges {
                node {
                    id
                    name
                    apiKey
                    createdAt
                    publiclyAvailable
                    activeInstallationCount
                    installationCount
                    pendingInstallationCount
                }
            }
        }
    }
    """
    
    result = execute_query(query)
    if result:
        print(json.dumps(result, indent=2))
    return result

def test_conversations_query():
    """Query Experts Marketplace conversations"""
    print("\n" + "="*60)
    print("TEST 6: Query Conversations (Experts Marketplace)")
    print("="*60)
    
    query = """
    query GetConversations {
        conversations(first: 5) {
            edges {
                node {
                    id
                    status
                    createdAt
                    merchantUser {
                        name
                        email
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

def test_themes_query():
    """Query themes managed by the organization"""
    print("\n" + "="*60)
    print("TEST 7: Query Themes")
    print("="*60)
    
    query = """
    query GetThemes {
        themes(first: 10) {
            edges {
                node {
                    id
                    name
                    createdAt
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

def test_organization_info():
    """Query organization information"""
    print("\n" + "="*60)
    print("TEST 8: Query Organization Info")
    print("="*60)
    
    query = """
    query GetOrganizationInfo {
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

def main():
    """Run all API tests"""
    print("="*60)
    print("SHOPIFY PARTNER API TEST SUITE")
    print(f"Organization ID: {ORGANIZATION_ID}")
    print(f"API Version: {API_VERSION}")
    print(f"Endpoint: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    # Run tests
    results = {}
    
    results['introspection'] = test_introspection()
    results['apps'] = test_apps_query()
    results['transactions'] = test_transactions_query()
    results['app_events'] = test_app_events_query()
    results['app_details'] = test_app_details()
    results['conversations'] = test_conversations_query()
    results['themes'] = test_themes_query()
    results['api_versions'] = test_organization_info()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, result in results.items():
        status = "✓ SUCCESS" if result and 'errors' not in result else "✗ FAILED/ERROR"
        print(f"{test_name}: {status}")
    
    # Save results to file
    with open('/home/ubuntu/partner_api_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to /home/ubuntu/partner_api_test_results.json")

if __name__ == "__main__":
    main()
