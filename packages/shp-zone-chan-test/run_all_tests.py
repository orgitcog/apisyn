#!/usr/bin/env python3
"""
Zone Chan Comprehensive Test Runner
====================================
Master test runner for all test suites.

This script runs:
- API tests (Zone Chan App credentials)
- CLI tests
- E2E CI tests
- Unit tests
- Release build validation

Author: Manus AI
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Add test directories to path
sys.path.insert(0, str(Path(__file__).parent / "api"))
sys.path.insert(0, str(Path(__file__).parent / "cli"))
sys.path.insert(0, str(Path(__file__).parent / "e2e"))
sys.path.insert(0, str(Path(__file__).parent / "unit"))
sys.path.insert(0, str(Path(__file__).parent / "release"))


def run_api_tests(verbosity: int = 2) -> Dict[str, Any]:
    """Run API tests"""
    print("\n" + "="*60)
    print("Running API Tests")
    print("="*60)
    
    try:
        from test_zone_chan_api import run_tests
        return run_tests(verbosity)
    except Exception as e:
        return {
            "tests_run": 0,
            "failures": 0,
            "errors": 1,
            "skipped": 0,
            "success": False,
            "error_message": str(e)
        }


def run_cli_tests(verbosity: int = 2) -> Dict[str, Any]:
    """Run CLI tests"""
    print("\n" + "="*60)
    print("Running CLI Tests")
    print("="*60)
    
    try:
        from test_cli import run_cli_tests as _run_cli_tests
        return _run_cli_tests(verbosity)
    except Exception as e:
        return {
            "tests_run": 0,
            "failures": 0,
            "errors": 1,
            "skipped": 0,
            "success": False,
            "error_message": str(e)
        }


def run_e2e_tests(verbosity: int = 2) -> Dict[str, Any]:
    """Run E2E CI tests"""
    print("\n" + "="*60)
    print("Running E2E CI Tests")
    print("="*60)
    
    try:
        from test_e2e_ci import run_e2e_tests as _run_e2e_tests
        return _run_e2e_tests(verbosity)
    except Exception as e:
        return {
            "tests_run": 0,
            "failures": 0,
            "errors": 1,
            "skipped": 0,
            "success": False,
            "error_message": str(e)
        }


def run_unit_tests(verbosity: int = 2) -> Dict[str, Any]:
    """Run unit tests"""
    print("\n" + "="*60)
    print("Running Unit Tests")
    print("="*60)
    
    try:
        from test_unit import run_unit_tests as _run_unit_tests
        return _run_unit_tests(verbosity)
    except Exception as e:
        return {
            "tests_run": 0,
            "failures": 0,
            "errors": 1,
            "skipped": 0,
            "success": False,
            "error_message": str(e)
        }


def run_release_validation(verbosity: int = 2) -> Dict[str, Any]:
    """Run release build validation"""
    print("\n" + "="*60)
    print("Running Release Build Validation")
    print("="*60)
    
    try:
        from release_config import ReleaseConfig, ReleaseWorkflow
        
        config = ReleaseConfig(version="1.0.0")
        workflow = ReleaseWorkflow(config)
        results = workflow.execute()
        
        return {
            "tests_run": len(config.repositories),
            "failures": sum(1 for r in results["build_results"]["repositories"].values() if not r["success"]),
            "errors": 0,
            "skipped": 0,
            "success": all(r["success"] for r in results["build_results"]["repositories"].values()),
            "details": results
        }
    except Exception as e:
        return {
            "tests_run": 0,
            "failures": 0,
            "errors": 1,
            "skipped": 0,
            "success": False,
            "error_message": str(e)
        }


def print_summary(all_results: Dict[str, Dict[str, Any]]):
    """Print test summary"""
    print("\n" + "="*60)
    print("COMPREHENSIVE TEST SUMMARY")
    print("="*60)
    
    total_tests = 0
    total_failures = 0
    total_errors = 0
    total_skipped = 0
    all_success = True
    
    for suite_name, results in all_results.items():
        tests = results.get("tests_run", 0)
        failures = results.get("failures", 0)
        errors = results.get("errors", 0)
        skipped = results.get("skipped", 0)
        success = results.get("success", False)
        
        total_tests += tests
        total_failures += failures
        total_errors += errors
        total_skipped += skipped
        all_success = all_success and success
        
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"\n{suite_name}:")
        print(f"  Status: {status}")
        print(f"  Tests: {tests}, Failures: {failures}, Errors: {errors}, Skipped: {skipped}")
        
        if "error_message" in results:
            print(f"  Error: {results['error_message']}")
    
    print("\n" + "-"*60)
    print("TOTALS:")
    print(f"  Tests Run: {total_tests}")
    print(f"  Failures: {total_failures}")
    print(f"  Errors: {total_errors}")
    print(f"  Skipped: {total_skipped}")
    print(f"  Overall: {'✓ ALL PASSED' if all_success else '✗ SOME FAILED'}")
    print("="*60)
    
    return all_success


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Zone Chan Comprehensive Test Runner"
    )
    parser.add_argument(
        "--suite",
        choices=["all", "api", "cli", "e2e", "unit", "release"],
        default="all",
        help="Test suite to run"
    )
    parser.add_argument(
        "--verbosity",
        type=int,
        choices=[0, 1, 2],
        default=2,
        help="Test output verbosity"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output file for results (JSON)"
    )
    
    args = parser.parse_args()
    
    print("="*60)
    print("Zone Chan Comprehensive Test Suite")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Suite: {args.suite}")
    print(f"Verbosity: {args.verbosity}")
    
    # Check credentials
    print("\nCredentials Status:")
    print(f"  Zone Chan Client ID: {'✓ Set' if os.environ.get('SHP_ZONE_CHAN_APP_CLIENT_ID') else '✗ Not set'}")
    print(f"  Zone Chan Secret: {'✓ Set' if os.environ.get('SHP_ZONE_CHAN_APP_SECRET') else '✗ Not set'}")
    print(f"  Partner API Token: {'✓ Set' if os.environ.get('SHOPIFY_PARTNER_CLIENT_API') else '✗ Not set'}")
    
    # Run tests
    all_results = {}
    
    if args.suite in ["all", "api"]:
        all_results["API Tests"] = run_api_tests(args.verbosity)
        
    if args.suite in ["all", "cli"]:
        all_results["CLI Tests"] = run_cli_tests(args.verbosity)
        
    if args.suite in ["all", "e2e"]:
        all_results["E2E CI Tests"] = run_e2e_tests(args.verbosity)
        
    if args.suite in ["all", "unit"]:
        all_results["Unit Tests"] = run_unit_tests(args.verbosity)
        
    if args.suite in ["all", "release"]:
        all_results["Release Validation"] = run_release_validation(args.verbosity)
    
    # Print summary
    all_success = print_summary(all_results)
    
    # Save results if output specified
    if args.output:
        output_path = Path(args.output)
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "suite": args.suite,
            "results": all_results,
            "overall_success": all_success
        }
        
        with open(output_path, "w") as f:
            json.dump(output_data, f, indent=2, default=str)
            
        print(f"\nResults saved to: {output_path}")
    
    # Exit with appropriate code
    sys.exit(0 if all_success else 1)


if __name__ == "__main__":
    main()
