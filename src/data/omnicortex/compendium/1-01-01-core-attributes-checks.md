---
id: "1-01-01-core-attributes-checks"
name: "1.01.01 Core Attributes, Checks & Derived Perception"
category: "compendium"
parent: "1.00 CHARACTER CREATION & ECONOMY"
order: 2
perspective: "operator"
entry_type: "Operator Rule"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

# 1.01.01 Core Attributes, Checks & Derived Perception

Attributes are a crucial aspect of character creation and gameplay. They represent a character's natural aptitudes and talents, influencing their success in various tasks and challenges. The six core attributes are **Strength, Agility, Stamina, Intellect, Wisdom, and Charisma**.

---

## 1. Cost & Starting Maximums

- **Cost:** **5 BP per +1 increase** in an attribute score.
- **Baseline:** The average score for an ordinary human is **+0**.
- **Creation Maximum:** During Character Creation, no raw attribute score may exceed **+4** before species adjustments or mechanical augmentations are applied.
- **Paragon Tier (+5):** A score of +5 indicates exceptional mastery and peak genetic or species capability.
- **Non-Attribute Flaw (-25 BP):** A character lacking an attribute completely (e.g. an AI construct lacking physical attributes) automatically fails all checks with it.

---

## 2. Attribute Checks & Saving Throws

Attribute checks act as a fallback for actions not covered by specific skills and serve as saving throws against hazards.

### How Attribute Checks are Calculated
`Base Check Score = 2 + (Attribute Score * 2)`  
`Roll = d20 + Base Check Score + Modifiers`

| Attribute | Derived Check | Core Mechanical Influence |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Carrying/lifting capacity, melee weapon damage, breaking doors and bending bars |
| **Agility (AGI)** | **Reflex Check** | Dodging attacks, acrobatics, ranged weapon accuracy, initiative |
| **Stamina (STA)** | **Fortitude Check** | Toxic/disease resistance, base toughness, enduring extreme weather |
| **Intellect (INT)** | **Reason Check** | Deductive logic, technical crafting, decoding ciphers, forensic knowledge |
| **Wisdom (WIS)** | **Willpower Check** | Sensing deception, resisting fear, mental defenses against psionics |
| **Charisma (CHA)** | **Etiquette Check** | Leadership, complex negotiation, social navigation, bartering |

---

## 3. Derived Perception

**Perception** is a sub-ability derived by combining Intellect and Wisdom scores:
`Perception Base = Intellect + Wisdom`

### Focused Perception Types
- **Default Awareness (Alertness):** Perception Base + Alertness skill (spotting hazards, ambushes, visual cues).
- **Meta Sensory (Attune):** Perception Base + Attune skill (detecting subtle magical or psionic aura signatures).
- **Social Insight (Insight):** Perception Base + Insight skill (reading facial cues, body language, emotional deception).
- **Technical Analysis (Technology):** Perception Base + Technology skill (evaluating hardware vulnerabilities, sensor scans).

## Game Mechanics Rules
```
BaseAttributeScore = 0 (Standard Human)
AttributeCheck_Base = 2 + (AttributeScore * 2)
PerceptionBase = Intellect + Wisdom
AttributeCheck_Roll = d20 + AttributeCheck_Base + Modifiers
```

## Gameplay Instructions
Use Attribute Checks primarily for saving throws and fallback situations not covered by specific learned skills.

## Designer Notes
Attribute checks are not a replacement for trained skills; unassisted raw checks lack focus strike and specialization bonuses.
