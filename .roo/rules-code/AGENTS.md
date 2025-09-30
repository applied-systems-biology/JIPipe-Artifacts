# AGENTS.md - Code Mode

This file provides mode-specific guidance for AI assistants working in code mode on the JIPipe-Artifacts repository.

## Custom Utilities That Replace Standard Approaches

- **Package JSON validation**: Use [`scripts/build_index_validating.py`](scripts/build_index_validating.py) instead of generic JSON validation - it enforces strict field ordering and business rules
- **Package download validation**: Use [`scripts/validate_package_downloads.py`](scripts/validate_package_downloads.py) instead of generic HTTP/OCI checks - it validates both ORAS and HTTP sources with project-specific logic
- **Index building**: The build script automatically validates and transforms package definitions into the final index format

## Non-Standard Patterns Unique to This Project

- **Package JSON field ordering**: Must follow exact sequence: `name`, `version`, `query`, `sources`, `maintainer`, `description`, `homepage`, `license`, `tags`, `includes`
- **Query format**: Uses wildcard pattern `{group}.{artifact}:{version}-*` for Maven-style compatibility
- **Tag sorting**: Tags are alphabetically sorted in final index regardless of source order in individual package files
- **Maintainer consistency**: The maintainer is to be extracted from Git

## Hidden Dependencies or Coupling Between Components

- **ORAS client dependency**: The validation scripts depend on the `oras` Python package but don't declare it in [`pyproject.toml`](pyproject.toml) - it's only used in validation
- **GitHub coupling**: ORAS references are hardcoded to use `ghcr.io/applied-systems-biology/jipipe/artifacts/` prefix
- **Hugo template coupling**: The generated index must be copied from `dist/index.json` to `template/data/index.json` for Hugo to consume
- **File system coupling**: Package files must be named `{artifact}-{version}.json` to work with the globbing patterns in scripts

## Required Import Orders or Naming Conventions Not Enforced by Linters

- **Import order**: Python scripts use `from pathlib import Path` before standard library imports
- **Function naming**: Validation functions use `validate_*` prefix, collection functions use `collect_*` prefix
- **Variable naming**: Package variables use `pkg` abbreviation, file paths use `f` abbreviation
- **Exit code conventions**: Validation script uses exit code 2 for validation failures (not standard 1)
- **JSON field naming**: All JSON field names use snake_case even when the original artifact names use camelCase