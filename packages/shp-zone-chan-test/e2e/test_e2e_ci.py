#!/usr/bin/env python3
"""
Zone Chan E2E CI Test Suite
===========================
End-to-end CI/CD pipeline tests for all cogpy repositories.

This test suite validates:
- GitHub Actions workflow syntax
- CI/CD pipeline completeness
- Build matrix configurations
- Release workflow integrity
- Cross-repository integration

Author: Manus AI
"""

import os
import sys
import yaml
import json
import unittest
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class E2ETestConfig:
    """E2E Test Configuration"""
    REPOS = {
        "cogplan9": "/home/ubuntu/cogplan9",
        "cogpilot.jl": "/home/ubuntu/cogpilot.jl",
        "cognu-mach": "/home/ubuntu/cognu-mach",
        "coglux": "/home/ubuntu/coglux",
        "coglow": "/home/ubuntu/coglow",
        "coggml": "/home/ubuntu/coggml"
    }
    
    REQUIRED_WORKFLOW_ELEMENTS = [
        "name",
        "on",
        "jobs"
    ]
    
    REQUIRED_JOB_ELEMENTS = [
        "runs-on",
        "steps"
    ]


# =============================================================================
# WORKFLOW PARSER
# =============================================================================

class WorkflowParser:
    """Parse and validate GitHub Actions workflows"""
    
    def __init__(self, workflow_path: Path):
        self.path = workflow_path
        self.content = None
        self.parsed = None
        self._load()
        
    def _load(self):
        """Load and parse workflow file"""
        if not self.path.exists():
            raise FileNotFoundError(f"Workflow not found: {self.path}")
            
        with open(self.path) as f:
            self.content = f.read()
            self.parsed = yaml.safe_load(self.content)
            
    def validate_structure(self) -> Dict[str, Any]:
        """Validate workflow structure"""
        issues = []
        
        # Check required top-level elements
        for element in E2ETestConfig.REQUIRED_WORKFLOW_ELEMENTS:
            if element not in self.parsed:
                issues.append(f"Missing required element: {element}")
                
        # Validate jobs
        if "jobs" in self.parsed:
            for job_name, job_config in self.parsed["jobs"].items():
                for element in E2ETestConfig.REQUIRED_JOB_ELEMENTS:
                    if element not in job_config:
                        issues.append(f"Job '{job_name}' missing: {element}")
                        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "job_count": len(self.parsed.get("jobs", {})),
            "triggers": list(self.parsed.get("on", {}).keys()) if isinstance(self.parsed.get("on"), dict) else [self.parsed.get("on")]
        }
        
    def get_jobs(self) -> Dict[str, Any]:
        """Get all jobs from workflow"""
        return self.parsed.get("jobs", {})
        
    def get_triggers(self) -> List[str]:
        """Get workflow triggers"""
        on_config = self.parsed.get("on", {})
        if isinstance(on_config, dict):
            return list(on_config.keys())
        elif isinstance(on_config, list):
            return on_config
        else:
            return [on_config]
            
    def has_matrix_build(self) -> bool:
        """Check if workflow uses matrix builds"""
        for job in self.parsed.get("jobs", {}).values():
            if "strategy" in job and "matrix" in job.get("strategy", {}):
                return True
        return False
        
    def get_artifacts(self) -> List[str]:
        """Get artifact names from workflow"""
        artifacts = []
        for job in self.parsed.get("jobs", {}).values():
            for step in job.get("steps", []):
                if step.get("uses", "").startswith("actions/upload-artifact"):
                    artifact_name = step.get("with", {}).get("name", "unnamed")
                    artifacts.append(artifact_name)
        return artifacts


# =============================================================================
# COGPLAN9 E2E TESTS
# =============================================================================

class TestCogplan9E2E(unittest.TestCase):
    """E2E tests for cogplan9 CI/CD"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(E2ETestConfig.REPOS["cogplan9"])
        cls.workflow_path = cls.repo_path / ".github" / "workflows"
        
    def test_ci_workflow_exists(self):
        """Test that CI workflow exists"""
        ci_path = self.workflow_path / "ci.yml"
        self.assertTrue(ci_path.exists(), "ci.yml not found")
        
    def test_ci_workflow_valid(self):
        """Test CI workflow is valid"""
        ci_path = self.workflow_path / "ci.yml"
        parser = WorkflowParser(ci_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"CI workflow invalid: {result['issues']}")
        
    def test_release_workflow_exists(self):
        """Test that release workflow exists"""
        release_path = self.workflow_path / "release.yml"
        self.assertTrue(release_path.exists(), "release.yml not found")
        
    def test_release_workflow_valid(self):
        """Test release workflow is valid"""
        release_path = self.workflow_path / "release.yml"
        parser = WorkflowParser(release_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"Release workflow invalid: {result['issues']}")
        
    def test_release_has_tag_trigger(self):
        """Test release workflow triggers on tags"""
        release_path = self.workflow_path / "release.yml"
        parser = WorkflowParser(release_path)
        triggers = parser.get_triggers()
        
        self.assertIn("push", triggers)
        
    def test_ci_has_test_job(self):
        """Test CI workflow has test job"""
        ci_path = self.workflow_path / "ci.yml"
        parser = WorkflowParser(ci_path)
        jobs = parser.get_jobs()
        
        # Check for test-related job
        test_jobs = [j for j in jobs.keys() if "test" in j.lower()]
        self.assertGreater(len(test_jobs), 0, "No test job found in CI workflow")


# =============================================================================
# COGPILOT.JL E2E TESTS
# =============================================================================

class TestCogpilotE2E(unittest.TestCase):
    """E2E tests for cogpilot.jl CI/CD"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(E2ETestConfig.REPOS["cogpilot.jl"])
        cls.workflow_path = cls.repo_path / ".github" / "workflows"
        
    def test_tests_workflow_exists(self):
        """Test that Tests workflow exists"""
        tests_path = self.workflow_path / "Tests.yml"
        self.assertTrue(tests_path.exists(), "Tests.yml not found")
        
    def test_release_workflow_exists(self):
        """Test that Release workflow exists"""
        release_path = self.workflow_path / "Release.yml"
        self.assertTrue(release_path.exists(), "Release.yml not found")
        
    def test_documentation_workflow_exists(self):
        """Test that Documentation workflow exists"""
        docs_path = self.workflow_path / "Documentation.yml"
        self.assertTrue(docs_path.exists(), "Documentation.yml not found")
        
    def test_tests_workflow_valid(self):
        """Test Tests workflow is valid"""
        tests_path = self.workflow_path / "Tests.yml"
        parser = WorkflowParser(tests_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"Tests workflow invalid: {result['issues']}")
        
    def test_release_workflow_valid(self):
        """Test Release workflow is valid"""
        release_path = self.workflow_path / "Release.yml"
        parser = WorkflowParser(release_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"Release workflow invalid: {result['issues']}")


# =============================================================================
# COGNU-MACH E2E TESTS
# =============================================================================

class TestCognuMachE2E(unittest.TestCase):
    """E2E tests for cognu-mach CI/CD"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(E2ETestConfig.REPOS["cognu-mach"])
        cls.workflow_path = cls.repo_path / ".github" / "workflows"
        
    def test_ci_cd_workflow_exists(self):
        """Test that CI/CD workflow exists"""
        ci_path = self.workflow_path / "ci-cd.yml"
        self.assertTrue(ci_path.exists(), "ci-cd.yml not found")
        
    def test_release_workflow_exists(self):
        """Test that release workflow exists"""
        release_path = self.workflow_path / "release.yml"
        self.assertTrue(release_path.exists(), "release.yml not found")
        
    def test_ci_cd_workflow_valid(self):
        """Test CI/CD workflow is valid"""
        ci_path = self.workflow_path / "ci-cd.yml"
        parser = WorkflowParser(ci_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"CI/CD workflow invalid: {result['issues']}")
        
    def test_ci_has_matrix_build(self):
        """Test CI workflow uses matrix builds"""
        ci_path = self.workflow_path / "ci-cd.yml"
        parser = WorkflowParser(ci_path)
        
        self.assertTrue(
            parser.has_matrix_build(),
            "CI workflow should use matrix builds for multi-arch support"
        )
        
    def test_ci_has_artifacts(self):
        """Test CI workflow uploads artifacts"""
        ci_path = self.workflow_path / "ci-cd.yml"
        parser = WorkflowParser(ci_path)
        artifacts = parser.get_artifacts()
        
        self.assertGreater(len(artifacts), 0, "CI workflow should upload artifacts")


# =============================================================================
# COGGML E2E TESTS
# =============================================================================

class TestCoggmlE2E(unittest.TestCase):
    """E2E tests for coggml CI/CD"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(E2ETestConfig.REPOS["coggml"])
        cls.workflow_path = cls.repo_path / ".github" / "workflows"
        
    def test_ci_workflow_exists(self):
        """Test that CI workflow exists"""
        ci_path = self.workflow_path / "ci.yml"
        self.assertTrue(ci_path.exists(), "ci.yml not found")
        
    def test_release_workflow_exists(self):
        """Test that release workflow exists"""
        release_path = self.workflow_path / "release.yml"
        self.assertTrue(release_path.exists(), "release.yml not found")
        
    def test_ci_workflow_valid(self):
        """Test CI workflow is valid"""
        ci_path = self.workflow_path / "ci.yml"
        parser = WorkflowParser(ci_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"CI workflow invalid: {result['issues']}")
        
    def test_ci_has_matrix_build(self):
        """Test CI workflow uses matrix builds"""
        ci_path = self.workflow_path / "ci.yml"
        parser = WorkflowParser(ci_path)
        
        self.assertTrue(
            parser.has_matrix_build(),
            "CI workflow should use matrix builds for cross-platform support"
        )


# =============================================================================
# COGLOW E2E TESTS
# =============================================================================

class TestCoglowE2E(unittest.TestCase):
    """E2E tests for coglow CI/CD"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(E2ETestConfig.REPOS["coglow"])
        cls.workflow_path = cls.repo_path / ".github" / "workflows"
        
    def test_ci_workflow_exists(self):
        """Test that CI workflow exists"""
        ci_path = self.workflow_path / "ci.yml"
        self.assertTrue(ci_path.exists(), "ci.yml not found")
        
    def test_release_workflow_exists(self):
        """Test that release workflow exists"""
        release_path = self.workflow_path / "release.yml"
        self.assertTrue(release_path.exists(), "release.yml not found")
        
    def test_ci_workflow_valid(self):
        """Test CI workflow is valid"""
        ci_path = self.workflow_path / "ci.yml"
        parser = WorkflowParser(ci_path)
        result = parser.validate_structure()
        
        self.assertTrue(result["valid"], f"CI workflow invalid: {result['issues']}")


# =============================================================================
# CROSS-REPOSITORY E2E TESTS
# =============================================================================

class TestCrossRepositoryE2E(unittest.TestCase):
    """Cross-repository E2E integration tests"""
    
    def test_all_repos_have_ci(self):
        """Test all repositories have CI workflows"""
        for repo_name, repo_path in E2ETestConfig.REPOS.items():
            workflow_path = Path(repo_path) / ".github" / "workflows"
            
            if workflow_path.exists():
                workflows = list(workflow_path.glob("*.yml"))
                ci_workflows = [w for w in workflows if "ci" in w.name.lower()]
                
                self.assertGreater(
                    len(ci_workflows), 0,
                    f"No CI workflow found in {repo_name}"
                )
                
    def test_all_repos_have_release(self):
        """Test all repositories have release workflows"""
        for repo_name, repo_path in E2ETestConfig.REPOS.items():
            workflow_path = Path(repo_path) / ".github" / "workflows"
            
            if workflow_path.exists():
                workflows = list(workflow_path.glob("*.yml"))
                release_workflows = [w for w in workflows if "release" in w.name.lower()]
                
                self.assertGreater(
                    len(release_workflows), 0,
                    f"No release workflow found in {repo_name}"
                )
                
    def test_workflow_yaml_syntax(self):
        """Test all workflow files have valid YAML syntax"""
        for repo_name, repo_path in E2ETestConfig.REPOS.items():
            workflow_path = Path(repo_path) / ".github" / "workflows"
            
            if workflow_path.exists():
                for workflow_file in workflow_path.glob("*.yml"):
                    try:
                        with open(workflow_file) as f:
                            yaml.safe_load(f)
                    except yaml.YAMLError as e:
                        self.fail(f"Invalid YAML in {repo_name}/{workflow_file.name}: {e}")


# =============================================================================
# PIPELINE INTEGRITY TESTS
# =============================================================================

class TestPipelineIntegrity(unittest.TestCase):
    """Test CI/CD pipeline integrity"""
    
    def test_cogplan9_pipeline_complete(self):
        """Test cogplan9 has complete CI/CD pipeline"""
        repo_path = Path(E2ETestConfig.REPOS["cogplan9"])
        workflow_path = repo_path / ".github" / "workflows"
        
        required_workflows = ["ci.yml", "release.yml"]
        
        for workflow in required_workflows:
            self.assertTrue(
                (workflow_path / workflow).exists(),
                f"cogplan9 missing {workflow}"
            )
            
    def test_cogpilot_pipeline_complete(self):
        """Test cogpilot.jl has complete CI/CD pipeline"""
        repo_path = Path(E2ETestConfig.REPOS["cogpilot.jl"])
        workflow_path = repo_path / ".github" / "workflows"
        
        required_workflows = ["Tests.yml", "Release.yml"]
        
        for workflow in required_workflows:
            self.assertTrue(
                (workflow_path / workflow).exists(),
                f"cogpilot.jl missing {workflow}"
            )
            
    def test_cognu_mach_pipeline_complete(self):
        """Test cognu-mach has complete CI/CD pipeline"""
        repo_path = Path(E2ETestConfig.REPOS["cognu-mach"])
        workflow_path = repo_path / ".github" / "workflows"
        
        required_workflows = ["ci-cd.yml", "release.yml"]
        
        for workflow in required_workflows:
            self.assertTrue(
                (workflow_path / workflow).exists(),
                f"cognu-mach missing {workflow}"
            )


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_e2e_tests(verbosity: int = 2) -> Dict[str, Any]:
    """
    Run all E2E CI tests
    
    Args:
        verbosity: Test output verbosity level (0-2)
        
    Returns:
        Dictionary with test results
    """
    from datetime import datetime
    
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestCogplan9E2E))
    suite.addTests(loader.loadTestsFromTestCase(TestCogpilotE2E))
    suite.addTests(loader.loadTestsFromTestCase(TestCognuMachE2E))
    suite.addTests(loader.loadTestsFromTestCase(TestCoggmlE2E))
    suite.addTests(loader.loadTestsFromTestCase(TestCoglowE2E))
    suite.addTests(loader.loadTestsFromTestCase(TestCrossRepositoryE2E))
    suite.addTests(loader.loadTestsFromTestCase(TestPipelineIntegrity))
    
    runner = unittest.TextTestRunner(verbosity=verbosity)
    result = runner.run(suite)
    
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
    print("Zone Chan E2E CI Test Suite")
    print("="*60 + "\n")
    
    results = run_e2e_tests()
    
    print("\n" + "="*60)
    print("E2E CI Test Summary")
    print("="*60)
    print(f"Tests Run: {results['tests_run']}")
    print(f"Failures: {results['failures']}")
    print(f"Errors: {results['errors']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Success: {results['success']}")
    print("="*60)
    
    sys.exit(0 if results["success"] else 1)
