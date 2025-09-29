#!/usr/bin/env python3

import argparse, json, sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List

def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def is_nonempty_str(x): return isinstance(x, str) and len(x.strip()) > 0

def validate_package(pkg: Dict[str, Any], relpath: Path) -> List[str]:
    errs = []
    req_str = ["name", "version", "query"]
    for k in req_str:
        if k not in pkg or not is_nonempty_str(pkg[k]):
            errs.append(f"{relpath}: missing or empty '{k}' (string required)")
    
    # Validate sources field (required)
    if "sources" not in pkg:
        errs.append(f"{relpath}: 'sources' field is required")
    elif not isinstance(pkg["sources"], list) or len(pkg["sources"]) == 0:
        errs.append(f"{relpath}: 'sources' must be a non-empty array")
    else:
        for i, source in enumerate(pkg["sources"]):
            errs.extend(validate_source(source, relpath, i))
    
    # Check for deprecated container field
    if "container" in pkg:
        errs.append(f"{relpath}: 'container' field is deprecated and no longer supported. Please use 'sources' field instead.")
    
    m = pkg.get("maintainer")
    if not isinstance(m, dict) or not is_nonempty_str(m.get("name","")) or not is_nonempty_str(m.get("email","")):
        errs.append(f"{relpath}: 'maintainer' must be an object with non-empty 'name' and 'email'")
    tags = pkg.get("tags")
    if not isinstance(tags, list) or any(not is_nonempty_str(t) for t in tags or []):
        errs.append(f"{relpath}: 'tags' must be an array of non-empty strings")
    if "includes" in pkg and not isinstance(pkg["includes"], dict):
        errs.append(f"{relpath}: 'includes' must be an object if present")
    if "query" in pkg and isinstance(pkg["query"], str):
        if ":" not in pkg["query"]:
            errs.append(f"{relpath}: 'query' must look like 'group.artifact:tagPattern' (e.g., org.foo.bar:1.0-*)")
    return errs

def validate_source(source: Dict[str, Any], relpath: Path, index: int) -> List[str]:
    errs = []
    prefix = f"{relpath}: sources[{index}]"
    
    # Validate type field
    if "type" not in source or not is_nonempty_str(source["type"]):
        errs.append(f"{prefix}: missing or empty 'type' field")
    elif source["type"] not in ["oras", "http"]:
        errs.append(f"{prefix}: 'type' must be either 'oras' or 'http'")
    
    # Validate ORAS sources
    if source.get("type") == "oras":
        required_fields = ["repo", "rel", "oci-ref"]
        for field in required_fields:
            if field not in source or not is_nonempty_str(source[field]):
                errs.append(f"{prefix}: missing or empty '{field}' field for ORAS source")
        
        # Validate oci-ref format
        oci_ref = source.get("oci-ref", "")
        if not oci_ref.startswith("ghcr.io/"):
            errs.append(f"{prefix}: 'oci-ref' must start with 'ghcr.io/' for ORAS sources")
    
    # Validate HTTPS sources
    elif source.get("type") == "http":
        if "repo" not in source or not is_nonempty_str(source["repo"]):
            errs.append(f"{prefix}: missing or empty 'repo' field for HTTP source")
        
        if "urls" not in source or not isinstance(source["urls"], dict):
            errs.append(f"{prefix}: 'urls' must be an object for HTTP source")
        else:
            # Validate urls structure
            for platform, url in source["urls"].items():
                if not is_nonempty_str(platform) or not is_nonempty_str(url):
                    errs.append(f"{prefix}: 'urls' must contain non-empty platform-to-url mappings")
                elif not url.startswith(("http://", "https://")):
                    errs.append(f"{prefix}: URL for platform '{platform}' must start with 'http://' or 'https://'")
    
    return errs

def build_index(packages_dir: Path, owner: str, repo: str, prefix: str, strict: bool, out_path: Path) -> int:
    files = sorted(packages_dir.rglob("*.json"))
    if not files:
        print(f"[WARN] No package JSON files found under {packages_dir}")
    base = f"ghcr.io/{owner}/{repo}" if owner and repo else ""
    index: Dict[str, Any] = {
        "version": 1,
        "owner": owner,
        "repo": repo,
        "base": base,
        "prefix": prefix,
        "packages": {},
        "updated": now_iso()
    }

    all_errs: List[str] = []

    for f in files:
        try:
            pkg = json.loads(f.read_text(encoding="utf-8"))
        except Exception as e:
            all_errs.append(f"{f.relative_to(packages_dir)}: invalid JSON: {e}")
            continue

        errs = validate_package(pkg, f.relative_to(packages_dir))
        if errs:
            all_errs.extend(errs)
            continue

        # Create entry using query as the unique key
        entry: Dict[str, Any] = {
            "name": pkg["name"].strip(),
            "version": pkg["version"].strip(),
            "query": pkg["query"].strip(),
            "tags": sorted(set(pkg.get("tags", []))),
            "maintainer": {
                "name": pkg["maintainer"]["name"].strip(),
                "email": pkg["maintainer"]["email"].strip()
            },
            "updated": now_iso()
        }
        
        # Handle sources field
        entry["sources"] = pkg["sources"]
        
        # Use query field as the unique key
        unique_key = pkg["query"].strip()
        
        for opt in ("description", "homepage", "license", "includes"):
            if opt in pkg:
                entry[opt] = pkg[opt]

        index["packages"][unique_key] = entry

    if all_errs:
        print("[ERROR] Validation failed for one or more package files:\n")
        for e in all_errs:
            print(" -", e)
        if strict:
            return 2

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(index, indent=2, sort_keys=True), encoding="utf-8")
    print(f"[OK] Wrote index to {out_path} with {len(index['packages'])} package(s).")
    if all_errs and not strict:
        print(f"[WARN] Skipped {len(all_errs)} invalid file(s); index contains only valid entries.")
    return 0

def main():
    ap = argparse.ArgumentParser(description="Build artifacts index with schema validation.")
    ap.add_argument("--packages-dir", default="packages", help="Root directory containing per-package JSON files.")
    ap.add_argument("--out", default="dist/index.json", help="Output index.json path.")
    ap.add_argument("--owner", required=True, help="GitHub org/user for GHCR base (e.g., applied-systems-biology).")
    ap.add_argument("--repo", required=True, help="GitHub repo for GHCR base (e.g., jipipe).")
    ap.add_argument("--prefix", default="maven", help="Logical prefix (stored in index metadata).")
    ap.add_argument("--strict", action="store_true", help="Fail (exit 2) if any package file is invalid.")
    args = ap.parse_args()

    packages_dir = Path(args.packages_dir)
    out_path = Path(args.out)
    rc = build_index(packages_dir, args.owner, args.repo, args.prefix, args.strict, out_path)
    sys.exit(rc)

if __name__ == "__main__":
    main()
