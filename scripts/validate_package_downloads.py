#!/usr/bin/env python3

from pathlib import Path
import argparse
import json

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
                        "uri": url,
                    })
            elif source["type"] == "oras":
                for tag in tags:
                    downloads.append({
                        "file": f,
                        "tag": tag,
                        "type": "oras",
                        "uri": source["oci-ref"] + ":" + tag,
                    })
            else:
                print("Warning: Unknown source type {}".format(source["type"]))

    return downloads

def check_http(url):
    # TODO
    return False

def check_oras(uri):
    return False

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Check if packages can be downloaded.")
    ap.add_argument("--packages-dir", default="packages", help="Root directory containing per-package JSON files.")
    args = ap.parse_args()
    packages_dir = Path(args.packages_dir)
    downloads = collect_package_downloads(packages_dir)

    # TODO: go through each download, check based on type if it's valid
    # Collect successes, failures
    # At the end print: (checkmark) vs (cross) [file] : [tag] : [type] : [uri]
    # Summary at the end
    # exit with error code if failure

