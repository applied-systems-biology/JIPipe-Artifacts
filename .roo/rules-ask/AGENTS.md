# AGENTS.md - Ask Mode

This file provides mode-specific guidance for AI assistants working in ask mode on the JIPipe-Artifacts repository.

## Hidden or Misnamed Documentation

- **Missing API documentation**: There's no API documentation for the JSON schema used in package files - you must infer it from the validation script in [`scripts/build_index_validating.py`](scripts/build_index_validating.py)
- **Undocumented Hugo data structure**: The Hugo template expects data in `template/data/index.json` but this isn't documented - it's discovered by examining [`template/themes/jipipe-theme/layouts/index.html`](template/themes/jipipe-theme/layouts/index.html:66)
- **Misleading script names**: [`scripts/build_index_validating.py`](scripts/build_index_validating.py) both validates and builds, but the name suggests it only builds
- **Hidden dependency documentation**: The ORAS dependency is only mentioned in the validation script, not in any README or documentation

## Counterintuitive Code Organization

- **Reverse dependency flow**: The Hugo template depends on the generated index, but the index generation depends on package JSON files - this reverse dependency isn't obvious from the directory structure
- **Mixed concerns**: The validation script handles both HTTP and ORAS validation, but these are logically separate concerns that should be in different modules
- **Template coupling**: The package card template is in [`template/themes/jipipe-theme/layouts/partials/package-card.html`](template/themes/jipipe-theme/layouts/partials/package-card.html) but the data structure is defined in the Python build script
- **Hidden configuration**: Hugo configuration is split between [`template/hugo.toml`](template/hugo.toml) and theme-specific files, making it hard to understand the full configuration

## Misleading Folder Names or Structures

- **"packages" directory**: The `packages/` directory contains individual package JSON files, not actual packages - this is confusing for newcomers
- **"artifacts" subdirectory**: The `packages/artifacts/` directory uses Maven-style organization but doesn't contain actual artifacts, just metadata
- **"template" directory**: The `template/` directory contains both Hugo templates and static assets, but the name suggests only templates
- **"dist" output**: The build output goes to `dist/index.json` but this directory isn't created by default and isn't in the repository structure

## Important Context Not Evident from File Structure

- **Git maintainer extraction**: The maintainer information is supposed to be extracted from Git, but all packages currently have hardcoded maintainer data - this isn't obvious from the code structure
- **Tag versioning scheme**: Tags follow a `{version}-{platform}` pattern (e.g., "1.4.0-linux_amd64") but this isn't documented anywhere
- **ORAS repository structure**: ORAS packages are stored in a specific directory structure under `ghcr.io/applied-systems-biology/jipipe/artifacts/` that mirrors the package hierarchy
- **HTTP source limitations**: HTTP sources require manual URL mapping for each platform, while ORAS sources handle this automatically - this architectural decision isn't documented
- **Index generation workflow**: The workflow is: validate packages → build index → copy to template → generate Hugo site - this multi-step process isn't obvious from the file structure alone