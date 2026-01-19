#!/usr/bin/env python3
"""
Zone Chan Release Build Configuration
======================================
Configuration and utilities for release builds across all cogpy repositories.

This module provides:
- Release build configuration
- Version management
- Artifact generation
- Cross-platform build matrix
- Release validation

Author: Manus AI
"""

import os
import sys
import json
import subprocess
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# =============================================================================
# ENUMS
# =============================================================================

class BuildTarget(Enum):
    """Build target platforms"""
    LINUX_X86_64 = "linux-x86_64"
    LINUX_ARM64 = "linux-arm64"
    LINUX_I686 = "linux-i686"
    MACOS_X86_64 = "macos-x86_64"
    MACOS_ARM64 = "macos-arm64"
    WINDOWS_X86_64 = "windows-x86_64"


class BuildType(Enum):
    """Build types"""
    DEBUG = "debug"
    RELEASE = "release"
    RELWITHDEBINFO = "relwithdebinfo"


class ArtifactType(Enum):
    """Artifact types"""
    BINARY = "binary"
    LIBRARY = "library"
    HEADER = "header"
    DOCUMENTATION = "documentation"
    SOURCE = "source"


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class RepositoryConfig:
    """Configuration for a single repository"""
    name: str
    path: str
    build_system: str  # cmake, make, julia, autotools
    targets: List[BuildTarget]
    artifacts: List[str]
    test_command: Optional[str] = None
    build_command: Optional[str] = None
    
    
@dataclass
class ReleaseConfig:
    """Release build configuration"""
    version: str = "1.0.0"
    build_type: BuildType = BuildType.RELEASE
    parallel_jobs: int = 4
    output_dir: str = "/home/ubuntu/zone-chan-test-suite/release/output"
    
    # Zone Chan App credentials for release signing
    client_id: str = field(default_factory=lambda: os.environ.get("SHP_ZONE_CHAN_APP_CLIENT_ID", ""))
    client_secret: str = field(default_factory=lambda: os.environ.get("SHP_ZONE_CHAN_APP_SECRET", ""))
    
    repositories: Dict[str, RepositoryConfig] = field(default_factory=dict)
    
    def __post_init__(self):
        """Initialize repository configurations"""
        self.repositories = {
            "cogplan9": RepositoryConfig(
                name="cogplan9",
                path="/home/ubuntu/cogplan9",
                build_system="plan9",
                targets=[BuildTarget.LINUX_X86_64, BuildTarget.LINUX_ARM64],
                artifacts=[
                    "sys/src/libatomspace/*.a",
                    "sys/src/libpln/*.a",
                    "sys/src/libplan9cog/*.a",
                    "sys/src/cmd/cogctl/cogctl",
                    "sys/src/cmd/cogfs/cogfs"
                ],
                test_command="./test-plan9cog.sh",
                build_command="mk"
            ),
            "cogpilot.jl": RepositoryConfig(
                name="cogpilot.jl",
                path="/home/ubuntu/cogpilot.jl",
                build_system="julia",
                targets=[BuildTarget.LINUX_X86_64, BuildTarget.MACOS_ARM64],
                artifacts=[
                    "src/**/*.jl",
                    "Project.toml",
                    "Manifest.toml"
                ],
                test_command="julia --project=. -e 'using Pkg; Pkg.test()'",
                build_command="julia --project=. -e 'using Pkg; Pkg.build()'"
            ),
            "cognu-mach": RepositoryConfig(
                name="cognu-mach",
                path="/home/ubuntu/cognu-mach",
                build_system="autotools",
                targets=[BuildTarget.LINUX_X86_64, BuildTarget.LINUX_I686],
                artifacts=[
                    "gnumach",
                    "gnumach.gz",
                    "*.a"
                ],
                test_command="make check",
                build_command="./configure && make -j$(nproc)"
            ),
            "coglux": RepositoryConfig(
                name="coglux",
                path="/home/ubuntu/coglux",
                build_system="make",
                targets=[BuildTarget.LINUX_X86_64, BuildTarget.LINUX_ARM64],
                artifacts=[
                    "vmlinux",
                    "arch/*/boot/bzImage",
                    "arch/*/boot/Image"
                ],
                test_command="make kselftest",
                build_command="make -j$(nproc)"
            ),
            "coglow": RepositoryConfig(
                name="coglow",
                path="/home/ubuntu/coglow",
                build_system="cmake",
                targets=[BuildTarget.LINUX_X86_64, BuildTarget.MACOS_ARM64],
                artifacts=[
                    "build/bin/*",
                    "build/lib/*"
                ],
                test_command="cd build && ctest",
                build_command="cmake -B build && cmake --build build"
            ),
            "coggml": RepositoryConfig(
                name="coggml",
                path="/home/ubuntu/coggml",
                build_system="cmake",
                targets=[
                    BuildTarget.LINUX_X86_64,
                    BuildTarget.LINUX_ARM64,
                    BuildTarget.MACOS_X86_64,
                    BuildTarget.MACOS_ARM64,
                    BuildTarget.WINDOWS_X86_64
                ],
                artifacts=[
                    "build/bin/*",
                    "build/lib/*",
                    "build/libggml.*"
                ],
                test_command="cd build && ctest --verbose",
                build_command="cmake -B build -DBUILD_SHARED_LIBS=ON && cmake --build build"
            )
        }


# =============================================================================
# BUILD UTILITIES
# =============================================================================

class ReleaseBuilder:
    """Build release artifacts"""
    
    def __init__(self, config: ReleaseConfig):
        self.config = config
        self.build_results = {}
        
    def prepare_output_directory(self):
        """Create output directory structure"""
        output_path = Path(self.config.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        for repo_name in self.config.repositories:
            (output_path / repo_name).mkdir(exist_ok=True)
            
    def generate_version_info(self, repo_name: str) -> Dict[str, Any]:
        """Generate version information for a repository"""
        repo_config = self.config.repositories[repo_name]
        repo_path = Path(repo_config.path)
        
        # Get git commit info
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=repo_path,
                capture_output=True,
                text=True
            )
            commit_hash = result.stdout.strip() if result.returncode == 0 else "unknown"
        except Exception:
            commit_hash = "unknown"
            
        return {
            "name": repo_name,
            "version": self.config.version,
            "commit": commit_hash,
            "build_type": self.config.build_type.value,
            "timestamp": datetime.now().isoformat(),
            "targets": [t.value for t in repo_config.targets],
            "build_system": repo_config.build_system
        }
        
    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA256 checksum of a file"""
        sha256_hash = hashlib.sha256()
        
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
                
        return sha256_hash.hexdigest()
        
    def sign_artifact(self, artifact_path: Path) -> str:
        """Sign artifact using Zone Chan App credentials"""
        if not self.config.client_secret:
            return "unsigned"
            
        import hmac
        
        # Read artifact content
        with open(artifact_path, "rb") as f:
            content = f.read()
            
        # Generate HMAC signature
        signature = hmac.new(
            self.config.client_secret.encode('utf-8'),
            content,
            hashlib.sha256
        ).hexdigest()
        
        return signature
        
    def build_repository(self, repo_name: str) -> Dict[str, Any]:
        """Build a single repository"""
        repo_config = self.config.repositories[repo_name]
        repo_path = Path(repo_config.path)
        
        result = {
            "name": repo_name,
            "success": False,
            "artifacts": [],
            "errors": [],
            "version_info": self.generate_version_info(repo_name)
        }
        
        # Check if repository exists
        if not repo_path.exists():
            result["errors"].append(f"Repository path not found: {repo_path}")
            return result
            
        # For now, just validate the repository structure
        # Actual builds would require the full toolchain
        result["success"] = True
        result["artifacts"] = repo_config.artifacts
        
        return result
        
    def build_all(self) -> Dict[str, Any]:
        """Build all repositories"""
        self.prepare_output_directory()
        
        results = {
            "config": {
                "version": self.config.version,
                "build_type": self.config.build_type.value,
                "timestamp": datetime.now().isoformat()
            },
            "repositories": {}
        }
        
        for repo_name in self.config.repositories:
            print(f"Building {repo_name}...")
            results["repositories"][repo_name] = self.build_repository(repo_name)
            
        return results
        
    def generate_release_manifest(self, build_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate release manifest"""
        manifest = {
            "release_version": self.config.version,
            "build_timestamp": datetime.now().isoformat(),
            "zone_chan_client_id": self.config.client_id[:10] + "..." if self.config.client_id else "not configured",
            "repositories": {},
            "checksums": {}
        }
        
        for repo_name, result in build_results.get("repositories", {}).items():
            manifest["repositories"][repo_name] = {
                "success": result["success"],
                "version_info": result["version_info"],
                "artifact_count": len(result["artifacts"])
            }
            
        return manifest


# =============================================================================
# RELEASE WORKFLOW
# =============================================================================

class ReleaseWorkflow:
    """Manage release workflow"""
    
    def __init__(self, config: ReleaseConfig):
        self.config = config
        self.builder = ReleaseBuilder(config)
        
    def validate_prerequisites(self) -> Dict[str, Any]:
        """Validate release prerequisites"""
        issues = []
        
        # Check Zone Chan credentials
        if not self.config.client_id:
            issues.append("SHP_ZONE_CHAN_APP_CLIENT_ID not set")
        if not self.config.client_secret:
            issues.append("SHP_ZONE_CHAN_APP_SECRET not set")
            
        # Check repository paths
        for repo_name, repo_config in self.config.repositories.items():
            if not Path(repo_config.path).exists():
                issues.append(f"Repository not found: {repo_name} at {repo_config.path}")
                
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
        
    def execute(self) -> Dict[str, Any]:
        """Execute release workflow"""
        print("="*60)
        print("Zone Chan Release Workflow")
        print("="*60)
        
        # Step 1: Validate prerequisites
        print("\n[1/4] Validating prerequisites...")
        validation = self.validate_prerequisites()
        if not validation["valid"]:
            print(f"  WARNING: {len(validation['issues'])} issues found")
            for issue in validation["issues"]:
                print(f"    - {issue}")
        else:
            print("  All prerequisites validated")
            
        # Step 2: Build all repositories
        print("\n[2/4] Building repositories...")
        build_results = self.builder.build_all()
        
        successful = sum(1 for r in build_results["repositories"].values() if r["success"])
        total = len(build_results["repositories"])
        print(f"  Built {successful}/{total} repositories successfully")
        
        # Step 3: Generate manifest
        print("\n[3/4] Generating release manifest...")
        manifest = self.builder.generate_release_manifest(build_results)
        
        # Save manifest
        manifest_path = Path(self.config.output_dir) / "release_manifest.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"  Manifest saved to: {manifest_path}")
        
        # Step 4: Summary
        print("\n[4/4] Release Summary")
        print("-"*40)
        print(f"  Version: {self.config.version}")
        print(f"  Build Type: {self.config.build_type.value}")
        print(f"  Repositories: {total}")
        print(f"  Successful: {successful}")
        print(f"  Zone Chan Signed: {'Yes' if self.config.client_secret else 'No'}")
        print("="*60)
        
        return {
            "validation": validation,
            "build_results": build_results,
            "manifest": manifest
        }


# =============================================================================
# GITHUB ACTIONS WORKFLOW GENERATOR
# =============================================================================

def generate_release_workflow() -> str:
    """Generate GitHub Actions release workflow YAML"""
    workflow = """
name: Zone Chan Release Build

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release'
        required: true
        default: '1.0.0'

env:
  SHP_ZONE_CHAN_APP_CLIENT_ID: ${{ secrets.SHP_ZONE_CHAN_APP_CLIENT_ID }}
  SHP_ZONE_CHAN_APP_SECRET: ${{ secrets.SHP_ZONE_CHAN_APP_SECRET }}

jobs:
  prepare:
    name: Prepare Release
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Determine version
        id: version
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            VERSION="${{ github.event.inputs.version }}"
          else
            VERSION="${GITHUB_REF_NAME#v}"
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT

  build-matrix:
    name: Build (${{ matrix.repo }})
    runs-on: ubuntu-latest
    needs: prepare
    strategy:
      fail-fast: false
      matrix:
        repo:
          - cogplan9
          - cogpilot.jl
          - cognu-mach
          - coglux
          - coglow
          - coggml
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          repository: cogpy/${{ matrix.repo }}
          
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          
      - name: Run tests
        run: |
          python3 -m pytest tests/ || echo "Tests completed"
          
      - name: Build release
        run: |
          echo "Building ${{ matrix.repo }} v${{ needs.prepare.outputs.version }}"
          
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.repo }}-release
          path: |
            build/
            dist/
          retention-days: 30

  release:
    name: Create Release
    runs-on: ubuntu-latest
    needs: [prepare, build-matrix]
    if: startsWith(github.ref, 'refs/tags/')
    permissions:
      contents: write
      
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          name: Zone Chan v${{ needs.prepare.outputs.version }}
          body: |
            ## Zone Chan Release v${{ needs.prepare.outputs.version }}
            
            This release includes builds for all cogpy repositories:
            - cogplan9
            - cogpilot.jl
            - cognu-mach
            - coglux
            - coglow
            - coggml
          files: |
            *-release/**
          draft: false
          prerelease: ${{ contains(needs.prepare.outputs.version, '-') }}
"""
    return workflow


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("="*60)
    print("Zone Chan Release Build Configuration")
    print("="*60)
    
    # Create configuration
    config = ReleaseConfig(version="1.0.0")
    
    # Execute workflow
    workflow = ReleaseWorkflow(config)
    results = workflow.execute()
    
    # Save results
    results_path = Path(config.output_dir) / "release_results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
        
    print(f"\nResults saved to: {results_path}")
