#!/usr/bin/env python3
"""
BASTION Deterministic Archival Linter, Mathematical Validator & Two-Tier SSOT Enforcer
"""
import os, re, sys, json

PROHIBITED_PATTERNS = [
    ("Rule 1 (1d20/d20/2d20)", re.compile(r"\b(?:1d20|2d20|d20)\b", re.I)),
    ("Rule 2 (Difficulty Class/DC)", re.compile(r"\b(?:Difficulty Class|DCs?)\b")),
    ("Rule 5 (Build Point/BP)", re.compile(r"\b(?:Build Points?|BP)\b")),
    ("Rule 7 (Dexterity)", re.compile(r"\bDexterity\b", re.I)),
    ("Rule 7 (Constitution)", re.compile(r"\bConstitution\b", re.I)),
    ("Rule 11 (Awareness)", re.compile(r"\bAwareness\b")),
    ("Rule 11 (Sense Motive)", re.compile(r"\bSense Motive\b")),
    ("Rule 11 (Linguistics)", re.compile(r"\bLinguistics\b")),
    ("Rule 11 (Animal Handling)", re.compile(r"\bAnimal Handling\b")),
    ("Rule 3 (Rolling with Hindrance)", re.compile(r"Rolling with Hindrance", re.I)),
    ("Directory Topology (book_and_page)", re.compile(r"book_and_page", re.I)),
    ("Legacy Terminology (Bonus Features)", re.compile(r"Bonus Features", re.I)),
    ("Redaction / Placeholder ([REDACTED]/TBD/...)", re.compile(r"\[REDACTED\]|\bTBD\b|\.\.\.")),
    ("ASCII Tree Diagram", re.compile(r"[├└│]")),
]

REQUIRED_HUB_HEADERS = [
    "## Overview & Mechanical Authority Block",
    "## Part I — Alignment & Summary Matrix Table",
    "## Part II — Complete Unabridged Profiles & Rules Entries",
    "## Part III — Discrepancy & Restoration Ledger",
]

def audit_markdown_file(filepath: str, base_dir: str = None) -> list:
    with open(filepath, "r", encoding="utf-8") as f:
        txt = f.read()
    body = re.split(r"^#{2,3}\s+(?:Part III — )?DISCREPANCY & RESTORATION LEDGER", txt, maxsplit=1, flags=re.M | re.I)[0]
    body_clean = re.sub(r"Never use `[^`]+`", "", body)
    body_clean = re.sub(r"PROHIBITED_PATTERNS = \[.*?\]", "", body_clean, flags=re.S)
    findings = []
    for label, pat in PROHIBITED_PATTERNS:
        matches = pat.findall(body_clean)
        if matches:
            findings.append(f"{filepath}: {label} -> {matches}")
    for label, pat in PROHIBITED_PATTERNS[-3:]:
        matches = pat.findall(txt)
        if matches:
            findings.append(f"{filepath} (FULL FILE): {label} -> {matches}")

    # Two-Tier SSOT Structural Checks
    lines = txt.splitlines()
    first_line = lines[0] if lines else ""
    if not first_line.startswith("# "):
        findings.append(f"{filepath}: Line 1 must start with canonical '# ' heading (found: {first_line[:40]!r})")

    if base_dir:
        rel_dir = os.path.relpath(os.path.dirname(filepath), base_dir)
        if rel_dir in (".", "operator", "architect"):
            for req in REQUIRED_HUB_HEADERS:
                if req not in txt:
                    findings.append(f"{filepath} (Master Hub): Missing required section {req!r}")
        else:
            if re.search(r"^##\s+\**(?:Overview & Mechanical Authority Block|DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK|MECHANICAL AUTHORITY & CANONICAL RULES BLOCK)", txt, re.M | re.I):
                findings.append(f"{filepath} (Subfolder Leaf): Must not contain top-level Authority Block wrapper")
            if re.search(r"^#{2,3}\s+\**(?:Part III\s*[—:]\s*)?DISCREPANCY & RESTORATION LEDGER", txt, re.M | re.I):
                findings.append(f"{filepath} (Subfolder Leaf): Must not contain top-level Discrepancy Ledger")

    return findings

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    all_findings = []
    md_count = 0
    if os.path.isfile(target):
        md_count = 1
        all_findings.extend(audit_markdown_file(target))
    else:
        for root, _, files in sorted(os.walk(target)):
            for fn in sorted(files):
                if fn.endswith(".md"):
                    md_count += 1
                    all_findings.extend(audit_markdown_file(os.path.join(root, fn), target))
    print(f"BASTION Audit Complete: {md_count} Markdown files scanned, {len(all_findings)} violations found.")
    for item in all_findings:
        print(" [VIOLATION]", item)
    sys.exit(1 if all_findings else 0)
