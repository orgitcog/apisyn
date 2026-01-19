#!/usr/bin/env python3
"""
Zone Chan Unit Test Suite
=========================
Unit tests for core functionality across all cogpy repositories.

This test suite validates:
- Source code structure
- Header file completeness
- Build system configuration
- Test file coverage
- Documentation completeness

Author: Manus AI
"""

import os
import sys
import re
import unittest
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass
from collections import defaultdict


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class UnitTestConfig:
    """Unit Test Configuration"""
    REPOS = {
        "cogplan9": "/home/ubuntu/cogplan9",
        "cogpilot.jl": "/home/ubuntu/cogpilot.jl",
        "cognu-mach": "/home/ubuntu/cognu-mach",
        "coglux": "/home/ubuntu/coglux",
        "coglow": "/home/ubuntu/coglow",
        "coggml": "/home/ubuntu/coggml"
    }


# =============================================================================
# SOURCE CODE ANALYZER
# =============================================================================

class SourceCodeAnalyzer:
    """Analyze source code structure and quality"""
    
    def __init__(self, repo_path: Path):
        self.repo_path = repo_path
        
    def count_files_by_extension(self, extensions: List[str]) -> Dict[str, int]:
        """Count files by extension"""
        counts = defaultdict(int)
        
        for ext in extensions:
            files = list(self.repo_path.rglob(f"*{ext}"))
            # Exclude .git directory
            files = [f for f in files if ".git" not in str(f)]
            counts[ext] = len(files)
            
        return dict(counts)
        
    def find_source_files(self, extensions: List[str] = None) -> List[Path]:
        """Find all source files"""
        extensions = extensions or [".c", ".cpp", ".h", ".hpp", ".jl", ".py"]
        files = []
        
        for ext in extensions:
            found = list(self.repo_path.rglob(f"*{ext}"))
            found = [f for f in found if ".git" not in str(f)]
            files.extend(found)
            
        return files
        
    def find_test_files(self) -> List[Path]:
        """Find all test files"""
        patterns = ["test_*.py", "*_test.py", "test_*.c", "test_*.cpp", 
                   "test*.jl", "*_test.jl", "runtests.jl"]
        files = []
        
        for pattern in patterns:
            found = list(self.repo_path.rglob(pattern))
            found = [f for f in found if ".git" not in str(f)]
            files.extend(found)
            
        return files
        
    def find_header_files(self) -> List[Path]:
        """Find all header files"""
        headers = []
        for ext in [".h", ".hpp"]:
            found = list(self.repo_path.rglob(f"*{ext}"))
            found = [f for f in found if ".git" not in str(f)]
            headers.extend(found)
        return headers
        
    def check_include_guards(self, header_path: Path) -> bool:
        """Check if header has include guards"""
        try:
            with open(header_path, 'r', errors='ignore') as f:
                content = f.read()
                
            # Check for #ifndef / #define pattern or #pragma once
            has_ifndef = bool(re.search(r'#ifndef\s+\w+', content))
            has_pragma_once = '#pragma once' in content
            
            return has_ifndef or has_pragma_once
        except Exception:
            return False
            
    def calculate_test_coverage_ratio(self) -> float:
        """Calculate ratio of test files to source files"""
        source_files = self.find_source_files([".c", ".cpp", ".jl", ".py"])
        test_files = self.find_test_files()
        
        if not source_files:
            return 0.0
            
        return len(test_files) / len(source_files)


# =============================================================================
# COGPLAN9 UNIT TESTS
# =============================================================================

class TestCogplan9Unit(unittest.TestCase):
    """Unit tests for cogplan9"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(UnitTestConfig.REPOS["cogplan9"])
        cls.analyzer = SourceCodeAnalyzer(cls.repo_path)
        
    def test_source_structure(self):
        """Test source directory structure"""
        required_dirs = [
            "sys/src/libatomspace",
            "sys/src/libpln",
            "sys/src/libplan9cog",
            "sys/src/cmd/cogctl",
            "sys/src/cmd/cogfs"
        ]
        
        for dir_path in required_dirs:
            full_path = self.repo_path / dir_path
            self.assertTrue(
                full_path.exists(),
                f"Required directory not found: {dir_path}"
            )
            
    def test_c_source_files_exist(self):
        """Test that C source files exist"""
        c_files = list(self.repo_path.rglob("*.c"))
        c_files = [f for f in c_files if ".git" not in str(f)]
        
        self.assertGreater(len(c_files), 0, "No C source files found")
        
    def test_header_files_exist(self):
        """Test that header files exist"""
        h_files = self.analyzer.find_header_files()
        self.assertGreater(len(h_files), 0, "No header files found")
        
    def test_mkfiles_exist(self):
        """Test that mkfiles exist for build system"""
        mkfiles = list(self.repo_path.rglob("mkfile"))
        mkfiles = [f for f in mkfiles if ".git" not in str(f)]
        
        self.assertGreater(len(mkfiles), 0, "No mkfiles found")
        
    def test_documentation_files(self):
        """Test documentation files exist"""
        doc_files = [
            "PLAN9COG_README.md",
            "PLAN9COG_GUIDE.md",
            "ARCHITECTURE.md"
        ]
        
        for doc in doc_files:
            doc_path = self.repo_path / doc
            self.assertTrue(
                doc_path.exists(),
                f"Documentation file not found: {doc}"
            )


# =============================================================================
# COGPILOT.JL UNIT TESTS
# =============================================================================

class TestCogpilotUnit(unittest.TestCase):
    """Unit tests for cogpilot.jl"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(UnitTestConfig.REPOS["cogpilot.jl"])
        cls.analyzer = SourceCodeAnalyzer(cls.repo_path)
        
    def test_julia_source_files_exist(self):
        """Test that Julia source files exist"""
        jl_files = list(self.repo_path.rglob("*.jl"))
        jl_files = [f for f in jl_files if ".git" not in str(f)]
        
        self.assertGreater(len(jl_files), 0, "No Julia source files found")
        
    def test_project_toml_structure(self):
        """Test Project.toml has required fields"""
        toml_path = self.repo_path / "Project.toml"
        
        with open(toml_path) as f:
            content = f.read()
            
        required_fields = ["name", "uuid", "version"]
        for field in required_fields:
            self.assertIn(field, content, f"Project.toml missing {field}")
            
    def test_src_directory_exists(self):
        """Test src directory exists"""
        src_path = self.repo_path / "src"
        self.assertTrue(src_path.exists(), "src directory not found")
        
    def test_test_directory_structure(self):
        """Test test directory has proper structure"""
        test_path = self.repo_path / "test"
        self.assertTrue(test_path.exists(), "test directory not found")
        
        runtests = test_path / "runtests.jl"
        self.assertTrue(runtests.exists(), "runtests.jl not found")
        
    def test_test_files_exist(self):
        """Test that test files exist"""
        test_files = self.analyzer.find_test_files()
        self.assertGreater(len(test_files), 0, "No test files found")
        
    def test_subpackages_exist(self):
        """Test that subpackages exist"""
        subpackages = [
            "ModelingToolkit.jl",
            "DifferentialEquations.jl",
            "NeuralPDE.jl"
        ]
        
        for pkg in subpackages:
            pkg_path = self.repo_path / pkg
            self.assertTrue(
                pkg_path.exists(),
                f"Subpackage not found: {pkg}"
            )


# =============================================================================
# COGNU-MACH UNIT TESTS
# =============================================================================

class TestCognuMachUnit(unittest.TestCase):
    """Unit tests for cognu-mach"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(UnitTestConfig.REPOS["cognu-mach"])
        cls.analyzer = SourceCodeAnalyzer(cls.repo_path)
        
    def test_c_source_files_exist(self):
        """Test that C source files exist"""
        c_files = list(self.repo_path.rglob("*.c"))
        c_files = [f for f in c_files if ".git" not in str(f)]
        
        self.assertGreater(len(c_files), 0, "No C source files found")
        
    def test_header_files_exist(self):
        """Test that header files exist"""
        h_files = self.analyzer.find_header_files()
        self.assertGreater(len(h_files), 0, "No header files found")
        
    def test_configure_ac_exists(self):
        """Test configure.ac exists"""
        config_path = self.repo_path / "configure.ac"
        self.assertTrue(config_path.exists(), "configure.ac not found")
        
    def test_kernel_directories_exist(self):
        """Test kernel directories exist"""
        kernel_dirs = ["kern", "vm", "ipc", "device"]
        
        for dir_name in kernel_dirs:
            dir_path = self.repo_path / dir_name
            self.assertTrue(
                dir_path.exists(),
                f"Kernel directory not found: {dir_name}"
            )
            
    def test_arch_directories_exist(self):
        """Test architecture directories exist"""
        arch_dirs = ["i386", "x86_64"]
        
        for arch in arch_dirs:
            arch_path = self.repo_path / arch
            self.assertTrue(
                arch_path.exists(),
                f"Architecture directory not found: {arch}"
            )
            
    def test_tests_directory_exists(self):
        """Test tests directory exists"""
        tests_path = self.repo_path / "tests"
        self.assertTrue(tests_path.exists(), "tests directory not found")


# =============================================================================
# COGGML UNIT TESTS
# =============================================================================

class TestCoggmlUnit(unittest.TestCase):
    """Unit tests for coggml"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(UnitTestConfig.REPOS["coggml"])
        cls.analyzer = SourceCodeAnalyzer(cls.repo_path)
        
    def test_cpp_source_files_exist(self):
        """Test that C++ source files exist"""
        cpp_files = list(self.repo_path.rglob("*.cpp"))
        cpp_files = [f for f in cpp_files if ".git" not in str(f)]
        
        self.assertGreater(len(cpp_files), 0, "No C++ source files found")
        
    def test_c_source_files_exist(self):
        """Test that C source files exist"""
        c_files = list(self.repo_path.rglob("*.c"))
        c_files = [f for f in c_files if ".git" not in str(f)]
        
        self.assertGreater(len(c_files), 0, "No C source files found")
        
    def test_cmake_configuration(self):
        """Test CMake configuration exists"""
        cmake_path = self.repo_path / "CMakeLists.txt"
        self.assertTrue(cmake_path.exists(), "CMakeLists.txt not found")
        
    def test_include_directory_exists(self):
        """Test include directory exists"""
        include_path = self.repo_path / "include"
        self.assertTrue(include_path.exists(), "include directory not found")
        
    def test_src_directory_exists(self):
        """Test src directory exists"""
        src_path = self.repo_path / "src"
        self.assertTrue(src_path.exists(), "src directory not found")
        
    def test_tests_directory_exists(self):
        """Test tests directory exists"""
        tests_path = self.repo_path / "tests"
        self.assertTrue(tests_path.exists(), "tests directory not found")
        
    def test_test_files_exist(self):
        """Test that test files exist in tests directory"""
        tests_path = self.repo_path / "tests"
        test_files = list(tests_path.glob("test-*.cpp")) + list(tests_path.glob("test-*.c"))
        
        self.assertGreater(len(test_files), 0, "No test files found")
        
    def test_examples_directory_exists(self):
        """Test examples directory exists"""
        examples_path = self.repo_path / "examples"
        self.assertTrue(examples_path.exists(), "examples directory not found")


# =============================================================================
# COGLOW UNIT TESTS
# =============================================================================

class TestCoglowUnit(unittest.TestCase):
    """Unit tests for coglow"""
    
    @classmethod
    def setUpClass(cls):
        cls.repo_path = Path(UnitTestConfig.REPOS["coglow"])
        cls.analyzer = SourceCodeAnalyzer(cls.repo_path)
        
    def test_cpp_source_files_exist(self):
        """Test that C++ source files exist"""
        cpp_files = list(self.repo_path.rglob("*.cpp"))
        cpp_files = [f for f in cpp_files if ".git" not in str(f)]
        
        self.assertGreater(len(cpp_files), 0, "No C++ source files found")
        
    def test_cmake_configuration(self):
        """Test CMake configuration exists"""
        cmake_path = self.repo_path / "CMakeLists.txt"
        self.assertTrue(cmake_path.exists(), "CMakeLists.txt not found")


# =============================================================================
# CROSS-REPOSITORY UNIT TESTS
# =============================================================================

class TestCrossRepositoryUnit(unittest.TestCase):
    """Cross-repository unit tests"""
    
    def test_all_repos_have_source_files(self):
        """Test all repositories have source files"""
        for repo_name, repo_path in UnitTestConfig.REPOS.items():
            analyzer = SourceCodeAnalyzer(Path(repo_path))
            source_files = analyzer.find_source_files()
            
            self.assertGreater(
                len(source_files), 0,
                f"No source files found in {repo_name}"
            )
            
    def test_all_repos_have_test_coverage(self):
        """Test all repositories have some test files"""
        for repo_name, repo_path in UnitTestConfig.REPOS.items():
            analyzer = SourceCodeAnalyzer(Path(repo_path))
            test_files = analyzer.find_test_files()
            
            # At least some test files should exist
            self.assertGreater(
                len(test_files), 0,
                f"No test files found in {repo_name}"
            )
            
    def test_file_counts(self):
        """Test file counts across repositories"""
        total_counts = defaultdict(int)
        
        for repo_name, repo_path in UnitTestConfig.REPOS.items():
            analyzer = SourceCodeAnalyzer(Path(repo_path))
            counts = analyzer.count_files_by_extension([".c", ".cpp", ".h", ".hpp", ".jl", ".py"])
            
            for ext, count in counts.items():
                total_counts[ext] += count
                
        # Should have significant number of source files
        total_source = sum(total_counts.values())
        self.assertGreater(total_source, 100, "Expected more source files across repos")


# =============================================================================
# CODE QUALITY UNIT TESTS
# =============================================================================

class TestCodeQualityUnit(unittest.TestCase):
    """Code quality unit tests"""
    
    def test_cogplan9_header_guards(self):
        """Test cogplan9 headers have include guards"""
        repo_path = Path(UnitTestConfig.REPOS["cogplan9"])
        analyzer = SourceCodeAnalyzer(repo_path)
        
        headers = analyzer.find_header_files()
        headers_without_guards = []
        
        for header in headers[:20]:  # Check first 20 headers
            if not analyzer.check_include_guards(header):
                headers_without_guards.append(header.name)
                
        # Allow some headers without guards (might be intentional)
        self.assertLess(
            len(headers_without_guards), 10,
            f"Many headers missing include guards: {headers_without_guards}"
        )
        
    def test_coggml_header_guards(self):
        """Test coggml headers have include guards"""
        repo_path = Path(UnitTestConfig.REPOS["coggml"])
        analyzer = SourceCodeAnalyzer(repo_path)
        
        headers = analyzer.find_header_files()
        headers_without_guards = []
        
        for header in headers:
            if not analyzer.check_include_guards(header):
                headers_without_guards.append(header.name)
                
        # Most headers should have guards
        guard_ratio = 1 - (len(headers_without_guards) / max(len(headers), 1))
        self.assertGreater(guard_ratio, 0.5, "Too many headers missing include guards")


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_unit_tests(verbosity: int = 2) -> Dict[str, Any]:
    """
    Run all unit tests
    
    Args:
        verbosity: Test output verbosity level (0-2)
        
    Returns:
        Dictionary with test results
    """
    from datetime import datetime
    
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestCogplan9Unit))
    suite.addTests(loader.loadTestsFromTestCase(TestCogpilotUnit))
    suite.addTests(loader.loadTestsFromTestCase(TestCognuMachUnit))
    suite.addTests(loader.loadTestsFromTestCase(TestCoggmlUnit))
    suite.addTests(loader.loadTestsFromTestCase(TestCoglowUnit))
    suite.addTests(loader.loadTestsFromTestCase(TestCrossRepositoryUnit))
    suite.addTests(loader.loadTestsFromTestCase(TestCodeQualityUnit))
    
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
    print("Zone Chan Unit Test Suite")
    print("="*60 + "\n")
    
    results = run_unit_tests()
    
    print("\n" + "="*60)
    print("Unit Test Summary")
    print("="*60)
    print(f"Tests Run: {results['tests_run']}")
    print(f"Failures: {results['failures']}")
    print(f"Errors: {results['errors']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Success: {results['success']}")
    print("="*60)
    
    sys.exit(0 if results["success"] else 1)
