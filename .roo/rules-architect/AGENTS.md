# AGENTS.md - Architect Mode

This file provides mode-specific guidance for AI assistants working in architect mode on the JIPipe-Artifacts repository.

## Hidden Coupling Between Components

- **Tight coupling between validation and index building**: The [`scripts/build_index_validating.py`](scripts/build_index_validating.py) script performs both validation and index building in a single pass, making it impossible to separate these concerns
- **Hugo template-data coupling**: The Hugo template directly references `template/data/index.json` but the build script outputs to `dist/index.json` - this manual copy step is a hidden architectural dependency
- **ORAS HTTP source duality**: The system supports both ORAS and HTTP sources, but they use completely different data structures and validation logic, creating a dual-architecture that's hard to maintain
- **File naming convention coupling**: Package files must be named `{artifact}-{version}.json` due to globbing patterns in scripts, creating a tight coupling between file naming and processing logic

## Undocumented Architectural Decisions

- **Maven-style query format**: The decision to use Maven-style queries (`{group}.{artifact}:{version}-*`) instead of simpler identifiers wasn't documented
- **ORAS as primary source**: ORAS sources are preferred over HTTP sources, but the architectural rationale (consistency, versioning, etc.) isn't documented
- **Single maintainer model**: All packages share the same maintainer information, which suggests a centralized maintenance model but isn't documented
- **Tag-based versioning**: The use of platform-specific tags (e.g., "1.4.0-linux_amd64") instead of semantic versioning is an architectural decision that affects how packages are versioned and distributed

## Non-Standard Patterns That Must Be Followed

- **Validation-first pipeline**: The pipeline requires validation before index building, with different exit codes (0=success, 1=error, 2=validation failed) - this non-standard exit code convention affects CI/CD design
- **JSON schema enforcement**: The system enforces a strict JSON schema through code rather than schema files, making it harder to validate changes
- **Dual-source package definition**: Packages can define sources as either ORAS or HTTP, but not both, creating an either/or architectural pattern
- **Manual index copying**: The requirement to manually copy `dist/index.json` to `template/data/index.json` is a brittle architectural pattern that should be automated

## Performance Bottlenecks Discovered Through Investigation

- **Sequential validation**: The validation scripts process packages sequentially rather than in parallel, which could be a bottleneck for large numbers of packages
- **HTTP timeout inefficiency**: Each HTTP URL check has a 10-second timeout, but there's no connection pooling or retry logic, making validation slow for unreliable URLs
- **ORAS manifest retrieval**: The ORAS client retrieves full manifests just to check accessibility, which is inefficient for simple validation
- **File system globbing**: The use of `rglob("*.json")` to find package files could be slow for large repositories as it scans the entire directory tree
- **JSON parsing overhead**: Each package file is parsed multiple times - once during validation and once during index building, without caching
- **Hugo regeneration**: The entire Hugo site is regenerated even for small index changes, rather than using incremental builds