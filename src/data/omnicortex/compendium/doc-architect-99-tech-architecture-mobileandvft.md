---
id: "doc-architect-99-tech-architecture-mobileandvft"
name: "Tech (Architecture): Mobile Structures & VFT"
fileName: "99.Tech.Architecture.MobileAndVFT.md"
relPath: "architect/technology/architecture/99.Tech.Architecture.MobileAndVFT.md"
isMasterDoc: false
masterDocId: "doc-architect-99-technology"
category: "architect_matrix"
parent: "doc-architect-99-technology"
order: 37
perspective: "architect"
entry_type: "Tech Matrix (architecture)"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","technology","99.tech.architecture.mobileandvft","matrix"]
updatedAt: "2026-10-14T06:04:05.760Z"
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

# **MOBILE STRUCTURES, VFT & STRUCTURAL COMBAT**

## **X. SPECIALIZED FRAMEWORK: MOBILE STRUCTURES**

**Classification:** Structural Modification Module (Expansion) Rules for Mobile Structures—flotillas, sand-crawlers, and flying towers. Distinct from Vehicles; they are locations you move, not machines you drive.

### 

### **The 20% Chassis Tax**

Converting a static building into a mobile platform requires massive, specially committed engines.

* **Rule:** The Mobility System occupies **20% of the Total Module Capacity** (rounded up, minimum 1 Module). These "Taxed" modules are specially committed propulsion systems and provide no utility other than movement.

### 

### **Propulsion Systems (Mobile Architectures)**

Adding mobility to a structure introduces unique engineering checks. The CR listed in the table below represents the specific complexity of that propulsion system.

In accordance with the **Highest Complexity Rule** (see Section V), this CR is treated as a modification cost: it is not simply added on top of the structure's base cost. Instead, if the propulsion system's CR is higher than the building's current CR, the building's overall Crafting CR is raised to match it. The spatial burden of mobility is paid via the 20% Chassis Tax. The Base Speed is multiplied by the Structure's Scaling Modifier to determine final Tactical Speed (unless speed is capped by mass).

| Propulsion Type | TL | CR | Speed | Notes / Handling |
| :---- | :---- | :---- | :---- | :---- |
| **Ground Crawler** (Treads) | 2 | 20 | 20 ft/rnd | Glacial Handling. Requires massive gearing/suspension. |
| **Independent Suspension** | 2 | 25 | 40 ft/rnd | Ignores light terrain penalties. (For smaller mobile bases). |
| **Aquatic Flotilla** (Ballast) | 2 | 15 | 30 ft/rnd | Poor Handling. Standard sub-surface/surface movement. |
| **Supercavitation** (Hydro-Jet) | 3 | 20 | 60 ft/rnd | High speed underwater city/base. |
| **Heavy Hover** (Skimmer) | 3 | 25 | 60 ft/rnd | Poor Handling. Requires immense power distribution. |
| **Orbital Station-Keeping** | 3 | 20 | 10 ft/rnd | Thrusters for orbit maintenance. Includes vacuum seals. |
| **Heavy VTOL System** (Jets) | 4 | 30 | 50 ft/rnd | Glacial Handling. Massive thrust stress on the structural frame. |
| **Arcane Levitation** (Tower) | ML 3+ | 25 | 30 ft/rnd | Silent. Requires Pilot with Telepathy or Meta-Craft skill. |
| **Aerial Grav-Spire** (Anti-Grav) | 4 | 40 | 80 ft/rnd | Average Handling. The pinnacle of structural engineering. |

## 

## 

## ---

## **XI. VARIABLE FORM TECHNOLOGY (VFT)**

**Variable Form Technology** allows structural units to reconfigure their physical chassis to adapt to combat conditions, bridging the gap between high-mobility vehicle modes, static defensive structures, and versatile biomimetic forms.

### 

### **1\. VFT Tech Level Progression**

The efficiency, speed, and method of these transformations are strictly gated by Tech Level (TL).

* **TL3: Mechanical Articulation (The "Hard" Shift):** Hydraulic actuators, massive gears, and sliding rails. Slow transformation (Full Round Action), and the structure is highly vulnerable during the shift.  
* **TL4: Programmable Matter (The "Fluid" Shift):** "Smart-Matter" composites and picotech integration. Rapid transformation (Movement Action), and can occur mid-maneuver.  
* **TL5: Polymatter & Holophotonics (The "State" Shift):** Sub-atomic rearrangement or hard-light projection. Near Instantaneous (Swift Action).

### 

### **2\. Alternate Form Classifications**

* **Form Type A: Structural Integration (Bastion Mode):** Transformation from a mobile vehicle/mech into a static defensive emplacement. The structure gains \+100% Armor DR, but suffers \-100% Speed (Immobile).  
* **Form Type B: Biomimetic Configuration (Mecha/Beast Mode):** Transformation from a static structure or standard vehicle into a humanoid or animalistic form optimized for terrain traversal. Gains Melee capabilities, Dodge/Evasion bonuses, but suffers \-50% Armor DR.  
* **Form Type C: Vehicular Configuration (Interceptor Mode):** Transformation into a streamlined vehicle for rapid transit. Optimized entirely for Speed and Momentum over utility or defense.

### 

### **3\. VFT Design & Cost Protocols**

When an architect or player engineer aims to design a Variable Form Structure, the following protocols must be strictly adhered to:

**Multi-Form Efficiency (Capacity Loss)** Transforming chassis require internal tracks, shifting gears, and redundant skeletal integrity.

* **Rule:** Impose a **10% reduction of total available Mounts/Capacity** for each EXTRA FORM added beyond the primary chassis mode.

**Differential Costing (Valuation Protocol)** You do not simply double the cost of the structure, but you must account for the distinct, functioning components of each form.

* **Step 1:** Calculate the full Credit Value for each form separately (including all modules, weapons, and speeds active in that specific form).  
* **Step 2:** Identify the most expensive design; this serves as the foundational base price of the structure.  
* **Step 3:** Apply a **20% reduction** to the calculated cost of any additional forms.  
* **Step 4:** Summarize the values (Base Price \+ Discounted Additional Forms) to discover the final, singular Wealth Score (WS) total required to acquire or build the VFT structure.

## 

## 

## ---

## **XII. STRUCTURAL INTEGRITY & COMBAT**

Buildings have Structure Points (SP) representing their total integrity, but tactical gameplay often focuses on localized damage.

### 

### **Combat Modifier Logic**

* **Attacking Smaller:** Larger creatures/structures deal massive damage but have lower defense against small, nimble targets.  
* **Attacking Larger:** Smaller targets have Advantage on defense/dodge but deal insignificant damage to massive structures unless using Heavy Weapons.

### 

### **Breaching vs. Destroying**

* **Section Integrity:** A 10x10ft section of wall has roughly 10% of the Building's Base SP.  
* **Breach:** Creating a hole for a Medium creature requires dealing damage \> Section Integrity to a specific 5ft section (after Hardness/DR is applied).  
* **Collapse:** Reducing the Total SP of the entire structure to 0 results in catastrophic failure and collapse.

### 

### **Maintenance & Repair Cycle**

Structures are not eternal. Weather, entropy, and use degrade them.

* **Annual Upkeep:** 2% of Total Value per year. Failure to pay results in "Dilapidated" status (-5 DR, \-10% SP).  
* **Repair Action:** Field Patch requires Knowledge (Engineering) or Vocation (Builder) check CR 15\. Restores 10% SP per hour. Cost: 10% of Building Value in materials. Reconstruction is required if SP \< 0 (Collapse).

## 

## 

## ---

