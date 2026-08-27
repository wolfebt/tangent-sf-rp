---
id: rule-sub-ability-perception
name: Sub-Ability Perception & Focused Detection Checks
category: rules
description: Perception is a sub-ability derived from Intellect + Wisdom, combined with Alertness (Default), Attune (Meta), Insight (Social), or Technology (Technical).
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

# Perception Sub-Ability & Detection Checks

**Category**: Core Rules & Sub-Abilities

## Overview
Perception is a sub-ability derived from a character's Intellect and Wisdom scores. This attribute reflects a character's overall awareness and their ability to perceive and interpret their surroundings. It plays a vital role in various detection checks throughout the game, impacting a character's ability to notice details, spot hidden dangers, and understand the subtleties of their environment.

## Base Formula
The base score for Perception is calculated by adding the character's Intellect and Wisdom scores together:

$$\text{Perception Base} = \text{Intellect Score} + \text{Wisdom Score}$$

This combined value represents their innate sensory acuity, mental focus, and intuitive awareness. However, Perception is not used in isolation. In most situations, it's combined with specific skills to determine a character's success in different types of detection checks.

---

## Default Detection Check (Alertness)
In most standard situations, where a character is simply trying to be aware of their surroundings and notice anything out of the ordinary, their Perception base score is combined with their **Alertness** skill:

$$\text{Default Check} = \text{Perception Base} + \text{Alertness (Rank + Mod)}$$

This represents a general awareness and the ability to spot visual, auditory, or other sensory cues that might indicate something important or unusual (e.g. noticing hidden traps, ambushes, concealed doorways, or environmental oddities).

---

## Focused Perception Types
There are three additional, more specialized types of Perception checks that can be used in specific situations:

### 1. Meta (Attune)
When dealing with Meta effects (such as magic, psychic powers, or other supernatural phenomena), the **Attune** skill is added to the Perception base score:

$$\text{Meta Perception} = \text{Perception Base} + \text{Attune (Rank + Mod)}$$

This allows the character to detect and analyze subtle energies, perceive magical or psychic aura signatures, and utilize Metafocus-based sensory abilities.

### 2. Social (Insight)
When trying to "read" other characters and understand their intentions, the **Insight** skill is added to the Perception base score:

$$\text{Social Perception} = \text{Perception Base} + \text{Insight (Rank + Mod)}$$

This represents the ability to pick up on subtle social cues, body language, and vocal tones to discern hidden emotions, motivations, and potential deceptions.

### 3. Technical (Technology)
When analyzing technology or using certain technological sensory devices, the **Technology (Knowledge)** skill is added to the Perception base score:

$$\text{Tech Perception} = \text{Perception Base} + \text{Technology (Rank + Mod)}$$

This reflects the character's understanding of how technology works and their ability to better identify its functions, strengths, and weaknesses.

---

## Modifiers
The Game Master (GM) may apply additional modifiers to Perception checks based on the specific circumstances of the situation. These modifiers can reflect factors such as:
- **Visibility & Illumination:** Darkness, heavy smoke, fog, glare, or camouflage.
- **Distance & Scale:** Extreme ranges, microscopic details, or peripheral distractions.
- **Nature of the Target:** Subtle vs active electromagnetic, magical, thermal, or acoustic emissions.
- **Environmental Noise:** Sensory interference, ambient chatter, or magnetic distortion.

---

## Canonical Example
A character with an **Intellect score of +2** and a **Wisdom score of +1** has a **Perception base score of 3**.
- If they are trying to notice a hidden trap, they would make an **Alertness** check with a modifier of **+3**.
- If they are trying to locate an item using magical means, they would make an **Attune** check with a modifier of **+3** instead.
- A check in a social situation to detect a lie adds the **+3** base score to **Insight**.
- A check analyzing electronic hardware or sensor readouts adds the **+3** base score to **Technology (Knowledge)**.
