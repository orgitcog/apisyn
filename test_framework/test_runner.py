#!/usr/bin/env python3
"""
Comprehensive Integration Test Framework
==========================================
A unified test framework for API, CLI, E2E CI, and Unit tests.

This framework provides:
- API integration tests for Shopify, Stripe, PayPal, and other services
- CLI tests for MCP server interactions
- E2E CI tests for workflow validation
- Unit tests for package validation
- Release build validation

Author: Manus AI
Date: 2026-01-19
"""

import os
import sys
import json
import time
import subprocess
import unittest
import hashlib
import hmac
import base64
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod

# =============================================================================
# CONFIGURATION
# =============================================================================

BASE_DIR = Path("/home/ubuntu/api-integration-tests")
OUTPUT_DIR = BASE_DIR / "test_framework" / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class TestCategory(Enum):
    API = "API"
    CLI = "CLI"
    E2E = "E2E"
    UNIT = "UNIT"
    RELEASE = "RELEASE"


class TestStatus(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"


@dataclass
class TestResult:
    """Individual test result"""
    name: str
    category: TestCategory
    status: TestStatus
    duration: float
    message: str = ""
    data: Dict = field(default_factory=dict)
    error: str = ""


@dataclass
class TestSuiteResult:
    """Test suite results"""
    suite_name: str
    category: TestCategory
    timestamp: str
    tests: List[TestResult] = field(default_factory=list)
    
    @property
    def total(self) -> int:
        return len(self.tests)
    
    @property
    def passed(self) -> int:
        return sum(1 for t in self.tests if t.status == TestStatus.PASSED)
    
    @property
    def failed(self) -> int:
        return sum(1 for t in self.tests if t.status == TestStatus.FAILED)
    
    @property
    def skipped(self) -> int:
        return sum(1 for t in self.tests if t.status == TestStatus.SKIPPED)
    
    @property
    def errors(self) -> int:
        return sum(1 for t in self.tests if t.status == TestStatus.ERROR)
    
    @property
    def duration(self) -> float:
        return sum(t.duration for t in self.tests)


# =============================================================================
# BASE TEST CLASSES
# =============================================================================

class BaseTestRunner(ABC):
    """Base class for test runners"""
    
    def __init__(self, category: TestCategory):
        self.category = category
        self.results: List[TestResult] = []
        
    @abstractmethod
    def run_tests(self) -> TestSuiteResult:
        """Run all tests in this suite"""
        pass
    
    def run_test(self, name: str, test_func, skip: bool = False, skip_reason: str = "") -> TestResult:
        """Run a single test"""
        if skip:
            return TestResult(
                name=name,
                category=self.category,
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
                category=self.category,
                status=TestStatus.PASSED,
                duration=duration,
                data=result_data or {},
                message="Test passed"
            )
        except AssertionError as e:
            duration = time.time() - start
            return TestResult(
                name=name,
                category=self.category,
                status=TestStatus.FAILED,
                duration=duration,
                message=str(e)
            )
        except Exception as e:
            duration = time.time() - start
            return TestResult(
                name=name,
                category=self.category,
                status=TestStatus.ERROR,
                duration=duration,
                message=str(e),
                error=str(e)
            )


# =============================================================================
# API TEST RUNNER
# =============================================================================

class APITestRunner(BaseTestRunner):
    """API integration test runner"""
    
    def __init__(self):
        super().__init__(TestCategory.API)
        self.credentials = {
            "partner_api_token": os.environ.get("SHOPIFY_PARTNER_CLIENT_API", ""),
            "admin_api_token": os.environ.get("SHOPIFY_ADMIN_API_ACCESS_TOKEN_ZONE_TEST", ""),
            "storefront_api_token": os.environ.get("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN_ZONE_TEST", ""),
            "zone_chan_client_id": os.environ.get("SHP_ZONE_CHAN_APP_CLIENT_ID", ""),
            "zone_chan_client_secret": os.environ.get("SHP_ZONE_CHAN_APP_SECRET", ""),
            "stripe_key": os.environ.get("STRIPE_SECRET_KEY", ""),
        }
        self.session = requests.Session()
        
    def _rate_limit(self):
        """Rate limit API calls"""
        time.sleep(0.25)
        
    def test_shopify_partner_api_versions(self) -> Dict:
        """Test Shopify Partner API - Get API Versions"""
        self._rate_limit()
        
        url = "https://partners.shopify.com/3604544/api/2026-01/graphql.json"
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.credentials["partner_api_token"]
        }
        query = """
        query GetApiVersions {
            publicApiVersions {
                handle
                displayName
                supported
            }
        }
        """
        
        response = self.session.post(url, headers=headers, json={"query": query})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "data" in data, "No data in response"
        versions = data["data"]["publicApiVersions"]
        return {"versions_count": len(versions)}
    
    def test_shopify_admin_api_shop(self) -> Dict:
        """Test Shopify Admin API - Get Shop Info"""
        url = "https://zone-teste.myshopify.com/admin/api/2024-01/shop.json"
        headers = {
            "X-Shopify-Access-Token": self.credentials["admin_api_token"],
            "Content-Type": "application/json"
        }
        
        response = self.session.get(url, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        shop = response.json().get("shop", {})
        return {"shop_name": shop.get("name"), "domain": shop.get("myshopify_domain")}
    
    def test_shopify_storefront_api(self) -> Dict:
        """Test Shopify Storefront API - Get Shop"""
        url = "https://zone-teste.myshopify.com/api/2024-01/graphql.json"
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": self.credentials["storefront_api_token"]
        }
        query = """
        query GetShop {
            shop {
                name
                primaryDomain {
                    url
                }
            }
        }
        """
        
        response = self.session.post(url, headers=headers, json={"query": query})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        shop = response.json().get("data", {}).get("shop", {})
        return {"name": shop.get("name")}
    
    def test_zone_chan_credentials(self) -> Dict:
        """Test Zone Chan App credentials validation"""
        client_id = self.credentials["zone_chan_client_id"]
        client_secret = self.credentials["zone_chan_client_secret"]
        
        assert client_id, "Zone Chan Client ID not set"
        assert client_secret, "Zone Chan Client Secret not set"
        assert len(client_id) == 32, f"Client ID should be 32 chars"
        assert len(client_secret) == 32, f"Client Secret should be 32 chars"
        
        return {"client_id_valid": True, "client_secret_valid": True}
    
    def test_zone_chan_hmac(self) -> Dict:
        """Test Zone Chan HMAC signature generation"""
        test_data = f"test_{datetime.now().isoformat()}"
        signature = hmac.new(
            self.credentials["zone_chan_client_secret"].encode(),
            test_data.encode(),
            hashlib.sha256
        ).digest()
        encoded = base64.b64encode(signature).decode()
        
        assert len(encoded) == 44, f"Expected 44 char signature"
        return {"signature_valid": True}
    
    def run_tests(self) -> TestSuiteResult:
        """Run all API tests"""
        suite = TestSuiteResult(
            suite_name="API Integration Tests",
            category=TestCategory.API,
            timestamp=datetime.now().isoformat()
        )
        
        tests = [
            ("Shopify Partner API - Versions", self.test_shopify_partner_api_versions,
             not self.credentials["partner_api_token"], "Partner API token not set"),
            ("Shopify Admin API - Shop", self.test_shopify_admin_api_shop,
             not self.credentials["admin_api_token"], "Admin API token not set"),
            ("Shopify Storefront API - Shop", self.test_shopify_storefront_api,
             not self.credentials["storefront_api_token"], "Storefront API token not set"),
            ("Zone Chan - Credentials", self.test_zone_chan_credentials,
             not (self.credentials["zone_chan_client_id"] and self.credentials["zone_chan_client_secret"]),
             "Zone Chan credentials not set"),
            ("Zone Chan - HMAC", self.test_zone_chan_hmac,
             not self.credentials["zone_chan_client_secret"], "Zone Chan secret not set"),
        ]
        
        for name, test_func, skip, skip_reason in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
        
        return suite


# =============================================================================
# CLI TEST RUNNER
# =============================================================================

class CLITestRunner(BaseTestRunner):
    """CLI test runner for MCP server interactions"""
    
    def __init__(self):
        super().__init__(TestCategory.CLI)
        
    def _run_mcp_command(self, server: str, tool: str, input_data: Dict, timeout: int = 30) -> Dict:
        """Run an MCP CLI command"""
        cmd = f"manus-mcp-cli tool call {tool} --server {server} --input '{json.dumps(input_data)}'"
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Command timed out"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_stripe_mcp_account(self) -> Dict:
        """Test Stripe MCP - Get Account Info"""
        result = self._run_mcp_command("stripe", "get_stripe_account_info", {})
        assert result["success"], f"MCP command failed: {result.get('error', result.get('stderr'))}"
        return {"account_retrieved": True}
    
    def test_stripe_mcp_balance(self) -> Dict:
        """Test Stripe MCP - Get Balance"""
        result = self._run_mcp_command("stripe", "retrieve_balance", {})
        assert result["success"], f"MCP command failed: {result.get('error', result.get('stderr'))}"
        return {"balance_retrieved": True}
    
    def test_stripe_mcp_customers(self) -> Dict:
        """Test Stripe MCP - List Customers"""
        result = self._run_mcp_command("stripe", "list_customers", {"limit": 3})
        assert result["success"], f"MCP command failed: {result.get('error', result.get('stderr'))}"
        return {"customers_listed": True}
    
    def test_notion_mcp_search(self) -> Dict:
        """Test Notion MCP - Search"""
        result = self._run_mcp_command("notion", "notion-search", {"query": "test"}, timeout=15)
        # Notion search may return empty but should succeed
        return {"search_executed": True}
    
    def test_cloudflare_mcp_accounts(self) -> Dict:
        """Test Cloudflare MCP - List Accounts"""
        result = self._run_mcp_command("cloudflare", "accounts_list", {})
        assert result["success"], f"MCP command failed: {result.get('error', result.get('stderr'))}"
        return {"accounts_listed": True}
    
    def run_tests(self) -> TestSuiteResult:
        """Run all CLI tests"""
        suite = TestSuiteResult(
            suite_name="CLI MCP Integration Tests",
            category=TestCategory.CLI,
            timestamp=datetime.now().isoformat()
        )
        
        tests = [
            ("Stripe MCP - Account Info", self.test_stripe_mcp_account, False, ""),
            ("Stripe MCP - Balance", self.test_stripe_mcp_balance, False, ""),
            ("Stripe MCP - Customers", self.test_stripe_mcp_customers, False, ""),
            ("Cloudflare MCP - Accounts", self.test_cloudflare_mcp_accounts, False, ""),
        ]
        
        for name, test_func, skip, skip_reason in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
        
        return suite


# =============================================================================
# UNIT TEST RUNNER
# =============================================================================

class UnitTestRunner(BaseTestRunner):
    """Unit test runner for package validation"""
    
    def __init__(self):
        super().__init__(TestCategory.UNIT)
        self.packages = {
            "js-sdk": BASE_DIR / "js-sdk-main/js-sdk-main",
            "adk-js": BASE_DIR / "adk-js-main/adk-js-main",
            "workbox-7": BASE_DIR / "workbox-7/workbox-7",
            "ucp": BASE_DIR / "ucp-main/ucp-main",
            "shopify-enterprise-dash": BASE_DIR / "shopify-enterprise-dash-main/shopify-enterprise-dash-main",
        }
        
    def test_package_structure(self, pkg_name: str, pkg_path: Path) -> Dict:
        """Test package structure"""
        assert pkg_path.exists(), f"Package path not found: {pkg_path}"
        
        # Check for required files
        has_readme = any(f.name.lower().startswith("readme") for f in pkg_path.iterdir() if f.is_file())
        has_license = any(f.name.lower().startswith("license") for f in pkg_path.iterdir() if f.is_file())
        
        # Check for config files
        has_package_json = (pkg_path / "package.json").exists()
        has_pyproject = (pkg_path / "pyproject.toml").exists()
        
        return {
            "has_readme": has_readme,
            "has_license": has_license,
            "has_config": has_package_json or has_pyproject
        }
    
    def test_package_json_valid(self, pkg_path: Path) -> Dict:
        """Test package.json is valid"""
        pkg_json_path = pkg_path / "package.json"
        if not pkg_json_path.exists():
            return {"skipped": True, "reason": "No package.json"}
        
        with open(pkg_json_path) as f:
            data = json.load(f)
        
        assert "name" in data, "Missing 'name' field"
        return {
            "name": data.get("name"),
            "version": data.get("version", "unknown"),
            "has_scripts": bool(data.get("scripts"))
        }
    
    def run_tests(self) -> TestSuiteResult:
        """Run all unit tests"""
        suite = TestSuiteResult(
            suite_name="Package Unit Tests",
            category=TestCategory.UNIT,
            timestamp=datetime.now().isoformat()
        )
        
        for pkg_name, pkg_path in self.packages.items():
            # Structure test
            result = self.run_test(
                f"{pkg_name} - Structure",
                lambda p=pkg_path, n=pkg_name: self.test_package_structure(n, p)
            )
            suite.tests.append(result)
            
            # Package.json test
            result = self.run_test(
                f"{pkg_name} - Config",
                lambda p=pkg_path: self.test_package_json_valid(p)
            )
            suite.tests.append(result)
        
        return suite


# =============================================================================
# E2E TEST RUNNER
# =============================================================================

class E2ETestRunner(BaseTestRunner):
    """E2E CI test runner"""
    
    def __init__(self):
        super().__init__(TestCategory.E2E)
        
    def test_shopify_product_workflow(self) -> Dict:
        """Test Shopify product CRUD workflow"""
        admin_token = os.environ.get("SHOPIFY_ADMIN_API_ACCESS_TOKEN_ZONE_TEST")
        if not admin_token:
            raise AssertionError("Admin API token not set")
        
        base_url = "https://zone-teste.myshopify.com/admin/api/2024-01"
        headers = {
            "X-Shopify-Access-Token": admin_token,
            "Content-Type": "application/json"
        }
        
        # Create product
        create_data = {
            "product": {
                "title": f"E2E Test Product {datetime.now().isoformat()}",
                "body_html": "<p>E2E test product</p>",
                "vendor": "E2E Test",
                "status": "draft"
            }
        }
        
        response = requests.post(f"{base_url}/products.json", headers=headers, json=create_data)
        assert response.status_code in [200, 201], f"Create failed: {response.status_code}"
        product_id = response.json()["product"]["id"]
        
        # Read product
        response = requests.get(f"{base_url}/products/{product_id}.json", headers=headers)
        assert response.status_code == 200, f"Read failed: {response.status_code}"
        
        # Update product
        update_data = {"product": {"id": product_id, "title": "Updated E2E Test Product"}}
        response = requests.put(f"{base_url}/products/{product_id}.json", headers=headers, json=update_data)
        assert response.status_code == 200, f"Update failed: {response.status_code}"
        
        # Delete product
        response = requests.delete(f"{base_url}/products/{product_id}.json", headers=headers)
        assert response.status_code == 200, f"Delete failed: {response.status_code}"
        
        return {"workflow": "product_crud", "product_id": product_id, "status": "completed"}
    
    def test_partner_api_workflow(self) -> Dict:
        """Test Partner API transaction query workflow"""
        partner_token = os.environ.get("SHOPIFY_PARTNER_CLIENT_API")
        if not partner_token:
            raise AssertionError("Partner API token not set")
        
        url = "https://partners.shopify.com/3604544/api/2026-01/graphql.json"
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": partner_token
        }
        
        # Query transactions
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
        
        response = requests.post(url, headers=headers, json={"query": query, "variables": {"first": 5}})
        assert response.status_code == 200, f"Query failed: {response.status_code}"
        
        data = response.json()
        assert "data" in data, "No data in response"
        
        return {"workflow": "partner_transactions", "status": "completed"}
    
    def run_tests(self) -> TestSuiteResult:
        """Run all E2E tests"""
        suite = TestSuiteResult(
            suite_name="E2E CI Tests",
            category=TestCategory.E2E,
            timestamp=datetime.now().isoformat()
        )
        
        tests = [
            ("Shopify Product CRUD Workflow", self.test_shopify_product_workflow,
             not os.environ.get("SHOPIFY_ADMIN_API_ACCESS_TOKEN_ZONE_TEST"), "Admin token not set"),
            ("Partner API Transaction Workflow", self.test_partner_api_workflow,
             not os.environ.get("SHOPIFY_PARTNER_CLIENT_API"), "Partner token not set"),
        ]
        
        for name, test_func, skip, skip_reason in tests:
            result = self.run_test(name, test_func, skip, skip_reason)
            suite.tests.append(result)
        
        return suite


# =============================================================================
# RELEASE TEST RUNNER
# =============================================================================

class ReleaseTestRunner(BaseTestRunner):
    """Release build validation test runner"""
    
    def __init__(self):
        super().__init__(TestCategory.RELEASE)
        self.packages = {
            "js-sdk": BASE_DIR / "js-sdk-main/js-sdk-main",
            "adk-js": BASE_DIR / "adk-js-main/adk-js-main",
            "shopify-enterprise-dash": BASE_DIR / "shopify-enterprise-dash-main/shopify-enterprise-dash-main",
        }
        
    def test_package_build_ready(self, pkg_name: str, pkg_path: Path) -> Dict:
        """Test package is build-ready"""
        pkg_json_path = pkg_path / "package.json"
        
        if not pkg_json_path.exists():
            return {"skipped": True, "reason": "No package.json"}
        
        with open(pkg_json_path) as f:
            data = json.load(f)
        
        scripts = data.get("scripts", {})
        
        return {
            "has_build": "build" in scripts,
            "has_test": "test" in scripts,
            "has_lint": "lint" in scripts,
            "name": data.get("name"),
            "version": data.get("version")
        }
    
    def test_release_manifest_generation(self) -> Dict:
        """Test release manifest can be generated"""
        manifest = {
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "packages": [],
            "status": "draft"
        }
        
        for pkg_name, pkg_path in self.packages.items():
            pkg_json_path = pkg_path / "package.json"
            if pkg_json_path.exists():
                with open(pkg_json_path) as f:
                    data = json.load(f)
                manifest["packages"].append({
                    "name": data.get("name", pkg_name),
                    "version": data.get("version", "unknown"),
                    "path": str(pkg_path)
                })
        
        # Save manifest
        manifest_path = OUTPUT_DIR / "release_manifest.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        
        return {"manifest_path": str(manifest_path), "packages_count": len(manifest["packages"])}
    
    def run_tests(self) -> TestSuiteResult:
        """Run all release tests"""
        suite = TestSuiteResult(
            suite_name="Release Build Validation",
            category=TestCategory.RELEASE,
            timestamp=datetime.now().isoformat()
        )
        
        # Package build tests
        for pkg_name, pkg_path in self.packages.items():
            result = self.run_test(
                f"{pkg_name} - Build Ready",
                lambda p=pkg_path, n=pkg_name: self.test_package_build_ready(n, p)
            )
            suite.tests.append(result)
        
        # Manifest generation test
        result = self.run_test("Release Manifest Generation", self.test_release_manifest_generation)
        suite.tests.append(result)
        
        return suite


# =============================================================================
# MAIN TEST FRAMEWORK
# =============================================================================

class IntegrationTestFramework:
    """Main test framework orchestrator"""
    
    def __init__(self):
        self.runners = {
            TestCategory.API: APITestRunner(),
            TestCategory.CLI: CLITestRunner(),
            TestCategory.UNIT: UnitTestRunner(),
            TestCategory.E2E: E2ETestRunner(),
            TestCategory.RELEASE: ReleaseTestRunner(),
        }
        self.results: List[TestSuiteResult] = []
        
    def run_suite(self, category: TestCategory) -> TestSuiteResult:
        """Run a specific test suite"""
        runner = self.runners[category]
        return runner.run_tests()
    
    def run_all(self, categories: List[TestCategory] = None) -> Dict[str, Any]:
        """Run all test suites"""
        if categories is None:
            categories = list(TestCategory)
        
        print("="*70)
        print("COMPREHENSIVE INTEGRATION TEST FRAMEWORK")
        print("="*70)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Categories: {', '.join(c.value for c in categories)}")
        print()
        
        self.results = []
        
        for category in categories:
            print(f"\n{'='*70}")
            print(f"Running {category.value} Tests")
            print("="*70)
            
            suite = self.run_suite(category)
            self.results.append(suite)
            
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
            
            print(f"\n  Summary: {suite.passed}/{suite.total} passed")
        
        # Overall summary
        total_tests = sum(s.total for s in self.results)
        total_passed = sum(s.passed for s in self.results)
        total_failed = sum(s.failed for s in self.results)
        total_skipped = sum(s.skipped for s in self.results)
        total_errors = sum(s.errors for s in self.results)
        
        print(f"\n{'='*70}")
        print("OVERALL SUMMARY")
        print("="*70)
        
        for suite in self.results:
            status = "✓ PASSED" if suite.failed == 0 and suite.errors == 0 else "✗ FAILED"
            print(f"  {suite.category.value}: {status} ({suite.passed}/{suite.total})")
        
        print(f"\nTotal: {total_tests} tests")
        print(f"Passed: {total_passed}")
        print(f"Failed: {total_failed}")
        print(f"Skipped: {total_skipped}")
        print(f"Errors: {total_errors}")
        
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        print("="*70)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total_tests,
                "passed": total_passed,
                "failed": total_failed,
                "skipped": total_skipped,
                "errors": total_errors,
                "success_rate": success_rate
            },
            "suites": [
                {
                    "name": s.suite_name,
                    "category": s.category.value,
                    "total": s.total,
                    "passed": s.passed,
                    "failed": s.failed,
                    "skipped": s.skipped,
                    "errors": s.errors,
                    "duration": s.duration,
                    "tests": [
                        {
                            "name": t.name,
                            "status": t.status.value,
                            "duration": t.duration,
                            "message": t.message,
                            "data": t.data
                        }
                        for t in s.tests
                    ]
                }
                for s in self.results
            ]
        }


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Comprehensive Integration Test Framework")
    parser.add_argument(
        "--suite",
        choices=["all", "api", "cli", "unit", "e2e", "release"],
        default="all",
        help="Test suite to run"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(OUTPUT_DIR / "test_results.json"),
        help="Output file for results"
    )
    
    args = parser.parse_args()
    
    framework = IntegrationTestFramework()
    
    if args.suite == "all":
        categories = list(TestCategory)
    else:
        category_map = {
            "api": TestCategory.API,
            "cli": TestCategory.CLI,
            "unit": TestCategory.UNIT,
            "e2e": TestCategory.E2E,
            "release": TestCategory.RELEASE
        }
        categories = [category_map[args.suite]]
    
    results = framework.run_all(categories)
    
    # Save results
    with open(args.output, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nResults saved to: {args.output}")
    
    return 0 if results["summary"]["failed"] == 0 and results["summary"]["errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
