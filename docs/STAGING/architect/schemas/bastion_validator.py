#!/usr/bin/env python3
"""
BASTION Deterministic Archival Linter & Mathematical Validator
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

def audit_markdown_file(filepath: str) -> list:
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
    # Also check entire file for Bonus Features, REDACTED, ellipses, ASCII trees
    for label, pat in PROHIBITED_PATTERNS[-3:]:
        matches = pat.findall(txt)
        if matches:
            findings.append(f"{filepath} (FULL FILE): {label} -> {matches}")
    return findings

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    all_findings = []
    md_count = 0
    if os.path.isfile(target):
        md_count = 1
        all_findings.extend(audit_markdown_file(target))
    else:
        for root, _, files in os.walk(target):
            for fn in sorted(files):
                if fn.endswith(".md"):
                    md_count += 1
                    all_findings.extend(audit_markdown_file(os.path.join(root, fn)))
    print(f"BASTION Audit Complete: {md_count} Markdown files scanned, {len(all_findings)} violations found.")
    for item in all_findings:
        print(" [VIOLATION]", item)
    sys.exit(1 if all_findings else 0)
