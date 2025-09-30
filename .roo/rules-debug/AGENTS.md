# AGENTS.md - Debug Mode

This file provides mode-specific guidance for AI assistants working in debug mode on the JIPipe-Artifacts repository.

## Hidden Log Locations Not Mentioned in Docs

- **Validation script output**: The [`scripts/validate_package_downloads.py`](scripts/validate_package_downloads.py) script prints detailed ORAS manifest data to stdout during validation (line 70), which can be useful for debugging ORAS connectivity issues
- **Build script validation errors**: The [`scripts/build_index_validating.py`](scripts/build_index_validating.py) script outputs validation errors with relative file paths, making it hard to locate files without knowing the packages directory structure
- **Hugo build logs**: Hugo errors are only visible when running from the `template` directory - errors from missing templates or data files won't show in the project root

## Non-Standard Debugging Tools or Flags

- **ORAS client debug mode**: The ORAS client in [`scripts/validate_package_downloads.py`](scripts/validate_package_downloads.py) doesn't expose debug flags, but you can add `print(manifest)` after line 68 to see the full manifest structure
- **Strict validation mode**: The build script has `--strict` flag that changes exit code from 1 to 2 for validation failures, which affects CI/CD pipeline behavior
- **HTTP timeout control**: The HTTP validation uses a 10-second timeout (line 50 in validate_package_downloads.py) that can't be configured via command line

## Gotchas That Cause Silent Failures

- **Missing ORAS dependency**: If the `oras` Python package isn't installed, the validation script will fail with an unhelpful "No module named 'oras'" error instead of a clear dependency message
- **JSON comment handling**: Package JSON files cannot contain comments, but the parser doesn't warn about this - it just fails silently during validation
- **Tag mismatches**: If HTTP source tags don't match the package's tags array, the validation script raises an exception but doesn't provide clear guidance on which tags are mismatched
- **Case sensitivity**: Package names and queries are case-sensitive, but the validation doesn't enforce consistency across similar package names
- **Empty arrays**: The validation allows empty arrays in certain fields (like `includes.pip`), but this can cause issues in downstream consumption

## Required Environment Variables for Debugging

- **PYTHONPATH**: Not required, but the scripts expect to be run from the project root directory due to relative path assumptions
- **HTTP_PROXY**: The HTTP validation uses `requests` which respects system proxy settings, but this isn't documented
- **ORAS_REGISTRY**: The ORAS client doesn't use environment variables for registry configuration - all registry URLs are hardcoded
- **HUGO_ENV**: Hugo uses this to determine environment, but it's not set in the build process