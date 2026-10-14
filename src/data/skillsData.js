/**
 * Canonical Tangent SF RP Skills Database
 * Comprehensive definition of all skills across Physical, Mental, Social, Combat, and Metafocus groups.
 */

export const DEFAULT_SKILLS = {
  "physical": [
    {
      "title": null,
      "skills": [
        {
          "name": "Acrobatics",
          "id": "physical-acrobatics",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Acrobatics is the skill of performing feats of gymnastics, extraordinary balance, and dance (and related performance arts), and breaking falls. It is used whenever a character attempts to make a physical maneuver that requires agility, balance, and coordination. This can include things like jumping over obstacles, swinging from ropes, or performing aerial maneuvers. The ability to perform feats of gymnastics, balance, tumbling, and breaking falls. It covers keeping one's footing on slippery surfaces or tightropes and maneuvering through threatened areas without being hit.",
          "keywords": "acrobatics, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
            "Tumbling",
            "Tightrope & Ledge Balancing",
            "Parkour & Free-Running",
            "Breakfalling",
            "Zero-G Maneuvering",
            "Escapology",
            "Wall-Running",
            "Aerial Trapeze & Swing",
            "Dive & Roll",
            "Kip-Up & Rapid Recovery"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nMechanics:\n• *Balance:* CR 10 (narrow surface) to CR 20+ (razor edge).\n• *Tumble:* CR 15 to move through an enemy's threatened area without provoking an attack.\n• *Break Fall:* Reduce falling damage (CR 15 ignores first 10ft).\n\nSpecialties:\n• Tumbling: Executing offensive or defensive rolls across hard or hazardous terrain.\n• Tightrope & Ledge Balancing: Retaining equilibrium along narrow beams, girders, and razor edges.\n• Parkour & Free-Running: Traversing complex vertical and urban environments at full speed.\n• Breakfalling: Mitigating kinetic shock and impact damage from catastrophic falls.\n• Zero-G Maneuvering: Propelling, rotating, and anchoring oneself in microgravity or vacuum.\n• Escapology: Slipping bonds, manacles, energy cuffs, and narrow biological entrapments.\n• Wall-Running: Using kinetic momentum to traverse perpendicular surfaces briefly.\n• Aerial Trapeze & Swing: Calculating and grabbing ropes, cables, and swinging hazards in motion.\n• Dive & Roll: Clearing sudden ground-level traps, blast radii, or closing bulkheads.\n• Kip-Up & Rapid Recovery: Snapping instantly to one's feet from a prone state without defensive penalties.",
          "specialty_details": [
            {
              "name": "Tumbling",
              "description": "Executing offensive or defensive rolls across hard or hazardous terrain."
            },
            {
              "name": "Tightrope & Ledge Balancing",
              "description": "Retaining equilibrium along narrow beams, girders, and razor edges."
            },
            {
              "name": "Parkour & Free-Running",
              "description": "Traversing complex vertical and urban environments at full speed."
            },
            {
              "name": "Breakfalling",
              "description": "Mitigating kinetic shock and impact damage from catastrophic falls."
            },
            {
              "name": "Zero-G Maneuvering",
              "description": "Propelling, rotating, and anchoring oneself in microgravity or vacuum."
            },
            {
              "name": "Escapology",
              "description": "Slipping bonds, manacles, energy cuffs, and narrow biological entrapments."
            },
            {
              "name": "Wall-Running",
              "description": "Using kinetic momentum to traverse perpendicular surfaces briefly."
            },
            {
              "name": "Aerial Trapeze & Swing",
              "description": "Calculating and grabbing ropes, cables, and swinging hazards in motion."
            },
            {
              "name": "Dive & Roll",
              "description": "Clearing sudden ground-level traps, blast radii, or closing bulkheads."
            },
            {
              "name": "Kip-Up & Rapid Recovery",
              "description": "Snapping instantly to one's feet from a prone state without defensive penalties."
            }
          ],
          "full_text": "## **Acrobatics**\n\n* **Ability:** Agility  \n* **Description:** Acrobatics is the skill of performing feats of gymnastics, extraordinary balance, and dance (and related performance arts), and breaking falls. It is used whenever a character attempts to make a physical maneuver that requires agility, balance, and coordination. This can include things like jumping over obstacles, swinging from ropes, or performing aerial maneuvers. The ability to perform feats of gymnastics, balance, tumbling, and breaking falls. It covers keeping one's footing on slippery surfaces or tightropes and maneuvering through threatened areas without being hit.  \n* **Mechanics:**  \n  * *Balance:* CR 10 (narrow surface) to CR 20+ (razor edge).  \n  * *Tumble:* CR 15 to move through an enemy's threatened area without provoking an attack.  \n  * *Break Fall:* Reduce falling damage (CR 15 ignores first 10ft).  \n* **Specialties:**   \n  * **Tumbling:** Executing offensive or defensive rolls across hard or hazardous terrain.  \n  * **Tightrope & Ledge Balancing:** Retaining equilibrium along narrow beams, girders, and razor edges.  \n  * **Parkour & Free-Running:** Traversing complex vertical and urban environments at full speed.  \n  * **Breakfalling:** Mitigating kinetic shock and impact damage from catastrophic falls.  \n  * **Zero-G Maneuvering:** Propelling, rotating, and anchoring oneself in microgravity or vacuum.  \n  * **Escapology:** Slipping bonds, manacles, energy cuffs, and narrow biological entrapments.  \n  * **Wall-Running:** Using kinetic momentum to traverse perpendicular surfaces briefly.  \n  * **Aerial Trapeze & Swing:** Calculating and grabbing ropes, cables, and swinging hazards in motion.  \n  * **Dive & Roll:** Clearing sudden ground-level traps, blast radii, or closing bulkheads.  \n  * **Kip-Up & Rapid Recovery:** Snapping instantly to one's feet from a prone state without defensive penalties.\n\n##"
        },
        {
          "name": "Athletics",
          "id": "physical-athletics",
          "group": "physical",
          "baseAttr": "attr-strength",
          "description": "Athletics is the skill of a character's general physical capabilities – running, jumping, climbing, swimming, and other broadly physical activities. It reflects a character's overall fitness and physical prowess. Athletics is used whenever a character attempts to perform a physical feat that requires strength and endurance. A measure of general physical prowess. It encompasses running, jumping, climbing, swimming, and lifting heavy objects.",
          "keywords": "athletics, physical, strength, mobility, bodily-coordination, running",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
            "Sprinting",
            "Endurance Running",
            "Vertical & Long Jumping",
            "Rock & Hull Climbing",
            "Swimming & Diving",
            "Powerlifting & Hauling",
            "Forceful Throwing",
            "Grapple Wrestling",
            "High-G Conditioning",
            "Breaching & Forcing"
          ],
          "governing_attribute": "Strength",
          "mechanic": "Governing Ability: Strength\n\nMechanics:\n• *Climb:* CR 10 (rope with knots) to CR 25 (sheer surface). Speed is usually half base speed.\n• *Jump:* CR equals the distance in feet (running start).\n• *Swim:* CR 10 (calm water) to CR 20 (stormy water). Failure by 5 or more risks drowning.\n\nSpecialties:\n• Sprinting: Short-burst explosive acceleration over open terrain.\n• Endurance Running: Long-distance marches and prolonged pursuits without fatigue.\n• Vertical & Long Jumping: Clearing horizontal chasms and scaling sheer heights by leaping.\n• Rock & Hull Climbing: Scaling sheer cliffs, metal lattice bulkheads, and exterior starship hulls.\n• Swimming & Diving: Navigating high-viscosity liquids, aquatic currents, and submerged operations.\n• Powerlifting & Hauling: Lifting, pressing, and dragging massive bulk, collapsed beams, and heavy machinery.\n• Forceful Throwing: Hurling objects, grenades, or improvised bludgeons with maximum velocity.\n• Grapple Wrestling: Overpowering and pinning opponents through superior bodily mass and leverage.\n• High-G Conditioning: Resisting the physical and circulatory strain of high-gravity worlds and high-G acceleration.\n• Breaching & Forcing: Kicking in heavy security doors, forcing airlocks, and smashing barriers.",
          "specialty_details": [
            {
              "name": "Sprinting",
              "description": "Short-burst explosive acceleration over open terrain."
            },
            {
              "name": "Endurance Running",
              "description": "Long-distance marches and prolonged pursuits without fatigue."
            },
            {
              "name": "Vertical & Long Jumping",
              "description": "Clearing horizontal chasms and scaling sheer heights by leaping."
            },
            {
              "name": "Rock & Hull Climbing",
              "description": "Scaling sheer cliffs, metal lattice bulkheads, and exterior starship hulls."
            },
            {
              "name": "Swimming & Diving",
              "description": "Navigating high-viscosity liquids, aquatic currents, and submerged operations."
            },
            {
              "name": "Powerlifting & Hauling",
              "description": "Lifting, pressing, and dragging massive bulk, collapsed beams, and heavy machinery."
            },
            {
              "name": "Forceful Throwing",
              "description": "Hurling objects, grenades, or improvised bludgeons with maximum velocity."
            },
            {
              "name": "Grapple Wrestling",
              "description": "Overpowering and pinning opponents through superior bodily mass and leverage."
            },
            {
              "name": "High-G Conditioning",
              "description": "Resisting the physical and circulatory strain of high-gravity worlds and high-G acceleration."
            },
            {
              "name": "Breaching & Forcing",
              "description": "Kicking in heavy security doors, forcing airlocks, and smashing barriers."
            }
          ],
          "full_text": "## **Athletics**\n\n* **Ability:** Strength  \n* **Description:** Athletics is the skill of a character's general physical capabilities – running, jumping, climbing, swimming, and other broadly physical activities. It reflects a character's overall fitness and physical prowess. Athletics is used whenever a character attempts to perform a physical feat that requires strength and endurance. A measure of general physical prowess. It encompasses running, jumping, climbing, swimming, and lifting heavy objects.  \n* **Mechanics:**  \n  * *Climb:* CR 10 (rope with knots) to CR 25 (sheer surface). Speed is usually half base speed.  \n  * *Jump:* CR equals the distance in feet (running start).  \n  * *Swim:* CR 10 (calm water) to CR 20 (stormy water). Failure by 5 or more risks drowning.  \n* **Specialties:**   \n  * **Sprinting:** Short-burst explosive acceleration over open terrain.  \n  * **Endurance Running:** Long-distance marches and prolonged pursuits without fatigue.  \n  * **Vertical & Long Jumping:** Clearing horizontal chasms and scaling sheer heights by leaping.  \n  * **Rock & Hull Climbing:** Scaling sheer cliffs, metal lattice bulkheads, and exterior starship hulls.  \n  * **Swimming & Diving:** Navigating high-viscosity liquids, aquatic currents, and submerged operations.  \n  * **Powerlifting & Hauling:** Lifting, pressing, and dragging massive bulk, collapsed beams, and heavy machinery.  \n  * **Forceful Throwing:** Hurling objects, grenades, or improvised bludgeons with maximum velocity.  \n  * **Grapple Wrestling:** Overpowering and pinning opponents through superior bodily mass and leverage.  \n  * **High-G Conditioning:** Resisting the physical and circulatory strain of high-gravity worlds and high-G acceleration.  \n  * **Breaching & Forcing:** Kicking in heavy security doors, forcing airlocks, and smashing barriers.\n\n##"
        },
        {
          "name": "Endurance",
          "id": "physical-endurance",
          "group": "physical",
          "baseAttr": "attr-stamina",
          "description": "Physical stamina, pain tolerance, resisting exhaustion, and prolonged exertion.",
          "keywords": "endurance, physical, stamina, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "governing_attribute": "Stamina",
          "mechanic": "Governing Ability: Stamina\n\nSpecialties:\n",
          "full_text": "## **Endurance**\n\n* **Ability:** Stamina\n* **Description:** Physical stamina, pain tolerance, resisting exhaustion, and prolonged exertion."
        },
        {
          "name": "Piloting",
          "id": "physical-piloting",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Piloting is the skill of operating mecha, vehicles of various types, such as aircraft, spacecraft, or boats. It reflects a character's ability to navigate, steer, and control various vehicles. Piloting is used whenever a character attempts to pilot a vehicle, whether in combat or during a peaceful journey. This can include things like flying a spaceship through an asteroid field, navigating a boat through a storm, or driving a car through a high-speed chase.",
          "keywords": "piloting, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
            "Wheeled & Tracked Vehicles",
            "Hovercraft & Grav-Speeders",
            "Atmospheric Aircraft",
            "Sub-Orbital Shuttles",
            "Starfighters & Dogfighting",
            "Capital Ships & Freighters",
            "Mecha & Walkers",
            "Watercraft & Submersibles",
            "EVA Thruster Packs",
            "Combat Stunts & Evasion"
          ],
          "governing_attribute": "Agility (Reaction) or Intellect (Navigation/Systems)",
          "mechanic": "Governing Ability: Agility (Reaction) or Intellect (Navigation/Systems)\n\nMechanics:\n• *Normal Operation:* No roll required for standard travel.\n• *Stunts/Combat:* CR depends on maneuver difficulty (CR 15 for sharp turns at speed, CR 25 for \"threading the needle\").\n\nSpecialties:\n• Wheeled & Tracked Vehicles: Driving rovers, combat buggies, tanks, and mobile command platforms.\n• Hovercraft & Grav-Speeders: Operating repulsorlift bikes, grav-skimmers, and low-altitude platforms.\n• Atmospheric Aircraft: Flying atmospheric jets, rotorcraft, gunships, and gliders.\n• Sub-Orbital Shuttles: Piloting orbital dropships, landers, and transit shuttles through atmospheric entry.\n• Starfighters & Dogfighting: High-speed space combat, interceptor maneuvers, and close-quarters dogfights.\n• Capital Ships & Freighters: Navigating massive multi-deck vessels, bulk freighters, and naval cruisers.\n• Mecha & Walkers: Piloting bipedal or multipedal combat chassis and industrial bipedal rigs.\n• Watercraft & Submersibles: Commanding surface naval boats, aquatic hydrofoils, and deep-sea exploration pods.\n• EVA Thruster Packs: Precision thruster control during spacewalks and exterior repairs.\n• Combat Stunts & Evasion: Threading asteroid clusters, evading surface-to-air missiles, and extreme defensive barrel rolls.",
          "specialty_details": [
            {
              "name": "Wheeled & Tracked Vehicles",
              "description": "Driving rovers, combat buggies, tanks, and mobile command platforms."
            },
            {
              "name": "Hovercraft & Grav-Speeders",
              "description": "Operating repulsorlift bikes, grav-skimmers, and low-altitude platforms."
            },
            {
              "name": "Atmospheric Aircraft",
              "description": "Flying atmospheric jets, rotorcraft, gunships, and gliders."
            },
            {
              "name": "Sub-Orbital Shuttles",
              "description": "Piloting orbital dropships, landers, and transit shuttles through atmospheric entry."
            },
            {
              "name": "Starfighters & Dogfighting",
              "description": "High-speed space combat, interceptor maneuvers, and close-quarters dogfights."
            },
            {
              "name": "Capital Ships & Freighters",
              "description": "Navigating massive multi-deck vessels, bulk freighters, and naval cruisers."
            },
            {
              "name": "Mecha & Walkers",
              "description": "Piloting bipedal or multipedal combat chassis and industrial bipedal rigs."
            },
            {
              "name": "Watercraft & Submersibles",
              "description": "Commanding surface naval boats, aquatic hydrofoils, and deep-sea exploration pods."
            },
            {
              "name": "EVA Thruster Packs",
              "description": "Precision thruster control during spacewalks and exterior repairs."
            },
            {
              "name": "Combat Stunts & Evasion",
              "description": "Threading asteroid clusters, evading surface-to-air missiles, and extreme defensive barrel rolls."
            }
          ],
          "full_text": "## **Piloting**\n\n* **Ability:** Agility (Reaction) or Intellect (Navigation/Systems)  \n* **Description:** Piloting is the skill of operating mecha, vehicles of various types, such as aircraft, spacecraft, or boats. It reflects a character's ability to navigate, steer, and control various vehicles. Piloting is used whenever a character attempts to pilot a vehicle, whether in combat or during a peaceful journey. This can include things like flying a spaceship through an asteroid field, navigating a boat through a storm, or driving a car through a high-speed chase.   \n* **Mechanics:**  \n  * *Normal Operation:* No roll required for standard travel.  \n  * *Stunts/Combat:* CR depends on maneuver difficulty (CR 15 for sharp turns at speed, CR 25 for \"threading the needle\").  \n* **Specialties:**   \n  * **Wheeled & Tracked Vehicles:** Driving rovers, combat buggies, tanks, and mobile command platforms.  \n  * **Hovercraft & Grav-Speeders:** Operating repulsorlift bikes, grav-skimmers, and low-altitude platforms.  \n  * **Atmospheric Aircraft:** Flying atmospheric jets, rotorcraft, gunships, and gliders.  \n  * **Sub-Orbital Shuttles:** Piloting orbital dropships, landers, and transit shuttles through atmospheric entry.  \n  * **Starfighters & Dogfighting:** High-speed space combat, interceptor maneuvers, and close-quarters dogfights.  \n  * **Capital Ships & Freighters:** Navigating massive multi-deck vessels, bulk freighters, and naval cruisers.  \n  * **Mecha & Walkers:** Piloting bipedal or multipedal combat chassis and industrial bipedal rigs.  \n  * **Watercraft & Submersibles:** Commanding surface naval boats, aquatic hydrofoils, and deep-sea exploration pods.  \n  * **EVA Thruster Packs:** Precision thruster control during spacewalks and exterior repairs.  \n  * **Combat Stunts & Evasion:** Threading asteroid clusters, evading surface-to-air missiles, and extreme defensive barrel rolls.\n\n##"
        },
        {
          "name": "Stealth",
          "id": "physical-stealth",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Stealth is the skill of moving quietly and remaining hidden from view. It reflects a character's ability to avoid detection and move silently. Stealth is used whenever a character attempts to sneak past guards, hide from enemies, or remain undetected while spying. This can include things like sneaking through a dark alley, hiding behind a tree, or crawling through a ventilation shaft. The ability to move silently and remain unseen. This is an opposed check against an observer's *Alertness*.",
          "keywords": "stealth, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
            "Silent Movement",
            "Camouflage & Concealment",
            "Urban Infiltration",
            "Wilderness Stalking",
            "Sensor Evasion",
            "Tailing & Shadowing",
            "Crowd Blending",
            "Vibration & Scent Masking",
            "Quick-Cover Snapping",
            "Infiltration Rigging"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nMechanics:\n• *Hide:* Your check becomes the CR for the enemy's Perception/Alertness check. Requires cover or concealment.\n• *Move Silently:* Move at half speed without penalty. Moving faster imposes penalties (-5 for full speed).\n\nSpecialties:\n• Silent Movement: Walking, running, and shifting weight across creaky, dry, or metal grating without noise.\n• Camouflage & Concealment: Blending into natural foliage, rubble, or static shadows using environmental gear.\n• Urban Infiltration: Skulking through corporate arcologies, maintenance ducts, alleyways, and populated zones.\n• Wilderness Stalking: Approaching targets through alien jungles, tundras, or rocky outcroppings without disturbing wildlife.\n• Sensor Evasion: Avoiding infrared scanners, thermal cameras, motion trackers, and bio-scanners.\n• Tailing & Shadowing: Following marks through crowded spaceports or urban avenues without alerting them.\n• Crowd Blending: Disappearing into pedestrian traffic and public plazas via nondescript body language.\n• Vibration & Scent Masking: Evading tracking beasts and species relying on non-visual olfactory or acoustic senses.\n• Quick-Cover Snapping: Darting between cover zones while security patrols or camera sweeps cycle past.\n• Infiltration Rigging: Placing acoustic and optical cloaks over gear to silence rattling holsters and gear packs.",
          "specialty_details": [
            {
              "name": "Silent Movement",
              "description": "Walking, running, and shifting weight across creaky, dry, or metal grating without noise."
            },
            {
              "name": "Camouflage & Concealment",
              "description": "Blending into natural foliage, rubble, or static shadows using environmental gear."
            },
            {
              "name": "Urban Infiltration",
              "description": "Skulking through corporate arcologies, maintenance ducts, alleyways, and populated zones."
            },
            {
              "name": "Wilderness Stalking",
              "description": "Approaching targets through alien jungles, tundras, or rocky outcroppings without disturbing wildlife."
            },
            {
              "name": "Sensor Evasion",
              "description": "Avoiding infrared scanners, thermal cameras, motion trackers, and bio-scanners."
            },
            {
              "name": "Tailing & Shadowing",
              "description": "Following marks through crowded spaceports or urban avenues without alerting them."
            },
            {
              "name": "Crowd Blending",
              "description": "Disappearing into pedestrian traffic and public plazas via nondescript body language."
            },
            {
              "name": "Vibration & Scent Masking",
              "description": "Evading tracking beasts and species relying on non-visual olfactory or acoustic senses."
            },
            {
              "name": "Quick-Cover Snapping",
              "description": "Darting between cover zones while security patrols or camera sweeps cycle past."
            },
            {
              "name": "Infiltration Rigging",
              "description": "Placing acoustic and optical cloaks over gear to silence rattling holsters and gear packs."
            }
          ],
          "full_text": "## **Stealth**\n\n* **Ability:** Agility  \n* **Description:** Stealth is the skill of moving quietly and remaining hidden from view. It reflects a character's ability to avoid detection and move silently. Stealth is used whenever a character attempts to sneak past guards, hide from enemies, or remain undetected while spying. This can include things like sneaking through a dark alley, hiding behind a tree, or crawling through a ventilation shaft. The ability to move silently and remain unseen. This is an opposed check against an observer's *Alertness*.  \n* **Mechanics:**  \n  * *Hide:* Your check becomes the CR for the enemy's Perception/Alertness check. Requires cover or concealment.  \n  * *Move Silently:* Move at half speed without penalty. Moving faster imposes penalties (-5 for full speed).  \n* **Specialties:**   \n  * **Silent Movement:** Walking, running, and shifting weight across creaky, dry, or metal grating without noise.  \n  * **Camouflage & Concealment:** Blending into natural foliage, rubble, or static shadows using environmental gear.  \n  * **Urban Infiltration:** Skulking through corporate arcologies, maintenance ducts, alleyways, and populated zones.  \n  * **Wilderness Stalking:** Approaching targets through alien jungles, tundras, or rocky outcroppings without disturbing wildlife.  \n  * **Sensor Evasion:** Avoiding infrared scanners, thermal cameras, motion trackers, and bio-scanners.  \n  * **Tailing & Shadowing:** Following marks through crowded spaceports or urban avenues without alerting them.  \n  * **Crowd Blending:** Disappearing into pedestrian traffic and public plazas via nondescript body language.  \n  * **Vibration & Scent Masking:** Evading tracking beasts and species relying on non-visual olfactory or acoustic senses.  \n  * **Quick-Cover Snapping:** Darting between cover zones while security patrols or camera sweeps cycle past.  \n  * **Infiltration Rigging:** Placing acoustic and optical cloaks over gear to silence rattling holsters and gear packs.\n\n---"
        }
      ]
    }
  ],
  "mental": [
    {
      "title": "General",
      "skills": [
        {
          "name": "Alertness",
          "id": "mental-alertness",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Alertness is the skill of being aware of one's surroundings and noticing changes or potential threats in the environment. It reflects a character's ability to pay attention to details and react quickly to unexpected situations. Alertness is used whenever a character needs to be aware of their surroundings, whether it's to avoid danger or to gather information. This can include things like noticing a hidden door, detecting a trap, or identifying a potential ambush.",
          "keywords": "alertness, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Visual Spotting",
            "Auditory Listening",
            "Ambush Detection",
            "Concealed Object Search",
            "Scent & Pheromone Recognition",
            "Sensor Feed Monitoring",
            "Danger Sense & Intuition",
            "Counter-Surveillance Awareness",
            "Micro-Detail Inspection",
            "Motion Tracking"
          ],
          "governing_attribute": "Perception (Intellect + Wisdom)",
          "mechanic": "Governing Ability: Perception (Intellect + Wisdom)\n\nMechanics:\n• *Spot/Listen:* Opposed by Stealth.\n• *Search:* CR 10 (easy) to CR 30 (microscopic detail).\n\nSpecialties:\n• Visual Spotting: Identifying hidden snipers, optical glints, camouflaged personnel, and concealed traps.\n• Auditory Listening: Eavesdropping through bulkheads, picking out hushed footsteps, and identifying weapon charging hums.\n• Ambush Detection: Sensing structural irregularities, kill-zone geometry, and unnatural environmental stillness.\n• Concealed Object Search: Uncovering secret compartments, hidden weapon holsters, false deckplates, and covert bugs.\n• Scent & Pheromone Recognition: Identifying chemical signatures, ozone leaks, and tracking alien scents.\n• Sensor Feed Monitoring: Catching blips, radar ghosting, and telemetry spikes on passive scanner consoles.\n• Danger Sense & Intuition: Reading subtle atmospheric pressure changes and gut feelings before violence erupts.\n• Counter-Surveillance Awareness: Noticing when you are being tailed, scanned, or watched from high vantage points.\n• Micro-Detail Inspection: Spotting minute hairline fractures in bulkheads, micro-cameras, and hairline tripwires.\n• Motion Tracking: Tracking high-speed peripheral movement across low-light and visual-clutter environments.",
          "specialty_details": [
            {
              "name": "Visual Spotting",
              "description": "Identifying hidden snipers, optical glints, camouflaged personnel, and concealed traps."
            },
            {
              "name": "Auditory Listening",
              "description": "Eavesdropping through bulkheads, picking out hushed footsteps, and identifying weapon charging hums."
            },
            {
              "name": "Ambush Detection",
              "description": "Sensing structural irregularities, kill-zone geometry, and unnatural environmental stillness."
            },
            {
              "name": "Concealed Object Search",
              "description": "Uncovering secret compartments, hidden weapon holsters, false deckplates, and covert bugs."
            },
            {
              "name": "Scent & Pheromone Recognition",
              "description": "Identifying chemical signatures, ozone leaks, and tracking alien scents."
            },
            {
              "name": "Sensor Feed Monitoring",
              "description": "Catching blips, radar ghosting, and telemetry spikes on passive scanner consoles."
            },
            {
              "name": "Danger Sense & Intuition",
              "description": "Reading subtle atmospheric pressure changes and gut feelings before violence erupts."
            },
            {
              "name": "Counter-Surveillance Awareness",
              "description": "Noticing when you are being tailed, scanned, or watched from high vantage points."
            },
            {
              "name": "Micro-Detail Inspection",
              "description": "Spotting minute hairline fractures in bulkheads, micro-cameras, and hairline tripwires."
            },
            {
              "name": "Motion Tracking",
              "description": "Tracking high-speed peripheral movement across low-light and visual-clutter environments."
            }
          ],
          "full_text": "## **ALERTNESS**\n\n* **Ability:** Perception (Intellect \\+ Wisdom)  \n* **Description:** Alertness is the skill of being aware of one's surroundings and noticing changes or potential threats in the environment. It reflects a character's ability to pay attention to details and react quickly to unexpected situations. Alertness is used whenever a character needs to be aware of their surroundings, whether it's to avoid danger or to gather information. This can include things like noticing a hidden door, detecting a trap, or identifying a potential ambush.  \n* **Mechanics:**  \n  * *Spot/Listen:* Opposed by Stealth.  \n  * *Search:* CR 10 (easy) to CR 30 (microscopic detail).  \n* **Specialties:**   \n  * **Visual Spotting:** Identifying hidden snipers, optical glints, camouflaged personnel, and concealed traps.  \n  * **Auditory Listening:** Eavesdropping through bulkheads, picking out hushed footsteps, and identifying weapon charging hums.  \n  * **Ambush Detection:** Sensing structural irregularities, kill-zone geometry, and unnatural environmental stillness.  \n  * **Concealed Object Search:** Uncovering secret compartments, hidden weapon holsters, false deckplates, and covert bugs.  \n  * **Scent & Pheromone Recognition:** Identifying chemical signatures, ozone leaks, and tracking alien scents.  \n  * **Sensor Feed Monitoring:** Catching blips, radar ghosting, and telemetry spikes on passive scanner consoles.  \n  * **Danger Sense & Intuition:** Reading subtle atmospheric pressure changes and gut feelings before violence erupts.  \n  * **Counter-Surveillance Awareness:** Noticing when you are being tailed, scanned, or watched from high vantage points.  \n  * **Micro-Detail Inspection:** Spotting minute hairline fractures in bulkheads, micro-cameras, and hairline tripwires.  \n  * **Motion Tracking:** Tracking high-speed peripheral movement across low-light and visual-clutter environments.\n\n##"
        },
        {
          "name": "Academics",
          "id": "mental-academics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Academics is the skill of knowledge acquisition and analysis. It reflects a character's ability to research and understand complex topics. Academics is used whenever a character needs to research a topic, analyze data, or draw conclusions based on evidence. This can include things like researching a new technology, analyzing an artwork or deciphering old texts.",
          "keywords": "academics, mental, intellect, cognitive, expertise, higher",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Research Methodology",
            "Critical Epistemology",
            "Data Synthesis",
            "Scholarly Archiving",
            "Pedagogy & Instruction",
            "Technical Writing",
            "Abstract Logic",
            "Linguistic Philology",
            "Comparative Sociology",
            "Scholastic Peer Review"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Research:* CR 15 to find obscure information in a library/database.\n\nSpecialties:\n• Research Methodology: Efficiently querying galactic libraries, university databases, and scholarly compendiums.\n• Critical Epistemology: Evaluating the validity, systemic bias, and objective truth of complex source materials.\n• Data Synthesis: Cross-referencing disparate academic fields to extrapolate working theories and hypotheses.\n• Scholarly Archiving: Classifying, indexing, and citing academic literature according to galactic standards.\n• Pedagogy & Instruction: Formulating structured curricula to teach complex theoretical concepts to novices.\n• Technical Writing: Drafting comprehensive peer-reviewed papers, grant proposals, and white papers.\n• Abstract Logic: Solving complex mathematical logic gates, philosophical proofs, and systemic dilemmas.\n• Linguistic Philology: Tracing the roots, evolution, and semantic mutations of languages across galactic eras.\n• Comparative Sociology: Analyzing societal development structures across disparate humanoid and alien cultures.\n• Scholastic Peer Review: Detecting fabrication, confirmation bias, and flawed datasets in published scientific reports.",
          "specialty_details": [
            {
              "name": "Research Methodology",
              "description": "Efficiently querying galactic libraries, university databases, and scholarly compendiums."
            },
            {
              "name": "Critical Epistemology",
              "description": "Evaluating the validity, systemic bias, and objective truth of complex source materials."
            },
            {
              "name": "Data Synthesis",
              "description": "Cross-referencing disparate academic fields to extrapolate working theories and hypotheses."
            },
            {
              "name": "Scholarly Archiving",
              "description": "Classifying, indexing, and citing academic literature according to galactic standards."
            },
            {
              "name": "Pedagogy & Instruction",
              "description": "Formulating structured curricula to teach complex theoretical concepts to novices."
            },
            {
              "name": "Technical Writing",
              "description": "Drafting comprehensive peer-reviewed papers, grant proposals, and white papers."
            },
            {
              "name": "Abstract Logic",
              "description": "Solving complex mathematical logic gates, philosophical proofs, and systemic dilemmas."
            },
            {
              "name": "Linguistic Philology",
              "description": "Tracing the roots, evolution, and semantic mutations of languages across galactic eras."
            },
            {
              "name": "Comparative Sociology",
              "description": "Analyzing societal development structures across disparate humanoid and alien cultures."
            },
            {
              "name": "Scholastic Peer Review",
              "description": "Detecting fabrication, confirmation bias, and flawed datasets in published scientific reports."
            }
          ],
          "full_text": "## **ACADEMICS**\n\n* **Ability:** Intellect  \n* **Description:** Academics is the skill of knowledge acquisition and analysis. It reflects a character's ability to research and understand complex topics. Academics is used whenever a character needs to research a topic, analyze data, or draw conclusions based on evidence. This can include things like researching a new technology, analyzing an artwork or deciphering old texts.   \n* **Mechanics:**  \n  * *Research:* CR 15 to find obscure information in a library/database.  \n* **Specialties:**   \n  * **Research Methodology:** Efficiently querying galactic libraries, university databases, and scholarly compendiums.  \n  * **Critical Epistemology:** Evaluating the validity, systemic bias, and objective truth of complex source materials.  \n  * **Data Synthesis:** Cross-referencing disparate academic fields to extrapolate working theories and hypotheses.  \n  * **Scholarly Archiving:** Classifying, indexing, and citing academic literature according to galactic standards.  \n  * **Pedagogy & Instruction:** Formulating structured curricula to teach complex theoretical concepts to novices.  \n  * **Technical Writing:** Drafting comprehensive peer-reviewed papers, grant proposals, and white papers.  \n  * **Abstract Logic:** Solving complex mathematical logic gates, philosophical proofs, and systemic dilemmas.  \n  * **Linguistic Philology:** Tracing the roots, evolution, and semantic mutations of languages across galactic eras.  \n  * **Comparative Sociology:** Analyzing societal development structures across disparate humanoid and alien cultures.  \n  * **Scholastic Peer Review:** Detecting fabrication, confirmation bias, and flawed datasets in published scientific reports.\n\n##\n\n---"
        }
      ]
    },
    {
      "title": "Knowledges",
      "skills": [
        {
          "name": "Appraisal",
          "id": "mental-appraisal",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "The skill of determining the value, authenticity, and origin of items. It allows a character to identify rare artifacts, detect forgeries, and estimate the market price of goods.",
          "keywords": "appraisal, mental, intellect, cognitive, expertise, assessing",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Antiquities & Relics",
            "Gems & Exotic Minerals",
            "High-Tech Hardware",
            "Xenotech Artifacts",
            "Fine Art & Holography",
            "Weapons & Armor Valuation",
            "Counterfeit & Forgery Detection",
            "Raw Industrial Commodities",
            "Metaphysical Artifacts",
            "Salvage Bulk Valuation"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Value Item:** CR 10 (Common) to CR 30 (Unique/Alien).\n• **Detect Forgery:** Opposed check vs. Forgery (Bluff/Craft).\n• **Identify Properties:** CR 15+ to determine what a specific device or artifact does.\n\nSpecialties:\n• Antiquities & Relics: Dating and pricing ancient artifacts, dynastic treasures, and pre-collapse relics.\n• Gems & Exotic Minerals: Assessing crystalline purity, carats, cut, and value of rare planetary ores.\n• High-Tech Hardware: Evaluating internal wear, chip fabrication specs, and market value of modern computing cores.\n• Xenotech Artifacts: Identifying the rarity, function, and black-market pricing of unknown alien devices.\n• Fine Art & Holography: Spotting stylistic authenticity, provenance, and valuations in visual art and media.\n• Weapons & Armor Valuation: Pricing arms, determining custom modifications, and grading combat durability.\n• Counterfeit & Forgery Detection: Spotting faux stamps, reproduction alloys, doctored serials, and artificial aging.\n• Raw Industrial Commodities: Estimating bulk container loads of refined fuels, hyper-alloys, and construction composites.\n• Metaphysical Artifacts: Valuing enchanted talismans, psi-receptive matrices, and mana-infused items.\n• Salvage Bulk Valuation: Estimating the scrap yield and recovery profit of derelict ship hulls and shattered stations.",
          "specialty_details": [
            {
              "name": "Antiquities & Relics",
              "description": "Dating and pricing ancient artifacts, dynastic treasures, and pre-collapse relics."
            },
            {
              "name": "Gems & Exotic Minerals",
              "description": "Assessing crystalline purity, carats, cut, and value of rare planetary ores."
            },
            {
              "name": "High-Tech Hardware",
              "description": "Evaluating internal wear, chip fabrication specs, and market value of modern computing cores."
            },
            {
              "name": "Xenotech Artifacts",
              "description": "Identifying the rarity, function, and black-market pricing of unknown alien devices."
            },
            {
              "name": "Fine Art & Holography",
              "description": "Spotting stylistic authenticity, provenance, and valuations in visual art and media."
            },
            {
              "name": "Weapons & Armor Valuation",
              "description": "Pricing arms, determining custom modifications, and grading combat durability."
            },
            {
              "name": "Counterfeit & Forgery Detection",
              "description": "Spotting faux stamps, reproduction alloys, doctored serials, and artificial aging."
            },
            {
              "name": "Raw Industrial Commodities",
              "description": "Estimating bulk container loads of refined fuels, hyper-alloys, and construction composites."
            },
            {
              "name": "Metaphysical Artifacts",
              "description": "Valuing enchanted talismans, psi-receptive matrices, and mana-infused items."
            },
            {
              "name": "Salvage Bulk Valuation",
              "description": "Estimating the scrap yield and recovery profit of derelict ship hulls and shattered stations."
            }
          ],
          "full_text": "### **APPRAISAL**\n\n* **Ability:** Intellect  \n* **Description:** The skill of determining the value, authenticity, and origin of items. It allows a character to identify rare artifacts, detect forgeries, and estimate the market price of goods.  \n* **Mechanics:**  \n  * **Value Item:** CR 10 (Common) to CR 30 (Unique/Alien).  \n  * **Detect Forgery:** Opposed check vs. Forgery (Bluff/Craft).  \n  * **Identify Properties:** CR 15+ to determine what a specific device or artifact does.  \n* **Specialties:**   \n  * **Antiquities & Relics:** Dating and pricing ancient artifacts, dynastic treasures, and pre-collapse relics.  \n    * **Gems & Exotic Minerals:** Assessing crystalline purity, carats, cut, and value of rare planetary ores.  \n    * **High-Tech Hardware:** Evaluating internal wear, chip fabrication specs, and market value of modern computing cores.  \n    * **Xenotech Artifacts:** Identifying the rarity, function, and black-market pricing of unknown alien devices.  \n    * **Fine Art & Holography:** Spotting stylistic authenticity, provenance, and valuations in visual art and media.  \n    * **Weapons & Armor Valuation:** Pricing arms, determining custom modifications, and grading combat durability.  \n    * **Counterfeit & Forgery Detection:** Spotting faux stamps, reproduction alloys, doctored serials, and artificial aging.  \n    * **Raw Industrial Commodities:** Estimating bulk container loads of refined fuels, hyper-alloys, and construction composites.  \n    * **Metaphysical Artifacts:** Valuing enchanted talismans, psi-receptive matrices, and mana-infused items.  \n    * **Salvage Bulk Valuation:** Estimating the scrap yield and recovery profit of derelict ship hulls and shattered stations.\n\n  ###"
        },
        {
          "name": "Arcane",
          "id": "mental-arcane",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Arcane theory, esoteric lore, magical traditions, runes, and occult phenomena.",
          "keywords": "arcane, mental, intellect, cognitive, expertise, theory",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nSpecialties:\n",
          "full_text": "## **Arcane**\n\n* **Ability:** Intellect\n* **Description:** Arcane theory, esoteric lore, magical traditions, runes, and occult phenomena."
        },
        {
          "name": "Business",
          "id": "mental-business",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "The skill of understanding markets, corporate structures, economics, and business operations. It allows a character to analyze market trends, understand financial systems, and manage business ventures.",
          "keywords": "business, mental, intellect, cognitive, expertise, commerce",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Corporate Law & Governance",
            "Market Trend Analysis",
            "Investment & Portfolio Management",
            "Mergers & Acquisitions",
            "Venture Capitalism",
            "Fiscal Auditing",
            "Contract Architecture",
            "Marketing & Public Relations",
            "Risk Management",
            "Corporate Shell Networks"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Analyze Market:* CR 15 to predict trends or find investment opportunities.\n• *Corporate Insight:* CR 20 to understand internal company politics or organizational structures.\n• *Negotiation:* CR 15+ to facilitate business deals.\n\nSpecialties:\n• Corporate Law & Governance: Understanding regulatory filings, compliance liabilities, and corporate charters.\n• Market Trend Analysis: Forecasting supply, demand, and economic fluctuations across star sectors.\n• Investment & Portfolio Management: Allocating financial capital across ventures, equities, and resource bonds.\n• Mergers & Acquisitions: Conducting corporate takeovers, buyout evaluations, and shell company absorptions.\n• Venture Capitalism: Spotting promising tech startups and high-yield frontier resource ventures.\n• Fiscal Auditing: Tracing hidden accounting ledgers, corporate embezzlements, and balance sheet discrepancies.\n• Contract Architecture: Drafting binding corporate NDAs, licensing agreements, and commercial partnerships.\n• Marketing & Public Relations: Designing campaign rollouts and brand identity to maximize sector-wide sales.\n• Risk Management: Mitigating operational losses due to sector wars, market crashes, and supply disruptions.\n• Corporate Shell Networks: Establishing holding syndicates to protect personal assets from tax levies and seizures.",
          "specialty_details": [
            {
              "name": "Corporate Law & Governance",
              "description": "Understanding regulatory filings, compliance liabilities, and corporate charters."
            },
            {
              "name": "Market Trend Analysis",
              "description": "Forecasting supply, demand, and economic fluctuations across star sectors."
            },
            {
              "name": "Investment & Portfolio Management",
              "description": "Allocating financial capital across ventures, equities, and resource bonds."
            },
            {
              "name": "Mergers & Acquisitions",
              "description": "Conducting corporate takeovers, buyout evaluations, and shell company absorptions."
            },
            {
              "name": "Venture Capitalism",
              "description": "Spotting promising tech startups and high-yield frontier resource ventures."
            },
            {
              "name": "Fiscal Auditing",
              "description": "Tracing hidden accounting ledgers, corporate embezzlements, and balance sheet discrepancies."
            },
            {
              "name": "Contract Architecture",
              "description": "Drafting binding corporate NDAs, licensing agreements, and commercial partnerships."
            },
            {
              "name": "Marketing & Public Relations",
              "description": "Designing campaign rollouts and brand identity to maximize sector-wide sales."
            },
            {
              "name": "Risk Management",
              "description": "Mitigating operational losses due to sector wars, market crashes, and supply disruptions."
            },
            {
              "name": "Corporate Shell Networks",
              "description": "Establishing holding syndicates to protect personal assets from tax levies and seizures."
            }
          ],
          "full_text": "### **BUSINESS**\n\n* **Ability:** Intellect  \n* **Description:** The skill of understanding markets, corporate structures, economics, and business operations. It allows a character to analyze market trends, understand financial systems, and manage business ventures.  \n* **Mechanics:**  \n  * *Analyze Market:* CR 15 to predict trends or find investment opportunities.  \n  * *Corporate Insight:* CR 20 to understand internal company politics or organizational structures.  \n  * *Negotiation:* CR 15+ to facilitate business deals.  \n* **Specialties:**   \n  * **Corporate Law & Governance:** Understanding regulatory filings, compliance liabilities, and corporate charters.  \n    * **Market Trend Analysis:** Forecasting supply, demand, and economic fluctuations across star sectors.  \n    * **Investment & Portfolio Management:** Allocating financial capital across ventures, equities, and resource bonds.  \n    * **Mergers & Acquisitions:** Conducting corporate takeovers, buyout evaluations, and shell company absorptions.  \n    * **Venture Capitalism:** Spotting promising tech startups and high-yield frontier resource ventures.  \n    * **Fiscal Auditing:** Tracing hidden accounting ledgers, corporate embezzlements, and balance sheet discrepancies.  \n    * **Contract Architecture:** Drafting binding corporate NDAs, licensing agreements, and commercial partnerships.  \n    * **Marketing & Public Relations:** Designing campaign rollouts and brand identity to maximize sector-wide sales.  \n    * **Risk Management:** Mitigating operational losses due to sector wars, market crashes, and supply disruptions.  \n    * **Corporate Shell Networks:** Establishing holding syndicates to protect personal assets from tax levies and seizures."
        },
        {
          "name": "Computers",
          "id": "mental-computers",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Computer is the skill of understanding and using computer technology. It reflects a character's ability to operate and program computers, and to understand the underlying principles of computer science. Computer is used whenever a character needs to use a computer to perform a task, whether it's to hack into a system or to analyze data. This can include things like programming, hacking, and data analysis.",
          "keywords": "computers, mental, intellect, cognitive, expertise, hacking",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Network Intrusion (Hacking)",
            "Cyber-Defense & Hardening",
            "Scripting & Process Automation",
            "AI Architecture & Training",
            "Data Mining & Parsing",
            "Firmware & Low-Level Code",
            "Cryptographic Decryption",
            "Neural Interface Protocols",
            "Distributed Cloud Systems",
            "Counter-Forensic Scrubbing"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Operate Remote System:** CR 10 to CR 25 depending on security.\n• **Hacking:** CR is determined by the target system's firewall/security rating (Security Level + 10).\n• **Programming:** CR 15 (Simple Script) to CR 30+ (AI architecture).\n\nSpecialties:\n• Network Intrusion (Hacking): Cracking firewalls, breaching intrusion detection systems, and gaining administrative root.\n• Cyber-Defense & Hardening: Patching zero-day vulnerabilities, setting up honeypots, and countering rival hackers.\n• Scripting & Process Automation: Writing rapid macros and terminal scripts to automate complex digital procedures.\n• AI Architecture & Training: Developing, modifying, and debugging synthetic neural networks and heuristic models.\n• Data Mining & Parsing: Sifting petabytes of corporate and planetary databases to extract target information.\n• Firmware & Low-Level Code: Interfacing with raw machine code, BIOS chips, and low-level kernel drivers.\n• Cryptographic Decryption: Brute-forcing and mathematically unraveling complex data encryption keys.\n• Neural Interface Protocols: Configuring direct cybernetic brain-machine links and wetware jacks.\n• Distributed Cloud Systems: Managing planetary data farms, decentralized storage hubs, and quantum cloud relays.\n• Counter-Forensic Scrubbing: Erasing digital fingerprints, bounce-routing terminal traces, and wiping system logs.",
          "specialty_details": [
            {
              "name": "Network Intrusion (Hacking)",
              "description": "Cracking firewalls, breaching intrusion detection systems, and gaining administrative root."
            },
            {
              "name": "Cyber-Defense & Hardening",
              "description": "Patching zero-day vulnerabilities, setting up honeypots, and countering rival hackers."
            },
            {
              "name": "Scripting & Process Automation",
              "description": "Writing rapid macros and terminal scripts to automate complex digital procedures."
            },
            {
              "name": "AI Architecture & Training",
              "description": "Developing, modifying, and debugging synthetic neural networks and heuristic models."
            },
            {
              "name": "Data Mining & Parsing",
              "description": "Sifting petabytes of corporate and planetary databases to extract target information."
            },
            {
              "name": "Firmware & Low-Level Code",
              "description": "Interfacing with raw machine code, BIOS chips, and low-level kernel drivers."
            },
            {
              "name": "Cryptographic Decryption",
              "description": "Brute-forcing and mathematically unraveling complex data encryption keys."
            },
            {
              "name": "Neural Interface Protocols",
              "description": "Configuring direct cybernetic brain-machine links and wetware jacks."
            },
            {
              "name": "Distributed Cloud Systems",
              "description": "Managing planetary data farms, decentralized storage hubs, and quantum cloud relays."
            },
            {
              "name": "Counter-Forensic Scrubbing",
              "description": "Erasing digital fingerprints, bounce-routing terminal traces, and wiping system logs."
            }
          ],
          "full_text": "### **COMPUTERS**\n\n* **Ability:** Intellect  \n* **Description:** Computer is the skill of understanding and using computer technology. It reflects a character's ability to operate and program computers, and to understand the underlying principles of computer science. Computer is used whenever a character needs to use a computer to perform a task, whether it's to hack into a system or to analyze data. This can include things like programming, hacking, and data analysis.  \n* **Mechanics:**  \n  * **Operate Remote System:** CR 10 to CR 25 depending on security.  \n  * **Hacking:** CR is determined by the target system's firewall/security rating (Security Level \\+ 10).  \n  * **Programming:** CR 15 (Simple Script) to CR 30+ (AI architecture).  \n* **Specialties:**   \n  * **Network Intrusion (Hacking):** Cracking firewalls, breaching intrusion detection systems, and gaining administrative root.  \n    * **Cyber-Defense & Hardening:** Patching zero-day vulnerabilities, setting up honeypots, and countering rival hackers.  \n    * **Scripting & Process Automation:** Writing rapid macros and terminal scripts to automate complex digital procedures.  \n    * **AI Architecture & Training:** Developing, modifying, and debugging synthetic neural networks and heuristic models.  \n    * **Data Mining & Parsing:** Sifting petabytes of corporate and planetary databases to extract target information.  \n    * **Firmware & Low-Level Code:** Interfacing with raw machine code, BIOS chips, and low-level kernel drivers.  \n    * **Cryptographic Decryption:** Brute-forcing and mathematically unraveling complex data encryption keys.  \n    * **Neural Interface Protocols:** Configuring direct cybernetic brain-machine links and wetware jacks.  \n    * **Distributed Cloud Systems:** Managing planetary data farms, decentralized storage hubs, and quantum cloud relays.  \n    * **Counter-Forensic Scrubbing:** Erasing digital fingerprints, bounce-routing terminal traces, and wiping system logs.\n\n  ###"
        },
        {
          "name": "Culture",
          "id": "mental-culture",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Culture is the skill of understanding and appreciating different cultures. It reflects a character's ability to understand the customs, beliefs, and practices of different groups of people. Culture is used whenever a character needs to interact with people from different cultures, whether it's to negotiate a deal or to avoid offending someone. This can include things like understanding social norms, speaking different languages, and recognizing cultural symbols.",
          "keywords": "culture, mental, intellect, cognitive, expertise, customs",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Impyrium High Society",
            "Dynasty Lineages",
            "Underworld Subcultures",
            "Alien Xenology (Auluran/Kizin/Dwerg)",
            "Frontier & Nomad Customs",
            "Corporate Megacorp Culture",
            "Planetary Folkways",
            "Diplomatic Hospitality Protocols",
            "Taboos & Insults",
            "Galactic Pop Trends"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Etiquette Knowledge:** CR 10 (Common custom) to CR 25 (Obscure ritual).\n• **Identify Origin:** CR 15 to identify a person's origin based on dress or behavior.\n\nSpecialties:\n• Impyrium High Society: Navigating the subtle etiquette, titles, and ancestral hierarchies of the imperial core.\n• Dynasty Lineages: Understanding the honor codes, draconic influences, and clan hierarchies of the Dynasty.\n• Underworld Subcultures: Knowing street cant, gang boundary markers, and honor-among-thieves traditions.\n• Alien Xenology (Auluran/Kizin/Dwerg): Understanding the behavioral norms, biology, and taboos of major species.\n• Frontier & Nomad Customs: Grasping the survival rituals, barter courtesies, and rites of deep-space void-clans.\n• Corporate Megacorp Culture: Knowing executive ranks, intra-office politics, and corporate loyalty dogma.\n• Planetary Folkways: Adapting quickly to localized, isolated religious and traditional practices of frontier worlds.\n• Diplomatic Hospitality Protocols: Understanding the sacred guest rites, banquet behaviors, and host responsibilities.\n• Taboos & Insults: Recognizing subtle physical gestures, eye contact rules, or color choices that spark lethal offense.\n• Galactic Pop Trends: Tracking the fads, underground music scenes, and holistic lifestyle shifts of urban youths.",
          "specialty_details": [
            {
              "name": "Impyrium High Society",
              "description": "Navigating the subtle etiquette, titles, and ancestral hierarchies of the imperial core."
            },
            {
              "name": "Dynasty Lineages",
              "description": "Understanding the honor codes, draconic influences, and clan hierarchies of the Dynasty."
            },
            {
              "name": "Underworld Subcultures",
              "description": "Knowing street cant, gang boundary markers, and honor-among-thieves traditions."
            },
            {
              "name": "Alien Xenology (Auluran/Kizin/Dwerg)",
              "description": "Understanding the behavioral norms, biology, and taboos of major species."
            },
            {
              "name": "Frontier & Nomad Customs",
              "description": "Grasping the survival rituals, barter courtesies, and rites of deep-space void-clans."
            },
            {
              "name": "Corporate Megacorp Culture",
              "description": "Knowing executive ranks, intra-office politics, and corporate loyalty dogma."
            },
            {
              "name": "Planetary Folkways",
              "description": "Adapting quickly to localized, isolated religious and traditional practices of frontier worlds."
            },
            {
              "name": "Diplomatic Hospitality Protocols",
              "description": "Understanding the sacred guest rites, banquet behaviors, and host responsibilities."
            },
            {
              "name": "Taboos & Insults",
              "description": "Recognizing subtle physical gestures, eye contact rules, or color choices that spark lethal offense."
            },
            {
              "name": "Galactic Pop Trends",
              "description": "Tracking the fads, underground music scenes, and holistic lifestyle shifts of urban youths."
            }
          ],
          "full_text": "### **CULTURE**\n\n* **Ability:** Intellect  \n* **Description:** Culture is the skill of understanding and appreciating different cultures. It reflects a character's ability to understand the customs, beliefs, and practices of different groups of people. Culture is used whenever a character needs to interact with people from different cultures, whether it's to negotiate a deal or to avoid offending someone. This can include things like understanding social norms, speaking different languages, and recognizing cultural symbols.   \n* **Mechanics:**  \n  * **Etiquette Knowledge:** CR 10 (Common custom) to CR 25 (Obscure ritual).  \n  * **Identify Origin:** CR 15 to identify a person's origin based on dress or behavior.  \n* **Specialties:**   \n  * **Impyrium High Society:** Navigating the subtle etiquette, titles, and ancestral hierarchies of the imperial core.  \n    * **Dynasty Lineages:** Understanding the honor codes, draconic influences, and clan hierarchies of the Dynasty.  \n    * **Underworld Subcultures:** Knowing street cant, gang boundary markers, and honor-among-thieves traditions.  \n    * **Alien Xenology (Auluran/Kizin/Dwerg):** Understanding the behavioral norms, biology, and taboos of major species.  \n    * **Frontier & Nomad Customs:** Grasping the survival rituals, barter courtesies, and rites of deep-space void-clans.  \n    * **Corporate Megacorp Culture:** Knowing executive ranks, intra-office politics, and corporate loyalty dogma.  \n    * **Planetary Folkways:** Adapting quickly to localized, isolated religious and traditional practices of frontier worlds.  \n    * **Diplomatic Hospitality Protocols:** Understanding the sacred guest rites, banquet behaviors, and host responsibilities.  \n    * **Taboos & Insults:** Recognizing subtle physical gestures, eye contact rules, or color choices that spark lethal offense.  \n    * **Galactic Pop Trends:** Tracking the fads, underground music scenes, and holistic lifestyle shifts of urban youths.\n\n  ###"
        },
        {
          "name": "History",
          "id": "mental-history",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "History is the skill of understanding and interpreting historical events. It reflects a character's ability to understand the past and how it has shaped the present. History is used whenever a character needs to understand the context of a situation, whether it's to solve a mystery or to plan a strategy. This can include things like researching historical events, analyzing historical documents, and interpreting historical artifacts.",
          "keywords": "history, mental, intellect, cognitive, expertise, historical",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Ancient Civilizations",
            "Galactic Wars & Campaigns",
            "Planetary Colonization",
            "Technological Evolution",
            "Political Revolutions",
            "House & Dynasty Lineages",
            "Archaeological Context",
            "Religious Schisms",
            "Pre-Void Collapse Lore",
            "Economic Booms & Panics"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Recall Event:** CR 10 (Recent/Famous) to CR 30 (Pre-history/Lost).\n• **Legend Lore:** CR 20 to know rumors or legends about a specific place or item.\n\nSpecialties:\n• Ancient Civilizations: Studying the structures, fall, and artifacts of long-dead interstellar empires.\n• Galactic Wars & Campaigns: Recalling operational movements, treaties, and turning points of sector-wide conflicts.\n• Planetary Colonization: Knowing the initial settlement waves, generational ships, and terraforming histories of worlds.\n• Technological Evolution: Understanding the timeline of hyperdrive breakthroughs, laser discoveries, and AI bans.\n• Political Revolutions: Analyzing past civil uprisings, overthrow of despots, and governmental transitions.\n• House & Dynasty Lineages: Tracing historical royal successions, usurpations, and aristocratic marriages.\n• Archaeological Context: Dating architectural ruins, stratigraphy, and pre-collapse relic sites.\n• Religious Schisms: Knowing the theological splits, crusades, and doctrinal disputes that formed current faiths.\n• Pre-Void Collapse Lore: Recalling historical records and legends preceding the great cosmological cataclysms.\n• Economic Booms & Panics: Studying historical trade collapses, embargo famines, and planetary bankruptcies.",
          "specialty_details": [
            {
              "name": "Ancient Civilizations",
              "description": "Studying the structures, fall, and artifacts of long-dead interstellar empires."
            },
            {
              "name": "Galactic Wars & Campaigns",
              "description": "Recalling operational movements, treaties, and turning points of sector-wide conflicts."
            },
            {
              "name": "Planetary Colonization",
              "description": "Knowing the initial settlement waves, generational ships, and terraforming histories of worlds."
            },
            {
              "name": "Technological Evolution",
              "description": "Understanding the timeline of hyperdrive breakthroughs, laser discoveries, and AI bans."
            },
            {
              "name": "Political Revolutions",
              "description": "Analyzing past civil uprisings, overthrow of despots, and governmental transitions."
            },
            {
              "name": "House & Dynasty Lineages",
              "description": "Tracing historical royal successions, usurpations, and aristocratic marriages."
            },
            {
              "name": "Archaeological Context",
              "description": "Dating architectural ruins, stratigraphy, and pre-collapse relic sites."
            },
            {
              "name": "Religious Schisms",
              "description": "Knowing the theological splits, crusades, and doctrinal disputes that formed current faiths."
            },
            {
              "name": "Pre-Void Collapse Lore",
              "description": "Recalling historical records and legends preceding the great cosmological cataclysms."
            },
            {
              "name": "Economic Booms & Panics",
              "description": "Studying historical trade collapses, embargo famines, and planetary bankruptcies."
            }
          ],
          "full_text": "### **HISTORY**\n\n* **Ability:** Intellect  \n* **Description:** History is the skill of understanding and interpreting historical events. It reflects a character's ability to understand the past and how it has shaped the present. History is used whenever a character needs to understand the context of a situation, whether it's to solve a mystery or to plan a strategy. This can include things like researching historical events, analyzing historical documents, and interpreting historical artifacts.   \n* **Mechanics:**  \n  * **Recall Event:** CR 10 (Recent/Famous) to CR 30 (Pre-history/Lost).  \n  * **Legend Lore:** CR 20 to know rumors or legends about a specific place or item.  \n* **Specialties:**   \n  * **Ancient Civilizations:** Studying the structures, fall, and artifacts of long-dead interstellar empires.  \n    * **Galactic Wars & Campaigns:** Recalling operational movements, treaties, and turning points of sector-wide conflicts.  \n    * **Planetary Colonization:** Knowing the initial settlement waves, generational ships, and terraforming histories of worlds.  \n    * **Technological Evolution:** Understanding the timeline of hyperdrive breakthroughs, laser discoveries, and AI bans.  \n    * **Political Revolutions:** Analyzing past civil uprisings, overthrow of despots, and governmental transitions.  \n    * **House & Dynasty Lineages:** Tracing historical royal successions, usurpations, and aristocratic marriages.  \n    * **Archaeological Context:** Dating architectural ruins, stratigraphy, and pre-collapse relic sites.  \n    * **Religious Schisms:** Knowing the theological splits, crusades, and doctrinal disputes that formed current faiths.  \n    * **Pre-Void Collapse Lore:** Recalling historical records and legends preceding the great cosmological cataclysms.  \n    * **Economic Booms & Panics:** Studying historical trade collapses, embargo famines, and planetary bankruptcies.\n\n  ###"
        },
        {
          "name": "Investigation",
          "id": "mental-investigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "The application of deductive reasoning, forensics, and information gathering to solve mysteries. It differs from Alertness (which is spotting things) by focusing on *analyzing* what is found.",
          "keywords": "investigation, mental, intellect, cognitive, expertise, forensics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Crime Scene Reconstruction",
            "Forensic Ballistics & Trauma",
            "Digital Profiling & Tracing",
            "Evidence Preservation",
            "Interrogation Deduction",
            "Financial Paper Trails",
            "Physical Pattern Tracking",
            "Cryptanalysis",
            "Surveillance Audio/Video Analysis",
            "Cold Case Deduction"
          ],
          "governing_attribute": "Intellect (sometimes Perception)",
          "mechanic": "Governing Ability: Intellect (sometimes Perception)\n\nMechanics:\n• **Analyze Clue:** CR 15 to determine how a clue fits into the larger picture.\n• **Search/Forensics:** CR 15+ to find microscopic evidence or wiped data.\n\nSpecialties:\n• Crime Scene Reconstruction: Determining angles of fire, point of entry, sequence of events, and struggles.\n• Forensic Ballistics & Trauma: Matching projectile deformation, burn marks, and wound tracks to weapons.\n• Digital Profiling & Tracing: Piecing together target routines, communication meta-logs, and travel manifests.\n• Evidence Preservation: Collecting, bagging, and securing micro-traces, hairs, fibers, and chemical residue cleanly.\n• Interrogation Deduction: Spotting factual contradictions, nervous tics, and narrative inconsistencies during questioning.\n• Financial Paper Trails: Unraveling money laundering webs, hidden ledger transfers, and payment drops.\n• Physical Pattern Tracking: Connecting serial crimes, matching operational signatures across star systems.\n• Cryptanalysis: Solving handwritten ciphers, hidden dead-drop marks, and coded personal journals.\n• Surveillance Audio/Video Analysis: Cleaning up audio feeds, enhancing reflection data, and mapping blind spots.\n• Cold Case Deduction: Evaluating historical evidence files to surface overlooked facts or corrupt cover-ups.",
          "specialty_details": [
            {
              "name": "Crime Scene Reconstruction",
              "description": "Determining angles of fire, point of entry, sequence of events, and struggles."
            },
            {
              "name": "Forensic Ballistics & Trauma",
              "description": "Matching projectile deformation, burn marks, and wound tracks to weapons."
            },
            {
              "name": "Digital Profiling & Tracing",
              "description": "Piecing together target routines, communication meta-logs, and travel manifests."
            },
            {
              "name": "Evidence Preservation",
              "description": "Collecting, bagging, and securing micro-traces, hairs, fibers, and chemical residue cleanly."
            },
            {
              "name": "Interrogation Deduction",
              "description": "Spotting factual contradictions, nervous tics, and narrative inconsistencies during questioning."
            },
            {
              "name": "Financial Paper Trails",
              "description": "Unraveling money laundering webs, hidden ledger transfers, and payment drops."
            },
            {
              "name": "Physical Pattern Tracking",
              "description": "Connecting serial crimes, matching operational signatures across star systems."
            },
            {
              "name": "Cryptanalysis",
              "description": "Solving handwritten ciphers, hidden dead-drop marks, and coded personal journals."
            },
            {
              "name": "Surveillance Audio/Video Analysis",
              "description": "Cleaning up audio feeds, enhancing reflection data, and mapping blind spots."
            },
            {
              "name": "Cold Case Deduction",
              "description": "Evaluating historical evidence files to surface overlooked facts or corrupt cover-ups."
            }
          ],
          "full_text": "### **INVESTIGATION**\n\n* **Ability:** Intellect (sometimes Perception)  \n* **Description:** The application of deductive reasoning, forensics, and information gathering to solve mysteries. It differs from Alertness (which is spotting things) by focusing on *analyzing* what is found.  \n* **Mechanics:**  \n  * **Analyze Clue:** CR 15 to determine how a clue fits into the larger picture.  \n  * **Search/Forensics:** CR 15+ to find microscopic evidence or wiped data.  \n* **Specialties:**   \n  * **Crime Scene Reconstruction:** Determining angles of fire, point of entry, sequence of events, and struggles.  \n    * **Forensic Ballistics & Trauma:** Matching projectile deformation, burn marks, and wound tracks to weapons.  \n    * **Digital Profiling & Tracing:** Piecing together target routines, communication meta-logs, and travel manifests.  \n    * **Evidence Preservation:** Collecting, bagging, and securing micro-traces, hairs, fibers, and chemical residue cleanly.  \n    * **Interrogation Deduction:** Spotting factual contradictions, nervous tics, and narrative inconsistencies during questioning.  \n    * **Financial Paper Trails:** Unraveling money laundering webs, hidden ledger transfers, and payment drops.  \n    * **Physical Pattern Tracking:** Connecting serial crimes, matching operational signatures across star systems.  \n    * **Cryptanalysis:** Solving handwritten ciphers, hidden dead-drop marks, and coded personal journals.  \n    * **Surveillance Audio/Video Analysis:** Cleaning up audio feeds, enhancing reflection data, and mapping blind spots.  \n    * **Cold Case Deduction:** Evaluating historical evidence files to surface overlooked facts or corrupt cover-ups.\n\n###"
        },
        {
          "name": "Language",
          "id": "mental-language",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Language is the skill of understanding and speaking different languages. It reflects a character's ability to communicate with people from different cultures and backgrounds. Language is used whenever a character needs to communicate with someone who speaks a different language, whether it's to negotiate a deal or to gather information. This can include things like speaking, reading, and writing different languages. * Specializations for this skill can include specific languages. **Notable Languages:** Common or Trade - Known by most, mix of various languages and dialects Draconic - Tongue of Dragons, Draconic and Draconians, common in the Dynasty Premian - Spoken by Native Premians and common in the Syndicate Tech - Pidgin and Jargon common to scientist and technicians Fae - A shared semi-mystical tongue of beings and spirits of nature High Tongue - Impyrium, Ascendancy and some old Dynasty worlds Sign - Hand gesture communication ***Note** - Regional and World variants are very common but are usually based on a listed language (for most communication a check is generally not needed, indicating fluency in chosen language - whether spoken, written or any other context of that dialect. Rare dialects and old forms of the language will require checks to understand and communicate).*",
          "keywords": "language, mental, intellect, cognitive, expertise, linguistics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Trade Common Fluency",
            "Draconic Dialects",
            "Premian Tongue",
            "Tech-Jargon & Machine Cant",
            "Ancient & Dead Scripts",
            "Fae & Metamystic Dialects",
            "Imperial High Tongue",
            "Tactical Sign Language",
            "Xeno-Linguistic Decryption",
            "Lip Reading"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Decipher Script:** CR 20 (Simple code/Unknown dialect) to CR 30+ (Ancient/Alien cipher).\n• **Fluency:** Ranks determine fluency (1-2: Broken, 3-5: Fluent, 6+: Native/Technical).\n\nSpecialties:\n• Trade Common Fluency: Reading, writing, and speaking the primary universal interstellar commerce tongue.\n• Draconic Dialects: Fluency in the guttural, complex structural syntax of the Dynasty worlds.\n• Premian Tongue: Conversational and formal mastery of the native Premian languages of the Syndicate.\n• Tech-Jargon & Machine Cant: Interpreting compressed technical codes, system shorthand, and technician argot.\n• Ancient & Dead Scripts: Translating petroglyphs, ancestral tablets, and forgotten pre-space scripts.\n• Fae & Metamystic Dialects: Deciphering the symbolic, layered semantics of mystical and natural entities.\n• Imperial High Tongue: Conversing in the formal, flowery, and strictly regimented language of the Impyrium court.\n• Tactical Sign Language: Communicating complex tactical orders silently via standard military hand signals.\n• Xeno-Linguistic Decryption: Mapping unknown alien phonetic frameworks using mathematical syntax models.\n• Lip Reading: Discerning spoken words visually across silent rooms, surveillance video, or soundproof glass.",
          "specialty_details": [
            {
              "name": "Trade Common Fluency",
              "description": "Reading, writing, and speaking the primary universal interstellar commerce tongue."
            },
            {
              "name": "Draconic Dialects",
              "description": "Fluency in the guttural, complex structural syntax of the Dynasty worlds."
            },
            {
              "name": "Premian Tongue",
              "description": "Conversational and formal mastery of the native Premian languages of the Syndicate."
            },
            {
              "name": "Tech-Jargon & Machine Cant",
              "description": "Interpreting compressed technical codes, system shorthand, and technician argot."
            },
            {
              "name": "Ancient & Dead Scripts",
              "description": "Translating petroglyphs, ancestral tablets, and forgotten pre-space scripts."
            },
            {
              "name": "Fae & Metamystic Dialects",
              "description": "Deciphering the symbolic, layered semantics of mystical and natural entities."
            },
            {
              "name": "Imperial High Tongue",
              "description": "Conversing in the formal, flowery, and strictly regimented language of the Impyrium court."
            },
            {
              "name": "Tactical Sign Language",
              "description": "Communicating complex tactical orders silently via standard military hand signals."
            },
            {
              "name": "Xeno-Linguistic Decryption",
              "description": "Mapping unknown alien phonetic frameworks using mathematical syntax models."
            },
            {
              "name": "Lip Reading",
              "description": "Discerning spoken words visually across silent rooms, surveillance video, or soundproof glass."
            }
          ],
          "full_text": "### **LANGUAGE**\n\n* **Ability:** Intellect  \n* **Description:** Language is the skill of understanding and speaking different languages. It reflects a character's ability to communicate with people from different cultures and backgrounds. Language is used whenever a character needs to communicate with someone who speaks a different language, whether it's to negotiate a deal or to gather information. This can include things like speaking, reading, and writing different languages.   \n    \n* Specializations for this skill can include specific languages.  \n  **Notable Languages:**  \n  Common or Trade \\- Known by most, mix of various languages and dialects  \n  Draconic \\- Tongue of Dragons, Draconic and Draconians, common in the Dynasty  \n  Premian \\- Spoken by Native Premians and common in the Syndicate  \n  Tech \\- Pidgin and Jargon common to scientist and technicians  \n  Fae \\- A shared semi-mystical tongue of beings and spirits of nature  \n  High Tongue \\- Impyrium, Ascendancy and some old Dynasty worlds  \n  Sign \\- Hand gesture communication  \n  ***Note** \\- Regional and World variants are very common but are usually based on a listed language (for most communication a check is generally not needed, indicating fluency in chosen language \\- whether spoken, written or any other context of that dialect. Rare dialects and old forms of the language will require checks to understand and communicate).*  \n* **Mechanics:**  \n  * **Decipher Script:** CR 20 (Simple code/Unknown dialect) to CR 30+ (Ancient/Alien cipher).  \n  * **Fluency:** Ranks determine fluency (1-2: Broken, 3-5: Fluent, 6+: Native/Technical).  \n* **Specialties:**   \n  * **Trade Common Fluency:** Reading, writing, and speaking the primary universal interstellar commerce tongue.  \n    * **Draconic Dialects:** Fluency in the guttural, complex structural syntax of the Dynasty worlds.  \n    * **Premian Tongue:** Conversational and formal mastery of the native Premian languages of the Syndicate.  \n    * **Tech-Jargon & Machine Cant:** Interpreting compressed technical codes, system shorthand, and technician argot.  \n    * **Ancient & Dead Scripts:** Translating petroglyphs, ancestral tablets, and forgotten pre-space scripts.  \n    * **Fae & Metamystic Dialects:** Deciphering the symbolic, layered semantics of mystical and natural entities.  \n    * **Imperial High Tongue:** Conversing in the formal, flowery, and strictly regimented language of the Impyrium court.  \n    * **Tactical Sign Language:** Communicating complex tactical orders silently via standard military hand signals.  \n    * **Xeno-Linguistic Decryption:** Mapping unknown alien phonetic frameworks using mathematical syntax models.  \n    * **Lip Reading:** Discerning spoken words visually across silent rooms, surveillance video, or soundproof glass.\n\n  ###"
        },
        {
          "name": "Logistics",
          "id": "mental-logistics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "The skill of managing the flow of resources, supply chains, and large-scale operations. It reflects a character's ability to plan efficient movement, optimize inventory levels, and coordinate resource allocation. Logistics is used whenever a character needs to organize complex logistical operations, whether for military, industrial, or commercial purposes.",
          "keywords": "logistics, mental, intellect, cognitive, expertise, supply",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Interstellar Supply Chains",
            "Fleet Fuel & Resource Management",
            "Warehouse & Depot Operations",
            "Wartime Requisitioning",
            "Hazardous Cargo Transport",
            "Just-In-Time Distribution",
            "Cargo Manifest Auditing",
            "Emergency Relief Staging",
            "Multi-Modal Route Optimization",
            "Disassembly & Staging"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Supply Chain Management:* CR 15 to establish efficient supply routes or storage solutions.\n• *Resource Allocation:* CR 20 to optimize resource distribution during high-demand or crisis scenarios.\n• *Transport Planning:* CR 15+ to coordinate complex multi-modal shipments or fleet movements.\n\nSpecialties:\n• Interstellar Supply Chains: Organizing transport schedules across jump gates and hyperspace lanes.\n• Fleet Fuel & Resource Management: Calculating propellant reserves, reactor fuel burn, and life support replenishment.\n• Warehouse & Depot Operations: Optimizing cargo space, autonomous pallet storage, and loading bay throughput.\n• Wartime Requisitioning: Sourcing, prioritizing, and deploying arms, ammunition, and rations to active frontlines.\n• Hazardous Cargo Transport: Managing temperature, shielding, and containment protocols for volatile shipments.\n• Just-In-Time Distribution: Ensuring critical materials arrive exactly when required to minimize storage overhead.\n• Cargo Manifest Auditing: Detecting missing crates, manifest skimming, unauthorized stowaways, and smuggled tonnage.\n• Emergency Relief Staging: Rapidly deploying modular hospitals, rations, and water purification to disaster worlds.\n• Multi-Modal Route Optimization: Seamlessly integrating orbital drop, rail, atmospheric shuttle, and ground hauling.\n• Disassembly & Staging: Breaking down massive industrial machinery into shippable container modules.",
          "specialty_details": [
            {
              "name": "Interstellar Supply Chains",
              "description": "Organizing transport schedules across jump gates and hyperspace lanes."
            },
            {
              "name": "Fleet Fuel & Resource Management",
              "description": "Calculating propellant reserves, reactor fuel burn, and life support replenishment."
            },
            {
              "name": "Warehouse & Depot Operations",
              "description": "Optimizing cargo space, autonomous pallet storage, and loading bay throughput."
            },
            {
              "name": "Wartime Requisitioning",
              "description": "Sourcing, prioritizing, and deploying arms, ammunition, and rations to active frontlines."
            },
            {
              "name": "Hazardous Cargo Transport",
              "description": "Managing temperature, shielding, and containment protocols for volatile shipments."
            },
            {
              "name": "Just-In-Time Distribution",
              "description": "Ensuring critical materials arrive exactly when required to minimize storage overhead."
            },
            {
              "name": "Cargo Manifest Auditing",
              "description": "Detecting missing crates, manifest skimming, unauthorized stowaways, and smuggled tonnage."
            },
            {
              "name": "Emergency Relief Staging",
              "description": "Rapidly deploying modular hospitals, rations, and water purification to disaster worlds."
            },
            {
              "name": "Multi-Modal Route Optimization",
              "description": "Seamlessly integrating orbital drop, rail, atmospheric shuttle, and ground hauling."
            },
            {
              "name": "Disassembly & Staging",
              "description": "Breaking down massive industrial machinery into shippable container modules."
            }
          ],
          "full_text": "### **LOGISTICS**\n\n* **Ability:** Intellect  \n* **Description:** The skill of managing the flow of resources, supply chains, and large-scale operations. It reflects a character's ability to plan efficient movement, optimize inventory levels, and coordinate resource allocation. Logistics is used whenever a character needs to organize complex logistical operations, whether for military, industrial, or commercial purposes.  \n* **Mechanics:**  \n  * *Supply Chain Management:* CR 15 to establish efficient supply routes or storage solutions.  \n  * *Resource Allocation:* CR 20 to optimize resource distribution during high-demand or crisis scenarios.  \n  * *Transport Planning:* CR 15+ to coordinate complex multi-modal shipments or fleet movements.  \n* **Specialties:**   \n  * **Interstellar Supply Chains:** Organizing transport schedules across jump gates and hyperspace lanes.  \n    * **Fleet Fuel & Resource Management:** Calculating propellant reserves, reactor fuel burn, and life support replenishment.  \n    * **Warehouse & Depot Operations:** Optimizing cargo space, autonomous pallet storage, and loading bay throughput.  \n    * **Wartime Requisitioning:** Sourcing, prioritizing, and deploying arms, ammunition, and rations to active frontlines.  \n    * **Hazardous Cargo Transport:** Managing temperature, shielding, and containment protocols for volatile shipments.  \n    * **Just-In-Time Distribution:** Ensuring critical materials arrive exactly when required to minimize storage overhead.  \n    * **Cargo Manifest Auditing:** Detecting missing crates, manifest skimming, unauthorized stowaways, and smuggled tonnage.  \n    * **Emergency Relief Staging:** Rapidly deploying modular hospitals, rations, and water purification to disaster worlds.  \n    * **Multi-Modal Route Optimization:** Seamlessly integrating orbital drop, rail, atmospheric shuttle, and ground hauling.  \n    * **Disassembly & Staging:** Breaking down massive industrial machinery into shippable container modules.\n\n  ###"
        },
        {
          "name": "Medicine",
          "id": "mental-medicine",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Medicine is the skill of understanding and treating medical conditions. It reflects a character's ability to diagnose and treat illnesses and injuries. Medicine is used whenever a character needs to heal themselves or others, whether it's to save a life or to prevent an infection. This can include things like diagnosing illnesses, performing surgeries, and administering medication.",
          "keywords": "medicine, mental, intellect, cognitive, expertise, first",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Combat Trauma & Triage",
            "Field Surgery",
            "Xenobiology Treatment",
            "Pharmacology & Toxicology",
            "Cybernetic Implantation",
            "Infectious Diseases & Pathology",
            "Intensive Care Life-Support",
            "Gene Therapy",
            "Psychiatry & Neural Trauma",
            "Forensic Autopsy"
          ],
          "governing_attribute": "Wisdom (Intellect for surgery/diagnosis)",
          "mechanic": "Governing Ability: Wisdom (Intellect for surgery/diagnosis)\n\nMechanics:\n• **First Aid:** CR 15 to stabilize a dying character.\n• **Long-term Care:** CR 15 to double natural healing rates for a patient.\n• **Surgery/Treat Disease:** CR varies by severity (CR 15 to CR 30).\n\nSpecialties:\n• Combat Trauma & Triage: Stabilizing life-threatening wounds, stopping arterial bleeds, and patching sucking chests.\n• Field Surgery: Performing amputations, extracting shrapnel, and suturing organs under battlefield conditions.\n• Xenobiology Treatment: Diagnosing and treating disparate alien biologies, organs, and foreign blood chemistries.\n• Pharmacology & Toxicology: Synthesizing antidotes, administering pain management drugs, and treating poisons.\n• Cybernetic Implantation: Surgical installation, calibration, and rejection management of bionic limbs and organs.\n• Infectious Diseases & Pathology: Identifying bio-warfare vectors, alien spores, viruses, and designing quarantines.\n• Intensive Care Life-Support: Managing coma patients, critical stasis preservation, and multi-system organ failure.\n• Gene Therapy: Repairing radiation-induced DNA breaks and treating genetic degenerative diseases.\n• Psychiatry & Neural Trauma: Treating combat shock, chemical psychosis, and neural interface feedback loops.\n• Forensic Autopsy: Determining precise cause, timeline, and physical weapon signatures on deceased bodies.",
          "specialty_details": [
            {
              "name": "Combat Trauma & Triage",
              "description": "Stabilizing life-threatening wounds, stopping arterial bleeds, and patching sucking chests."
            },
            {
              "name": "Field Surgery",
              "description": "Performing amputations, extracting shrapnel, and suturing organs under battlefield conditions."
            },
            {
              "name": "Xenobiology Treatment",
              "description": "Diagnosing and treating disparate alien biologies, organs, and foreign blood chemistries."
            },
            {
              "name": "Pharmacology & Toxicology",
              "description": "Synthesizing antidotes, administering pain management drugs, and treating poisons."
            },
            {
              "name": "Cybernetic Implantation",
              "description": "Surgical installation, calibration, and rejection management of bionic limbs and organs."
            },
            {
              "name": "Infectious Diseases & Pathology",
              "description": "Identifying bio-warfare vectors, alien spores, viruses, and designing quarantines."
            },
            {
              "name": "Intensive Care Life-Support",
              "description": "Managing coma patients, critical stasis preservation, and multi-system organ failure."
            },
            {
              "name": "Gene Therapy",
              "description": "Repairing radiation-induced DNA breaks and treating genetic degenerative diseases."
            },
            {
              "name": "Psychiatry & Neural Trauma",
              "description": "Treating combat shock, chemical psychosis, and neural interface feedback loops."
            },
            {
              "name": "Forensic Autopsy",
              "description": "Determining precise cause, timeline, and physical weapon signatures on deceased bodies."
            }
          ],
          "full_text": "### **MEDICINE**\n\n* **Ability:** Wisdom (Intellect for surgery/diagnosis)  \n* **Description:** Medicine is the skill of understanding and treating medical conditions. It reflects a character's ability to diagnose and treat illnesses and injuries. Medicine is used whenever a character needs to heal themselves or others, whether it's to save a life or to prevent an infection. This can include things like diagnosing illnesses, performing surgeries, and administering medication.   \n* **Mechanics:**  \n  * **First Aid:** CR 15 to stabilize a dying character.  \n  * **Long-term Care:** CR 15 to double natural healing rates for a patient.  \n  * **Surgery/Treat Disease:** CR varies by severity (CR 15 to CR 30).  \n* **Specialties:**   \n  * **Combat Trauma & Triage:** Stabilizing life-threatening wounds, stopping arterial bleeds, and patching sucking chests.  \n    * **Field Surgery:** Performing amputations, extracting shrapnel, and suturing organs under battlefield conditions.  \n    * **Xenobiology Treatment:** Diagnosing and treating disparate alien biologies, organs, and foreign blood chemistries.  \n    * **Pharmacology & Toxicology:** Synthesizing antidotes, administering pain management drugs, and treating poisons.  \n    * **Cybernetic Implantation:** Surgical installation, calibration, and rejection management of bionic limbs and organs.  \n    * **Infectious Diseases & Pathology:** Identifying bio-warfare vectors, alien spores, viruses, and designing quarantines.  \n    * **Intensive Care Life-Support:** Managing coma patients, critical stasis preservation, and multi-system organ failure.  \n    * **Gene Therapy:** Repairing radiation-induced DNA breaks and treating genetic degenerative diseases.  \n    * **Psychiatry & Neural Trauma:** Treating combat shock, chemical psychosis, and neural interface feedback loops.  \n    * **Forensic Autopsy:** Determining precise cause, timeline, and physical weapon signatures on deceased bodies."
        },
        {
          "name": "Metaphysics",
          "id": "mental-metaphysics",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Metaphysics is the skill of understanding the fundamental nature of reality, existence, and the underlying principles of the universe. It reflects a character's ability to grasp abstract concepts, perceive patterns in the fabric of existence, and understand the limits of physical laws. Metaphysics is used whenever a character needs to comprehend anomalies, navigate realities, or understand the nature of psionic or magical energy.",
          "keywords": "metaphysics, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Planar Mechanics",
            "Cosmological Anomaly Analysis",
            "Psionic Field Theory",
            "Magitech Integration Theory",
            "Reality Anchoring",
            "Entropy & Void Dynamics",
            "Ley Line & Node Cartography",
            "Temporal Disruption Theory",
            "Aura Diagnostics",
            "Metascience Epistemology"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Identify Pattern:* CR 15 to recognize repeating cosmological or mystical patterns.\n• *Analyze Reality:* CR 20 to determine if a location is subject to unusual physical or planar laws.\n• *Theorize:* CR 25 to formulate a hypothesis about a high-level cosmic event.\n\nSpecialties:\n• Planar Mechanics: Charting the geometry, boundaries, and bleed-through zones of alternate dimensions.\n• Cosmological Anomaly Analysis: Diagnosing spatial rifts, localized reality tears, and planar convergence points.\n• Psionic Field Theory: Mapping neural energy waves, ESP transmission conduits, and psi-receptive matter.\n• Magitech Integration Theory: Designing circuit schematics that marry micro-electronics with arcane Ley matrices.\n• Reality Anchoring: Calculating stabilization thresholds to prevent reality dissolution by chaotic forces.\n• Entropy & Void Dynamics: Modeling decay radiation, Void incursions, and vacuum energy extractions.\n• Ley Line & Node Cartography: Locating and calculating the energetic output of planetary meta-currents.\n• Temporal Disruption Theory: Modeling localized chrono-stasis fields, causality loops, and paradox vectors.\n• Aura Diagnostics: Analyzing the metaphysical luminescence and spiritual health of awakened entities.\n• Metascience Epistemology: Formulating repeatable, scientific test standards for otherwise mystical occurrences.",
          "specialty_details": [
            {
              "name": "Planar Mechanics",
              "description": "Charting the geometry, boundaries, and bleed-through zones of alternate dimensions."
            },
            {
              "name": "Cosmological Anomaly Analysis",
              "description": "Diagnosing spatial rifts, localized reality tears, and planar convergence points."
            },
            {
              "name": "Psionic Field Theory",
              "description": "Mapping neural energy waves, ESP transmission conduits, and psi-receptive matter."
            },
            {
              "name": "Magitech Integration Theory",
              "description": "Designing circuit schematics that marry micro-electronics with arcane Ley matrices."
            },
            {
              "name": "Reality Anchoring",
              "description": "Calculating stabilization thresholds to prevent reality dissolution by chaotic forces."
            },
            {
              "name": "Entropy & Void Dynamics",
              "description": "Modeling decay radiation, Void incursions, and vacuum energy extractions."
            },
            {
              "name": "Ley Line & Node Cartography",
              "description": "Locating and calculating the energetic output of planetary meta-currents."
            },
            {
              "name": "Temporal Disruption Theory",
              "description": "Modeling localized chrono-stasis fields, causality loops, and paradox vectors."
            },
            {
              "name": "Aura Diagnostics",
              "description": "Analyzing the metaphysical luminescence and spiritual health of awakened entities."
            },
            {
              "name": "Metascience Epistemology",
              "description": "Formulating repeatable, scientific test standards for otherwise mystical occurrences."
            }
          ],
          "full_text": "### **METAPHYSICS**\n\n* **Ability:** Intellect  \n* **Description:** Metaphysics is the skill of understanding the fundamental nature of reality, existence, and the underlying principles of the universe. It reflects a character's ability to grasp abstract concepts, perceive patterns in the fabric of existence, and understand the limits of physical laws. Metaphysics is used whenever a character needs to comprehend anomalies, navigate realities, or understand the nature of psionic or magical energy.  \n* **Mechanics:**  \n  * *Identify Pattern:* CR 15 to recognize repeating cosmological or mystical patterns.  \n  * *Analyze Reality:* CR 20 to determine if a location is subject to unusual physical or planar laws.  \n  * *Theorize:* CR 25 to formulate a hypothesis about a high-level cosmic event.  \n* **Specialties:**   \n  * **Planar Mechanics:** Charting the geometry, boundaries, and bleed-through zones of alternate dimensions.  \n    * **Cosmological Anomaly Analysis:** Diagnosing spatial rifts, localized reality tears, and planar convergence points.  \n    * **Psionic Field Theory:** Mapping neural energy waves, ESP transmission conduits, and psi-receptive matter.  \n    * **Magitech Integration Theory:** Designing circuit schematics that marry micro-electronics with arcane Ley matrices.  \n    * **Reality Anchoring:** Calculating stabilization thresholds to prevent reality dissolution by chaotic forces.  \n    * **Entropy & Void Dynamics:** Modeling decay radiation, Void incursions, and vacuum energy extractions.  \n    * **Ley Line & Node Cartography:** Locating and calculating the energetic output of planetary meta-currents.  \n    * **Temporal Disruption Theory:** Modeling localized chrono-stasis fields, causality loops, and paradox vectors.  \n    * **Aura Diagnostics:** Analyzing the metaphysical luminescence and spiritual health of awakened entities.  \n    * **Metascience Epistemology:** Formulating repeatable, scientific test standards for otherwise mystical occurrences.\n\n  ###"
        },
        {
          "name": "Nature",
          "id": "mental-nature",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Nature is the skill of understanding and interacting with the natural world. It reflects a character's ability to survive in the wilderness and understand the ecology of different environments. Nature is used whenever a character needs to navigate through the wilderness, whether it's to hunt for food or to avoid danger. This can include things like tracking animals, identifying plants, and surviving in extreme environments.",
          "keywords": "nature, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Alien Botany",
            "Zoology & Beast Behavior",
            "Geology & Speleology",
            "Meteorology & Weather Forecasting",
            "Marine & Aquatic Ecology",
            "Toxicology Sourcing",
            "Biome Tracking",
            "Ecosystem Modeling",
            "Spelunking & Underground Survival",
            "Micro-Ecology & Spores"
          ],
          "governing_attribute": "Intellect (or Wisdom for practical application)",
          "mechanic": "Governing Ability: Intellect (or Wisdom for practical application)\n\nMechanics:\n• **Identify Creature:** CR 10 + Creature's Rarity/CR.\n• **Foraging/Remedies:** CR 15 to find herbal antidotes or food.\n\nSpecialties:\n• Alien Botany: Identifying toxic, medicinal, and nutritional properties of wild planetary plants.\n• Zoology & Beast Behavior: Predicting predator attack vectors, nesting grounds, and pack dynamics.\n• Geology & Speleology: Analyzing rock strata, seismic fault lines, mineral stability, and cavern layouts.\n• Meteorology & Weather Forecasting: Predicting dangerous ionic storms, hurricanes, acid rain, and sudden blizzards.\n• Marine & Aquatic Ecology: Navigating coastal shoals, identifying predatory sea life, and assessing tides.\n• Toxicology Sourcing: Extracting potent venom, paralyzing secretions, and irritants from wild creatures.\n• Biome Tracking: Identifying disturbed ground, broken twigs, scat, and animal territory scent posts.\n• Ecosystem Modeling: Assessing ecological collapses, invasive species introductions, and bio-cycles.\n• Spelunking & Underground Survival: Finding breathable air pockets, navigating cave-ins, and finding subterranean water.\n• Micro-Ecology & Spores: Detecting airborne fungal infestations, micro-parasites, and spore clouds.",
          "specialty_details": [
            {
              "name": "Alien Botany",
              "description": "Identifying toxic, medicinal, and nutritional properties of wild planetary plants."
            },
            {
              "name": "Zoology & Beast Behavior",
              "description": "Predicting predator attack vectors, nesting grounds, and pack dynamics."
            },
            {
              "name": "Geology & Speleology",
              "description": "Analyzing rock strata, seismic fault lines, mineral stability, and cavern layouts."
            },
            {
              "name": "Meteorology & Weather Forecasting",
              "description": "Predicting dangerous ionic storms, hurricanes, acid rain, and sudden blizzards."
            },
            {
              "name": "Marine & Aquatic Ecology",
              "description": "Navigating coastal shoals, identifying predatory sea life, and assessing tides."
            },
            {
              "name": "Toxicology Sourcing",
              "description": "Extracting potent venom, paralyzing secretions, and irritants from wild creatures."
            },
            {
              "name": "Biome Tracking",
              "description": "Identifying disturbed ground, broken twigs, scat, and animal territory scent posts."
            },
            {
              "name": "Ecosystem Modeling",
              "description": "Assessing ecological collapses, invasive species introductions, and bio-cycles."
            },
            {
              "name": "Spelunking & Underground Survival",
              "description": "Finding breathable air pockets, navigating cave-ins, and finding subterranean water."
            },
            {
              "name": "Micro-Ecology & Spores",
              "description": "Detecting airborne fungal infestations, micro-parasites, and spore clouds."
            }
          ],
          "full_text": "### **NATURE**\n\n* **Ability:** Intellect (or Wisdom for practical application)  \n* **Description:** Nature is the skill of understanding and interacting with the natural world. It reflects a character's ability to survive in the wilderness and understand the ecology of different environments. Nature is used whenever a character needs to navigate through the wilderness, whether it's to hunt for food or to avoid danger. This can include things like tracking animals, identifying plants, and surviving in extreme environments.   \n* **Mechanics:**  \n  * **Identify Creature:** CR 10 \\+ Creature's Rarity/CR.  \n  * **Foraging/Remedies:** CR 15 to find herbal antidotes or food.  \n* **Specialties:**   \n  * **Alien Botany:** Identifying toxic, medicinal, and nutritional properties of wild planetary plants.  \n    * **Zoology & Beast Behavior:** Predicting predator attack vectors, nesting grounds, and pack dynamics.  \n    * **Geology & Speleology:** Analyzing rock strata, seismic fault lines, mineral stability, and cavern layouts.  \n    * **Meteorology & Weather Forecasting:** Predicting dangerous ionic storms, hurricanes, acid rain, and sudden blizzards.  \n    * **Marine & Aquatic Ecology:** Navigating coastal shoals, identifying predatory sea life, and assessing tides.  \n    * **Toxicology Sourcing:** Extracting potent venom, paralyzing secretions, and irritants from wild creatures.  \n    * **Biome Tracking:** Identifying disturbed ground, broken twigs, scat, and animal territory scent posts.  \n    * **Ecosystem Modeling:** Assessing ecological collapses, invasive species introductions, and bio-cycles.  \n    * **Spelunking & Underground Survival:** Finding breathable air pockets, navigating cave-ins, and finding subterranean water.  \n    * **Micro-Ecology & Spores:** Detecting airborne fungal infestations, micro-parasites, and spore clouds.\n\n  ###"
        },
        {
          "name": "Navigation",
          "id": "mental-navigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Navigation is the skill of understanding and using navigational tools. It reflects a character's ability to navigate through different environments, whether it's on land, sea, or air. Navigation is used whenever a character needs to travel to a specific location, whether it's to explore a new area or to deliver a package. This can include things like using a map and compass, piloting a ship, or flying a plane.",
          "keywords": "navigation, mental, intellect, cognitive, expertise, astrogation",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Astrogation & FTL Calculations",
            "Planetary Orienteering",
            "Cartography & Mapmaking",
            "Dead Reckoning",
            "Subterranean Navigation",
            "Drift & Anomaly Routing",
            "Orbital Mechanics",
            "Nautical & Marine Navigation",
            "Sensor-Blind Navigation",
            "Waystation & Gate Wayfinding"
          ],
          "governing_attribute": "Intellect (Astrogation) or Wisdom (Survival)",
          "mechanic": "Governing Ability: Intellect (Astrogation) or Wisdom (Survival)\n\nMechanics:\n• **Plot Course:** CR 10 (Familiar) to CR 25 (Uncharted/Hazardous).\n• **Astrogation:** Calculating FTL jumps (CR varies by distance and route stability).\n\nSpecialties:\n• Astrogation & FTL Calculations: Plotting jump-vectors through hyperspace, avoiding gravity wells and stars.\n• Planetary Orienteering: Traversing wilderness using compasses, star arrays, natural landmarks, and elevation maps.\n• Cartography & Mapmaking: Drafting detailed topographical, nautical, and three-dimensional celestial maps.\n• Dead Reckoning: Calculating current position based strictly on velocity, time, and previous heading.\n• Subterranean Navigation: Mapping complex cavern networks, mine tunnels, and under-city catacombs.\n• Drift & Anomaly Routing: Navigating around radiation belts, ion storms, asteroid fields, and spatial debris.\n• Orbital Mechanics: Calculating re-entry angles, geosynchronous orbits, and slingshot escape velocities.\n• Nautical & Marine Navigation: Charting ocean currents, reefs, depth soundings, and dead-water channels.\n• Sensor-Blind Navigation: Flying or driving purely on inertial instruments when sensors are completely jammed.\n• Waystation & Gate Wayfinding: Knowing established sector beacon networks, gate corridors, and toll routes.",
          "specialty_details": [
            {
              "name": "Astrogation & FTL Calculations",
              "description": "Plotting jump-vectors through hyperspace, avoiding gravity wells and stars."
            },
            {
              "name": "Planetary Orienteering",
              "description": "Traversing wilderness using compasses, star arrays, natural landmarks, and elevation maps."
            },
            {
              "name": "Cartography & Mapmaking",
              "description": "Drafting detailed topographical, nautical, and three-dimensional celestial maps."
            },
            {
              "name": "Dead Reckoning",
              "description": "Calculating current position based strictly on velocity, time, and previous heading."
            },
            {
              "name": "Subterranean Navigation",
              "description": "Mapping complex cavern networks, mine tunnels, and under-city catacombs."
            },
            {
              "name": "Drift & Anomaly Routing",
              "description": "Navigating around radiation belts, ion storms, asteroid fields, and spatial debris."
            },
            {
              "name": "Orbital Mechanics",
              "description": "Calculating re-entry angles, geosynchronous orbits, and slingshot escape velocities."
            },
            {
              "name": "Nautical & Marine Navigation",
              "description": "Charting ocean currents, reefs, depth soundings, and dead-water channels."
            },
            {
              "name": "Sensor-Blind Navigation",
              "description": "Flying or driving purely on inertial instruments when sensors are completely jammed."
            },
            {
              "name": "Waystation & Gate Wayfinding",
              "description": "Knowing established sector beacon networks, gate corridors, and toll routes."
            }
          ],
          "full_text": "### **NAVIGATION**\n\n* **Ability:** Intellect (Astrogation) or Wisdom (Survival)  \n* **Description:** Navigation is the skill of understanding and using navigational tools. It reflects a character's ability to navigate through different environments, whether it's on land, sea, or air. Navigation is used whenever a character needs to travel to a specific location, whether it's to explore a new area or to deliver a package. This can include things like using a map and compass, piloting a ship, or flying a plane.  \n* **Mechanics:**  \n  * **Plot Course:** CR 10 (Familiar) to CR 25 (Uncharted/Hazardous).  \n  * **Astrogation:** Calculating FTL jumps (CR varies by distance and route stability).  \n* **Specialties:**   \n  * **Astrogation & FTL Calculations:** Plotting jump-vectors through hyperspace, avoiding gravity wells and stars.  \n    * **Planetary Orienteering:** Traversing wilderness using compasses, star arrays, natural landmarks, and elevation maps.  \n    * **Cartography & Mapmaking:** Drafting detailed topographical, nautical, and three-dimensional celestial maps.  \n    * **Dead Reckoning:** Calculating current position based strictly on velocity, time, and previous heading.  \n    * **Subterranean Navigation:** Mapping complex cavern networks, mine tunnels, and under-city catacombs.  \n    * **Drift & Anomaly Routing:** Navigating around radiation belts, ion storms, asteroid fields, and spatial debris.  \n    * **Orbital Mechanics:** Calculating re-entry angles, geosynchronous orbits, and slingshot escape velocities.  \n    * **Nautical & Marine Navigation:** Charting ocean currents, reefs, depth soundings, and dead-water channels.  \n    * **Sensor-Blind Navigation:** Flying or driving purely on inertial instruments when sensors are completely jammed.  \n    * **Waystation & Gate Wayfinding:** Knowing established sector beacon networks, gate corridors, and toll routes.\n\n  ###"
        },
        {
          "name": "Nobility",
          "id": "mental-nobility",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Nobility is the skill of understanding and interacting with the aristocracy. It reflects a character's ability to navigate a society's social hierarchy and interact with people of high status. Nobility is used whenever a character needs to interact with the aristocracy, whether it's to gain political power or to secure a marriage alliance. This can include things like understanding court etiquette, negotiating with nobles, and identifying noble titles.",
          "keywords": "nobility, mental, intellect, cognitive, expertise, heraldry",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Imperial Dynasties",
            "Heraldry & Insignia",
            "Aristocratic Etiquette",
            "Feudal Law & Land Rights",
            "Court Intrigue & Factionalism",
            "Chivalric Orders",
            "Diplomatic Immunity Protocols",
            "Precedence Arbitration",
            "Royal Matchmaking",
            "Private Royal Treasuries"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Identify Heraldry:** CR 10 (Major House) to CR 25 (Obscure lineage).\n• **Political Insight:** CR 15 to understand current political intrigues.\n\nSpecialties:\n• Imperial Dynasties: Tracing succession charts, legitimate heirs, and marriage covenants of Great Houses.\n• Heraldry & Insignia: Identifying house crests, livery patterns, honor banners, and personal sigils.\n• Aristocratic Etiquette: Knowing correct forms of address, seating arrangements, and bow depths for high nobility.\n• Feudal Law & Land Rights: Interpreting ancestral planetary charters, fief titles, and aristocratic privileges.\n• Court Intrigue & Factionalism: Identifying secret alliances, covert blood feuds, and patronage webs among nobility.\n• Chivalric Orders: Knowing the codes, members, sworn oaths, and tournament rights of titled knightly groups.\n• Diplomatic Immunity Protocols: Invoking or circumventing noble sovereign immunity and peerage protections.\n• Precedence Arbitration: Resolving violent squabbles between visiting lords over status, rank, and parade priority.\n• Royal Matchmaking: Calculating political and financial yields of proposed inter-house dynastic marriages.\n• Private Royal Treasuries: Understanding the asset holdings, private guards, and sovereign wealth funds of dukes and kings.",
          "specialty_details": [
            {
              "name": "Imperial Dynasties",
              "description": "Tracing succession charts, legitimate heirs, and marriage covenants of Great Houses."
            },
            {
              "name": "Heraldry & Insignia",
              "description": "Identifying house crests, livery patterns, honor banners, and personal sigils."
            },
            {
              "name": "Aristocratic Etiquette",
              "description": "Knowing correct forms of address, seating arrangements, and bow depths for high nobility."
            },
            {
              "name": "Feudal Law & Land Rights",
              "description": "Interpreting ancestral planetary charters, fief titles, and aristocratic privileges."
            },
            {
              "name": "Court Intrigue & Factionalism",
              "description": "Identifying secret alliances, covert blood feuds, and patronage webs among nobility."
            },
            {
              "name": "Chivalric Orders",
              "description": "Knowing the codes, members, sworn oaths, and tournament rights of titled knightly groups."
            },
            {
              "name": "Diplomatic Immunity Protocols",
              "description": "Invoking or circumventing noble sovereign immunity and peerage protections."
            },
            {
              "name": "Precedence Arbitration",
              "description": "Resolving violent squabbles between visiting lords over status, rank, and parade priority."
            },
            {
              "name": "Royal Matchmaking",
              "description": "Calculating political and financial yields of proposed inter-house dynastic marriages."
            },
            {
              "name": "Private Royal Treasuries",
              "description": "Understanding the asset holdings, private guards, and sovereign wealth funds of dukes and kings."
            }
          ],
          "full_text": "### **NOBILITY**\n\n* **Ability:** Intellect  \n* **Description:** Nobility is the skill of understanding and interacting with the aristocracy. It reflects a character's ability to navigate a society's social hierarchy and interact with people of high status. Nobility is used whenever a character needs to interact with the aristocracy, whether it's to gain political power or to secure a marriage alliance. This can include things like understanding court etiquette, negotiating with nobles, and identifying noble titles.   \n* **Mechanics:**  \n  * **Identify Heraldry:** CR 10 (Major House) to CR 25 (Obscure lineage).  \n  * **Political Insight:** CR 15 to understand current political intrigues.  \n* **Specialties:**   \n  * **Imperial Dynasties:** Tracing succession charts, legitimate heirs, and marriage covenants of Great Houses.  \n    * **Heraldry & Insignia:** Identifying house crests, livery patterns, honor banners, and personal sigils.  \n    * **Aristocratic Etiquette:** Knowing correct forms of address, seating arrangements, and bow depths for high nobility.  \n    * **Feudal Law & Land Rights:** Interpreting ancestral planetary charters, fief titles, and aristocratic privileges.  \n    * **Court Intrigue & Factionalism:** Identifying secret alliances, covert blood feuds, and patronage webs among nobility.  \n    * **Chivalric Orders:** Knowing the codes, members, sworn oaths, and tournament rights of titled knightly groups.  \n    * **Diplomatic Immunity Protocols:** Invoking or circumventing noble sovereign immunity and peerage protections.  \n    * **Precedence Arbitration:** Resolving violent squabbles between visiting lords over status, rank, and parade priority.  \n    * **Royal Matchmaking:** Calculating political and financial yields of proposed inter-house dynastic marriages.  \n    * **Private Royal Treasuries:** Understanding the asset holdings, private guards, and sovereign wealth funds of dukes and kings.\n\n  ###"
        },
        {
          "name": "Physics",
          "id": "mental-physics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Physics is the skill of understanding and applying the laws of physics. It reflects a character's ability to understand the physical world and use that knowledge to solve problems. Physics is used whenever a character needs to understand the behavior of physical objects, whether it's to design a machine or to solve a puzzle. This can include things like calculating trajectories, designing experiments, and understanding the properties of matter and energy.",
          "keywords": "physics, mental, intellect, cognitive, expertise, astrophysics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Astrophysics",
            "Quantum Mechanics",
            "Relativistic Mechanics",
            "Plasma & High-Energy Dynamics",
            "Gravitational Field Physics",
            "Ballistics Trajectory",
            "Fluid Dynamics",
            "Thermodynamics",
            "Subatomic Particle Acceleration",
            "Dimensional Warp Mechanics"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Solve Problem:** CR 15 to CR 30 depending on complexity.\n• **Analyze Anomaly:** CR 20+ to understand spatial distortions or energy fields.\n\nSpecialties:\n• Astrophysics: Modeling stellar life cycles, black hole event horizons, neutron stars, and accretion disks.\n• Quantum Mechanics: Calculating particle superposition, quantum entanglement communications, and tunneling.\n• Relativistic Mechanics: Accounting for time dilation, high-velocity mass expansion, and sub-light acceleration.\n• Plasma & High-Energy Dynamics: Regulating magnetic confinement bottles and thermonuclear energy streams.\n• Gravitational Field Physics: Calculating grav-plate fields, tidal forces, and artificial gravity generator grids.\n• Ballistics Trajectory: Calculating complex gravitational-assist projectile arcs across atmospheric wind shears.\n• Fluid Dynamics: Modeling atmospheric drag on hull profiles and turbulent flows through turbines.\n• Thermodynamics: Designing heat-sink radiation fins, thermal dissipation grids, and cooling loops.\n• Subatomic Particle Acceleration: Understanding antimatter creation, particle beam collation, and cyclotron arrays.\n• Dimensional Warp Mechanics: Modeling spatial curvature, Alcubierre bubble metrics, and metric tension.",
          "specialty_details": [
            {
              "name": "Astrophysics",
              "description": "Modeling stellar life cycles, black hole event horizons, neutron stars, and accretion disks."
            },
            {
              "name": "Quantum Mechanics",
              "description": "Calculating particle superposition, quantum entanglement communications, and tunneling."
            },
            {
              "name": "Relativistic Mechanics",
              "description": "Accounting for time dilation, high-velocity mass expansion, and sub-light acceleration."
            },
            {
              "name": "Plasma & High-Energy Dynamics",
              "description": "Regulating magnetic confinement bottles and thermonuclear energy streams."
            },
            {
              "name": "Gravitational Field Physics",
              "description": "Calculating grav-plate fields, tidal forces, and artificial gravity generator grids."
            },
            {
              "name": "Ballistics Trajectory",
              "description": "Calculating complex gravitational-assist projectile arcs across atmospheric wind shears."
            },
            {
              "name": "Fluid Dynamics",
              "description": "Modeling atmospheric drag on hull profiles and turbulent flows through turbines."
            },
            {
              "name": "Thermodynamics",
              "description": "Designing heat-sink radiation fins, thermal dissipation grids, and cooling loops."
            },
            {
              "name": "Subatomic Particle Acceleration",
              "description": "Understanding antimatter creation, particle beam collation, and cyclotron arrays."
            },
            {
              "name": "Dimensional Warp Mechanics",
              "description": "Modeling spatial curvature, Alcubierre bubble metrics, and metric tension."
            }
          ],
          "full_text": "### **PHYSICS**\n\n* **Ability:** Intellect  \n* **Description:** Physics is the skill of understanding and applying the laws of physics. It reflects a character's ability to understand the physical world and use that knowledge to solve problems. Physics is used whenever a character needs to understand the behavior of physical objects, whether it's to design a machine or to solve a puzzle. This can include things like calculating trajectories, designing experiments, and understanding the properties of matter and energy.   \n* **Mechanics:**  \n  * **Solve Problem:** CR 15 to CR 30 depending on complexity.  \n  * **Analyze Anomaly:** CR 20+ to understand spatial distortions or energy fields.  \n* **Specialties:**   \n  * **Astrophysics:** Modeling stellar life cycles, black hole event horizons, neutron stars, and accretion disks.  \n    * **Quantum Mechanics:** Calculating particle superposition, quantum entanglement communications, and tunneling.  \n    * **Relativistic Mechanics:** Accounting for time dilation, high-velocity mass expansion, and sub-light acceleration.  \n    * **Plasma & High-Energy Dynamics:** Regulating magnetic confinement bottles and thermonuclear energy streams.  \n    * **Gravitational Field Physics:** Calculating grav-plate fields, tidal forces, and artificial gravity generator grids.  \n    * **Ballistics Trajectory:** Calculating complex gravitational-assist projectile arcs across atmospheric wind shears.  \n    * **Fluid Dynamics:** Modeling atmospheric drag on hull profiles and turbulent flows through turbines.  \n    * **Thermodynamics:** Designing heat-sink radiation fins, thermal dissipation grids, and cooling loops.  \n    * **Subatomic Particle Acceleration:** Understanding antimatter creation, particle beam collation, and cyclotron arrays.  \n    * **Dimensional Warp Mechanics:** Modeling spatial curvature, Alcubierre bubble metrics, and metric tension.\n\n  ###"
        },
        {
          "name": "Religion",
          "id": "mental-religion",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Religion is the skill of understanding and practicing religious beliefs. It reflects a character's ability to understand the beliefs and practices of different religions, and to practice their own religion. Religion is used whenever a character needs to interact with people of different faiths, whether it's to negotiate a peace treaty or to perform a religious ceremony. This can include things like understanding religious texts, performing religious rituals, and interpreting religious symbols.",
          "keywords": "religion, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Pantheons & Cosmic Deities",
            "Sectarian Cults & Heresies",
            "Liturgical Rites & Rituals",
            "Scriptural Hermeneutics",
            "Funerary Rites & Afterlife Lore",
            "Sacred Symbolism",
            "Ascendant & Precursor Worship",
            "Prophetic Traditions",
            "Ecclesiastical Law",
            "Exorcism & Cleansing"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Identify Symbol/Rite:** CR 10 (Common) to CR 25 (Secret Cult).\n• **Theological Debate:** Supported by Diplomacy checks.\n\nSpecialties:\n• Pantheons & Cosmic Deities: Recalling the domains, alignments, and mythologies of recognized sector gods.\n• Sectarian Cults & Heresies: Identifying outlawed apocalyptic sects, blood cults, and rogue pseudo-religious factions.\n• Liturgical Rites & Rituals: Conducting, interpreting, or disrupting formal consecrations, ordinations, and purifications.\n• Scriptural Hermeneutics: Quoting chapter and verse from holy texts to win theological arguments or sway monks.\n• Funerary Rites & Afterlife Lore: Knowing the death rites, ossuary designs, and spirit-warding traditions of cultures.\n• Sacred Symbolism: Decoding holy icons, divine glyphs, sacred geometries, and ceremonial vestment colors.\n• Ascendant & Precursor Worship: Understanding sects that deify ancient alien architects or god-machines.\n• Prophetic Traditions: Interpreting ancient religious prophecies, apocalyptic calendars, and omens.\n• Ecclesiastical Law: Navigating church property rights, clerical trials, and sanctuary protections.\n• Exorcism & Cleansing: Identifying canonical rites to purge metaphysical corruption or unclean entities from holy ground.",
          "specialty_details": [
            {
              "name": "Pantheons & Cosmic Deities",
              "description": "Recalling the domains, alignments, and mythologies of recognized sector gods."
            },
            {
              "name": "Sectarian Cults & Heresies",
              "description": "Identifying outlawed apocalyptic sects, blood cults, and rogue pseudo-religious factions."
            },
            {
              "name": "Liturgical Rites & Rituals",
              "description": "Conducting, interpreting, or disrupting formal consecrations, ordinations, and purifications."
            },
            {
              "name": "Scriptural Hermeneutics",
              "description": "Quoting chapter and verse from holy texts to win theological arguments or sway monks."
            },
            {
              "name": "Funerary Rites & Afterlife Lore",
              "description": "Knowing the death rites, ossuary designs, and spirit-warding traditions of cultures."
            },
            {
              "name": "Sacred Symbolism",
              "description": "Decoding holy icons, divine glyphs, sacred geometries, and ceremonial vestment colors."
            },
            {
              "name": "Ascendant & Precursor Worship",
              "description": "Understanding sects that deify ancient alien architects or god-machines."
            },
            {
              "name": "Prophetic Traditions",
              "description": "Interpreting ancient religious prophecies, apocalyptic calendars, and omens."
            },
            {
              "name": "Ecclesiastical Law",
              "description": "Navigating church property rights, clerical trials, and sanctuary protections."
            },
            {
              "name": "Exorcism & Cleansing",
              "description": "Identifying canonical rites to purge metaphysical corruption or unclean entities from holy ground."
            }
          ],
          "full_text": "### **RELIGION**\n\n* **Ability:** Intellect  \n* **Description:** Religion is the skill of understanding and practicing religious beliefs. It reflects a character's ability to understand the beliefs and practices of different religions, and to practice their own religion. Religion is used whenever a character needs to interact with people of different faiths, whether it's to negotiate a peace treaty or to perform a religious ceremony. This can include things like understanding religious texts, performing religious rituals, and interpreting religious symbols.  \n* **Mechanics:**  \n  * **Identify Symbol/Rite:** CR 10 (Common) to CR 25 (Secret Cult).  \n  * **Theological Debate:** Supported by Diplomacy checks.  \n* **Specialties:**   \n  * **Pantheons & Cosmic Deities:** Recalling the domains, alignments, and mythologies of recognized sector gods.  \n    * **Sectarian Cults & Heresies:** Identifying outlawed apocalyptic sects, blood cults, and rogue pseudo-religious factions.  \n    * **Liturgical Rites & Rituals:** Conducting, interpreting, or disrupting formal consecrations, ordinations, and purifications.  \n    * **Scriptural Hermeneutics:** Quoting chapter and verse from holy texts to win theological arguments or sway monks.  \n    * **Funerary Rites & Afterlife Lore:** Knowing the death rites, ossuary designs, and spirit-warding traditions of cultures.  \n    * **Sacred Symbolism:** Decoding holy icons, divine glyphs, sacred geometries, and ceremonial vestment colors.  \n    * **Ascendant & Precursor Worship:** Understanding sects that deify ancient alien architects or god-machines.  \n    * **Prophetic Traditions:** Interpreting ancient religious prophecies, apocalyptic calendars, and omens.  \n    * **Ecclesiastical Law:** Navigating church property rights, clerical trials, and sanctuary protections.  \n    * **Exorcism & Cleansing:** Identifying canonical rites to purge metaphysical corruption or unclean entities from holy ground.\n\n  ###"
        },
        {
          "name": "Science",
          "id": "mental-science",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Science is the skill of understanding and applying the scientific method. It reflects a character's ability to understand the natural world and use that knowledge to solve problems. Science is used whenever a character needs to understand the behavior of natural phenomena, whether it's to design an experiment or to solve a mystery. This can include things like designing experiments, analyzing data, and interpreting scientific theories.",
          "keywords": "science, mental, intellect, cognitive, expertise, scientific",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Inorganic Chemistry",
            "Biochemistry",
            "Genetics & Cloning",
            "Material Science & Metallurgy",
            "Nanotechnology",
            "Laboratory Procedure",
            "Atmospheric Chemistry",
            "Radiological Science",
            "Synthetic Biology",
            "Applied Spectroscopy"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Lab Work:** CR 15 to perform experiments.\n• **Identify Substance:** CR 15 to CR 25\\.\n\nSpecialties:\n• Inorganic Chemistry: Synthesizing acids, industrial catalysts, synthetic polymers, and inert shielding reagents.\n• Biochemistry: Analyzing cellular metabolism, amino acid structures, and enzymatic reaction triggers.\n• Genetics & Cloning: Splicing DNA, sequencing alien genomes, and managing cellular degradation in clones.\n• Material Science & Metallurgy: Testing tensile strength, molecular lattice bonding, and alloy fatigue.\n• Nanotechnology: Programming molecular assemblers, managing gray-goo dampeners, and repairing nano-swarms.\n• Laboratory Procedure: Operating centrifuges, mass spectrometers, clean-room environments, and electron microscopes.\n• Atmospheric Chemistry: Analyzing toxic air balances, terraforming gas mixtures, and greenhouse gas saturation.\n• Radiological Science: Measuring rems, half-lives, radioactive isotope decay, and managing fission shielding.\n• Synthetic Biology: Designing artificial bacteria to consume plastics, scrub hydrocarbons, or excrete fuels.\n• Applied Spectroscopy: Analyzing distant planetary atmospheres and compound solutions using optical light bands.",
          "specialty_details": [
            {
              "name": "Inorganic Chemistry",
              "description": "Synthesizing acids, industrial catalysts, synthetic polymers, and inert shielding reagents."
            },
            {
              "name": "Biochemistry",
              "description": "Analyzing cellular metabolism, amino acid structures, and enzymatic reaction triggers."
            },
            {
              "name": "Genetics & Cloning",
              "description": "Splicing DNA, sequencing alien genomes, and managing cellular degradation in clones."
            },
            {
              "name": "Material Science & Metallurgy",
              "description": "Testing tensile strength, molecular lattice bonding, and alloy fatigue."
            },
            {
              "name": "Nanotechnology",
              "description": "Programming molecular assemblers, managing gray-goo dampeners, and repairing nano-swarms."
            },
            {
              "name": "Laboratory Procedure",
              "description": "Operating centrifuges, mass spectrometers, clean-room environments, and electron microscopes."
            },
            {
              "name": "Atmospheric Chemistry",
              "description": "Analyzing toxic air balances, terraforming gas mixtures, and greenhouse gas saturation."
            },
            {
              "name": "Radiological Science",
              "description": "Measuring rems, half-lives, radioactive isotope decay, and managing fission shielding."
            },
            {
              "name": "Synthetic Biology",
              "description": "Designing artificial bacteria to consume plastics, scrub hydrocarbons, or excrete fuels."
            },
            {
              "name": "Applied Spectroscopy",
              "description": "Analyzing distant planetary atmospheres and compound solutions using optical light bands."
            }
          ],
          "full_text": "### **SCIENCE**\n\n* **Ability:** Intellect  \n* **Description:** Science is the skill of understanding and applying the scientific method. It reflects a character's ability to understand the natural world and use that knowledge to solve problems. Science is used whenever a character needs to understand the behavior of natural phenomena, whether it's to design an experiment or to solve a mystery. This can include things like designing experiments, analyzing data, and interpreting scientific theories.   \n* **Mechanics:**  \n  * **Lab Work:** CR 15 to perform experiments.  \n  * **Identify Substance:** CR 15 to CR 25\\.  \n* **Specialties:**   \n  * **Inorganic Chemistry:** Synthesizing acids, industrial catalysts, synthetic polymers, and inert shielding reagents.  \n    * **Biochemistry:** Analyzing cellular metabolism, amino acid structures, and enzymatic reaction triggers.  \n    * **Genetics & Cloning:** Splicing DNA, sequencing alien genomes, and managing cellular degradation in clones.  \n    * **Material Science & Metallurgy:** Testing tensile strength, molecular lattice bonding, and alloy fatigue.  \n    * **Nanotechnology:** Programming molecular assemblers, managing gray-goo dampeners, and repairing nano-swarms.  \n    * **Laboratory Procedure:** Operating centrifuges, mass spectrometers, clean-room environments, and electron microscopes.  \n    * **Atmospheric Chemistry:** Analyzing toxic air balances, terraforming gas mixtures, and greenhouse gas saturation.  \n    * **Radiological Science:** Measuring rems, half-lives, radioactive isotope decay, and managing fission shielding.  \n    * **Synthetic Biology:** Designing artificial bacteria to consume plastics, scrub hydrocarbons, or excrete fuels.  \n    * **Applied Spectroscopy:** Analyzing distant planetary atmospheres and compound solutions using optical light bands.\n\n  ###"
        },
        {
          "name": "Survival",
          "id": "mental-survival",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Survival is the skill of surviving in extreme environments. It reflects a character's ability to find food, water, and shelter in the wilderness, and to avoid danger. Survival is used whenever a character needs to survive in the wilderness, whether it's to explore a new area or to escape from danger. This can include things like finding food and water, building shelter, and avoiding predators.",
          "keywords": "survival, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Foraging",
            "Water Procurement",
            "Extreme Cold (Arctic)",
            "Arid Wasteland (Desert)",
            "Jungle & Marshland",
            "Emergency Shelter Construction",
            "Zero-G & Vacuum Survival",
            "Subterranean Survival",
            "Fire-Building",
            "Wilderness Traps & Snares"
          ],
          "governing_attribute": "Wisdom",
          "mechanic": "Governing Ability: Wisdom\n\nMechanics:\n• **Track:** CR varies by surface (Soft ground CR 10, Hard floor CR 20+).\n• **Survival:** CR 15 to provide food/water for self; +2 CR per additional person.\n• **Endure Elements:** Grants bonuses to Fortitude saves against weather.\n\nSpecialties:\n• Foraging: Sourcing edible roots, insects, fruits, and clean sustenance in untamed wilderness.\n• Water Procurement: Locating hidden springs, building solar condensation stills, and testing water toxicity.\n• Extreme Cold (Arctic): Building snow shelters, preventing frostbite, and enduring sub-zero blizzards.\n• Arid Wasteland (Desert): Conserving bodily moisture, traveling by night, and finding shaded oases.\n• Jungle & Marshland: Evading quicksand, combating rot, avoiding parasitic leeches, and crossing bogs.\n• Emergency Shelter Construction: Rigging lean-tos, debris huts, windbreaks, and insulated thermal bivouacs.\n• Zero-G & Vacuum Survival: Patching suit punctures, surviving depressurization, and conserving suit oxygen.\n• Subterranean Survival: Navigating lightless deep caves, avoiding bad air pockets, and scaling internal chasms.\n• Fire-Building: Starting cooking and survival fires using flint, friction, or battery sparks in rain and wind.\n• Wilderness Traps & Snares: Constructing deadfalls, snare wires, and pit traps to capture wild game for food.",
          "specialty_details": [
            {
              "name": "Foraging",
              "description": "Sourcing edible roots, insects, fruits, and clean sustenance in untamed wilderness."
            },
            {
              "name": "Water Procurement",
              "description": "Locating hidden springs, building solar condensation stills, and testing water toxicity."
            },
            {
              "name": "Extreme Cold (Arctic)",
              "description": "Building snow shelters, preventing frostbite, and enduring sub-zero blizzards."
            },
            {
              "name": "Arid Wasteland (Desert)",
              "description": "Conserving bodily moisture, traveling by night, and finding shaded oases."
            },
            {
              "name": "Jungle & Marshland",
              "description": "Evading quicksand, combating rot, avoiding parasitic leeches, and crossing bogs."
            },
            {
              "name": "Emergency Shelter Construction",
              "description": "Rigging lean-tos, debris huts, windbreaks, and insulated thermal bivouacs."
            },
            {
              "name": "Zero-G & Vacuum Survival",
              "description": "Patching suit punctures, surviving depressurization, and conserving suit oxygen."
            },
            {
              "name": "Subterranean Survival",
              "description": "Navigating lightless deep caves, avoiding bad air pockets, and scaling internal chasms."
            },
            {
              "name": "Fire-Building",
              "description": "Starting cooking and survival fires using flint, friction, or battery sparks in rain and wind."
            },
            {
              "name": "Wilderness Traps & Snares",
              "description": "Constructing deadfalls, snare wires, and pit traps to capture wild game for food."
            }
          ],
          "full_text": "### **SURVIVAL**\n\n* **Ability:** Wisdom  \n* **Description:** Survival is the skill of surviving in extreme environments. It reflects a character's ability to find food, water, and shelter in the wilderness, and to avoid danger. Survival is used whenever a character needs to survive in the wilderness, whether it's to explore a new area or to escape from danger. This can include things like finding food and water, building shelter, and avoiding predators.   \n* **Mechanics:**  \n  * **Track:** CR varies by surface (Soft ground CR 10, Hard floor CR 20+).  \n  * **Survival:** CR 15 to provide food/water for self; \\+2 CR per additional person.  \n  * **Endure Elements:** Grants bonuses to Fortitude saves against weather.  \n* **Specialties:**   \n  * **Foraging:** Sourcing edible roots, insects, fruits, and clean sustenance in untamed wilderness.  \n    * **Water Procurement:** Locating hidden springs, building solar condensation stills, and testing water toxicity.  \n    * **Extreme Cold (Arctic):** Building snow shelters, preventing frostbite, and enduring sub-zero blizzards.  \n    * **Arid Wasteland (Desert):** Conserving bodily moisture, traveling by night, and finding shaded oases.  \n    * **Jungle & Marshland:** Evading quicksand, combating rot, avoiding parasitic leeches, and crossing bogs.  \n    * **Emergency Shelter Construction:** Rigging lean-tos, debris huts, windbreaks, and insulated thermal bivouacs.  \n    * **Zero-G & Vacuum Survival:** Patching suit punctures, surviving depressurization, and conserving suit oxygen.  \n    * **Subterranean Survival:** Navigating lightless deep caves, avoiding bad air pockets, and scaling internal chasms.  \n    * **Fire-Building:** Starting cooking and survival fires using flint, friction, or battery sparks in rain and wind.  \n    * **Wilderness Traps & Snares:** Constructing deadfalls, snare wires, and pit traps to capture wild game for food.\n\n  ###"
        },
        {
          "name": "Tactics",
          "id": "mental-tactics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Knowledge of strategy, warfare, and small unit operations. It allows a character to predict enemy movements and plan effective ambushes.",
          "keywords": "tactics, mental, intellect, cognitive, expertise, squad",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Close-Quarters Battle (CQB)",
            "Squad Fireteam Maneuvers",
            "Guerrilla & Asymmetric Warfare",
            "Ship-to-Ship Fleet Tactics",
            "Siegecraft & Fortifications",
            "Boarding Actions",
            "Ambush Planning",
            "Sniper/Spotter Protocols",
            "Electronic Warfare Coordination",
            "Counter-Battery Warfare"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Predict Strategy:** Opposed check vs. Enemy Tactics/Bluff.\n• **Combat Bonus:** A successful check (CR 15+) prior to combat might grant the team a +1 Initiative or Attack bonus for the first round (GM discretion).\n\nSpecialties:\n• Close-Quarters Battle (CQB): Clearing rooms, stacking doors, leapfrogging down corridors, and fatal funnel control.\n• Squad Fireteam Maneuvers: Coordinating bounding overwatch, flanking suppression, and tactical withdrawals.\n• Guerrilla & Asymmetric Warfare: Setting up hit-and-run ambushes, sabotage supply raids, and partisan insurgencies.\n• Ship-to-Ship Fleet Tactics: Coordinating broadsides, torpedo spreads, screen escorts, and crossfire brackets.\n• Siegecraft & Fortifications: Establishing defensive kill zones, interlocking fire fields, and breaching fortified walls.\n• Boarding Actions: Breaching airlocks, fighting in tight starship corridors, and securing bridge/engineering hubs.\n• Ambush Planning: Selecting choke points, camouflage perimeters, and timed kill boxes along transit routes.\n• Sniper/Spotter Protocols: Calculating windage, ballistic drop, concealment blinds, and designated marksman security.\n• Electronic Warfare Coordination: Synchronizing jamming bursts with kinetic assaults to deafen enemy comms.\n• Counter-Battery Warfare: Calculating enemy indirect fire origins from impact craters to direct counter-strikes.",
          "specialty_details": [
            {
              "name": "Close-Quarters Battle (CQB)",
              "description": "Clearing rooms, stacking doors, leapfrogging down corridors, and fatal funnel control."
            },
            {
              "name": "Squad Fireteam Maneuvers",
              "description": "Coordinating bounding overwatch, flanking suppression, and tactical withdrawals."
            },
            {
              "name": "Guerrilla & Asymmetric Warfare",
              "description": "Setting up hit-and-run ambushes, sabotage supply raids, and partisan insurgencies."
            },
            {
              "name": "Ship-to-Ship Fleet Tactics",
              "description": "Coordinating broadsides, torpedo spreads, screen escorts, and crossfire brackets."
            },
            {
              "name": "Siegecraft & Fortifications",
              "description": "Establishing defensive kill zones, interlocking fire fields, and breaching fortified walls."
            },
            {
              "name": "Boarding Actions",
              "description": "Breaching airlocks, fighting in tight starship corridors, and securing bridge/engineering hubs."
            },
            {
              "name": "Ambush Planning",
              "description": "Selecting choke points, camouflage perimeters, and timed kill boxes along transit routes."
            },
            {
              "name": "Sniper/Spotter Protocols",
              "description": "Calculating windage, ballistic drop, concealment blinds, and designated marksman security."
            },
            {
              "name": "Electronic Warfare Coordination",
              "description": "Synchronizing jamming bursts with kinetic assaults to deafen enemy comms."
            },
            {
              "name": "Counter-Battery Warfare",
              "description": "Calculating enemy indirect fire origins from impact craters to direct counter-strikes."
            }
          ],
          "full_text": "### **TACTICS**\n\n* **Ability:** Intellect  \n* **Description:** Knowledge of strategy, warfare, and small unit operations. It allows a character to predict enemy movements and plan effective ambushes.  \n* **Mechanics:**  \n  * **Predict Strategy:** Opposed check vs. Enemy Tactics/Bluff.  \n  * **Combat Bonus:** A successful check (CR 15+) prior to combat might grant the team a \\+1 Initiative or Attack bonus for the first round (GM discretion).  \n* **Specialties:**   \n  * **Close-Quarters Battle (CQB):** Clearing rooms, stacking doors, leapfrogging down corridors, and fatal funnel control.  \n    * **Squad Fireteam Maneuvers:** Coordinating bounding overwatch, flanking suppression, and tactical withdrawals.  \n    * **Guerrilla & Asymmetric Warfare:** Setting up hit-and-run ambushes, sabotage supply raids, and partisan insurgencies.  \n    * **Ship-to-Ship Fleet Tactics:** Coordinating broadsides, torpedo spreads, screen escorts, and crossfire brackets.  \n    * **Siegecraft & Fortifications:** Establishing defensive kill zones, interlocking fire fields, and breaching fortified walls.  \n    * **Boarding Actions:** Breaching airlocks, fighting in tight starship corridors, and securing bridge/engineering hubs.  \n    * **Ambush Planning:** Selecting choke points, camouflage perimeters, and timed kill boxes along transit routes.  \n    * **Sniper/Spotter Protocols:** Calculating windage, ballistic drop, concealment blinds, and designated marksman security.  \n    * **Electronic Warfare Coordination:** Synchronizing jamming bursts with kinetic assaults to deafen enemy comms.  \n    * **Counter-Battery Warfare:** Calculating enemy indirect fire origins from impact craters to direct counter-strikes.\n\n  ###"
        },
        {
          "name": "Technology",
          "id": "mental-technology",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Technology is the skill of understanding and using advanced technology. It reflects a character's ability to understand the underlying principles of technology and general concept of its usage.",
          "keywords": "technology, mental, intellect, cognitive, expertise, hardware",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Archaic Technology",
            "Advanced Directed Energy Systems",
            "Xenotechnology Diagnostics",
            "Robotics & Automata",
            "Weapons Technology",
            "Starship Subsystems",
            "Sensor & Scanner Systems",
            "Power Generators & Fuel Cells",
            "Security Hardware",
            "Emergency Field-Stripping"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• **Repair:** CR 15 (Simple fix) to CR 30 (Rebuild from scrap).\n• **Disable Device:** CR depends on device complexity/security rating.\n• **Identify Tech:** CR 10 + Tech Level difference.\n\nSpecialties:\n• Archaic Technology: Restoring and fabricating muscle-powered, spring, and clockwork mechanical systems.\n• Advanced Directed Energy Systems: Calibrating laser lenses, tuning particle coils, and replacing cooling magnets.\n• Xenotechnology Diagnostics: Assessing and coaxing function out of inscrutable, non-human technical artifacts.\n• Robotics & Automata: Wiring logic boards, replacing servo actuators, and troubleshooting utility droids.\n• Weapons Technology: Repairing weapon feed systems, accurizing barrels, and modifying firing pins.\n• Starship Subsystems: Diagnosing life support scrubbers, grav-plating, and airlock pressure valves.\n• Sensor & Scanner Systems: Calibrating ladar arrays, tuning thermal scanners, and repairing multi-spectrum probes.\n• Power Generators & Fuel Cells: Servicing hydrogen fuel cells, compact fusion reactors, and battery banks.\n• Security Hardware: Disabling magnetic mag-locks, biometric readers, and laser tripwire systems mechanically.\n• Emergency Field-Stripping: Disassembling, cleaning, and unjamming complex machinery while pinned under fire.",
          "specialty_details": [
            {
              "name": "Archaic Technology",
              "description": "Restoring and fabricating muscle-powered, spring, and clockwork mechanical systems."
            },
            {
              "name": "Advanced Directed Energy Systems",
              "description": "Calibrating laser lenses, tuning particle coils, and replacing cooling magnets."
            },
            {
              "name": "Xenotechnology Diagnostics",
              "description": "Assessing and coaxing function out of inscrutable, non-human technical artifacts."
            },
            {
              "name": "Robotics & Automata",
              "description": "Wiring logic boards, replacing servo actuators, and troubleshooting utility droids."
            },
            {
              "name": "Weapons Technology",
              "description": "Repairing weapon feed systems, accurizing barrels, and modifying firing pins."
            },
            {
              "name": "Starship Subsystems",
              "description": "Diagnosing life support scrubbers, grav-plating, and airlock pressure valves."
            },
            {
              "name": "Sensor & Scanner Systems",
              "description": "Calibrating ladar arrays, tuning thermal scanners, and repairing multi-spectrum probes."
            },
            {
              "name": "Power Generators & Fuel Cells",
              "description": "Servicing hydrogen fuel cells, compact fusion reactors, and battery banks."
            },
            {
              "name": "Security Hardware",
              "description": "Disabling magnetic mag-locks, biometric readers, and laser tripwire systems mechanically."
            },
            {
              "name": "Emergency Field-Stripping",
              "description": "Disassembling, cleaning, and unjamming complex machinery while pinned under fire."
            }
          ],
          "full_text": "### **TECHNOLOGY**\n\n* **Ability:** Intellect  \n* **Description:** Technology is the skill of understanding and using advanced technology. It reflects a character's ability to understand the underlying principles of technology and general concept of its usage.   \n* **Mechanics:**  \n  * **Repair:** CR 15 (Simple fix) to CR 30 (Rebuild from scrap).  \n  * **Disable Device:** CR depends on device complexity/security rating.  \n  * **Identify Tech:** CR 10 \\+ Tech Level difference.  \n* **Specialties:**   \n  * **Archaic Technology:** Restoring and fabricating muscle-powered, spring, and clockwork mechanical systems.  \n    * **Advanced Directed Energy Systems:** Calibrating laser lenses, tuning particle coils, and replacing cooling magnets.  \n    * **Xenotechnology Diagnostics:** Assessing and coaxing function out of inscrutable, non-human technical artifacts.  \n    * **Robotics & Automata:** Wiring logic boards, replacing servo actuators, and troubleshooting utility droids.  \n    * **Weapons Technology:** Repairing weapon feed systems, accurizing barrels, and modifying firing pins.  \n    * **Starship Subsystems:** Diagnosing life support scrubbers, grav-plating, and airlock pressure valves.  \n    * **Sensor & Scanner Systems:** Calibrating ladar arrays, tuning thermal scanners, and repairing multi-spectrum probes.  \n    * **Power Generators & Fuel Cells:** Servicing hydrogen fuel cells, compact fusion reactors, and battery banks.  \n    * **Security Hardware:** Disabling magnetic mag-locks, biometric readers, and laser tripwire systems mechanically.  \n    * **Emergency Field-Stripping:** Disassembling, cleaning, and unjamming complex machinery while pinned under fire."
        },
        {
          "name": "Trade",
          "id": "mental-trade",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "The skill of understanding and navigating the complexities of commercial exchange. It reflects a character\"s ability to identify market needs, navigate trade routes, understand commercial laws, and manage mercantile relationships. Trade is used whenever a character needs to buy, sell, or transport goods. This can include things like negotiating contracts, assessing commodity values, and understanding trade regulations.",
          "keywords": "trade, mental, intellect, cognitive, expertise, merchant",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Commodity Arbitrage",
            "Tariff & Customs Evasion",
            "Black Market Smuggling Networks",
            "Bulk Wholesale Brokering",
            "Planetary Export Licensing",
            "Supply Shortage Exploitation",
            "Currency & Credit Speculation",
            "Merchant Marine Regulations",
            "Consignment Sales",
            "Counter-Embargo Smuggling"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Analyze Market:* CR 15 to identify trade opportunities, demand, or supply shortages.\n• *Trade Law:* CR 20 to understand tariffs, trade agreements, or restricted goods in a sector.\n\nSpecialties:\n• Commodity Arbitrage: Buying low in resource-rich frontier sectors and selling high in industrialized core worlds.\n• Tariff & Customs Evasion: Structuring cargo routing to legally minimize planetary import taxes and duties.\n• Black Market Smuggling Networks: Identifying covert delivery corridors, illicit fences, and bribe payoffs.\n• Bulk Wholesale Brokering: Negotiating multi-kiloton contracts for raw durasteel, food grains, and reactor fuel.\n• Planetary Export Licensing: Securing legal monopolies, trade charters, and merchant fleet landing passes.\n• Supply Shortage Exploitation: Reading war and famine indicators to position medical and ammo cargo ahead of demand.\n• Currency & Credit Speculation: Trading local planetary scrip against standard credits to capture exchange spreads.\n• Merchant Marine Regulations: Navigating international interstellar laws regarding distress signals and salvaging rights.\n• Consignment Sales: Negotiating display, sale percentages, and escrow protection for third-party luxury cargo.\n• Counter-Embargo Smuggling: Slipping essential food, fuels, and machine components past military naval blockades.",
          "specialty_details": [
            {
              "name": "Commodity Arbitrage",
              "description": "Buying low in resource-rich frontier sectors and selling high in industrialized core worlds."
            },
            {
              "name": "Tariff & Customs Evasion",
              "description": "Structuring cargo routing to legally minimize planetary import taxes and duties."
            },
            {
              "name": "Black Market Smuggling Networks",
              "description": "Identifying covert delivery corridors, illicit fences, and bribe payoffs."
            },
            {
              "name": "Bulk Wholesale Brokering",
              "description": "Negotiating multi-kiloton contracts for raw durasteel, food grains, and reactor fuel."
            },
            {
              "name": "Planetary Export Licensing",
              "description": "Securing legal monopolies, trade charters, and merchant fleet landing passes."
            },
            {
              "name": "Supply Shortage Exploitation",
              "description": "Reading war and famine indicators to position medical and ammo cargo ahead of demand."
            },
            {
              "name": "Currency & Credit Speculation",
              "description": "Trading local planetary scrip against standard credits to capture exchange spreads."
            },
            {
              "name": "Merchant Marine Regulations",
              "description": "Navigating international interstellar laws regarding distress signals and salvaging rights."
            },
            {
              "name": "Consignment Sales",
              "description": "Negotiating display, sale percentages, and escrow protection for third-party luxury cargo."
            },
            {
              "name": "Counter-Embargo Smuggling",
              "description": "Slipping essential food, fuels, and machine components past military naval blockades."
            }
          ],
          "full_text": "### **TRADE**\n\n* **Ability:** Intellect  \n* **Description:** The skill of understanding and navigating the complexities of commercial exchange. It reflects a character\"s ability to identify market needs, navigate trade routes, understand commercial laws, and manage mercantile relationships. Trade is used whenever a character needs to buy, sell, or transport goods. This can include things like negotiating contracts, assessing commodity values, and understanding trade regulations.  \n* **Mechanics:**  \n  * *Analyze Market:* CR 15 to identify trade opportunities, demand, or supply shortages.  \n  * *Trade Law:* CR 20 to understand tariffs, trade agreements, or restricted goods in a sector.  \n* **Specialties:**   \n  * **Commodity Arbitrage:** Buying low in resource-rich frontier sectors and selling high in industrialized core worlds.  \n    * **Tariff & Customs Evasion:** Structuring cargo routing to legally minimize planetary import taxes and duties.  \n    * **Black Market Smuggling Networks:** Identifying covert delivery corridors, illicit fences, and bribe payoffs.  \n    * **Bulk Wholesale Brokering:** Negotiating multi-kiloton contracts for raw durasteel, food grains, and reactor fuel.  \n    * **Planetary Export Licensing:** Securing legal monopolies, trade charters, and merchant fleet landing passes.  \n    * **Supply Shortage Exploitation:** Reading war and famine indicators to position medical and ammo cargo ahead of demand.  \n    * **Currency & Credit Speculation:** Trading local planetary scrip against standard credits to capture exchange spreads.  \n    * **Merchant Marine Regulations:** Navigating international interstellar laws regarding distress signals and salvaging rights.  \n    * **Consignment Sales:** Negotiating display, sale percentages, and escrow protection for third-party luxury cargo.  \n    * **Counter-Embargo Smuggling:** Slipping essential food, fuels, and machine components past military naval blockades.\n\n## \n\n##\n\n---"
        }
      ]
    },
    {
      "title": "Vocations",
      "skills": [
        {
          "name": "Administrator",
          "id": "mental-administrator",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Administrator is the skill of managing and organizing people and resources. It reflects a character's ability to lead and coordinate groups of people, and to manage budgets and schedules. Administrator is used whenever a character needs to manage a team, whether it's to complete a project or to run a business. This can include things like delegating tasks, setting goals, and managing finances.",
          "keywords": "administrator, mental, intellect, cognitive, expertise, bureaucratic",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Civil Bureaucracy",
            "Colony Management",
            "Corporate Personnel Management",
            "Budgetary Auditing",
            "Military Staff Coordination",
            "Public Regulatory Compliance",
            "Crisis Management Protocols",
            "Records Governance",
            "Contract Administration",
            "Inter-Department Mediation"
          ],
          "governing_attribute": "Intellect or Charisma",
          "mechanic": "Governing Ability: Intellect or Charisma\n\nMechanics:\n• *Bureaucracy:* CR 15 to locate specific files or get a permit approved quickly.\n• *Logistics:* CR 20 to organize a complex supply chain or fleet movement.\n\nSpecialties:\n• Civil Bureaucracy: Fast-tracking applications, navigating red tape, and processing government licenses.\n• Colony Management: Allocating water, housing, power, and labor to maintain frontier outpost stability.\n• Corporate Personnel Management: Organizing department heads, setting labor quotas, and resolving union strikes.\n• Budgetary Auditing: Slashing redundant expenditures and balancing municipal or corporate operational budgets.\n• Military Staff Coordination: Managing quartermaster ledgers, assignment orders, and barracks protocols.\n• Public Regulatory Compliance: Passing environmental inspections, building codes, and workplace safety checks.\n• Crisis Management Protocols: Mobilizing emergency services, setting curfews, and organizing disaster zoning.\n• Records Governance: Systematically filing, sealing, and purging organizational archives and personnel records.\n• Contract Administration: Ensuring contractors, suppliers, and third-party vendors meet project milestones.\n• Inter-Department Mediation: Resolving political gridlock and resource tug-of-wars between rival ministry heads.",
          "specialty_details": [
            {
              "name": "Civil Bureaucracy",
              "description": "Fast-tracking applications, navigating red tape, and processing government licenses."
            },
            {
              "name": "Colony Management",
              "description": "Allocating water, housing, power, and labor to maintain frontier outpost stability."
            },
            {
              "name": "Corporate Personnel Management",
              "description": "Organizing department heads, setting labor quotas, and resolving union strikes."
            },
            {
              "name": "Budgetary Auditing",
              "description": "Slashing redundant expenditures and balancing municipal or corporate operational budgets."
            },
            {
              "name": "Military Staff Coordination",
              "description": "Managing quartermaster ledgers, assignment orders, and barracks protocols."
            },
            {
              "name": "Public Regulatory Compliance",
              "description": "Passing environmental inspections, building codes, and workplace safety checks."
            },
            {
              "name": "Crisis Management Protocols",
              "description": "Mobilizing emergency services, setting curfews, and organizing disaster zoning."
            },
            {
              "name": "Records Governance",
              "description": "Systematically filing, sealing, and purging organizational archives and personnel records."
            },
            {
              "name": "Contract Administration",
              "description": "Ensuring contractors, suppliers, and third-party vendors meet project milestones."
            },
            {
              "name": "Inter-Department Mediation",
              "description": "Resolving political gridlock and resource tug-of-wars between rival ministry heads."
            }
          ],
          "full_text": "### **ADMINISTRATOR**\n\n* **Ability:** Intellect or Charisma  \n* **Description:** Administrator is the skill of managing and organizing people and resources. It reflects a character's ability to lead and coordinate groups of people, and to manage budgets and schedules. Administrator is used whenever a character needs to manage a team, whether it's to complete a project or to run a business. This can include things like delegating tasks, setting goals, and managing finances.   \n* **Mechanics:**  \n  * *Bureaucracy:* CR 15 to locate specific files or get a permit approved quickly.  \n  * *Logistics:* CR 20 to organize a complex supply chain or fleet movement.  \n* **Specialties:**   \n  * **Civil Bureaucracy:** Fast-tracking applications, navigating red tape, and processing government licenses.  \n    * **Colony Management:** Allocating water, housing, power, and labor to maintain frontier outpost stability.  \n    * **Corporate Personnel Management:** Organizing department heads, setting labor quotas, and resolving union strikes.  \n    * **Budgetary Auditing:** Slashing redundant expenditures and balancing municipal or corporate operational budgets.  \n    * **Military Staff Coordination:** Managing quartermaster ledgers, assignment orders, and barracks protocols.  \n    * **Public Regulatory Compliance:** Passing environmental inspections, building codes, and workplace safety checks.  \n    * **Crisis Management Protocols:** Mobilizing emergency services, setting curfews, and organizing disaster zoning.  \n    * **Records Governance:** Systematically filing, sealing, and purging organizational archives and personnel records.  \n    * **Contract Administration:** Ensuring contractors, suppliers, and third-party vendors meet project milestones.  \n    * **Inter-Department Mediation:** Resolving political gridlock and resource tug-of-wars between rival ministry heads.\n\n  ###"
        },
        {
          "name": "Alchemist",
          "id": "mental-alchemist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Alchemist is the skill of understanding and creating potions and other magical substances. It reflects a character's ability to mix and manipulate chemicals and magical ingredients. Alchemist is used whenever a character needs to create a potion or other magical substance, whether it's to heal an injury or to create a powerful spell. This can include things like mixing ingredients, analyzing substances, and creating magical effects.",
          "keywords": "alchemist, mental, intellect, cognitive, expertise, creating",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Combat Stimulants",
            "Panaceas & Antitoxins",
            "Corrosive Acids & Caustics",
            "Incendiary Gels",
            "Metaphysical Potions",
            "Paralytics & Sleeping Agents",
            "Biological Preservatives",
            "Smoke & Gas Compounds",
            "Reagent Purification",
            "Volatile Reactions Handling"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Identify Substance:* CR 15 to identify a chemical or potion.\n• *Craft Compound:* CR varies (Acid CR 15, Panacea CR 25). Failure by 5 or more may cause an explosion or exposure.\n\nSpecialties:\n• Combat Stimulants: Synthesizing adrenal boosters, coagulants, and reflex-accelerating injections.\n• Panaceas & Antitoxins: Compounding broad-spectrum antivenoms and toxin-neutralizing serums.\n• Corrosive Acids & Caustics: Formulating industrial acids capable of melting hull plating and security deadbolts.\n• Incendiary Gels: Brewing sticky, pyrophoric chemical pastes that ignite on contact with air.\n• Metaphysical Potions: Distilling liquid mana, psionic stability elixirs, and reality-anchoring tonics.\n• Paralytics & Sleeping Agents: Extracting and refining fast-acting knockout vapors and tranquilizing neurotoxins.\n• Biological Preservatives: Mixing preservation fluids to prevent organ decay and specimen degradation.\n• Smoke & Gas Compounds: Creating thick visual-obscuring smoke, tear gas, and suffocating choking dust.\n• Reagent Purification: Refining raw minerals, alien glands, and planetary botanicals into pure alchemical bases.\n• Volatile Reactions Handling: Stabilizing explosive compounds during laboratory synthesis to prevent accidental detonations.",
          "specialty_details": [
            {
              "name": "Combat Stimulants",
              "description": "Synthesizing adrenal boosters, coagulants, and reflex-accelerating injections."
            },
            {
              "name": "Panaceas & Antitoxins",
              "description": "Compounding broad-spectrum antivenoms and toxin-neutralizing serums."
            },
            {
              "name": "Corrosive Acids & Caustics",
              "description": "Formulating industrial acids capable of melting hull plating and security deadbolts."
            },
            {
              "name": "Incendiary Gels",
              "description": "Brewing sticky, pyrophoric chemical pastes that ignite on contact with air."
            },
            {
              "name": "Metaphysical Potions",
              "description": "Distilling liquid mana, psionic stability elixirs, and reality-anchoring tonics."
            },
            {
              "name": "Paralytics & Sleeping Agents",
              "description": "Extracting and refining fast-acting knockout vapors and tranquilizing neurotoxins."
            },
            {
              "name": "Biological Preservatives",
              "description": "Mixing preservation fluids to prevent organ decay and specimen degradation."
            },
            {
              "name": "Smoke & Gas Compounds",
              "description": "Creating thick visual-obscuring smoke, tear gas, and suffocating choking dust."
            },
            {
              "name": "Reagent Purification",
              "description": "Refining raw minerals, alien glands, and planetary botanicals into pure alchemical bases."
            },
            {
              "name": "Volatile Reactions Handling",
              "description": "Stabilizing explosive compounds during laboratory synthesis to prevent accidental detonations."
            }
          ],
          "full_text": "### **ALCHEMIST**\n\n* **Ability:** Intellect  \n* **Description:** Alchemist is the skill of understanding and creating potions and other magical substances. It reflects a character's ability to mix and manipulate chemicals and magical ingredients. Alchemist is used whenever a character needs to create a potion or other magical substance, whether it's to heal an injury or to create a powerful spell. This can include things like mixing ingredients, analyzing substances, and creating magical effects.   \n* **Mechanics:**  \n  * *Identify Substance:* CR 15 to identify a chemical or potion.  \n  * *Craft Compound:* CR varies (Acid CR 15, Panacea CR 25). Failure by 5 or more may cause an explosion or exposure.  \n* **Specialties:**   \n  * **Combat Stimulants:** Synthesizing adrenal boosters, coagulants, and reflex-accelerating injections.  \n    * **Panaceas & Antitoxins:** Compounding broad-spectrum antivenoms and toxin-neutralizing serums.  \n    * **Corrosive Acids & Caustics:** Formulating industrial acids capable of melting hull plating and security deadbolts.  \n    * **Incendiary Gels:** Brewing sticky, pyrophoric chemical pastes that ignite on contact with air.  \n    * **Metaphysical Potions:** Distilling liquid mana, psionic stability elixirs, and reality-anchoring tonics.  \n    * **Paralytics & Sleeping Agents:** Extracting and refining fast-acting knockout vapors and tranquilizing neurotoxins.  \n    * **Biological Preservatives:** Mixing preservation fluids to prevent organ decay and specimen degradation.  \n    * **Smoke & Gas Compounds:** Creating thick visual-obscuring smoke, tear gas, and suffocating choking dust.  \n    * **Reagent Purification:** Refining raw minerals, alien glands, and planetary botanicals into pure alchemical bases.  \n    * **Volatile Reactions Handling:** Stabilizing explosive compounds during laboratory synthesis to prevent accidental detonations.\n\n  ###"
        },
        {
          "name": "Ambassador",
          "id": "mental-ambassador",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Ambassador is the skill of negotiating and representing one's country or organization. It reflects a character's ability to communicate effectively with people from different cultures and backgrounds, negotiate treaties, and represent one's country or organization in a foreign land. Ambassador is used whenever a character needs to promote their country's interests and maintain good relations with other countries. This can include things like negotiating trade agreements, resolving disputes, and building alliances.",
          "keywords": "ambassador, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "First Contact Protocols",
            "Bilateral Treaty Negotiation",
            "Extradition & Prisoner Exchanges",
            "Trade Coalition Representation",
            "Hostage & Ceasefire Mediation",
            "Diplomatic Immunity Defense",
            "Cultural Liaison",
            "Imperial Court Protocol",
            "Sanction & Embargo Negotiation",
            "Alliance Building"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Protocol:* CR 15 to know the correct etiquette for a specific alien court.\n• *Negotiate Treaty:* Opposed check vs. rival Ambassador.\n\nSpecialties:\n• First Contact Protocols: Establishing non-hostile communications with uncontacted or newly awakened species.\n• Bilateral Treaty Negotiation: Drafting peace accords, borders, and non-aggression treaties between factions.\n• Extradition & Prisoner Exchanges: Negotiating the repatriation of captured spies, soldiers, and political dissidents.\n• Trade Coalition Representation: Advocating for planetary interests in interstellar trade summits and unions.\n• Hostage & Ceasefire Mediation: Brokering emergency stand-downs between warring armies under active crossfire.\n• Diplomatic Immunity Defense: Invoking extraterritoriality and sovereign status to escape local legal harassment.\n• Cultural Liaison: Educating state delegations on delicate social norms to prevent accidental declarations of war.\n• Imperial Court Protocol: Presenting credentials and conducting official state audiences before emperors and kings.\n• Sanction & Embargo Negotiation: Convincing neutral factions to cut off trade, fuel, and arms to enemy systems.\n• Alliance Building: Assembling multi-system coalitions through shared security and mutual defense pledges.",
          "specialty_details": [
            {
              "name": "First Contact Protocols",
              "description": "Establishing non-hostile communications with uncontacted or newly awakened species."
            },
            {
              "name": "Bilateral Treaty Negotiation",
              "description": "Drafting peace accords, borders, and non-aggression treaties between factions."
            },
            {
              "name": "Extradition & Prisoner Exchanges",
              "description": "Negotiating the repatriation of captured spies, soldiers, and political dissidents."
            },
            {
              "name": "Trade Coalition Representation",
              "description": "Advocating for planetary interests in interstellar trade summits and unions."
            },
            {
              "name": "Hostage & Ceasefire Mediation",
              "description": "Brokering emergency stand-downs between warring armies under active crossfire."
            },
            {
              "name": "Diplomatic Immunity Defense",
              "description": "Invoking extraterritoriality and sovereign status to escape local legal harassment."
            },
            {
              "name": "Cultural Liaison",
              "description": "Educating state delegations on delicate social norms to prevent accidental declarations of war."
            },
            {
              "name": "Imperial Court Protocol",
              "description": "Presenting credentials and conducting official state audiences before emperors and kings."
            },
            {
              "name": "Sanction & Embargo Negotiation",
              "description": "Convincing neutral factions to cut off trade, fuel, and arms to enemy systems."
            },
            {
              "name": "Alliance Building",
              "description": "Assembling multi-system coalitions through shared security and mutual defense pledges."
            }
          ],
          "full_text": "### **AMBASSADOR**\n\n* **Ability:** Charisma  \n* **Description:** Ambassador is the skill of negotiating and representing one's country or organization. It reflects a character's ability to communicate effectively with people from different cultures and backgrounds, negotiate treaties, and represent one's country or organization in a foreign land. Ambassador is used whenever a character needs to promote their country's interests and maintain good relations with other countries. This can include things like negotiating trade agreements, resolving disputes, and building alliances.   \n* **Mechanics:**  \n  * *Protocol:* CR 15 to know the correct etiquette for a specific alien court.  \n  * *Negotiate Treaty:* Opposed check vs. rival Ambassador.  \n* **Specialties:**   \n  * **First Contact Protocols:** Establishing non-hostile communications with uncontacted or newly awakened species.  \n    * **Bilateral Treaty Negotiation:** Drafting peace accords, borders, and non-aggression treaties between factions.  \n    * **Extradition & Prisoner Exchanges:** Negotiating the repatriation of captured spies, soldiers, and political dissidents.  \n    * **Trade Coalition Representation:** Advocating for planetary interests in interstellar trade summits and unions.  \n    * **Hostage & Ceasefire Mediation:** Brokering emergency stand-downs between warring armies under active crossfire.  \n    * **Diplomatic Immunity Defense:** Invoking extraterritoriality and sovereign status to escape local legal harassment.  \n    * **Cultural Liaison:** Educating state delegations on delicate social norms to prevent accidental declarations of war.  \n    * **Imperial Court Protocol:** Presenting credentials and conducting official state audiences before emperors and kings.  \n    * **Sanction & Embargo Negotiation:** Convincing neutral factions to cut off trade, fuel, and arms to enemy systems.  \n    * **Alliance Building:** Assembling multi-system coalitions through shared security and mutual defense pledges.\n\n  ###"
        },
        {
          "name": "Architect",
          "id": "mental-architect",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Architect is the skill of designing and building structures. It reflects a character's ability to create and design buildings and other structures, design blueprints, create models, and oversee construction. Architect is used whenever a character needs to create a structure, whether it's a house, a castle, or a city. This can include things like designing layouts, creating blueprints, and managing construction crews.",
          "keywords": "architect, mental, intellect, cognitive, expertise, designing",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Arcology Design",
            "Starship Naval Architecture",
            "Bunkers & Fortifications",
            "Orbital Station Design",
            "Hostile-Environment Habitats",
            "Acoustic & Sightline Layouts",
            "Structural Weakness Assessment",
            "Modular Prefab Structures",
            "Urban Transit Design",
            "Historic Restoration Architecture"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Design:* Create blueprints for a structure (CR 15 for a house, CR 30 for a space elevator).\n• *Assess Weakness:* CR 20 to find a structural weak point in a building (grants bonus to Demolitionist).\n\nSpecialties:\n• Arcology Design: Engineering self-contained mega-structures housing millions with integrated air and waste loops.\n• Starship Naval Architecture: Designing structural bulkheads, internal frame load paths, and compartmental layouts.\n• Bunkers & Fortifications: Calculating reinforced blast wall thickness, subterranean depths, and bunker hardening.\n• Orbital Station Design: Designing modular docking rings, centrifuge spin hubs, and microgravity stress joints.\n• Hostile-Environment Habitats: Designing dome colonies resilient to magma, crushing oceanic depths, or toxic air.\n• Acoustic & Sightline Layouts: Structuring amphitheaters, auditoriums, and security plazas for optimal line-of-sight.\n• Structural Weakness Assessment: Identifying load-bearing pillars, shear points, and design flaws in enemy installations.\n• Modular Prefab Structures: Creating rapidly deployable, flat-pack buildings for frontier forward bases.\n• Urban Transit Design: Integrating subways, skybridges, and vehicle traffic arteries into city blueprints.\n• Historic Restoration Architecture: Reconstructing ancient ruins and historic structures using original techniques.",
          "specialty_details": [
            {
              "name": "Arcology Design",
              "description": "Engineering self-contained mega-structures housing millions with integrated air and waste loops."
            },
            {
              "name": "Starship Naval Architecture",
              "description": "Designing structural bulkheads, internal frame load paths, and compartmental layouts."
            },
            {
              "name": "Bunkers & Fortifications",
              "description": "Calculating reinforced blast wall thickness, subterranean depths, and bunker hardening."
            },
            {
              "name": "Orbital Station Design",
              "description": "Designing modular docking rings, centrifuge spin hubs, and microgravity stress joints."
            },
            {
              "name": "Hostile-Environment Habitats",
              "description": "Designing dome colonies resilient to magma, crushing oceanic depths, or toxic air."
            },
            {
              "name": "Acoustic & Sightline Layouts",
              "description": "Structuring amphitheaters, auditoriums, and security plazas for optimal line-of-sight."
            },
            {
              "name": "Structural Weakness Assessment",
              "description": "Identifying load-bearing pillars, shear points, and design flaws in enemy installations."
            },
            {
              "name": "Modular Prefab Structures",
              "description": "Creating rapidly deployable, flat-pack buildings for frontier forward bases."
            },
            {
              "name": "Urban Transit Design",
              "description": "Integrating subways, skybridges, and vehicle traffic arteries into city blueprints."
            },
            {
              "name": "Historic Restoration Architecture",
              "description": "Reconstructing ancient ruins and historic structures using original techniques."
            }
          ],
          "full_text": "### **ARCHITECT**\n\n* **Ability:** Intellect  \n* **Description:** Architect is the skill of designing and building structures. It reflects a character's ability to create and design buildings and other structures, design blueprints, create models, and oversee construction. Architect is used whenever a character needs to create a structure, whether it's a house, a castle, or a city. This can include things like designing layouts, creating blueprints, and managing construction crews.   \n* **Mechanics:**  \n  * *Design:* Create blueprints for a structure (CR 15 for a house, CR 30 for a space elevator).  \n  * *Assess Weakness:* CR 20 to find a structural weak point in a building (grants bonus to Demolitionist).  \n* **Specialties:**   \n  * **Arcology Design:** Engineering self-contained mega-structures housing millions with integrated air and waste loops.  \n    * **Starship Naval Architecture:** Designing structural bulkheads, internal frame load paths, and compartmental layouts.  \n    * **Bunkers & Fortifications:** Calculating reinforced blast wall thickness, subterranean depths, and bunker hardening.  \n    * **Orbital Station Design:** Designing modular docking rings, centrifuge spin hubs, and microgravity stress joints.  \n    * **Hostile-Environment Habitats:** Designing dome colonies resilient to magma, crushing oceanic depths, or toxic air.  \n    * **Acoustic & Sightline Layouts:** Structuring amphitheaters, auditoriums, and security plazas for optimal line-of-sight.  \n    * **Structural Weakness Assessment:** Identifying load-bearing pillars, shear points, and design flaws in enemy installations.  \n    * **Modular Prefab Structures:** Creating rapidly deployable, flat-pack buildings for frontier forward bases.  \n    * **Urban Transit Design:** Integrating subways, skybridges, and vehicle traffic arteries into city blueprints.  \n    * **Historic Restoration Architecture:** Reconstructing ancient ruins and historic structures using original techniques.\n\n  ###"
        },
        {
          "name": "Archivist",
          "id": "mental-archivist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Archivist is the skill of preserving and organizing historical documents and artifacts. It reflects a character's ability to collect and preserve historical records and artifacts, catalog artifacts, preserve documents, and research historical events. Archivist is used whenever a character needs to preserve and make accessible historical records for future generations. This can include things like cataloging artifacts, preserving documents, and researching historical events.",
          "keywords": "archivist, mental, intellect, cognitive, expertise, cataloging",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Ancient Tome Preservation",
            "Data Recovery & File Reconstruction",
            "Genealogical Indexing",
            "Classified Document Redaction",
            "Library Taxonomy & Systems",
            "Holographic & Optical Media Care",
            "Museum Conservation",
            "Ancient Script Transliteration",
            "Historical Provenance Authentication",
            "Deep Index Searching"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Deep Search:* CR 20 to find a specific, non-digitized record or deleted file fragment.\n• *Preservation:* CR 15 to restore damaged books or data drives.\n\nSpecialties:\n• Ancient Tome Preservation: Restoring, sealing, and handling fragile parchment, papyrus, and crystalline plates.\n• Data Recovery & File Reconstruction: Extracting readable data from melted drives, corrupted memory, and shattered chips.\n• Genealogical Indexing: Tracing sprawling historical lineage charts and imperial ancestry rolls across centuries.\n• Classified Document Redaction: Scrubbing, sealing, and securely compartmentalizing state and corporate secrets.\n• Library Taxonomy & Systems: Designing efficient searchable classification systems for planetary-scale data hubs.\n• Holographic & Optical Media Care: Repairing and reading degraded microfilms, magnetic reels, and optical cubes.\n• Museum Conservation: Stabilizing archaeological artifacts against moisture, oxidation, and atmospheric decay.\n• Ancient Script Transliteration: Converting forgotten scripts into modern readable linguistic formats without data loss.\n• Historical Provenance Authentication: Verifying the unbroken chain of custody and authenticity of old historical records.\n• Deep Index Searching: Rapidly locating specific micro-records within massive, million-year-old civil repositories.",
          "specialty_details": [
            {
              "name": "Ancient Tome Preservation",
              "description": "Restoring, sealing, and handling fragile parchment, papyrus, and crystalline plates."
            },
            {
              "name": "Data Recovery & File Reconstruction",
              "description": "Extracting readable data from melted drives, corrupted memory, and shattered chips."
            },
            {
              "name": "Genealogical Indexing",
              "description": "Tracing sprawling historical lineage charts and imperial ancestry rolls across centuries."
            },
            {
              "name": "Classified Document Redaction",
              "description": "Scrubbing, sealing, and securely compartmentalizing state and corporate secrets."
            },
            {
              "name": "Library Taxonomy & Systems",
              "description": "Designing efficient searchable classification systems for planetary-scale data hubs."
            },
            {
              "name": "Holographic & Optical Media Care",
              "description": "Repairing and reading degraded microfilms, magnetic reels, and optical cubes."
            },
            {
              "name": "Museum Conservation",
              "description": "Stabilizing archaeological artifacts against moisture, oxidation, and atmospheric decay."
            },
            {
              "name": "Ancient Script Transliteration",
              "description": "Converting forgotten scripts into modern readable linguistic formats without data loss."
            },
            {
              "name": "Historical Provenance Authentication",
              "description": "Verifying the unbroken chain of custody and authenticity of old historical records."
            },
            {
              "name": "Deep Index Searching",
              "description": "Rapidly locating specific micro-records within massive, million-year-old civil repositories."
            }
          ],
          "full_text": "### **ARCHIVIST**\n\n* **Ability:** Intellect  \n* **Description:** Archivist is the skill of preserving and organizing historical documents and artifacts. It reflects a character's ability to collect and preserve historical records and artifacts, catalog artifacts, preserve documents, and research historical events. Archivist is used whenever a character needs to preserve and make accessible historical records for future generations. This can include things like cataloging artifacts, preserving documents, and researching historical events.   \n* **Mechanics:**  \n  * *Deep Search:* CR 20 to find a specific, non-digitized record or deleted file fragment.  \n  * *Preservation:* CR 15 to restore damaged books or data drives.  \n* **Specialties:**   \n  * **Ancient Tome Preservation:** Restoring, sealing, and handling fragile parchment, papyrus, and crystalline plates.  \n    * **Data Recovery & File Reconstruction:** Extracting readable data from melted drives, corrupted memory, and shattered chips.  \n    * **Genealogical Indexing:** Tracing sprawling historical lineage charts and imperial ancestry rolls across centuries.  \n    * **Classified Document Redaction:** Scrubbing, sealing, and securely compartmentalizing state and corporate secrets.  \n    * **Library Taxonomy & Systems:** Designing efficient searchable classification systems for planetary-scale data hubs.  \n    * **Holographic & Optical Media Care:** Repairing and reading degraded microfilms, magnetic reels, and optical cubes.  \n    * **Museum Conservation:** Stabilizing archaeological artifacts against moisture, oxidation, and atmospheric decay.  \n    * **Ancient Script Transliteration:** Converting forgotten scripts into modern readable linguistic formats without data loss.  \n    * **Historical Provenance Authentication:** Verifying the unbroken chain of custody and authenticity of old historical records.  \n    * **Deep Index Searching:** Rapidly locating specific micro-records within massive, million-year-old civil repositories.\n\n  ###"
        },
        {
          "name": "Armorer",
          "id": "mental-armorer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Armorer is the skill of creating and repairing different types of armor. It reflects a character's ability to forge metal, repair damaged armor, and create new designs. Armorer is used whenever a character needs to ensure that armor is functional and effective. This can include things like repairing damaged armor to creating a new suit.",
          "keywords": "armorer, mental, intellect, cognitive, expertise, fabricating",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Archaic Plate & Mail",
            "Ballistic Weaves & Flak Suits",
            "Composite Ceramic Plating",
            "Powered Armor Exoskeletons",
            "Energy Shield Harnesses",
            "Hazardous Environment Seals",
            "Xenotech Shell Integration",
            "Stealth Coating Application",
            "Custom Armor Tailoring",
            "Rapid Battle-Damage Patching"
          ],
          "governing_attribute": "Intellect (for design) or Agility (for fine detail)",
          "mechanic": "Governing Ability: Intellect (for design) or Agility (for fine detail)\n\nMechanics:\n• *Repair Armor:* Restore armor points (CR 15 + Tech Level).\n• *Craft Armor:* Create new armor (Time required varies).\n• *Fit Armor:* CR 15 to resize armor for a different species.\n\nSpecialties:\n• Archaic Plate & Mail: Forging, quenching, and strapping tempered steel and bronze personal armor.\n• Ballistic Weaves & Flak Suits: Stitching layered kevlar, carbon-nanotube fabrics, and impact-dispersion vests.\n• Composite Ceramic Plating: Baking and inserting high-density boron-carbide strike plates into tactical rigs.\n• Powered Armor Exoskeletons: Servicing hydraulic actuators, frame braces, and artificial myomer musculature.\n• Energy Shield Harnesses: Tuning personal deflector coils, field harmonizers, and capacitor discharge belts.\n• Hazardous Environment Seals: Fitting airtight collars, hermetic seals, and thermal linings on void suits.\n• Xenotech Shell Integration: Splicing chitinous alien hides and bio-shells into functional composite armor.\n• Stealth Coating Application: Applying radar-absorbent paint, thermal-masking fabrics, and matte anti-glare dyes.\n• Custom Armor Tailoring: Resizing captured or off-the-shelf armor to perfectly fit unique alien physiologies.\n• Rapid Battle-Damage Patching: Hammering out dents, welding cracked plate, and cold-patching suit punctures.",
          "specialty_details": [
            {
              "name": "Archaic Plate & Mail",
              "description": "Forging, quenching, and strapping tempered steel and bronze personal armor."
            },
            {
              "name": "Ballistic Weaves & Flak Suits",
              "description": "Stitching layered kevlar, carbon-nanotube fabrics, and impact-dispersion vests."
            },
            {
              "name": "Composite Ceramic Plating",
              "description": "Baking and inserting high-density boron-carbide strike plates into tactical rigs."
            },
            {
              "name": "Powered Armor Exoskeletons",
              "description": "Servicing hydraulic actuators, frame braces, and artificial myomer musculature."
            },
            {
              "name": "Energy Shield Harnesses",
              "description": "Tuning personal deflector coils, field harmonizers, and capacitor discharge belts."
            },
            {
              "name": "Hazardous Environment Seals",
              "description": "Fitting airtight collars, hermetic seals, and thermal linings on void suits."
            },
            {
              "name": "Xenotech Shell Integration",
              "description": "Splicing chitinous alien hides and bio-shells into functional composite armor."
            },
            {
              "name": "Stealth Coating Application",
              "description": "Applying radar-absorbent paint, thermal-masking fabrics, and matte anti-glare dyes."
            },
            {
              "name": "Custom Armor Tailoring",
              "description": "Resizing captured or off-the-shelf armor to perfectly fit unique alien physiologies."
            },
            {
              "name": "Rapid Battle-Damage Patching",
              "description": "Hammering out dents, welding cracked plate, and cold-patching suit punctures."
            }
          ],
          "full_text": "### **ARMORER**\n\n* **Ability:** Intellect (for design) or Agility (for fine detail)  \n* **Description:** Armorer is the skill of creating and repairing different types of armor. It reflects a character's ability to forge metal, repair damaged armor, and create new designs. Armorer is used whenever a character needs to ensure that armor is functional and effective. This can include things like repairing damaged armor to creating a new suit.   \n* **Mechanics:**  \n  * *Repair Armor:* Restore armor points (CR 15 \\+ Tech Level).  \n  * *Craft Armor:* Create new armor (Time required varies).  \n  * *Fit Armor:* CR 15 to resize armor for a different species.  \n* **Specialties:**   \n  * **Archaic Plate & Mail:** Forging, quenching, and strapping tempered steel and bronze personal armor.  \n    * **Ballistic Weaves & Flak Suits:** Stitching layered kevlar, carbon-nanotube fabrics, and impact-dispersion vests.  \n    * **Composite Ceramic Plating:** Baking and inserting high-density boron-carbide strike plates into tactical rigs.  \n    * **Powered Armor Exoskeletons:** Servicing hydraulic actuators, frame braces, and artificial myomer musculature.  \n    * **Energy Shield Harnesses:** Tuning personal deflector coils, field harmonizers, and capacitor discharge belts.  \n    * **Hazardous Environment Seals:** Fitting airtight collars, hermetic seals, and thermal linings on void suits.  \n    * **Xenotech Shell Integration:** Splicing chitinous alien hides and bio-shells into functional composite armor.  \n    * **Stealth Coating Application:** Applying radar-absorbent paint, thermal-masking fabrics, and matte anti-glare dyes.  \n    * **Custom Armor Tailoring:** Resizing captured or off-the-shelf armor to perfectly fit unique alien physiologies.  \n    * **Rapid Battle-Damage Patching:** Hammering out dents, welding cracked plate, and cold-patching suit punctures.\n\n  ###"
        },
        {
          "name": "Artist",
          "id": "mental-artist",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Artist is the skill of creating art in various forms, such as painting, sculpture, or music. It reflects a character's ability to paint, sculpt, or compose music. Artist is used whenever a character needs to create works of art that are aesthetically pleasing and meaningful. This can include things like painting portraits, sculpting statues, or composing music.",
          "keywords": "artist, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Canvas & Mural Painting",
            "Digital & Concept Illustration",
            "Hard-Light & Holographic Art",
            "Stone & Metal Sculpting",
            "Tattooing & Bio-Art",
            "Prop & Stage Design",
            "Artistic Forgery",
            "Graphic Iconography & Logos",
            "Calligraphy & Illumination",
            "Ceramics & Glasswork"
          ],
          "governing_attribute": "Charisma (Expression) or Wisdom (Insight) or Agility (Fine Motor)",
          "mechanic": "Governing Ability: Charisma (Expression) or Wisdom (Insight) or Agility (Fine Motor)\n\nMechanics:\n• *Create Work:* Check result determines the value and quality of the piece.\n• *Forgery:* Opposed by Appraisal.\n\nSpecialties:\n• Canvas & Mural Painting: Mastering pigments, oil glazes, brushwork, and monumental wall fresco execution.\n• Digital & Concept Illustration: Speed-painting character concepts, environments, and schematics via digital pads.\n• Hard-Light & Holographic Art: Sculpting interactive light displays, laser murals, and volumetric art.\n• Stone & Metal Sculpting: Chiseling marble, casting bronze, and welding scrap steel into expressive sculptural forms.\n• Tattooing & Bio-Art: Inking intricate skin tattoos, dermal scarring, and implanting aesthetic bioluminescent dyes.\n• Prop & Stage Design: Crafting visual sets, theatrical props, and physical backdrops for entertainment productions.\n• Artistic Forgery: Replicating the brushstrokes, aged cracking, and pigment blends of master artists.\n• Graphic Iconography & Logos: Designing striking corporate branding, faction banners, and military unit crests.\n• Calligraphy & Illumination: Hand-inking illuminated manuscripts, ornate royal proclamations, and gilded letters.\n• Ceramics & Glasswork: Throwing functional pottery, firing porcelain, and blowing blown-glass decorative forms.",
          "specialty_details": [
            {
              "name": "Canvas & Mural Painting",
              "description": "Mastering pigments, oil glazes, brushwork, and monumental wall fresco execution."
            },
            {
              "name": "Digital & Concept Illustration",
              "description": "Speed-painting character concepts, environments, and schematics via digital pads."
            },
            {
              "name": "Hard-Light & Holographic Art",
              "description": "Sculpting interactive light displays, laser murals, and volumetric art."
            },
            {
              "name": "Stone & Metal Sculpting",
              "description": "Chiseling marble, casting bronze, and welding scrap steel into expressive sculptural forms."
            },
            {
              "name": "Tattooing & Bio-Art",
              "description": "Inking intricate skin tattoos, dermal scarring, and implanting aesthetic bioluminescent dyes."
            },
            {
              "name": "Prop & Stage Design",
              "description": "Crafting visual sets, theatrical props, and physical backdrops for entertainment productions."
            },
            {
              "name": "Artistic Forgery",
              "description": "Replicating the brushstrokes, aged cracking, and pigment blends of master artists."
            },
            {
              "name": "Graphic Iconography & Logos",
              "description": "Designing striking corporate branding, faction banners, and military unit crests."
            },
            {
              "name": "Calligraphy & Illumination",
              "description": "Hand-inking illuminated manuscripts, ornate royal proclamations, and gilded letters."
            },
            {
              "name": "Ceramics & Glasswork",
              "description": "Throwing functional pottery, firing porcelain, and blowing blown-glass decorative forms."
            }
          ],
          "full_text": "### **ARTIST**\n\n* **Ability:** Charisma (Expression) or Wisdom (Insight) or Agility (Fine Motor)  \n* **Description:** Artist is the skill of creating art in various forms, such as painting, sculpture, or music. It reflects a character's ability to paint, sculpt, or compose music. Artist is used whenever a character needs to create works of art that are aesthetically pleasing and meaningful. This can include things like painting portraits, sculpting statues, or composing music.   \n* **Mechanics:**  \n  * *Create Work:* Check result determines the value and quality of the piece.  \n  * *Forgery:* Opposed by Appraisal.  \n* **Specialties:**   \n  * **Canvas & Mural Painting:** Mastering pigments, oil glazes, brushwork, and monumental wall fresco execution.  \n    * **Digital & Concept Illustration:** Speed-painting character concepts, environments, and schematics via digital pads.  \n    * **Hard-Light & Holographic Art:** Sculpting interactive light displays, laser murals, and volumetric art.  \n    * **Stone & Metal Sculpting:** Chiseling marble, casting bronze, and welding scrap steel into expressive sculptural forms.  \n    * **Tattooing & Bio-Art:** Inking intricate skin tattoos, dermal scarring, and implanting aesthetic bioluminescent dyes.  \n    * **Prop & Stage Design:** Crafting visual sets, theatrical props, and physical backdrops for entertainment productions.  \n    * **Artistic Forgery:** Replicating the brushstrokes, aged cracking, and pigment blends of master artists.  \n    * **Graphic Iconography & Logos:** Designing striking corporate branding, faction banners, and military unit crests.  \n    * **Calligraphy & Illumination:** Hand-inking illuminated manuscripts, ornate royal proclamations, and gilded letters.  \n    * **Ceramics & Glasswork:** Throwing functional pottery, firing porcelain, and blowing blown-glass decorative forms.\n\n  ###"
        },
        {
          "name": "Artificer",
          "id": "mental-artificer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Artificer is the skill of creating metaphysical empowered items, such as devices, potions, or enchanted weapons. It reflects a character's ability to mix special ingredients, empower weapons, and create magical effects. Artificer is used whenever a character needs to create magical or psionic items that are functional and effective. This can include things like mixing magical ingredients, enchanting weapons, and creating magical effects. The specific craft of combining technology with metaphysical (magical/psionic) energies. This is the skill used to create \"enchanted\" or \"psi-active\" items.",
          "keywords": "artificer, mental, intellect, cognitive, expertise, crafting",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Focusing Crystals",
            "Psionic Amplifiers",
            "Metaphysical Weapon Imbuement",
            "Magitech Circuitry",
            "Golem & Construct Forging",
            "Talisman & Amulet Crafting",
            "Dimensional Containers",
            "Wands & Focusing Rods",
            "Etheric Batteries",
            "Artifact Diagnostics"
          ],
          "governing_attribute": "Intellect or Wisdom",
          "mechanic": "Governing Ability: Intellect or Wisdom\n\nMechanics:\n• *Imprint Item:* Bind a spell or psionic effect to an object (CR 20 + Spell Level).\n• *Analyze Artifact:* Identify the properties of a magitech item.\n\nSpecialties:\n• Focusing Crystals: Cutting, polishing, and aligning quartz and alien crystals to channel raw meta-currents.\n• Psionic Amplifiers: Building cranial headbands and helm arrays that boost telepathic and telekinetic range.\n• Metaphysical Weapon Imbuement: Inscribing runic channels onto blades and barrels to conduct elemental magic.\n• Magitech Circuitry: Etching silver and cold-iron traces into printed circuit boards to process arcane power.\n• Golem & Construct Forging: Animating mechanized automata using bound elemental spirits or artificial souls.\n• Talisman & Amulet Crafting: Creating defensive jewelry that stores single-charge warding or protective spells.\n• Dimensional Containers: Crafting bags, crates, and pockets that utilize folded space to hold massive volume.\n• Wands & Focusing Rods: Turning dense woods, conductive alloys, and monster bones into directional casting implements.\n• Etheric Batteries: Fabricating capacitors that store ambient mana, void discharge, or psychic residue for later use.\n• Artifact Diagnostics: Examining ancient, unknown magitech machinery to deduce activation keys and hazards.",
          "specialty_details": [
            {
              "name": "Focusing Crystals",
              "description": "Cutting, polishing, and aligning quartz and alien crystals to channel raw meta-currents."
            },
            {
              "name": "Psionic Amplifiers",
              "description": "Building cranial headbands and helm arrays that boost telepathic and telekinetic range."
            },
            {
              "name": "Metaphysical Weapon Imbuement",
              "description": "Inscribing runic channels onto blades and barrels to conduct elemental magic."
            },
            {
              "name": "Magitech Circuitry",
              "description": "Etching silver and cold-iron traces into printed circuit boards to process arcane power."
            },
            {
              "name": "Golem & Construct Forging",
              "description": "Animating mechanized automata using bound elemental spirits or artificial souls."
            },
            {
              "name": "Talisman & Amulet Crafting",
              "description": "Creating defensive jewelry that stores single-charge warding or protective spells."
            },
            {
              "name": "Dimensional Containers",
              "description": "Crafting bags, crates, and pockets that utilize folded space to hold massive volume."
            },
            {
              "name": "Wands & Focusing Rods",
              "description": "Turning dense woods, conductive alloys, and monster bones into directional casting implements."
            },
            {
              "name": "Etheric Batteries",
              "description": "Fabricating capacitors that store ambient mana, void discharge, or psychic residue for later use."
            },
            {
              "name": "Artifact Diagnostics",
              "description": "Examining ancient, unknown magitech machinery to deduce activation keys and hazards."
            }
          ],
          "full_text": "### **ARTIFICER**\n\n* **Ability:** Intellect or Wisdom  \n* **Description:** Artificer is the skill of creating metaphysical empowered items, such as devices, potions, or enchanted weapons. It reflects a character's ability to mix special ingredients, empower weapons, and create magical effects. Artificer is used whenever a character needs to create magical or psionic items that are functional and effective. This can include things like mixing magical ingredients, enchanting weapons, and creating magical effects. The specific craft of combining technology with metaphysical (magical/psionic) energies. This is the skill used to create \"enchanted\" or \"psi-active\" items.  \n* **Mechanics:**  \n  * *Imprint Item:* Bind a spell or psionic effect to an object (CR 20 \\+ Spell Level).  \n  * *Analyze Artifact:* Identify the properties of a magitech item.  \n* **Specialties:**   \n  * **Focusing Crystals:** Cutting, polishing, and aligning quartz and alien crystals to channel raw meta-currents.  \n    * **Psionic Amplifiers:** Building cranial headbands and helm arrays that boost telepathic and telekinetic range.  \n    * **Metaphysical Weapon Imbuement:** Inscribing runic channels onto blades and barrels to conduct elemental magic.  \n    * **Magitech Circuitry:** Etching silver and cold-iron traces into printed circuit boards to process arcane power.  \n    * **Golem & Construct Forging:** Animating mechanized automata using bound elemental spirits or artificial souls.  \n    * **Talisman & Amulet Crafting:** Creating defensive jewelry that stores single-charge warding or protective spells.  \n    * **Dimensional Containers:** Crafting bags, crates, and pockets that utilize folded space to hold massive volume.  \n    * **Wands & Focusing Rods:** Turning dense woods, conductive alloys, and monster bones into directional casting implements.  \n    * **Etheric Batteries:** Fabricating capacitors that store ambient mana, void discharge, or psychic residue for later use.  \n    * **Artifact Diagnostics:** Examining ancient, unknown magitech machinery to deduce activation keys and hazards.\n\n  ###"
        },
        {
          "name": "Broker",
          "id": "mental-broker",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Broker is the skill of negotiating and managing financial transactions. It reflects a character's ability to negotiate contracts, manage investments, and analyze financial data. Broker is used whenever a character needs to ensure that financial transactions are profitable and beneficial for their clients. This can include things like negotiating deals, managing investments, and analyzing market data.",
          "keywords": "broker, mental, intellect, cognitive, expertise, information",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Black Market Contraband",
            "Securities & Equities",
            "Starship Sales & Transfers",
            "Mercenary Contracts",
            "Real Estate & Land Rights",
            "Military Arms Brokering",
            "Mining Claims & Concessions",
            "Information & Secrets Trading",
            "Intellectual Property Licensing",
            "High-Value Luxury Commodities"
          ],
          "governing_attribute": "Wisdom or Charisma",
          "mechanic": "Governing Ability: Wisdom or Charisma\n\nMechanics:\n• *Appraise Market:* CR 15 to know if a commodity is selling above or below average value in this system.\n• *Secure Deal:* CR 20 to find a buyer for illegal or rare goods.\n\nSpecialties:\n• Black Market Contraband: Connecting sellers of illicit narcotics, military tech, and unvetted chips with buyers.\n• Securities & Equities: Brokering large blocks of corporate stock, municipal bonds, and venture equities.\n• Starship Sales & Transfers: Arranging ownership transfers, escrows, and surveys for used civilian and naval craft.\n• Mercenary Contracts: Matching corporate and planetary clients with private military outfits and bounty hunters.\n• Real Estate & Land Rights: Brokering purchases of commercial arcology blocks, private moons, and farming lands.\n• Military Arms Brokering: Negotiating bulk surplus sales of firearms, munitions, and combat armor to third parties.\n• Mining Claims & Concessions: Trading mineral survey data and staking rights for asteroid belts and virgin planets.\n• Information & Secrets Trading: Brokering blackmail, corporate trade secrets, and military troop manifests for cash.\n• Intellectual Property Licensing: Trading patents, pharmaceutical formulas, and software source codes.\n• High-Value Luxury Commodities: Finding private collectors for vintage wines, rare furs, and exotic alien pets.",
          "specialty_details": [
            {
              "name": "Black Market Contraband",
              "description": "Connecting sellers of illicit narcotics, military tech, and unvetted chips with buyers."
            },
            {
              "name": "Securities & Equities",
              "description": "Brokering large blocks of corporate stock, municipal bonds, and venture equities."
            },
            {
              "name": "Starship Sales & Transfers",
              "description": "Arranging ownership transfers, escrows, and surveys for used civilian and naval craft."
            },
            {
              "name": "Mercenary Contracts",
              "description": "Matching corporate and planetary clients with private military outfits and bounty hunters."
            },
            {
              "name": "Real Estate & Land Rights",
              "description": "Brokering purchases of commercial arcology blocks, private moons, and farming lands."
            },
            {
              "name": "Military Arms Brokering",
              "description": "Negotiating bulk surplus sales of firearms, munitions, and combat armor to third parties."
            },
            {
              "name": "Mining Claims & Concessions",
              "description": "Trading mineral survey data and staking rights for asteroid belts and virgin planets."
            },
            {
              "name": "Information & Secrets Trading",
              "description": "Brokering blackmail, corporate trade secrets, and military troop manifests for cash."
            },
            {
              "name": "Intellectual Property Licensing",
              "description": "Trading patents, pharmaceutical formulas, and software source codes."
            },
            {
              "name": "High-Value Luxury Commodities",
              "description": "Finding private collectors for vintage wines, rare furs, and exotic alien pets."
            }
          ],
          "full_text": "### **BROKER**\n\n* **Ability:** Wisdom or Charisma  \n* **Description:** Broker is the skill of negotiating and managing financial transactions. It reflects a character's ability to negotiate contracts, manage investments, and analyze financial data. Broker is used whenever a character needs to ensure that financial transactions are profitable and beneficial for their clients. This can include things like negotiating deals, managing investments, and analyzing market data.  \n* **Mechanics:**  \n  * *Appraise Market:* CR 15 to know if a commodity is selling above or below average value in this system.  \n  * *Secure Deal:* CR 20 to find a buyer for illegal or rare goods.  \n* **Specialties:**   \n  * **Black Market Contraband:** Connecting sellers of illicit narcotics, military tech, and unvetted chips with buyers.  \n    * **Securities & Equities:** Brokering large blocks of corporate stock, municipal bonds, and venture equities.  \n    * **Starship Sales & Transfers:** Arranging ownership transfers, escrows, and surveys for used civilian and naval craft.  \n    * **Mercenary Contracts:** Matching corporate and planetary clients with private military outfits and bounty hunters.  \n    * **Real Estate & Land Rights:** Brokering purchases of commercial arcology blocks, private moons, and farming lands.  \n    * **Military Arms Brokering:** Negotiating bulk surplus sales of firearms, munitions, and combat armor to third parties.  \n    * **Mining Claims & Concessions:** Trading mineral survey data and staking rights for asteroid belts and virgin planets.  \n    * **Information & Secrets Trading:** Brokering blackmail, corporate trade secrets, and military troop manifests for cash.  \n    * **Intellectual Property Licensing:** Trading patents, pharmaceutical formulas, and software source codes.  \n    * **High-Value Luxury Commodities:** Finding private collectors for vintage wines, rare furs, and exotic alien pets.\n\n  ###"
        },
        {
          "name": "Celebrity",
          "id": "mental-celebrity",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Celebrity is the skill of managing one's public image and interacting with fans and the media. It reflects a character's ability to manage social interactions, give interviews, and attend public events. Celebrity is used whenever a character needs to maintain a positive public image and promote their brand.",
          "keywords": "celebrity, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Holonet Streaming & Broadcast",
            "Public Relations Spin",
            "Brand Endorsements",
            "Red Carpet & Gala Presence",
            "Fanbase Mobilization",
            "Paparazzi Evasion",
            "Persona Fabrication",
            "Talk Show Charm",
            "Charity Gala Organizing",
            "VIP Access & Entourage Control"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Work the Crowd:* CR 15 to gain access to a VIP area based on recognition.\n• *Spin:* CR 20 to mitigate a scandal or bad reputation event.\n\nSpecialties:\n• Holonet Streaming & Broadcast: Presenting engaging video streams, entertaining live feeds, and hosting shows.\n• Public Relations Spin: Turning scandalous mistakes, arrests, or failures into sympathetic PR victories.\n• Brand Endorsements: Leveraging star power to sell products, gear lines, and lifestyle concepts for credits.\n• Red Carpet & Gala Presence: Navigating high-profile parties, dominating camera angles, and dazzling crowds.\n• Fanbase Mobilization: Directing millions of loyal fans to boycott corporations, vote, or crowdfund projects.\n• Paparazzi Evasion: Slipping away from aggressive media cameras, hover-drones, and tabloid trackers.\n• Persona Fabrication: Developing and maintaining a consistent, highly marketed public persona or alter ego.\n• Talk Show Charm: Dominating live interview formats, deflecting awkward queries, and landing memorable soundbites.\n• Charity Gala Organizing: Hosting multi-million-credit charity events to scrub reputations and curry public goodwill.\n• VIP Access & Entourage Control: Using celebrity status to walk past security bouncers and enter exclusive VIP spaces.",
          "specialty_details": [
            {
              "name": "Holonet Streaming & Broadcast",
              "description": "Presenting engaging video streams, entertaining live feeds, and hosting shows."
            },
            {
              "name": "Public Relations Spin",
              "description": "Turning scandalous mistakes, arrests, or failures into sympathetic PR victories."
            },
            {
              "name": "Brand Endorsements",
              "description": "Leveraging star power to sell products, gear lines, and lifestyle concepts for credits."
            },
            {
              "name": "Red Carpet & Gala Presence",
              "description": "Navigating high-profile parties, dominating camera angles, and dazzling crowds."
            },
            {
              "name": "Fanbase Mobilization",
              "description": "Directing millions of loyal fans to boycott corporations, vote, or crowdfund projects."
            },
            {
              "name": "Paparazzi Evasion",
              "description": "Slipping away from aggressive media cameras, hover-drones, and tabloid trackers."
            },
            {
              "name": "Persona Fabrication",
              "description": "Developing and maintaining a consistent, highly marketed public persona or alter ego."
            },
            {
              "name": "Talk Show Charm",
              "description": "Dominating live interview formats, deflecting awkward queries, and landing memorable soundbites."
            },
            {
              "name": "Charity Gala Organizing",
              "description": "Hosting multi-million-credit charity events to scrub reputations and curry public goodwill."
            },
            {
              "name": "VIP Access & Entourage Control",
              "description": "Using celebrity status to walk past security bouncers and enter exclusive VIP spaces."
            }
          ],
          "full_text": "### **CELEBRITY**\n\n* **Ability:** Charisma  \n* **Description:** Celebrity is the skill of managing one's public image and interacting with fans and the media. It reflects a character's ability to manage social interactions, give interviews, and attend public events. Celebrity is used whenever a character needs to maintain a positive public image and promote their brand.  \n* **Mechanics:**  \n  * *Work the Crowd:* CR 15 to gain access to a VIP area based on recognition.  \n  * *Spin:* CR 20 to mitigate a scandal or bad reputation event.  \n* **Specialties:**   \n  * **Holonet Streaming & Broadcast:** Presenting engaging video streams, entertaining live feeds, and hosting shows.  \n    * **Public Relations Spin:** Turning scandalous mistakes, arrests, or failures into sympathetic PR victories.  \n    * **Brand Endorsements:** Leveraging star power to sell products, gear lines, and lifestyle concepts for credits.  \n    * **Red Carpet & Gala Presence:** Navigating high-profile parties, dominating camera angles, and dazzling crowds.  \n    * **Fanbase Mobilization:** Directing millions of loyal fans to boycott corporations, vote, or crowdfund projects.  \n    * **Paparazzi Evasion:** Slipping away from aggressive media cameras, hover-drones, and tabloid trackers.  \n    * **Persona Fabrication:** Developing and maintaining a consistent, highly marketed public persona or alter ego.  \n    * **Talk Show Charm:** Dominating live interview formats, deflecting awkward queries, and landing memorable soundbites.  \n    * **Charity Gala Organizing:** Hosting multi-million-credit charity events to scrub reputations and curry public goodwill.  \n    * **VIP Access & Entourage Control:** Using celebrity status to walk past security bouncers and enter exclusive VIP spaces.\n\n  ###"
        },
        {
          "name": "Constable",
          "id": "mental-constable",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Constable is the skill of enforcing the law and maintaining order. It reflects a character's ability to investigate crimes, make arrests, and protect citizens. Constable is used whenever a character needs to ensure that laws are upheld and that citizens are safe. This can include things like investigating crimes, making arrests, and protecting citizens.",
          "keywords": "constable, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Patrol Procedures",
            "Riot & Crowd Control",
            "Suspect Apprehension",
            "Evidence Chain of Custody",
            "Tactical Breaching",
            "Interrogation & Field Questioning",
            "Jurisdictional Sector Law",
            "Traffic & Checkpoint Control",
            "Hostage Crisis First-Response",
            "Undercover Vice Operations"
          ],
          "governing_attribute": "Wisdom or Intellect",
          "mechanic": "Governing Ability: Wisdom or Intellect\n\nMechanics:\n• *Procedure:* CR 15 to know the jurisdiction and rights in a specific sector.\n• *Collect Evidence:* CR 15 to properly bag and tag evidence without contaminating it.\n\nSpecialties:\n• Patrol Procedures: Walking beats, spotting suspicious street activity, and projecting an authoritative presence.\n• Riot & Crowd Control: Deploying shield walls, tear gas lines, and batons to break up violent civil mobs.\n• Suspect Apprehension: Tacking down, tackling, and applying restraint cuffs to non-compliant suspects safely.\n• Evidence Chain of Custody: Documenting, bagging, and securing legal evidence to ensure courtroom admissibility.\n• Tactical Breaching: Stacking outside narcotics dens, blowing hinge bolts, and executing high-threat entries.\n• Interrogation & Field Questioning: Interviewing street witnesses and suspects to glean immediate tactical leads.\n• Jurisdictional Sector Law: Knowing legal boundaries, warrant requirements, and search rights in a given sector.\n• Traffic & Checkpoint Control: Setting up roadblock barricades, running license scans, and spotting drug mules.\n• Hostage Crisis First-Response: Containing active shooter situations and securing perimeters until negotiators arrive.\n• Undercover Vice Operations: Infiltrating low-level illegal gambling dens, chop shops, and contraband rings.",
          "specialty_details": [
            {
              "name": "Patrol Procedures",
              "description": "Walking beats, spotting suspicious street activity, and projecting an authoritative presence."
            },
            {
              "name": "Riot & Crowd Control",
              "description": "Deploying shield walls, tear gas lines, and batons to break up violent civil mobs."
            },
            {
              "name": "Suspect Apprehension",
              "description": "Tacking down, tackling, and applying restraint cuffs to non-compliant suspects safely."
            },
            {
              "name": "Evidence Chain of Custody",
              "description": "Documenting, bagging, and securing legal evidence to ensure courtroom admissibility."
            },
            {
              "name": "Tactical Breaching",
              "description": "Stacking outside narcotics dens, blowing hinge bolts, and executing high-threat entries."
            },
            {
              "name": "Interrogation & Field Questioning",
              "description": "Interviewing street witnesses and suspects to glean immediate tactical leads."
            },
            {
              "name": "Jurisdictional Sector Law",
              "description": "Knowing legal boundaries, warrant requirements, and search rights in a given sector."
            },
            {
              "name": "Traffic & Checkpoint Control",
              "description": "Setting up roadblock barricades, running license scans, and spotting drug mules."
            },
            {
              "name": "Hostage Crisis First-Response",
              "description": "Containing active shooter situations and securing perimeters until negotiators arrive."
            },
            {
              "name": "Undercover Vice Operations",
              "description": "Infiltrating low-level illegal gambling dens, chop shops, and contraband rings."
            }
          ],
          "full_text": "### **CONSTABLE**\n\n* **Ability:** Wisdom or Intellect  \n* **Description:** Constable is the skill of enforcing the law and maintaining order. It reflects a character's ability to investigate crimes, make arrests, and protect citizens. Constable is used whenever a character needs to ensure that laws are upheld and that citizens are safe. This can include things like investigating crimes, making arrests, and protecting citizens.   \n* **Mechanics:**  \n  * *Procedure:* CR 15 to know the jurisdiction and rights in a specific sector.  \n  * *Collect Evidence:* CR 15 to properly bag and tag evidence without contaminating it.  \n* **Specialties:**   \n  * **Patrol Procedures:** Walking beats, spotting suspicious street activity, and projecting an authoritative presence.  \n    * **Riot & Crowd Control:** Deploying shield walls, tear gas lines, and batons to break up violent civil mobs.  \n    * **Suspect Apprehension:** Tacking down, tackling, and applying restraint cuffs to non-compliant suspects safely.  \n    * **Evidence Chain of Custody:** Documenting, bagging, and securing legal evidence to ensure courtroom admissibility.  \n    * **Tactical Breaching:** Stacking outside narcotics dens, blowing hinge bolts, and executing high-threat entries.  \n    * **Interrogation & Field Questioning:** Interviewing street witnesses and suspects to glean immediate tactical leads.  \n    * **Jurisdictional Sector Law:** Knowing legal boundaries, warrant requirements, and search rights in a given sector.  \n    * **Traffic & Checkpoint Control:** Setting up roadblock barricades, running license scans, and spotting drug mules.  \n    * **Hostage Crisis First-Response:** Containing active shooter situations and securing perimeters until negotiators arrive.  \n    * **Undercover Vice Operations:** Infiltrating low-level illegal gambling dens, chop shops, and contraband rings.\n\n  ###"
        },
        {
          "name": "Courtesan",
          "id": "mental-courtesan",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Courtesan is the skill of entertaining and pleasing others. It reflects a character's ability to dance, sing, or be intimate in a professional manner. Courtesan is used whenever a character needs to provide entertainment and pleasure to their clients. Professional companionship, high-society socialization, and the art of conversation and entertainment. Often overlaps with spying.",
          "keywords": "courtesan, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "High-Society Etiquette",
            "Pillow Talk & Eavesdropping",
            "Art of Witty Conversation",
            "Sensual Seduction",
            "Discreet Companionship",
            "Flattery & Ego Stroking",
            "Poise & Posture Mastery",
            "Social Shielding",
            "Subtle Intoxication Management",
            "Patron Psychology"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Seduction/Charm:* Opposed by Wisdom (Insight).\n• *Gather Rumors:* CR 15 to pick up sensitive information during social interactions.\n\nSpecialties:\n• High-Society Etiquette: Effortlessly fitting into noble galas, elite banquets, and decadent private revues.\n• Pillow Talk & Eavesdropping: Coaxing military secrets, executive passcodes, and hidden plots from wealthy patrons.\n• Art of Witty Conversation: Entertaining bored aristocrats and corporate moguls with captivating verbal banter.\n• Sensual Seduction: Reading physical attraction cues to make individuals feel uniquely desired and disarmed.\n• Discreet Companionship: Maintaining total professional confidentiality, inspiring profound emotional trust.\n• Flattery & Ego Stroking: Inflating fragile egos to lower defenses, win favors, and secure extravagant gifts.\n• Poise & Posture Mastery: Projecting absolute grace, physical beauty, and captivating movement across any room.\n• Social Shielding: Gracefully diverting abrasive guests away from vulnerable patrons during awkward social scenes.\n• Subtle Intoxication Management: Feigning drunkenness while keeping a razor-sharp, sober mind during late-night revels.\n• Patron Psychology: Evaluating client emotional vulnerabilities to serve as confidant, therapist, and advisor.",
          "specialty_details": [
            {
              "name": "High-Society Etiquette",
              "description": "Effortlessly fitting into noble galas, elite banquets, and decadent private revues."
            },
            {
              "name": "Pillow Talk & Eavesdropping",
              "description": "Coaxing military secrets, executive passcodes, and hidden plots from wealthy patrons."
            },
            {
              "name": "Art of Witty Conversation",
              "description": "Entertaining bored aristocrats and corporate moguls with captivating verbal banter."
            },
            {
              "name": "Sensual Seduction",
              "description": "Reading physical attraction cues to make individuals feel uniquely desired and disarmed."
            },
            {
              "name": "Discreet Companionship",
              "description": "Maintaining total professional confidentiality, inspiring profound emotional trust."
            },
            {
              "name": "Flattery & Ego Stroking",
              "description": "Inflating fragile egos to lower defenses, win favors, and secure extravagant gifts."
            },
            {
              "name": "Poise & Posture Mastery",
              "description": "Projecting absolute grace, physical beauty, and captivating movement across any room."
            },
            {
              "name": "Social Shielding",
              "description": "Gracefully diverting abrasive guests away from vulnerable patrons during awkward social scenes."
            },
            {
              "name": "Subtle Intoxication Management",
              "description": "Feigning drunkenness while keeping a razor-sharp, sober mind during late-night revels."
            },
            {
              "name": "Patron Psychology",
              "description": "Evaluating client emotional vulnerabilities to serve as confidant, therapist, and advisor."
            }
          ],
          "full_text": "### **COURTESAN**\n\n* **Ability:** Charisma  \n* **Description:** Courtesan is the skill of entertaining and pleasing others. It reflects a character's ability to dance, sing, or be intimate in a professional manner. Courtesan is used whenever a character needs to provide entertainment and pleasure to their clients. Professional companionship, high-society socialization, and the art of conversation and entertainment. Often overlaps with spying.  \n* **Mechanics:**  \n  * *Seduction/Charm:* Opposed by Wisdom (Insight).  \n  * *Gather Rumors:* CR 15 to pick up sensitive information during social interactions.  \n* **Specialties:**   \n  * **High-Society Etiquette:** Effortlessly fitting into noble galas, elite banquets, and decadent private revues.  \n    * **Pillow Talk & Eavesdropping:** Coaxing military secrets, executive passcodes, and hidden plots from wealthy patrons.  \n    * **Art of Witty Conversation:** Entertaining bored aristocrats and corporate moguls with captivating verbal banter.  \n    * **Sensual Seduction:** Reading physical attraction cues to make individuals feel uniquely desired and disarmed.  \n    * **Discreet Companionship:** Maintaining total professional confidentiality, inspiring profound emotional trust.  \n    * **Flattery & Ego Stroking:** Inflating fragile egos to lower defenses, win favors, and secure extravagant gifts.  \n    * **Poise & Posture Mastery:** Projecting absolute grace, physical beauty, and captivating movement across any room.  \n    * **Social Shielding:** Gracefully diverting abrasive guests away from vulnerable patrons during awkward social scenes.  \n    * **Subtle Intoxication Management:** Feigning drunkenness while keeping a razor-sharp, sober mind during late-night revels.  \n    * **Patron Psychology:** Evaluating client emotional vulnerabilities to serve as confidant, therapist, and advisor.\n\n  ###"
        },
        {
          "name": "Culinarian",
          "id": "mental-culinarian",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Culinarian is the skill of cooking and preparing food. It reflects a character's ability to prepare ingredients, cook meals, and present food. Culinarian is used whenever a character needs to create delicious and nutritious meals. This can include things like preparing ingredients, cooking meals, and presenting food.",
          "keywords": "culinarian, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Xenofood Neutralization",
            "Haute Cuisine & Fine Dining",
            "Field Ration Optimization",
            "Baking & Pastry Arts",
            "Brewing, Fermenting & Distilling",
            "Food Preservation & Curing",
            "Butchery & Dressing",
            "Flavor Balancing & Spicing",
            "Toxin & Poison Tasting",
            "Banquet & Mass Catering"
          ],
          "governing_attribute": "Wisdom or Agility",
          "mechanic": "Governing Ability: Wisdom or Agility\n\nMechanics:\n• *Prepare Meal:* CR 10 (Standard) to CR 30 (Banquet). High success grants temporary morale bonuses to those who eat.\n• *Identify Ingredients:* CR 15 to taste a poison or strange alien spice.\n\nSpecialties:\n• Xenofood Neutralization: Processing, cooking, and detoxifying strange alien flora and fauna for human consumption.\n• Haute Cuisine & Fine Dining: Preparing multi-course, visually stunning gourmet meals for high nobility and executives.\n• Field Ration Optimization: Transforming bland nutrient paste and dried field rations into palatable, morale-boosting meals.\n• Baking & Pastry Arts: Crafting delicate breads, pastries, sugar art, and complex doughs with precise chemistry.\n• Brewing, Fermenting & Distilling: Crafting fine wines, ales, spirits, and fermented probiotics from local crops.\n• Food Preservation & Curing: Smoking, salting, pickling, and freeze-drying meats and produce for deep-space voyages.\n• Butchery & Dressing: Carving wild carcasses, jointing meat cleanly, and extracting edible cuts without waste.\n• Flavor Balancing & Spicing: Blending rare off-world herbs, spices, and seasonings to elevate common dishes.\n• Toxin & Poison Tasting: Identifying trace amounts of cyanide, arsenic, or spoiled proteins in served dishes by scent/taste.\n• Banquet & Mass Catering: Managing industrial kitchens to feed thousands of starship crewmen or soldiers efficiently.",
          "specialty_details": [
            {
              "name": "Xenofood Neutralization",
              "description": "Processing, cooking, and detoxifying strange alien flora and fauna for human consumption."
            },
            {
              "name": "Haute Cuisine & Fine Dining",
              "description": "Preparing multi-course, visually stunning gourmet meals for high nobility and executives."
            },
            {
              "name": "Field Ration Optimization",
              "description": "Transforming bland nutrient paste and dried field rations into palatable, morale-boosting meals."
            },
            {
              "name": "Baking & Pastry Arts",
              "description": "Crafting delicate breads, pastries, sugar art, and complex doughs with precise chemistry."
            },
            {
              "name": "Brewing, Fermenting & Distilling",
              "description": "Crafting fine wines, ales, spirits, and fermented probiotics from local crops."
            },
            {
              "name": "Food Preservation & Curing",
              "description": "Smoking, salting, pickling, and freeze-drying meats and produce for deep-space voyages."
            },
            {
              "name": "Butchery & Dressing",
              "description": "Carving wild carcasses, jointing meat cleanly, and extracting edible cuts without waste."
            },
            {
              "name": "Flavor Balancing & Spicing",
              "description": "Blending rare off-world herbs, spices, and seasonings to elevate common dishes."
            },
            {
              "name": "Toxin & Poison Tasting",
              "description": "Identifying trace amounts of cyanide, arsenic, or spoiled proteins in served dishes by scent/taste."
            },
            {
              "name": "Banquet & Mass Catering",
              "description": "Managing industrial kitchens to feed thousands of starship crewmen or soldiers efficiently."
            }
          ],
          "full_text": "### **CULINARIAN**\n\n* **Ability:** Wisdom or Agility  \n* **Description:** Culinarian is the skill of cooking and preparing food. It reflects a character's ability to prepare ingredients, cook meals, and present food. Culinarian is used whenever a character needs to create delicious and nutritious meals. This can include things like preparing ingredients, cooking meals, and presenting food.   \n* **Mechanics:**  \n  * *Prepare Meal:* CR 10 (Standard) to CR 30 (Banquet). High success grants temporary morale bonuses to those who eat.  \n  * *Identify Ingredients:* CR 15 to taste a poison or strange alien spice.  \n* **Specialties:**   \n  * **Xenofood Neutralization:** Processing, cooking, and detoxifying strange alien flora and fauna for human consumption.  \n    * **Haute Cuisine & Fine Dining:** Preparing multi-course, visually stunning gourmet meals for high nobility and executives.  \n    * **Field Ration Optimization:** Transforming bland nutrient paste and dried field rations into palatable, morale-boosting meals.  \n    * **Baking & Pastry Arts:** Crafting delicate breads, pastries, sugar art, and complex doughs with precise chemistry.  \n    * **Brewing, Fermenting & Distilling:** Crafting fine wines, ales, spirits, and fermented probiotics from local crops.  \n    * **Food Preservation & Curing:** Smoking, salting, pickling, and freeze-drying meats and produce for deep-space voyages.  \n    * **Butchery & Dressing:** Carving wild carcasses, jointing meat cleanly, and extracting edible cuts without waste.  \n    * **Flavor Balancing & Spicing:** Blending rare off-world herbs, spices, and seasonings to elevate common dishes.  \n    * **Toxin & Poison Tasting:** Identifying trace amounts of cyanide, arsenic, or spoiled proteins in served dishes by scent/taste.  \n    * **Banquet & Mass Catering:** Managing industrial kitchens to feed thousands of starship crewmen or soldiers efficiently.\n\n  ###"
        },
        {
          "name": "Demolitionist",
          "id": "mental-demolitionist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Demolitionist is the skill of creating and using explosives. It reflects a character's ability to create bombs, set charges, and detonate explosives for various purposes. Demolitionist is used whenever a character needs to ensure that explosives are used safely and effectively. This can include things like creating bombs, disarming bombs, setting charges, and detonating explosives for various purposes.",
          "keywords": "demolitionist, mental, intellect, cognitive, expertise, explosives",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Structural Controlled Implosion",
            "Combat Breaching Charges",
            "EOD Bomb Defusal",
            "Commercial Mining Blasting",
            "Shaped-Charge Armor Penetration",
            "Improvised Explosive Devices (IEDs)",
            "Remote & Timed Detonators",
            "Underwater & Vacuum Demolitions",
            "Blast Mitigation & Containment",
            "Munitions Disposal"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Set Charge:* CR 15 for simple breach, CR 25 to collapse a structure without damaging surroundings.\n• *Defuse:* CR depends on the bomb's complexity (usually CR 20+). Failure by 5+ triggers the device.\n\nSpecialties:\n• Structural Controlled Implosion: Calculating load points to drop high-rise buildings and towers within their footprints.\n• Combat Breaching Charges: Setting linear shaped charges to blow open reinforced steel doors without killing the stack.\n• EOD Bomb Defusal: Tracing circuitry, bypassing anti-tamper switches, and disarming unexploded bombs under pressure.\n• Commercial Mining Blasting: Drilling and packing dynamite or plas-charges into rock faces to maximize ore fracture.\n• Shaped-Charge Armor Penetration: Rigging concentrated directional blasts to punch clean holes through bunker armor.\n• Improvised Explosive Devices (IEDs): Fashioning functional mines and bombs from fertilizer, cleaning agents, and scrap.\n• Remote & Timed Detonators: Wiring radio triggers, laser tripwires, timers, and pressure plates with fail-safes.\n• Underwater & Vacuum Demolitions: Accounting for hydro-shockwaves and explosive dissipation in the cold vacuum of space.\n• Blast Mitigation & Containment: Sandbagging, venting, and rigging blast curtains to direct explosions away from allies.\n• Munitions Disposal: Safely burning off degraded explosives, unstable gel-packs, and leaking chemical shells.",
          "specialty_details": [
            {
              "name": "Structural Controlled Implosion",
              "description": "Calculating load points to drop high-rise buildings and towers within their footprints."
            },
            {
              "name": "Combat Breaching Charges",
              "description": "Setting linear shaped charges to blow open reinforced steel doors without killing the stack."
            },
            {
              "name": "EOD Bomb Defusal",
              "description": "Tracing circuitry, bypassing anti-tamper switches, and disarming unexploded bombs under pressure."
            },
            {
              "name": "Commercial Mining Blasting",
              "description": "Drilling and packing dynamite or plas-charges into rock faces to maximize ore fracture."
            },
            {
              "name": "Shaped-Charge Armor Penetration",
              "description": "Rigging concentrated directional blasts to punch clean holes through bunker armor."
            },
            {
              "name": "Improvised Explosive Devices (IEDs)",
              "description": "Fashioning functional mines and bombs from fertilizer, cleaning agents, and scrap."
            },
            {
              "name": "Remote & Timed Detonators",
              "description": "Wiring radio triggers, laser tripwires, timers, and pressure plates with fail-safes."
            },
            {
              "name": "Underwater & Vacuum Demolitions",
              "description": "Accounting for hydro-shockwaves and explosive dissipation in the cold vacuum of space."
            },
            {
              "name": "Blast Mitigation & Containment",
              "description": "Sandbagging, venting, and rigging blast curtains to direct explosions away from allies."
            },
            {
              "name": "Munitions Disposal",
              "description": "Safely burning off degraded explosives, unstable gel-packs, and leaking chemical shells."
            }
          ],
          "full_text": "### **DEMOLITIONIST**\n\n* **Ability:** Intellect  \n* **Description:** Demolitionist is the skill of creating and using explosives. It reflects a character's ability to create bombs, set charges, and detonate explosives for various purposes. Demolitionist is used whenever a character needs to ensure that explosives are used safely and effectively. This can include things like creating bombs, disarming bombs, setting charges, and detonating explosives for various purposes.   \n* **Mechanics:**  \n  * *Set Charge:* CR 15 for simple breach, CR 25 to collapse a structure without damaging surroundings.  \n  * *Defuse:* CR depends on the bomb's complexity (usually CR 20+). Failure by 5+ triggers the device.  \n* **Specialties:**   \n  * **Structural Controlled Implosion:** Calculating load points to drop high-rise buildings and towers within their footprints.  \n    * **Combat Breaching Charges:** Setting linear shaped charges to blow open reinforced steel doors without killing the stack.  \n    * **EOD Bomb Defusal:** Tracing circuitry, bypassing anti-tamper switches, and disarming unexploded bombs under pressure.  \n    * **Commercial Mining Blasting:** Drilling and packing dynamite or plas-charges into rock faces to maximize ore fracture.  \n    * **Shaped-Charge Armor Penetration:** Rigging concentrated directional blasts to punch clean holes through bunker armor.  \n    * **Improvised Explosive Devices (IEDs):** Fashioning functional mines and bombs from fertilizer, cleaning agents, and scrap.  \n    * **Remote & Timed Detonators:** Wiring radio triggers, laser tripwires, timers, and pressure plates with fail-safes.  \n    * **Underwater & Vacuum Demolitions:** Accounting for hydro-shockwaves and explosive dissipation in the cold vacuum of space.  \n    * **Blast Mitigation & Containment:** Sandbagging, venting, and rigging blast curtains to direct explosions away from allies.  \n    * **Munitions Disposal:** Safely burning off degraded explosives, unstable gel-packs, and leaking chemical shells.\n\n  ###"
        },
        {
          "name": "Electrician",
          "id": "mental-electrician",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Electrician is the skill of understanding and working with electrical systems. It reflects a character's ability to install and repair electrical systems, such as wiring, circuits, outlets, switches, and lighting fixtures. Electrician is used whenever a character needs to ensure that electrical systems are safe and functional. This can include things like installing and repairing electrical systems, such as wiring, circuits, outlets, switches, and lighting fixtures. Wiring, circuitry, and power systems. Distinct from Computers (software) and Mechanic (moving parts).",
          "keywords": "electrician, mental, intellect, cognitive, expertise, power",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "High-Voltage Distribution",
            "Micro-Electronics & PCBs",
            "Ship Power Bus Routing",
            "Backup Generators & Uninterruptible Power",
            "Circuit Breakers & Fuses",
            "Cyberware Interface Wiring",
            "Lock Relay Bypassing",
            "EMP Hardening",
            "Fiber-Optic & Data Cabling",
            "Solar & Renewable Arrays"
          ],
          "governing_attribute": "Intellect or Agility",
          "mechanic": "Governing Ability: Intellect or Agility\n\nMechanics:\n• *Bypass Security:* CR 20 to hotwire an electronic lock.\n• *Repair Circuit:* CR 15 to fix a fried panel.\n• *Restore Power:* CR 20 to reroute power in a damaged ship.\n\nSpecialties:\n• High-Voltage Distribution: Laying heavy-duty power lines, substations, and industrial 10,000-volt transformers.\n• Micro-Electronics & PCBs: Soldering surface-mount resistors, micro-chips, and delicate data bus relays.\n• Ship Power Bus Routing: Balancing primary and secondary power conduits across starship decks during combat.\n• Backup Generators & Uninterruptible Power: Installing and servicing diesel, turbine, and battery-bank backup arrays.\n• Circuit Breakers & Fuses: Diagnosing electrical overloads, short-circuits, and replacing blown primary bus fuses.\n• Cyberware Interface Wiring: Terminating neural-wire harness plugs and biocompatible conductive ports cleanly.\n• Lock Relay Bypassing: Hotwiring electronic door strikes and shorting solenoid lock tumblers with jumper wires.\n• EMP Hardening: Installing Faraday shielding, surge arresters, and shielded conduits to resist electromagnetic shocks.\n• Fiber-Optic & Data Cabling: Splicing glass optical strands and routing interference-free high-speed data trunks.\n• Solar & Renewable Arrays: Wiring photovoltaic solar panels, thermal collectors, and inverters into local grids.",
          "specialty_details": [
            {
              "name": "High-Voltage Distribution",
              "description": "Laying heavy-duty power lines, substations, and industrial 10,000-volt transformers."
            },
            {
              "name": "Micro-Electronics & PCBs",
              "description": "Soldering surface-mount resistors, micro-chips, and delicate data bus relays."
            },
            {
              "name": "Ship Power Bus Routing",
              "description": "Balancing primary and secondary power conduits across starship decks during combat."
            },
            {
              "name": "Backup Generators & Uninterruptible Power",
              "description": "Installing and servicing diesel, turbine, and battery-bank backup arrays."
            },
            {
              "name": "Circuit Breakers & Fuses",
              "description": "Diagnosing electrical overloads, short-circuits, and replacing blown primary bus fuses."
            },
            {
              "name": "Cyberware Interface Wiring",
              "description": "Terminating neural-wire harness plugs and biocompatible conductive ports cleanly."
            },
            {
              "name": "Lock Relay Bypassing",
              "description": "Hotwiring electronic door strikes and shorting solenoid lock tumblers with jumper wires."
            },
            {
              "name": "EMP Hardening",
              "description": "Installing Faraday shielding, surge arresters, and shielded conduits to resist electromagnetic shocks."
            },
            {
              "name": "Fiber-Optic & Data Cabling",
              "description": "Splicing glass optical strands and routing interference-free high-speed data trunks."
            },
            {
              "name": "Solar & Renewable Arrays",
              "description": "Wiring photovoltaic solar panels, thermal collectors, and inverters into local grids."
            }
          ],
          "full_text": "### **ELECTRICIAN**\n\n* **Ability:** Intellect or Agility  \n* **Description:** Electrician is the skill of understanding and working with electrical systems. It reflects a character's ability to install and repair electrical systems, such as wiring, circuits, outlets, switches, and lighting fixtures. Electrician is used whenever a character needs to ensure that electrical systems are safe and functional. This can include things like installing and repairing electrical systems, such as wiring, circuits, outlets, switches, and lighting fixtures. Wiring, circuitry, and power systems. Distinct from Computers (software) and Mechanic (moving parts).  \n* **Mechanics:**  \n  * *Bypass Security:* CR 20 to hotwire an electronic lock.  \n  * *Repair Circuit:* CR 15 to fix a fried panel.  \n  * *Restore Power:* CR 20 to reroute power in a damaged ship.  \n* **Specialties:**   \n  * **High-Voltage Distribution:** Laying heavy-duty power lines, substations, and industrial 10,000-volt transformers.  \n    * **Micro-Electronics & PCBs:** Soldering surface-mount resistors, micro-chips, and delicate data bus relays.  \n    * **Ship Power Bus Routing:** Balancing primary and secondary power conduits across starship decks during combat.  \n    * **Backup Generators & Uninterruptible Power:** Installing and servicing diesel, turbine, and battery-bank backup arrays.  \n    * **Circuit Breakers & Fuses:** Diagnosing electrical overloads, short-circuits, and replacing blown primary bus fuses.  \n    * **Cyberware Interface Wiring:** Terminating neural-wire harness plugs and biocompatible conductive ports cleanly.  \n    * **Lock Relay Bypassing:** Hotwiring electronic door strikes and shorting solenoid lock tumblers with jumper wires.  \n    * **EMP Hardening:** Installing Faraday shielding, surge arresters, and shielded conduits to resist electromagnetic shocks.  \n    * **Fiber-Optic & Data Cabling:** Splicing glass optical strands and routing interference-free high-speed data trunks.  \n    * **Solar & Renewable Arrays:** Wiring photovoltaic solar panels, thermal collectors, and inverters into local grids.\n\n  ###"
        },
        {
          "name": "Engineer",
          "id": "mental-engineer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Engineering is the skill of using scientific principles to design and build mecha, automata (simple robotics) and similar structures and mechanisms. It reflects a character's ability to apply mathematical and scientific concepts to create new products or improve existing ones. Engineers work in various industries, including mechanical, electrical, computer and architectural skills. Engineering is using various components together to craft something larger and more complex, whereas the components themselves are covered by particular skills such as Mechanical or Electrical.",
          "keywords": "engineer, mental, intellect, cognitive, expertise, heavy",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Starship FTL Propulsion",
            "Sublight Thruster Assemblies",
            "Life Support Systems",
            "Civil Infrastructure",
            "Hydraulics & Pneumatics",
            "Thermal Dissipation Systems",
            "Industrial Automation & Assembly",
            "Structural Stress Diagnostics",
            "Power Plant Core Management",
            "Heavy Crane & Rigging Mechanics"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Diagnose Issue:* CR 15 to identify why the Hyperdrive isn't engaging.\n• *Boost System:* CR 20 to temporarily increase engine output or shield strength.\n\nSpecialties:\n• Starship FTL Propulsion: Servicing warp field coils, hyperdrive motivators, and dimensional jump engines.\n• Sublight Thruster Assemblies: Maintaining ion drives, fusion torches, and chemical reaction thrusters.\n• Life Support Systems: Designing and overhauling oxygen scrubbers, hydroponic air loops, and waste recyclers.\n• Civil Infrastructure: Engineering water aqueducts, sewage treatment plants, suspension bridges, and dams.\n• Hydraulics & Pneumatics: Designing high-pressure fluid valves, mechanical pistons, and pneumatic seals.\n• Thermal Dissipation Systems: Engineering reactor cooling loops, cryo-jacket cooling, and radiator fin arrays.\n• Industrial Automation & Assembly: Setting up automated robotic car lines, conveyor feeds, and stamping presses.\n• Structural Stress Diagnostics: Using ultrasound and load sensors to spot metal fatigue and impending frame collapse.\n• Power Plant Core Management: Regulating magnetic containment in fusion reactors and antimatter reaction chambers.\n• Heavy Crane & Rigging Mechanics: Calculating counterweights, crane moments, and structural winching limits for massive loads.",
          "specialty_details": [
            {
              "name": "Starship FTL Propulsion",
              "description": "Servicing warp field coils, hyperdrive motivators, and dimensional jump engines."
            },
            {
              "name": "Sublight Thruster Assemblies",
              "description": "Maintaining ion drives, fusion torches, and chemical reaction thrusters."
            },
            {
              "name": "Life Support Systems",
              "description": "Designing and overhauling oxygen scrubbers, hydroponic air loops, and waste recyclers."
            },
            {
              "name": "Civil Infrastructure",
              "description": "Engineering water aqueducts, sewage treatment plants, suspension bridges, and dams."
            },
            {
              "name": "Hydraulics & Pneumatics",
              "description": "Designing high-pressure fluid valves, mechanical pistons, and pneumatic seals."
            },
            {
              "name": "Thermal Dissipation Systems",
              "description": "Engineering reactor cooling loops, cryo-jacket cooling, and radiator fin arrays."
            },
            {
              "name": "Industrial Automation & Assembly",
              "description": "Setting up automated robotic car lines, conveyor feeds, and stamping presses."
            },
            {
              "name": "Structural Stress Diagnostics",
              "description": "Using ultrasound and load sensors to spot metal fatigue and impending frame collapse."
            },
            {
              "name": "Power Plant Core Management",
              "description": "Regulating magnetic containment in fusion reactors and antimatter reaction chambers."
            },
            {
              "name": "Heavy Crane & Rigging Mechanics",
              "description": "Calculating counterweights, crane moments, and structural winching limits for massive loads."
            }
          ],
          "full_text": "### **ENGINEER**\n\n* **Ability:** Intellect  \n* **Description:** Engineering is the skill of using scientific principles to design and build mecha, automata (simple robotics) and similar structures and mechanisms. It reflects a character's ability to apply mathematical and scientific concepts to create new products or improve existing ones. Engineers work in various industries, including mechanical, electrical, computer and architectural skills. Engineering is using various components together to craft something larger and more complex, whereas the components themselves are covered by particular skills such as Mechanical or Electrical.  \n* **Mechanics:**  \n  * *Diagnose Issue:* CR 15 to identify why the Hyperdrive isn't engaging.  \n  * *Boost System:* CR 20 to temporarily increase engine output or shield strength.  \n* **Specialties:**   \n  * **Starship FTL Propulsion:** Servicing warp field coils, hyperdrive motivators, and dimensional jump engines.  \n    * **Sublight Thruster Assemblies:** Maintaining ion drives, fusion torches, and chemical reaction thrusters.  \n    * **Life Support Systems:** Designing and overhauling oxygen scrubbers, hydroponic air loops, and waste recyclers.  \n    * **Civil Infrastructure:** Engineering water aqueducts, sewage treatment plants, suspension bridges, and dams.  \n    * **Hydraulics & Pneumatics:** Designing high-pressure fluid valves, mechanical pistons, and pneumatic seals.  \n    * **Thermal Dissipation Systems:** Engineering reactor cooling loops, cryo-jacket cooling, and radiator fin arrays.  \n    * **Industrial Automation & Assembly:** Setting up automated robotic car lines, conveyor feeds, and stamping presses.  \n    * **Structural Stress Diagnostics:** Using ultrasound and load sensors to spot metal fatigue and impending frame collapse.  \n    * **Power Plant Core Management:** Regulating magnetic containment in fusion reactors and antimatter reaction chambers.  \n    * **Heavy Crane & Rigging Mechanics:** Calculating counterweights, crane moments, and structural winching limits for massive loads.\n\n  ###"
        },
        {
          "name": "Farmer",
          "id": "mental-farmer",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Farmer is the skill of cultivating crops and raising livestock. It reflects a character's ability to manage soil health, plant and harvest crops, and tend to animals. Farmer is used whenever a character needs to produce food, manage agricultural operations, or work with livestock. This can include things like preparing fields, planting seeds, and ensuring animal health.",
          "keywords": "farmer, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Hydroponics & Aeroponics",
            "Broad-Acre Grain Farming",
            "Livestock Husbandry",
            "Soil Chemistry & Fertilization",
            "Agricultural Pest & Fungus Control",
            "Irrigation & Water Rights",
            "Alien Crop Domestication",
            "Greenhouse Environmental Control",
            "Veterinary Care",
            "Harvest Preservation & Silos"
          ],
          "governing_attribute": "Wisdom or Constitution",
          "mechanic": "Governing Ability: Wisdom or Constitution\n\nMechanics:\n• *Crop Management:* CR 15 to ensure a successful harvest despite poor conditions.\n• *Animal Husbandry:* CR 15 to breed or treat livestock.\n• *Soil Analysis:* CR 20 to determine optimal crops for a specific environment.\n\nSpecialties:\n• Hydroponics & Aeroponics: Managing vertical water-nutrient tanks, pH balances, and LED grow-light cycles.\n• Broad-Acre Grain Farming: Operating harvesters, planting vast cereal fields, and timing seasonal crop rotations.\n• Livestock Husbandry: Breeding, grazing, birthing, and caring for domestic cattle, poultry, and alien beasts.\n• Soil Chemistry & Fertilization: Analyzing nitrogen, phosphorus, and organic loam balances to maximize crop yield.\n• Agricultural Pest & Fungus Control: Spraying organic pesticides, deploying weed controls, and countering alien locusts.\n• Irrigation & Water Rights: Digging drainage canals, operating drip-feed lines, and managing agricultural aquifers.\n• Alien Crop Domestication: Cross-breeding native wild plants to engineer edible, high-calorie domestic strains.\n• Greenhouse Environmental Control: Tuning humidity, atmospheric carbon, and thermal ceilings in sealed domes.\n• Veterinary Care: Treating domestic herd infections, setting broken animal limbs, and inoculating against rot.\n• Harvest Preservation & Silos: Drying, fumigating, and storing tons of grain against mildew, rot, and rodent pests.",
          "specialty_details": [
            {
              "name": "Hydroponics & Aeroponics",
              "description": "Managing vertical water-nutrient tanks, pH balances, and LED grow-light cycles."
            },
            {
              "name": "Broad-Acre Grain Farming",
              "description": "Operating harvesters, planting vast cereal fields, and timing seasonal crop rotations."
            },
            {
              "name": "Livestock Husbandry",
              "description": "Breeding, grazing, birthing, and caring for domestic cattle, poultry, and alien beasts."
            },
            {
              "name": "Soil Chemistry & Fertilization",
              "description": "Analyzing nitrogen, phosphorus, and organic loam balances to maximize crop yield."
            },
            {
              "name": "Agricultural Pest & Fungus Control",
              "description": "Spraying organic pesticides, deploying weed controls, and countering alien locusts."
            },
            {
              "name": "Irrigation & Water Rights",
              "description": "Digging drainage canals, operating drip-feed lines, and managing agricultural aquifers."
            },
            {
              "name": "Alien Crop Domestication",
              "description": "Cross-breeding native wild plants to engineer edible, high-calorie domestic strains."
            },
            {
              "name": "Greenhouse Environmental Control",
              "description": "Tuning humidity, atmospheric carbon, and thermal ceilings in sealed domes."
            },
            {
              "name": "Veterinary Care",
              "description": "Treating domestic herd infections, setting broken animal limbs, and inoculating against rot."
            },
            {
              "name": "Harvest Preservation & Silos",
              "description": "Drying, fumigating, and storing tons of grain against mildew, rot, and rodent pests."
            }
          ],
          "full_text": "### **FARMER**\n\n* **Ability:** Wisdom or Constitution  \n* **Description:** Farmer is the skill of cultivating crops and raising livestock. It reflects a character's ability to manage soil health, plant and harvest crops, and tend to animals. Farmer is used whenever a character needs to produce food, manage agricultural operations, or work with livestock. This can include things like preparing fields, planting seeds, and ensuring animal health.  \n* **Mechanics:**  \n  * *Crop Management:* CR 15 to ensure a successful harvest despite poor conditions.  \n  * *Animal Husbandry:* CR 15 to breed or treat livestock.  \n  * *Soil Analysis:* CR 20 to determine optimal crops for a specific environment.  \n* **Specialties:**   \n  * **Hydroponics & Aeroponics:** Managing vertical water-nutrient tanks, pH balances, and LED grow-light cycles.  \n  * **Broad-Acre Grain Farming:** Operating harvesters, planting vast cereal fields, and timing seasonal crop rotations.  \n  * **Livestock Husbandry:** Breeding, grazing, birthing, and caring for domestic cattle, poultry, and alien beasts.  \n  * **Soil Chemistry & Fertilization:** Analyzing nitrogen, phosphorus, and organic loam balances to maximize crop yield.  \n  * **Agricultural Pest & Fungus Control:** Spraying organic pesticides, deploying weed controls, and countering alien locusts.  \n  * **Irrigation & Water Rights:** Digging drainage canals, operating drip-feed lines, and managing agricultural aquifers.  \n  * **Alien Crop Domestication:** Cross-breeding native wild plants to engineer edible, high-calorie domestic strains.  \n  * **Greenhouse Environmental Control:** Tuning humidity, atmospheric carbon, and thermal ceilings in sealed domes.  \n  * **Veterinary Care:** Treating domestic herd infections, setting broken animal limbs, and inoculating against rot.  \n  * **Harvest Preservation & Silos:** Drying, fumigating, and storing tons of grain against mildew, rot, and rodent pests.\n\n###"
        },
        {
          "name": "Groundskeeper",
          "id": "mental-groundskeeper",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Groundskeeper is the skill of managing and maintaining outdoor spaces, such as parks or gardens. It reflects a character's ability to mow lawns, trim hedges, plant flowers, and maintain other outdoor features. Groundskeepers are responsible for ensuring that outdoor spaces are safe, functional, and aesthetically pleasing. This can include things like mowing lawns, trimming hedges, and planting flowers.",
          "keywords": "groundskeeper, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Landscape Gardening",
            "Arboriculture & Tree Surgery",
            "Estate Hardscaping",
            "Turf & Heavy Lawn Machinery",
            "Invasive Flora Eradication",
            "Drainage & Erosion Control",
            "Greenhouse Maintenance",
            "Park & Plaza Sanitation",
            "Soil & Mulch Composting",
            "Planetary Terraforming Planting"
          ],
          "governing_attribute": "Wisdom or Constitution",
          "mechanic": "Governing Ability: Wisdom or Constitution\n\nMechanics:\n• *Cultivate:* CR 15 to grow specific plants in a hostile environment.\n• *Terraform:* CR 25 to operate large scale atmosphere processors.\n\nSpecialties:\n• Landscape Gardening: Designing flower beds, trimming hedges, laying sod, and styling ornamental gardens.\n• Arboriculture & Tree Surgery: Felling dangerous deadwood, pruning high branches, and treating tree infections.\n• Estate Hardscaping: Laying stone pathways, building retaining walls, patio pavings, and ornamental fountains.\n• Turf & Heavy Lawn Machinery: Operating commercial ride-on mowers, aerators, dethatchers, and turf rollers.\n• Invasive Flora Eradication: Identifying and systematically poisoning or uprooting choking alien weeds and vines.\n• Drainage & Erosion Control: Installing French drains, grading soil swales, and planting grass to prevent mudslides.\n• Greenhouse Maintenance: Managing glass hygiene, misting systems, and soil heating cables for rare shrubs.\n• Park & Plaza Sanitation: Clearing public leaves, emptying waste receptacles, and pressure-washing stone avenues.\n• Soil & Mulch Composting: Managing thermal compost piles, shredding yard waste, and top-dressing garden beds.\n• Planetary Terraforming Planting: Seeding hardy lichen and scrub bushes across barren rocky ground to build topsoil.",
          "specialty_details": [
            {
              "name": "Landscape Gardening",
              "description": "Designing flower beds, trimming hedges, laying sod, and styling ornamental gardens."
            },
            {
              "name": "Arboriculture & Tree Surgery",
              "description": "Felling dangerous deadwood, pruning high branches, and treating tree infections."
            },
            {
              "name": "Estate Hardscaping",
              "description": "Laying stone pathways, building retaining walls, patio pavings, and ornamental fountains."
            },
            {
              "name": "Turf & Heavy Lawn Machinery",
              "description": "Operating commercial ride-on mowers, aerators, dethatchers, and turf rollers."
            },
            {
              "name": "Invasive Flora Eradication",
              "description": "Identifying and systematically poisoning or uprooting choking alien weeds and vines."
            },
            {
              "name": "Drainage & Erosion Control",
              "description": "Installing French drains, grading soil swales, and planting grass to prevent mudslides."
            },
            {
              "name": "Greenhouse Maintenance",
              "description": "Managing glass hygiene, misting systems, and soil heating cables for rare shrubs."
            },
            {
              "name": "Park & Plaza Sanitation",
              "description": "Clearing public leaves, emptying waste receptacles, and pressure-washing stone avenues."
            },
            {
              "name": "Soil & Mulch Composting",
              "description": "Managing thermal compost piles, shredding yard waste, and top-dressing garden beds."
            },
            {
              "name": "Planetary Terraforming Planting",
              "description": "Seeding hardy lichen and scrub bushes across barren rocky ground to build topsoil."
            }
          ],
          "full_text": "### **GROUNDSKEEPER**\n\n* **Ability:** Wisdom or Constitution  \n* **Description:** Groundskeeper is the skill of managing and maintaining outdoor spaces, such as parks or gardens. It reflects a character's ability to mow lawns, trim hedges, plant flowers, and maintain other outdoor features. Groundskeepers are responsible for ensuring that outdoor spaces are safe, functional, and aesthetically pleasing. This can include things like mowing lawns, trimming hedges, and planting flowers.  \n* **Mechanics:**  \n  * *Cultivate:* CR 15 to grow specific plants in a hostile environment.  \n  * *Terraform:* CR 25 to operate large scale atmosphere processors.  \n* **Specialties:**   \n  * **Landscape Gardening:** Designing flower beds, trimming hedges, laying sod, and styling ornamental gardens.  \n    * **Arboriculture & Tree Surgery:** Felling dangerous deadwood, pruning high branches, and treating tree infections.  \n    * **Estate Hardscaping:** Laying stone pathways, building retaining walls, patio pavings, and ornamental fountains.  \n    * **Turf & Heavy Lawn Machinery:** Operating commercial ride-on mowers, aerators, dethatchers, and turf rollers.  \n    * **Invasive Flora Eradication:** Identifying and systematically poisoning or uprooting choking alien weeds and vines.  \n    * **Drainage & Erosion Control:** Installing French drains, grading soil swales, and planting grass to prevent mudslides.  \n    * **Greenhouse Maintenance:** Managing glass hygiene, misting systems, and soil heating cables for rare shrubs.  \n    * **Park & Plaza Sanitation:** Clearing public leaves, emptying waste receptacles, and pressure-washing stone avenues.  \n    * **Soil & Mulch Composting:** Managing thermal compost piles, shredding yard waste, and top-dressing garden beds.  \n    * **Planetary Terraforming Planting:** Seeding hardy lichen and scrub bushes across barren rocky ground to build topsoil.\n\n  ###"
        },
        {
          "name": "Handler",
          "id": "mental-handler",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Training and controlling animals or beasts.",
          "keywords": "handler, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Riding Mount Training",
            "Combat Attack Training",
            "Beast Calming & De-Escalation",
            "Scent & Tracking Hounds",
            "Working Draft Animals",
            "Exotic Alien Pet Taming",
            "Avian & Flying Mount Handling",
            "Livestock Herding",
            "Behavioral Obedience",
            "Zoological Caging & Transport"
          ],
          "governing_attribute": "Charisma or Wisdom",
          "mechanic": "Governing Ability: Charisma or Wisdom\n\nMechanics:\n• *Train:* Long-term check to teach a creature a trick (CR 15-25).\n• *Control:* CR 15 to calm a spooked animal; CR 20 to command an attacking beast.\n\nSpecialties:\n• Riding Mount Training: Breaking, saddling, and training equines, alien lizards, and quadrupeds for riding.\n• Combat Attack Training: Teaching canines and alien predators to bite on command, hold targets, and ignore gunfire.\n• Beast Calming & De-Escalation: Approaching spooked, aggressive, or wounded wild beasts without triggering an attack.\n• Scent & Tracking Hounds: Directing tracking packs to follow faint prey scent trails over difficult wilderness.\n• Working Draft Animals: Harnessing oxen and pack beasts to pull heavy wagons, plows, and artillery pieces.\n• Exotic Alien Pet Taming: Conditioning unpredictable wild fauna to live peacefully in domestic environments.\n• Avian & Flying Mount Handling: Training hawks, flying reptiles, or gliders for scouting, hunting, and aerial message delivery.\n• Livestock Herding: Maneuvering cattle and sheep herds across open ranges using whistles, mounts, and whips.\n• Behavioral Obedience: Teaching complex domestic commands, tricks, and retrieval habits to working creatures.\n• Zoological Caging & Transport: Safely securing, crating, tranquilizing, and moving massive apex predators.",
          "specialty_details": [
            {
              "name": "Riding Mount Training",
              "description": "Breaking, saddling, and training equines, alien lizards, and quadrupeds for riding."
            },
            {
              "name": "Combat Attack Training",
              "description": "Teaching canines and alien predators to bite on command, hold targets, and ignore gunfire."
            },
            {
              "name": "Beast Calming & De-Escalation",
              "description": "Approaching spooked, aggressive, or wounded wild beasts without triggering an attack."
            },
            {
              "name": "Scent & Tracking Hounds",
              "description": "Directing tracking packs to follow faint prey scent trails over difficult wilderness."
            },
            {
              "name": "Working Draft Animals",
              "description": "Harnessing oxen and pack beasts to pull heavy wagons, plows, and artillery pieces."
            },
            {
              "name": "Exotic Alien Pet Taming",
              "description": "Conditioning unpredictable wild fauna to live peacefully in domestic environments."
            },
            {
              "name": "Avian & Flying Mount Handling",
              "description": "Training hawks, flying reptiles, or gliders for scouting, hunting, and aerial message delivery."
            },
            {
              "name": "Livestock Herding",
              "description": "Maneuvering cattle and sheep herds across open ranges using whistles, mounts, and whips."
            },
            {
              "name": "Behavioral Obedience",
              "description": "Teaching complex domestic commands, tricks, and retrieval habits to working creatures."
            },
            {
              "name": "Zoological Caging & Transport",
              "description": "Safely securing, crating, tranquilizing, and moving massive apex predators."
            }
          ],
          "full_text": "### **HANDLER**\n\n* **Ability:** Charisma or Wisdom  \n* **Description:** Training and controlling animals or beasts.  \n* **Mechanics:**  \n  * *Train:* Long-term check to teach a creature a trick (CR 15-25).  \n  * *Control:* CR 15 to calm a spooked animal; CR 20 to command an attacking beast.  \n* **Specialties:**   \n  * **Riding Mount Training:** Breaking, saddling, and training equines, alien lizards, and quadrupeds for riding.  \n    * **Combat Attack Training:** Teaching canines and alien predators to bite on command, hold targets, and ignore gunfire.  \n    * **Beast Calming & De-Escalation:** Approaching spooked, aggressive, or wounded wild beasts without triggering an attack.  \n    * **Scent & Tracking Hounds:** Directing tracking packs to follow faint prey scent trails over difficult wilderness.  \n    * **Working Draft Animals:** Harnessing oxen and pack beasts to pull heavy wagons, plows, and artillery pieces.  \n    * **Exotic Alien Pet Taming:** Conditioning unpredictable wild fauna to live peacefully in domestic environments.  \n    * **Avian & Flying Mount Handling:** Training hawks, flying reptiles, or gliders for scouting, hunting, and aerial message delivery.  \n    * **Livestock Herding:** Maneuvering cattle and sheep herds across open ranges using whistles, mounts, and whips.  \n    * **Behavioral Obedience:** Teaching complex domestic commands, tricks, and retrieval habits to working creatures.  \n    * **Zoological Caging & Transport:** Safely securing, crating, tranquilizing, and moving massive apex predators."
        },
        {
          "name": "Laborer",
          "id": "mental-laborer",
          "group": "mental",
          "baseAttr": "attr-strength",
          "description": "Laborer is the skill of performing manual tasks, such as digging ditches, carrying heavy objects, or building structures. It reflects a character's ability to perform physical labor and complete tasks that require strength and endurance. Workers are responsible for completing manual tasks safely and efficiently. This can include things like digging ditches, carrying heavy objects, and building structures. Laborers will be knowledgeable of various tools and equipment of the trade.",
          "keywords": "laborer, mental, strength, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Dockworking & Stevedoring",
            "Deep Shaft Mining",
            "Heavy Demolition Work",
            "Concrete & Composite Pouring",
            "Scaffolding Erection",
            "Manual Trenching & Shoveling",
            "Power Loader & Exosuit Labor",
            "Hazardous Waste Mucking",
            "High-G/Zero-G Physical Toil",
            "Industrial Site Rigging"
          ],
          "governing_attribute": "Strength or Constitution",
          "mechanic": "Governing Ability: Strength or Constitution\n\nMechanics:\n• *Endurance Work:* CR 15 to work a double shift without fatigue.\n• *Operate Heavy Machinery:* CR 10 to use forklifts, drills, or exosuits for work (not combat).\n\nSpecialties:\n• Dockworking & Stevedoring: Unloading shipping containers, rigging cranes, and securing cargo nets on docks.\n• Deep Shaft Mining: Wielding jackhammers, swinging pickaxes, mucking ore, and timbering mine shafts.\n• Heavy Demolition Work: Smashing concrete with sledgehammers, cutting rebar, and hauling industrial rubble.\n• Concrete & Composite Pouring: Screeding wet concrete slabs, vibrating forms to clear air pockets, and raking gravel.\n• Scaffolding Erection: Clamping metal poles, laying wooden walk-boards, and anchoring safety harnesses on high walls.\n• Manual Trenching & Shoveling: Digging deep pipeline trenches, earthworks, and defense berms with shovels.\n• Power Loader & Exosuit Labor: Operating industrial hydraulic lifter rigs to move multi-ton shipping crates.\n• Hazardous Waste Mucking: Shoveling toxic slag, cleaning out chemical sludge tanks, and handling contaminated soot.\n• High-G/Zero-G Physical Toil: Shifting heavy mass under crushing high gravity or anchoring oneself while handling bulk in zero-G.\n• Industrial Site Rigging: Inspecting steel wire ropes, slinging chains, and directing forklift drivers via hand signs.",
          "specialty_details": [
            {
              "name": "Dockworking & Stevedoring",
              "description": "Unloading shipping containers, rigging cranes, and securing cargo nets on docks."
            },
            {
              "name": "Deep Shaft Mining",
              "description": "Wielding jackhammers, swinging pickaxes, mucking ore, and timbering mine shafts."
            },
            {
              "name": "Heavy Demolition Work",
              "description": "Smashing concrete with sledgehammers, cutting rebar, and hauling industrial rubble."
            },
            {
              "name": "Concrete & Composite Pouring",
              "description": "Screeding wet concrete slabs, vibrating forms to clear air pockets, and raking gravel."
            },
            {
              "name": "Scaffolding Erection",
              "description": "Clamping metal poles, laying wooden walk-boards, and anchoring safety harnesses on high walls."
            },
            {
              "name": "Manual Trenching & Shoveling",
              "description": "Digging deep pipeline trenches, earthworks, and defense berms with shovels."
            },
            {
              "name": "Power Loader & Exosuit Labor",
              "description": "Operating industrial hydraulic lifter rigs to move multi-ton shipping crates."
            },
            {
              "name": "Hazardous Waste Mucking",
              "description": "Shoveling toxic slag, cleaning out chemical sludge tanks, and handling contaminated soot."
            },
            {
              "name": "High-G/Zero-G Physical Toil",
              "description": "Shifting heavy mass under crushing high gravity or anchoring oneself while handling bulk in zero-G."
            },
            {
              "name": "Industrial Site Rigging",
              "description": "Inspecting steel wire ropes, slinging chains, and directing forklift drivers via hand signs."
            }
          ],
          "full_text": "### **LABORER**\n\n* **Ability:** Strength or Constitution  \n* **Description:** Laborer is the skill of performing manual tasks, such as digging ditches, carrying heavy objects, or building structures. It reflects a character's ability to perform physical labor and complete tasks that require strength and endurance. Workers are responsible for completing manual tasks safely and efficiently. This can include things like digging ditches, carrying heavy objects, and building structures. Laborers will be knowledgeable of various tools and equipment of the trade.  \n* **Mechanics:**  \n  * *Endurance Work:* CR 15 to work a double shift without fatigue.  \n  * *Operate Heavy Machinery:* CR 10 to use forklifts, drills, or exosuits for work (not combat).  \n* **Specialties:**   \n  * **Dockworking & Stevedoring:** Unloading shipping containers, rigging cranes, and securing cargo nets on docks.  \n    * **Deep Shaft Mining:** Wielding jackhammers, swinging pickaxes, mucking ore, and timbering mine shafts.  \n    * **Heavy Demolition Work:** Smashing concrete with sledgehammers, cutting rebar, and hauling industrial rubble.  \n    * **Concrete & Composite Pouring:** Screeding wet concrete slabs, vibrating forms to clear air pockets, and raking gravel.  \n    * **Scaffolding Erection:** Clamping metal poles, laying wooden walk-boards, and anchoring safety harnesses on high walls.  \n    * **Manual Trenching & Shoveling:** Digging deep pipeline trenches, earthworks, and defense berms with shovels.  \n    * **Power Loader & Exosuit Labor:** Operating industrial hydraulic lifter rigs to move multi-ton shipping crates.  \n    * **Hazardous Waste Mucking:** Shoveling toxic slag, cleaning out chemical sludge tanks, and handling contaminated soot.  \n    * **High-G/Zero-G Physical Toil:** Shifting heavy mass under crushing high gravity or anchoring oneself while handling bulk in zero-G.  \n    * **Industrial Site Rigging:** Inspecting steel wire ropes, slinging chains, and directing forklift drivers via hand signs.\n\n  ###"
        },
        {
          "name": "Mechanic",
          "id": "mental-mechanic",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Mechanic is the skill of repairing and maintaining components of machines and vehicles. It reflects a character's ability to diagnose and fix mechanical problems, and to perform routine maintenance tasks. Mechanics are responsible for ensuring machines and vehicles are safe and functional. This can include things like repairing engines, replacing parts, and performing oil changes.",
          "keywords": "mechanic, mental, intellect, cognitive, expertise, vehicle",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Internal Combustion Engines",
            "Turbines & Jet Propulsion",
            "Drive Train & Transmission",
            "Pneumatic & Hydraulic Actuators",
            "Suspension & Steering Systems",
            "Chassis & Body Fabrication",
            "Cooling & Radiator Systems",
            "Jury-Rigged Field Repairs",
            "Machine Shop Lathe Tooling",
            "Heavy Construction Equipment"
          ],
          "governing_attribute": "Agility or Intellect",
          "mechanic": "Governing Ability: Agility or Intellect\n\nMechanics:\n• *Repair:* CR 15 (Simple part) to CR 30 (Rebuild engine).\n• *Jury-Rig:* CR 20 to make a temporary fix with inadequate tools (lasts 1d6 hours).\n\nSpecialties:\n• Internal Combustion Engines: Rebuilding piston engines, tuning carburetors, timing camshafts, and replacing spark plugs.\n• Turbines & Jet Propulsion: Balancing compressor blades, repairing fuel injectors, and rebuilding jet burner cans.\n• Drive Train & Transmission: Replacing clutches, rebuilding planetary gearboxes, and balancing drive shafts.\n• Pneumatic & Hydraulic Actuators: Replacing blown hydraulic seals, flushing dirty brake fluid, and rebuilding rams.\n• Suspension & Steering Systems: Aligning tie-rods, replacing heavy coil springs, and servicing ball joints.\n• Chassis & Body Fabrication: Cutting out rusted sheet metal, bending roll cages, and MIG/TIG welding frames.\n• Cooling & Radiator Systems: Flushing clogged water jackets, replacing water pumps, and soldering leaking cores.\n• Jury-Rigged Field Repairs: Patching split hoses with duct tape, bypassing busted valves, and getting rigs running on scrap.\n• Machine Shop Lathe Tooling: Turning metal axles on manual lathes and milling custom replacement brackets from steel billet.\n• Heavy Construction Equipment: Servicing bulldozers, tracked excavators, and industrial rock crushers.",
          "specialty_details": [
            {
              "name": "Internal Combustion Engines",
              "description": "Rebuilding piston engines, tuning carburetors, timing camshafts, and replacing spark plugs."
            },
            {
              "name": "Turbines & Jet Propulsion",
              "description": "Balancing compressor blades, repairing fuel injectors, and rebuilding jet burner cans."
            },
            {
              "name": "Drive Train & Transmission",
              "description": "Replacing clutches, rebuilding planetary gearboxes, and balancing drive shafts."
            },
            {
              "name": "Pneumatic & Hydraulic Actuators",
              "description": "Replacing blown hydraulic seals, flushing dirty brake fluid, and rebuilding rams."
            },
            {
              "name": "Suspension & Steering Systems",
              "description": "Aligning tie-rods, replacing heavy coil springs, and servicing ball joints."
            },
            {
              "name": "Chassis & Body Fabrication",
              "description": "Cutting out rusted sheet metal, bending roll cages, and MIG/TIG welding frames."
            },
            {
              "name": "Cooling & Radiator Systems",
              "description": "Flushing clogged water jackets, replacing water pumps, and soldering leaking cores."
            },
            {
              "name": "Jury-Rigged Field Repairs",
              "description": "Patching split hoses with duct tape, bypassing busted valves, and getting rigs running on scrap."
            },
            {
              "name": "Machine Shop Lathe Tooling",
              "description": "Turning metal axles on manual lathes and milling custom replacement brackets from steel billet."
            },
            {
              "name": "Heavy Construction Equipment",
              "description": "Servicing bulldozers, tracked excavators, and industrial rock crushers."
            }
          ],
          "full_text": "### **MECHANIC**\n\n* **Ability:** Agility or Intellect  \n* **Description:** Mechanic is the skill of repairing and maintaining components of machines and vehicles. It reflects a character's ability to diagnose and fix mechanical problems, and to perform routine maintenance tasks. Mechanics are responsible for ensuring machines and vehicles are safe and functional. This can include things like repairing engines, replacing parts, and performing oil changes.   \n* **Mechanics:**  \n  * *Repair:* CR 15 (Simple part) to CR 30 (Rebuild engine).  \n  * *Jury-Rig:* CR 20 to make a temporary fix with inadequate tools (lasts 1d6 hours).  \n* **Specialties:**   \n  * **Internal Combustion Engines:** Rebuilding piston engines, tuning carburetors, timing camshafts, and replacing spark plugs.  \n    * **Turbines & Jet Propulsion:** Balancing compressor blades, repairing fuel injectors, and rebuilding jet burner cans.  \n    * **Drive Train & Transmission:** Replacing clutches, rebuilding planetary gearboxes, and balancing drive shafts.  \n    * **Pneumatic & Hydraulic Actuators:** Replacing blown hydraulic seals, flushing dirty brake fluid, and rebuilding rams.  \n    * **Suspension & Steering Systems:** Aligning tie-rods, replacing heavy coil springs, and servicing ball joints.  \n    * **Chassis & Body Fabrication:** Cutting out rusted sheet metal, bending roll cages, and MIG/TIG welding frames.  \n    * **Cooling & Radiator Systems:** Flushing clogged water jackets, replacing water pumps, and soldering leaking cores.  \n    * **Jury-Rigged Field Repairs:** Patching split hoses with duct tape, bypassing busted valves, and getting rigs running on scrap.  \n    * **Machine Shop Lathe Tooling:** Turning metal axles on manual lathes and milling custom replacement brackets from steel billet.  \n    * **Heavy Construction Equipment:** Servicing bulldozers, tracked excavators, and industrial rock crushers.\n\n  ###"
        },
        {
          "name": "Researcher",
          "id": "mental-researcher",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Researcher is the skill of conducting research and analyzing data. It reflects a character's ability to gather information, analyze it, and draw conclusions. Researchers are responsible for ensuring that information is accurate and reliable. This can include things like conducting surveys, analyzing data, and writing reports.",
          "keywords": "researcher, mental, intellect, cognitive, expertise, academic",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Experimental Design",
            "Empirical Data Modeling",
            "Field Specimen Collection",
            "Literature Review & Meta-Analysis",
            "Hypothesis Testing",
            "Statistical Error Auditing",
            "AI Model Validation",
            "Laboratory Safety Management",
            "Grant Proposal Drafting",
            "Peer-Reviewed Publishing"
          ],
          "governing_attribute": "Intellect",
          "mechanic": "Governing Ability: Intellect\n\nMechanics:\n• *Conduct Experiment:* CR 20 to test a hypothesis.\n• *Synthesize Data:* CR 15 to combine multiple clues into a theory.\n\nSpecialties:\n• Experimental Design: Structuring double-blind trials, control groups, and repeatable lab procedures.\n• Empirical Data Modeling: Plotting statistical regressions, identifying standard deviations, and mapping anomalies.\n• Field Specimen Collection: Sampling alien soils, extracting sterile blood samples, and gathering core geological drills.\n• Literature Review & Meta-Analysis: Reviewing thousands of published academic white papers to summarize states of knowledge.\n• Hypothesis Testing: Designing targeted scientific trials to systematically prove or disprove empirical claims.\n• Statistical Error Auditing: Spotting mathematical flukes, sample biases, and p-hacking in submitted studies.\n• AI Model Validation: Testing machine-learning models against sanitized datasets to prevent algorithmic hallucinations.\n• Laboratory Safety Management: Managing biosafety level 4 containment seals, chemical hoods, and emergency eye-washes.\n• Grant Proposal Drafting: Writing persuasive, highly structured technical pitches to secure research funding.\n• Peer-Reviewed Publishing: Drafting concise abstracts, figures, and methodology sections for publication.",
          "specialty_details": [
            {
              "name": "Experimental Design",
              "description": "Structuring double-blind trials, control groups, and repeatable lab procedures."
            },
            {
              "name": "Empirical Data Modeling",
              "description": "Plotting statistical regressions, identifying standard deviations, and mapping anomalies."
            },
            {
              "name": "Field Specimen Collection",
              "description": "Sampling alien soils, extracting sterile blood samples, and gathering core geological drills."
            },
            {
              "name": "Literature Review & Meta-Analysis",
              "description": "Reviewing thousands of published academic white papers to summarize states of knowledge."
            },
            {
              "name": "Hypothesis Testing",
              "description": "Designing targeted scientific trials to systematically prove or disprove empirical claims."
            },
            {
              "name": "Statistical Error Auditing",
              "description": "Spotting mathematical flukes, sample biases, and p-hacking in submitted studies."
            },
            {
              "name": "AI Model Validation",
              "description": "Testing machine-learning models against sanitized datasets to prevent algorithmic hallucinations."
            },
            {
              "name": "Laboratory Safety Management",
              "description": "Managing biosafety level 4 containment seals, chemical hoods, and emergency eye-washes."
            },
            {
              "name": "Grant Proposal Drafting",
              "description": "Writing persuasive, highly structured technical pitches to secure research funding."
            },
            {
              "name": "Peer-Reviewed Publishing",
              "description": "Drafting concise abstracts, figures, and methodology sections for publication."
            }
          ],
          "full_text": "### **RESEARCHER**\n\n* **Ability:** Intellect  \n* **Description:** Researcher is the skill of conducting research and analyzing data. It reflects a character's ability to gather information, analyze it, and draw conclusions. Researchers are responsible for ensuring that information is accurate and reliable. This can include things like conducting surveys, analyzing data, and writing reports.  \n* **Mechanics:**  \n  * *Conduct Experiment:* CR 20 to test a hypothesis.  \n  * *Synthesize Data:* CR 15 to combine multiple clues into a theory.  \n* **Specialties:**   \n  * **Experimental Design:** Structuring double-blind trials, control groups, and repeatable lab procedures.  \n    * **Empirical Data Modeling:** Plotting statistical regressions, identifying standard deviations, and mapping anomalies.  \n    * **Field Specimen Collection:** Sampling alien soils, extracting sterile blood samples, and gathering core geological drills.  \n    * **Literature Review & Meta-Analysis:** Reviewing thousands of published academic white papers to summarize states of knowledge.  \n    * **Hypothesis Testing:** Designing targeted scientific trials to systematically prove or disprove empirical claims.  \n    * **Statistical Error Auditing:** Spotting mathematical flukes, sample biases, and p-hacking in submitted studies.  \n    * **AI Model Validation:** Testing machine-learning models against sanitized datasets to prevent algorithmic hallucinations.  \n    * **Laboratory Safety Management:** Managing biosafety level 4 containment seals, chemical hoods, and emergency eye-washes.  \n    * **Grant Proposal Drafting:** Writing persuasive, highly structured technical pitches to secure research funding.  \n    * **Peer-Reviewed Publishing:** Drafting concise abstracts, figures, and methodology sections for publication.\n\n  ###"
        },
        {
          "name": "Salvager",
          "id": "mental-salvager",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Salvager is the skill of salvaging materials or items from wrecked or damaged ships, buildings, or other structures. It reflects a character's ability to identify and extract valuable materials or items from damaged structures. Salvagers are responsible for ensuring that materials or items are extracted safely and efficiently. This can include things like salvaging metal from a shipwreck, or extracting valuable items from a damaged building.",
          "keywords": "salvager, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Deep Space Derelict Cutting",
            "Structural Stabilization",
            "Hazardous Reactor Extraction",
            "Component De-Installation",
            "Scrap Metal Grading",
            "Underwater Wreck Salvage",
            "Urban Ruin Scavenging",
            "Rigging & Cargo Extraction",
            "Booby-Trap & Hazard Spotting",
            "Black-Market Salvage Washing"
          ],
          "governing_attribute": "Wisdom or Intellect",
          "mechanic": "Governing Ability: Wisdom or Intellect\n\nMechanics:\n• *Valuation:* CR 15 to know if a piece of junk is worth credits.\n• *Extraction:* CR 20 to remove a component without breaking it.\n\nSpecialties:\n• Deep Space Derelict Cutting: Using industrial plasma torches to slice open airless starship hulls and structural spines.\n• Structural Stabilization: Bracing sagging ship decks and collapsed buildings with jacks to prevent crushing collapses.\n• Hazardous Reactor Extraction: Pulling volatile, leaking nuclear or antimatter cores out of wrecks without containment failure.\n• Component De-Installation: Unbolting high-value avionics, computers, and sensors cleanly without torching the circuits.\n• Scrap Metal Grading: Sorting high-value titanium, platinum wire, and hyper-alloys from low-value structural slag iron.\n• Underwater Wreck Salvage: Rigging lift balloons, operating sub-sea cutting torches, and pulling cargo from ocean beds.\n• Urban Ruin Scavenging: Picking clean abandoned skyscrapers and military bases for copper, wires, and functioning tech.\n• Rigging & Cargo Extraction: Winching crushed freight containers out of twisted starship holds using cables.\n• Booby-Trap & Hazard Spotting: Detecting unexploded ordinance, pressurized fuel lines, and live wiring in mangled wrecks.\n• Black-Market Salvage Washing: Grinding off corporate serial numbers, transponder tags, and repainting recovered machinery.",
          "specialty_details": [
            {
              "name": "Deep Space Derelict Cutting",
              "description": "Using industrial plasma torches to slice open airless starship hulls and structural spines."
            },
            {
              "name": "Structural Stabilization",
              "description": "Bracing sagging ship decks and collapsed buildings with jacks to prevent crushing collapses."
            },
            {
              "name": "Hazardous Reactor Extraction",
              "description": "Pulling volatile, leaking nuclear or antimatter cores out of wrecks without containment failure."
            },
            {
              "name": "Component De-Installation",
              "description": "Unbolting high-value avionics, computers, and sensors cleanly without torching the circuits."
            },
            {
              "name": "Scrap Metal Grading",
              "description": "Sorting high-value titanium, platinum wire, and hyper-alloys from low-value structural slag iron."
            },
            {
              "name": "Underwater Wreck Salvage",
              "description": "Rigging lift balloons, operating sub-sea cutting torches, and pulling cargo from ocean beds."
            },
            {
              "name": "Urban Ruin Scavenging",
              "description": "Picking clean abandoned skyscrapers and military bases for copper, wires, and functioning tech."
            },
            {
              "name": "Rigging & Cargo Extraction",
              "description": "Winching crushed freight containers out of twisted starship holds using cables."
            },
            {
              "name": "Booby-Trap & Hazard Spotting",
              "description": "Detecting unexploded ordinance, pressurized fuel lines, and live wiring in mangled wrecks."
            },
            {
              "name": "Black-Market Salvage Washing",
              "description": "Grinding off corporate serial numbers, transponder tags, and repainting recovered machinery."
            }
          ],
          "full_text": "### **SALVAGER**\n\n* **Ability:** Wisdom or Intellect  \n* **Description:** Salvager is the skill of salvaging materials or items from wrecked or damaged ships, buildings, or other structures. It reflects a character's ability to identify and extract valuable materials or items from damaged structures. Salvagers are responsible for ensuring that materials or items are extracted safely and efficiently. This can include things like salvaging metal from a shipwreck, or extracting valuable items from a damaged building.   \n* **Mechanics:**  \n  * *Valuation:* CR 15 to know if a piece of junk is worth credits.  \n  * *Extraction:* CR 20 to remove a component without breaking it.  \n* **Specialties:**   \n  * **Deep Space Derelict Cutting:** Using industrial plasma torches to slice open airless starship hulls and structural spines.  \n    * **Structural Stabilization:** Bracing sagging ship decks and collapsed buildings with jacks to prevent crushing collapses.  \n    * **Hazardous Reactor Extraction:** Pulling volatile, leaking nuclear or antimatter cores out of wrecks without containment failure.  \n    * **Component De-Installation:** Unbolting high-value avionics, computers, and sensors cleanly without torching the circuits.  \n    * **Scrap Metal Grading:** Sorting high-value titanium, platinum wire, and hyper-alloys from low-value structural slag iron.  \n    * **Underwater Wreck Salvage:** Rigging lift balloons, operating sub-sea cutting torches, and pulling cargo from ocean beds.  \n    * **Urban Ruin Scavenging:** Picking clean abandoned skyscrapers and military bases for copper, wires, and functioning tech.  \n    * **Rigging & Cargo Extraction:** Winching crushed freight containers out of twisted starship holds using cables.  \n    * **Booby-Trap & Hazard Spotting:** Detecting unexploded ordinance, pressurized fuel lines, and live wiring in mangled wrecks.  \n    * **Black-Market Salvage Washing:** Grinding off corporate serial numbers, transponder tags, and repainting recovered machinery.\n\n  ###"
        },
        {
          "name": "Soldier",
          "id": "mental-soldier",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Knowledge of military life, hierarchy, logistics, and field procedures. Does *not* replace Combat skills (shooting/hitting), but covers the *job* of being a soldier.",
          "keywords": "soldier, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Field Gear Maintenance",
            "Military Regulations & Law",
            "Drill & Formation Marching",
            "Entrenchment & Sandbagging",
            "Guard Duty & Perimeter Security",
            "Field Bivouac Setup",
            "Combat Communications Protocol",
            "Unit Cohesion & Morale",
            "Escort Formations",
            "Bayonet & Close-Quarters Drill"
          ],
          "governing_attribute": "Constitution or Intellect",
          "mechanic": "Governing Ability: Constitution or Intellect\n\nMechanics:\n• *Regulations:* CR 10 to know the rules of engagement.\n• *Field Maintenance:* CR 15 to clean and maintain gear in the field.\n• *Drill:* CR 15 to march or coordinate a squad efficiently.\n\nSpecialties:\n• Field Gear Maintenance: Stripping, cleaning, and oiling service rifles, boots, and webbing to military inspection code.\n• Military Regulations & Law: Knowing the rules of engagement, uniform codes, lawful orders, and court-martial laws.\n• Drill & Formation Marching: Moving in tight lock-step formations, reacting instantly to parade and field whistle blasts.\n• Entrenchment & Sandbagging: Digging fighting holes, revetting trench walls, and filling sandbags to build firebases.\n• Guard Duty & Perimeter Security: Standing alert night watches, checking sentry passwords, and challenging intruders.\n• Field Bivouac Setup: Pitching squad tents, setting up perimeter trip-flares, and digging field latrines to hygiene specs.\n• Combat Communications Protocol: Speaking in standardized radio brevity codes, call signs, and reporting coordinates clearly.\n• Unit Cohesion & Morale: Supporting squadmates through combat fatigue, suppression panic, and the horrors of war.\n• Escort Formations: Walking security perimeters around supply convoys, VIP officers, and artillery pieces.\n• Bayonet & Close-Quarters Drill: Executing textbook thrusts, butt-strokes, and rifle parries in tight trench combat.",
          "specialty_details": [
            {
              "name": "Field Gear Maintenance",
              "description": "Stripping, cleaning, and oiling service rifles, boots, and webbing to military inspection code."
            },
            {
              "name": "Military Regulations & Law",
              "description": "Knowing the rules of engagement, uniform codes, lawful orders, and court-martial laws."
            },
            {
              "name": "Drill & Formation Marching",
              "description": "Moving in tight lock-step formations, reacting instantly to parade and field whistle blasts."
            },
            {
              "name": "Entrenchment & Sandbagging",
              "description": "Digging fighting holes, revetting trench walls, and filling sandbags to build firebases."
            },
            {
              "name": "Guard Duty & Perimeter Security",
              "description": "Standing alert night watches, checking sentry passwords, and challenging intruders."
            },
            {
              "name": "Field Bivouac Setup",
              "description": "Pitching squad tents, setting up perimeter trip-flares, and digging field latrines to hygiene specs."
            },
            {
              "name": "Combat Communications Protocol",
              "description": "Speaking in standardized radio brevity codes, call signs, and reporting coordinates clearly."
            },
            {
              "name": "Unit Cohesion & Morale",
              "description": "Supporting squadmates through combat fatigue, suppression panic, and the horrors of war."
            },
            {
              "name": "Escort Formations",
              "description": "Walking security perimeters around supply convoys, VIP officers, and artillery pieces."
            },
            {
              "name": "Bayonet & Close-Quarters Drill",
              "description": "Executing textbook thrusts, butt-strokes, and rifle parries in tight trench combat."
            }
          ],
          "full_text": "### **SOLDIER**\n\n* **Ability:** Constitution or Intellect  \n* **Description:** Knowledge of military life, hierarchy, logistics, and field procedures. Does *not* replace Combat skills (shooting/hitting), but covers the *job* of being a soldier.  \n* **Mechanics:**  \n  * *Regulations:* CR 10 to know the rules of engagement.  \n  * *Field Maintenance:* CR 15 to clean and maintain gear in the field.  \n  * *Drill:* CR 15 to march or coordinate a squad efficiently.  \n* **Specialties:**   \n  * **Field Gear Maintenance:** Stripping, cleaning, and oiling service rifles, boots, and webbing to military inspection code.  \n    * **Military Regulations & Law:** Knowing the rules of engagement, uniform codes, lawful orders, and court-martial laws.  \n    * **Drill & Formation Marching:** Moving in tight lock-step formations, reacting instantly to parade and field whistle blasts.  \n    * **Entrenchment & Sandbagging:** Digging fighting holes, revetting trench walls, and filling sandbags to build firebases.  \n    * **Guard Duty & Perimeter Security:** Standing alert night watches, checking sentry passwords, and challenging intruders.  \n    * **Field Bivouac Setup:** Pitching squad tents, setting up perimeter trip-flares, and digging field latrines to hygiene specs.  \n    * **Combat Communications Protocol:** Speaking in standardized radio brevity codes, call signs, and reporting coordinates clearly.  \n    * **Unit Cohesion & Morale:** Supporting squadmates through combat fatigue, suppression panic, and the horrors of war.  \n    * **Escort Formations:** Walking security perimeters around supply convoys, VIP officers, and artillery pieces.  \n    * **Bayonet & Close-Quarters Drill:** Executing textbook thrusts, butt-strokes, and rifle parries in tight trench combat.\n\n  ###"
        },
        {
          "name": "Tailor",
          "id": "mental-tailor",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Tailor is the skill of designing and creating clothing items, such as dresses, suits, or light armor or armor dressings. It reflects a character's ability to create clothing that is functional and aesthetically pleasing. Tailors are responsible for ensuring that clothing items fit well and are made from high-quality materials. This can include things like designing patterns, cutting fabric, and sewing clothing items.",
          "keywords": "tailor, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "High-Society Couture",
            "Ballistic Fabric Weaving",
            "Uniform Tailoring",
            "Pattern Drafting & Cutting",
            "Concealed-Carry Alteration",
            "Space Suit Sealing & Repair",
            "Leather & Beast-Hide Working",
            "Quick-Change Garment Design",
            "Embroidery & Insignia Handiwork",
            "Garment Mending & Alterations"
          ],
          "governing_attribute": "Intelect",
          "mechanic": "Governing Ability: Intelect\n\nMechanics:\n• *Craft Outfit:* CR 15 (Common) to CR 25 (High Fashion/Armored).\n• *Disguise Prep:* CR 20 to alter clothing to fit a disguise.\n\nSpecialties:\n• High-Society Couture: Designing and hand-stitching bespoke silk suits, evening gowns, and noble court capes.\n• Ballistic Fabric Weaving: Splicing flexible aramid, carbon-weave, and spider-silk fibers into puncture-proof business suits.\n• Uniform Tailoring: Sewing military uniforms, naval tunics, and dress coats with precise ribbon and medal mounts.\n• Pattern Drafting & Cutting: Measuring body proportions to draft custom paper cutting patterns that fit like a second skin.\n• Concealed-Carry Alteration: Modifying suit linings, coat shoulders, and vests with hidden pockets to hide pistols and blades.\n• Space Suit Sealing & Repair: Stitching pressurized canvas layers, vulcanizing rubber joints, and replacing neck rings.\n• Leather & Beast-Hide Working: Curing, tooling, dyeing, and stitching heavy alien hides, boots, belts, and weapon holsters.\n• Quick-Change Garment Design: Creating breakaway stage costumes and reversible coats for undercover field operatives.\n• Embroidery & Insignia Handiwork: Hand-stitching gold-bullion crests, unit shoulder patches, and ornate religious glyphs.\n• Garment Mending & Alterations: Hemming trousers, taking in waists, darning fabric tears, and reinforcing stress seams.",
          "specialty_details": [
            {
              "name": "High-Society Couture",
              "description": "Designing and hand-stitching bespoke silk suits, evening gowns, and noble court capes."
            },
            {
              "name": "Ballistic Fabric Weaving",
              "description": "Splicing flexible aramid, carbon-weave, and spider-silk fibers into puncture-proof business suits."
            },
            {
              "name": "Uniform Tailoring",
              "description": "Sewing military uniforms, naval tunics, and dress coats with precise ribbon and medal mounts."
            },
            {
              "name": "Pattern Drafting & Cutting",
              "description": "Measuring body proportions to draft custom paper cutting patterns that fit like a second skin."
            },
            {
              "name": "Concealed-Carry Alteration",
              "description": "Modifying suit linings, coat shoulders, and vests with hidden pockets to hide pistols and blades."
            },
            {
              "name": "Space Suit Sealing & Repair",
              "description": "Stitching pressurized canvas layers, vulcanizing rubber joints, and replacing neck rings."
            },
            {
              "name": "Leather & Beast-Hide Working",
              "description": "Curing, tooling, dyeing, and stitching heavy alien hides, boots, belts, and weapon holsters."
            },
            {
              "name": "Quick-Change Garment Design",
              "description": "Creating breakaway stage costumes and reversible coats for undercover field operatives."
            },
            {
              "name": "Embroidery & Insignia Handiwork",
              "description": "Hand-stitching gold-bullion crests, unit shoulder patches, and ornate religious glyphs."
            },
            {
              "name": "Garment Mending & Alterations",
              "description": "Hemming trousers, taking in waists, darning fabric tears, and reinforcing stress seams."
            }
          ],
          "full_text": "### **TAILOR**\n\n* **Ability:** Intelect  \n* **Description:** Tailor is the skill of designing and creating clothing items, such as dresses, suits, or light armor or armor dressings. It reflects a character's ability to create clothing that is functional and aesthetically pleasing. Tailors are responsible for ensuring that clothing items fit well and are made from high-quality materials. This can include things like designing patterns, cutting fabric, and sewing clothing items.   \n* **Mechanics:**  \n  * *Craft Outfit:* CR 15 (Common) to CR 25 (High Fashion/Armored).  \n  * *Disguise Prep:* CR 20 to alter clothing to fit a disguise.  \n* **Specialties:**   \n  * **High-Society Couture:** Designing and hand-stitching bespoke silk suits, evening gowns, and noble court capes.  \n    * **Ballistic Fabric Weaving:** Splicing flexible aramid, carbon-weave, and spider-silk fibers into puncture-proof business suits.  \n    * **Uniform Tailoring:** Sewing military uniforms, naval tunics, and dress coats with precise ribbon and medal mounts.  \n    * **Pattern Drafting & Cutting:** Measuring body proportions to draft custom paper cutting patterns that fit like a second skin.  \n    * **Concealed-Carry Alteration:** Modifying suit linings, coat shoulders, and vests with hidden pockets to hide pistols and blades.  \n    * **Space Suit Sealing & Repair:** Stitching pressurized canvas layers, vulcanizing rubber joints, and replacing neck rings.  \n    * **Leather & Beast-Hide Working:** Curing, tooling, dyeing, and stitching heavy alien hides, boots, belts, and weapon holsters.  \n    * **Quick-Change Garment Design:** Creating breakaway stage costumes and reversible coats for undercover field operatives.  \n    * **Embroidery & Insignia Handiwork:** Hand-stitching gold-bullion crests, unit shoulder patches, and ornate religious glyphs.  \n    * **Garment Mending & Alterations:** Hemming trousers, taking in waists, darning fabric tears, and reinforcing stress seams.\n\n  ###"
        },
        {
          "name": "Transporter",
          "id": "mental-transporter",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Transporter is the skill of transporting people or goods from one place to another, such as by driving, flying, or sailing. Transporters are responsible for ensuring people or goods are transported safely and efficiently. The professional moving of goods or people. Includes piloting commercial vehicles, loading cargo efficiently, and route planning.",
          "keywords": "transporter, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Long-Haul Space Trucking",
            "Armored Cash Transit",
            "Secret Compartment Rigging",
            "Cargo Weight Distribution",
            "VIP Chauffeur Services",
            "Atmospheric Sky-Bus Transit",
            "Hazardous Cargo Hauling",
            "Intermodal Freight Transfer",
            "Smuggling Blockade Runs",
            "Cold-Chain Courier Delivery"
          ],
          "governing_attribute": "Agility or Wisdom",
          "mechanic": "Governing Ability: Agility or Wisdom\n\nMechanics:\n• *Load Cargo:* CR 15 to maximize cargo space or secure dangerous goods.\n• *Route Navigation:* CR 15 to find the fastest/safest route.\n\nSpecialties:\n• Long-Haul Space Trucking: Piloting heavy multi-container cargo freighters across deep-space shipping routes safely.\n• Armored Cash Transit: Driving heavy security vaults and defensive bullion trucks through hostile urban zones.\n• Secret Compartment Rigging: Designing and packing false fuel tanks and hidden hull voids that evade customs scans.\n• Cargo Weight Distribution: Calculating center of gravity and tie-down strap tensions to prevent shifts in heavy seas/G-forces.\n• VIP Chauffeur Services: Driving luxury limousines smoothly while executing evasive anti-ramming driving maneuvers.\n• Atmospheric Sky-Bus Transit: Piloting mass-transit commuter hovercraft and rail cars through dense metropolitan corridors.\n• Hazardous Cargo Hauling: Driving volatile liquid-fuel tankers, radioactive canisters, and bio-hazards without incident.\n• Intermodal Freight Transfer: Operating gantry cranes, rail car switchers, and ramp docks to transfer bulk cargo quickly.\n• Smuggling Blockade Runs: Threading military intercept nets and customs patrol perimeters to deliver illicit contraband.\n• Cold-Chain Courier Delivery: Transporting delicate organs, vaccines, and living samples under strict temperature windows.",
          "specialty_details": [
            {
              "name": "Long-Haul Space Trucking",
              "description": "Piloting heavy multi-container cargo freighters across deep-space shipping routes safely."
            },
            {
              "name": "Armored Cash Transit",
              "description": "Driving heavy security vaults and defensive bullion trucks through hostile urban zones."
            },
            {
              "name": "Secret Compartment Rigging",
              "description": "Designing and packing false fuel tanks and hidden hull voids that evade customs scans."
            },
            {
              "name": "Cargo Weight Distribution",
              "description": "Calculating center of gravity and tie-down strap tensions to prevent shifts in heavy seas/G-forces."
            },
            {
              "name": "VIP Chauffeur Services",
              "description": "Driving luxury limousines smoothly while executing evasive anti-ramming driving maneuvers."
            },
            {
              "name": "Atmospheric Sky-Bus Transit",
              "description": "Piloting mass-transit commuter hovercraft and rail cars through dense metropolitan corridors."
            },
            {
              "name": "Hazardous Cargo Hauling",
              "description": "Driving volatile liquid-fuel tankers, radioactive canisters, and bio-hazards without incident."
            },
            {
              "name": "Intermodal Freight Transfer",
              "description": "Operating gantry cranes, rail car switchers, and ramp docks to transfer bulk cargo quickly."
            },
            {
              "name": "Smuggling Blockade Runs",
              "description": "Threading military intercept nets and customs patrol perimeters to deliver illicit contraband."
            },
            {
              "name": "Cold-Chain Courier Delivery",
              "description": "Transporting delicate organs, vaccines, and living samples under strict temperature windows."
            }
          ],
          "full_text": "### **TRANSPORTER**\n\n* **Ability:** Agility or Wisdom  \n* **Description:** Transporter is the skill of transporting people or goods from one place to another, such as by driving, flying, or sailing. Transporters are responsible for ensuring people or goods are transported safely and efficiently. The professional moving of goods or people. Includes piloting commercial vehicles, loading cargo efficiently, and route planning.  \n* **Mechanics:**  \n  * *Load Cargo:* CR 15 to maximize cargo space or secure dangerous goods.  \n  * *Route Navigation:* CR 15 to find the fastest/safest route.  \n* **Specialties:**   \n  * **Long-Haul Space Trucking:** Piloting heavy multi-container cargo freighters across deep-space shipping routes safely.  \n    * **Armored Cash Transit:** Driving heavy security vaults and defensive bullion trucks through hostile urban zones.  \n    * **Secret Compartment Rigging:** Designing and packing false fuel tanks and hidden hull voids that evade customs scans.  \n    * **Cargo Weight Distribution:** Calculating center of gravity and tie-down strap tensions to prevent shifts in heavy seas/G-forces.  \n    * **VIP Chauffeur Services:** Driving luxury limousines smoothly while executing evasive anti-ramming driving maneuvers.  \n    * **Atmospheric Sky-Bus Transit:** Piloting mass-transit commuter hovercraft and rail cars through dense metropolitan corridors.  \n    * **Hazardous Cargo Hauling:** Driving volatile liquid-fuel tankers, radioactive canisters, and bio-hazards without incident.  \n    * **Intermodal Freight Transfer:** Operating gantry cranes, rail car switchers, and ramp docks to transfer bulk cargo quickly.  \n    * **Smuggling Blockade Runs:** Threading military intercept nets and customs patrol perimeters to deliver illicit contraband.  \n    * **Cold-Chain Courier Delivery:** Transporting delicate organs, vaccines, and living samples under strict temperature windows.\n\n  ###"
        },
        {
          "name": "Weaponsmith",
          "id": "mental-weaponsmith",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Weaponsmith is the skill of creating and repairing weapons, such as swords, guns, or bows. It reflects a character's ability to create weapons that are functional and effective. Weaponsmiths are responsible for ensuring that weapons are made from high-quality materials and are designed to be effective in combat. This can include things like forging metal, sharpening blades, and repairing damaged weapons.",
          "keywords": "weaponsmith, mental, intellect, cognitive, expertise, forging",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
            "Bladed Weapon Forging",
            "Ballistic Firearm Gunsmithing",
            "Energy Weapon Optics & Lasers",
            "Heavy Weapon Servicing",
            "Accurizing & Scope Fitting",
            "Ammunition Reloading & Swaging",
            "Weapon Modifications",
            "Vibro & High-Frequency Blades",
            "Field Cleaning & Unjamming",
            "Exotic Material Tempering"
          ],
          "governing_attribute": "Intellect or Strength",
          "mechanic": "Governing Ability: Intellect or Strength\n\nMechanics:\n• *Repair Weapon:* CR 15 to fix a jammed or broken weapon.\n• *Craft Weapon:* CR varies by complexity (Sword CR 15, Laser Rifle CR 25).\n• *Modify:* CR 20 to add a scope, silencer, or increased capacity.\n\nSpecialties:\n• Bladed Weapon Forging: Folding, quenching, grinding, and heat-treating high-carbon steel and monomolecular edges.\n• Ballistic Firearm Gunsmithing: Rifling barrels, tuning gas blocks, polishing feed ramps, and lightening trigger pulls.\n• Energy Weapon Optics & Lasers: Aligning focusing prism lenses, polishing laser apertures, and calibrating beam diodes.\n• Heavy Weapon Servicing: Rebuilding heavy machine gun extractors, mortar bipods, and anti-tank rocket firing pins.\n• Accurizing & Scope Fitting: Bedding actions, mounting telescopic sights, and laser-boresighting long-range precision rifles.\n• Ammunition Reloading & Swaging: Pressing brass cartridges, compounding custom gunpowder loads, and swaging hollow points.\n• Weapon Modifications: Threading barrels for suppressors, mounting underbarrel shotguns, and installing extended magazines.\n• Vibro & High-Frequency Blades: Wiring ultrasonic vibrating motors and balancing resonant tungsten blades.\n• Field Cleaning & Unjamming: Rapidly drilling out squib rounds, clearing mangled brass feeds, and scraping carbon build-up.\n• Exotic Material Tempering: Machining titanium alloys, depleted uranium darts, and plasma-containment coils.",
          "specialty_details": [
            {
              "name": "Bladed Weapon Forging",
              "description": "Folding, quenching, grinding, and heat-treating high-carbon steel and monomolecular edges."
            },
            {
              "name": "Ballistic Firearm Gunsmithing",
              "description": "Rifling barrels, tuning gas blocks, polishing feed ramps, and lightening trigger pulls."
            },
            {
              "name": "Energy Weapon Optics & Lasers",
              "description": "Aligning focusing prism lenses, polishing laser apertures, and calibrating beam diodes."
            },
            {
              "name": "Heavy Weapon Servicing",
              "description": "Rebuilding heavy machine gun extractors, mortar bipods, and anti-tank rocket firing pins."
            },
            {
              "name": "Accurizing & Scope Fitting",
              "description": "Bedding actions, mounting telescopic sights, and laser-boresighting long-range precision rifles."
            },
            {
              "name": "Ammunition Reloading & Swaging",
              "description": "Pressing brass cartridges, compounding custom gunpowder loads, and swaging hollow points."
            },
            {
              "name": "Weapon Modifications",
              "description": "Threading barrels for suppressors, mounting underbarrel shotguns, and installing extended magazines."
            },
            {
              "name": "Vibro & High-Frequency Blades",
              "description": "Wiring ultrasonic vibrating motors and balancing resonant tungsten blades."
            },
            {
              "name": "Field Cleaning & Unjamming",
              "description": "Rapidly drilling out squib rounds, clearing mangled brass feeds, and scraping carbon build-up."
            },
            {
              "name": "Exotic Material Tempering",
              "description": "Machining titanium alloys, depleted uranium darts, and plasma-containment coils."
            }
          ],
          "full_text": "### **WEAPONSMITH**\n\n* **Ability:** Intellect or Strength  \n* **Description:** Weaponsmith is the skill of creating and repairing weapons, such as swords, guns, or bows. It reflects a character's ability to create weapons that are functional and effective. Weaponsmiths are responsible for ensuring that weapons are made from high-quality materials and are designed to be effective in combat. This can include things like forging metal, sharpening blades, and repairing damaged weapons.  \n* **Mechanics:**  \n  * *Repair Weapon:* CR 15 to fix a jammed or broken weapon.  \n  * *Craft Weapon:* CR varies by complexity (Sword CR 15, Laser Rifle CR 25).  \n  * *Modify:* CR 20 to add a scope, silencer, or increased capacity.  \n* **Specialties:**   \n  * **Bladed Weapon Forging:** Folding, quenching, grinding, and heat-treating high-carbon steel and monomolecular edges.  \n    * **Ballistic Firearm Gunsmithing:** Rifling barrels, tuning gas blocks, polishing feed ramps, and lightening trigger pulls.  \n    * **Energy Weapon Optics & Lasers:** Aligning focusing prism lenses, polishing laser apertures, and calibrating beam diodes.  \n    * **Heavy Weapon Servicing:** Rebuilding heavy machine gun extractors, mortar bipods, and anti-tank rocket firing pins.  \n    * **Accurizing & Scope Fitting:** Bedding actions, mounting telescopic sights, and laser-boresighting long-range precision rifles.  \n    * **Ammunition Reloading & Swaging:** Pressing brass cartridges, compounding custom gunpowder loads, and swaging hollow points.  \n    * **Weapon Modifications:** Threading barrels for suppressors, mounting underbarrel shotguns, and installing extended magazines.  \n    * **Vibro & High-Frequency Blades:** Wiring ultrasonic vibrating motors and balancing resonant tungsten blades.  \n    * **Field Cleaning & Unjamming:** Rapidly drilling out squib rounds, clearing mangled brass feeds, and scraping carbon build-up.  \n    * **Exotic Material Tempering:** Machining titanium alloys, depleted uranium darts, and plasma-containment coils.\n\n  ###\n\n---"
        }
      ]
    }
  ],
  "social": [
    {
      "title": "Expression",
      "skills": [
        {
          "name": "Acting",
          "id": "social-acting",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Acting is the skill of portraying a character or role in a performance. It reflects a character's ability to use body language, facial expressions, and tone of voice to convey emotions and communicate effectively. Acting is used whenever a character needs to deceive or persuade others, or to perform in a play or other theatrical production. The ability to embody a character, fake emotions, or improvise a persona. Unlike Disguise (which is visual), Acting is behavioral. It allows a character to pass as a soldier, a doctor, or a beggar through mannerisms and speech patterns alone.",
          "keywords": "acting, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Voice & Accent Mimicry",
            "Improvisational Roleplay",
            "Method Immersion",
            "Stage & Holo-Screen Acting",
            "Feigning Injury & Death",
            "Physical Mannerism Masking",
            "Theatrical Stage Combat",
            "Dramatic Monologuing",
            "Musical Theatre",
            "Comedic Timing"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Impersonation:* Opposed check vs. **Insight**.\n• *Distraction:* Create a scene to draw attention away from allies (CR 15).\n\nSpecialties:\n• Voice & Accent Mimicry: Replicating the specific cadence, regional dialect, and vocal pitch of specific individuals.\n• Improvisational Roleplay: Reacting organically in character when an undercover cover story goes completely off the rails.\n• Method Immersion: Living, thinking, and behaving completely as an assumed identity for months at a time.\n• Stage & Holo-Screen Acting: Delivering powerful, nuanced, and tearful dramatic performances before cameras or live crowds.\n• Feigning Injury & Death: Realistically collapsing, faking seizures, and playing dead to fool passing guards.\n• Physical Mannerism Masking: Changing one's walk, posture, head tilt, and physical gait to match a completely different persona.\n• Theatrical Stage Combat: Executing convincing punches, sword swings, and falls that look lethal without causing harm.\n• Dramatic Monologuing: Holding an entire audience or dining hall spellbound through dramatic pacing and projection.\n• Musical Theatre: Seamlessly integrating song, stage dialogue, and stylized movement into a single performance.\n• Comedic Timing: Delivering humorous acting cues, physical slapstick, and reaction beats on stage with perfection.",
          "specialty_details": [
            {
              "name": "Voice & Accent Mimicry",
              "description": "Replicating the specific cadence, regional dialect, and vocal pitch of specific individuals."
            },
            {
              "name": "Improvisational Roleplay",
              "description": "Reacting organically in character when an undercover cover story goes completely off the rails."
            },
            {
              "name": "Method Immersion",
              "description": "Living, thinking, and behaving completely as an assumed identity for months at a time."
            },
            {
              "name": "Stage & Holo-Screen Acting",
              "description": "Delivering powerful, nuanced, and tearful dramatic performances before cameras or live crowds."
            },
            {
              "name": "Feigning Injury & Death",
              "description": "Realistically collapsing, faking seizures, and playing dead to fool passing guards."
            },
            {
              "name": "Physical Mannerism Masking",
              "description": "Changing one's walk, posture, head tilt, and physical gait to match a completely different persona."
            },
            {
              "name": "Theatrical Stage Combat",
              "description": "Executing convincing punches, sword swings, and falls that look lethal without causing harm."
            },
            {
              "name": "Dramatic Monologuing",
              "description": "Holding an entire audience or dining hall spellbound through dramatic pacing and projection."
            },
            {
              "name": "Musical Theatre",
              "description": "Seamlessly integrating song, stage dialogue, and stylized movement into a single performance."
            },
            {
              "name": "Comedic Timing",
              "description": "Delivering humorous acting cues, physical slapstick, and reaction beats on stage with perfection."
            }
          ],
          "full_text": "### **Acting**\n\n* **Ability:** Charisma  \n* **Description:** Acting is the skill of portraying a character or role in a performance. It reflects a character's ability to use body language, facial expressions, and tone of voice to convey emotions and communicate effectively. Acting is used whenever a character needs to deceive or persuade others, or to perform in a play or other theatrical production. The ability to embody a character, fake emotions, or improvise a persona. Unlike Disguise (which is visual), Acting is behavioral. It allows a character to pass as a soldier, a doctor, or a beggar through mannerisms and speech patterns alone.  \n* **Mechanics:**  \n  * *Impersonation:* Opposed check vs. **Insight**.  \n  * *Distraction:* Create a scene to draw attention away from allies (CR 15).  \n* **Specialties:**   \n  * **Voice & Accent Mimicry:** Replicating the specific cadence, regional dialect, and vocal pitch of specific individuals.  \n    * **Improvisational Roleplay:** Reacting organically in character when an undercover cover story goes completely off the rails.  \n    * **Method Immersion:** Living, thinking, and behaving completely as an assumed identity for months at a time.  \n    * **Stage & Holo-Screen Acting:** Delivering powerful, nuanced, and tearful dramatic performances before cameras or live crowds.  \n    * **Feigning Injury & Death:** Realistically collapsing, faking seizures, and playing dead to fool passing guards.  \n    * **Physical Mannerism Masking:** Changing one's walk, posture, head tilt, and physical gait to match a completely different persona.  \n    * **Theatrical Stage Combat:** Executing convincing punches, sword swings, and falls that look lethal without causing harm.  \n    * **Dramatic Monologuing:** Holding an entire audience or dining hall spellbound through dramatic pacing and projection.  \n    * **Musical Theatre:** Seamlessly integrating song, stage dialogue, and stylized movement into a single performance.  \n    * **Comedic Timing:** Delivering humorous acting cues, physical slapstick, and reaction beats on stage with perfection.\n\n  ###"
        },
        {
          "name": "Comedy",
          "id": "social-comedy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Comedy is the skill of making people laugh or feel amused. It reflects a character's ability to use humor and wit to entertain others. Comedy is used whenever a character needs to lighten the mood or entertain others, or to perform in a comedy show or other comedic production. The art of humor, satire, and timing. Used to entertain, defuse tense situations, or provoke an enemy into making a mistake (Taunt).",
          "keywords": "comedy, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Stand-Up Routines",
            "Combat Taunts & Jeering",
            "Political Satire & Parody",
            "Hostility Defusal Through Humor",
            "Roasting & Heckler Put-Downs",
            "Slapstick & Physical Humor",
            "Dark & Gallows Humor",
            "Deadpan Irony",
            "Impressionist Parody",
            "Crowd Banter & Crowd-Work"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Entertain:* Standard performance mechanics.\n• *Defuse Hostility:* CR 20 to turn a Hostile NPC to Indifferent (if they have a sense of humor).\n• *Taunt:* Opposed check vs. **Willpower**. Success causes the target to focus on you or suffer a penalty to Logic/Discipline due to anger.\n\nSpecialties:\n• Stand-Up Routines: Delivering written comedic material, setups, and punchlines to pack cantinas and clubs.\n• Combat Taunts & Jeering: Enraging an enemy soldier with sharp, humiliating barbs so they break cover and attack wildly.\n• Political Satire & Parody: Mocking corrupt corporate moguls, planetary governors, and imperial policies through sharp humor.\n• Hostility Defusal Through Humor: Cracking the perfect joke during an armed standoff to disarm tension and get laughs.\n• Roasting & Heckler Put-Downs: Brutally shredding an abrasive heckler or arrogant rival with instant, razor-sharp wit.\n• Slapstick & Physical Humor: Executing hilarious pratfalls, exaggerated double-takes, and physical gags for laughs.\n• Dark & Gallows Humor: Using grim, morbid humor to keep spirits up and relieve stress in horrific combat zones.\n• Deadpan Irony: Delivering absurd statements with an absolute stone face to confuse and amuse listeners.\n• Impressionist Parody: Exaggerating the vocal tics, pomposity, and flaws of public celebrities for comedic effect.\n• Crowd Banter & Crowd-Work: Interacting spontaneously with cantina patrons to turn unexpected events into comedic gold.",
          "specialty_details": [
            {
              "name": "Stand-Up Routines",
              "description": "Delivering written comedic material, setups, and punchlines to pack cantinas and clubs."
            },
            {
              "name": "Combat Taunts & Jeering",
              "description": "Enraging an enemy soldier with sharp, humiliating barbs so they break cover and attack wildly."
            },
            {
              "name": "Political Satire & Parody",
              "description": "Mocking corrupt corporate moguls, planetary governors, and imperial policies through sharp humor."
            },
            {
              "name": "Hostility Defusal Through Humor",
              "description": "Cracking the perfect joke during an armed standoff to disarm tension and get laughs."
            },
            {
              "name": "Roasting & Heckler Put-Downs",
              "description": "Brutally shredding an abrasive heckler or arrogant rival with instant, razor-sharp wit."
            },
            {
              "name": "Slapstick & Physical Humor",
              "description": "Executing hilarious pratfalls, exaggerated double-takes, and physical gags for laughs."
            },
            {
              "name": "Dark & Gallows Humor",
              "description": "Using grim, morbid humor to keep spirits up and relieve stress in horrific combat zones."
            },
            {
              "name": "Deadpan Irony",
              "description": "Delivering absurd statements with an absolute stone face to confuse and amuse listeners."
            },
            {
              "name": "Impressionist Parody",
              "description": "Exaggerating the vocal tics, pomposity, and flaws of public celebrities for comedic effect."
            },
            {
              "name": "Crowd Banter & Crowd-Work",
              "description": "Interacting spontaneously with cantina patrons to turn unexpected events into comedic gold."
            }
          ],
          "full_text": "### **Comedy**\n\n* **Ability:** Charisma  \n* **Description:** Comedy is the skill of making people laugh or feel amused. It reflects a character's ability to use humor and wit to entertain others. Comedy is used whenever a character needs to lighten the mood or entertain others, or to perform in a comedy show or other comedic production. The art of humor, satire, and timing. Used to entertain, defuse tense situations, or provoke an enemy into making a mistake (Taunt).  \n* **Mechanics:**  \n  * *Entertain:* Standard performance mechanics.  \n  * *Defuse Hostility:* CR 20 to turn a Hostile NPC to Indifferent (if they have a sense of humor).  \n  * *Taunt:* Opposed check vs. **Willpower**. Success causes the target to focus on you or suffer a penalty to Logic/Discipline due to anger.  \n* **Specialties:**   \n  * **Stand-Up Routines:** Delivering written comedic material, setups, and punchlines to pack cantinas and clubs.  \n    * **Combat Taunts & Jeering:** Enraging an enemy soldier with sharp, humiliating barbs so they break cover and attack wildly.  \n    * **Political Satire & Parody:** Mocking corrupt corporate moguls, planetary governors, and imperial policies through sharp humor.  \n    * **Hostility Defusal Through Humor:** Cracking the perfect joke during an armed standoff to disarm tension and get laughs.  \n    * **Roasting & Heckler Put-Downs:** Brutally shredding an abrasive heckler or arrogant rival with instant, razor-sharp wit.  \n    * **Slapstick & Physical Humor:** Executing hilarious pratfalls, exaggerated double-takes, and physical gags for laughs.  \n    * **Dark & Gallows Humor:** Using grim, morbid humor to keep spirits up and relieve stress in horrific combat zones.  \n    * **Deadpan Irony:** Delivering absurd statements with an absolute stone face to confuse and amuse listeners.  \n    * **Impressionist Parody:** Exaggerating the vocal tics, pomposity, and flaws of public celebrities for comedic effect.  \n    * **Crowd Banter & Crowd-Work:** Interacting spontaneously with cantina patrons to turn unexpected events into comedic gold.\n\n  ###"
        },
        {
          "name": "Dancing",
          "id": "social-dancing",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Dancing is the skill of moving rhythmically to music. It reflects a character's ability to use body movements to express emotions and communicate effectively. Dancing is used whenever a character needs to entertain others or perform in a dance show or other performance. Rhythmic bodily movement to music. This skill covers everything from high-society ballroom dancing to club dancing or traditional folk dances. It is a display of grace, stamina, and social awareness.",
          "keywords": "dancing, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Ballroom & Court Waltz",
            "Club & Rave Freestyle",
            "Zero-G Aerial Dance",
            "Classical Ballet",
            "Folk & Cultural Dances",
            "Sensual & Seductive Dance",
            "Martial Katas & War Dances",
            "Breakdancing & Urban Acrobatics",
            "Choreographed Group Pop",
            "Tap & Percussive Footwork"
          ],
          "governing_attribute": "Charisma (Expression) or Agility (Technique)",
          "mechanic": "Governing Ability: Charisma (Expression) or Agility (Technique)\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n• *Partnering:* CR 15 to expertly lead or follow a partner, granting them a +2 bonus to their own Social checks during the event.\n\nSpecialties:\n• Ballroom & Court Waltz: Gliding gracefully through formal waltzes and minuet dances at aristocratic high galas.\n• Club & Rave Freestyle: Moving fluidly to pounding electronic music, light-shows, and underground dance beats.\n• Zero-G Aerial Dance: Executing three-dimensional pirouettes, flips, and spins in microgravity chambers.\n• Classical Ballet: Performing disciplined, highly athletic leaps, toe-spins, and technical classical routines.\n• Folk & Cultural Dances: Executing the traditional, historic footwork, line-dances, and circle-dances of worlds.\n• Sensual & Seductive Dance: Performing alluring, captivating movements designed to mesmerize and distract patrons.\n• Martial Katas & War Dances: Executing weapon dances, spear-stepping, and rhythmic intimidations before combat.\n• Breakdancing & Urban Acrobatics: Executing head-spins, ground-freezes, and explosive popping and locking on street corners.\n• Choreographed Group Pop: Synchronizing complex, high-energy group dance routines with background performers.\n• Tap & Percussive Footwork: Creating complex acoustic rhythms and syncopated beats purely through iron-shod shoe taps.",
          "specialty_details": [
            {
              "name": "Ballroom & Court Waltz",
              "description": "Gliding gracefully through formal waltzes and minuet dances at aristocratic high galas."
            },
            {
              "name": "Club & Rave Freestyle",
              "description": "Moving fluidly to pounding electronic music, light-shows, and underground dance beats."
            },
            {
              "name": "Zero-G Aerial Dance",
              "description": "Executing three-dimensional pirouettes, flips, and spins in microgravity chambers."
            },
            {
              "name": "Classical Ballet",
              "description": "Performing disciplined, highly athletic leaps, toe-spins, and technical classical routines."
            },
            {
              "name": "Folk & Cultural Dances",
              "description": "Executing the traditional, historic footwork, line-dances, and circle-dances of worlds."
            },
            {
              "name": "Sensual & Seductive Dance",
              "description": "Performing alluring, captivating movements designed to mesmerize and distract patrons."
            },
            {
              "name": "Martial Katas & War Dances",
              "description": "Executing weapon dances, spear-stepping, and rhythmic intimidations before combat."
            },
            {
              "name": "Breakdancing & Urban Acrobatics",
              "description": "Executing head-spins, ground-freezes, and explosive popping and locking on street corners."
            },
            {
              "name": "Choreographed Group Pop",
              "description": "Synchronizing complex, high-energy group dance routines with background performers."
            },
            {
              "name": "Tap & Percussive Footwork",
              "description": "Creating complex acoustic rhythms and syncopated beats purely through iron-shod shoe taps."
            }
          ],
          "full_text": "### **Dancing**\n\n* **Ability:** Charisma (Expression) or Agility (Technique)  \n* **Description:** Dancing is the skill of moving rhythmically to music. It reflects a character's ability to use body movements to express emotions and communicate effectively. Dancing is used whenever a character needs to entertain others or perform in a dance show or other performance. Rhythmic bodily movement to music. This skill covers everything from high-society ballroom dancing to club dancing or traditional folk dances. It is a display of grace, stamina, and social awareness.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n  * *Partnering:* CR 15 to expertly lead or follow a partner, granting them a \\+2 bonus to their own Social checks during the event.  \n* **Specialties:**   \n  * **Ballroom & Court Waltz:** Gliding gracefully through formal waltzes and minuet dances at aristocratic high galas.  \n    * **Club & Rave Freestyle:** Moving fluidly to pounding electronic music, light-shows, and underground dance beats.  \n    * **Zero-G Aerial Dance:** Executing three-dimensional pirouettes, flips, and spins in microgravity chambers.  \n    * **Classical Ballet:** Performing disciplined, highly athletic leaps, toe-spins, and technical classical routines.  \n    * **Folk & Cultural Dances:** Executing the traditional, historic footwork, line-dances, and circle-dances of worlds.  \n    * **Sensual & Seductive Dance:** Performing alluring, captivating movements designed to mesmerize and distract patrons.  \n    * **Martial Katas & War Dances:** Executing weapon dances, spear-stepping, and rhythmic intimidations before combat.  \n    * **Breakdancing & Urban Acrobatics:** Executing head-spins, ground-freezes, and explosive popping and locking on street corners.  \n    * **Choreographed Group Pop:** Synchronizing complex, high-energy group dance routines with background performers.  \n    * **Tap & Percussive Footwork:** Creating complex acoustic rhythms and syncopated beats purely through iron-shod shoe taps.\n\n  ###"
        },
        {
          "name": "Disguise",
          "id": "social-disguise",
          "group": "social",
          "baseAttr": "attr-intellect",
          "description": "Disguise is the skill of changing one's appearance to look like someone else. It reflects a character's ability to use makeup, costumes, and other techniques to alter their appearance. Disguise is used whenever a character needs to deceive or impersonate someone else, or to hide their true identity. The application of props, makeup, prosthetics, and costumes to change one's physical appearance. While Acting covers behavior, Disguise covers the visual fabrication.",
          "keywords": "disguise, social, intellect, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Prosthetic & Latex Application",
            "Cosmetic Makeup & Contouring",
            "Specific Individual Cloning",
            "Cross-Species Camouflage",
            "Quick-Change Techniques",
            "Aging & De-Aging Effects",
            "Body Shape Padding",
            "Cyberware Concealment",
            "Camouflage Makeup",
            "Holographic Disguise Tuning"
          ],
          "governing_attribute": "Charisma (Acting the part) or Intellect (Creating the prop)",
          "mechanic": "Governing Ability: Charisma (Acting the part) or Intellect (Creating the prop)\n\nMechanics:\n• *Create Disguise:* The result of your check becomes the **CR** for anyone trying to see through it using **Alertness** or **Investigation**.\n• *Speed Disguise:* Rushing a disguise (-5 penalty) takes 1d4 rounds. Proper application takes 10-30 minutes.\n\nSpecialties:\n• Prosthetic & Latex Application: Applying false noses, cheekbones, brow ridges, and synthetic skin appliances.\n• Cosmetic Makeup & Contouring: Using shading, highlights, and foundation to drastically alter perceived face shapes.\n• Specific Individual Cloning: Replicating the exact face, wrinkles, scars, and hair of a known living person.\n• Cross-Species Camouflage: Using silicone masks, false ears, and body padding to pass as a different humanoid alien race.\n• Quick-Change Techniques: Shedding an entire outer costume and wig in three seconds inside a crowd or alley.\n• Aging & De-Aging Effects: Simulating liver spots, graying hair, wrinkles, or youthful skin with paints and glues.\n• Body Shape Padding: Wearing fat suits, muscle pads, or slouch braces to alter height, build, and posture completely.\n• Cyberware Concealment: Using synthetic flesh and dermal plating to hide chrome cybernetic limbs and data jacks.\n• Camouflage Makeup: Painting matte disruptive patterns across faces and gear to blend into jungle or night terrain.\n• Holographic Disguise Tuning: Calibrating holographic light-emitters to project a false digital identity shell over gear.",
          "specialty_details": [
            {
              "name": "Prosthetic & Latex Application",
              "description": "Applying false noses, cheekbones, brow ridges, and synthetic skin appliances."
            },
            {
              "name": "Cosmetic Makeup & Contouring",
              "description": "Using shading, highlights, and foundation to drastically alter perceived face shapes."
            },
            {
              "name": "Specific Individual Cloning",
              "description": "Replicating the exact face, wrinkles, scars, and hair of a known living person."
            },
            {
              "name": "Cross-Species Camouflage",
              "description": "Using silicone masks, false ears, and body padding to pass as a different humanoid alien race."
            },
            {
              "name": "Quick-Change Techniques",
              "description": "Shedding an entire outer costume and wig in three seconds inside a crowd or alley."
            },
            {
              "name": "Aging & De-Aging Effects",
              "description": "Simulating liver spots, graying hair, wrinkles, or youthful skin with paints and glues."
            },
            {
              "name": "Body Shape Padding",
              "description": "Wearing fat suits, muscle pads, or slouch braces to alter height, build, and posture completely."
            },
            {
              "name": "Cyberware Concealment",
              "description": "Using synthetic flesh and dermal plating to hide chrome cybernetic limbs and data jacks."
            },
            {
              "name": "Camouflage Makeup",
              "description": "Painting matte disruptive patterns across faces and gear to blend into jungle or night terrain."
            },
            {
              "name": "Holographic Disguise Tuning",
              "description": "Calibrating holographic light-emitters to project a false digital identity shell over gear."
            }
          ],
          "full_text": "### **Disguise**\n\n* **Ability:** Charisma (Acting the part) or Intellect (Creating the prop)  \n* **Description:** Disguise is the skill of changing one's appearance to look like someone else. It reflects a character's ability to use makeup, costumes, and other techniques to alter their appearance. Disguise is used whenever a character needs to deceive or impersonate someone else, or to hide their true identity. The application of props, makeup, prosthetics, and costumes to change one's physical appearance. While Acting covers behavior, Disguise covers the visual fabrication.  \n* **Mechanics:**  \n  * *Create Disguise:* The result of your check becomes the **CR** for anyone trying to see through it using **Alertness** or **Investigation**.  \n  * *Speed Disguise:* Rushing a disguise (-5 penalty) takes 1d4 rounds. Proper application takes 10-30 minutes.  \n* **Specialties:**   \n  * **Prosthetic & Latex Application:** Applying false noses, cheekbones, brow ridges, and synthetic skin appliances.  \n    * **Cosmetic Makeup & Contouring:** Using shading, highlights, and foundation to drastically alter perceived face shapes.  \n    * **Specific Individual Cloning:** Replicating the exact face, wrinkles, scars, and hair of a known living person.  \n    * **Cross-Species Camouflage:** Using silicone masks, false ears, and body padding to pass as a different humanoid alien race.  \n    * **Quick-Change Techniques:** Shedding an entire outer costume and wig in three seconds inside a crowd or alley.  \n    * **Aging & De-Aging Effects:** Simulating liver spots, graying hair, wrinkles, or youthful skin with paints and glues.  \n    * **Body Shape Padding:** Wearing fat suits, muscle pads, or slouch braces to alter height, build, and posture completely.  \n    * **Cyberware Concealment:** Using synthetic flesh and dermal plating to hide chrome cybernetic limbs and data jacks.  \n    * **Camouflage Makeup:** Painting matte disruptive patterns across faces and gear to blend into jungle or night terrain.  \n    * **Holographic Disguise Tuning:** Calibrating holographic light-emitters to project a false digital identity shell over gear.\n\n  ###"
        },
        {
          "name": "Keyboard",
          "id": "social-keyboard",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Keyboard is the skill of playing a keyboard instrument, such as a piano or synthesizer. It reflects a character's ability to create music using a keyboard instrument. Keyboard is used whenever a character needs to create music or perform in a musical production. Proficiency with instrument interfaces involving keys, buttons, or haptic pads. In a Sci-Fi setting, this ranges from classic pianos to complex holographic synthesizers.",
          "keywords": "keyboard, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Acoustic Grand Piano",
            "Pipe & Cathedral Organ",
            "Electronic Synthesizer Workstations",
            "Holographic Light-Keys",
            "Keytar & Stage Performance",
            "Harpsichord & Early Instruments",
            "Haptic Touch-Pads",
            "Accordion & Squeeze-Box",
            "Ambient Soundscape Design",
            "Microtonal Synthesizers"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n• *Composition:* Write a piece of music (Intellect + Keyboard).\n\nSpecialties:\n• Acoustic Grand Piano: Performing complex classical sonatas, jazz improvisations, and concertos on grand pianos.\n• Pipe & Cathedral Organ: Operating multi-manual organ keyboards, foot pedals, and stops in massive echoic halls.\n• Electronic Synthesizer Workstations: Programming oscillators, low-pass filters, and playing electronic synth leads.\n• Holographic Light-Keys: Playing futuristic musical consoles composed of projected, floating hard-light keys.\n• Keytar & Stage Performance: Playing portable keyboard instruments while moving aggressively across live stages.\n• Harpsichord & Early Instruments: Performing delicate, plucking keyboard compositions from archaic eras.\n• Haptic Touch-Pads: Playing responsive, velocity-sensitive silicone pads and matrix controller surfaces.\n• Accordion & Squeeze-Box: Operating bellow-driven reed key boxes while managing rhythmic bass buttons.\n• Ambient Soundscape Design: Generating lush, evolving chordal pads and atmospheric sonic backdrops live.\n• Microtonal Synthesizers: Navigating alien tuning scales and non-standard pitch intervals on custom boards.",
          "specialty_details": [
            {
              "name": "Acoustic Grand Piano",
              "description": "Performing complex classical sonatas, jazz improvisations, and concertos on grand pianos."
            },
            {
              "name": "Pipe & Cathedral Organ",
              "description": "Operating multi-manual organ keyboards, foot pedals, and stops in massive echoic halls."
            },
            {
              "name": "Electronic Synthesizer Workstations",
              "description": "Programming oscillators, low-pass filters, and playing electronic synth leads."
            },
            {
              "name": "Holographic Light-Keys",
              "description": "Playing futuristic musical consoles composed of projected, floating hard-light keys."
            },
            {
              "name": "Keytar & Stage Performance",
              "description": "Playing portable keyboard instruments while moving aggressively across live stages."
            },
            {
              "name": "Harpsichord & Early Instruments",
              "description": "Performing delicate, plucking keyboard compositions from archaic eras."
            },
            {
              "name": "Haptic Touch-Pads",
              "description": "Playing responsive, velocity-sensitive silicone pads and matrix controller surfaces."
            },
            {
              "name": "Accordion & Squeeze-Box",
              "description": "Operating bellow-driven reed key boxes while managing rhythmic bass buttons."
            },
            {
              "name": "Ambient Soundscape Design",
              "description": "Generating lush, evolving chordal pads and atmospheric sonic backdrops live."
            },
            {
              "name": "Microtonal Synthesizers",
              "description": "Navigating alien tuning scales and non-standard pitch intervals on custom boards."
            }
          ],
          "full_text": "### **Keyboard**\n\n* **Ability:** Charisma  \n* **Description:** Keyboard is the skill of playing a keyboard instrument, such as a piano or synthesizer. It reflects a character's ability to create music using a keyboard instrument. Keyboard is used whenever a character needs to create music or perform in a musical production. Proficiency with instrument interfaces involving keys, buttons, or haptic pads. In a Sci-Fi setting, this ranges from classic pianos to complex holographic synthesizers.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n  * *Composition:* Write a piece of music (Intellect \\+ Keyboard).  \n* **Specialties:**   \n  * **Acoustic Grand Piano:** Performing complex classical sonatas, jazz improvisations, and concertos on grand pianos.  \n    * **Pipe & Cathedral Organ:** Operating multi-manual organ keyboards, foot pedals, and stops in massive echoic halls.  \n    * **Electronic Synthesizer Workstations:** Programming oscillators, low-pass filters, and playing electronic synth leads.  \n    * **Holographic Light-Keys:** Playing futuristic musical consoles composed of projected, floating hard-light keys.  \n    * **Keytar & Stage Performance:** Playing portable keyboard instruments while moving aggressively across live stages.  \n    * **Harpsichord & Early Instruments:** Performing delicate, plucking keyboard compositions from archaic eras.  \n    * **Haptic Touch-Pads:** Playing responsive, velocity-sensitive silicone pads and matrix controller surfaces.  \n    * **Accordion & Squeeze-Box:** Operating bellow-driven reed key boxes while managing rhythmic bass buttons.  \n    * **Ambient Soundscape Design:** Generating lush, evolving chordal pads and atmospheric sonic backdrops live.  \n    * **Microtonal Synthesizers:** Navigating alien tuning scales and non-standard pitch intervals on custom boards.\n\n  ###"
        },
        {
          "name": "Legerdemain",
          "id": "social-legerdemain",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Legerdemain is the skill of performing sleight of hand tricks and illusions. It reflects a character's ability to use misdirection and other techniques to deceive others. Legerdemain is used whenever a character needs to deceive or entertain others such as switching items, stealing or performing a stage or table magic show. Sleight of hand, stage magic, and manual dexterity. While often used for entertainment, it is the primary skill for pickpocketing, palming small objects, and concealing weapons.",
          "keywords": "legerdemain, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Pickpocketing",
            "Palming & Small Item Concealment",
            "Card & Coin Manipulation",
            "Stage Illusions & Escapology",
            "Quick-Draw Palming",
            "Item Swapping",
            "Shell Game & Three-Card Monte",
            "Wax Impression Key Duplication",
            "Distraction Flairs",
            "Planting Evidence"
          ],
          "governing_attribute": "Agility (Dexterity) or Charisma (Misdirection)",
          "mechanic": "Governing Ability: Agility (Dexterity) or Charisma (Misdirection)\n\nMechanics:\n• *Pickpocket:* CR 20 to take an item unnoticed (or opposed by Alertness).\n• *Conceal Item:* CR 15 to hide a small weapon/item on your person (opposed by Search).\n• *Stage Magic:* Perform a trick to entertain or distract.\n\nSpecialties:\n• Pickpocketing: Slitting purse strings, slipping wallets from coats, and lifting keycards unnoticed.\n• Palming & Small Item Concealment: Hiding daggers, datachips, coins, or vials in the palm or sleeve seamlessly.\n• Card & Coin Manipulation: Executing flawless shuffles, coin-rolls, false cuts, and close-up stage magic tricks.\n• Stage Illusions & Escapology: Slipping out of padlocked chains, straitjackets, and water tanks before an audience.\n• Quick-Draw Palming: Snapping a hidden derringer or holdout blade from a sleeve straight into a firing grip.\n• Item Swapping: Switching an authentic relic or keycard with an exact fake right before an inspector's eyes.\n• Shell Game & Three-Card Monte: Manipulating cups, shells, and cards so fast that onlookers cannot track the prize.\n• Wax Impression Key Duplication: Pressing a guard's physical security key into soft wax in a single casual handshake.\n• Distraction Flairs: Snapping fingers, dropping coins, or generating sparks with one hand while the other steals.\n• Planting Evidence: Slipping hot contraband, tracking bugs, or stolen narcotics into an unsuspecting mark's pocket.",
          "specialty_details": [
            {
              "name": "Pickpocketing",
              "description": "Slitting purse strings, slipping wallets from coats, and lifting keycards unnoticed."
            },
            {
              "name": "Palming & Small Item Concealment",
              "description": "Hiding daggers, datachips, coins, or vials in the palm or sleeve seamlessly."
            },
            {
              "name": "Card & Coin Manipulation",
              "description": "Executing flawless shuffles, coin-rolls, false cuts, and close-up stage magic tricks."
            },
            {
              "name": "Stage Illusions & Escapology",
              "description": "Slipping out of padlocked chains, straitjackets, and water tanks before an audience."
            },
            {
              "name": "Quick-Draw Palming",
              "description": "Snapping a hidden derringer or holdout blade from a sleeve straight into a firing grip."
            },
            {
              "name": "Item Swapping",
              "description": "Switching an authentic relic or keycard with an exact fake right before an inspector's eyes."
            },
            {
              "name": "Shell Game & Three-Card Monte",
              "description": "Manipulating cups, shells, and cards so fast that onlookers cannot track the prize."
            },
            {
              "name": "Wax Impression Key Duplication",
              "description": "Pressing a guard's physical security key into soft wax in a single casual handshake."
            },
            {
              "name": "Distraction Flairs",
              "description": "Snapping fingers, dropping coins, or generating sparks with one hand while the other steals."
            },
            {
              "name": "Planting Evidence",
              "description": "Slipping hot contraband, tracking bugs, or stolen narcotics into an unsuspecting mark's pocket."
            }
          ],
          "full_text": "### **Legerdemain**\n\n* **Ability:** Agility (Dexterity) or Charisma (Misdirection)  \n* **Description:** Legerdemain is the skill of performing sleight of hand tricks and illusions. It reflects a character's ability to use misdirection and other techniques to deceive others. Legerdemain is used whenever a character needs to deceive or entertain others such as switching items, stealing or performing a stage or table magic show. Sleight of hand, stage magic, and manual dexterity. While often used for entertainment, it is the primary skill for pickpocketing, palming small objects, and concealing weapons.  \n* **Mechanics:**  \n  * *Pickpocket:* CR 20 to take an item unnoticed (or opposed by Alertness).  \n  * *Conceal Item:* CR 15 to hide a small weapon/item on your person (opposed by Search).  \n  * *Stage Magic:* Perform a trick to entertain or distract.  \n* **Specialties:**   \n  * **Pickpocketing:** Slitting purse strings, slipping wallets from coats, and lifting keycards unnoticed.  \n    * **Palming & Small Item Concealment:** Hiding daggers, datachips, coins, or vials in the palm or sleeve seamlessly.  \n    * **Card & Coin Manipulation:** Executing flawless shuffles, coin-rolls, false cuts, and close-up stage magic tricks.  \n    * **Stage Illusions & Escapology:** Slipping out of padlocked chains, straitjackets, and water tanks before an audience.  \n    * **Quick-Draw Palming:** Snapping a hidden derringer or holdout blade from a sleeve straight into a firing grip.  \n    * **Item Swapping:** Switching an authentic relic or keycard with an exact fake right before an inspector's eyes.  \n    * **Shell Game & Three-Card Monte:** Manipulating cups, shells, and cards so fast that onlookers cannot track the prize.  \n    * **Wax Impression Key Duplication:** Pressing a guard's physical security key into soft wax in a single casual handshake.  \n    * **Distraction Flairs:** Snapping fingers, dropping coins, or generating sparks with one hand while the other steals.  \n    * **Planting Evidence:** Slipping hot contraband, tracking bugs, or stolen narcotics into an unsuspecting mark's pocket.\n\n  ###"
        },
        {
          "name": "Oratory",
          "id": "social-oratory",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Oratory is the skill of public speaking. It reflects a character's ability to use language and tone of voice to persuade and inspire others. Oratory is used whenever a character needs to convince a group to take a certain course of action, or to deliver a speech or other public address. The art of public speaking. Used to inspire crowds, deliver sermons, debate in court/senate, or give orders on a battlefield.",
          "keywords": "oratory, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Political Rally Speeches",
            "Military Pre-Battle Speeches",
            "Religious Sermons & Preaching",
            "Courtroom Advocacy",
            "Eulogies & Funerary Orations",
            "Crowd Riot Incitement",
            "Philosophical Lectures",
            "Diplomatic Keynote Addresses",
            "Acoustic Vocal Projection",
            "Debate Cross-Examination"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Inspire:* CR 15 to grant allies a +1 morale bonus to Willpower saves for 1 hour.\n• *Persuade Crowd:* Shift the attitude of a group (opposed by the group's collective Will or a set CR).\n\nSpecialties:\n• Political Rally Speeches: Delivering fiery, populist orations that sweep elections and energize masses of voters.\n• Military Pre-Battle Speeches: Delivering inspiring addresses that harden resolve and banish fear before bloody assaults.\n• Religious Sermons & Preaching: Delivering sermons that move congregations to tears, repentance, and zealotry.\n• Courtroom Advocacy: Presenting closing arguments to juries and judges with compelling narrative power.\n• Eulogies & Funerary Orations: Honoring the deceased with dignified, deeply moving reflections that comfort mourners.\n• Crowd Riot Incitement: Whipping an already angry protest crowd into an uncontrollable, barrier-smashing mob.\n• Philosophical Lectures: Explaining abstract ethical concepts and ideological frameworks to university halls.\n• Diplomatic Keynote Addresses: Addressing global assemblies with statesmanlike poise, vision, and gravitas.\n• Acoustic Vocal Projection: Throwing your voice without microphones to fill cavernous halls and outdoor stadiums.\n• Debate Cross-Examination: Dismantling an opponent's speech line-by-line with sharp rhetorical traps and counter-arguments.",
          "specialty_details": [
            {
              "name": "Political Rally Speeches",
              "description": "Delivering fiery, populist orations that sweep elections and energize masses of voters."
            },
            {
              "name": "Military Pre-Battle Speeches",
              "description": "Delivering inspiring addresses that harden resolve and banish fear before bloody assaults."
            },
            {
              "name": "Religious Sermons & Preaching",
              "description": "Delivering sermons that move congregations to tears, repentance, and zealotry."
            },
            {
              "name": "Courtroom Advocacy",
              "description": "Presenting closing arguments to juries and judges with compelling narrative power."
            },
            {
              "name": "Eulogies & Funerary Orations",
              "description": "Honoring the deceased with dignified, deeply moving reflections that comfort mourners."
            },
            {
              "name": "Crowd Riot Incitement",
              "description": "Whipping an already angry protest crowd into an uncontrollable, barrier-smashing mob."
            },
            {
              "name": "Philosophical Lectures",
              "description": "Explaining abstract ethical concepts and ideological frameworks to university halls."
            },
            {
              "name": "Diplomatic Keynote Addresses",
              "description": "Addressing global assemblies with statesmanlike poise, vision, and gravitas."
            },
            {
              "name": "Acoustic Vocal Projection",
              "description": "Throwing your voice without microphones to fill cavernous halls and outdoor stadiums."
            },
            {
              "name": "Debate Cross-Examination",
              "description": "Dismantling an opponent's speech line-by-line with sharp rhetorical traps and counter-arguments."
            }
          ],
          "full_text": "### **Oratory**\n\n* **Ability:** Charisma  \n* **Description:** Oratory is the skill of public speaking. It reflects a character's ability to use language and tone of voice to persuade and inspire others. Oratory is used whenever a character needs to convince a group to take a certain course of action, or to deliver a speech or other public address. The art of public speaking. Used to inspire crowds, deliver sermons, debate in court/senate, or give orders on a battlefield.  \n* **Mechanics:**  \n  * *Inspire:* CR 15 to grant allies a \\+1 morale bonus to Willpower saves for 1 hour.  \n  * *Persuade Crowd:* Shift the attitude of a group (opposed by the group's collective Will or a set CR).  \n* **Specialties:**   \n  * **Political Rally Speeches:** Delivering fiery, populist orations that sweep elections and energize masses of voters.  \n    * **Military Pre-Battle Speeches:** Delivering inspiring addresses that harden resolve and banish fear before bloody assaults.  \n    * **Religious Sermons & Preaching:** Delivering sermons that move congregations to tears, repentance, and zealotry.  \n    * **Courtroom Advocacy:** Presenting closing arguments to juries and judges with compelling narrative power.  \n    * **Eulogies & Funerary Orations:** Honoring the deceased with dignified, deeply moving reflections that comfort mourners.  \n    * **Crowd Riot Incitement:** Whipping an already angry protest crowd into an uncontrollable, barrier-smashing mob.  \n    * **Philosophical Lectures:** Explaining abstract ethical concepts and ideological frameworks to university halls.  \n    * **Diplomatic Keynote Addresses:** Addressing global assemblies with statesmanlike poise, vision, and gravitas.  \n    * **Acoustic Vocal Projection:** Throwing your voice without microphones to fill cavernous halls and outdoor stadiums.  \n    * **Debate Cross-Examination:** Dismantling an opponent's speech line-by-line with sharp rhetorical traps and counter-arguments.\n\n  ###"
        },
        {
          "name": "Percussion",
          "id": "social-percussion",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Percussion is the skill of playing percussion instruments, like drums or cymbals. It reflects a character's ability to create music using percussion instruments. Percussion is used whenever a character needs to create music or perform in a musical production. Proficiency with instruments that are struck, shaken, or scraped. This is often the foundation of musical timing and rhythm.",
          "keywords": "percussion, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Acoustic Drum Kits",
            "Military War Drums & Snares",
            "Orchestral Timpani & Gongs",
            "Hand Percussion (Congas/Bongos)",
            "Electronic Drum Pads",
            "Tuned Mallet Percussion",
            "Tribal Ritual Drumming",
            "Bodhrán & Frame Drums",
            "Cymbals, Triangles & Chimes",
            "Rhythmic Rowing/Marching Cadence"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n• *Rhythm:* CR 15 to maintain a beat that helps others coordinate physical tasks (e.g., rowing, marching), granting a +1 bonus to their endurance-based checks.\n\nSpecialties:\n• Acoustic Drum Kits: Playing intricate rock, jazz, and metal beats using snare, kick, tom-toms, and cymbals.\n• Military War Drums & Snares: Keeping the marching cadence, signaling battle lines, and drumming troops into action.\n• Orchestral Timpani & Gongs: Striking tuned kettle drums and massive orchestral gongs for dramatic climaxes.\n• Hand Percussion (Congas/Bongos): Slapping, popping, and palm-striking skin hand drums with polyrhythmic speed.\n• Electronic Drum Pads: Playing velocity-sensitive rubber pads triggering synthesized samples and sub-bass kicks.\n• Tuned Mallet Percussion: Playing wooden marimbas, steel xylophones, and vibraphones with precision mallets.\n• Tribal Ritual Drumming: Driving deep, hypnotic, relentless drum circles that induce trance states in participants.\n• Bodhrán & Frame Drums: Beating shallow Celtic-style frame drums with double-ended tippers while modulating pitch.\n• Cymbals, Triangles & Chimes: Accenting delicate sonic passages with crashes, rides, sizzling chimes, and iron bells.\n• Rhythmic Rowing/Marching Cadence: Maintaining a continuous, driving beat that coordinates team endurance tasks.",
          "specialty_details": [
            {
              "name": "Acoustic Drum Kits",
              "description": "Playing intricate rock, jazz, and metal beats using snare, kick, tom-toms, and cymbals."
            },
            {
              "name": "Military War Drums & Snares",
              "description": "Keeping the marching cadence, signaling battle lines, and drumming troops into action."
            },
            {
              "name": "Orchestral Timpani & Gongs",
              "description": "Striking tuned kettle drums and massive orchestral gongs for dramatic climaxes."
            },
            {
              "name": "Hand Percussion (Congas/Bongos)",
              "description": "Slapping, popping, and palm-striking skin hand drums with polyrhythmic speed."
            },
            {
              "name": "Electronic Drum Pads",
              "description": "Playing velocity-sensitive rubber pads triggering synthesized samples and sub-bass kicks."
            },
            {
              "name": "Tuned Mallet Percussion",
              "description": "Playing wooden marimbas, steel xylophones, and vibraphones with precision mallets."
            },
            {
              "name": "Tribal Ritual Drumming",
              "description": "Driving deep, hypnotic, relentless drum circles that induce trance states in participants."
            },
            {
              "name": "Bodhrán & Frame Drums",
              "description": "Beating shallow Celtic-style frame drums with double-ended tippers while modulating pitch."
            },
            {
              "name": "Cymbals, Triangles & Chimes",
              "description": "Accenting delicate sonic passages with crashes, rides, sizzling chimes, and iron bells."
            },
            {
              "name": "Rhythmic Rowing/Marching Cadence",
              "description": "Maintaining a continuous, driving beat that coordinates team endurance tasks."
            }
          ],
          "full_text": "### **Percussion**\n\n* **Ability:** Charisma  \n* **Description:** Percussion is the skill of playing percussion instruments, like drums or cymbals. It reflects a character's ability to create music using percussion instruments. Percussion is used whenever a character needs to create music or perform in a musical production. Proficiency with instruments that are struck, shaken, or scraped. This is often the foundation of musical timing and rhythm.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n  * *Rhythm:* CR 15 to maintain a beat that helps others coordinate physical tasks (e.g., rowing, marching), granting a \\+1 bonus to their endurance-based checks.  \n* **Specialties:**   \n  * **Acoustic Drum Kits:** Playing intricate rock, jazz, and metal beats using snare, kick, tom-toms, and cymbals.  \n    * **Military War Drums & Snares:** Keeping the marching cadence, signaling battle lines, and drumming troops into action.  \n    * **Orchestral Timpani & Gongs:** Striking tuned kettle drums and massive orchestral gongs for dramatic climaxes.  \n    * **Hand Percussion (Congas/Bongos):** Slapping, popping, and palm-striking skin hand drums with polyrhythmic speed.  \n    * **Electronic Drum Pads:** Playing velocity-sensitive rubber pads triggering synthesized samples and sub-bass kicks.  \n    * **Tuned Mallet Percussion:** Playing wooden marimbas, steel xylophones, and vibraphones with precision mallets.  \n    * **Tribal Ritual Drumming:** Driving deep, hypnotic, relentless drum circles that induce trance states in participants.  \n    * **Bodhrán & Frame Drums:** Beating shallow Celtic-style frame drums with double-ended tippers while modulating pitch.  \n    * **Cymbals, Triangles & Chimes:** Accenting delicate sonic passages with crashes, rides, sizzling chimes, and iron bells.  \n    * **Rhythmic Rowing/Marching Cadence:** Maintaining a continuous, driving beat that coordinates team endurance tasks.\n\n  ###"
        },
        {
          "name": "Singing",
          "id": "social-singing",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Singing is the skill of using one's voice to create music. It reflects a character's ability to use pitch, tone, and rhythm to convey emotions and communicate effectively. Singing is used whenever a character needs to entertain others or perform in a musical production. The use of the voice as an instrument. This creates a powerful connection with audiences without the need for equipment.",
          "keywords": "singing, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Classical Opera",
            "Rock & Metal Belting",
            "Choral & Sacred Hymns",
            "Lounge Jazz & Torch Songs",
            "Folk Ballads & Sea Shanties",
            "Overtone & Throat Singing",
            "Sub-Harmonic Vocalizations",
            "Vocal Whistling & Warbling",
            "Battle Hymns & Cadences",
            "Microtonal Alien Chants"
          ],
          "governing_attribute": "Charisma (Performance) or Constitution (Breath Control)",
          "mechanic": "Governing Ability: Charisma (Performance) or Constitution (Breath Control)\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n• *Project Voice:* CR 15 to be heard clearly over loud noise/combat.\n\nSpecialties:\n• Classical Opera: Projecting high, unamplified vibrato vocals across full orchestras with crystalline resonance.\n• Rock & Metal Belting: Singing powerful, gritty, overdriven lead vocals with intentional rasp and chest-drive.\n• Choral & Sacred Hymns: Blending harmonious soprano, alto, tenor, or bass lines into cathedral choirs.\n• Lounge Jazz & Torch Songs: Singing breathy, smoky, intimate vocal melodies into close microphones in clubs.\n• Folk Ballads & Sea Shanties: Singing narrative tales and rhythmic work songs that crowds can easily chant along with.\n• Overtone & Throat Singing: Producing two distinct pitch frequencies simultaneously through vocal-tract resonance.\n• Sub-Harmonic Vocalizations: Dropping into deep bass registers that rattle ribcages and project primal authority.\n• Vocal Whistling & Warbling: Executing intricate melodic trills and whistle registers mimicking birds or wind.\n• Battle Hymns & Cadences: Projecting rhythmic vocal cadences over gunfire to keep allied morale unshakeable.\n• Microtonal Alien Chants: Navigating vocal melodies that slide between traditional half-step and quarter-step scales.",
          "specialty_details": [
            {
              "name": "Classical Opera",
              "description": "Projecting high, unamplified vibrato vocals across full orchestras with crystalline resonance."
            },
            {
              "name": "Rock & Metal Belting",
              "description": "Singing powerful, gritty, overdriven lead vocals with intentional rasp and chest-drive."
            },
            {
              "name": "Choral & Sacred Hymns",
              "description": "Blending harmonious soprano, alto, tenor, or bass lines into cathedral choirs."
            },
            {
              "name": "Lounge Jazz & Torch Songs",
              "description": "Singing breathy, smoky, intimate vocal melodies into close microphones in clubs."
            },
            {
              "name": "Folk Ballads & Sea Shanties",
              "description": "Singing narrative tales and rhythmic work songs that crowds can easily chant along with."
            },
            {
              "name": "Overtone & Throat Singing",
              "description": "Producing two distinct pitch frequencies simultaneously through vocal-tract resonance."
            },
            {
              "name": "Sub-Harmonic Vocalizations",
              "description": "Dropping into deep bass registers that rattle ribcages and project primal authority."
            },
            {
              "name": "Vocal Whistling & Warbling",
              "description": "Executing intricate melodic trills and whistle registers mimicking birds or wind."
            },
            {
              "name": "Battle Hymns & Cadences",
              "description": "Projecting rhythmic vocal cadences over gunfire to keep allied morale unshakeable."
            },
            {
              "name": "Microtonal Alien Chants",
              "description": "Navigating vocal melodies that slide between traditional half-step and quarter-step scales."
            }
          ],
          "full_text": "### **Singing**\n\n* **Ability:** Charisma (Performance) or Constitution (Breath Control)  \n* **Description:** Singing is the skill of using one's voice to create music. It reflects a character's ability to use pitch, tone, and rhythm to convey emotions and communicate effectively. Singing is used whenever a character needs to entertain others or perform in a musical production. The use of the voice as an instrument. This creates a powerful connection with audiences without the need for equipment.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n  * *Project Voice:* CR 15 to be heard clearly over loud noise/combat.  \n* **Specialties:**   \n  * **Classical Opera:** Projecting high, unamplified vibrato vocals across full orchestras with crystalline resonance.  \n    * **Rock & Metal Belting:** Singing powerful, gritty, overdriven lead vocals with intentional rasp and chest-drive.  \n    * **Choral & Sacred Hymns:** Blending harmonious soprano, alto, tenor, or bass lines into cathedral choirs.  \n    * **Lounge Jazz & Torch Songs:** Singing breathy, smoky, intimate vocal melodies into close microphones in clubs.  \n    * **Folk Ballads & Sea Shanties:** Singing narrative tales and rhythmic work songs that crowds can easily chant along with.  \n    * **Overtone & Throat Singing:** Producing two distinct pitch frequencies simultaneously through vocal-tract resonance.  \n    * **Sub-Harmonic Vocalizations:** Dropping into deep bass registers that rattle ribcages and project primal authority.  \n    * **Vocal Whistling & Warbling:** Executing intricate melodic trills and whistle registers mimicking birds or wind.  \n    * **Battle Hymns & Cadences:** Projecting rhythmic vocal cadences over gunfire to keep allied morale unshakeable.  \n    * **Microtonal Alien Chants:** Navigating vocal melodies that slide between traditional half-step and quarter-step scales.\n\n  ###"
        },
        {
          "name": "String",
          "id": "social-string",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "String is the skill of playing string instruments like guitar or violin. It reflects a character's ability to create music using strings. String is used whenever a character needs to create music or perform in a musical production.Proficiency with instruments that produce sound via vibrating strings, whether plucked, strummed, or bowed.",
          "keywords": "string, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Electric Guitar",
            "Acoustic Guitar",
            "Violin & Fiddle",
            "Cello & Double Bass",
            "Concert Harp",
            "Lute & Mandolin",
            "Electric Bass Guitar",
            "Exotic Alien Zithers",
            "Banjo Playing",
            "Bowed Rebec & Archaic Strings"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n\nSpecialties:\n• Electric Guitar: Shredding high-gain lead solos, tapping fretboards, and chugging heavy distorted rhythm riffs.\n• Acoustic Guitar: Fingerpicking, flatpicking, and strumming steel-string and nylon acoustic guitars.\n• Violin & Fiddle: Bowing high-speed country fiddle breakdowns and expressive classical violin concertos.\n• Cello & Double Bass: Playing rich, deep, resonant bowed basslines that provide orchestral weight.\n• Concert Harp: Plucking cascading arpeggios and glissandos across large, multi-pedal classical harps.\n• Lute & Mandolin: Plucking rapid, delicate tremolos and Renaissance melodies on doubled-string instruments.\n• Electric Bass Guitar: Locking into the drummer's groove with slap-and-pop basslines and heavy walking rhythms.\n• Exotic Alien Zithers: Plucking flat, resonant soundboards equipped with alien sympathetic drone strings.\n• Banjo Playing: Executing high-speed three-finger Scruggs-style rolls and clawhammer rhythm patterns.\n• Bowed Rebec & Archaic Strings: Playing ancient, gut-stringed instruments with historical bows and rustic tunings.",
          "specialty_details": [
            {
              "name": "Electric Guitar",
              "description": "Shredding high-gain lead solos, tapping fretboards, and chugging heavy distorted rhythm riffs."
            },
            {
              "name": "Acoustic Guitar",
              "description": "Fingerpicking, flatpicking, and strumming steel-string and nylon acoustic guitars."
            },
            {
              "name": "Violin & Fiddle",
              "description": "Bowing high-speed country fiddle breakdowns and expressive classical violin concertos."
            },
            {
              "name": "Cello & Double Bass",
              "description": "Playing rich, deep, resonant bowed basslines that provide orchestral weight."
            },
            {
              "name": "Concert Harp",
              "description": "Plucking cascading arpeggios and glissandos across large, multi-pedal classical harps."
            },
            {
              "name": "Lute & Mandolin",
              "description": "Plucking rapid, delicate tremolos and Renaissance melodies on doubled-string instruments."
            },
            {
              "name": "Electric Bass Guitar",
              "description": "Locking into the drummer's groove with slap-and-pop basslines and heavy walking rhythms."
            },
            {
              "name": "Exotic Alien Zithers",
              "description": "Plucking flat, resonant soundboards equipped with alien sympathetic drone strings."
            },
            {
              "name": "Banjo Playing",
              "description": "Executing high-speed three-finger Scruggs-style rolls and clawhammer rhythm patterns."
            },
            {
              "name": "Bowed Rebec & Archaic Strings",
              "description": "Playing ancient, gut-stringed instruments with historical bows and rustic tunings."
            }
          ],
          "full_text": "### **String**\n\n* **Ability:** Charisma  \n* **Description:** String is the skill of playing string instruments like guitar or violin. It reflects a character's ability to create music using strings. String is used whenever a character needs to create music or perform in a musical production.Proficiency with instruments that produce sound via vibrating strings, whether plucked, strummed, or bowed.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n* **Specialties:**   \n  * **Electric Guitar:** Shredding high-gain lead solos, tapping fretboards, and chugging heavy distorted rhythm riffs.  \n    * **Acoustic Guitar:** Fingerpicking, flatpicking, and strumming steel-string and nylon acoustic guitars.  \n    * **Violin & Fiddle:** Bowing high-speed country fiddle breakdowns and expressive classical violin concertos.  \n    * **Cello & Double Bass:** Playing rich, deep, resonant bowed basslines that provide orchestral weight.  \n    * **Concert Harp:** Plucking cascading arpeggios and glissandos across large, multi-pedal classical harps.  \n    * **Lute & Mandolin:** Plucking rapid, delicate tremolos and Renaissance melodies on doubled-string instruments.  \n    * **Electric Bass Guitar:** Locking into the drummer's groove with slap-and-pop basslines and heavy walking rhythms.  \n    * **Exotic Alien Zithers:** Plucking flat, resonant soundboards equipped with alien sympathetic drone strings.  \n    * **Banjo Playing:** Executing high-speed three-finger Scruggs-style rolls and clawhammer rhythm patterns.  \n    * **Bowed Rebec & Archaic Strings:** Playing ancient, gut-stringed instruments with historical bows and rustic tunings.\n\n  ###"
        },
        {
          "name": "Style",
          "id": "social-style",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Style is the skill of creating a unique and distinctive appearance. It reflects a character's ability to use clothing, accessories, and other techniques to create a unique and memorable look. Style is used whenever a character needs to make a good impression or to stand out from the crowd. The knowledge of fashion, grooming, and personal aesthetics. It is the ability to make an impression before speaking a word. It involves dressing appropriately for high society or looking intimidating in street armor.",
          "keywords": "style, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "High-Society Elegance",
            "Streetwear & Cyberpunk Chic",
            "Corporate Executive Polish",
            "Military & Uniform Crispness",
            "Intimidating Mercenary Look",
            "Subtle Blend-In (Gray Man)",
            "Avant-Garde Alien Couture",
            "Gala Glamour",
            "Retro & Nostalgic Vintage",
            "Personal Grooming & Scent"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *First Impression:* CR 15 to grant a +2 bonus to the first **Diplomacy** or **Intimidate** check made in an encounter.\n• *Blend In:* Dress to match a specific social caste or group (opposed by Culture/Streetwise).\n\nSpecialties:\n• High-Society Elegance: Selecting tailored suits, noble sashes, and jewelry that radiate immense wealth and status.\n• Streetwear & Cyberpunk Chic: Styling leather jackets, neon hair, combat boots, and decals for maximum street cred.\n• Corporate Executive Polish: Dressing in crisp, minimalist, intimidating boardroom suits that project pure competence.\n• Military & Uniform Crispness: Ironing razor-sharp uniform creases, polishing boots to mirrors, and aligning ribbons.\n• Intimidating Mercenary Look: Layering battered combat rigs, scars, and holster wear that scream hardened killer.\n• Subtle Blend-In (Gray Man): Selecting ultra-nondescript, beige, forgettable clothing that leaves zero mental impression.\n• Avant-Garde Alien Couture: Pulling off radical alien silhouettes, kinetic fabrics, and exotic off-world color clashes.\n• Gala Glamour: Wearing head-turning, showstopping formal eveningwear that dominates room attention instantly.\n• Retro & Nostalgic Vintage: Rocking period-accurate antique threads, vintage flight jackets, and classic hats.\n• Personal Grooming & Scent: Mastering hair styling, facial hair trimming, and signature scents that leave lasting impressions.",
          "specialty_details": [
            {
              "name": "High-Society Elegance",
              "description": "Selecting tailored suits, noble sashes, and jewelry that radiate immense wealth and status."
            },
            {
              "name": "Streetwear & Cyberpunk Chic",
              "description": "Styling leather jackets, neon hair, combat boots, and decals for maximum street cred."
            },
            {
              "name": "Corporate Executive Polish",
              "description": "Dressing in crisp, minimalist, intimidating boardroom suits that project pure competence."
            },
            {
              "name": "Military & Uniform Crispness",
              "description": "Ironing razor-sharp uniform creases, polishing boots to mirrors, and aligning ribbons."
            },
            {
              "name": "Intimidating Mercenary Look",
              "description": "Layering battered combat rigs, scars, and holster wear that scream hardened killer."
            },
            {
              "name": "Subtle Blend-In (Gray Man)",
              "description": "Selecting ultra-nondescript, beige, forgettable clothing that leaves zero mental impression."
            },
            {
              "name": "Avant-Garde Alien Couture",
              "description": "Pulling off radical alien silhouettes, kinetic fabrics, and exotic off-world color clashes."
            },
            {
              "name": "Gala Glamour",
              "description": "Wearing head-turning, showstopping formal eveningwear that dominates room attention instantly."
            },
            {
              "name": "Retro & Nostalgic Vintage",
              "description": "Rocking period-accurate antique threads, vintage flight jackets, and classic hats."
            },
            {
              "name": "Personal Grooming & Scent",
              "description": "Mastering hair styling, facial hair trimming, and signature scents that leave lasting impressions."
            }
          ],
          "full_text": "### **Style**\n\n* **Ability:** Charisma  \n* **Description:** Style is the skill of creating a unique and distinctive appearance. It reflects a character's ability to use clothing, accessories, and other techniques to create a unique and memorable look. Style is used whenever a character needs to make a good impression or to stand out from the crowd. The knowledge of fashion, grooming, and personal aesthetics. It is the ability to make an impression before speaking a word. It involves dressing appropriately for high society or looking intimidating in street armor.  \n* **Mechanics:**  \n  * *First Impression:* CR 15 to grant a \\+2 bonus to the first **Diplomacy** or **Intimidate** check made in an encounter.  \n  * *Blend In:* Dress to match a specific social caste or group (opposed by Culture/Streetwise).  \n* **Specialties:**   \n  * **High-Society Elegance:** Selecting tailored suits, noble sashes, and jewelry that radiate immense wealth and status.  \n    * **Streetwear & Cyberpunk Chic:** Styling leather jackets, neon hair, combat boots, and decals for maximum street cred.  \n    * **Corporate Executive Polish:** Dressing in crisp, minimalist, intimidating boardroom suits that project pure competence.  \n    * **Military & Uniform Crispness:** Ironing razor-sharp uniform creases, polishing boots to mirrors, and aligning ribbons.  \n    * **Intimidating Mercenary Look:** Layering battered combat rigs, scars, and holster wear that scream hardened killer.  \n    * **Subtle Blend-In (Gray Man):** Selecting ultra-nondescript, beige, forgettable clothing that leaves zero mental impression.  \n    * **Avant-Garde Alien Couture:** Pulling off radical alien silhouettes, kinetic fabrics, and exotic off-world color clashes.  \n    * **Gala Glamour:** Wearing head-turning, showstopping formal eveningwear that dominates room attention instantly.  \n    * **Retro & Nostalgic Vintage:** Rocking period-accurate antique threads, vintage flight jackets, and classic hats.  \n    * **Personal Grooming & Scent:** Mastering hair styling, facial hair trimming, and signature scents that leave lasting impressions.\n\n  ###"
        },
        {
          "name": "Wind",
          "id": "social-wind",
          "group": "social",
          "baseAttr": "attr-stamina",
          "description": "Wind is the skill of playing wind instruments, like a flute or trumpet. It reflects a character's ability to create music using wind instruments. Wind is used whenever a character needs to create music or perform in a musical production. Proficiency with instruments that require breath to play, including woodwinds and brass.",
          "keywords": "wind, social, stamina, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Brass Trumpet & Cornet",
            "Saxophone (Alto/Tenor/Baritone)",
            "Flute & Piccolo",
            "Clarinet & Reed Instruments",
            "Bagpipes & War Pipes",
            "Harmonica & Blues Harp",
            "Trombone & Low Brass",
            "Hunting Horns & Bugles",
            "Alien Double-Pipes",
            "Didgeridoo & Drone Wind"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Performance:* Standard performance mechanics.\n\nSpecialties:\n• Brass Trumpet & Cornet: Blasting clear, ringing fanfares, jazzy muted solos, and piercing high-register brass lines.\n• Saxophone (Alto/Tenor/Baritone): Playing soulful, expressive jazz melodies, blues runs, and smooth vibrato riffs.\n• Flute & Piccolo: Flying through rapid, airy classical scales, birdlike trills, and breathy folk melodies.\n• Clarinet & Reed Instruments: Navigating woody, warm, wide-ranging melodies across complex key mechanisms.\n• Bagpipes & War Pipes: Driving continuous double-drone pipes and chanter melodies that carry for miles across fields.\n• Harmonica & Blues Harp: Bending reeds, cross-harping, and chugging train rhythms using cupped hands.\n• Trombone & Low Brass: Moving slide mechanics to execute smooth glissandos, punchy bass lines, and orchestral power.\n• Hunting Horns & Bugles: Sounding natural, valveless brass calls that carry across forests and battlefields.\n• Alien Double-Pipes: Playing exotic instruments requiring circular breathing to produce unceasing melodic loops.\n• Didgeridoo & Drone Wind: Producing deep, guttural, cyclical drone vibrations infused with vocalized animal growls.",
          "specialty_details": [
            {
              "name": "Brass Trumpet & Cornet",
              "description": "Blasting clear, ringing fanfares, jazzy muted solos, and piercing high-register brass lines."
            },
            {
              "name": "Saxophone (Alto/Tenor/Baritone)",
              "description": "Playing soulful, expressive jazz melodies, blues runs, and smooth vibrato riffs."
            },
            {
              "name": "Flute & Piccolo",
              "description": "Flying through rapid, airy classical scales, birdlike trills, and breathy folk melodies."
            },
            {
              "name": "Clarinet & Reed Instruments",
              "description": "Navigating woody, warm, wide-ranging melodies across complex key mechanisms."
            },
            {
              "name": "Bagpipes & War Pipes",
              "description": "Driving continuous double-drone pipes and chanter melodies that carry for miles across fields."
            },
            {
              "name": "Harmonica & Blues Harp",
              "description": "Bending reeds, cross-harping, and chugging train rhythms using cupped hands."
            },
            {
              "name": "Trombone & Low Brass",
              "description": "Moving slide mechanics to execute smooth glissandos, punchy bass lines, and orchestral power."
            },
            {
              "name": "Hunting Horns & Bugles",
              "description": "Sounding natural, valveless brass calls that carry across forests and battlefields."
            },
            {
              "name": "Alien Double-Pipes",
              "description": "Playing exotic instruments requiring circular breathing to produce unceasing melodic loops."
            },
            {
              "name": "Didgeridoo & Drone Wind",
              "description": "Producing deep, guttural, cyclical drone vibrations infused with vocalized animal growls."
            }
          ],
          "full_text": "### **Wind**\n\n* **Ability:** Charisma  \n* **Description:** Wind is the skill of playing wind instruments, like a flute or trumpet. It reflects a character's ability to create music using wind instruments. Wind is used whenever a character needs to create music or perform in a musical production. Proficiency with instruments that require breath to play, including woodwinds and brass.  \n* **Mechanics:**  \n  * *Performance:* Standard performance mechanics.  \n* **Specialties:**   \n  * **Brass Trumpet & Cornet:** Blasting clear, ringing fanfares, jazzy muted solos, and piercing high-register brass lines.  \n    * **Saxophone (Alto/Tenor/Baritone):** Playing soulful, expressive jazz melodies, blues runs, and smooth vibrato riffs.  \n    * **Flute & Piccolo:** Flying through rapid, airy classical scales, birdlike trills, and breathy folk melodies.  \n    * **Clarinet & Reed Instruments:** Navigating woody, warm, wide-ranging melodies across complex key mechanisms.  \n    * **Bagpipes & War Pipes:** Driving continuous double-drone pipes and chanter melodies that carry for miles across fields.  \n    * **Harmonica & Blues Harp:** Bending reeds, cross-harping, and chugging train rhythms using cupped hands.  \n    * **Trombone & Low Brass:** Moving slide mechanics to execute smooth glissandos, punchy bass lines, and orchestral power.  \n    * **Hunting Horns & Bugles:** Sounding natural, valveless brass calls that carry across forests and battlefields.  \n    * **Alien Double-Pipes:** Playing exotic instruments requiring circular breathing to produce unceasing melodic loops.  \n    * **Didgeridoo & Drone Wind:** Producing deep, guttural, cyclical drone vibrations infused with vocalized animal growls.\n\n---"
        }
      ]
    },
    {
      "title": "Manipulation",
      "skills": [
        {
          "name": "Barter",
          "id": "social-barter",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Barter is the skill of trading goods and services without relying solely on currency. It reflects a character's ability to negotiate value, haggle for better prices, and reach mutually beneficial agreements in trade. Barter is used whenever a character needs to acquire items, services, or information through direct exchange. This includes assessing the relative value of goods, identifying market trends, and convincing others of the worth of a trade. The art of negotiation and exchange.",
          "keywords": "barter, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Street Market Haggling",
            "Bulk Discount Negotiation",
            "Non-Monetary Trade Swapping",
            "Margin Squeezing",
            "Trade Goods Appraisal",
            "Closing the Deal",
            "Credit Terms & Financing",
            "Collateral Negotiation",
            "Pawn Valuation",
            "Surplus Liquidating"
          ],
          "governing_attribute": "Charisma (or Wisdom)",
          "mechanic": "Governing Ability: Charisma (or Wisdom)\n\nMechanics:\n• **Negotiate:** Opposed check vs. the target's **Diplomacy** or **Insight**.\n• **Appraise:** CR 15+ to determine the true value or rarity of an object or service.\n\nSpecialties:\n• Street Market Haggling: Whittling down the asking price of street vendors and cantina fences credit by credit.\n• Bulk Discount Negotiation: Securing large percentage-off price breaks when buying weapon crates or fuel tons in bulk.\n• Non-Monetary Trade Swapping: Negotiating equal-value item-for-item swaps when credits are useless or unavailable.\n• Margin Squeezing: Forcing suppliers to drop shipping, packaging, and handling fees from commercial sales.\n• Trade Goods Appraisal: Accurately assessing what your own carried loot is realistically worth to a local buyer.\n• Closing the Deal: Reading the precise moment a buyer or seller is on the fence and locking down the transaction.\n• Credit Terms & Financing: Bargaining low interest rates and extended repayment timelines on borrowed capital.\n• Collateral Negotiation: Convincing loan sharks or merchants to accept ships, deeds, or cyberware as trade collateral.\n• Pawn Valuation: Squeezing the maximum instant credit payout from pawn brokers for stolen or hot goods.\n• Surplus Liquidating: Dumping unwanted bulk inventory quickly onto frontier merchants without taking a total loss.",
          "specialty_details": [
            {
              "name": "Street Market Haggling",
              "description": "Whittling down the asking price of street vendors and cantina fences credit by credit."
            },
            {
              "name": "Bulk Discount Negotiation",
              "description": "Securing large percentage-off price breaks when buying weapon crates or fuel tons in bulk."
            },
            {
              "name": "Non-Monetary Trade Swapping",
              "description": "Negotiating equal-value item-for-item swaps when credits are useless or unavailable."
            },
            {
              "name": "Margin Squeezing",
              "description": "Forcing suppliers to drop shipping, packaging, and handling fees from commercial sales."
            },
            {
              "name": "Trade Goods Appraisal",
              "description": "Accurately assessing what your own carried loot is realistically worth to a local buyer."
            },
            {
              "name": "Closing the Deal",
              "description": "Reading the precise moment a buyer or seller is on the fence and locking down the transaction."
            },
            {
              "name": "Credit Terms & Financing",
              "description": "Bargaining low interest rates and extended repayment timelines on borrowed capital."
            },
            {
              "name": "Collateral Negotiation",
              "description": "Convincing loan sharks or merchants to accept ships, deeds, or cyberware as trade collateral."
            },
            {
              "name": "Pawn Valuation",
              "description": "Squeezing the maximum instant credit payout from pawn brokers for stolen or hot goods."
            },
            {
              "name": "Surplus Liquidating",
              "description": "Dumping unwanted bulk inventory quickly onto frontier merchants without taking a total loss."
            }
          ],
          "full_text": "### **Barter**\n\n* **Ability:** Charisma (or Wisdom)  \n* **Description:** Barter is the skill of trading goods and services without relying solely on currency. It reflects a character's ability to negotiate value, haggle for better prices, and reach mutually beneficial agreements in trade. Barter is used whenever a character needs to acquire items, services, or information through direct exchange. This includes assessing the relative value of goods, identifying market trends, and convincing others of the worth of a trade. The art of negotiation and exchange.  \n* **Mechanics:**  \n  * **Negotiate:** Opposed check vs. the target's **Diplomacy** or **Insight**.  \n  * **Appraise:** CR 15+ to determine the true value or rarity of an object or service.  \n* **Specialties:**  \n  * **Street Market Haggling:** Whittling down the asking price of street vendors and cantina fences credit by credit.  \n    * **Bulk Discount Negotiation:** Securing large percentage-off price breaks when buying weapon crates or fuel tons in bulk.  \n    * **Non-Monetary Trade Swapping:** Negotiating equal-value item-for-item swaps when credits are useless or unavailable.  \n    * **Margin Squeezing:** Forcing suppliers to drop shipping, packaging, and handling fees from commercial sales.  \n    * **Trade Goods Appraisal:** Accurately assessing what your own carried loot is realistically worth to a local buyer.  \n    * **Closing the Deal:** Reading the precise moment a buyer or seller is on the fence and locking down the transaction.  \n    * **Credit Terms & Financing:** Bargaining low interest rates and extended repayment timelines on borrowed capital.  \n    * **Collateral Negotiation:** Convincing loan sharks or merchants to accept ships, deeds, or cyberware as trade collateral.  \n    * **Pawn Valuation:** Squeezing the maximum instant credit payout from pawn brokers for stolen or hot goods.  \n    * **Surplus Liquidating:** Dumping unwanted bulk inventory quickly onto frontier merchants without taking a total loss.\n\n  ###"
        },
        {
          "name": "Bluff",
          "id": "social-bluff",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Bluff is the skill of lying convincingly. It reflects a character's ability to deceive others and manipulate situations to their advantage. Bluff is used whenever a character needs to convince someone of something that isn't true, whether it's to avoid danger or to gain information. This can include things like lying about one's identity, pretending to be someone else, or making up a story to cover up a mistake. The ability to lie convincingly, deceive others, and manipulate situations to one’s advantage. It covers everything from little white lies to elaborate cons and feints in combat.",
          "keywords": "bluff, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Fast-Talking",
            "Tactical Feints",
            "Impromptu Cover Stories",
            "Digital Credential Faking",
            "Poker Face & Emotional Masking",
            "Grifts & Confidence Scams",
            "False Identity Impersonation",
            "Shifting the Blame",
            "Manufactured Rumors",
            "Misdirection of Intent"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• **Deceive:** Opposed check vs. **Insight (Sense Motive)**.\n• **Feint:** Opposed check vs. **Insight** (or Defense) in combat to deny a target their Agility bonus to Defense for the next attack.\n• **Create Distraction:** CR 15+ to momentarily divert attention (often used to Hide).\n\nSpecialties:\n• Fast-Talking: Overwhelming security guards and dock officials with rapid jargon and manufactured emergencies.\n• Tactical Feints: Misleading an opponent's combat guard with false eye glances, fake lunges, and baiting strikes.\n• Impromptu Cover Stories: Fabricating believable, airtight explanations on the fly when caught red-handed in restricted areas.\n• Digital Credential Faking: Confidently presenting forged ID passes and cloned clearance badges without sweating.\n• Poker Face & Emotional Masking: Keeping an absolute stone-cold, unreadable expression during intense stress and pain.\n• Grifts & Confidence Scams: Gaining the total trust of marks to swindle their wealth, ships, or warehouse access.\n• False Identity Impersonation: Convincingly pretending to be an inspector, naval officer, or physician through tone alone.\n• Shifting the Blame: Planting verbal suspicion onto an innocent bystander or rival to deflect internal investigations.\n• Manufactured Rumors: Spreading false gossip and fabricated leaks through a spaceport to manipulate public behavior.\n• Misdirection of Intent: Convincing a room you are unarmed and terrified while quietly lining up an ambush.",
          "specialty_details": [
            {
              "name": "Fast-Talking",
              "description": "Overwhelming security guards and dock officials with rapid jargon and manufactured emergencies."
            },
            {
              "name": "Tactical Feints",
              "description": "Misleading an opponent's combat guard with false eye glances, fake lunges, and baiting strikes."
            },
            {
              "name": "Impromptu Cover Stories",
              "description": "Fabricating believable, airtight explanations on the fly when caught red-handed in restricted areas."
            },
            {
              "name": "Digital Credential Faking",
              "description": "Confidently presenting forged ID passes and cloned clearance badges without sweating."
            },
            {
              "name": "Poker Face & Emotional Masking",
              "description": "Keeping an absolute stone-cold, unreadable expression during intense stress and pain."
            },
            {
              "name": "Grifts & Confidence Scams",
              "description": "Gaining the total trust of marks to swindle their wealth, ships, or warehouse access."
            },
            {
              "name": "False Identity Impersonation",
              "description": "Convincingly pretending to be an inspector, naval officer, or physician through tone alone."
            },
            {
              "name": "Shifting the Blame",
              "description": "Planting verbal suspicion onto an innocent bystander or rival to deflect internal investigations."
            },
            {
              "name": "Manufactured Rumors",
              "description": "Spreading false gossip and fabricated leaks through a spaceport to manipulate public behavior."
            },
            {
              "name": "Misdirection of Intent",
              "description": "Convincing a room you are unarmed and terrified while quietly lining up an ambush."
            }
          ],
          "full_text": "### **Bluff**\n\n* **Ability:** Charisma  \n* **Description:** Bluff is the skill of lying convincingly. It reflects a character's ability to deceive others and manipulate situations to their advantage. Bluff is used whenever a character needs to convince someone of something that isn't true, whether it's to avoid danger or to gain information. This can include things like lying about one's identity, pretending to be someone else, or making up a story to cover up a mistake. The ability to lie convincingly, deceive others, and manipulate situations to one’s advantage. It covers everything from little white lies to elaborate cons and feints in combat.  \n* **Mechanics:**  \n  * **Deceive:** Opposed check vs. **Insight (Sense Motive)**.  \n  * **Feint:** Opposed check vs. **Insight** (or Defense) in combat to deny a target their Agility bonus to Defense for the next attack.  \n  * **Create Distraction:** CR 15+ to momentarily divert attention (often used to Hide).  \n* **Specialties:**  \n  * **Fast-Talking:** Overwhelming security guards and dock officials with rapid jargon and manufactured emergencies.  \n    * **Tactical Feints:** Misleading an opponent's combat guard with false eye glances, fake lunges, and baiting strikes.  \n    * **Impromptu Cover Stories:** Fabricating believable, airtight explanations on the fly when caught red-handed in restricted areas.  \n    * **Digital Credential Faking:** Confidently presenting forged ID passes and cloned clearance badges without sweating.  \n    * **Poker Face & Emotional Masking:** Keeping an absolute stone-cold, unreadable expression during intense stress and pain.  \n    * **Grifts & Confidence Scams:** Gaining the total trust of marks to swindle their wealth, ships, or warehouse access.  \n    * **False Identity Impersonation:** Convincingly pretending to be an inspector, naval officer, or physician through tone alone.  \n    * **Shifting the Blame:** Planting verbal suspicion onto an innocent bystander or rival to deflect internal investigations.  \n    * **Manufactured Rumors:** Spreading false gossip and fabricated leaks through a spaceport to manipulate public behavior.  \n    * **Misdirection of Intent:** Convincing a room you are unarmed and terrified while quietly lining up an ambush."
        },
        {
          "name": "Diplomacy",
          "id": "social-diplomacy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Diplomacy is the skill of negotiating and persuading others. It reflects a character's ability to communicate effectively and build relationships with others. Diplomacy is used whenever a character needs to convince someone of something that is true, whether it's to gain support or to resolve a conflict. This can include things like negotiating a peace treaty, convincing a king to support a cause, or persuading a merchant to lower their prices. The art of negotiation, persuasion, and maintaining positive relations. It is used to convince others of the truth, gain support, resolve conflicts peacefully, and navigate complex social hierarchies.",
          "keywords": "diplomacy, social, charisma, interaction, influence, persuasion",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Hostility De-escalation",
            "Formal Treaty Drafting",
            "Consensus Building",
            "High-Society Etiquette",
            "Inter-Faction Mediation",
            "Goodwill Cultivation",
            "Official Information Gathering",
            "Apology & Restitution Brokerage",
            "Alliance Brokering",
            "Hostage Negotiation"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• **Influence Attitude:** Change an NPC's attitude (e.g., from Hostile to Unfriendly, or Indifferent to Friendly). CR depends on the starting attitude (CR 15 for Indifferent, CR 25+ for Hostile).\n• **Negotiation:** Opposed check vs. the target's **Diplomacy** or **Insight**.\n• **Gather Information (Formal):** CR 15+ to find information through official channels or high society.\n\nSpecialties:\n• Hostility De-escalation: Talking down armed, angry standoffs and convincing aggressive groups to lower their weapons.\n• Formal Treaty Drafting: Formulating compromise terms, ceasefire articles, and non-aggression treaties between factions.\n• Consensus Building: Uniting bickering political factions or mercenary squads behind a singular operational goal.\n• High-Society Etiquette: Seamlessly observing royal court manners, formal toasts, and elite seating protocols.\n• Inter-Faction Mediation: Serving as an objective neutral arbitrator to settle disputes between rival mining guilds or houses.\n• Goodwill Cultivation: Turning neutral or mildly suspicious planetary leaders into warm, cooperative political allies.\n• Official Information Gathering: Eliciting sensitive political intelligence smoothly during high-level formal state dinners.\n• Apology & Restitution Brokerage: Smoothing over diplomatic insults and international blunders with grace and reparations.\n• Alliance Brokering: Forging binding military and mutual-defense pacts between independent star systems.\n• Hostage Negotiation: Communicating calmly with kidnappers and terrorists to trade concessions for living captives.",
          "specialty_details": [
            {
              "name": "Hostility De-escalation",
              "description": "Talking down armed, angry standoffs and convincing aggressive groups to lower their weapons."
            },
            {
              "name": "Formal Treaty Drafting",
              "description": "Formulating compromise terms, ceasefire articles, and non-aggression treaties between factions."
            },
            {
              "name": "Consensus Building",
              "description": "Uniting bickering political factions or mercenary squads behind a singular operational goal."
            },
            {
              "name": "High-Society Etiquette",
              "description": "Seamlessly observing royal court manners, formal toasts, and elite seating protocols."
            },
            {
              "name": "Inter-Faction Mediation",
              "description": "Serving as an objective neutral arbitrator to settle disputes between rival mining guilds or houses."
            },
            {
              "name": "Goodwill Cultivation",
              "description": "Turning neutral or mildly suspicious planetary leaders into warm, cooperative political allies."
            },
            {
              "name": "Official Information Gathering",
              "description": "Eliciting sensitive political intelligence smoothly during high-level formal state dinners."
            },
            {
              "name": "Apology & Restitution Brokerage",
              "description": "Smoothing over diplomatic insults and international blunders with grace and reparations."
            },
            {
              "name": "Alliance Brokering",
              "description": "Forging binding military and mutual-defense pacts between independent star systems."
            },
            {
              "name": "Hostage Negotiation",
              "description": "Communicating calmly with kidnappers and terrorists to trade concessions for living captives."
            }
          ],
          "full_text": "### **Diplomacy**\n\n* **Ability:** Charisma  \n* **Description:** Diplomacy is the skill of negotiating and persuading others. It reflects a character's ability to communicate effectively and build relationships with others. Diplomacy is used whenever a character needs to convince someone of something that is true, whether it's to gain support or to resolve a conflict. This can include things like negotiating a peace treaty, convincing a king to support a cause, or persuading a merchant to lower their prices. The art of negotiation, persuasion, and maintaining positive relations. It is used to convince others of the truth, gain support, resolve conflicts peacefully, and navigate complex social hierarchies.  \n* **Mechanics:**  \n  * **Influence Attitude:** Change an NPC's attitude (e.g., from Hostile to Unfriendly, or Indifferent to Friendly). CR depends on the starting attitude (CR 15 for Indifferent, CR 25+ for Hostile).  \n  * **Negotiation:** Opposed check vs. the target's **Diplomacy** or **Insight**.  \n  * **Gather Information (Formal):** CR 15+ to find information through official channels or high society.  \n* **Specialties:**  \n  * **Hostility De-escalation:** Talking down armed, angry standoffs and convincing aggressive groups to lower their weapons.  \n    * **Formal Treaty Drafting:** Formulating compromise terms, ceasefire articles, and non-aggression treaties between factions.  \n    * **Consensus Building:** Uniting bickering political factions or mercenary squads behind a singular operational goal.  \n    * **High-Society Etiquette:** Seamlessly observing royal court manners, formal toasts, and elite seating protocols.  \n    * **Inter-Faction Mediation:** Serving as an objective neutral arbitrator to settle disputes between rival mining guilds or houses.  \n    * **Goodwill Cultivation:** Turning neutral or mildly suspicious planetary leaders into warm, cooperative political allies.  \n    * **Official Information Gathering:** Eliciting sensitive political intelligence smoothly during high-level formal state dinners.  \n    * **Apology & Restitution Brokerage:** Smoothing over diplomatic insults and international blunders with grace and reparations.  \n    * **Alliance Brokering:** Forging binding military and mutual-defense pacts between independent star systems.  \n    * **Hostage Negotiation:** Communicating calmly with kidnappers and terrorists to trade concessions for living captives.\n\n  ###"
        },
        {
          "name": "Insight",
          "id": "social-insight",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Insight is the skill of understanding and empathizing with others. It reflects a character's ability to comprehend and appropriately react to both broad problems of society and interpersonal struggles. Insight is used whenever a character needs to understand the emotions and feelings of others, whether it's to avoid conflict or to build relationships. This can include things like identifying social cues, taking others' perspectives, demonstrating empathy and compassion, and showing concern for the feelings of others. The skill of understanding and empathizing with others. It reflects a character's ability to comprehend and appropriately react to both broad societal problems and interpersonal struggles. Insight is used to read emotions, detect lies, and understand hidden motives.",
          "keywords": "insight, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Lie Detection",
            "Emotional Empathy",
            "Cold Reading",
            "Motive Deduction",
            "Social Tension Assessment",
            "Coercion & Blackmail Detection",
            "Hidden Relationship Spotting",
            "Mental Instability Profiling",
            "Body Language Reading",
            "Sincerity Gauging"
          ],
          "governing_attribute": "Wisdom (or Charisma for active social maneuvering)",
          "mechanic": "Governing Ability: Wisdom (or Charisma for active social maneuvering)\n\nMechanics:\n• **Insight:** Opposed check vs. **Bluff**. Success reveals if the target is lying or hiding something.\n• **Read Situation:** CR 15 to pick up on social dynamics or hidden tension in a room.\n\nSpecialties:\n• Lie Detection: Catching subtle facial tics, vocal pitch spikes, and pupil dilations that expose falsehoods.\n• Emotional Empathy: Sensing buried grief, simmering rage, or sheer panic beneath a calm exterior.\n• Cold Reading: Deducing a stranger's profession, wealth, origin, and marital status from worn clothes and ring marks.\n• Motive Deduction: Figuring out what an individual truly wants—money, vengeance, glory, or safety.\n• Social Tension Assessment: Walking into a crowded cantina or boardroom and instantly sensing imminent violence.\n• Coercion & Blackmail Detection: Spotting when an NPC is speaking under duress, extortion, or psychic domination.\n• Hidden Relationship Spotting: Noticing subtle glances and body orientation that reveal secret lovers or conspirators.\n• Mental Instability Profiling: Recognizing symptoms of paranoia, cyber-psychosis, withdrawal, or chemical imbalance.\n• Body Language Reading: Predicting an opponent's sudden draw, reach for a weapon, or sprint for an exit before it starts.\n• Sincerity Gauging: Determining if a stated apology, peace offer, or surrender is completely authentic or a setup.",
          "specialty_details": [
            {
              "name": "Lie Detection",
              "description": "Catching subtle facial tics, vocal pitch spikes, and pupil dilations that expose falsehoods."
            },
            {
              "name": "Emotional Empathy",
              "description": "Sensing buried grief, simmering rage, or sheer panic beneath a calm exterior."
            },
            {
              "name": "Cold Reading",
              "description": "Deducing a stranger's profession, wealth, origin, and marital status from worn clothes and ring marks."
            },
            {
              "name": "Motive Deduction",
              "description": "Figuring out what an individual truly wants—money, vengeance, glory, or safety."
            },
            {
              "name": "Social Tension Assessment",
              "description": "Walking into a crowded cantina or boardroom and instantly sensing imminent violence."
            },
            {
              "name": "Coercion & Blackmail Detection",
              "description": "Spotting when an NPC is speaking under duress, extortion, or psychic domination."
            },
            {
              "name": "Hidden Relationship Spotting",
              "description": "Noticing subtle glances and body orientation that reveal secret lovers or conspirators."
            },
            {
              "name": "Mental Instability Profiling",
              "description": "Recognizing symptoms of paranoia, cyber-psychosis, withdrawal, or chemical imbalance."
            },
            {
              "name": "Body Language Reading",
              "description": "Predicting an opponent's sudden draw, reach for a weapon, or sprint for an exit before it starts."
            },
            {
              "name": "Sincerity Gauging",
              "description": "Determining if a stated apology, peace offer, or surrender is completely authentic or a setup."
            }
          ],
          "full_text": "### **Insight**\n\n* **Ability:** Wisdom (or Charisma for active social maneuvering)  \n* **Description:** Insight is the skill of understanding and empathizing with others. It reflects a character's ability to comprehend and appropriately react to both broad problems of society and interpersonal struggles. Insight is used whenever a character needs to understand the emotions and feelings of others, whether it's to avoid conflict or to build relationships. This can include things like identifying social cues, taking others' perspectives, demonstrating empathy and compassion, and showing concern for the feelings of others. The skill of understanding and empathizing with others. It reflects a character's ability to comprehend and appropriately react to both broad societal problems and interpersonal struggles. Insight is used to read emotions, detect lies, and understand hidden motives.  \n* **Mechanics:**  \n  * **Insight:** Opposed check vs. **Bluff**. Success reveals if the target is lying or hiding something.  \n  * **Read Situation:** CR 15 to pick up on social dynamics or hidden tension in a room.  \n* **Specialties:**  \n  * **Lie Detection:** Catching subtle facial tics, vocal pitch spikes, and pupil dilations that expose falsehoods.  \n    * **Emotional Empathy:** Sensing buried grief, simmering rage, or sheer panic beneath a calm exterior.  \n    * **Cold Reading:** Deducing a stranger's profession, wealth, origin, and marital status from worn clothes and ring marks.  \n    * **Motive Deduction:** Figuring out what an individual truly wants—money, vengeance, glory, or safety.  \n    * **Social Tension Assessment:** Walking into a crowded cantina or boardroom and instantly sensing imminent violence.  \n    * **Coercion & Blackmail Detection:** Spotting when an NPC is speaking under duress, extortion, or psychic domination.  \n    * **Hidden Relationship Spotting:** Noticing subtle glances and body orientation that reveal secret lovers or conspirators.  \n    * **Mental Instability Profiling:** Recognizing symptoms of paranoia, cyber-psychosis, withdrawal, or chemical imbalance.  \n    * **Body Language Reading:** Predicting an opponent's sudden draw, reach for a weapon, or sprint for an exit before it starts.  \n    * **Sincerity Gauging:** Determining if a stated apology, peace offer, or surrender is completely authentic or a setup.\n\n  ###"
        },
        {
          "name": "Intimidate",
          "id": "social-intimidate",
          "group": "social",
          "baseAttr": "attr-strength",
          "description": "Intimidation is the skill of using fear and threats to control others. It reflects a character's ability to instill fear in others and manipulate situations to their advantage. Intimidate is used whenever a character needs to scare someone into doing something, whether it's to gain information or to avoid danger. This can include things like threatening physical harm, using one's reputation to intimidate others, or using psychological tactics to make someone feel powerless. The skill of coercing others through fear, physical threats, or sheer force of personality. It can be used to interrogate prisoners, demoralize enemies, or force compliance.",
          "keywords": "intimidate, social, strength, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Physical Menace",
            "Interrogation Under Duress",
            "Cold Psychological Menace",
            "Combat Demoralization",
            "Reputation Posturing",
            "Veiled Extortion & Threats",
            "Stare-Down",
            "Interrogative Shock Tactics",
            "Crowd Dispersal",
            "Exploiting Phobias"
          ],
          "governing_attribute": "Charisma (or Strength for physical threats)",
          "mechanic": "Governing Ability: Charisma (or Strength for physical threats)\n\nMechanics:\n• **Coerce:** Opposed check vs. the target's **Insight** or **Willpower** (Level + Wisdom). Success forces the target to act friendly or compliant temporarily.\n• **Demoralize:** Standard action in combat. Opposed check vs. target's **Insight** or **Willpower**. Success leaves the target **Shaken** (-2 to attacks/checks) for 1 round.\n\nSpecialties:\n• Physical Menace: Towering over targets, cracking knuckles, and using size and muscle mass to compel obedience.\n• Interrogation Under Duress: Breaking the psychological resolve of captured prisoners to extract codes and coordinates.\n• Cold Psychological Menace: Speaking in calm, quiet, matter-of-fact tones that make it clear refusal equals death.\n• Combat Demoralization: Unleashing a terrifying war cry or lethal glare to leave an opponent shaken and hesitation-prone.\n• Reputation Posturing: Using your known notorious body count or terrifying faction affiliation to cow bystanders.\n• Veiled Extortion & Threats: Implying terrible harm to a target's family, business, or ship without stating it outright.\n• Stare-Down: Winning intense eye-contact dominance battles to force a rival to look away and yield ground.\n• Interrogative Shock Tactics: Slamming tables, firing near a target's ear, or breaking fingers to shatter stubborn silences.\n• Crowd Dispersal: Roaring commands that send curious civilian crowds and street onlookers fleeing in absolute terror.\n• Exploiting Phobias: Leveraging a target's known terror of vacuum, drowning, insects, or fire to force immediate compliance.",
          "specialty_details": [
            {
              "name": "Physical Menace",
              "description": "Towering over targets, cracking knuckles, and using size and muscle mass to compel obedience."
            },
            {
              "name": "Interrogation Under Duress",
              "description": "Breaking the psychological resolve of captured prisoners to extract codes and coordinates."
            },
            {
              "name": "Cold Psychological Menace",
              "description": "Speaking in calm, quiet, matter-of-fact tones that make it clear refusal equals death."
            },
            {
              "name": "Combat Demoralization",
              "description": "Unleashing a terrifying war cry or lethal glare to leave an opponent shaken and hesitation-prone."
            },
            {
              "name": "Reputation Posturing",
              "description": "Using your known notorious body count or terrifying faction affiliation to cow bystanders."
            },
            {
              "name": "Veiled Extortion & Threats",
              "description": "Implying terrible harm to a target's family, business, or ship without stating it outright."
            },
            {
              "name": "Stare-Down",
              "description": "Winning intense eye-contact dominance battles to force a rival to look away and yield ground."
            },
            {
              "name": "Interrogative Shock Tactics",
              "description": "Slamming tables, firing near a target's ear, or breaking fingers to shatter stubborn silences."
            },
            {
              "name": "Crowd Dispersal",
              "description": "Roaring commands that send curious civilian crowds and street onlookers fleeing in absolute terror."
            },
            {
              "name": "Exploiting Phobias",
              "description": "Leveraging a target's known terror of vacuum, drowning, insects, or fire to force immediate compliance."
            }
          ],
          "full_text": "### **Intimidate**\n\n* **Ability:** Charisma (or Strength for physical threats)  \n* **Description:** Intimidation is the skill of using fear and threats to control others. It reflects a character's ability to instill fear in others and manipulate situations to their advantage. Intimidate is used whenever a character needs to scare someone into doing something, whether it's to gain information or to avoid danger. This can include things like threatening physical harm, using one's reputation to intimidate others, or using psychological tactics to make someone feel powerless. The skill of coercing others through fear, physical threats, or sheer force of personality. It can be used to interrogate prisoners, demoralize enemies, or force compliance.  \n* **Mechanics:**  \n  * **Coerce:** Opposed check vs. the target's **Insight** or **Willpower** (Level \\+ Wisdom). Success forces the target to act friendly or compliant temporarily.  \n  * **Demoralize:** Standard action in combat. Opposed check vs. target's **Insight** or **Willpower**. Success leaves the target **Shaken** (-2 to attacks/checks) for 1 round.  \n* **Specialties:**  \n  * **Physical Menace:** Towering over targets, cracking knuckles, and using size and muscle mass to compel obedience.  \n    * **Interrogation Under Duress:** Breaking the psychological resolve of captured prisoners to extract codes and coordinates.  \n    * **Cold Psychological Menace:** Speaking in calm, quiet, matter-of-fact tones that make it clear refusal equals death.  \n    * **Combat Demoralization:** Unleashing a terrifying war cry or lethal glare to leave an opponent shaken and hesitation-prone.  \n    * **Reputation Posturing:** Using your known notorious body count or terrifying faction affiliation to cow bystanders.  \n    * **Veiled Extortion & Threats:** Implying terrible harm to a target's family, business, or ship without stating it outright.  \n    * **Stare-Down:** Winning intense eye-contact dominance battles to force a rival to look away and yield ground.  \n    * **Interrogative Shock Tactics:** Slamming tables, firing near a target's ear, or breaking fingers to shatter stubborn silences.  \n    * **Crowd Dispersal:** Roaring commands that send curious civilian crowds and street onlookers fleeing in absolute terror.  \n    * **Exploiting Phobias:** Leveraging a target's known terror of vacuum, drowning, insects, or fire to force immediate compliance.\n\n  ###"
        },
        {
          "name": "Leadership",
          "id": "social-leadership",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Leadership is the skill of inspiring, organizing, and guiding others toward a common goal. It reflects a character's ability to motivate their allies, maintain morale, and direct the flow of a team or larger group. Leadership is used whenever a character needs to command respect, manage a team, or provide direction in challenging circumstances. It covers leading troops in battle, managing organizational structures, or simply keeping a group focused and cohesive under pressure.",
          "keywords": "leadership, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Battlefield Tactical Command",
            "Inspiring Speeches",
            "Crew Morale Management",
            "Crisis Command",
            "Delegation & Task Assignment",
            "Mutiny Suppression",
            "Rallying Broken Allies",
            "Strategic Vision Planning",
            "Mentorship & Drill",
            "Personal Accountability"
          ],
          "governing_attribute": "Charisma",
          "mechanic": "Governing Ability: Charisma\n\nMechanics:\n• *Inspire:* CR 15 to grant allies a +1 morale bonus to specific checks or saves for a duration.\n• *Organize:* CR 20 to coordinate a team's efforts for a complex project, reducing time or increasing efficiency.\n• *Opposed Check:* Used to maintain morale against fear or discord effects.\n\nSpecialties:\n• Battlefield Tactical Command: Issuing clear, authoritative firing and movement orders in the deafening noise of combat.\n• Inspiring Speeches: Delivering electrifying orations that banish fear, rally broken lines, and restore morale.\n• Crew Morale Management: Maintaining high spirits, solving internal grievances, and keeping a starship crew cohesive.\n• Crisis Command: Stepping into sudden chaos—explosions, hull breaches, captain deaths—and taking total control.\n• Delegation & Task Assignment: Assigning the exact right operative to the exact right task to maximize group efficiency.\n• Mutiny Suppression: Quelling brewing insurrections and subduing rebellious crewmen through sheer force of will.\n• Rallying Broken Allies: Snapping panicked or terrified companions out of shock and putting their weapons back in the fight.\n• Strategic Vision Planning: Formulating long-term campaign roadmaps that keep an entire faction or fleet pointed forward.\n• Mentorship & Drill: Training recruits to overcome their personal doubts, forging them into disciplined squad members.\n• Personal Accountability: Taking public responsibility for failures to retain absolute loyalty and trust from subordinates.",
          "specialty_details": [
            {
              "name": "Battlefield Tactical Command",
              "description": "Issuing clear, authoritative firing and movement orders in the deafening noise of combat."
            },
            {
              "name": "Inspiring Speeches",
              "description": "Delivering electrifying orations that banish fear, rally broken lines, and restore morale."
            },
            {
              "name": "Crew Morale Management",
              "description": "Maintaining high spirits, solving internal grievances, and keeping a starship crew cohesive."
            },
            {
              "name": "Crisis Command",
              "description": "Stepping into sudden chaos—explosions, hull breaches, captain deaths—and taking total control."
            },
            {
              "name": "Delegation & Task Assignment",
              "description": "Assigning the exact right operative to the exact right task to maximize group efficiency."
            },
            {
              "name": "Mutiny Suppression",
              "description": "Quelling brewing insurrections and subduing rebellious crewmen through sheer force of will."
            },
            {
              "name": "Rallying Broken Allies",
              "description": "Snapping panicked or terrified companions out of shock and putting their weapons back in the fight."
            },
            {
              "name": "Strategic Vision Planning",
              "description": "Formulating long-term campaign roadmaps that keep an entire faction or fleet pointed forward."
            },
            {
              "name": "Mentorship & Drill",
              "description": "Training recruits to overcome their personal doubts, forging them into disciplined squad members."
            },
            {
              "name": "Personal Accountability",
              "description": "Taking public responsibility for failures to retain absolute loyalty and trust from subordinates."
            }
          ],
          "full_text": "### **Leadership**\n\n* **Ability:** Charisma  \n* **Description:** Leadership is the skill of inspiring, organizing, and guiding others toward a common goal. It reflects a character's ability to motivate their allies, maintain morale, and direct the flow of a team or larger group. Leadership is used whenever a character needs to command respect, manage a team, or provide direction in challenging circumstances. It covers leading troops in battle, managing organizational structures, or simply keeping a group focused and cohesive under pressure.  \n* **Mechanics:**  \n  * *Inspire:* CR 15 to grant allies a \\+1 morale bonus to specific checks or saves for a duration.  \n  * *Organize:* CR 20 to coordinate a team's efforts for a complex project, reducing time or increasing efficiency.  \n  * *Opposed Check:* Used to maintain morale against fear or discord effects.  \n* **Specialties:**   \n  * **Battlefield Tactical Command:** Issuing clear, authoritative firing and movement orders in the deafening noise of combat.  \n    * **Inspiring Speeches:** Delivering electrifying orations that banish fear, rally broken lines, and restore morale.  \n    * **Crew Morale Management:** Maintaining high spirits, solving internal grievances, and keeping a starship crew cohesive.  \n    * **Crisis Command:** Stepping into sudden chaos—explosions, hull breaches, captain deaths—and taking total control.  \n    * **Delegation & Task Assignment:** Assigning the exact right operative to the exact right task to maximize group efficiency.  \n    * **Mutiny Suppression:** Quelling brewing insurrections and subduing rebellious crewmen through sheer force of will.  \n    * **Rallying Broken Allies:** Snapping panicked or terrified companions out of shock and putting their weapons back in the fight.  \n    * **Strategic Vision Planning:** Formulating long-term campaign roadmaps that keep an entire faction or fleet pointed forward.  \n    * **Mentorship & Drill:** Training recruits to overcome their personal doubts, forging them into disciplined squad members.  \n    * **Personal Accountability:** Taking public responsibility for failures to retain absolute loyalty and trust from subordinates."
        },
        {
          "name": "Streetwise",
          "id": "social-streetwise",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Streetwise is the skill of navigating the criminal underworld and understanding the social dynamics of the streets. It reflects a character's ability to survive and thrive in dangerous and unpredictable environments. Streetwise is used whenever a character needs to gather information or make connections in the criminal underworld, whether it's to gain access to resources or to avoid danger. This can include things like finding a black market dealer, identifying a gang's territory, or navigating a dangerous neighborhood. Knowledge of the urban environment, criminal underworld, and how to navigate the \"streets.\" It involves gathering information from informal contacts, finding black markets, and avoiding trouble in dangerous neighborhoods.",
          "keywords": "streetwise, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
            "Black Market Fences",
            "Underworld Informant Networks",
            "Gang Territory & Boundaries",
            "Safehouse Identification",
            "Criminal Cant & Slang",
            "Bribing Officials",
            "Loan Shark Navigation",
            "Spotting Plainclothes Law",
            "Illicit Contraband Sourcing",
            "Urban Evasion"
          ],
          "governing_attribute": "Charisma (or Wisdom)",
          "mechanic": "Governing Ability: Charisma (or Wisdom)\n\nMechanics:\n• **Gather Information (Informal):** CR 10-20 to pick up rumors, find a specific person, or locate illicit goods. Takes 1d4 hours.\n• **Urban Survival:** CR 15 to find a safe house or avoid street gangs.\n• **Network:** locating a fence or fixer.\n\nSpecialties:\n• Black Market Fences: Locating reliable criminal brokers who buy hot cyberware, stolen weapons, and unmarked bullion.\n• Underworld Informant Networks: Knowing which bartenders, street urchins, and cabbies have their ears to the ground.\n• Gang Territory & Boundaries: Recognizing street graffiti, gang colors, and border lines to avoid lethal ambushes.\n• Safehouse Identification: Locating discreet, off-the-books apartments, crash pads, and sewer basements to lay low.\n• Criminal Cant & Slang: Speaking and decoding the shifting street argot, hand signs, and slang of local syndicates.\n• Bribing Officials: Knowing exactly which customs inspectors or beat cops take payoffs, and the going price for silence.\n• Loan Shark Navigation: Negotiating survival terms with underworld loan sharks without losing your kneecaps.\n• Spotting Plainclothes Law: Pointing out disguised undercover detectives and corporate internal security spooks in crowds.\n• Illicit Contraband Sourcing: Procuring illegal combat drugs, untracked blasters, and forged transit papers in alleys.\n• Urban Evasion: Slipping away through winding back-alleys, fire escapes, and sewer drains when syndicates hunt you.",
          "specialty_details": [
            {
              "name": "Black Market Fences",
              "description": "Locating reliable criminal brokers who buy hot cyberware, stolen weapons, and unmarked bullion."
            },
            {
              "name": "Underworld Informant Networks",
              "description": "Knowing which bartenders, street urchins, and cabbies have their ears to the ground."
            },
            {
              "name": "Gang Territory & Boundaries",
              "description": "Recognizing street graffiti, gang colors, and border lines to avoid lethal ambushes."
            },
            {
              "name": "Safehouse Identification",
              "description": "Locating discreet, off-the-books apartments, crash pads, and sewer basements to lay low."
            },
            {
              "name": "Criminal Cant & Slang",
              "description": "Speaking and decoding the shifting street argot, hand signs, and slang of local syndicates."
            },
            {
              "name": "Bribing Officials",
              "description": "Knowing exactly which customs inspectors or beat cops take payoffs, and the going price for silence."
            },
            {
              "name": "Loan Shark Navigation",
              "description": "Negotiating survival terms with underworld loan sharks without losing your kneecaps."
            },
            {
              "name": "Spotting Plainclothes Law",
              "description": "Pointing out disguised undercover detectives and corporate internal security spooks in crowds."
            },
            {
              "name": "Illicit Contraband Sourcing",
              "description": "Procuring illegal combat drugs, untracked blasters, and forged transit papers in alleys."
            },
            {
              "name": "Urban Evasion",
              "description": "Slipping away through winding back-alleys, fire escapes, and sewer drains when syndicates hunt you."
            }
          ],
          "full_text": "### **Streetwise**\n\n* **Ability:** Charisma (or Wisdom)  \n* **Description:** Streetwise is the skill of navigating the criminal underworld and understanding the social dynamics of the streets. It reflects a character's ability to survive and thrive in dangerous and unpredictable environments. Streetwise is used whenever a character needs to gather information or make connections in the criminal underworld, whether it's to gain access to resources or to avoid danger. This can include things like finding a black market dealer, identifying a gang's territory, or navigating a dangerous neighborhood. Knowledge of the urban environment, criminal underworld, and how to navigate the \"streets.\" It involves gathering information from informal contacts, finding black markets, and avoiding trouble in dangerous neighborhoods.  \n* **Mechanics:**  \n  * **Gather Information (Informal):** CR 10-20 to pick up rumors, find a specific person, or locate illicit goods. Takes 1d4 hours.  \n  * **Urban Survival:** CR 15 to find a safe house or avoid street gangs.  \n  * **Network:** locating a fence or fixer.  \n* **Specialties:**  \n  * **Black Market Fences:** Locating reliable criminal brokers who buy hot cyberware, stolen weapons, and unmarked bullion.  \n    * **Underworld Informant Networks:** Knowing which bartenders, street urchins, and cabbies have their ears to the ground.  \n    * **Gang Territory & Boundaries:** Recognizing street graffiti, gang colors, and border lines to avoid lethal ambushes.  \n    * **Safehouse Identification:** Locating discreet, off-the-books apartments, crash pads, and sewer basements to lay low.  \n    * **Criminal Cant & Slang:** Speaking and decoding the shifting street argot, hand signs, and slang of local syndicates.  \n    * **Bribing Officials:** Knowing exactly which customs inspectors or beat cops take payoffs, and the going price for silence.  \n    * **Loan Shark Navigation:** Negotiating survival terms with underworld loan sharks without losing your kneecaps.  \n    * **Spotting Plainclothes Law:** Pointing out disguised undercover detectives and corporate internal security spooks in crowds.  \n    * **Illicit Contraband Sourcing:** Procuring illegal combat drugs, untracked blasters, and forged transit papers in alleys.  \n    * **Urban Evasion:** Slipping away through winding back-alleys, fire escapes, and sewer drains when syndicates hunt you.\n\n---"
        }
      ]
    }
  ],
  "combat": [
    {
      "title": "Archaic",
      "skills": [
        {
          "name": "Defense",
          "id": "combat-defense",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Defense is the art of self-preservation in combat. unlike other combat skills used to inflict damage, this skill measures a character's ability to avoid being hit, deflect blows, or position themselves advantageously to mitigate harm. It represents situational awareness, footwork, and the effective use of protective gear like shields. * **Game Mechanics:** * **Passive Defense:** Your Rank in this skill is directly added to your **Defense Score**. (e.g., A character with Agility +2 and Defense Rank 4 has a base Defense of 16). * **Active Defense (Reaction):** In specific tactical situations (such as the *Total Defense* action), you may roll a Defense check to replace your static score or negate specific maneuvers like Trips or Grapples.",
          "keywords": "defense, combat, agility, tactical, offensive, parrying",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Evasion & Footwork",
            "Solid Shield Blocking",
            "Energy Shield Deflection",
            "Weapon Parrying",
            "Total Defense Stance",
            "Roll & Tuck (Impact Absorption)",
            "Counter-Grapple Framing",
            "High-Cover Bracing",
            "Ranged Projectile Weaving",
            "Point-Blank Deflection"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nSpecialties:\n• Evasion & Footwork: Dodging, weaving, and ducking under melee swings and incoming kinetic projectiles.\n• Solid Shield Blocking: Intercepting arrows, blades, and blunt trauma directly on a heavy metal or composite shield.\n• Energy Shield Deflection: Angling hand-mounted hard-light or plasma shields to bounce energy bolts harmlessly away.\n• Weapon Parrying: Using your own blade or staff to deflect an incoming melee strike off its attack line.\n• Total Defense Stance: Sacrificing all offensive action to curl behind cover or shields, maximizing survivability.\n• Roll & Tuck (Impact Absorption): Rolling with a direct concussive explosion or heavy blunt hit to cut damage in half.\n• Counter-Grapple Framing: Posting forearms and hips to prevent an opponent from securing a takedown or chokehold.\n• High-Cover Bracing: Maximizing cover benefits behind low concrete barriers, bulkheads, and sandbag walls.\n• Ranged Projectile Weaving: Moving unpredictably in zig-zag patterns to spoil the aim of marksmen downfield.\n• Point-Blank Deflection: Shunting an attacker's drawn gun barrel or blade tip away from your center of mass in CQB.",
          "specialty_details": [
            {
              "name": "Evasion & Footwork",
              "description": "Dodging, weaving, and ducking under melee swings and incoming kinetic projectiles."
            },
            {
              "name": "Solid Shield Blocking",
              "description": "Intercepting arrows, blades, and blunt trauma directly on a heavy metal or composite shield."
            },
            {
              "name": "Energy Shield Deflection",
              "description": "Angling hand-mounted hard-light or plasma shields to bounce energy bolts harmlessly away."
            },
            {
              "name": "Weapon Parrying",
              "description": "Using your own blade or staff to deflect an incoming melee strike off its attack line."
            },
            {
              "name": "Total Defense Stance",
              "description": "Sacrificing all offensive action to curl behind cover or shields, maximizing survivability."
            },
            {
              "name": "Roll & Tuck (Impact Absorption)",
              "description": "Rolling with a direct concussive explosion or heavy blunt hit to cut damage in half."
            },
            {
              "name": "Counter-Grapple Framing",
              "description": "Posting forearms and hips to prevent an opponent from securing a takedown or chokehold."
            },
            {
              "name": "High-Cover Bracing",
              "description": "Maximizing cover benefits behind low concrete barriers, bulkheads, and sandbag walls."
            },
            {
              "name": "Ranged Projectile Weaving",
              "description": "Moving unpredictably in zig-zag patterns to spoil the aim of marksmen downfield."
            },
            {
              "name": "Point-Blank Deflection",
              "description": "Shunting an attacker's drawn gun barrel or blade tip away from your center of mass in CQB."
            }
          ],
          "full_text": "### **DEFENSE**\n\n* **Ability:** Agility  \n* **Description:** Defense is the art of self-preservation in combat. unlike other combat skills used to inflict damage, this skill measures a character's ability to avoid being hit, deflect blows, or position themselves advantageously to mitigate harm. It represents situational awareness, footwork, and the effective use of protective gear like shields.  \n* **Game Mechanics:**  \n  * **Passive Defense:** Your Rank in this skill is directly added to your **Defense Score**. (e.g., A character with Agility \\+2 and Defense Rank 4 has a base Defense of 16).  \n  * **Active Defense (Reaction):** In specific tactical situations (such as the *Total Defense* action), you may roll a Defense check to replace your static score or negate specific maneuvers like Trips or Grapples.  \n* **Specialties:**  \n  * **Evasion & Footwork:** Dodging, weaving, and ducking under melee swings and incoming kinetic projectiles.  \n  * **Solid Shield Blocking:** Intercepting arrows, blades, and blunt trauma directly on a heavy metal or composite shield.  \n  * **Energy Shield Deflection:** Angling hand-mounted hard-light or plasma shields to bounce energy bolts harmlessly away.  \n  * **Weapon Parrying:** Using your own blade or staff to deflect an incoming melee strike off its attack line.  \n  * **Total Defense Stance:** Sacrificing all offensive action to curl behind cover or shields, maximizing survivability.  \n  * **Roll & Tuck (Impact Absorption):** Rolling with a direct concussive explosion or heavy blunt hit to cut damage in half.  \n  * **Counter-Grapple Framing:** Posting forearms and hips to prevent an opponent from securing a takedown or chokehold.  \n  * **High-Cover Bracing:** Maximizing cover benefits behind low concrete barriers, bulkheads, and sandbag walls.  \n  * **Ranged Projectile Weaving:** Moving unpredictably in zig-zag patterns to spoil the aim of marksmen downfield.  \n  * **Point-Blank Deflection:** Shunting an attacker's drawn gun barrel or blade tip away from your center of mass in CQB.\n\n###"
        },
        {
          "name": "Melee",
          "id": "combat-melee",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "This skill covers proficiency with hand-held weaponry designed for close-quarters combat. It encompasses everything from simple clubs to elegant rapiers. It reflects a character’s ability to strike accurately and forcefully with extended reach or heavy implements. * **Game Mechanics:** * **Attack Roll:** 2d10 + Melee Rank + Strength Mod vs. Target Defense. * **Damage:** Weapon Damage Dice + Strength Mod. * **Reach:** Some melee weapons (Polearms) allow attacks from 10ft away.",
          "keywords": "melee, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Daggers & Combat Knives",
            "One-Handed Swords",
            "Two-Handed Greatswords",
            "Polearms & Spears",
            "Blunt Staves & Bo Rods",
            "Battleaxes & Cleavers",
            "Warhammers & Maces",
            "Vibro-Blades",
            "Energized Melee Weapons",
            "Flails & Flexible Weapons"
          ],
          "governing_attribute": "Strength (standard) or Agility (with specific Features like *Weapon Finesse*)",
          "mechanic": "Governing Ability: Strength (standard) or Agility (with specific Features like *Weapon Finesse*)\n\nSpecialties:\n• Daggers & Combat Knives: Swift, lethal slashes, throat cuts, and reverse-grip thrusts inside grappling range.\n• One-Handed Swords: Fencing with rapiers, sabers, and arming swords utilizing precision point-work and lunges.\n• Two-Handed Greatswords: Sweeping massive, heavy blades across wide arcs to cleave multiple targets and break lines.\n• Polearms & Spears: Utilizing superior 10-foot reach, thrusting points, and hooking blades to keep foes at bay.\n• Blunt Staves & Bo Rods: Executing rapid, spinning two-handed bludgeoning combinations, sweeps, and disarms.\n• Battleaxes & Cleavers: Delivering crushing, chopping blows designed to split wooden shields, limbs, and light armor.\n• Warhammers & Maces: Driving blunt armor-piercing kinetic force directly through heavy steel and plate armor.\n• Vibro-Blades: Wielding high-frequency vibrating knives and swords that saw through metal plate effortlessly.\n• Energized Melee Weapons: Slashing with superheated plasma blades and power-axes that melt armor on contact.\n• Flails & Flexible Weapons: Whipping weighted chains and morningstars around an opponent's raised shield to strike.",
          "specialty_details": [
            {
              "name": "Daggers & Combat Knives",
              "description": "Swift, lethal slashes, throat cuts, and reverse-grip thrusts inside grappling range."
            },
            {
              "name": "One-Handed Swords",
              "description": "Fencing with rapiers, sabers, and arming swords utilizing precision point-work and lunges."
            },
            {
              "name": "Two-Handed Greatswords",
              "description": "Sweeping massive, heavy blades across wide arcs to cleave multiple targets and break lines."
            },
            {
              "name": "Polearms & Spears",
              "description": "Utilizing superior 10-foot reach, thrusting points, and hooking blades to keep foes at bay."
            },
            {
              "name": "Blunt Staves & Bo Rods",
              "description": "Executing rapid, spinning two-handed bludgeoning combinations, sweeps, and disarms."
            },
            {
              "name": "Battleaxes & Cleavers",
              "description": "Delivering crushing, chopping blows designed to split wooden shields, limbs, and light armor."
            },
            {
              "name": "Warhammers & Maces",
              "description": "Driving blunt armor-piercing kinetic force directly through heavy steel and plate armor."
            },
            {
              "name": "Vibro-Blades",
              "description": "Wielding high-frequency vibrating knives and swords that saw through metal plate effortlessly."
            },
            {
              "name": "Energized Melee Weapons",
              "description": "Slashing with superheated plasma blades and power-axes that melt armor on contact."
            },
            {
              "name": "Flails & Flexible Weapons",
              "description": "Whipping weighted chains and morningstars around an opponent's raised shield to strike."
            }
          ],
          "full_text": "### **MELEE**\n\n* **Ability:** Strength (standard) or Agility (with specific Features like *Weapon Finesse*)  \n* **Description:** This skill covers proficiency with hand-held weaponry designed for close-quarters combat. It encompasses everything from simple clubs to elegant rapiers. It reflects a character’s ability to strike accurately and forcefully with extended reach or heavy implements.  \n* **Game Mechanics:**  \n  * **Attack Roll:** 2d10 \\+ Melee Rank \\+ Strength Mod vs. Target Defense.  \n  * **Damage:** Weapon Damage Dice \\+ Strength Mod.  \n  * **Reach:** Some melee weapons (Polearms) allow attacks from 10ft away.  \n* **Specialties:**  \n  * **Daggers & Combat Knives:** Swift, lethal slashes, throat cuts, and reverse-grip thrusts inside grappling range.  \n  * **One-Handed Swords:** Fencing with rapiers, sabers, and arming swords utilizing precision point-work and lunges.  \n  * **Two-Handed Greatswords:** Sweeping massive, heavy blades across wide arcs to cleave multiple targets and break lines.  \n  * **Polearms & Spears:** Utilizing superior 10-foot reach, thrusting points, and hooking blades to keep foes at bay.  \n  * **Blunt Staves & Bo Rods:** Executing rapid, spinning two-handed bludgeoning combinations, sweeps, and disarms.  \n  * **Battleaxes & Cleavers:** Delivering crushing, chopping blows designed to split wooden shields, limbs, and light armor.  \n  * **Warhammers & Maces:** Driving blunt armor-piercing kinetic force directly through heavy steel and plate armor.  \n  * **Vibro-Blades:** Wielding high-frequency vibrating knives and swords that saw through metal plate effortlessly.  \n  * **Energized Melee Weapons:** Slashing with superheated plasma blades and power-axes that melt armor on contact.  \n  * **Flails & Flexible Weapons:** Whipping weighted chains and morningstars around an opponent's raised shield to strike.\n\n###"
        },
        {
          "name": "Ranged",
          "id": "combat-ranged",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "The skill of using muscle-powered projectile weapons or thrown objects to strike targets at a distance. This differs from *Ballistic* (guns) as it relies more on the user's physical trajectory calculation and force (for thrown items) or mechanical tension (bows). * **Game Mechanics:** * **Attack Roll:** 2d10 + Ranged Rank + Agility Mod vs. Target Defense. * **Damage:** Weapon Damage Dice (Strength mod is usually added to *Thrown* weapons, but not standard Bows unless they are composite/specialized). * **Range Increment:** Each weapon has a range increment; attacking beyond this imposes a cumulative -2 penalty per increment.",
          "keywords": "ranged, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Recurve & Hunting Bows",
            "Heavy Longbows",
            "Compound Tech-Bows",
            "Hand Crossbows",
            "Heavy Siege Crossbows",
            "Throwing Knives & Spikes",
            "Throwing Axes & Tomahawks",
            "Shuriken & Flechettes",
            "Slings & Staff Slings",
            "Boomerangs & Returning Sticks"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nSpecialties:\n• Recurve & Hunting Bows: Drawing, anchoring, and loosing arrows rapidly at close-to-medium forest targets.\n• Heavy Longbows: Drawing massive 100-pound pull bows to punch arrows through metal armor at extreme distances.\n• Compound Tech-Bows: Utilizing modern pulley cams, stabilizer rods, and fiber-optic sights for pinpoint arrow shots.\n• Hand Crossbows: Firing and rapid-cranking compact, concealable crossbows designed for close ambush work.\n• Heavy Siege Crossbows: Operating foot-stirrup, crank-drawn heavy crossbows that hit with devastating kinetic shock.\n• Throwing Knives & Spikes: Hurling balanced steel blades with precision into eyes, necks, and exposed joints.\n• Throwing Axes & Tomahawks: Lobbing heavy, rotating axes that bury deeply into skull bone and wooden barricades.\n• Shuriken & Flechettes: Flumping spreads of star-blades or balanced throwing darts in rapid succession.\n• Slings & Staff Slings: Whirling lead bullets or river stones to hit targets at range with crushing blunt force.\n• Boomerangs & Returning Sticks: Throwing aerodynamic curved timber sticks that strike hard or loop back if missed.",
          "specialty_details": [
            {
              "name": "Recurve & Hunting Bows",
              "description": "Drawing, anchoring, and loosing arrows rapidly at close-to-medium forest targets."
            },
            {
              "name": "Heavy Longbows",
              "description": "Drawing massive 100-pound pull bows to punch arrows through metal armor at extreme distances."
            },
            {
              "name": "Compound Tech-Bows",
              "description": "Utilizing modern pulley cams, stabilizer rods, and fiber-optic sights for pinpoint arrow shots."
            },
            {
              "name": "Hand Crossbows",
              "description": "Firing and rapid-cranking compact, concealable crossbows designed for close ambush work."
            },
            {
              "name": "Heavy Siege Crossbows",
              "description": "Operating foot-stirrup, crank-drawn heavy crossbows that hit with devastating kinetic shock."
            },
            {
              "name": "Throwing Knives & Spikes",
              "description": "Hurling balanced steel blades with precision into eyes, necks, and exposed joints."
            },
            {
              "name": "Throwing Axes & Tomahawks",
              "description": "Lobbing heavy, rotating axes that bury deeply into skull bone and wooden barricades."
            },
            {
              "name": "Shuriken & Flechettes",
              "description": "Flumping spreads of star-blades or balanced throwing darts in rapid succession."
            },
            {
              "name": "Slings & Staff Slings",
              "description": "Whirling lead bullets or river stones to hit targets at range with crushing blunt force."
            },
            {
              "name": "Boomerangs & Returning Sticks",
              "description": "Throwing aerodynamic curved timber sticks that strike hard or loop back if missed."
            }
          ],
          "full_text": "### **RANGED**\n\n* **Ability:** Agility  \n* **Description:** The skill of using muscle-powered projectile weapons or thrown objects to strike targets at a distance. This differs from *Ballistic* (guns) as it relies more on the user's physical trajectory calculation and force (for thrown items) or mechanical tension (bows).  \n* **Game Mechanics:**  \n  * **Attack Roll:** 2d10 \\+ Ranged Rank \\+ Agility Mod vs. Target Defense.  \n  * **Damage:** Weapon Damage Dice (Strength mod is usually added to *Thrown* weapons, but not standard Bows unless they are composite/specialized).  \n  * **Range Increment:** Each weapon has a range increment; attacking beyond this imposes a cumulative \\-2 penalty per increment.  \n* **Specialties:**  \n  * **Recurve & Hunting Bows:** Drawing, anchoring, and loosing arrows rapidly at close-to-medium forest targets.  \n  * **Heavy Longbows:** Drawing massive 100-pound pull bows to punch arrows through metal armor at extreme distances.  \n  * **Compound Tech-Bows:** Utilizing modern pulley cams, stabilizer rods, and fiber-optic sights for pinpoint arrow shots.  \n  * **Hand Crossbows:** Firing and rapid-cranking compact, concealable crossbows designed for close ambush work.  \n  * **Heavy Siege Crossbows:** Operating foot-stirrup, crank-drawn heavy crossbows that hit with devastating kinetic shock.  \n  * **Throwing Knives & Spikes:** Hurling balanced steel blades with precision into eyes, necks, and exposed joints.  \n  * **Throwing Axes & Tomahawks:** Lobbing heavy, rotating axes that bury deeply into skull bone and wooden barricades.  \n  * **Shuriken & Flechettes:** Flumping spreads of star-blades or balanced throwing darts in rapid succession.  \n  * **Slings & Staff Slings:** Whirling lead bullets or river stones to hit targets at range with crushing blunt force.  \n  * **Boomerangs & Returning Sticks:** Throwing aerodynamic curved timber sticks that strike hard or loop back if missed.\n\n###"
        },
        {
          "name": "Unarmed",
          "id": "combat-unarmed",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "The ability to fight without artificial weapons, using only the body. This includes brawling, martial arts, wrestling, and the use of natural weaponry for non-human species. * **Game Mechanics:** * **Attack Roll:** 2d10 + Unarmed Rank + Str/Agi Mod vs. Target Defense. * **Damage:** Typically lower than weapons (1d4 or varies by size/species) + Strength Mod. * **Non-Lethal:** Unarmed attacks can often be chosen to deal Stun/Non-Lethal damage without penalty. * **Grapple:** Unarmed skill is used to initiate and maintain holds (Grapple checks).",
          "keywords": "unarmed, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Boxing & Power Punches",
            "Kicks & Leg Sweeps",
            "Joint Locks & Submissions",
            "Grappling & Throws",
            "Claws & Talons (Natural)",
            "Biting & Fangs (Natural)",
            "Horns & Headbutts (Natural)",
            "Tail Strikes & Sweeps (Natural)",
            "Chokeholds & Strangles",
            "Nerve Strikes & Pressure Points"
          ],
          "governing_attribute": "Strength (for power/grappling) or Agility (for striking speed/precision)",
          "mechanic": "Governing Ability: Strength (for power/grappling) or Agility (for striking speed/precision)\n\nSpecialties:\n• Boxing & Power Punches: Throwing crisp jabs, hooks, crosses, and uppercuts with weighted hand wraps or bare fists.\n• Kicks & Leg Sweeps: Snapping roundhouse kicks, front teep kicks, low shin strikes, and sweeping enemy legs.\n• Joint Locks & Submissions: Snapping armbars, kimuras, and heel hooks to break enemy joints and force surrenders.\n• Grappling & Throws: Executing hip throws, double-leg takedowns, and suplexes to slam targets into hard deckplates.\n• Claws & Talons (Natural): Slashing and tearing flesh and armor with native species claws, finger spikes, and talons.\n• Biting & Fangs (Natural): Clamping down with powerful reptilian or feline jaws, injecting venom, or tearing throats.\n• Horns & Headbutts (Natural): Driving heavy head-crest horns or hardened skulls straight into an opponent's face.\n• Tail Strikes & Sweeps (Natural): Whipping heavy muscular tails to trip enemies, strike backs, or shatter ribs.\n• Chokeholds & Strangles: Sinking rear-naked chokes, guillotine holds, and crushing windpipes to knock foes unconscious.\n• Nerve Strikes & Pressure Points: Striking vulnerable nerve clusters to temporarily paralyze limbs and drop guards.",
          "specialty_details": [
            {
              "name": "Boxing & Power Punches",
              "description": "Throwing crisp jabs, hooks, crosses, and uppercuts with weighted hand wraps or bare fists."
            },
            {
              "name": "Kicks & Leg Sweeps",
              "description": "Snapping roundhouse kicks, front teep kicks, low shin strikes, and sweeping enemy legs."
            },
            {
              "name": "Joint Locks & Submissions",
              "description": "Snapping armbars, kimuras, and heel hooks to break enemy joints and force surrenders."
            },
            {
              "name": "Grappling & Throws",
              "description": "Executing hip throws, double-leg takedowns, and suplexes to slam targets into hard deckplates."
            },
            {
              "name": "Claws & Talons (Natural)",
              "description": "Slashing and tearing flesh and armor with native species claws, finger spikes, and talons."
            },
            {
              "name": "Biting & Fangs (Natural)",
              "description": "Clamping down with powerful reptilian or feline jaws, injecting venom, or tearing throats."
            },
            {
              "name": "Horns & Headbutts (Natural)",
              "description": "Driving heavy head-crest horns or hardened skulls straight into an opponent's face."
            },
            {
              "name": "Tail Strikes & Sweeps (Natural)",
              "description": "Whipping heavy muscular tails to trip enemies, strike backs, or shatter ribs."
            },
            {
              "name": "Chokeholds & Strangles",
              "description": "Sinking rear-naked chokes, guillotine holds, and crushing windpipes to knock foes unconscious."
            },
            {
              "name": "Nerve Strikes & Pressure Points",
              "description": "Striking vulnerable nerve clusters to temporarily paralyze limbs and drop guards."
            }
          ],
          "full_text": "### **UNARMED**\n\n* **Ability:** Strength (for power/grappling) or Agility (for striking speed/precision)  \n* **Description:** The ability to fight without artificial weapons, using only the body. This includes brawling, martial arts, wrestling, and the use of natural weaponry for non-human species.  \n* **Game Mechanics:**  \n  * **Attack Roll:** 2d10 \\+ Unarmed Rank \\+ Str/Agi Mod vs. Target Defense.  \n  * **Damage:** Typically lower than weapons (1d4 or varies by size/species) \\+ Strength Mod.  \n  * **Non-Lethal:** Unarmed attacks can often be chosen to deal Stun/Non-Lethal damage without penalty.  \n  * **Grapple:** Unarmed skill is used to initiate and maintain holds (Grapple checks).  \n* **Specialties:**  \n  * **Boxing & Power Punches:** Throwing crisp jabs, hooks, crosses, and uppercuts with weighted hand wraps or bare fists.  \n  * **Kicks & Leg Sweeps:** Snapping roundhouse kicks, front teep kicks, low shin strikes, and sweeping enemy legs.  \n  * **Joint Locks & Submissions:** Snapping armbars, kimuras, and heel hooks to break enemy joints and force surrenders.  \n  * **Grappling & Throws:** Executing hip throws, double-leg takedowns, and suplexes to slam targets into hard deckplates.  \n  * **Claws & Talons (Natural):** Slashing and tearing flesh and armor with native species claws, finger spikes, and talons.  \n  * **Biting & Fangs (Natural):** Clamping down with powerful reptilian or feline jaws, injecting venom, or tearing throats.  \n  * **Horns & Headbutts (Natural):** Driving heavy head-crest horns or hardened skulls straight into an opponent's face.  \n  * **Tail Strikes & Sweeps (Natural):** Whipping heavy muscular tails to trip enemies, strike backs, or shatter ribs.  \n  * **Chokeholds & Strangles:** Sinking rear-naked chokes, guillotine holds, and crushing windpipes to knock foes unconscious.  \n  * **Nerve Strikes & Pressure Points:** Striking vulnerable nerve clusters to temporarily paralyze limbs and drop guards.\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Modern",
      "skills": [
        {
          "name": "Ballistic",
          "id": "combat-ballistic",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "The operation of firearms and other handheld projectile weapons. This skill covers maintaining, reloading, and firing weapons that use combustion or magnetic acceleration to launch solid slugs at high velocity.",
          "keywords": "ballistic, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Semi-Automatic Pistols",
            "Heavy Revolvers",
            "Tactical Shotguns",
            "Submachine Guns (SMGs)",
            "Assault Rifles & Carbines",
            "Designated Marksman Rifles",
            "Sniper Rifles",
            "Automatic Fire Walking",
            "Kinetic Anti-Materiel Rifles",
            "Concealed Carry Quick-Draw"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nMechanics:\n• **Standard Attack:** **2d10 + Skill Rank + Agility Mod vs. Target Defense**.\n• **Burst Fire (Short):** Firing a controlled 3-round burst grants a **+1 Bonus to Strike**2.\n• **Auto-Fire (Long Burst):** Firing longer bursts (10+ rounds) imposes a **-1 Recoil Penalty** for every 10 rounds fired. However, for every point the attack roll exceeds the target's Defense, one additional round hits (up to the total shots fired). Each extra hit deals **+1d damage** (if the initial hit penetrated DR)3.\n\nSpecialties:\n• Semi-Automatic Pistols: Double-tapping service handguns rapidly, clearing malfunctions, and drawing from holsters.\n• Heavy Revolvers: Firing high-caliber magnum hand cannons with heavy recoil control and precision shot placement.\n• Tactical Shotguns: Pumping or cycling 12-gauge buckshot spreads and armor-piercing slugs in room clearing.\n• Submachine Guns (SMGs): Controlling high cyclic rates of fire, firing controlled bursts from compact machine pistols.\n• Assault Rifles & Carbines: Engaging point and area targets from 50 to 300 meters using single shots and short bursts.\n• Designated Marksman Rifles: Precision shooting at mid-to-long range using magnified optics and match ammunition.\n• Sniper Rifles: Calculating windage, bullet drop, core Coriolis effect, and firing single-shot extreme range kills.\n• Automatic Fire Walking: Firing long full-auto bursts while walking the muzzle stream onto moving enemy lines.\n• Kinetic Anti-Materiel Rifles: Firing massive .50-caliber or 20mm kinetic rounds to destroy engine blocks and light armor.\n• Concealed Carry Quick-Draw: Clearing clothing, drawing a hidden sub-compact pistol, and firing within one second.",
          "specialty_details": [
            {
              "name": "Semi-Automatic Pistols",
              "description": "Double-tapping service handguns rapidly, clearing malfunctions, and drawing from holsters."
            },
            {
              "name": "Heavy Revolvers",
              "description": "Firing high-caliber magnum hand cannons with heavy recoil control and precision shot placement."
            },
            {
              "name": "Tactical Shotguns",
              "description": "Pumping or cycling 12-gauge buckshot spreads and armor-piercing slugs in room clearing."
            },
            {
              "name": "Submachine Guns (SMGs)",
              "description": "Controlling high cyclic rates of fire, firing controlled bursts from compact machine pistols."
            },
            {
              "name": "Assault Rifles & Carbines",
              "description": "Engaging point and area targets from 50 to 300 meters using single shots and short bursts."
            },
            {
              "name": "Designated Marksman Rifles",
              "description": "Precision shooting at mid-to-long range using magnified optics and match ammunition."
            },
            {
              "name": "Sniper Rifles",
              "description": "Calculating windage, bullet drop, core Coriolis effect, and firing single-shot extreme range kills."
            },
            {
              "name": "Automatic Fire Walking",
              "description": "Firing long full-auto bursts while walking the muzzle stream onto moving enemy lines."
            },
            {
              "name": "Kinetic Anti-Materiel Rifles",
              "description": "Firing massive .50-caliber or 20mm kinetic rounds to destroy engine blocks and light armor."
            },
            {
              "name": "Concealed Carry Quick-Draw",
              "description": "Clearing clothing, drawing a hidden sub-compact pistol, and firing within one second."
            }
          ],
          "full_text": "### **BALLISTIC**\n\n* **Ability:** Agility  \n* **Description:** The operation of firearms and other handheld projectile weapons. This skill covers maintaining, reloading, and firing weapons that use combustion or magnetic acceleration to launch solid slugs at high velocity.\n\n* **Mechanics:**  \n  * **Standard Attack:** **2d10 \\+ Skill Rank \\+ Agility Mod vs. Target Defense**.  \n  * **Burst Fire (Short):** Firing a controlled 3-round burst grants a **\\+1 Bonus to Strike**2.\n\n  * **Auto-Fire (Long Burst):** Firing longer bursts (10+ rounds) imposes a **\\-1 Recoil Penalty** for every 10 rounds fired. However, for every point the attack roll exceeds the target's Defense, one additional round hits (up to the total shots fired). Each extra hit deals **\\+1d damage** (if the initial hit penetrated DR)3.\n\n* **Specialties:**   \n  * **Semi-Automatic Pistols:** Double-tapping service handguns rapidly, clearing malfunctions, and drawing from holsters.  \n  * **Heavy Revolvers:** Firing high-caliber magnum hand cannons with heavy recoil control and precision shot placement.  \n  * **Tactical Shotguns:** Pumping or cycling 12-gauge buckshot spreads and armor-piercing slugs in room clearing.  \n  * **Submachine Guns (SMGs):** Controlling high cyclic rates of fire, firing controlled bursts from compact machine pistols.  \n  * **Assault Rifles & Carbines:** Engaging point and area targets from 50 to 300 meters using single shots and short bursts.  \n  * **Designated Marksman Rifles:** Precision shooting at mid-to-long range using magnified optics and match ammunition.  \n  * **Sniper Rifles:** Calculating windage, bullet drop, core Coriolis effect, and firing single-shot extreme range kills.  \n  * **Automatic Fire Walking:** Firing long full-auto bursts while walking the muzzle stream onto moving enemy lines.  \n  * **Kinetic Anti-Materiel Rifles:** Firing massive .50-caliber or 20mm kinetic rounds to destroy engine blocks and light armor.  \n  * **Concealed Carry Quick-Draw:** Clearing clothing, drawing a hidden sub-compact pistol, and firing within one second.\n\n###"
        },
        {
          "name": "Heavy Weapons",
          "id": "combat-heavy-weapons",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "The use of large-scale weaponry, often requiring two hands, a tripod, or a vehicle mount. This includes machine guns, rocket launchers, and artillery systems.",
          "keywords": "heavy weapons, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Squad Automatic Weapons (SAWs)",
            "Heavy Mounted Machine Guns",
            "Unguided Rocket Launchers",
            "Smart Missile Systems",
            "Rotary Grenade Launchers",
            "Vehicle-Mounted Cannons",
            "Rotary Miniguns",
            "Man-Portable Mortars",
            "Stationary Defense Emplacements",
            "Anti-Air Kinetic Flak"
          ],
          "governing_attribute": "Agility (or Intellect for calculated trajectories/guided systems)",
          "mechanic": "Governing Ability: Agility (or Intellect for calculated trajectories/guided systems)\n\nMechanics:\n• **Launched/Thrown Ordinance:** Grenades and missiles use this skill for targeting.\n• **Area Effect (Blasting):** Attacks target a specific area rather than a single defense score.\n• **General Area:** Targets within the blast radius take base damage. For every **5 points** the attack roll exceeds a **CR of 10**, the damage increases by **+2 Dice**.\n• **Focused Blast Zone:** Targets in the center of the blast take **+100% Damage Dice** if the attack roll exceeds a **CR of 15** by 10 or more.\n\nSpecialties:\n• Squad Automatic Weapons (SAWs): Firing belt-fed light machine guns to lay down suppressing fire on enemy tree lines.\n• Heavy Mounted Machine Guns: Operating spade-gripped, tripod-mounted .50-caliber guns against light vehicles and infantry.\n• Unguided Rocket Launchers: Shoulder-firing unguided RPGs and anti-tank rockets into bunkers and tank treads.\n• Smart Missile Systems: Painting targets, locking thermal signatures, and firing fire-and-forget guided missile tubes.\n• Rotary Grenade Launchers: Lobs of 40mm high-explosive, smoke, and tear-gas canisters downfield in rapid succession.\n• Vehicle-Mounted Cannons: Operating auto-cannons (25mm-40mm) mounted in armored vehicle turrets using fire computers.\n• Rotary Miniguns: Spooling electric gatling guns to unleash 4,000 rounds per minute, chewing through light fortifications.\n• Man-Portable Mortars: Dropping indirect-fire mortar shells into tubes, setting baseplates, and adjusting quadrant sights.\n• Stationary Defense Emplacements: Manning fixed bunker machine gun emplacements, managing ammunition belts and barrel swaps.\n• Anti-Air Kinetic Flak: Tracking fast-moving atmospheric aircraft with high-angle, proximity-fused explosive flak cannons.",
          "specialty_details": [
            {
              "name": "Squad Automatic Weapons (SAWs)",
              "description": "Firing belt-fed light machine guns to lay down suppressing fire on enemy tree lines."
            },
            {
              "name": "Heavy Mounted Machine Guns",
              "description": "Operating spade-gripped, tripod-mounted .50-caliber guns against light vehicles and infantry."
            },
            {
              "name": "Unguided Rocket Launchers",
              "description": "Shoulder-firing unguided RPGs and anti-tank rockets into bunkers and tank treads."
            },
            {
              "name": "Smart Missile Systems",
              "description": "Painting targets, locking thermal signatures, and firing fire-and-forget guided missile tubes."
            },
            {
              "name": "Rotary Grenade Launchers",
              "description": "Lobs of 40mm high-explosive, smoke, and tear-gas canisters downfield in rapid succession."
            },
            {
              "name": "Vehicle-Mounted Cannons",
              "description": "Operating auto-cannons (25mm-40mm) mounted in armored vehicle turrets using fire computers."
            },
            {
              "name": "Rotary Miniguns",
              "description": "Spooling electric gatling guns to unleash 4,000 rounds per minute, chewing through light fortifications."
            },
            {
              "name": "Man-Portable Mortars",
              "description": "Dropping indirect-fire mortar shells into tubes, setting baseplates, and adjusting quadrant sights."
            },
            {
              "name": "Stationary Defense Emplacements",
              "description": "Manning fixed bunker machine gun emplacements, managing ammunition belts and barrel swaps."
            },
            {
              "name": "Anti-Air Kinetic Flak",
              "description": "Tracking fast-moving atmospheric aircraft with high-angle, proximity-fused explosive flak cannons."
            }
          ],
          "full_text": "### **HEAVY WEAPONS**\n\n* **Ability:** Agility (or Intellect for calculated trajectories/guided systems)  \n* **Description:** The use of large-scale weaponry, often requiring two hands, a tripod, or a vehicle mount. This includes machine guns, rocket launchers, and artillery systems.\n\n* **Mechanics:**  \n  * **Launched/Thrown Ordinance:** Grenades and missiles use this skill for targeting.\n\n  * **Area Effect (Blasting):** Attacks target a specific area rather than a single defense score.  \n    * **General Area:** Targets within the blast radius take base damage. For every **5 points** the attack roll exceeds a **CR of 10**, the damage increases by **\\+2 Dice**.\n\n    * **Focused Blast Zone:** Targets in the center of the blast take **\\+100% Damage Dice** if the attack roll exceeds a **CR of 15** by 10 or more.\n\n* **Specialties:**   \n  * **Squad Automatic Weapons (SAWs):** Firing belt-fed light machine guns to lay down suppressing fire on enemy tree lines.  \n  * **Heavy Mounted Machine Guns:** Operating spade-gripped, tripod-mounted .50-caliber guns against light vehicles and infantry.  \n  * **Unguided Rocket Launchers:** Shoulder-firing unguided RPGs and anti-tank rockets into bunkers and tank treads.  \n  * **Smart Missile Systems:** Painting targets, locking thermal signatures, and firing fire-and-forget guided missile tubes.  \n  * **Rotary Grenade Launchers:** Lobs of 40mm high-explosive, smoke, and tear-gas canisters downfield in rapid succession.  \n  * **Vehicle-Mounted Cannons:** Operating auto-cannons (25mm-40mm) mounted in armored vehicle turrets using fire computers.  \n  * **Rotary Miniguns:** Spooling electric gatling guns to unleash 4,000 rounds per minute, chewing through light fortifications.  \n  * **Man-Portable Mortars:** Dropping indirect-fire mortar shells into tubes, setting baseplates, and adjusting quadrant sights.  \n  * **Stationary Defense Emplacements:** Manning fixed bunker machine gun emplacements, managing ammunition belts and barrel swaps.  \n  * **Anti-Air Kinetic Flak:** Tracking fast-moving atmospheric aircraft with high-angle, proximity-fused explosive flak cannons.\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Advanced",
      "skills": [
        {
          "name": "Energy",
          "id": "combat-energy",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Proficiency with personal, directed-energy weapons such as pistols and rifles. These weapons discharge various forms of lethal energy, from searing plasma to destabilizing sonic waves. Unlike ballistic weapons, energy weapons often carry secondary effects based on their energy type2222.",
          "keywords": "energy, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Laser Pistols & Carbines",
            "Plasma Rifles",
            "Particle Beam Carbines",
            "Sonic Stunners & Shatterguns",
            "Cryo-Projectors",
            "Arc & Voltic Rifles",
            "Corrosive Spray Weapons",
            "Grav-Pulse Blasters",
            "Disruptor & Disintegrator Pistols",
            "Thermal Microwave Lances"
          ],
          "governing_attribute": "Agility",
          "mechanic": "Governing Ability: Agility\n\nMechanics:\n• **Attack Roll:** Standard ranged attack roll.\n• **Critical Effects:** In addition to increased damage, specific energy types apply status effects on a Critical Hit3:\n• *Pyro (Plasma):* Burns target for ½ damage in the following rounds.\n• *Cryo (Icer):* Freezes target (Slow/Snare effect).\n• *Voltic (Electricity):* Shocks target (Stun effect).\n• *Sonic:* Concussive force (Stun effect).\n• *Corrosive:* Dissolves armor/structure (½ damage for next 2 rounds).\n• *Grav:* Impact force causing Knockback.\n\nSpecialties:\n• Laser Pistols & Carbines: Firing instant-hit coherent light beams that burn through flesh and thin sheet metal.\n• Plasma Rifles: Hurling bolts of superheated gas that melt through composite plate and ignite secondary fires.\n• Particle Beam Carbines: Firing high-velocity subatomic particle streams that deliver immense penetrating radiation trauma.\n• Sonic Stunners & Shatterguns: Firing concussive acoustic shockwaves that knock targets unconscious or rupture organs.\n• Cryo-Projectors: Spraying endothermic chemical streams that flash-freeze target limbs and shatter armor plates.\n• Arc & Voltic Rifles: Discharging branching lightning bolts that jump across multiple metal-armored targets and stun.\n• Corrosive Spray Weapons: Spraying pressurized acidic chemical streams that dissolve physical armor and melt hulls.\n• Grav-Pulse Blasters: Firing high-density gravitational shockwaves that throw armored targets backward off feet.\n• Disruptor & Disintegrator Pistols: Firing exotic matter-collapsing energy that breaks molecular bonds down to ash.\n• Thermal Microwave Lances: Focusing invisible microwave radiation that cooks organic targets from the inside out behind cover.",
          "specialty_details": [
            {
              "name": "Laser Pistols & Carbines",
              "description": "Firing instant-hit coherent light beams that burn through flesh and thin sheet metal."
            },
            {
              "name": "Plasma Rifles",
              "description": "Hurling bolts of superheated gas that melt through composite plate and ignite secondary fires."
            },
            {
              "name": "Particle Beam Carbines",
              "description": "Firing high-velocity subatomic particle streams that deliver immense penetrating radiation trauma."
            },
            {
              "name": "Sonic Stunners & Shatterguns",
              "description": "Firing concussive acoustic shockwaves that knock targets unconscious or rupture organs."
            },
            {
              "name": "Cryo-Projectors",
              "description": "Spraying endothermic chemical streams that flash-freeze target limbs and shatter armor plates."
            },
            {
              "name": "Arc & Voltic Rifles",
              "description": "Discharging branching lightning bolts that jump across multiple metal-armored targets and stun."
            },
            {
              "name": "Corrosive Spray Weapons",
              "description": "Spraying pressurized acidic chemical streams that dissolve physical armor and melt hulls."
            },
            {
              "name": "Grav-Pulse Blasters",
              "description": "Firing high-density gravitational shockwaves that throw armored targets backward off feet."
            },
            {
              "name": "Disruptor & Disintegrator Pistols",
              "description": "Firing exotic matter-collapsing energy that breaks molecular bonds down to ash."
            },
            {
              "name": "Thermal Microwave Lances",
              "description": "Focusing invisible microwave radiation that cooks organic targets from the inside out behind cover."
            }
          ],
          "full_text": "### **ENERGY**\n\n* **Ability:** Agility  \n* **Description:** Proficiency with personal, directed-energy weapons such as pistols and rifles. These weapons discharge various forms of lethal energy, from searing plasma to destabilizing sonic waves. Unlike ballistic weapons, energy weapons often carry secondary effects based on their energy type2222.\n\n* **Mechanics:**  \n  * **Attack Roll:** Standard ranged attack roll.  \n  * **Critical Effects:** In addition to increased damage, specific energy types apply status effects on a Critical Hit3:\n\n    * *Pyro (Plasma):* Burns target for ½ damage in the following rounds.  \n    * *Cryo (Icer):* Freezes target (Slow/Snare effect).  \n    * *Voltic (Electricity):* Shocks target (Stun effect).  \n    * *Sonic:* Concussive force (Stun effect).  \n    * *Corrosive:* Dissolves armor/structure (½ damage for next 2 rounds).  \n    * *Grav:* Impact force causing Knockback.  \n* **Specialties:**  \n  * **Laser Pistols & Carbines:** Firing instant-hit coherent light beams that burn through flesh and thin sheet metal.  \n  * **Plasma Rifles:** Hurling bolts of superheated gas that melt through composite plate and ignite secondary fires.  \n  * **Particle Beam Carbines:** Firing high-velocity subatomic particle streams that deliver immense penetrating radiation trauma.  \n  * **Sonic Stunners & Shatterguns:** Firing concussive acoustic shockwaves that knock targets unconscious or rupture organs.  \n  * **Cryo-Projectors:** Spraying endothermic chemical streams that flash-freeze target limbs and shatter armor plates.  \n  * **Arc & Voltic Rifles:** Discharging branching lightning bolts that jump across multiple metal-armored targets and stun.  \n  * **Corrosive Spray Weapons:** Spraying pressurized acidic chemical streams that dissolve physical armor and melt hulls.  \n  * **Grav-Pulse Blasters:** Firing high-density gravitational shockwaves that throw armored targets backward off feet.  \n  * **Disruptor & Disintegrator Pistols:** Firing exotic matter-collapsing energy that breaks molecular bonds down to ash.  \n  * **Thermal Microwave Lances:** Focusing invisible microwave radiation that cooks organic targets from the inside out behind cover.\n\n###"
        },
        {
          "name": "Heavy Energy",
          "id": "combat-heavy-energy",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "The operation of massive, high-yield energy cannons. These weapons are typically vehicle-mounted, ship-mounted, or require a tripod setup due to their size and power consumption. They are designed to destroy armored vehicles, starships, and fortifications4444.",
          "keywords": "heavy energy, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
            "Ship-to-Ship Laser Batteries",
            "Orbital Particle Lances",
            "Heavy Plasma Mortars",
            "Singularity Projectors",
            "Spinal Railguns & Coilguns",
            "Manned Fortress Energy Turrets",
            "Tachyon Beam Cannons",
            "Point-Defense Energy Arrays (PDC)",
            "Macro-Ion Cannons",
            "Coaxial Plasma Bombardment Cannons"
          ],
          "governing_attribute": "Agility (or Intellect if integrated into vehicle/ship gunnery systems)",
          "mechanic": "Governing Ability: Agility (or Intellect if integrated into vehicle/ship gunnery systems)\n\nMechanics:\n• **Attack Roll:** Standard ranged attack roll, often with range penalties reduced by targeting computers (Smart Links).\n• **Area of Effect:** Many heavy energy weapons (like Particle Beams) strike in a line or an area blast rather than a single point.\n• **Penetration:** Heavy energy weapons typically possess high Penetration values, ignoring significant amounts of Damage Resistance (DR).\n\nSpecialties:\n• Ship-to-Ship Laser Batteries: Firing megawatt turrets to slice through starship hull plating and sensor domes.\n• Orbital Particle Lances: Aligning spine-mounted spinal cannons to fire devastating lance strikes through the atmosphere.\n• Heavy Plasma Mortars: Lobbing massive globes of burning thermonuclear plasma onto planetary siege fortresses.\n• Singularity Projectors: Firing unstable microscopic gravitational vortexes that crush tanks and pull down walls.\n• Spinal Railguns & Coilguns: Magnetically accelerating multi-ton slugs to relativistic speeds across solar distances.\n• Manned Fortress Energy Turrets: Manning massive energy gun emplacements on planetary defense shields.\n• Tachyon Beam Cannons: Firing high-energy faster-than-light particles that bypass conventional deflector shields.\n• Point-Defense Energy Arrays (PDC): Tracking and vaporizing incoming torpedoes and starfighters with automated pulse lasers.\n• Macro-Ion Cannons: Firing massive EMP and ion charges that disable starship power grids, engines, and shields without hull breach.\n• Coaxial Plasma Bombardment Cannons: Directing planetary bombardment salvos from orbit to obliterate coastal cities.",
          "specialty_details": [
            {
              "name": "Ship-to-Ship Laser Batteries",
              "description": "Firing megawatt turrets to slice through starship hull plating and sensor domes."
            },
            {
              "name": "Orbital Particle Lances",
              "description": "Aligning spine-mounted spinal cannons to fire devastating lance strikes through the atmosphere."
            },
            {
              "name": "Heavy Plasma Mortars",
              "description": "Lobbing massive globes of burning thermonuclear plasma onto planetary siege fortresses."
            },
            {
              "name": "Singularity Projectors",
              "description": "Firing unstable microscopic gravitational vortexes that crush tanks and pull down walls."
            },
            {
              "name": "Spinal Railguns & Coilguns",
              "description": "Magnetically accelerating multi-ton slugs to relativistic speeds across solar distances."
            },
            {
              "name": "Manned Fortress Energy Turrets",
              "description": "Manning massive energy gun emplacements on planetary defense shields."
            },
            {
              "name": "Tachyon Beam Cannons",
              "description": "Firing high-energy faster-than-light particles that bypass conventional deflector shields."
            },
            {
              "name": "Point-Defense Energy Arrays (PDC)",
              "description": "Tracking and vaporizing incoming torpedoes and starfighters with automated pulse lasers."
            },
            {
              "name": "Macro-Ion Cannons",
              "description": "Firing massive EMP and ion charges that disable starship power grids, engines, and shields without hull breach."
            },
            {
              "name": "Coaxial Plasma Bombardment Cannons",
              "description": "Directing planetary bombardment salvos from orbit to obliterate coastal cities."
            }
          ],
          "full_text": "### **HEAVY ENERGY**\n\n* **Ability:** Agility (or Intellect if integrated into vehicle/ship gunnery systems)  \n* **Description:** The operation of massive, high-yield energy cannons. These weapons are typically vehicle-mounted, ship-mounted, or require a tripod setup due to their size and power consumption. They are designed to destroy armored vehicles, starships, and fortifications4444.\n\n* **Mechanics:**  \n  * **Attack Roll:** Standard ranged attack roll, often with range penalties reduced by targeting computers (Smart Links).  \n  * **Area of Effect:** Many heavy energy weapons (like Particle Beams) strike in a line or an area blast rather than a single point.  \n  * **Penetration:** Heavy energy weapons typically possess high Penetration values, ignoring significant amounts of Damage Resistance (DR).  \n* **Specialties:**  \n  * **Ship-to-Ship Laser Batteries:** Firing megawatt turrets to slice through starship hull plating and sensor domes.  \n  * **Orbital Particle Lances:** Aligning spine-mounted spinal cannons to fire devastating lance strikes through the atmosphere.  \n  * **Heavy Plasma Mortars:** Lobbing massive globes of burning thermonuclear plasma onto planetary siege fortresses.  \n  * **Singularity Projectors:** Firing unstable microscopic gravitational vortexes that crush tanks and pull down walls.  \n  * **Spinal Railguns & Coilguns:** Magnetically accelerating multi-ton slugs to relativistic speeds across solar distances.  \n  * **Manned Fortress Energy Turrets:** Manning massive energy gun emplacements on planetary defense shields.  \n  * **Tachyon Beam Cannons:** Firing high-energy faster-than-light particles that bypass conventional deflector shields.  \n  * **Point-Defense Energy Arrays (PDC):** Tracking and vaporizing incoming torpedoes and starfighters with automated pulse lasers.  \n  * **Macro-Ion Cannons:** Firing massive EMP and ion charges that disable starship power grids, engines, and shields without hull breach.  \n  * **Coaxial Plasma Bombardment Cannons:** Directing planetary bombardment salvos from orbit to obliterate coastal cities.\n\n---"
        }
      ]
    }
  ],
  "meta": [
    {
      "title": "General",
      "skills": [
        {
          "name": "Attune",
          "id": "meta-attune",
          "group": "meta",
          "baseAttr": "attr-wisdom",
          "description": "Channeling energy, sensing psionic/magical fields, and metaphysical resonance. Unlocked when character possesses any Awakened feature.",
          "keywords": "attune, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "specialties": [
            "Conduit Channeling",
            "Concentration Under Stress",
            "Spell CR Augmentation",
            "Overcoming Resistance (SR/PR)",
            "Runic Circle Scribing",
            "Metascience Calibration",
            "Counter-Magic Shaping",
            "Ambient Energy Absorption",
            "Reality Anchor Stabilization",
            "Overcharging Invocations"
          ],
          "governing_attribute": "",
          "mechanic": "Specialties:\n• Conduit Channeling: Opening your physical body and neural pathways to flow raw meta-energy without self-damage.\n• Concentration Under Stress: Sustaining an active invocation while taking direct ballistic damage or running through fire.\n• Spell CR Augmentation: Tightening the metaphysical weave to make your invocations vastly harder for targets to resist.\n• Overcoming Resistance (SR/PR): Pushing raw energy through an enemy's innate spell resistance or psionic dampeners.\n• Runic Circle Scribing: Drawing physical geometric runes on floors to anchor massive, long-duration rituals safely.\n• Metascience Calibration: Tuning sensory implants and detection crystals to measure ambient magical currents accurately.\n• Counter-Magic Shaping: Reading an enemy's incoming energy conduit and weaving an opposite wave to collapse their spell.\n• Ambient Energy Absorption: Siphoning background radiation, ley line energy, or emotional resonance to fuel casting.\n• Reality Anchor Stabilization: Holding your immediate 10-foot space rigid against planar incursions and reality warping.\n• Overcharging Invocations: Pushing the conduit beyond safe redline limits to maximize damage dice at the risk of personal burnout.",
          "specialty_details": [
            {
              "name": "Conduit Channeling",
              "description": "Opening your physical body and neural pathways to flow raw meta-energy without self-damage."
            },
            {
              "name": "Concentration Under Stress",
              "description": "Sustaining an active invocation while taking direct ballistic damage or running through fire."
            },
            {
              "name": "Spell CR Augmentation",
              "description": "Tightening the metaphysical weave to make your invocations vastly harder for targets to resist."
            },
            {
              "name": "Overcoming Resistance (SR/PR)",
              "description": "Pushing raw energy through an enemy's innate spell resistance or psionic dampeners."
            },
            {
              "name": "Runic Circle Scribing",
              "description": "Drawing physical geometric runes on floors to anchor massive, long-duration rituals safely."
            },
            {
              "name": "Metascience Calibration",
              "description": "Tuning sensory implants and detection crystals to measure ambient magical currents accurately."
            },
            {
              "name": "Counter-Magic Shaping",
              "description": "Reading an enemy's incoming energy conduit and weaving an opposite wave to collapse their spell."
            },
            {
              "name": "Ambient Energy Absorption",
              "description": "Siphoning background radiation, ley line energy, or emotional resonance to fuel casting."
            },
            {
              "name": "Reality Anchor Stabilization",
              "description": "Holding your immediate 10-foot space rigid against planar incursions and reality warping."
            },
            {
              "name": "Overcharging Invocations",
              "description": "Pushing the conduit beyond safe redline limits to maximize damage dice at the risk of personal burnout."
            }
          ],
          "full_text": "### **ATTUNE (The Channel)**\n\nAttribute: Varies (Intellect for Mages/Tech, Wisdom for Priests/Psychics, Charisma for Sorcerers/Fey)  \nType: Meta Skill  \nAttune represents the character's ability to open a conduit to their power source and shape it safely. It is the \"Accuracy\" and \"Control\" stat of the meta system.\n\n* **Setting the Save CR:** When you cast an Invocation that allows a Resistance Check (Reflex, Fortitude, or Will), the CR is determined by your Attune check.  \n  * *CR Formula:* 2d10 \\+ Attune Rank \\+ Ability Mod  \n  * *Passive CR:* 10 \\+ Attune Rank \\+ Ability Mod (Used when taking 10\\)  \n* **Overcoming Resistance:** If a target has Spell Resistance (SR) or Psionic Dampening, the Attune check must exceed the target's SR.  \n* **Maintaining Focus:** Attune is used for Concentration checks when taking damage while sustaining an effect.  \n* **Specialties:**  \n  * **Conduit Channeling:** Opening your physical body and neural pathways to flow raw meta-energy without self-damage.  \n  * **Concentration Under Stress:** Sustaining an active invocation while taking direct ballistic damage or running through fire.  \n  * **Spell CR Augmentation:** Tightening the metaphysical weave to make your invocations vastly harder for targets to resist.  \n  * **Overcoming Resistance (SR/PR):** Pushing raw energy through an enemy's innate spell resistance or psionic dampeners.  \n  * **Runic Circle Scribing:** Drawing physical geometric runes on floors to anchor massive, long-duration rituals safely.  \n  * **Metascience Calibration:** Tuning sensory implants and detection crystals to measure ambient magical currents accurately.  \n  * **Counter-Magic Shaping:** Reading an enemy's incoming energy conduit and weaving an opposite wave to collapse their spell.  \n  * **Ambient Energy Absorption:** Siphoning background radiation, ley line energy, or emotional resonance to fuel casting.  \n  * **Reality Anchor Stabilization:** Holding your immediate 10-foot space rigid against planar incursions and reality warping.  \n  * **Overcharging Invocations:** Pushing the conduit beyond safe redline limits to maximize damage dice at the risk of personal burnout.\n\n###"
        }
      ]
    },
    {
      "title": "Dimension",
      "discipline": "Dimension",
      "skills": [
        {
          "name": "Summoning",
          "id": "meta-summoning",
          "group": "meta",
          "discipline": "Dimension",
          "baseAttr": "attr-wisdom",
          "description": "Dimension: Drawing entities, matter, and energetic constructs across dimensional boundaries.",
          "keywords": "summoning, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **SUMMONING FOCUS**\n\nCalling forth creatures or objects from other coordinates or planes.\n\n* **Mechanic:** Summoned items/creatures appear within Range.  \n* **Duration:** 1 Round per Discipline Rank (Sustained). Spending 1 Karma extends this to 1 Minute per Rank.\n\n**Invocations:**\n\n* **Summon Creature:** Calls a creature to fight or aid.  \n  * *Effect:* Summons a creature with a Character Point (CP) value equal to 10 \\+ (Invocation Rank x 5).  \n* **Create Object:** Manifests a temporary item from generic matter.  \n  * *Effect:* Creates an object of Simple complexity (CR 0). Rank increases complexity/Tech Level.  \n* **Banishment:** Forces a creature back to its home plane or a pocket dimension.  \n  * *Effect:* Resisted by Will. On fail, target is removed for 1 round per Rank.  \n* **Web:** Pulls strands of sticky dimensional matter to restrain foes.  \n  * *Effect:* Area Entangle. Resisted by Reflex/Strength.\n\n###"
        },
        {
          "name": "Teleport",
          "id": "meta-teleport",
          "group": "meta",
          "discipline": "Dimension",
          "baseAttr": "attr-wisdom",
          "description": "Dimension: Instantaneous spatial relocation, portal anchors, and trans-dimensional folding.",
          "keywords": "teleport, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **TELEPORT FOCUS**\n\nRelocation without traversing the intervening space.\n\n* **Mechanic:** Difficulty is based on the Familiarity of the target location.  \n* **Familiarity CR:** Very Familiar (5), Seen Once (15), Description Only (25), Blind (30).\n\n**Invocations:**\n\n* **Blink:** Short-range tactical hop.  \n  * *Effect:* Move up to 10ft \\+ (5ft per Rank) as a Move Action. Does not provoke Attacks of Opportunity.  \n* **Gate:** Opens a stable portal for others to pass through.  \n  * *Effect:* Sustained portal. Size 5ft x 5ft per Rank.  \n* **Teleport Other:** Sends a target to another location.  \n  * *Effect:* Touch attack to hit. Resisted by Will. Range determined by Discipline Rank.  \n* **Spatial Distortion:** Warps space to increase distance/defense.  \n  * *Effect:* Adds \\+1 Defense per 2 Ranks against Ranged attacks (displacement).\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Energy",
      "discipline": "Energy",
      "skills": [
        {
          "name": "Elemental",
          "id": "meta-elemental",
          "group": "meta",
          "discipline": "Energy",
          "baseAttr": "attr-wisdom",
          "description": "Energy: Thermal, electrical, fire, frost, and plasma generation and channeling.",
          "keywords": "elemental, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **ELEMENTAL FOCUS**\n\nConjuration of Pyro (Fire), Cryo (Ice), Voltic (Electric), Sonic, or Corrosive energy.\n\n* **Damage:** 1d6 per Discipline Stage \\+ 1d6 per Invocation Rank.  \n* **Critical Effects:**  \n  * *Pyro:* Burn (1/2 damage next round).  \n  * *Cryo:* Freeze (Slow/Snare).  \n  * *Voltic:* Shock (Stun).  \n  * *Sonic:* Deafen/Stun.  \n  * *Corrosive:* Dissolve (Armor DR reduction).\n\n**Invocations:**\n\n* **Blast:** Single target ranged attack.  \n  * *Effect:* Standard Damage. High Accuracy (+2 to Attune check).  \n* **Burst:** Radius explosion.  \n  * *Effect:* Standard Damage in 5ft radius per Rank. Reflex Save for half.  \n* **Line/Bolt:** Piercing line attack.  \n  * *Effect:* Standard Damage in a 50ft \\+ (10ft/Rank) line.  \n* **Barrier:** Wall of damaging energy.  \n  * *Effect:* Wall 10ft long per Rank. Deals damage to those crossing it.\n\n###"
        },
        {
          "name": "Force",
          "id": "meta-force",
          "group": "meta",
          "discipline": "Energy",
          "baseAttr": "attr-wisdom",
          "description": "Energy: Kinetic barriers, gravimetric pulses, concussive waves, and physical repulsors.",
          "keywords": "force, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **FORCE FOCUS**\n\nManipulation of pure kinetic energy and invisible constructs.\n\n* **Damage:** 1d8 per Discipline Stage \\+ 1d8 per Invocation Rank (Force Damage).\n\n**Invocations:**\n\n* **Telekinesis:** Move objects with the mind.  \n  * *Effect:* Move weight 25lbs x Rank.  \n* **Force Missile:** Homing shards of force.  \n  * *Effect:* Always hits (no Attack roll needed). Lower damage die (d4s).  \n* **Force Field:** Personal protection.  \n  * *Effect:* Grants Temporary HP equal to 5 x Rank.  \n* **Force Wave:** Cone of concussive force.  \n  * *Effect:* Knocks targets Prone. Resisted by Fortitude/Might.\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Entropy",
      "discipline": "Entropy",
      "skills": [
        {
          "name": "Chaos",
          "id": "meta-chaos",
          "group": "meta",
          "discipline": "Entropy",
          "baseAttr": "attr-wisdom",
          "description": "Entropy: Accelerating decay, breaking molecular bonds, curses, and destructive negative energy.",
          "keywords": "chaos, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **CHAOS FOCUS**\n\nAcceleration of decay, luck manipulation (bad luck), and negative energy.\n\n* **Damage:** 2d6 per Discipline Stage \\+ 1d6 per Invocation Rank. (High damage, but dangerous).  \n* **Note:** Ignores hardness/DR of non-magical materials.\n\n**Invocations:**\n\n* **Wither/Touch of Death:** Melee touch attack.  \n  * *Effect:* Necrotic damage. Heals Undead.  \n* **Curse:** Inflicts Disadvantage.  \n  * *Effect:* Target rolls at Disadvantage for 1 round per Rank. Resisted by Will.  \n* **Corrosion:** Destroys physical armor.  \n  * *Effect:* Reduces target DR by 1 per Rank.  \n* **Fear:** Induces panic.  \n  * *Effect:* Target flees for 1 round per Rank. Resisted by Will.\n\n###"
        },
        {
          "name": "Order",
          "id": "meta-order",
          "group": "meta",
          "discipline": "Entropy",
          "baseAttr": "attr-wisdom",
          "description": "Entropy: Probability stabilization, cellular regeneration, biological healing, and preservation.",
          "keywords": "order, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **ORDER FOCUS**\n\nRestoring patterns, healing, and stabilization.\n\n* **Healing:** 2d6 per Discipline Stage \\+ 1d6 per Invocation Rank.\n\n**Invocations:**\n\n* **Cure:** Restores Health/Vitality.  \n  * *Effect:* Touch range healing. Undead take damage.  \n* **Stabilize:** Prevents death.  \n  * *Effect:* Immediate Action. Target stops losing Health at Death's Door.  \n* **Restoration:** Removes status effects (Poison, Disease, Stun).  \n  * *Effect:* Difficulty based on the Severity of the ailment.  \n* **Ward:** Protection against specific alignments/energy.  \n  * *Effect:* \\+2 Defense and Saves vs chosen source.\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Illusion",
      "discipline": "Illusion",
      "skills": [
        {
          "name": "Phantasm",
          "id": "meta-phantasm",
          "group": "meta",
          "discipline": "Illusion",
          "baseAttr": "attr-wisdom",
          "description": "Illusion: Sensory phantasms, holographic weaves, auditory deception, and mirages.",
          "keywords": "phantasm, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **PHANTASM FOCUS**\n\nPure sensory input. Only exists in the mind or as light/sound waves.\n\n* **Mechanic:** Disbelief (Will Save) negates the effect entirely.\n\n**Invocations:**\n\n* **Invisibility:** Bends light around a subject.  \n  * *Effect:* Subject is invisible. Attacking breaks effect. 1 min/Rank.  \n* **Image:** Creates a visual/auditory scene.  \n  * *Effect:* Stationary or scripted illusion. Complexity scales with Rank.  \n* **Silence:** Dampens sound waves.  \n  * *Effect:* Radius 10ft \\+ 5ft/Rank. No sound can pass in or out.  \n* **Disguise Self:** Alters perceived appearance.  \n  * *Effect:* \\+10 to Disguise checks.\n\n###"
        },
        {
          "name": "Shadow",
          "id": "meta-shadow",
          "group": "meta",
          "discipline": "Illusion",
          "baseAttr": "attr-wisdom",
          "description": "Illusion: Weaving darkness, shadow-stuff, optical refraction, and umbral constructs.",
          "keywords": "shadow, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **SHADOW FOCUS**\n\nInfusing illusions with quasi-reality from the Shadow Plane.\n\n* **Mechanic:** Even if disbelieved, Shadow illusions retain 20% reality (and damage).\n\n**Invocations:**\n\n* **Shadow Conjuration:** Mimics a Summoning or Evocation spell.  \n  * *Effect:* Duplicates another spell at 50% power.  \n* **Shadow Weapon:** Creates a semi-real weapon.  \n  * *Effect:* Functions as a specific melee weapon. Deals Psychic/Cold damage.  \n* **Obscuring Mist:** Creates heavy fog.  \n  * *Effect:* Blocks Line of Sight. Can be solid/sticky (Shadow).\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Matter",
      "discipline": "Matter",
      "skills": [
        {
          "name": "Enhancement",
          "id": "meta-enhancement",
          "group": "meta",
          "discipline": "Matter",
          "baseAttr": "attr-wisdom",
          "description": "Matter: Strengthening material bonds, hardening objects, and physical reinforcement.",
          "keywords": "enhancement, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **ENHANCEMENT FOCUS**\n\nImproving the structural integrity or properties of an object or creature.\n\n* **Mechanic:** Buffs and physical upgrades.\n\n**Invocations:**\n\n* **Hardening/Barkskin:** Toughens skin or armor.  \n  * *Effect:* Adds \\+1 DR per 3 Ranks to armor or natural skin.  \n* **Keen Edge:** Sharpens a weapon.  \n  * *Effect:* Increases Critical Threat range by 1\\.  \n* **Physical Boost:** Enhances physical attributes.  \n  * *Effect:* Grants \\+2 to Str, Dex, or Con for 1 min/Rank.  \n* **Repair:** Fixes structural damage.  \n  * *Effect:* Restores 1d10 Structure Points per Rank to objects/constructs.\n\n###"
        },
        {
          "name": "Transmutation",
          "id": "meta-transmutation",
          "group": "meta",
          "discipline": "Matter",
          "baseAttr": "attr-wisdom",
          "description": "Matter: Reshaping physical matter, molecular conversion, and phase state changes.",
          "keywords": "transmutation, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **TRANSMUTATION FOCUS**\n\nChanging one substance into another or altering state of matter.\n\n* **Mechanic:** Permanent changes usually require high Ranks and Karma expenditure. Combat use is temporary.\n\n**Invocations:**\n\n* **Polymorph/Morph:** Changes biological form.  \n  * *Effect:* Subject takes on physical stats of a Beast/Humanoid.  \n* **Petrification:** Turns flesh to stone (or vice versa).  \n  * *Effect:* Resisted by Fortitude. \"Slow\" effect on partial success.  \n* **Liquid/Gas Form:** Alters caster's state.  \n  * *Effect:* Can pass through cracks, resistant to physical damage.  \n* **Matter Manipulation:** Shape stone, metal, or wood.  \n  * *Effect:* Reshape 1 cubic foot per Rank of raw material.\n\n## \n\n##"
        }
      ]
    },
    {
      "title": "Mental",
      "discipline": "Mental",
      "skills": [
        {
          "name": "Projection",
          "id": "meta-projection",
          "group": "meta",
          "discipline": "Mental",
          "baseAttr": "attr-wisdom",
          "description": "Mental: Psionic projections, telekinesis, telepathic speech, and cognitive thrusts.",
          "keywords": "projection, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **PROJECTION FOCUS**\n\nSending thoughts, commands, or psychic damage into another mind.\n\n* **Range:** Extended. 100ft x Rank.\n\n**Invocations:**\n\n* **Telepathy:** Mental communication.  \n  * *Effect:* communicate with any language-using creature.  \n* **Domination/Command:** Force will upon another.  \n  * *Effect:* Target obeys command. Resisted by Will.  \n* **Mind Blast:** Overload neurons.  \n  * *Effect:* Stun damage. Resisted by Will. 1d6 Psychic damage per Rank.  \n* **Memory Edit:** Modify recollections.  \n  * *Effect:* Alter last 1 minute per Rank of memories.\n\n###"
        },
        {
          "name": "Sense",
          "id": "meta-sense",
          "group": "meta",
          "discipline": "Mental",
          "baseAttr": "attr-wisdom",
          "description": "Mental: Remote viewing, psionic detection, empathy, telepathic probing, and clairvoyance.",
          "keywords": "sense, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "governing_attribute": "",
          "mechanic": "",
          "specialties": [],
          "specialty_details": [],
          "full_text": "### **SENSE FOCUS**\n\nReceiving information from the universe or other minds.\n\n* **Range:** Extended. 100ft x Rank.\n\n**Invocations:**\n\n* **Clairvoyance/Remote Viewing:** See/Hear at a distance.  \n  * *Effect:* Project senses to a known location or person.  \n* **Precognition:** Glimpse the future.  \n  * *Effect:* Gain Advantage on Initiative or a specific Defense check.  \n* **Mind Read:** Detect surface thoughts or deep probe.  \n  * *Effect:* Resisted by Will.  \n* **Detection:** Sense specific signatures (Life, Magic, Tech).  \n  * *Effect:* Ping location of target type within range.\n\n# \n\n#"
        }
      ]
    }
  ]
};

/**
 * Canonical 6 Metaphysical Disciplines and their associated skills
 */
export const METAPHYSICAL_DISCIPLINES = [
  {
    id: 'dimension',
    name: 'Dimension',
    icon: '🌀',
    color: 'purple',
    skills: [
      { id: 'meta-summoning', name: 'Summoning', baseAttr: 'attr-wisdom', description: 'Drawing entities, matter, and energetic constructs across dimensional boundaries.' },
      { id: 'meta-teleport', name: 'Teleport', baseAttr: 'attr-wisdom', description: 'Instantaneous spatial relocation, portal anchors, and trans-dimensional folding.' }
    ],
    description: 'Spatial manipulation, teleportation, phasing, dimensional gates, and portal dynamics.'
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    color: 'amber',
    skills: [
      { id: 'meta-elemental', name: 'Elemental', baseAttr: 'attr-wisdom', description: 'Thermal, electrical, fire, frost, and plasma generation and channeling.' },
      { id: 'meta-force', name: 'Force', baseAttr: 'attr-wisdom', description: 'Kinetic barriers, gravimetric pulses, concussive waves, and physical repulsors.' }
    ],
    description: 'Manipulating thermal, electromagnetic, kinetic, radiant, and pure kinetic force fields.'
  },
  {
    id: 'entropy',
    name: 'Entropy',
    icon: '⏳',
    color: 'rose',
    skills: [
      { id: 'meta-chaos', name: 'Chaos', baseAttr: 'attr-wisdom', description: 'Accelerating decay, breaking molecular bonds, curses, and destructive negative energy.' },
      { id: 'meta-order', name: 'Order', baseAttr: 'attr-wisdom', description: 'Probability stabilization, cellular regeneration, biological healing, and preservation.' }
    ],
    description: 'Governing probability, organic healing, cellular regeneration, life control, restoration, decay, and probability flux.'
  },
  {
    id: 'illusion',
    name: 'Illusion',
    icon: '🎭',
    color: 'cyan',
    skills: [
      { id: 'meta-phantasm', name: 'Phantasm', baseAttr: 'attr-wisdom', description: 'Sensory phantasms, holographic weaves, auditory deception, and mirages.' },
      { id: 'meta-shadow', name: 'Shadow', baseAttr: 'attr-wisdom', description: 'Weaving darkness, shadow-stuff, optical refraction, and umbral constructs.' }
    ],
    description: 'Sensory deception, mental phantasms, holographic weaves, and optical distortions.'
  },
  {
    id: 'matter',
    name: 'Matter',
    icon: '🧱',
    color: 'emerald',
    skills: [
      { id: 'meta-enhancement', name: 'Enhancement', baseAttr: 'attr-wisdom', description: 'Strengthening material bonds, hardening objects, and physical reinforcement.' },
      { id: 'meta-transmutation', name: 'Transmutation', baseAttr: 'attr-wisdom', description: 'Reshaping physical matter, molecular conversion, and phase state changes.' }
    ],
    description: 'Molecular alteration, density shifting, material reinforcement, and matter transmutation.'
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: '🧠',
    color: 'blue',
    skills: [
      { id: 'meta-projection', name: 'Projection', baseAttr: 'attr-wisdom', description: 'Psionic projections, telekinesis, telepathic speech, and cognitive thrusts.' },
      { id: 'meta-sense', name: 'Sense', baseAttr: 'attr-wisdom', description: 'Remote viewing, psionic detection, empathy, telepathic probing, and clairvoyance.' }
    ],
    description: 'Telepathy, psionic force, neural influence, clairvoyance, and cognitive attunement.'
  }
];

/**
 * Flattened array of all canonical skills for relational selectors and dropdowns
 */
export const ALL_CANONICAL_SKILLS = Object.entries(DEFAULT_SKILLS).flatMap(([groupKey, groupSections]) =>
  groupSections.flatMap(section =>
    section.skills.map(skill => {
      const groupTitle = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      const subTitle = section.title ? ` · ${section.title}` : '';
      return {
        ...skill,
        group: groupKey,
        subcategory: section.title || 'General',
        categoryLabel: `${groupTitle}${section.title ? ' - ' + section.title : ''}`,
        type: `${groupTitle}${subTitle}`
      };
    })
  )
);

/**
 * Grouped category sections with display headers and icons for optgroups and categorized lists
 */
export const SKILL_CATEGORY_SECTIONS = [
  {
    key: 'physical',
    label: '🏃 Physical Skills',
    group: 'physical',
    skills: DEFAULT_SKILLS.physical[0].skills
  },
  {
    key: 'mental_general',
    label: '🧠 Mental Skills - General',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[0].skills
  },
  {
    key: 'mental_knowledges',
    label: '🧠 Mental Skills - Knowledges',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[1].skills
  },
  {
    key: 'mental_vocations',
    label: '🧠 Mental Skills - Vocations',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[2].skills
  },
  {
    key: 'social_expression',
    label: '💬 Social Skills - Expression',
    group: 'social',
    skills: DEFAULT_SKILLS.social[0].skills
  },
  {
    key: 'social_manipulation',
    label: '💬 Social Skills - Manipulation',
    group: 'social',
    skills: DEFAULT_SKILLS.social[1].skills
  },
  {
    key: 'combat_archaic',
    label: '⚔️ Combat Skills - Archaic',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[0].skills
  },
  {
    key: 'combat_modern',
    label: '⚔️ Combat Skills - Modern',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[1].skills
  },
  {
    key: 'combat_advanced',
    label: '⚔️ Combat Skills - Advanced',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[2].skills
  },
  {
    key: 'meta_general',
    label: '🔮 Metafocus Skills - General',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[0].skills
  },
  {
    key: 'meta_dimension',
    label: '🌀 Metafocus Skills - Dimension',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[1].skills
  },
  {
    key: 'meta_energy',
    label: '⚡ Metafocus Skills - Energy',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[2].skills
  },
  {
    key: 'meta_entropy',
    label: '⏳ Metafocus Skills - Entropy',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[3].skills
  },
  {
    key: 'meta_illusion',
    label: '🎭 Metafocus Skills - Illusion',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[4].skills
  },
  {
    key: 'meta_matter',
    label: '🧱 Metafocus Skills - Matter',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[5].skills
  },
  {
    key: 'meta_mental',
    label: '🧠 Metafocus Skills - Mental',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[6].skills
  }
];

/**
 * Enriches a skill object with all canonical metadata (group, base attribute, description,
 * keywords, negative railguards, specialties, TL, ML) for Codex Matrix editing or DBM.
 */
export const getEnrichedSkillData = (skill) => {
  if (!skill) return null;
  const rawId = skill.id || '';
  const cleanId = rawId.replace(/^[a-z]+-/, '').toLowerCase();
  const rawName = (skill.name || skill.title || '').trim().toLowerCase();

  const canonical = ALL_CANONICAL_SKILLS.find(s => {
    const sId = (s.id || '').toLowerCase();
    const sCleanId = sId.replace(/^[a-z]+-/, '');
    const sName = (s.name || '').toLowerCase();
    return (rawId && sId === rawId.toLowerCase()) ||
           (cleanId && sCleanId === cleanId) ||
           (rawName && sName === rawName);
  });

  const group = skill.group || canonical?.group || 'physical';
  const name = skill.name || canonical?.name || 'Skill';
  const id = skill.id || canonical?.id || `${group}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return {
    ...(canonical || {}),
    ...skill,
    id,
    name,
    group,
    type: skill.type || canonical?.type || group,
    subtype: skill.subtype || canonical?.subcategory || canonical?.subtype || 'General',
    subcategory: skill.subcategory || canonical?.subcategory || 'General',
    baseAttr: skill.baseAttr || canonical?.baseAttr || 'attr-agility',
    description: canonical?.description || skill.description || '',
    governing_attribute: canonical?.governing_attribute || skill.governing_attribute || '',
    mechanic: canonical?.mechanic || skill.mechanic || '',
    specialty_details: canonical?.specialty_details || skill.specialty_details || [],
    full_text: canonical?.full_text || skill.full_text || '',
    keywords: skill.keywords || canonical?.keywords || '',
    negative_keywords: skill.negative_keywords || canonical?.negative_keywords || '',
    specialties: Array.isArray(skill.specialties) && skill.specialties.length > 0 
      ? skill.specialties 
      : (Array.isArray(canonical?.specialties) ? canonical.specialties : []),
    tech_level: skill.tech_level !== undefined ? skill.tech_level : (canonical?.tech_level ?? 0),
    meta_level: skill.meta_level !== undefined ? skill.meta_level : (canonical?.meta_level ?? 0),
    tl: skill.tech_level !== undefined ? skill.tech_level : (canonical?.tech_level ?? 0),
    ml: skill.meta_level !== undefined ? skill.meta_level : (canonical?.meta_level ?? 0),
  };
};
