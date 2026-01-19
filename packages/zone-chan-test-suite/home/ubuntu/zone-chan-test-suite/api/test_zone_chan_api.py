#!/usr/bin/env python3
"""
Zone Chan App API Test Suite
=============================
Comprehensive API tests using Zone Chan App credentials for Shopify Partner API integration.

This test suite validates:
- Authentication and authorization flows
- GraphQL API endpoints
- Transaction queries
- App management operations
- Rate limiting compliance
- Error handling

Author: Manus AI
Environment Variables Required:
- SHP_ZONE_CHAN_APP_CLIENT_ID
- SHP_ZONE_CHAN_APP_SECRET
- SHOPIFY_PARTNER_CLIENT_API (optional, for Partner API tests)
"""

import os
import sys
import json
import time
import unittest
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import hashlib
import hmac
import base64


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class ZoneChanConfig:
    """Zone Chan App Configuration"""
    CLIENT_ID: str = os.environ.get("SHP_ZONE_CHAN_APP_CLIENT_ID", "")
    CLIENT_SECRET: str = os.environ.get("SHP_ZONE_CHAN_APP_SECRET", "")
    PARTNER_API_TOKEN: str = os.environ.get("SHOPIFY_PARTNER_CLIENT_API", "")
    ORGANIZATION_ID: str = "3604544"
    API_VERSION: str = "2026-01"
    
    @property
    def partner_api_url(self) -> str:
        return f"https://partners.shopify.com/{self.ORGANIZATION_ID}/api/{self.API_VERSION}/graphql.json"
    
    def validate(self) -> bool:
        """Validate required credentials are present"""
        return bool(self.CLIENT_ID and self.CLIENT_SECRET)


class TestResult(Enum):
    """Test result status"""
    PASSED = "PASSED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"


# =============================================================================
# API CLIENT
# =============================================================================

class ZoneChanAPIClient:
    """
    Zone Chan App API Client for testing
    
    Provides methods to test authentication, API calls, and error handling.
    """
    
    def __init__(self, config: ZoneChanConfig):
        self.config = config
        self.session = requests.Session()
        self.request_count = 0
        self.last_request_time = 0
        
    def _rate_limit(self):
        """Implement rate limiting (4 requests per second)"""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < 0.25:  # 250ms between requests
            time.sleep(0.25 - elapsed)
        self.last_request_time = time.time()
        self.request_count += 1
        
    def generate_hmac_signature(self, data: str) -> str:
        """Generate HMAC signature for request verification"""
        signature = hmac.new(
            self.config.CLIENT_SECRET.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).digest()
        return base64.b64encode(signature).decode('utf-8')
    
    def execute_graphql(self, query: str, variables: Dict = None) -> Dict[str, Any]:
        """Execute a GraphQL query against the Partner API"""
        if not self.config.PARTNER_API_TOKEN:
            raise ValueError("Partner API token not configured")
            
        self._rate_limit()
        
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.config.PARTNER_API_TOKEN
        }
        
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        response = self.session.post(
            self.config.partner_api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.status_code == 200 else None,
            "headers": dict(response.headers),
            "elapsed": response.elapsed.total_seconds()
        }
    
    def test_oauth_flow(self) -> Dict[str, Any]:
        """Test OAuth authentication flow"""
        # Simulate OAuth state generation
        state = hashlib.sha256(
            f"{self.config.CLIENT_ID}:{time.time()}".encode()
        ).hexdigest()[:16]
        
        return {
            "client_id_valid": bool(self.config.CLIENT_ID),
            "client_secret_valid": bool(self.config.CLIENT_SECRET),
            "state_generated": state,
            "hmac_signature": self.generate_hmac_signature(state)
        }


# =============================================================================
# TEST CASES
# =============================================================================

class TestZoneChanAuthentication(unittest.TestCase):
    """Test authentication and authorization"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = ZoneChanConfig()
        cls.client = ZoneChanAPIClient(cls.config)
        
    def test_credentials_present(self):
        """Test that Zone Chan App credentials are configured"""
        self.assertTrue(
            self.config.CLIENT_ID,
            "SHP_ZONE_CHAN_APP_CLIENT_ID not set"
        )
        self.assertTrue(
            self.config.CLIENT_SECRET,
            "SHP_ZONE_CHAN_APP_SECRET not set"
        )
        
    def test_client_id_format(self):
        """Test Client ID format is valid"""
        # Shopify Client IDs are typically 32 character hex strings
        self.assertEqual(
            len(self.config.CLIENT_ID), 32,
            "Client ID should be 32 characters"
        )
        self.assertTrue(
            all(c in '0123456789abcdef' for c in self.config.CLIENT_ID),
            "Client ID should be hexadecimal"
        )
        
    def test_client_secret_format(self):
        """Test Client Secret format is valid"""
        self.assertEqual(
            len(self.config.CLIENT_SECRET), 32,
            "Client Secret should be 32 characters"
        )
        
    def test_hmac_signature_generation(self):
        """Test HMAC signature generation"""
        test_data = "test_payload_12345"
        signature = self.client.generate_hmac_signature(test_data)
        
        self.assertIsNotNone(signature)
        self.assertIsInstance(signature, str)
        # Base64 encoded SHA256 should be 44 characters
        self.assertEqual(len(signature), 44)
        
    def test_oauth_flow_simulation(self):
        """Test OAuth flow state generation"""
        result = self.client.test_oauth_flow()
        
        self.assertTrue(result["client_id_valid"])
        self.assertTrue(result["client_secret_valid"])
        self.assertEqual(len(result["state_generated"]), 16)
        self.assertIsNotNone(result["hmac_signature"])


class TestZoneChanAPIEndpoints(unittest.TestCase):
    """Test API endpoint functionality"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = ZoneChanConfig()
        cls.client = ZoneChanAPIClient(cls.config)
        
    @unittest.skipUnless(
        os.environ.get("SHOPIFY_PARTNER_CLIENT_API"),
        "Partner API token not configured"
    )
    def test_api_versions_query(self):
        """Test querying available API versions"""
        query = """
        query GetApiVersions {
            publicApiVersions {
                handle
                displayName
                supported
            }
        }
        """
        
        result = self.client.execute_graphql(query)
        
        self.assertEqual(result["status_code"], 200)
        self.assertIn("data", result["data"])
        versions = result["data"]["data"]["publicApiVersions"]
        self.assertIsInstance(versions, list)
        self.assertGreater(len(versions), 0)
        
    @unittest.skipUnless(
        os.environ.get("SHOPIFY_PARTNER_CLIENT_API"),
        "Partner API token not configured"
    )
    def test_transactions_query(self):
        """Test querying transactions"""
        query = """
        query GetTransactions($first: Int!) {
            transactions(first: $first) {
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
        
        result = self.client.execute_graphql(query, {"first": 5})
        
        self.assertEqual(result["status_code"], 200)
        self.assertIn("data", result["data"])
        
    @unittest.skipUnless(
        os.environ.get("SHOPIFY_PARTNER_CLIENT_API"),
        "Partner API token not configured"
    )
    def test_rate_limiting(self):
        """Test rate limiting compliance"""
        query = """
        query GetApiVersions {
            publicApiVersions {
                handle
            }
        }
        """
        
        start_time = time.time()
        request_times = []
        
        # Make 4 requests (should take at least 0.75 seconds with rate limiting)
        for _ in range(4):
            self.client.execute_graphql(query)
            request_times.append(time.time() - start_time)
            
        elapsed = time.time() - start_time
        
        # With 250ms between requests, 4 requests should take ~0.75s
        self.assertGreaterEqual(elapsed, 0.5, "Rate limiting not working properly")


class TestZoneChanErrorHandling(unittest.TestCase):
    """Test error handling scenarios"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = ZoneChanConfig()
        cls.client = ZoneChanAPIClient(cls.config)
        
    def test_invalid_query_handling(self):
        """Test handling of invalid GraphQL queries"""
        if not self.config.PARTNER_API_TOKEN:
            self.skipTest("Partner API token not configured")
            
        invalid_query = "{ invalid_field_that_does_not_exist }"
        
        result = self.client.execute_graphql(invalid_query)
        
        # Should still return 200 but with errors in response
        self.assertEqual(result["status_code"], 200)
        if result["data"]:
            self.assertIn("errors", result["data"])
            
    def test_missing_token_handling(self):
        """Test handling when API token is missing"""
        # Create client without token
        config = ZoneChanConfig()
        config.PARTNER_API_TOKEN = ""
        client = ZoneChanAPIClient(config)
        
        with self.assertRaises(ValueError):
            client.execute_graphql("{ test }")


class TestZoneChanIntegration(unittest.TestCase):
    """Integration tests for Zone Chan App"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = ZoneChanConfig()
        cls.client = ZoneChanAPIClient(cls.config)
        cls.results = []
        
    def test_full_authentication_flow(self):
        """Test complete authentication flow"""
        # Step 1: Validate credentials
        self.assertTrue(self.config.validate())
        
        # Step 2: Generate OAuth state
        oauth_result = self.client.test_oauth_flow()
        self.assertTrue(oauth_result["client_id_valid"])
        
        # Step 3: Verify HMAC
        signature = self.client.generate_hmac_signature("test")
        self.assertIsNotNone(signature)
        
        self.results.append({
            "test": "full_authentication_flow",
            "status": TestResult.PASSED.value
        })
        
    @unittest.skipUnless(
        os.environ.get("SHOPIFY_PARTNER_CLIENT_API"),
        "Partner API token not configured"
    )
    def test_api_introspection(self):
        """Test API schema introspection"""
        query = """
        query IntrospectionQuery {
            __schema {
                queryType {
                    name
                }
                types {
                    name
                    kind
                }
            }
        }
        """
        
        result = self.client.execute_graphql(query)
        
        self.assertEqual(result["status_code"], 200)
        self.assertIn("data", result["data"])
        
        schema = result["data"]["data"]["__schema"]
        self.assertIsNotNone(schema["queryType"])
        self.assertGreater(len(schema["types"]), 0)
        
        self.results.append({
            "test": "api_introspection",
            "status": TestResult.PASSED.value,
            "type_count": len(schema["types"])
        })
        
    @classmethod
    def tearDownClass(cls):
        """Output test results summary"""
        print("\n" + "="*60)
        print("Zone Chan API Integration Test Results")
        print("="*60)
        for result in cls.results:
            print(f"  {result['test']}: {result['status']}")
        print("="*60)


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_tests(verbosity: int = 2) -> Dict[str, Any]:
    """
    Run all Zone Chan API tests
    
    Args:
        verbosity: Test output verbosity level (0-2)
        
    Returns:
        Dictionary with test results
    """
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestZoneChanAuthentication))
    suite.addTests(loader.loadTestsFromTestCase(TestZoneChanAPIEndpoints))
    suite.addTests(loader.loadTestsFromTestCase(TestZoneChanErrorHandling))
    suite.addTests(loader.loadTestsFromTestCase(TestZoneChanIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=verbosity)
    result = runner.run(suite)
    
    # Compile results
    return {
        "tests_run": result.testsRun,
        "failures": len(result.failures),
        "errors": len(result.errors),
        "skipped": len(result.skipped),
        "success": result.wasSuccessful(),
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    print("="*60)
    print("Zone Chan App API Test Suite")
    print("="*60)
    print(f"Client ID: {os.environ.get('SHP_ZONE_CHAN_APP_CLIENT_ID', 'NOT SET')[:10]}...")
    print(f"Partner API: {'Configured' if os.environ.get('SHOPIFY_PARTNER_CLIENT_API') else 'Not configured'}")
    print("="*60 + "\n")
    
    results = run_tests()
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Tests Run: {results['tests_run']}")
    print(f"Failures: {results['failures']}")
    print(f"Errors: {results['errors']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Success: {results['success']}")
    print("="*60)
    
    # Exit with appropriate code
    sys.exit(0 if results["success"] else 1)
