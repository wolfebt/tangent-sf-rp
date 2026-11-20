#!/usr/bin/env python3
"""
BASTION Deterministic Archival Linter, JSON Schema Validator & EUFT/CP Math Engine (v6 Canonical)

Capabilities:
1. Markdown Linter (.md): Enforces all 12 Mandatory Mechanical Normalization Rules + v6 updates
   (Award Points [AP], Diminishing Returns Armor Stacking, Zero-Stamina Pool Scaling, Canonical Skills),
   plus optional --ssot Two-Tier /game_rules Hub/Leaf structural checks.
2. JSON Asset & Statblock Validator (.json): Zero-dependency Draft 2020-12 JSON Schema validator against
   ../assets/schemas.json plus cross-field mathematical proofs for OperatorCharacter, MechaAndAutomata,
   ArchitectureAndBase, PlanetarySystem, and EquipmentAndWeaponry (Weapons, Armor, Companions, Cosmic Entities).
3. Tabular Google Sheets Auditor (.tsv / .csv): Audits exported spreadsheets for legacy terminology drift
   and verifies EUFT Credit Valuation columns against Crafting CR.
4. CLI Math Calculators:
   - python bastion_validator.py --calc-euft 18 --ws 15
   - python bastion_validator.py --calc-armor 18,8,4 --pen 5 --sta 3 --raw 30
"""
import argparse
import csv
import json
import math
import os
import re
import sys
from typing import Any, Dict, List, Optional, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SCHEMAS_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "assets", "schemas.json"))

PROHIBITED_PATTERNS: List[Tuple[str, re.Pattern]] = [
    ("Rule 1 (1d20/d20/2d20)", re.compile(r"\b(?:1d20|2d20|d20)\b", re.I)),
    ("Rule 2 (Difficulty Class/DC)", re.compile(r"\b(?:Difficulty Class|DCs?)\b")),
    ("Rule 3 (Rolling with Hindrance)", re.compile(r"Rolling with Hindrance", re.I)),
    ("Rule 5 (Build Point/BP)", re.compile(r"\b(?:Build Points?|BP)\b")),
    ("Rule 5/Mortality (Legacy XP Debt -> use -5 AP Debt)", re.compile(r"-\s*5\s*(?:XP|Experience(?:\s+Points?)?)\s+Debt\b", re.I)),
    ("Rule 7 (Dexterity -> use Agility)", re.compile(r"\bDexterity\b", re.I)),
    ("Rule 7 (Constitution -> use Stamina)", re.compile(r"\bConstitution\b", re.I)),
    ("Rule 8 (Legacy Stamina-Scaled HP)", re.compile(r"\b30\s*\+\s*\[?\(?5\s*\*\s*STA\b", re.I)),
    ("Rule 11 (Awareness -> use Alertness)", re.compile(r"\bAwareness\b")),
    ("Rule 11 (Sense Motive -> use Insight)", re.compile(r"\bSense Motive\b")),
    ("Rule 11 (Linguistics -> use Knowledge [Language])", re.compile(r"\bLinguistics\b")),
    ("Rule 11 (Animal Handling -> use Vocation [Handler])", re.compile(r"\bAnimal Handling\b")),
    ("Rule 11 (FirstAid Skill ID -> use Medicine)", re.compile(r"\bFirstAid\b")),
    (
        "Rule 12 (Legacy Non-Stacking Armor Cap -> use Diminishing Returns Armor Stacking)",
        re.compile(r"\b(?:Armor Layering Cap|DR\s+(?:never|does\s+not)\s+stack|single\s+highest\s+domain\s+DR)\b", re.I),
    ),
    ("Directory Topology (book_and_page -> use operator/)", re.compile(r"book_and_page", re.I)),
    ("Legacy Terminology (Bonus Features -> use Recommended Features)", re.compile(r"Bonus Features", re.I)),
    ("Redaction / Placeholder ([REDACTED]/TBD/...)", re.compile(r"\[REDACTED\]|\bTBD\b|\.\.\.")),
    ("ASCII Tree Diagram", re.compile(r"[├└│]")),
]

NEGATIVE_INSTRUCTION_SCRUBBERS: List[re.Pattern] = [
    re.compile(r"Never\s+(?:use|emit|apply|allow|charge|add|stack|a\s+standalone)[^\n.;|]*", re.I),
    re.compile(r"\(\s*(?:never|not|replaces(?:\s+legacy)?)\s+[^)]+\)", re.I),
    re.compile(r"(?:such\s+as|like|including)\s+(?:legacy\s+|D&D\s+or\s+Pathfinder\s+mechanics\s+like\s+)?`?[^`\n.;|]+`?", re.I),
    re.compile(r"Replace\s+`?Dexterity`?\s+with\s+`?Agility`?(?:\s+and\s+`?Constitution`?\s+with\s+`?Stamina`?)?", re.I),
    re.compile(r"PROHIBITED_PATTERNS\s*=\s*\[.*?\]", re.S),
]

REQUIRED_HUB_HEADERS = [
    "## Overview & Mechanical Authority Block",
    "## Part I — Alignment & Summary Matrix Table",
    "## Part II — Complete Unabridged Profiles & Rules Entries",
    "## Part III — Discrepancy & Restoration Ledger",
]

LINEAR_MICRO_MODS: Dict[int, float] = {
    -1: 0.75,
    0: 1.00,
    1: 1.30,
    2: 1.75,
    3: 2.30,
    4: 3.00,
}

CANONICAL_MECHA_SCALES: Dict[str, float] = {
    "Small": 0.5,
    "Medium": 1,
    "Large": 2,
    "Huge": 5,
    "Gargantuan": 10,
    "Colossal": 20,
    "Enormous": 40,
    "Titanic": 80,
    "Super Gargantuan": 160,
    "Mega Colossal": 320,
}


# ============================================================================
# 1. DETERMINISTIC MATHEMATICAL ENGINES (EUFT & DIMINISHING RETURNS ARMOR)
# ============================================================================

def calculate_euft_value(cr: int, has_flaw: bool = False, wealth_score: Optional[int] = None) -> Dict[str, Any]:
    """Calculates canonical EUFT Credit Value using Base-5 intervals + Linear Micro-Modifiers."""
    if cr < 0:
        raise ValueError(f"Crafting CR must be >= 0 (got {cr})")

    if has_flaw and cr % 5 == 0:
        base_cr = cr
        offset = -1
        mult = LINEAR_MICRO_MODS[-1]
    elif cr % 5 == 4 and has_flaw:
        base_cr = cr + 1
        offset = -1
        mult = LINEAR_MICRO_MODS[-1]
    else:
        base_cr = (cr // 5) * 5
        offset = cr - base_cr
        mult = LINEAR_MICRO_MODS[offset]

    base_val = 10 * (4 ** (base_cr // 5))
    exact_val = round(base_val * mult)
    pristine_50 = exact_val * 0.5
    pristine_out = int(pristine_50) if pristine_50.is_integer() else round(pristine_50, 2)
    scrap_10 = exact_val * 0.1
    scrap_out = int(scrap_10) if scrap_10.is_integer() else round(scrap_10, 2)

    result: Dict[str, Any] = {
        "cr": cr,
        "base_5_cr": base_cr,
        "offset": offset,
        "linear_multiplier": mult,
        "credit_value": exact_val,
        "pristine_material_cost_50pct": pristine_out,
        "legal_resale_50pct": pristine_out,
        "black_market_fence_20_to_25pct": [round(exact_val * 0.20), round(exact_val * 0.25)],
        "scrap_resale_10pct": scrap_out,
        "unrefined_scrap_mass_required_5x": exact_val * 5,
    }

    if wealth_score is not None:
        ws_val = 0 if wealth_score <= 0 else calculate_euft_value(wealth_score)["credit_value"]
        auto_buy = cr <= wealth_score and wealth_score > 0
        result["wealth_score"] = wealth_score
        result["wealth_tier_value"] = ws_val
        result["auto_buy_eligible"] = auto_buy
        result["liquidity_gap_credits"] = 0 if auto_buy else max(0, exact_val - ws_val)

    return result


def calculate_cross_domain_armor_dr(
    domain_drs: List[int],
    penetration: int = 0,
    stamina_mod: int = 0,
    raw_damage: Optional[int] = None,
    is_force_damage: bool = False,
) -> Dict[str, Any]:
    """
    Computes canonical Cross-Domain Diminishing Returns Armor Stacking:
    Effective Stacked DR = Highest_DR + sum(ceil(Additional_Layer_DR / 5))
    Final Damage = max(0, Raw_Damage - max(0, Effective_DR - Penetration) - Stamina_Mod)
    """
    positive = sorted([int(d) for d in domain_drs if int(d) > 0], reverse=True)
    if not positive:
        highest = 0
        bonus = 0
    else:
        highest = positive[0]
        bonus = sum(math.ceil(d / 5.0) for d in positive[1:])

    stacked_dr = highest + bonus
    effective_vs_type = stacked_dr // 2 if is_force_damage else stacked_dr
    post_pen_dr = max(0, effective_vs_type - max(0, penetration))

    out: Dict[str, Any] = {
        "input_domain_layers": domain_drs,
        "highest_base_dr": highest,
        "diminishing_returns_bonus_dr": bonus,
        "effective_stacked_dr": stacked_dr,
        "is_force_damage": is_force_damage,
        "penetration": penetration,
        "effective_dr_after_penetration": post_pen_dr,
        "stamina_base_toughness": stamina_mod,
        "total_static_mitigation_pre_pen": stacked_dr + stamina_mod,
    }

    if raw_damage is not None:
        after_armor = max(0, raw_damage - post_pen_dr)
        final_damage = max(0, after_armor - stamina_mod)
        out["raw_damage"] = raw_damage
        out["damage_after_armor"] = after_armor
        out["final_net_damage_min_0"] = final_damage

    return out


# ============================================================================
# 2. ZERO-DEPENDENCY DRAFT 2020-12 JSON SCHEMA SUBSET VALIDATOR
# ============================================================================

def _matches_json_type(val: Any, expected: str) -> bool:
    if expected == "null":
        return val is None
    if expected == "boolean":
        return isinstance(val, bool)
    if expected == "integer":
        return isinstance(val, int) and not isinstance(val, bool)
    if expected == "number":
        return isinstance(val, (int, float)) and not isinstance(val, bool)
    if expected == "string":
        return isinstance(val, str)
    if expected == "array":
        return isinstance(val, list)
    if expected == "object":
        return isinstance(val, dict)
    return False


def validate_against_schema(instance: Any, schema: Dict[str, Any], root_schema: Dict[str, Any], path: str = "$") -> List[str]:
    errors: List[str] = []

    if "$ref" in schema:
        ref = schema["$ref"]
        if ref.startswith("#/"):
            target: Any = root_schema
            for part in ref[2:].split("/"):
                target = target[part]
            return validate_against_schema(instance, target, root_schema, path)

    if "type" in schema:
        expected_types = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(_matches_json_type(instance, t) for t in expected_types):
            errors.append(f"{path}: expected type {expected_types}, got {type(instance).__name__} ({instance!r})")
            return errors

    if "const" in schema and instance != schema["const"]:
        errors.append(f"{path}: must equal const {schema['const']!r} (got {instance!r})")

    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: {instance!r} is not one of allowed enum values {schema['enum']}")

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: {instance} is less than minimum {schema['minimum']}")
        if "maximum" in schema and instance > schema["maximum"]:
            errors.append(f"{path}: {instance} exceeds maximum {schema['maximum']}")
        if "multipleOf" in schema:
            m = schema["multipleOf"]
            quotient = instance / m
            if abs(quotient - round(quotient)) > 1e-9:
                errors.append(f"{path}: {instance} is not a multiple of {m}")

    if isinstance(instance, dict):
        for req in schema.get("required", []):
            if req not in instance:
                errors.append(f"{path}: missing required property {req!r}")
        props = schema.get("properties", {})
        for k, v in instance.items():
            if k in props:
                errors.extend(validate_against_schema(v, props[k], root_schema, f"{path}.{k}"))

    if isinstance(instance, list) and "items" in schema:
        item_schema = schema["items"]
        for idx, item in enumerate(instance):
            errors.extend(validate_against_schema(item, item_schema, root_schema, f"{path}[{idx}]"))

    return errors


# ============================================================================
# 3. DOMAIN-SPECIFIC TANGENT v6 MATHEMATICAL PROOF VALIDATORS
# ============================================================================

def validate_operator_math(data: Dict[str, Any], label: str) -> List[str]:
    errors: List[str] = []
    cp = data.get("cp_budget", {})
    if cp.get("personal_hindrance_cp_gained", 0) > 10:
        errors.append(f"{label}: Rule 10 Violation — personal_hindrance_cp_gained exceeds +10 CP cap.")

    ap_earned = cp.get("award_points_earned", 0)
    expected_total = (
        cp.get("archetype_chassis_cp", 80)
        + cp.get("customization_cp_spent", 0)
        - cp.get("personal_hindrance_cp_gained", 0)
        - cp.get("species_disadvantage_cp_refund", 0)
    )
    budget_target = cp.get("total_cp_budget", 150) + ap_earned
    if expected_total != budget_target:
        errors.append(
            f"{label}: Rule 5 Violation — CP+AP ledger ({expected_total}) does not equal budget ({budget_target})."
        )

    attrs = data.get("attributes", {})
    pools = data.get("pools", {})
    sta = attrs.get("STA", 0)

    if "armor_dr_highest_domain" in pools:
        errors.append(
            f"{label}: Legacy Schema Drift — replace 'armor_dr_highest_domain' with 'effective_stacked_armor_dr' (Diminishing Returns Armor Stacking)."
        )

    if pools.get("base_toughness_from_sta") != sta:
        errors.append(
            f"{label}: Rule 8 Violation — base_toughness_from_sta ({pools.get('base_toughness_from_sta')}) must equal STA ({sta})."
        )
    if pools.get("stability_points_max") != sta + 5:
        errors.append(
            f"{label}: Rule 8/Mortality Violation — stability_points_max ({pools.get('stability_points_max')}) must equal STA + 5 ({sta + 5})."
        )

    bio = pools.get("chassis_biology")
    cp_pools = pools.get("cp_spent_on_pools", 0)
    if bio == "Biological":
        added_pts = (pools.get("vitality_max", 30) - 30) + (pools.get("health_max", 30) - 30)
        if added_pts != cp_pools * 5:
            errors.append(
                f"{label}: Rule 8 Violation — Biological pool increase ({added_pts} pts) must equal 5 * cp_spent_on_pools ({cp_pools * 5}); zero Stamina scaling."
            )
        if pools.get("structure_max", 0) != 0:
            errors.append(f"{label}: Rule 8 Violation — Biological character must have structure_max == 0.")
    elif bio == "Synthetic/Construct":
        added_sp = pools.get("structure_max", 60) - 60
        if added_sp != cp_pools * 5:
            errors.append(
                f"{label}: Rule 8 Violation — Construct SP increase ({added_sp} SP) must equal 5 * cp_spent_on_pools ({cp_pools * 5})."
            )
        if pools.get("vitality_max", 0) != 0 or pools.get("health_max", 0) != 0:
            errors.append(f"{label}: Rule 8 Violation — Synthetic/Construct must have vitality_max == 0 and health_max == 0.")

    if "armor_domains" in pools and "effective_stacked_armor_dr" in pools:
        doms = pools["armor_domains"]
        calc_dr = calculate_cross_domain_armor_dr(
            [
                doms.get("biological_dr", 0),
                doms.get("cybernetic_dr", 0),
                doms.get("metaphysical_dr", 0),
                doms.get("wearable_dr", 0),
            ]
        )["effective_stacked_dr"]
        if pools["effective_stacked_armor_dr"] != calc_dr:
            errors.append(
                f"{label}: Rule 12 Violation — effective_stacked_armor_dr ({pools['effective_stacked_armor_dr']}) != Diminishing Returns calculation ({calc_dr})."
            )

    saves = data.get("saves", {})
    save_map = [
        ("might", "STR"),
        ("reflex", "AGI"),
        ("fortitude", "STA"),
        ("reason", "INT"),
        ("willpower", "WIS"),
        ("etiquette", "CHA"),
    ]
    for save_key, attr_key in save_map:
        pair = saves.get(save_key, {})
        base_active = 2 + 2 * attrs.get(attr_key, 0)
        if pair.get("active_bonus", 0) < base_active:
            errors.append(
                f"{label}: Rule 7 Violation — saves.{save_key}.active_bonus ({pair.get('active_bonus')}) < 2 + 2*{attr_key} ({base_active})."
            )
        if pair.get("passive_cr") != 10 + pair.get("active_bonus", 0):
            errors.append(
                f"{label}: Rule 7 Violation — saves.{save_key}.passive_cr ({pair.get('passive_cr')}) must equal 10 + active_bonus ({10 + pair.get('active_bonus', 0)})."
            )

    is_starting_creation = cp.get("total_cp_budget", 150) == 150 and ap_earned == 0
    for entry in data.get("skills", {}).get("entries", []):
        sname = entry.get("skill_name", "")
        rank = entry.get("rank", 0)
        gov = entry.get("governing_attribute", "STR")
        if is_starting_creation and rank > 11:
            errors.append(
                f"{label}: Skill Cap Violation — '{sname}' Base Rank ({rank}) exceeds Character Creation cap of Rank 11."
            )
        specs = entry.get("specializations", [])
        max_spec = 0
        for sp in specs:
            sp_rank = sp.get("rank", 0)
            if rank < 6:
                errors.append(
                    f"{label}: Specialization Violation — '{sname}' Specialization '{sp.get('name')}' requires Base Skill Rank >= 6 (found {rank})."
                )
            max_spec = max(max_spec, sp_rank)
        expected_mod = rank + max_spec + attrs.get(gov, 0)
        if entry.get("total_modifier") != expected_mod:
            errors.append(
                f"{label}: Skill Math Violation — '{sname}' total_modifier ({entry.get('total_modifier')}) != Base ({rank}) + MaxSpec ({max_spec}) + {gov} ({attrs.get(gov, 0)}) = {expected_mod}."
            )

    return errors


def validate_mecha_math(data: Dict[str, Any], label: str) -> List[str]:
    errors: List[str] = []
    ss = data.get("size_and_scale", {})
    cat = ss.get("size_category")
    mult = ss.get("scale_multiplier", 1)
    if cat in CANONICAL_MECHA_SCALES and CANONICAL_MECHA_SCALES[cat] != mult:
        errors.append(
            f"{label}: Rule 12 Violation — Size '{cat}' must use scale_multiplier {CANONICAL_MECHA_SCALES[cat]} (got {mult})."
        )
    if ss.get("garaging_mounts_required") != mult:
        errors.append(
            f"{label}: Rule 12 Garaging Violation — garaging_mounts_required ({ss.get('garaging_mounts_required')}) must equal scale_multiplier ({mult})."
        )
    if abs(ss.get("garaging_modules_required", 0) - (mult / 10.0)) > 1e-6:
        errors.append(
            f"{label}: Rule 12 Garaging Violation — garaging_modules_required ({ss.get('garaging_modules_required')}) must equal {mult / 10.0}."
        )

    sd = data.get("structure_and_defense", {})
    expected_sp = round(sd.get("table_base_sp_precalculated", 0) * sd.get("tl_sp_multiplier", 1.0))
    if sd.get("final_sp") != expected_sp:
        errors.append(
            f"{label}: Rule 12 Vehicle SP Violation — final_sp ({sd.get('final_sp')}) must equal round(table_base_sp_precalculated * tl_sp_multiplier) = {expected_sp} (never multiply by scale_multiplier)."
        )

    mounts = data.get("udu_mounts", {})
    if mounts.get("mounts_allocated", 0) > mounts.get("total_mounts_capacity", 0):
        errors.append(f"{label}: UDU Violation — mounts_allocated exceeds total_mounts_capacity.")

    prop = data.get("propulsion", {})
    if abs(prop.get("scaled_tactical_speed_ft", 0) - prop.get("base_speed_ft", 0) * mult) > 1e-6:
        errors.append(
            f"{label}: Scale Speed Violation — scaled_tactical_speed_ft ({prop.get('scaled_tactical_speed_ft')}) != base_speed_ft * scale_multiplier ({prop.get('base_speed_ft', 0) * mult})."
        )

    econ = data.get("economics", {})
    euft = calculate_euft_value(econ.get("final_crafting_cr", 0))
    if econ.get("credit_value") != euft["credit_value"]:
        errors.append(
            f"{label}: EUFT Violation — CR {econ.get('final_crafting_cr')} credit_value ({econ.get('credit_value')}) != {euft['credit_value']}."
        )
    if abs(econ.get("pristine_material_cost_50pct", 0) - euft["pristine_material_cost_50pct"]) > 0.5:
        errors.append(f"{label}: EUFT Violation — pristine_material_cost_50pct must equal 50% ({euft['pristine_material_cost_50pct']}).")
    if econ.get("scrap_mass_value_required_5x") != euft["unrefined_scrap_mass_required_5x"]:
        errors.append(f"{label}: EUFT Violation — scrap_mass_value_required_5x must equal 5x ({euft['unrefined_scrap_mass_required_5x']}).")

    auto = data.get("automata_core", {})
    if auto.get("is_automata"):
        pr = auto.get("processor_rating", 0)
        if auto.get("total_skill_ranks") != (pr + 1) * 5:
            errors.append(f"{label}: Automata Violation — total_skill_ranks must equal (PR + 1) * 5 = {(pr + 1) * 5}.")
        if auto.get("max_skill_rank_cap") != max(5, pr * 3):
            errors.append(f"{label}: Automata Violation — max_skill_rank_cap must equal max(5, PR * 3) = {max(5, pr * 3)}.")

    return errors


def validate_architecture_math(data: Dict[str, Any], label: str) -> List[str]:
    errors: List[str] = []
    stats = data.get("statistics", {})
    cap = stats.get("total_modules_capacity", 0)
    is_mobile = stats.get("is_mobile_structure", False)
    tax = stats.get("mobile_chassis_tax_modules", 0)
    if is_mobile:
        expected_tax = math.ceil(0.20 * cap)
        if tax < expected_tax:
            errors.append(
                f"{label}: Mobile Architecture Violation — mobile_chassis_tax_modules ({tax}) < ceil(20% * {cap}) = {expected_tax}."
            )

    used_modules = tax
    for mod in data.get("module_configuration", []):
        c_used = mod.get("capacity_used", 0)
        used_modules += c_used if mod.get("udu_type") == "Module" else (c_used / 10.0)
    if used_modules - cap > 1e-6:
        errors.append(
            f"{label}: UDU Module Capacity Violation — allocated modules ({used_modules}) exceed total_modules_capacity ({cap})."
        )

    econ = data.get("economics", {})
    shell_cr = econ.get("shell_crafting_cr", econ.get("final_crafting_cr", 0))
    base_val = calculate_euft_value(shell_cr)["credit_value"]
    extra_mods_val = econ.get("disconnected_modules_credit_value", 0)
    mobile_tax_cr = econ.get("mobile_chassis_tax_20pct_credits", round(base_val * 0.20) if is_mobile else 0)
    expected_val = round(base_val + extra_mods_val + (mobile_tax_cr if is_mobile else 0))

    if econ.get("credit_value") != expected_val:
        errors.append(
            f"{label}: EUFT Architecture Violation — credit_value ({econ.get('credit_value')}) != expected {expected_val} Cr."
        )
    expected_upkeep = round(expected_val * 0.02, 2)
    if abs(econ.get("annual_upkeep_2pct", 0) - expected_upkeep) > 1.0:
        errors.append(
            f"{label}: Architecture Upkeep Violation — annual_upkeep_2pct ({econ.get('annual_upkeep_2pct')}) != 2% ({expected_upkeep})."
        )

    return errors


def validate_equipment_entity_math(data: Dict[str, Any], label: str) -> List[str]:
    errors: List[str] = []

    if "udu_allocation" in data:
        udu = data["udu_allocation"]
        n0 = udu.get("tier_0_nodes", 0)
        s1 = udu.get("tier_1_sockets", 0)
        m2 = udu.get("tier_2_mounts", 0)
        if n0 > 0 and s1 > 0 and abs((n0 / 10.0) - s1) > 1e-6:
            errors.append(f"{label}: UDU 10:1 Violation — tier_0_nodes ({n0}) / 10 != tier_1_sockets ({s1}).")
        if s1 > 0 and m2 > 0 and abs((s1 / 10.0) - m2) > 1e-6:
            errors.append(f"{label}: UDU 10:1 Violation — tier_1_sockets ({s1}) / 10 != tier_2_mounts ({m2}).")

    if "euft_economics" in data:
        econ = data["euft_economics"]
        base_tier = econ.get("base_cr_tier", 0)
        delta = econ.get("micro_modifier_delta", 0)
        final_cr = econ.get("final_item_cr", 0)
        if base_tier + delta != final_cr:
            errors.append(
                f"{label}: EUFT Violation — base_cr_tier ({base_tier}) + micro_modifier_delta ({delta}) != final_item_cr ({final_cr})."
            )
        has_flaw = delta == -1
        euft = calculate_euft_value(final_cr, has_flaw=has_flaw)
        if econ.get("credit_value") != euft["credit_value"]:
            errors.append(
                f"{label}: EUFT Violation — CR {final_cr} credit_value ({econ.get('credit_value')}) != {euft['credit_value']}."
            )
        if abs(econ.get("pristine_material_cost_50pct", 0) - euft["pristine_material_cost_50pct"]) > 0.5:
            errors.append(f"{label}: EUFT Violation — pristine_material_cost_50pct != {euft['pristine_material_cost_50pct']}.")
        if abs(econ.get("scrap_salvage_value_10pct", 0) - euft["scrap_resale_10pct"]) > 0.5:
            errors.append(f"{label}: EUFT Violation — scrap_salvage_value_10pct != {euft['scrap_resale_10pct']}.")
        if econ.get("scrap_mass_value_required_5x") != euft["unrefined_scrap_mass_required_5x"]:
            errors.append(f"{label}: EUFT Violation — scrap_mass_value_required_5x != {euft['unrefined_scrap_mass_required_5x']}.")

    if "armor_layering_profile" in data:
        alp = data["armor_layering_profile"]
        if "dr_stacking_prohibited" in alp or "effective_single_highest_dr" in alp:
            errors.append(
                f"{label}: Legacy Rule 12 Drift — replace non-stacking 'dr_stacking_prohibited'/'effective_single_highest_dr' with 'stacking_model: diminishing_returns' and 'effective_stacked_dr'."
            )
        else:
            layers = alp.get("layers_worn", [])
            # Same-domain wearables take highest; cross-domain Biological, Cybernetic/Subdermal, Metaphysical, Wearable stack via Diminishing Returns
            by_domain_prim: Dict[str, int] = {}
            by_domain_sec: Dict[str, int] = {}
            for lyr in layers:
                stype = lyr.get("source_type", "Wearable Garment")
                dom_key = "Wearable" if stype in ("Wearable Garment", "Powered Exosuit") else stype
                by_domain_prim[dom_key] = max(by_domain_prim.get(dom_key, 0), lyr.get("primary_dr", 0))
                by_domain_sec[dom_key] = max(by_domain_sec.get(dom_key, 0), lyr.get("secondary_dr", 0))

            prim_calc = calculate_cross_domain_armor_dr(list(by_domain_prim.values()))
            sec_calc = calculate_cross_domain_armor_dr(list(by_domain_sec.values()))
            eff = alp.get("effective_stacked_dr", {})
            if eff.get("primary_domain_dr") != prim_calc["effective_stacked_dr"]:
                errors.append(
                    f"{label}: Diminishing Returns Armor Violation — primary_domain_dr ({eff.get('primary_domain_dr')}) != {prim_calc['effective_stacked_dr']}."
                )
            if eff.get("secondary_domain_dr") != sec_calc["effective_stacked_dr"]:
                errors.append(
                    f"{label}: Diminishing Returns Armor Violation — secondary_domain_dr ({eff.get('secondary_domain_dr')}) != {sec_calc['effective_stacked_dr']}."
                )
            expected_mit = prim_calc["effective_stacked_dr"] + alp.get("stamina_base_toughness", 0)
            if alp.get("total_damage_mitigation") != expected_mit:
                errors.append(
                    f"{label}: Armor Mitigation Violation — total_damage_mitigation ({alp.get('total_damage_mitigation')}) != Stacked Primary DR ({prim_calc['effective_stacked_dr']}) + STA ({alp.get('stamina_base_toughness', 0)}) = {expected_mit}."
                )

    if "companion_cohort_profile" in data:
        comp = data["companion_cohort_profile"]
        expected_cohort = comp.get("form_package_cp", 15) + comp.get("function_package_cp", 25) + comp.get("extra_rank_upgrades_cp", 0)
        if comp.get("total_cohort_cp") != expected_cohort:
            errors.append(
                f"{label}: Companion Budget Violation — total_cohort_cp ({comp.get('total_cohort_cp')}) != 15 + 25 + extra ({expected_cohort})."
            )
        cpools = comp.get("pools", {})
        if comp.get("chassis_biology") == "Biological":
            added = (cpools.get("vitality_max", 30) - 30) + (cpools.get("health_max", 30) - 30)
            if added != cpools.get("cp_spent_on_pools", 0) * 5:
                errors.append(f"{label}: Companion Rule 8 Violation — Biological pool scaling mismatch.")
        else:
            added = cpools.get("structure_max", 60) - 60
            if added != cpools.get("cp_spent_on_pools", 0) * 5:
                errors.append(f"{label}: Companion Rule 8 Violation — Synthetic SP scaling mismatch.")

    if "cosmic_entity_profile" in data:
        ce = data["cosmic_entity_profile"]
        c_attrs = ce.get("attributes", {})
        c_audit = ce.get("cp_package_audit", {})
        mental_sum = (c_attrs.get("INT") or 0) + (c_attrs.get("WIS") or 0) + (c_attrs.get("CHA") or 0)
        if c_audit.get("mental_attributes_cp") != mental_sum * 5:
            errors.append(
                f"{label}: Cosmic Entity Rule 9 Violation — mental_attributes_cp ({c_audit.get('mental_attributes_cp')}) != 5 * (INT+WIS+CHA) ({mental_sum * 5})."
            )
        expected_net = (
            c_audit.get("mental_attributes_cp", 0)
            + c_audit.get("innate_skills_cp", 0)
            + c_audit.get("innate_features_cp", 0)
            + c_audit.get("species_hindrance_refund_cp", 0)
        )
        if c_audit.get("net_species_cp") != expected_net:
            errors.append(
                f"{label}: Cosmic Entity CP Audit Violation — net_species_cp ({c_audit.get('net_species_cp')}) != {expected_net}."
            )
        npools = ce.get("non_corporeal_pools", {})
        if npools.get("total_sp") != 60 + 5 * npools.get("cp_spent_on_sp", 0):
            errors.append(f"{label}: Cosmic Entity SP Violation — total_sp must equal 60 + 5 * cp_spent_on_sp.")
        if npools.get("stability_points_wis_plus_5") != (c_attrs.get("WIS") or 0) + 5:
            errors.append(f"{label}: Cosmic Entity Stability Violation — stability_points_wis_plus_5 must equal WIS + 5.")

    return errors


# ============================================================================
# 4. FILE AUDITORS (.md, .json, .tsv/.csv)
# ============================================================================

def _scrub_negative_examples(text: str) -> str:
    cleaned = text
    for scrubber in NEGATIVE_INSTRUCTION_SCRUBBERS:
        cleaned = scrubber.sub("", cleaned)
    return cleaned


def audit_markdown_file(filepath: str, base_dir: Optional[str] = None, enforce_ssot: bool = False) -> List[str]:
    with open(filepath, "r", encoding="utf-8-sig") as f:
        txt = f.read()

    # Strip YAML frontmatter if present (e.g., SKILL.md)
    content_after_fm = re.sub(r"\A---\r?\n.*?\r?\n---\r?\n", "", txt, count=1, flags=re.S)

    body = re.split(
        r"^#{2,3}\s+(?:Part III\s*[—:-]\s*)?DISCREPANCY & RESTORATION LEDGER",
        content_after_fm,
        maxsplit=1,
        flags=re.M | re.I,
    )[0]
    body_clean = _scrub_negative_examples(body)
    full_clean = _scrub_negative_examples(content_after_fm)

    findings: List[str] = []
    for label, pat in PROHIBITED_PATTERNS[:-3]:
        matches = pat.findall(body_clean)
        if matches:
            findings.append(f"{filepath}: {label} -> {matches}")

    # Check entire file (including Ledgers) for Bonus Features, REDACTED/TBD/..., and ASCII box trees
    for label, pat in PROHIBITED_PATTERNS[-3:]:
        matches = pat.findall(full_clean)
        if matches:
            findings.append(f"{filepath} (FULL FILE): {label} -> {matches}")

    if enforce_ssot:
        lines = content_after_fm.splitlines()
        first_line = lines[0] if lines else ""
        if not first_line.startswith("# "):
            findings.append(f"{filepath}: Line 1 must start with canonical '# ' heading (found: {first_line[:40]!r})")
        if base_dir:
            rel_dir = os.path.relpath(os.path.dirname(filepath), base_dir)
            if rel_dir in (".", "operator", "architect"):
                for req in REQUIRED_HUB_HEADERS:
                    if req not in content_after_fm:
                        findings.append(f"{filepath} (Master Hub): Missing required section {req!r}")
            else:
                if re.search(
                    r"^##\s+\**(?:Overview & Mechanical Authority Block|DOCUMENT HEADER & MECHANICAL AUTHORITY BLOCK|MECHANICAL AUTHORITY & CANONICAL RULES BLOCK)",
                    content_after_fm,
                    re.M | re.I,
                ):
                    findings.append(f"{filepath} (Subfolder Leaf): Must not contain top-level Authority Block wrapper")
                if re.search(
                    r"^#{2,3}\s+\**(?:Part III\s*[—:]\s*)?DISCREPANCY & RESTORATION LEDGER",
                    content_after_fm,
                    re.M | re.I,
                ):
                    findings.append(f"{filepath} (Subfolder Leaf): Must not contain top-level Discrepancy Ledger")

    return findings


def _infer_schema_key(obj: Dict[str, Any]) -> Optional[str]:
    if "$schema" in obj and "properties" in obj:
        return "__SCHEMA_DEFINITION__"
    if "cp_budget" in obj and "identity" in obj and "pools" in obj:
        return "OperatorCharacter"
    if "size_and_scale" in obj and "structure_and_defense" in obj and "udu_mounts" in obj:
        return "MechaAndAutomata"
    if "footprint_size" in obj and "module_configuration" in obj:
        return "ArchitectureAndBase"
    if "world_name" in obj and "astrophysics" in obj and "civilization" in obj:
        return "PlanetarySystem"
    if "asset_category" in obj:
        return "EquipmentAndWeaponry"
    return None


def _validate_single_entity(
    entity: Dict[str, Any],
    schemas: Dict[str, Any],
    label: str,
    forced_schema: Optional[str] = None,
) -> List[str]:
    schema_key = forced_schema or _infer_schema_key(entity)
    if schema_key == "__SCHEMA_DEFINITION__":
        return []
    if not schema_key or schema_key not in schemas:
        return [
            f"{label}: Could not infer canonical BASTION schema key (expected one of {list(schemas.keys())})."
        ]

    schema_def = schemas[schema_key]
    errs = validate_against_schema(entity, schema_def, schema_def, label)
    if errs:
        return errs

    if schema_key == "OperatorCharacter":
        errs.extend(validate_operator_math(entity, label))
    elif schema_key == "MechaAndAutomata":
        errs.extend(validate_mecha_math(entity, label))
    elif schema_key == "ArchitectureAndBase":
        errs.extend(validate_architecture_math(entity, label))
    elif schema_key == "EquipmentAndWeaponry":
        errs.extend(validate_equipment_entity_math(entity, label))

    return errs


def audit_json_file(filepath: str, schemas_path: str = DEFAULT_SCHEMAS_PATH, forced_schema: Optional[str] = None) -> List[str]:
    try:
        with open(filepath, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        return [f"{filepath}: Invalid JSON syntax — {exc}"]

    # If auditing schemas.json itself, verify all schema definitions use valid Draft 2020-12 types
    if os.path.abspath(filepath) == os.path.abspath(schemas_path) or (
        isinstance(data, dict) and data and all(isinstance(v, dict) and "$schema" in v for v in data.values())
    ):
        valid_types = {"null", "boolean", "object", "array", "number", "string", "integer"}
        schema_errs: List[str] = []

        def _walk_schema(node: Any, p: str) -> None:
            if isinstance(node, dict):
                if "type" in node and isinstance(node["type"], (str, list)):
                    # Ensure we're looking at a JSON Schema 'type' keyword, not a property named 'type' inside 'properties'
                    if not p.endswith(".properties"):
                        t_list = node["type"] if isinstance(node["type"], list) else [node["type"]]
                        for t in t_list:
                            if isinstance(t, str) and t not in valid_types:
                                schema_errs.append(f"{filepath} ({p}.type): Invalid JSON Schema type {t!r}")
                for k, v in node.items():
                    _walk_schema(v, f"{p}.{k}")
            elif isinstance(node, list):
                for idx, item in enumerate(node):
                    _walk_schema(item, f"{p}[{idx}]")

        _walk_schema(data, "$")
        return schema_errs

    with open(schemas_path, "r", encoding="utf-8-sig") as sf:
        schemas = json.load(sf)

    findings: List[str] = []
    if isinstance(data, list):
        for idx, item in enumerate(data):
            if isinstance(item, dict):
                findings.extend(_validate_single_entity(item, schemas, f"{filepath}[{idx}]", forced_schema))
    elif isinstance(data, dict):
        direct_key = forced_schema or _infer_schema_key(data)
        if direct_key:
            findings.extend(_validate_single_entity(data, schemas, filepath, direct_key))
        else:
            for k, v in data.items():
                if isinstance(v, dict):
                    override = k if k in schemas else None
                    findings.extend(_validate_single_entity(v, schemas, f"{filepath}::{k}", override))
                elif isinstance(v, list):
                    override = k if k in schemas else None
                    for idx, item in enumerate(v):
                        if isinstance(item, dict):
                            findings.extend(_validate_single_entity(item, schemas, f"{filepath}::{k}[{idx}]", override))
    return findings


def _parse_number(val: str) -> Optional[float]:
    cleaned = re.sub(r"[,_\s$]|Cr(?:edits?)?\b", "", str(val or ""), flags=re.I).strip()
    if not cleaned:
        return None
    m = re.match(r"^(?:CR\s*)?(-?\d+(?:\.\d+)?)$", cleaned, re.I)
    return float(m.group(1)) if m else None


def audit_tabular_file(filepath: str) -> List[str]:
    delimiter = "\t" if filepath.lower().endswith(".tsv") else ","
    findings: List[str] = []
    with open(filepath, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f, delimiter=delimiter)
        rows = list(reader)

    if not rows:
        return findings

    headers = [h.strip() for h in rows[0]]
    header_joined = " | ".join(headers)
    for label, pat in PROHIBITED_PATTERNS[:-3]:
        matches = pat.findall(_scrub_negative_examples(header_joined))
        if matches:
            findings.append(f"{filepath} (Header Row): {label} -> {matches}")

    norm_headers = [re.sub(r"[^a-z0-9]+", "_", h.lower()).strip("_") for h in headers]
    cr_col = next((i for i, h in enumerate(norm_headers) if h in ("cr", "craft_cr", "crafting_cr", "item_cr", "final_cr", "cost_cr")), None)
    val_col = next((i for i, h in enumerate(norm_headers) if h in ("credit_value", "credits", "value_cr", "exact_credit_value", "market_value", "price_cr")), None)

    for row_idx, row in enumerate(rows[1:], start=2):
        row_text = " | ".join(row)
        for label, pat in PROHIBITED_PATTERNS[:-3]:
            matches = pat.findall(_scrub_negative_examples(row_text))
            if matches:
                findings.append(f"{filepath} (Row {row_idx}): {label} -> {matches}")

        if cr_col is not None and val_col is not None and cr_col < len(row) and val_col < len(row):
            cr_num = _parse_number(row[cr_col])
            val_num = _parse_number(row[val_col])
            if cr_num is not None and val_num is not None and cr_num >= 0 and float(cr_num).is_integer():
                expected = calculate_euft_value(int(cr_num))["credit_value"]
                flaw_expected = calculate_euft_value(int(cr_num), has_flaw=True)["credit_value"]
                if abs(val_num - expected) > 0.5 and abs(val_num - flaw_expected) > 0.5:
                    findings.append(
                        f"{filepath} (Row {row_idx}): EUFT Table Mismatch — CR {int(cr_num)} lists {val_num:g} Cr, expected {expected} Cr."
                    )

    return findings


# ============================================================================
# 5. CLI ENTRY POINT
# ============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="BASTION Deterministic Archival Linter, Schema Validator & EUFT/Armor Math Engine"
    )
    parser.add_argument("target", nargs="?", default=".", help="File or directory to audit (.md, .json, .tsv, .csv)")
    parser.add_argument("--schemas", default=DEFAULT_SCHEMAS_PATH, help="Path to schemas.json")
    parser.add_argument("--schema", default=None, help="Explicit schema name for JSON validation")
    parser.add_argument("--ssot", action="store_true", help="Enforce Two-Tier /game_rules Hub & Leaf structural checks on .md files")
    parser.add_argument("--calc-euft", type=int, default=None, metavar="CR", help="Calculate canonical EUFT valuation for a Crafting CR")
    parser.add_argument("--flaw", action="store_true", help="Apply -1 CR Flaw (x0.75) to --calc-euft")
    parser.add_argument("--ws", type=int, default=None, help="Character Wealth Score (WS) for Liquidity Gap calculation")
    parser.add_argument("--calc-armor", type=str, default=None, metavar="DR_CSV", help="Comma-separated cross-domain Armor DR layers (e.g. 18,8,4)")
    parser.add_argument("--pen", type=int, default=0, help="Weapon Penetration for --calc-armor")
    parser.add_argument("--sta", type=int, default=0, help="Target Stamina Base Toughness modifier for --calc-armor")
    parser.add_argument("--raw", type=int, default=None, help="Raw incoming damage for --calc-armor")
    parser.add_argument("--force", action="store_true", help="Apply Force Pulse half-DR rule to --calc-armor")

    args = parser.parse_args()

    if args.calc_euft is not None:
        print(json.dumps(calculate_euft_value(args.calc_euft, has_flaw=args.flaw, wealth_score=args.ws), indent=2))
        return 0

    if args.calc_armor is not None:
        layers = [int(x.strip()) for x in args.calc_armor.split(",") if x.strip()]
        print(
            json.dumps(
                calculate_cross_domain_armor_dr(
                    layers,
                    penetration=args.pen,
                    stamina_mod=args.sta,
                    raw_damage=args.raw,
                    is_force_damage=args.force,
                ),
                indent=2,
            )
        )
        return 0

    target = args.target
    all_findings: List[str] = []
    counts = {"md": 0, "json": 0, "tabular": 0}

    def _process_file(fp: str, base_dir: Optional[str] = None) -> None:
        low = fp.lower()
        if low.endswith(".md"):
            counts["md"] += 1
            all_findings.extend(audit_markdown_file(fp, base_dir=base_dir, enforce_ssot=args.ssot))
        elif low.endswith(".json"):
            counts["json"] += 1
            all_findings.extend(audit_json_file(fp, schemas_path=args.schemas, forced_schema=args.schema))
        elif low.endswith((".tsv", ".csv")):
            counts["tabular"] += 1
            all_findings.extend(audit_tabular_file(fp))

    if os.path.isfile(target):
        _process_file(target)
    elif os.path.isdir(target):
        for root, _, files in sorted(os.walk(target)):
            for fn in sorted(files):
                _process_file(os.path.join(root, fn), base_dir=target)
    else:
        print(f"ERROR: Target path not found: {target}", file=sys.stderr)
        return 2

    print(
        f"BASTION Audit Complete: {counts['md']} Markdown, {counts['json']} JSON, {counts['tabular']} Tabular files scanned — {len(all_findings)} violations found."
    )
    for item in all_findings:
        print(" [VIOLATION]", item)
    return 1 if all_findings else 0


if __name__ == "__main__":
    sys.exit(main())
