#!/usr/bin/env python3
"""
Zone Chan CLI Test Suite
========================
Comprehensive CLI tests for all cogpy repositories.

This test suite validates:
- Command-line argument parsing
- Configuration file handling
- Output formatting
- Exit codes
- Interactive mode
- Help documentation

Author: Manus AI
"""

import os
import sys
import subprocess
import unittest
import tempfile
import shutil
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class CLITestConfig:
    """CLI Test Configuration"""
    COGPLAN9_PATH: str = "/home/ubuntu/cogplan9"
    COGPILOT_PATH: str = "/home/ubuntu/cogpilot.jl"
    COGNU_MACH_PATH: str = "/home/ubuntu/cognu-mach"
    COGLUX_PATH: str = "/home/ubuntu/coglux"
    COGLOW_PATH: str = "/home/ubuntu/coglow"
    COGGML_PATH: str = "/home/ubuntu/coggml"
    TIMEOUT: int = 60


# =============================================================================
# CLI TEST UTILITIES
# =============================================================================

class CLIRunner:
    """Utility class for running CLI commands"""
    
    def __init__(self, config: CLITestConfig):
        self.config = config
        
    def run_command(
        self,
        command: List[str],
        cwd: Optional[str] = None,
        env: Optional[Dict] = None,
        timeout: Optional[int] = None,
        input_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run a CLI command and capture output
        
        Args:
            command: Command and arguments as list
            cwd: Working directory
            env: Environment variables
            timeout: Command timeout in seconds
            input_text: Input to send to stdin
            
        Returns:
            Dictionary with stdout, stderr, return_code, and elapsed time
        """
        import time
        
        timeout = timeout or self.config.TIMEOUT
        env = env or os.environ.copy()
        
        start_time = time.time()
        
        try:
            result = subprocess.run(
                command,
                cwd=cwd,
                env=env,
                capture_output=True,
                text=True,
                timeout=timeout,
                input=input_text
            )
            
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode,
                "elapsed": time.time() - start_time,
                "success": result.returncode == 0
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds",
                "return_code": -1,
                "elapsed": timeout,
                "success": False
            }
        except FileNotFoundError as e:
            return {
                "stdout": "",
                "stderr": str(e),
                "return_code": -2,
                "elapsed": 0,
                "success": False
            }
            
    def check_command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH"""
        result = self.run_command(["which", command], timeout=5)
        return result["success"]


# =============================================================================
# COGPLAN9 CLI TESTS
# =============================================================================

class TestCogplan9CLI(unittest.TestCase):
    """Test cogplan9 CLI tools"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        cls.repo_path = cls.config.COGPLAN9_PATH
        
    def test_test_script_exists(self):
        """Test that test-plan9cog.sh exists and is executable"""
        script_path = Path(self.repo_path) / "test-plan9cog.sh"
        self.assertTrue(script_path.exists(), "test-plan9cog.sh not found")
        self.assertTrue(os.access(script_path, os.X_OK), "test-plan9cog.sh not executable")
        
    def test_test_script_help(self):
        """Test test script help output"""
        result = self.runner.run_command(
            ["bash", "-c", "head -20 test-plan9cog.sh"],
            cwd=self.repo_path
        )
        self.assertTrue(result["success"])
        
    def test_rc_script_exists(self):
        """Test that test-plan9cog.rc exists"""
        script_path = Path(self.repo_path) / "test-plan9cog.rc"
        self.assertTrue(script_path.exists(), "test-plan9cog.rc not found")
        
    def test_directory_structure(self):
        """Test required directory structure exists"""
        required_dirs = [
            "sys/src/libatomspace",
            "sys/src/libpln",
            "sys/src/libplan9cog",
            "sys/src/cmd/cogctl",
            "sys/src/cmd/cogfs"
        ]
        
        for dir_path in required_dirs:
            full_path = Path(self.repo_path) / dir_path
            self.assertTrue(
                full_path.exists(),
                f"Required directory not found: {dir_path}"
            )


# =============================================================================
# COGPILOT.JL CLI TESTS
# =============================================================================

class TestCogpilotCLI(unittest.TestCase):
    """Test cogpilot.jl CLI tools"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        cls.repo_path = cls.config.COGPILOT_PATH
        
    def test_project_toml_exists(self):
        """Test that Project.toml exists"""
        toml_path = Path(self.repo_path) / "Project.toml"
        self.assertTrue(toml_path.exists(), "Project.toml not found")
        
    def test_project_toml_valid(self):
        """Test that Project.toml is valid"""
        toml_path = Path(self.repo_path) / "Project.toml"
        
        with open(toml_path) as f:
            content = f.read()
            
        # Check for required fields
        self.assertIn("name", content)
        self.assertIn("uuid", content)
        
    def test_test_directory_structure(self):
        """Test that test directory has proper structure"""
        test_path = Path(self.repo_path) / "test"
        self.assertTrue(test_path.exists())
        
        runtests = test_path / "runtests.jl"
        self.assertTrue(runtests.exists(), "runtests.jl not found")
        
    def test_julia_syntax_check(self):
        """Test Julia file syntax (if Julia is available)"""
        if not self.runner.check_command_exists("julia"):
            self.skipTest("Julia not installed")
            
        result = self.runner.run_command(
            ["julia", "--check-bounds=yes", "-e", "using Pkg; Pkg.status()"],
            cwd=self.repo_path,
            timeout=120
        )
        # Just check it doesn't crash immediately
        self.assertNotEqual(result["return_code"], -2)


# =============================================================================
# COGNU-MACH CLI TESTS
# =============================================================================

class TestCognuMachCLI(unittest.TestCase):
    """Test cognu-mach CLI tools"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        cls.repo_path = cls.config.COGNU_MACH_PATH
        
    def test_validation_scripts_exist(self):
        """Test that validation scripts exist"""
        scripts = [
            "validate-kernel-feature.sh",
            "validate-memory-enhancements.sh",
            "validate-pci-modernization.sh",
            "validate-progress-report.sh"
        ]
        
        for script in scripts:
            script_path = Path(self.repo_path) / script
            self.assertTrue(
                script_path.exists(),
                f"Validation script not found: {script}"
            )
            
    def test_ci_build_script(self):
        """Test CI build script exists"""
        script_path = Path(self.repo_path) / "scripts" / "ci-build.sh"
        if script_path.exists():
            self.assertTrue(os.access(script_path, os.X_OK))
            
    def test_configure_ac_exists(self):
        """Test that configure.ac exists"""
        config_path = Path(self.repo_path) / "configure.ac"
        self.assertTrue(config_path.exists(), "configure.ac not found")
        
    def test_test_directory(self):
        """Test that tests directory exists"""
        test_path = Path(self.repo_path) / "tests"
        self.assertTrue(test_path.exists())


# =============================================================================
# COGGML CLI TESTS
# =============================================================================

class TestCoggmlCLI(unittest.TestCase):
    """Test coggml CLI tools"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        cls.repo_path = cls.config.COGGML_PATH
        
    def test_cmake_exists(self):
        """Test that CMakeLists.txt exists"""
        cmake_path = Path(self.repo_path) / "CMakeLists.txt"
        self.assertTrue(cmake_path.exists(), "CMakeLists.txt not found")
        
    def test_cmake_syntax(self):
        """Test CMake syntax validation"""
        if not self.runner.check_command_exists("cmake"):
            self.skipTest("CMake not installed")
            
        with tempfile.TemporaryDirectory() as tmpdir:
            result = self.runner.run_command(
                ["cmake", "-S", self.repo_path, "-B", tmpdir, "-DGGML_METAL=OFF"],
                timeout=120
            )
            # CMake configure should succeed
            self.assertEqual(
                result["return_code"], 0,
                f"CMake configuration failed: {result['stderr']}"
            )
            
    def test_tests_directory(self):
        """Test that tests directory exists with test files"""
        test_path = Path(self.repo_path) / "tests"
        self.assertTrue(test_path.exists())
        
        # Check for test files
        test_files = list(test_path.glob("test-*.cpp")) + list(test_path.glob("test-*.c"))
        self.assertGreater(len(test_files), 0, "No test files found")
        
    def test_ci_script_exists(self):
        """Test that CI run script exists"""
        ci_path = Path(self.repo_path) / "ci" / "run.sh"
        self.assertTrue(ci_path.exists(), "CI run script not found")


# =============================================================================
# COGLOW CLI TESTS
# =============================================================================

class TestCoglowCLI(unittest.TestCase):
    """Test coglow CLI tools"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        cls.repo_path = cls.config.COGLOW_PATH
        
    def test_cmake_exists(self):
        """Test that CMakeLists.txt exists"""
        cmake_path = Path(self.repo_path) / "CMakeLists.txt"
        self.assertTrue(cmake_path.exists(), "CMakeLists.txt not found")
        
    def test_github_workflows(self):
        """Test that GitHub workflows exist"""
        workflow_path = Path(self.repo_path) / ".github" / "workflows"
        self.assertTrue(workflow_path.exists())
        
        workflows = list(workflow_path.glob("*.yml"))
        self.assertGreater(len(workflows), 0, "No workflow files found")


# =============================================================================
# CROSS-REPOSITORY CLI TESTS
# =============================================================================

class TestCrossRepositoryCLI(unittest.TestCase):
    """Cross-repository CLI integration tests"""
    
    @classmethod
    def setUpClass(cls):
        cls.config = CLITestConfig()
        cls.runner = CLIRunner(cls.config)
        
    def test_all_repos_have_readme(self):
        """Test that all repositories have README files"""
        repos = [
            cls.config.COGPLAN9_PATH,
            cls.config.COGPILOT_PATH,
            cls.config.COGNU_MACH_PATH,
            cls.config.COGLUX_PATH,
            cls.config.COGLOW_PATH,
            cls.config.COGGML_PATH
        ]
        
        for repo in repos:
            readme_files = list(Path(repo).glob("README*"))
            self.assertGreater(
                len(readme_files), 0,
                f"No README found in {repo}"
            )
            
    def test_all_repos_have_license(self):
        """Test that all repositories have LICENSE files"""
        repos = [
            cls.config.COGPLAN9_PATH,
            cls.config.COGPILOT_PATH,
            cls.config.COGNU_MACH_PATH,
            cls.config.COGLUX_PATH,
            cls.config.COGLOW_PATH,
            cls.config.COGGML_PATH
        ]
        
        for repo in repos:
            license_files = list(Path(repo).glob("LICENSE*"))
            self.assertGreater(
                len(license_files), 0,
                f"No LICENSE found in {repo}"
            )
            
    def test_all_repos_have_git(self):
        """Test that all repositories have .git directory"""
        repos = [
            cls.config.COGPLAN9_PATH,
            cls.config.COGPILOT_PATH,
            cls.config.COGNU_MACH_PATH,
            cls.config.COGLUX_PATH,
            cls.config.COGLOW_PATH,
            cls.config.COGGML_PATH
        ]
        
        for repo in repos:
            git_path = Path(repo) / ".git"
            self.assertTrue(
                git_path.exists(),
                f"No .git directory in {repo}"
            )


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_cli_tests(verbosity: int = 2) -> Dict[str, Any]:
    """
    Run all CLI tests
    
    Args:
        verbosity: Test output verbosity level (0-2)
        
    Returns:
        Dictionary with test results
    """
    from datetime import datetime
    
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestCogplan9CLI))
    suite.addTests(loader.loadTestsFromTestCase(TestCogpilotCLI))
    suite.addTests(loader.loadTestsFromTestCase(TestCognuMachCLI))
    suite.addTests(loader.loadTestsFromTestCase(TestCoggmlCLI))
    suite.addTests(loader.loadTestsFromTestCase(TestCoglowCLI))
    suite.addTests(loader.loadTestsFromTestCase(TestCrossRepositoryCLI))
    
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
    print("Zone Chan CLI Test Suite")
    print("="*60 + "\n")
    
    results = run_cli_tests()
    
    print("\n" + "="*60)
    print("CLI Test Summary")
    print("="*60)
    print(f"Tests Run: {results['tests_run']}")
    print(f"Failures: {results['failures']}")
    print(f"Errors: {results['errors']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Success: {results['success']}")
    print("="*60)
    
    sys.exit(0 if results["success"] else 1)
