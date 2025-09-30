---
title: "Schema Documentation"
description: "Complete documentation for the JIPipe Artifacts Index v1 JSON schemas"
date: 2025-09-30T12:41:00+00:00
draft: false
weight: 3
type: "schemas"
---

# JIPipe Artifacts Index v1 - Schema Documentation

## Introduction

The JIPipe Artifacts Index v1 is a standardized format for distributing scientific software packages. This documentation provides comprehensive information about the JSON schemas used to define and validate artifact packages, their sources, and metadata.

### Purpose and Scope

The JIPipe Artifacts Index standard aims to:
- Provide a unified format for distributing scientific software packages
- Support both containerized (ORAS) and traditional (HTTP) distribution methods
- Enable automated package discovery and installation
- Maintain consistent metadata across all packages
- Support platform-specific distributions

### Key Concepts and Terminology

| Term | Description |
|------|-------------|
| **ORAS** | OCI Registry As Storage - A standard for storing arbitrary artifacts in OCI registries |
| **OCI** | Open Container Initiative - Governing body for container standards |
| **Query Pattern** | Maven-style pattern used for package resolution (e.g., `org.napari.napari:0.5.5.1000`) |
| **Package** | A software distribution with metadata and source information |
| **Source** | Distribution method (ORAS or HTTP) for package artifacts |
| **Tag** | Platform-specific identifier for package versions |

### How to Use the Schemas

The schemas are designed to be used with JSON Schema validators to ensure compliance with the JIPipe Artifacts Index v1 standard. Each schema provides:

- **Validation rules** for data structure and format
- **Required field definitions** with constraints
- **Error messages** for common validation failures
- **Examples** showing valid usage patterns

### Live Schema Files

All schema files are available for download and validation:

- [Index Schema](/schemas/index.schema.json)
- [Package Schema](/schemas/package.schema.json)
- [Source Schema](/schemas/source.schema.json)
- [Maintainer Schema](/schemas/maintainer.schema.json)
- [Schema Index](/schemas/index.json)

## Schema Overview

The JIPipe Artifacts Index v1 standard consists of five main schemas:

### 1. Index Schema
**File**: [`index.schema.json`](/schemas/index.schema.json)  
**Purpose**: Defines the root structure of the artifacts index  
**Key Features**: Version control, repository metadata, package mappings

### 2. Package Schema
**File**: [`package.schema.json`](/schemas/package.schema.json)  
**Purpose**: Defines individual package metadata and distribution information  
**Key Features**: Package details, maintainer info, source configurations

### 3. Source Schema
**File**: [`source.schema.json`](/schemas/source.schema.json)  
**Purpose**: Defines distribution source configurations (ORAS and HTTP)  
**Key Features**: Platform-specific URLs, repository references

### 4. Maintainer Schema
**File**: [`maintainer.schema.json`](/schemas/maintainer.schema.json)  
**Purpose**: Defines maintainer contact information  
**Key Features**: Name and email validation

### 5. Schema Index
**File**: [`index.json`](/schemas/index.json)  
**Purpose**: Index of all available schemas with metadata  
**Key Features**: Schema catalog, file information, access URLs

## Index Schema Documentation

The Index Schema defines the root structure of the JIPipe Artifacts Index, containing metadata about the repository and mappings to individual packages.

### Root Object Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `version` | integer | Yes | Index version number (must be 1) | `1` |
| `owner` | string | Yes | GitHub organization name | `"applied-systems-biology"` |
| `repo` | string | Yes | GitHub repository name | `"JIPipe-Artifacts"` |
| `base` | string | Yes | Base GHCR URL prefix | `"ghcr.io/applied-systems-biology/jipipe/"` |
| `prefix` | string | Yes | Logical prefix for artifacts | `"artifacts"` |
| `updated` | string | Yes | ISO 8601 timestamp | `"2023-12-07T10:30:00Z"` |
| `packages` | object | Yes | Query-to-package mappings | `{...}` |

### Package Mappings

The `packages` object maps query patterns to package objects:

```json
{
  "org.napari.napari:0.5.5.1000": {
    "name": "napari",
    "version": "0.5.5.1000",
    "query": "org.napari.napari:0.5.5.1000",
    "tags": ["0.5.5.1000-linux_amd64", "0.5.5.1000-macos_amd64"],
    "maintainer": {
      "name": "JIPipe Team",
      "email": "info@applied-systems-biology.org"
    },
    "description": "Fast, interactive, multi-dimensional image viewer for Python",
    "homepage": "https://napari.org/",
    "license": "BSD-3-Clause",
    "sources": [...],
    "updated": "2023-12-07T10:30:00Z"
  }
}
```

### Query Pattern Format

Query patterns follow Maven-style syntax and match an exact version to all available tags, allowing the calling software to select the appropriate tag:

```
{group}.{artifact}:{version}
```

**Examples**:
- `org.napari.napari:0.5.5.1000` - Matches exact version 0.5.5.1000 with all available tags
- `com.github.mouseland.cellpose:2.1.0` - Matches exact version 2.1.0 with all available tags
- `org.python.python_prepackaged:3.8` - Matches exact version 3.8 with all available tags

### Validation Rules

- **Version**: Must be exactly 1 for v1 standard
- **Owner/Repo**: Must match pattern `^[a-zA-Z0-9._-]+$`
- **Base URL**: Must start with `ghcr.io/`
- **Updated**: Must be valid ISO 8601 datetime
- **Query Patterns**: Must follow Maven-style format without wildcard

## Package Schema Documentation

The Package Schema defines the structure of individual package objects, containing metadata, distribution information, and maintainer details.

### Package Object Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | Yes | Package name | `"napari"` |
| `version` | string | Yes | Package version | `"0.5.5.1000"` |
| `query` | string | Yes | Maven-style query pattern | `"org.napari.napari:0.5.5.1000"` |
| `tags` | array | Yes | Available version tags | `["0.5.5.1000-linux_amd64"]` |
| `maintainer` | object | Yes | Maintainer information | `{...}` |
| `description` | string | No | Package description | `"Fast, interactive..."` |
| `homepage` | string | No | Homepage URL | `"https://napari.org/"` |
| `license` | string | No | SPDX identifier or URL to custom license | `"BSD-3-Clause"` or `"https://example.com/license"` |
| `sources` | array | Yes | Distribution sources | `[...]` |
| `includes` | object | No | Additional metadata | `{...}` |
| `updated` | string | Yes | Last update timestamp | `"2023-12-07T10:30:00Z"` |

### Version Format

Package versions follow semantic versioning patterns:

```
^[0-9]+(\.[0-9]+)*$
```

**Valid Examples**:
- `0.5.5.1000` - Four-part version with build number
- `2.1.0` - Standard semantic version
- `1.4.0` - Simple version
- `3.8` - Major-minor version

### Tags Array

The `tags` array contains version-specific tags, following platform-specific naming:

```
^[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9_]+)*$
```

**Examples**:
- `["0.5.5.1000-linux_amd64", "0.5.5.1000-macos_amd64"]`
- `["2.1.0", "2.1.0-linux_gpu_amd64", "2.1.0-linux_gpu_cu118_amd64"]`

### Maintainer Object

```json
{
  "name": "JIPipe Team",
  "email": "info@applied-systems-biology.org"
}
```

**Requirements**:
- `name`: Non-empty string
- `email`: Valid email format

### Includes Field

The `includes` field provides flexible metadata for package-specific information:

```json
{
  "platforms": ["linux/amd64", "darwin/amd64"],
  "dependencies": ["python>=3.8"],
  "categories": ["image-processing", "microscopy"],
  "pip": ["numpy", "scipy"],
  "cran": ["ggplot2", "dplyr"]
}
```

## Source Schema Documentation

The Source Schema defines distribution sources for packages, supporting both ORAS (OCI Registry As Storage) and HTTP-based distribution methods.

### ORAS Source Configuration

ORAS sources use OCI registries for package distribution. The final OCI reference is built by combining the base OCI reference from the source with the specific tag:

```json
{
  "type": "oras",
  "repo": "ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari",
  "rel": "org/napari/napari/napari-0.5.5.1000.json",
  "oci-ref": "ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari/napari"
}
```

**Final OCI Reference Construction**:
- Base: `ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari/napari`
- Tag: `0.5.5.1000-linux_amd64`
- Final: `ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari/napari:0.5.5.1000-linux_amd64`

#### ORAS Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `type` | string | Yes | Must be `"oras"` | `"oras"` |
| `repo` | string | Yes | Repository URL | `"ghcr.io/..."` |
| `rel` | string | Yes | Relative path to metadata | `"org/napari/napari/..."` |
| `oci-ref` | string | Yes | Base OCI reference (without tag) | `"ghcr.io/.../napari"` |

### HTTP Source Configuration

HTTP sources provide direct file downloads with platform-specific URLs:

```json
{
  "type": "http",
  "repo": "https://github.com/napari/napari/releases/download",
  "urls": {
    "0.5.5.1000-linux_amd64": "https://github.com/napari/napari/releases/download/v0.5.5/napari-0.5.5-cp310-cp310-manylinux_2_17_x86_64.whl",
    "0.5.5.1000-macos-arm64": "https://github.com/napari/napari/releases/download/v0.5.5/napari-0.5.5-cp310-cp310-macosx_11_0_arm64.whl"
  }
}
```

#### HTTP Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `type` | string | Yes | Must be `"http"` | `"http"` |
| `repo` | string | Yes | Base repository URL | `"https://github.com/..."` |
| `urls` | object | Yes | Platform-to-URL mappings | `{...}` |

**Important**: The set of tags in the source must be identical to the tags in the package context.

#### Platform Tags

Platform tags follow the format `{os}-{arch}` with optional GPU/CUDA identifiers:

| OS | Architecture | Example |
|----|--------------|---------|
| `linux` | `amd64`, `arm64` | `linux-amd64`, `linux-arm64` |
| `darwin` | `amd64`, `arm64` | `darwin-amd64`, `darwin-arm64` |
| `windows` | `amd64` | `windows-amd64` |

#### GPU/CUDA Tags

GPU tags include CUDA version identifiers using the format `cu{CUDA_VERSION}`:

| CUDA Version | Tag Format | Example |
|-------------|------------|---------|
| CUDA 11.8 | `cu118` | `2.1.0-linux_gpu_cu118_amd64` |
| CUDA 12.1 | `cu121` | `2.1.0-linux_gpu_cu121_amd64` |

**Note**: CUDA identifiers are currently only defined for CUDA, but the format can be extended for other acceleration modes in the future.

### Platform-Specific Examples

#### Cellpose with GPU Support
```json
{
  "type": "oras",
  "repo": "ghcr.io/applied-systems-biology/jipipe/artifacts/com/github/mouseland/cellpose",
  "rel": "artifacts/com/github/mouseland/cellpose",
  "oci-ref": "ghcr.io/applied-systems-biology/jipipe/artifacts/com/github/mouseland/cellpose"
}
```

Tags include GPU variants with CUDA version identifiers:
- `2.1.0-linux_gpu_amd64`
- `2.1.0-linux_gpu_cu118_amd64` (CUDA 11.8)
- `2.1.0-linux_gpu_cu121_amd64` (CUDA 12.1)

#### ORAS CLI Direct Download
```json
{
  "type": "http",
  "repo": "main",
  "urls": {
    "1.3.0-linux_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_linux_amd64.tar.gz",
    "1.3.0-macos_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_darwin_amd64.tar.gz",
    "1.3.0-macos-arm64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_darwin_arm64.tar.gz",
    "1.3.0-windows_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_windows_amd64.zip"
  }
}
```

**Note**: The tags in the `urls` object must match exactly with the tags defined in the package's `tags` array.

## Maintainer Schema Documentation

The Maintainer Schema defines the structure for maintainer information, ensuring consistent contact details across all packages.

### Maintainer Object Structure

```json
{
  "name": "JIPipe Team",
  "email": "info@applied-systems-biology.org"
}
```

### Field Requirements

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | Yes | Maintainer name | Non-empty string |
| `email` | string | Yes | Email address | Valid email format |

### Email Format Requirements

Email addresses must follow standard email format patterns:
- Must contain `@` symbol
- Must have valid domain structure
- No spaces or special characters outside allowed patterns

**Valid Examples**:
- `info@applied-systems-biology.org`
- `ruman.gerst@leibniz-hki.de`
- `john.doe@example.com`

**Invalid Examples**:
- `invalid-email`
- `user@.com`
- `user@domain`

### Best Practices for Maintainer Information

1. **Use Team Names**: For institutional packages, use team or organization names
2. **Provide Valid Emails**: Ensure email addresses are actively monitored
3. **Consistency**: Use the same maintainer information across related packages
4. **Professional Names**: Use full names or official team designations
5. **Domain Ownership**: Use email addresses from domains you control

## Examples

### Complete Index Example

```json
{
  "version": 1,
  "owner": "applied-systems-biology",
  "repo": "JIPipe-Artifacts",
  "base": "ghcr.io/applied-systems-biology/jipipe/",
  "prefix": "artifacts",
  "updated": "2023-12-07T10:30:00Z",
  "packages": {
    "org.napari.napari:0.5.5.1000": {
      "name": "napari",
      "version": "0.5.5.1000",
      "query": "org.napari.napari:0.5.5.1000",
      "tags": ["0.5.5.1000-linux_amd64", "0.5.5.1000-macos_amd64"],
      "maintainer": {
        "name": "JIPipe Team",
        "email": "info@applied-systems-biology.org"
      },
      "description": "Fast, interactive, multi-dimensional image viewer for Python",
      "homepage": "https://napari.org/",
      "license": "BSD-3-Clause",
      "sources": [
        {
          "type": "oras",
          "repo": "ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari",
          "rel": "org/napari/napari/napari-0.5.5.1000.json",
          "oci-ref": "ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari/napari"
        }
      ],
      "updated": "2023-12-07T10:30:00Z"
    },
    "com.github.mouseland.cellpose:2.1.0": {
      "name": "cellpose",
      "version": "2.1.0",
      "query": "com.github.mouseland.cellpose:2.1.0",
      "tags": ["2.1.0", "2.1.0-linux_gpu_amd64", "2.1.0-linux_gpu_cu118_amd64"],
      "maintainer": {
        "name": "Ruman Gerst",
        "email": "ruman.gerst@leibniz-hki.de"
      },
      "description": "Cellpose standalone distribution",
      "homepage": "https://github.com/mouseland/cellpose",
      "license": "BSD-3-Clause",
      "sources": [
        {
          "type": "oras",
          "repo": "ghcr.io/applied-systems-biology/jipipe/artifacts/com/github/mouseland/cellpose",
          "rel": "artifacts/com/github/mouseland/cellpose",
          "oci-ref": "ghcr.io/applied-systems-biology/jipipe/artifacts/com/github/mouseland/cellpose"
        }
      ],
      "includes": {
        "pip": []
      },
      "updated": "2023-12-07T10:30:00Z"
    }
  }
}
```

### Individual Package Examples

#### ORAS-based Package (Napari)
```json
{
  "name": "napari",
  "version": "0.5.5.1000",
  "query": "org.napari.napari:0.5.5.1000",
  "sources": [
    {
      "type": "oras",
      "repo": "ghcr",
      "rel": "artifacts/org/napari/napari",
      "oci-ref": "ghcr.io/applied-systems-biology/jipipe/artifacts/org/napari/napari"
    }
  ],
  "maintainer": {
    "name": "Ruman Gerst",
    "email": "ruman.gerst@leibniz-hki.de"
  },
  "description": "napari - fast, interactive, multi-dimensional image viewer for Python",
  "homepage": "https://napari.org",
  "license": "BSD-3-Clause",
  "tags": [
    "0.5.5.1000-linux_amd64",
    "0.5.5.1000-macos_amd64",
    "0.5.5.1000-macos_arm64",
    "0.5.5.1000-windows_amd64"
  ]
}
```

#### HTTP-based Package (ORAS CLI)
```json
{
  "name": "oras",
  "version": "1.3.0",
  "query": "land.oras.oras:1.3.0",
  "sources": [
    {
      "type": "http",
      "repo": "main",
      "urls": {
        "1.3.0-linux_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_linux_amd64.tar.gz",
        "1.3.0-macos_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_darwin_amd64.tar.gz",
        "1.3.0-macos-arm64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_darwin_arm64.tar.gz",
        "1.3.0-windows_amd64": "https://github.com/oras-project/oras/releases/download/v1.3.0/oras_1.3.0_windows_amd64.zip"
      }
    }
  ],
  "maintainer": {
    "name": "Ruman Gerst",
    "email": "ruman.gerst@leibniz-hki.de"
  },
  "description": "Download for ORAS",
  "homepage": "https://oras.land/",
  "license": "Apache-2.0",
  "tags": [
    "1.3.0-linux_amd64",
    "1.3.0-macos_amd64",
    "1.3.0-macos-arm64",
    "1.3.0-windows_amd64"
  ]
}
```

### Edge Cases and Validation Examples

#### Invalid Query Pattern
```json
// INVALID: Wildcard not supported
"query": "org.napari.napari:0.5.5-*"

// INVALID: Wrong format
"query": "napari:0.5.5.1000"

// INVALID: Invalid characters
"query": "org@napari.napari:0.5.5.1000"
```

#### Invalid Version Format
```json
// INVALID: Letters in version
"version": "1.2.3-alpha"

// INVALID: Empty version
"version": ""

// INVALID: Invalid characters
"version": "1.2.3.4.5"
```

#### Invalid Email Format
```json
// INVALID: Missing @ symbol
"email": "invalid-email"

// INVALID: Invalid domain
"email": "user@.com"

// INVALID: Empty email
"email": ""
```

## Best Practices

### Naming Conventions

#### Package Names
- Use lowercase letters, numbers, and hyphens
- Avoid spaces and special characters
- Follow standard naming conventions for your ecosystem
- Be consistent with upstream project names

**Examples**:
- ✅ `napari`, `cellpose`, `tesseract`
- ❌ `Napari`, `cell pose`, `tesseract-ocr`

#### Group IDs
- Use reverse domain name notation (Maven-style)
- Follow your organization's naming conventions
- Be consistent across related packages

**Examples**:
- ✅ `org.napari`, `com.github.mouseland`, `org.python`
- ❌ `napari`, `github.com/mouseland`, `python`

#### Version Management
- Use semantic versioning when possible
- Include build numbers for pre-release versions
- Be consistent with upstream versioning schemes
- Consider using JIPipe-specific version suffixes

**Examples**:
- ✅ `0.5.5.1000`, `2.1.0`, `1.4.0`
- ❌ `0.5.5-beta`, `2.1.0-rc1`, `latest`

### Tag Organization

#### Tag Naming Strategy
- Use consistent tag naming across packages
- Include platform information for multi-platform packages
- Consider adding feature tags for special builds

**Examples**:
- `2.1.0-linux_amd64`
- `2.1.0-linux_gpu_amd64`
- `2.1.0-macos_arm64`
- `1.3.0-windows_amd64`

#### Tag Best Practices
- Use lowercase letters and numbers
- Separate components with underscores
- Include version information in all tags
- Avoid spaces and special characters

### Maintainer Information Guidelines

#### Professional Standards
- Use official team or organizational names
- Provide actively monitored email addresses
- Update maintainer information when responsibilities change
- Use consistent information across related packages

#### Email Best Practices
- Use institutional or organizational email addresses
- Ensure email addresses are actively monitored
- Provide contact information for support inquiries
- Consider using team mailing lists for institutional packages

### Documentation Standards

#### Package Descriptions
- Provide clear, concise descriptions
- Include key features and use cases
- Mention supported platforms and dependencies
- Reference official documentation when available

#### Homepage and Links
- Use official project URLs when available
- Ensure links are active and accessible
- Provide links to documentation, repositories, and issue trackers
- Consider including links to related projects or dependencies

## Validation and Troubleshooting

### Schema Validation

#### Using JSON Schema Validators
```bash
# Using python-jsonschema
python -m jsonschema package.json package.schema.json

# Using online validators
# Visit https://www.jsonschemavalidator.net/
```

#### Common Validation Errors

1. **Missing Required Fields**
   ```
   Error: Required fields missing: ['name', 'version', 'query']
   ```

2. **Invalid Query Pattern**
   ```
   Error: Query pattern must match format 'group.artifact:version'
   ```

3. **Invalid Email Format**
   ```
   Error: Email must be a valid email address
   ```

4. **Invalid Version Format**
   ```
   Error: Version must match pattern '^[0-9]+(\.[0-9]+)*$'
   ```

### Troubleshooting Common Issues

#### Query Pattern Issues
- **Problem**: Query patterns not matching expected packages
- **Solution**: Ensure proper Maven-style format without wildcard
- **Example**: `org.napari.napari:0.5.5.1000` instead of `org.napari.napari:0.5.5-*`

#### Source Configuration Issues
- **Problem**: ORAS references not working
- **Solution**: Verify repository URLs and ensure base OCI references don't include tags
- **Example**: Ensure `ghcr.io/.../napari` (no tag) instead of `ghcr.io/.../napari:tag`

#### Platform Tag Issues
- **Problem**: Platform-specific downloads not working
- **Solution**: Use correct platform tag format
- **Example**: `linux-amd64` instead of `linux_x86_64`

#### Tag Consistency Issues
- **Problem**: HTTP source URLs not matching package tags
- **Solution**: Ensure exact match between source URLs and package tags
- **Example**: Package tag `1.3.0-linux_amd64` must match URL key `1.3.0-linux_amd64`

### Migration Guide

#### From Older Formats
1. **Query Pattern Migration**
   - Old: `napari:0.5.5`
   - New: `org.napari.napari:0.5.5.1000`

2. **Version Format Migration**
   - Old: `0.5.5-beta`
   - New: `0.5.5.1000`

3. **Tag Format Migration**
   - Old: `0.5.5-linux`
   - New: `0.5.5.1000-linux_amd64`
   - Old: `0.5.5-linux-gpu`
   - New: `0.5.5.1000-linux_gpu_amd64` or `0.5.5.1000-linux_gpu_cu118_amd64`

#### Migration Best Practices
- Test migrated packages thoroughly
- Update documentation to reflect new format
- Update build scripts and CI/CD pipelines
- Communicate changes to users

## Integration Examples

### For Package Managers

#### Python Package Integration
```python
import json
import requests

def fetch_package(query):
    url = "https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json"
    response = requests.get(url)
    index = response.json()
    
    if query in index['packages']:
        package = index['packages'][query]
        return package
    return None

# Example usage
package = fetch_package("org.napari.napari:0.5.5.1000")
if package:
    print(f"Found package: {package['name']} v{package['version']}")
```

#### Command Line Integration
```bash
#!/bin/bash
# Download package using query pattern
QUERY="org.napari.napari:0.5.5.1000"
INDEX_URL="https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json"

# Fetch package information
PACKAGE=$(curl -s "$INDEX_URL" | jq -r ".packages.\"$QUERY\"")

if [ "$PACKAGE" != "null" ]; then
    NAME=$(echo "$PACKAGE" | jq -r '.name')
    VERSION=$(echo "$PACKAGE" | jq -r '.version')
    echo "Downloading $NAME version $VERSION"
    
    # Extract download URL (simplified example)
    SOURCE=$(echo "$PACKAGE" | jq -r '.sources[0]')
    if [ "$(echo "$SOURCE" | jq -r '.type')" = "http" ]; then
        URL=$(echo "$SOURCE" | jq -r '.urls | keys[]' | head -1)
        curl -L -o "$NAME-$VERSION.tar.gz" "$URL"
    fi
else
    echo "Package not found: $QUERY"
fi
```

### For CI/CD Pipelines

#### GitHub Actions Example
```yaml
name: Validate Package Definition

on:
  pull_request:
    paths:
      - 'packages/**/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          pip install jsonschema requests
          
      - name: Validate package schemas
        run: |
          python scripts/validate_packages.py
          
      - name: Check package downloads
        run: |
          python scripts/validate_downloads.py
```

#### Docker Integration
```dockerfile
FROM python:3.9-slim

# Install JIPipe artifacts
RUN pip install requests

# Download and install package using JIPipe artifacts
RUN python -c "
import requests, json, os, tarfile

# Fetch index
index = requests.get('https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json').json()

# Find package
package = index['packages'].get('org.napari.napari:0.5.5.1000')
if package:
    source = package['sources'][0]
    if source['type'] == 'http':
        for platform, url in source['urls'].items():
            if 'linux' in platform:
                response = requests.get(url)
                with open('/tmp/package.tar.gz', 'wb') as f:
                    f.write(response.content)
                break
"

# Extract and install
RUN tar -xzf /tmp/package.tar.gz -C /usr/local/
RUN rm /tmp/package.tar.gz

ENTRYPOINT ["/usr/local/bin/napari"]
```

## Live Index Access

The complete JIPipe Artifacts Index is available at:
[https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json](https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json)

This live index can be used by:
- Package managers for automatic discovery
- CI/CD pipelines for integration
- Documentation generators
- Analysis tools and scripts
- Manual browsing and inspection

## Additional Resources

### Related Documentation
- [JIPipe Documentation](https://applied-systems-biology.github.io/JIPipe-Documentation/)
- [ORAS Specification](https://oras.land/)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [JSON Schema Documentation](https://json-schema.org/)

### Tools and Utilities
- [Package Validation Scripts](https://github.com/applied-systems-biology/JIPipe-Artifacts/tree/main/scripts)
- [Hugo Site Generator](https://gohugo.io/)
- [JSON Schema Validator](https://www.jsonschemavalidator.net/)

### Community and Support
- [GitHub Issues](https://github.com/applied-systems-biology/JIPipe-Artifacts/issues)
- [Discussions](https://github.com/applied-systems-biology/JIPipe-Artifacts/discussions)
- [Email Support](mailto:info@applied-systems-biology.org)

---

This documentation provides a comprehensive reference for the JIPipe Artifacts Index v1 standard. For additional questions or clarifications, please refer to the linked resources or contact the development team.