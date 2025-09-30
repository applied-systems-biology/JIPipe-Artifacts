# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build Commands

- Package validation: `python3 scripts/validate_package_downloads.py --packages-dir packages`
- Index building: `python3 scripts/build_index_validating.py --packages-dir packages --out dist/index.json --owner applied-systems-biology --repo jipipe --prefix artifacts --strict`
- Hugo site generation: `cd template && hugo`

## Project-Specific Patterns

- Package JSON files must follow strict field ordering: name, version, query, sources, maintainer, description, homepage, license, tags, includes
- ORAS sources are preferred over HTTP sources
- All packages share identical maintainer information
- Tags are alphabetically sorted in final index regardless of source order
- Package queries use wildcard format: `{group}.{artifact}:{version}-*`

## Critical Gotchas

- Validation scripts must run before index building (exit codes: 0=success, 1=error, 2=validation failed)
- ORAS references require `ghcr.io/` prefix
- Package JSON files cannot contain comments
- Build output goes to `dist/index.json` and must be copied to `template/data/index.json` for Hugo
- No traditional testing framework - validation scripts serve as tests

## Architecture Overview

- JIPipe artifact management system using ORAS and Hugo
- Package definitions → Validation → Index building → Documentation generation
- Maven-style directory structure in `packages/artifacts/`