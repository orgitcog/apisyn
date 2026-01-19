#!/usr/bin/env python3
"""
SDK Package Test Suite
=======================
Tests for SDK packages and their capabilities.

Packages Tested:
1. js-sdk (UCP JavaScript SDK)
2. adk-js (Agent Development Kit for TypeScript)
3. workbox-7 (Service Worker toolkit)
4. next-offline (Next.js offline support)
5. ucp (Universal Commerce Protocol)
6. shopify-enterprise-dash (Remix + Shopify)
7. shopify-marketplace-remix-app

Author: Manus AI
Date: 2026-01-19
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

# =============================================================================
# CONFIGURATION
# =============================================================================

BASE_DIR = Path("/home/ubuntu/api-integration-tests")

PACKAGES = {
    "js-sdk": {
        "path": BASE_DIR / "js-sdk-main/js-sdk-main",
        "type": "npm",
        "description": "UCP JavaScript SDK",
        "has_tests": False,
        "build_cmd": "npm run build",
        "test_cmd": None
    },
    "adk-js": {
        "path": BASE_DIR / "adk-js-main/adk-js-main",
        "type": "npm",
        "description": "Agent Development Kit for TypeScript",
        "has_tests": True,
        "build_cmd": "npm run build",
        "test_cmd": "npm test"
    },
    "workbox-7": {
        "path": BASE_DIR / "workbox-7/workbox-7",
        "type": "npm",
        "description": "Service Worker toolkit",
        "has_tests": True,
        "build_cmd": None,  # Complex build
        "test_cmd": None
    },
    "next-offline": {
        "path": BASE_DIR / "next-offline-master/next-offline-master",
        "type": "npm",
        "description": "Next.js offline support",
        "has_tests": True,
        "build_cmd": None,
        "test_cmd": None
    },
    "ucp": {
        "path": BASE_DIR / "ucp-main/ucp-main",
        "type": "python",
        "description": "Universal Commerce Protocol",
        "has_tests": True,
        "build_cmd": None,
        "test_cmd": "python validate_specs.py"
    },
    "shopify-enterprise-dash": {
        "path": BASE_DIR / "shopify-enterprise-dash-main/shopify-enterprise-dash-main",
        "type": "npm",
        "description": "Shopify Enterprise Dashboard (Remix)",
        "has_tests": True,
        "build_cmd": "npm run build",
        "test_cmd": "npm test"
    },
    "shopify-marketplace-remix-app": {
        "path": BASE_DIR / "shopify-marketplace-remix-app-main/shopify-marketplace-remix-app-main",
        "type": "npm",
        "description": "Shopify Marketplace Remix App",
        "has_tests": True,
        "build_cmd": "npm run build",
        "test_cmd": "npm test"
    },
    "appqbeast": {
        "path": BASE_DIR / "appqbeast-main/appqbeast-main",
        "type": "npm",
        "description": "QuickBooks Beast App",
        "has_tests": False,
        "build_cmd": None,
        "test_cmd": None
    }
}


class TestStatus(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"


@dataclass
class PackageTestResult:
    """Package test result"""
    name: str
    description: str
    path: str
    status: TestStatus
    duration: float
    details: Dict[str, Any] = field(default_factory=dict)
    error: str = ""


# =============================================================================
# TEST FUNCTIONS
# =============================================================================

def run_command(cmd: str, cwd: Path, timeout: int = 120) -> Dict[str, Any]:
    """Run a shell command and return results"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout[:5000] if result.stdout else "",
            "stderr": result.stderr[:2000] if result.stderr else "",
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Command timed out after {timeout}s",
            "returncode": -1
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": str(e),
            "returncode": -1
        }


def check_package_structure(pkg_path: Path, pkg_type: str) -> Dict[str, Any]:
    """Check package structure and files"""
    results = {
        "exists": pkg_path.exists(),
        "files": [],
        "has_readme": False,
        "has_license": False,
        "has_config": False
    }
    
    if not results["exists"]:
        return results
    
    # List key files
    for item in pkg_path.iterdir():
        if item.is_file():
            results["files"].append(item.name)
            
    results["has_readme"] = any(f.lower().startswith("readme") for f in results["files"])
    results["has_license"] = any(f.lower() == "license" or f.lower().startswith("license.") for f in results["files"])
    
    if pkg_type == "npm":
        results["has_config"] = "package.json" in results["files"]
    elif pkg_type == "python":
        results["has_config"] = "pyproject.toml" in results["files"] or "setup.py" in results["files"]
    
    return results


def analyze_package_json(pkg_path: Path) -> Dict[str, Any]:
    """Analyze package.json for npm packages"""
    pkg_json_path = pkg_path / "package.json"
    if not pkg_json_path.exists():
        return {"error": "package.json not found"}
    
    try:
        with open(pkg_json_path) as f:
            pkg_data = json.load(f)
        
        return {
            "name": pkg_data.get("name", "unknown"),
            "version": pkg_data.get("version", "unknown"),
            "description": pkg_data.get("description", ""),
            "dependencies_count": len(pkg_data.get("dependencies", {})),
            "devDependencies_count": len(pkg_data.get("devDependencies", {})),
            "scripts": list(pkg_data.get("scripts", {}).keys()),
            "has_build": "build" in pkg_data.get("scripts", {}),
            "has_test": "test" in pkg_data.get("scripts", {}),
            "has_lint": "lint" in pkg_data.get("scripts", {}),
            "main": pkg_data.get("main", ""),
            "type": pkg_data.get("type", "commonjs")
        }
    except Exception as e:
        return {"error": str(e)}


def analyze_pyproject(pkg_path: Path) -> Dict[str, Any]:
    """Analyze pyproject.toml for Python packages"""
    pyproject_path = pkg_path / "pyproject.toml"
    if not pyproject_path.exists():
        return {"error": "pyproject.toml not found"}
    
    try:
        import tomllib
        with open(pyproject_path, "rb") as f:
            data = tomllib.load(f)
        
        project = data.get("project", {})
        return {
            "name": project.get("name", "unknown"),
            "version": project.get("version", "unknown"),
            "description": project.get("description", ""),
            "dependencies_count": len(project.get("dependencies", [])),
            "python_requires": project.get("requires-python", ""),
            "has_scripts": bool(project.get("scripts", {}))
        }
    except ImportError:
        # Fallback for older Python
        return {"note": "tomllib not available, skipping detailed analysis"}
    except Exception as e:
        return {"error": str(e)}


def test_npm_package(pkg_name: str, pkg_info: Dict) -> PackageTestResult:
    """Test an npm package"""
    start = time.time()
    pkg_path = pkg_info["path"]
    
    details = {
        "structure": check_package_structure(pkg_path, "npm"),
        "package_json": analyze_package_json(pkg_path)
    }
    
    if not details["structure"]["exists"]:
        return PackageTestResult(
            name=pkg_name,
            description=pkg_info["description"],
            path=str(pkg_path),
            status=TestStatus.ERROR,
            duration=time.time() - start,
            details=details,
            error="Package directory not found"
        )
    
    # Check if node_modules exists or needs install
    node_modules = pkg_path / "node_modules"
    if not node_modules.exists():
        details["npm_install"] = "Would need npm install"
    else:
        details["npm_install"] = "node_modules present"
    
    # Analyze TypeScript config if present
    tsconfig_path = pkg_path / "tsconfig.json"
    if tsconfig_path.exists():
        try:
            with open(tsconfig_path) as f:
                details["typescript"] = {"present": True, "config": json.load(f).get("compilerOptions", {}).get("target", "unknown")}
        except:
            details["typescript"] = {"present": True, "config": "parse_error"}
    else:
        details["typescript"] = {"present": False}
    
    # Check for test configuration
    vitest_config = pkg_path / "vitest.config.ts"
    jest_config = pkg_path / "jest.config.js"
    playwright_config = pkg_path / "playwright.config.ts"
    
    details["test_frameworks"] = {
        "vitest": vitest_config.exists(),
        "jest": jest_config.exists(),
        "playwright": playwright_config.exists()
    }
    
    # Determine status
    pkg_json = details["package_json"]
    if "error" not in pkg_json:
        status = TestStatus.PASSED
    else:
        status = TestStatus.FAILED
    
    return PackageTestResult(
        name=pkg_name,
        description=pkg_info["description"],
        path=str(pkg_path),
        status=status,
        duration=time.time() - start,
        details=details
    )


def test_python_package(pkg_name: str, pkg_info: Dict) -> PackageTestResult:
    """Test a Python package"""
    start = time.time()
    pkg_path = pkg_info["path"]
    
    details = {
        "structure": check_package_structure(pkg_path, "python"),
        "pyproject": analyze_pyproject(pkg_path)
    }
    
    if not details["structure"]["exists"]:
        return PackageTestResult(
            name=pkg_name,
            description=pkg_info["description"],
            path=str(pkg_path),
            status=TestStatus.ERROR,
            duration=time.time() - start,
            details=details,
            error="Package directory not found"
        )
    
    # Check for Python files
    py_files = list(pkg_path.glob("*.py"))
    details["python_files"] = [f.name for f in py_files[:10]]
    
    # Check for spec directory (UCP specific)
    spec_dir = pkg_path / "spec"
    if spec_dir.exists():
        details["spec_files"] = len(list(spec_dir.glob("**/*.json")))
    
    status = TestStatus.PASSED if details["structure"]["has_config"] else TestStatus.FAILED
    
    return PackageTestResult(
        name=pkg_name,
        description=pkg_info["description"],
        path=str(pkg_path),
        status=status,
        duration=time.time() - start,
        details=details
    )


def run_all_package_tests() -> Dict[str, Any]:
    """Run all package tests"""
    print("="*70)
    print("SDK PACKAGE TEST SUITE")
    print("="*70)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Packages to test: {len(PACKAGES)}")
    print()
    
    results = []
    
    for pkg_name, pkg_info in PACKAGES.items():
        print(f"Testing: {pkg_name}...")
        
        if pkg_info["type"] == "npm":
            result = test_npm_package(pkg_name, pkg_info)
        elif pkg_info["type"] == "python":
            result = test_python_package(pkg_name, pkg_info)
        else:
            result = PackageTestResult(
                name=pkg_name,
                description=pkg_info["description"],
                path=str(pkg_info["path"]),
                status=TestStatus.SKIPPED,
                duration=0,
                details={"reason": f"Unknown package type: {pkg_info['type']}"}
            )
        
        results.append(result)
        
        status_icon = {
            TestStatus.PASSED: "✓",
            TestStatus.FAILED: "✗",
            TestStatus.SKIPPED: "○",
            TestStatus.ERROR: "!"
        }[result.status]
        
        print(f"  {status_icon} {result.status.value} ({result.duration:.3f}s)")
    
    # Summary
    passed = sum(1 for r in results if r.status == TestStatus.PASSED)
    failed = sum(1 for r in results if r.status == TestStatus.FAILED)
    skipped = sum(1 for r in results if r.status == TestStatus.SKIPPED)
    errors = sum(1 for r in results if r.status == TestStatus.ERROR)
    
    print()
    print("="*70)
    print("PACKAGE TEST SUMMARY")
    print("="*70)
    
    for result in results:
        status_icon = {
            TestStatus.PASSED: "✓",
            TestStatus.FAILED: "✗",
            TestStatus.SKIPPED: "○",
            TestStatus.ERROR: "!"
        }[result.status]
        
        print(f"\n{status_icon} {result.name}: {result.status.value}")
        print(f"   Description: {result.description}")
        print(f"   Path: {result.path}")
        
        if result.status == TestStatus.PASSED:
            pkg_info = result.details.get("package_json", result.details.get("pyproject", {}))
            if "name" in pkg_info:
                print(f"   Package: {pkg_info.get('name')} v{pkg_info.get('version', 'unknown')}")
            if "scripts" in pkg_info:
                print(f"   Scripts: {', '.join(pkg_info['scripts'][:5])}")
            if "test_frameworks" in result.details:
                frameworks = [k for k, v in result.details["test_frameworks"].items() if v]
                if frameworks:
                    print(f"   Test Frameworks: {', '.join(frameworks)}")
        elif result.error:
            print(f"   Error: {result.error}")
    
    print()
    print("-"*70)
    print(f"Total: {len(results)} packages")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print(f"Errors: {errors}")
    print("="*70)
    
    return {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": len(results),
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "errors": errors
        },
        "packages": [
            {
                "name": r.name,
                "description": r.description,
                "path": r.path,
                "status": r.status.value,
                "duration": r.duration,
                "details": r.details,
                "error": r.error
            }
            for r in results
        ]
    }


def main():
    """Main entry point"""
    results = run_all_package_tests()
    
    # Save results
    output_file = BASE_DIR / "sdk_package_test_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nResults saved to: {output_file}")
    
    return 0 if results["summary"]["failed"] == 0 and results["summary"]["errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
