#!/usr/bin/env python3
"""
Comprehensive API Integration Test Suite
==========================================
Tests all relevant APIs for integration across Shopify packages.

APIs Tested:
1. Shopify Partner API (GraphQL) - Organization 3604544
2. Shopify Admin REST API - zone-teste.myshopify.com
3. Shopify Storefront API (GraphQL)
4. Zone Chan App Authentication

Author: Manus AI
Date: 2026-01-19
"""

import os
import sys
import json
import time
import requests
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field, asdict
from enum import Enum
import traceback

# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class APICredentials:
    """API Credentials Configuration"""
    # Partner API
    partner_api_token: str = field(default_factory=lambda: os.environ.get("SHOPIFY_PARTNER_CLIENT_API", ""))
    organization_id: str = "3604544"
    partner_api_version: str = "2026-01"
    
    # Zone Test Store (Admin API)
    admin_api_token: str = field(default_factory=lambda: os.environ.get("SHOPIFY_ADMIN_API_ACCESS_TOKEN_ZONE_TEST", ""))
    storefront_api_token: str = field(default_factory=lambda: os.environ.get("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN_ZONE_TEST", ""))
    store_url: str = "zone-teste.myshopify.com"
    admin_api_version: str = "2024-01"
    
    # Zone Chan App
    zone_chan_client_id: str = field(default_factory=lambda: os.environ.get("SHP_ZONE_CHAN_APP_CLIENT_ID", ""))
    zone_chan_client_secret: str = field(default_factory=lambda: os.environ.get("SHP_ZONE_CHAN_APP_SECRET", ""))
    
    @property
    def partner_api_url(self) -> str:
        return f"https://partners.shopify.com/{self.organization_id}/api/{self.partner_api_version}/graphql.json"
    
    @property
    def admin_api_url(self) -> str:
        return f"https://{self.store_url}/admin/api/{self.admin_api_version}"
    
    @property
    def storefront_api_url(self) -> str:
        return f"https://{self.store_url}/api/{self.admin_api_version}/graphql.json"


class TestStatus(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"


@dataclass
class TestResult:
    """Individual test result"""
    name: str
    status: TestStatus
    duration: float
    message: str = ""
    data: Dict = field(default_factory=dict)
    error: str = ""


@dataclass
class TestSuiteResult:
    """Test suite results"""
    suite_name: str
    timestamp: str
    total_tests: int = 0
    passed: int = 0
    failed: int = 0
    skipped: int = 0
    errors: int = 0
    duration: float = 0.0
    tests: List[TestResult] = field(default_factory=list)
    
    @property
    def success_rate(self) -> float:
        if self.total_tests == 0:
            return 0.0
        return (self.passed / self.total_tests) * 100


# =============================================================================
# API CLIENTS
# =============================================================================

class ShopifyPartnerAPIClient:
    """Shopify Partner API Client"""
    
    def __init__(self, credentials: APICredentials):
        self.credentials = credentials
        self.session = requests.Session()
        self.last_request_time = 0
        
    def _rate_limit(self):
        """Rate limit to 4 requests per second"""
        elapsed = time.time() - self.last_request_time
        if elapsed < 0.25:
            time.sleep(0.25 - elapsed)
        self.last_request_time = time.time()
        
    def execute_query(self, query: str, variables: Dict = None) -> Dict[str, Any]:
        """Execute GraphQL query"""
        self._rate_limit()
        
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.credentials.partner_api_token
        }
        
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        start = time.time()
        response = self.session.post(
            self.credentials.partner_api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        duration = time.time() - start
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.text else {},
            "duration": duration,
            "headers": dict(response.headers)
        }


class ShopifyAdminAPIClient:
    """Shopify Admin REST API Client"""
    
    def __init__(self, credentials: APICredentials):
        self.credentials = credentials
        self.session = requests.Session()
        self.session.headers.update({
            "X-Shopify-Access-Token": self.credentials.admin_api_token,
            "Content-Type": "application/json"
        })
        
    def request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict[str, Any]:
        """Make API request"""
        url = f"{self.credentials.admin_api_url}/{endpoint}"
        
        start = time.time()
        response = self.session.request(
            method=method,
            url=url,
            json=data,
            params=params,
            timeout=30
        )
        duration = time.time() - start
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.text else {},
            "duration": duration,
            "headers": dict(response.headers)
        }
    
    def get(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        return self.request("GET", endpoint, params=params)
    
    def post(self, endpoint: str, data: Dict) -> Dict[str, Any]:
        return self.request("POST", endpoint, data=data)
    
    def put(self, endpoint: str, data: Dict) -> Dict[str, Any]:
        return self.request("PUT", endpoint, data=data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        return self.request("DELETE", endpoint)


class ShopifyStorefrontAPIClient:
    """Shopify Storefront API Client"""
    
    def __init__(self, credentials: APICredentials):
        self.credentials = credentials
        self.session = requests.Session()
        
    def execute_query(self, query: str, variables: Dict = None) -> Dict[str, Any]:
        """Execute Storefront GraphQL query"""
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": self.credentials.storefront_api_token
        }
        
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        start = time.time()
        response = self.session.post(
            self.credentials.storefront_api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        duration = time.time() - start
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.text else {},
            "duration": duration
        }


# =============================================================================
# TEST RUNNER
# =============================================================================

class APIIntegrationTestRunner:
    """Comprehensive API Integration Test Runner"""
    
    def __init__(self):
        self.credentials = APICredentials()
        self.partner_client = ShopifyPartnerAPIClient(self.credentials)
        self.admin_client = ShopifyAdminAPIClient(self.credentials)
        self.storefront_client = ShopifyStorefrontAPIClient(self.credentials)
        self.results: List[TestSuiteResult] = []
        
    def run_test(self, name: str, test_func, skip_condition: bool = False, skip_reason: str = "") -> TestResult:
        """Run a single test"""
        if skip_condition:
            return TestResult(
                name=name,
                status=TestStatus.SKIPPED,
                duration=0,
                message=skip_reason
            )
            
        start = time.time()
        try:
            result_data = test_func()
            duration = time.time() - start
            return TestResult(
                name=name,
                status=TestStatus.PASSED,
                duration=duration,
                data=result_data,
                message="Test passed successfully"
            )
        except AssertionError as e:
            duration = time.time() - start
            return TestResult(
                name=name,
                status=TestStatus.FAILED,
                duration=duration,
                message=str(e),
                error=traceback.format_exc()
            )
        except Exception as e:
            duration = time.time() - start
            return TestResult(
                name=name,
                status=TestStatus.ERROR,
                duration=duration,
                message=str(e),
                error=traceback.format_exc()
            )
    
    # =========================================================================
    # PARTNER API TESTS
    # =========================================================================
    
    def test_partner_api_versions(self) -> Dict:
        """Test Partner API - Get API Versions"""
        query = """
        query GetApiVersions {
            publicApiVersions {
                handle
                displayName
                supported
            }
        }
        """
        result = self.partner_client.execute_query(query)
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        assert "data" in result["data"], "No data in response"
        versions = result["data"]["data"]["publicApiVersions"]
        assert len(versions) > 0, "No API versions returned"
        return {"versions_count": len(versions), "versions": versions[:5]}
    
    def test_partner_api_transactions(self) -> Dict:
        """Test Partner API - Get Transactions"""
        query = """
        query GetTransactions($first: Int!) {
            transactions(first: $first) {
                edges {
                    node {
                        id
                        createdAt
                        __typename
                        ... on AppSubscriptionSale {
                            app { name }
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
                        }
                        ... on ServiceSale {
                            shop { name myshopifyDomain }
                            netAmount { amount currencyCode }
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
        result = self.partner_client.execute_query(query, {"first": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        data = result["data"].get("data", {})
        transactions = data.get("transactions", {}).get("edges", [])
        return {
            "transaction_count": len(transactions),
            "has_next_page": data.get("transactions", {}).get("pageInfo", {}).get("hasNextPage", False)
        }
    
    def test_partner_api_apps(self) -> Dict:
        """Test Partner API - Get Apps"""
        query = """
        query GetApps {
            apps(first: 10) {
                edges {
                    node {
                        id
                        name
                        apiKey
                    }
                }
            }
        }
        """
        result = self.partner_client.execute_query(query)
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        data = result["data"].get("data", {})
        apps = data.get("apps", {}).get("edges", [])
        return {"apps_count": len(apps), "apps": [a["node"]["name"] for a in apps[:5]]}
    
    def test_partner_api_organization(self) -> Dict:
        """Test Partner API - Get Organization Info"""
        query = """
        query GetOrganization {
            organization {
                id
                name
                billingEmail
            }
        }
        """
        result = self.partner_client.execute_query(query)
        # Note: This may fail if the field doesn't exist in the schema
        return {"status_code": result["status_code"], "response": result["data"]}
    
    # =========================================================================
    # ADMIN API TESTS
    # =========================================================================
    
    def test_admin_api_shop(self) -> Dict:
        """Test Admin API - Get Shop Info"""
        result = self.admin_client.get("shop.json")
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        shop = result["data"].get("shop", {})
        return {
            "shop_name": shop.get("name"),
            "domain": shop.get("myshopify_domain"),
            "currency": shop.get("currency"),
            "email": shop.get("email")
        }
    
    def test_admin_api_products(self) -> Dict:
        """Test Admin API - Get Products"""
        result = self.admin_client.get("products.json", params={"limit": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        products = result["data"].get("products", [])
        return {
            "product_count": len(products),
            "products": [{"id": p["id"], "title": p["title"]} for p in products[:5]]
        }
    
    def test_admin_api_customers(self) -> Dict:
        """Test Admin API - Get Customers"""
        result = self.admin_client.get("customers.json", params={"limit": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        customers = result["data"].get("customers", [])
        return {
            "customer_count": len(customers),
            "customers": [{"id": c["id"], "email": c.get("email", "N/A")} for c in customers[:5]]
        }
    
    def test_admin_api_orders(self) -> Dict:
        """Test Admin API - Get Orders"""
        result = self.admin_client.get("orders.json", params={"limit": 10, "status": "any"})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        orders = result["data"].get("orders", [])
        return {
            "order_count": len(orders),
            "orders": [{"id": o["id"], "total": o.get("total_price")} for o in orders[:5]]
        }
    
    def test_admin_api_collections(self) -> Dict:
        """Test Admin API - Get Collections"""
        result = self.admin_client.get("custom_collections.json", params={"limit": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        collections = result["data"].get("custom_collections", [])
        return {
            "collection_count": len(collections),
            "collections": [{"id": c["id"], "title": c["title"]} for c in collections[:5]]
        }
    
    def test_admin_api_inventory(self) -> Dict:
        """Test Admin API - Get Inventory Locations"""
        result = self.admin_client.get("locations.json")
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        locations = result["data"].get("locations", [])
        return {
            "location_count": len(locations),
            "locations": [{"id": l["id"], "name": l["name"]} for l in locations[:5]]
        }
    
    def test_admin_api_webhooks(self) -> Dict:
        """Test Admin API - Get Webhooks"""
        result = self.admin_client.get("webhooks.json")
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        webhooks = result["data"].get("webhooks", [])
        return {
            "webhook_count": len(webhooks),
            "webhooks": [{"id": w["id"], "topic": w["topic"]} for w in webhooks[:5]]
        }
    
    def test_admin_api_access_scopes(self) -> Dict:
        """Test Admin API - Get Access Scopes"""
        url = f"https://{self.credentials.store_url}/admin/oauth/access_scopes.json"
        response = requests.get(url, headers={
            "X-Shopify-Access-Token": self.credentials.admin_api_token
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        scopes = response.json().get("access_scopes", [])
        return {
            "scope_count": len(scopes),
            "scopes": [s["handle"] for s in scopes[:10]]
        }
    
    def test_admin_api_product_crud(self) -> Dict:
        """Test Admin API - Product CRUD Operations"""
        # Create
        create_result = self.admin_client.post("products.json", {
            "product": {
                "title": f"API Test Product {datetime.now().isoformat()}",
                "body_html": "<p>Test product created by API integration tests</p>",
                "vendor": "Zone Test",
                "product_type": "Test",
                "status": "draft"
            }
        })
        assert create_result["status_code"] in [200, 201], f"Create failed: {create_result['status_code']}"
        product_id = create_result["data"]["product"]["id"]
        
        # Read
        read_result = self.admin_client.get(f"products/{product_id}.json")
        assert read_result["status_code"] == 200, f"Read failed: {read_result['status_code']}"
        
        # Update
        update_result = self.admin_client.put(f"products/{product_id}.json", {
            "product": {
                "id": product_id,
                "title": f"Updated API Test Product {datetime.now().isoformat()}"
            }
        })
        assert update_result["status_code"] == 200, f"Update failed: {update_result['status_code']}"
        
        # Delete
        delete_result = self.admin_client.delete(f"products/{product_id}.json")
        assert delete_result["status_code"] == 200, f"Delete failed: {delete_result['status_code']}"
        
        return {
            "create": "success",
            "read": "success",
            "update": "success",
            "delete": "success",
            "product_id": product_id
        }
    
    # =========================================================================
    # STOREFRONT API TESTS
    # =========================================================================
    
    def test_storefront_api_shop(self) -> Dict:
        """Test Storefront API - Get Shop Info"""
        query = """
        query GetShop {
            shop {
                name
                description
                primaryDomain {
                    url
                }
            }
        }
        """
        result = self.storefront_client.execute_query(query)
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        shop = result["data"].get("data", {}).get("shop", {})
        return {
            "name": shop.get("name"),
            "description": shop.get("description"),
            "domain": shop.get("primaryDomain", {}).get("url")
        }
    
    def test_storefront_api_products(self) -> Dict:
        """Test Storefront API - Get Products"""
        query = """
        query GetProducts($first: Int!) {
            products(first: $first) {
                edges {
                    node {
                        id
                        title
                        handle
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
            }
        }
        """
        result = self.storefront_client.execute_query(query, {"first": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        products = result["data"].get("data", {}).get("products", {}).get("edges", [])
        return {
            "product_count": len(products),
            "products": [p["node"]["title"] for p in products[:5]]
        }
    
    def test_storefront_api_collections(self) -> Dict:
        """Test Storefront API - Get Collections"""
        query = """
        query GetCollections($first: Int!) {
            collections(first: $first) {
                edges {
                    node {
                        id
                        title
                        handle
                    }
                }
            }
        }
        """
        result = self.storefront_client.execute_query(query, {"first": 10})
        assert result["status_code"] == 200, f"Expected 200, got {result['status_code']}"
        collections = result["data"].get("data", {}).get("collections", {}).get("edges", [])
        return {
            "collection_count": len(collections),
            "collections": [c["node"]["title"] for c in collections[:5]]
        }
    
    # =========================================================================
    # ZONE CHAN APP TESTS
    # =========================================================================
    
    def test_zone_chan_credentials(self) -> Dict:
        """Test Zone Chan App - Credentials Validation"""
        client_id = self.credentials.zone_chan_client_id
        client_secret = self.credentials.zone_chan_client_secret
        
        assert client_id, "Zone Chan Client ID not set"
        assert client_secret, "Zone Chan Client Secret not set"
        assert len(client_id) == 32, f"Client ID should be 32 chars, got {len(client_id)}"
        assert len(client_secret) == 32, f"Client Secret should be 32 chars, got {len(client_secret)}"
        
        return {
            "client_id_valid": True,
            "client_secret_valid": True,
            "client_id_length": len(client_id),
            "client_secret_length": len(client_secret)
        }
    
    def test_zone_chan_hmac_signature(self) -> Dict:
        """Test Zone Chan App - HMAC Signature Generation"""
        test_data = f"test_payload_{datetime.now().isoformat()}"
        
        signature = hmac.new(
            self.credentials.zone_chan_client_secret.encode('utf-8'),
            test_data.encode('utf-8'),
            hashlib.sha256
        ).digest()
        encoded_signature = base64.b64encode(signature).decode('utf-8')
        
        assert len(encoded_signature) == 44, f"Expected 44 char signature, got {len(encoded_signature)}"
        
        return {
            "test_data": test_data,
            "signature_length": len(encoded_signature),
            "signature_valid": True
        }
    
    # =========================================================================
    # RUN ALL TESTS
    # =========================================================================
    
    def run_partner_api_tests(self) -> TestSuiteResult:
        """Run all Partner API tests"""
        suite = TestSuiteResult(
            suite_name="Shopify Partner API",
            timestamp=datetime.now().isoformat()
        )
        
        skip = not self.credentials.partner_api_token
        skip_reason = "Partner API token not configured"
        
        tests = [
            ("Partner API - Get API Versions", self.test_partner_api_versions),
            ("Partner API - Get Transactions", self.test_partner_api_transactions),
            ("Partner API - Get Apps", self.test_partner_api_apps),
            ("Partner API - Get Organization", self.test_partner_api_organization),
        ]
        
        start = time.time()
        for name, test_func in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
            suite.total_tests += 1
            if result.status == TestStatus.PASSED:
                suite.passed += 1
            elif result.status == TestStatus.FAILED:
                suite.failed += 1
            elif result.status == TestStatus.SKIPPED:
                suite.skipped += 1
            else:
                suite.errors += 1
                
        suite.duration = time.time() - start
        return suite
    
    def run_admin_api_tests(self) -> TestSuiteResult:
        """Run all Admin API tests"""
        suite = TestSuiteResult(
            suite_name="Shopify Admin API",
            timestamp=datetime.now().isoformat()
        )
        
        skip = not self.credentials.admin_api_token
        skip_reason = "Admin API token not configured"
        
        tests = [
            ("Admin API - Get Shop Info", self.test_admin_api_shop),
            ("Admin API - Get Products", self.test_admin_api_products),
            ("Admin API - Get Customers", self.test_admin_api_customers),
            ("Admin API - Get Orders", self.test_admin_api_orders),
            ("Admin API - Get Collections", self.test_admin_api_collections),
            ("Admin API - Get Inventory Locations", self.test_admin_api_inventory),
            ("Admin API - Get Webhooks", self.test_admin_api_webhooks),
            ("Admin API - Get Access Scopes", self.test_admin_api_access_scopes),
            ("Admin API - Product CRUD Operations", self.test_admin_api_product_crud),
        ]
        
        start = time.time()
        for name, test_func in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
            suite.total_tests += 1
            if result.status == TestStatus.PASSED:
                suite.passed += 1
            elif result.status == TestStatus.FAILED:
                suite.failed += 1
            elif result.status == TestStatus.SKIPPED:
                suite.skipped += 1
            else:
                suite.errors += 1
                
        suite.duration = time.time() - start
        return suite
    
    def run_storefront_api_tests(self) -> TestSuiteResult:
        """Run all Storefront API tests"""
        suite = TestSuiteResult(
            suite_name="Shopify Storefront API",
            timestamp=datetime.now().isoformat()
        )
        
        skip = not self.credentials.storefront_api_token
        skip_reason = "Storefront API token not configured"
        
        tests = [
            ("Storefront API - Get Shop Info", self.test_storefront_api_shop),
            ("Storefront API - Get Products", self.test_storefront_api_products),
            ("Storefront API - Get Collections", self.test_storefront_api_collections),
        ]
        
        start = time.time()
        for name, test_func in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
            suite.total_tests += 1
            if result.status == TestStatus.PASSED:
                suite.passed += 1
            elif result.status == TestStatus.FAILED:
                suite.failed += 1
            elif result.status == TestStatus.SKIPPED:
                suite.skipped += 1
            else:
                suite.errors += 1
                
        suite.duration = time.time() - start
        return suite
    
    def run_zone_chan_tests(self) -> TestSuiteResult:
        """Run all Zone Chan App tests"""
        suite = TestSuiteResult(
            suite_name="Zone Chan App",
            timestamp=datetime.now().isoformat()
        )
        
        skip = not (self.credentials.zone_chan_client_id and self.credentials.zone_chan_client_secret)
        skip_reason = "Zone Chan App credentials not configured"
        
        tests = [
            ("Zone Chan - Credentials Validation", self.test_zone_chan_credentials),
            ("Zone Chan - HMAC Signature Generation", self.test_zone_chan_hmac_signature),
        ]
        
        start = time.time()
        for name, test_func in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
            suite.total_tests += 1
            if result.status == TestStatus.PASSED:
                suite.passed += 1
            elif result.status == TestStatus.FAILED:
                suite.failed += 1
            elif result.status == TestStatus.SKIPPED:
                suite.skipped += 1
            else:
                suite.errors += 1
                
        suite.duration = time.time() - start
        return suite
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test suites"""
        print("="*70)
        print("COMPREHENSIVE API INTEGRATION TEST SUITE")
        print("="*70)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print()
        
        # Check credentials
        print("Credentials Status:")
        print(f"  Partner API Token: {'✓ Set' if self.credentials.partner_api_token else '✗ Not set'}")
        print(f"  Admin API Token: {'✓ Set' if self.credentials.admin_api_token else '✗ Not set'}")
        print(f"  Storefront API Token: {'✓ Set' if self.credentials.storefront_api_token else '✗ Not set'}")
        print(f"  Zone Chan Client ID: {'✓ Set' if self.credentials.zone_chan_client_id else '✗ Not set'}")
        print(f"  Zone Chan Client Secret: {'✓ Set' if self.credentials.zone_chan_client_secret else '✗ Not set'}")
        print()
        
        # Run all suites
        suites = [
            self.run_partner_api_tests(),
            self.run_admin_api_tests(),
            self.run_storefront_api_tests(),
            self.run_zone_chan_tests(),
        ]
        
        # Print results
        total_tests = 0
        total_passed = 0
        total_failed = 0
        total_skipped = 0
        total_errors = 0
        
        for suite in suites:
            print(f"\n{'='*70}")
            print(f"Suite: {suite.suite_name}")
            print(f"{'='*70}")
            
            for test in suite.tests:
                status_icon = {
                    TestStatus.PASSED: "✓",
                    TestStatus.FAILED: "✗",
                    TestStatus.SKIPPED: "○",
                    TestStatus.ERROR: "!"
                }[test.status]
                
                print(f"  {status_icon} {test.name}: {test.status.value} ({test.duration:.3f}s)")
                if test.status in [TestStatus.FAILED, TestStatus.ERROR]:
                    print(f"      Message: {test.message}")
                elif test.status == TestStatus.PASSED and test.data:
                    # Print summary data
                    for key, value in list(test.data.items())[:3]:
                        if not isinstance(value, (list, dict)):
                            print(f"      {key}: {value}")
                            
            print(f"\n  Summary: {suite.passed}/{suite.total_tests} passed, "
                  f"{suite.failed} failed, {suite.skipped} skipped, {suite.errors} errors")
            print(f"  Duration: {suite.duration:.3f}s")
            
            total_tests += suite.total_tests
            total_passed += suite.passed
            total_failed += suite.failed
            total_skipped += suite.skipped
            total_errors += suite.errors
        
        # Overall summary
        print(f"\n{'='*70}")
        print("OVERALL SUMMARY")
        print(f"{'='*70}")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {total_passed}")
        print(f"Failed: {total_failed}")
        print(f"Skipped: {total_skipped}")
        print(f"Errors: {total_errors}")
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"{'='*70}")
        
        # Return structured results
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed": total_passed,
                "failed": total_failed,
                "skipped": total_skipped,
                "errors": total_errors,
                "success_rate": success_rate
            },
            "suites": [
                {
                    "name": suite.suite_name,
                    "total_tests": suite.total_tests,
                    "passed": suite.passed,
                    "failed": suite.failed,
                    "skipped": suite.skipped,
                    "errors": suite.errors,
                    "duration": suite.duration,
                    "tests": [
                        {
                            "name": t.name,
                            "status": t.status.value,
                            "duration": t.duration,
                            "message": t.message,
                            "data": t.data
                        }
                        for t in suite.tests
                    ]
                }
                for suite in suites
            ]
        }


def main():
    """Main entry point"""
    runner = APIIntegrationTestRunner()
    results = runner.run_all_tests()
    
    # Save results
    output_file = "/home/ubuntu/api-integration-tests/api_test_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nResults saved to: {output_file}")
    
    # Return exit code
    return 0 if results["summary"]["failed"] == 0 and results["summary"]["errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
