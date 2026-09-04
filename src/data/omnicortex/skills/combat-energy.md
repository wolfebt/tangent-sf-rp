---
id: combat-energy
name: Energy
type: combat
subtype: advanced
category: skills
governing_attributes:
  - Agility
description: >-
  Proficiency with handheld directed-energy weapons discharging coherent light,
  ionized plasma, acoustic shockwaves, or electromagnetic arcs.
trained_only: false
specialties:
  - Lasers (Coherent beam and pulsed laser carbines)
  - Plasma (Superheated gas blasters)
  - Sonic (Acoustic disruptors and stunners)
  - Cryo (Endothermic freeze weapons)
  - Voltic / Arc (Electric discharge weapons)
  - Disruptor (Molecular dissolution weapons)
synergy_links:
  - mental-technology
  - mental-physics
  - mental-weaponsmith
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

# Energy

Proficiency with handheld directed-energy weapons discharging coherent light, ionized plasma, acoustic shockwaves, or electromagnetic arcs.

### Mechanics & Rules
- **Governing Attribute**: Agility
- **Standard Attack Roll**: `2d10 + Energy Rank + Agility Mod vs. Target Defense`.
- **Critical Status Effects**:
  - **Pyro (Plasma)**: Burns target for 1/2 damage on following round.
  - **Cryo (Icer)**: Freezes target (Slow/Snare condition).
  - **Voltic (Electricity)**: Shocks target (Stun condition).
  - **Sonic**: Concussive force (Deafen / Stun condition).
  - **Corrosive**: Dissolves armor (1/2 damage for next 2 rounds, reduces DR).
  - **Grav**: High kinetic impact causing Knockback.

### Specialties
- **Lasers**: High-penetration pinpoint energy beams.
- **Plasma**: High-thermal area and burst munitions.
- **Sonic**: Non-lethal and crowd-control acoustic emitters.
- **Voltic**: Anti-shield and anti-synthetic arc discharge weapons.
- **Disruptor**: High-tier tech bypassing energy shielding.
