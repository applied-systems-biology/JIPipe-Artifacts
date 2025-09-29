#!/usr/bin/env python3

from pathlib import Path
import argparse
import json
import requests
import os
import sys
import re
import urllib.parse
import oras
import oras.client

def collect_package_downloads(packages_dir : Path):
    downloads = []
    files = sorted(packages_dir.rglob("*.json"))
    if not files:
        print(f"[WARN] No package JSON files found under {packages_dir}")

    for f in files:
        pkg = json.loads(f.read_text(encoding="utf-8"))
        tags = pkg["tags"]
        for source in pkg["sources"]:
            if source["type"] == "http":
                # Iterate through the urls
                for tag, url in source["urls"].items():
                    if not tag in tags:
                        raise Exception(f"Unknown tag {tag}: HTTP source in {f}")
                    downloads.append({
                        "file": f,
                        "tag": tag,
                        "type": "http",
                        "reference": url,
                    })
            elif source["type"] == "oras":
                for tag in tags:
                    downloads.append({
                        "file": f,
                        "tag": tag,
                        "type": "oras",
                        "reference": source["oci-ref"] + ":" + tag,
                    })
            else:
                print("Warning: Unknown source type {}".format(source["type"]))

    return downloads

def check_http(url):
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def check_oras(oci_ref):
    """
    Check if an ORAS package reference is accessible.

    Args:
        oci_ref (str): The full OCI reference including tag (e.g., "ghcr.io/namespace/repo:tag")

    Returns:
        bool: True if the reference is accessible, False otherwise
    """
    try:
        # Create an ORAS client
        client = oras.client.OrasClient()
        manifest = client.get_manifest(oci_ref)

        print(manifest)

        return True
    except Exception as e:
        print(e)
        return False

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Check if packages can be downloaded.")
    ap.add_argument("--packages-dir", default="packages", help="Root directory containing per-package JSON files.")
    args = ap.parse_args()
    packages_dir = Path(args.packages_dir)
    downloads = collect_package_downloads(packages_dir)

    successes = []
    failures = []

    for download in downloads:
        is_valid = False
        if download["type"] == "http":
            is_valid = check_http(download["reference"])
        elif download["type"] == "oras":
            is_valid = check_oras(download["reference"])
        
        if is_valid:
            successes.append(download)
        else:
            failures.append(download)

    # Print results with formatted output
    for download in successes:
        print(f"✓ [{download['file']}] : [{download['tag']}] : [{download['type']}] : [{download['reference']}]")
    
    for download in failures:
        print(f"✗ [{download['file']}] : [{download['tag']}] : [{download['type']}] : [{download['reference']}]")

    # Print summary statistics
    total = len(successes) + len(failures)
    print(f"\nSummary: {len(successes)} successful, {len(failures)} failed, {total} total")

    # Exit with proper error code
    if failures:
        sys.exit(1)
    else:
        sys.exit(0)

