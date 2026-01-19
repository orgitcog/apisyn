# Zone Chan Test Suite

A comprehensive testing and release build infrastructure for the cogpy repository ecosystem, integrated with Zone Chan App credentials for Shopify Partner API authentication.

## Overview

This test suite provides:

- **API Tests**: Validates Zone Chan App authentication and Shopify Partner API integration
- **CLI Tests**: Tests command-line interfaces across all repositories
- **E2E CI Tests**: End-to-end validation of GitHub Actions workflows
- **Unit Tests**: Source code structure and quality validation
- **Release Builds**: Cross-platform release artifact generation

## Repositories Covered

| Repository | Language | Build System | Description |
|------------|----------|--------------|-------------|
| cogplan9 | C | Plan 9 mk | Plan 9 cognitive computing libraries |
| cogpilot.jl | Julia | Pkg | Scientific ML modeling toolkit |
| cognu-mach | C | Autotools | GNU Mach microkernel |
| coglux | C | Make | Linux kernel fork |
| coglow | C++ | CMake | Glow neural network compiler |
| coggml | C/C++ | CMake | GGML tensor library |

## Quick Start

### Prerequisites

```bash
# Python 3.11+
pip install requests pyyaml

# Clone repositories (optional, for full testing)
gh repo clone cogpy/cogplan9
gh repo clone cogpy/cogpilot.jl
gh repo clone cogpy/cognu-mach
gh repo clone cogpy/coglux
gh repo clone cogpy/coglow
gh repo clone cogpy/coggml
```

### Environment Variables

```bash
# Zone Chan App Credentials (required for API tests)
export SHP_ZONE_CHAN_APP_CLIENT_ID="your_client_id"
export SHP_ZONE_CHAN_APP_SECRET="your_client_secret"

# Shopify Partner API (optional, for Partner API tests)
export SHOPIFY_PARTNER_CLIENT_API="your_partner_api_token"
```

### Running Tests

```bash
# Run all tests
python3 run_all_tests.py

# Run specific test suite
python3 run_all_tests.py --suite api
python3 run_all_tests.py --suite cli
python3 run_all_tests.py --suite e2e
python3 run_all_tests.py --suite unit
python3 run_all_tests.py --suite release

# Save results to file
python3 run_all_tests.py --output results.json

# Adjust verbosity
python3 run_all_tests.py --verbosity 0  # Quiet
python3 run_all_tests.py --verbosity 2  # Verbose
```

## Test Suites

### API Tests (`api/test_zone_chan_api.py`)

Tests Zone Chan App authentication and Shopify Partner API integration:

- Credential validation
- HMAC signature generation
- OAuth flow simulation
- GraphQL query execution
- Rate limiting compliance
- Error handling

### CLI Tests (`cli/test_cli.py`)

Tests command-line interfaces across repositories:

- Script existence and executability
- Directory structure validation
- Build system configuration
- Cross-repository consistency

### E2E CI Tests (`e2e/test_e2e_ci.py`)

Validates GitHub Actions workflows:

- Workflow file syntax
- Required workflow elements
- Job configuration
- Matrix build setup
- Artifact handling
- Release workflow integrity

### Unit Tests (`unit/test_unit.py`)

Source code structure and quality validation:

- Source file existence
- Header file completeness
- Include guard verification
- Test coverage ratio
- Documentation presence

### Release Build (`release/release_config.py`)

Cross-platform release artifact generation:

- Version management
- Build configuration
- Artifact signing with Zone Chan credentials
- Release manifest generation

## CI/CD Integration

### GitHub Actions Workflows

The suite includes ready-to-use GitHub Actions workflows:

- `.github/workflows/zone-chan-ci.yml` - Continuous integration
- `.github/workflows/zone-chan-release.yml` - Release builds

### Required Secrets

Configure these secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `SHP_ZONE_CHAN_APP_CLIENT_ID` | Zone Chan App Client ID |
| `SHP_ZONE_CHAN_APP_SECRET` | Zone Chan App Client Secret |
| `SHOPIFY_PARTNER_CLIENT_API` | Shopify Partner API Token |

## Directory Structure

```
zone-chan-test-suite/
├── .github/
│   └── workflows/
│       ├── zone-chan-ci.yml
│       └── zone-chan-release.yml
├── api/
│   └── test_zone_chan_api.py
├── cli/
│   └── test_cli.py
├── e2e/
│   └── test_e2e_ci.py
├── unit/
│   └── test_unit.py
├── release/
│   ├── release_config.py
│   └── output/
├── run_all_tests.py
└── README.md
```

## Test Results

Results are output in JSON format:

```json
{
  "timestamp": "2026-01-07T...",
  "suite": "all",
  "results": {
    "API Tests": {
      "tests_run": 12,
      "failures": 0,
      "errors": 0,
      "skipped": 0,
      "success": true
    },
    ...
  },
  "overall_success": true
}
```

## Zone Chan App Integration

The Zone Chan App credentials are used for:

1. **API Authentication**: Validating Shopify Partner API access
2. **HMAC Signing**: Generating secure signatures for artifacts
3. **Release Verification**: Signing release packages for authenticity

### Credential Format

- **Client ID**: 32-character hexadecimal string
- **Client Secret**: 32-character string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - See LICENSE file for details.

## Support

For issues related to:
- **Test suite**: Open an issue in this repository
- **Zone Chan App**: Contact Shopify Partner support
- **Individual repositories**: Open issues in respective repositories
