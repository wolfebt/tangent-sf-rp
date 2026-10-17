import fs from 'fs';
import path from 'path';

Promise.all([
  import('../src/data/speciesData.js'),
  import('../src/data/speciesTraitsData.js')
]).then(([sMod, tMod]) => {
  const speciesList = sMod.DEFAULT_SPECIES;
  const traits = tMod.ALL_CANONICAL_TRAITS;
  const traitMap = new Map(traits.map(t => [t.id, t]));

  let md = '# Master Species Trait Packages Catalog\n\n';
  md += '**Document Version:** 1.0.0  \n';
  md += '**System Authority:** Tangent SF RP Rules Architecture & Modular Species Matrix  \n';
  md += '**Source Reference:** `docs/game rules/architect/99. MODULAR SPECIES MATRIX.md`, `docs/game rules/operator/1.03 SPECIES (work).md`  \n\n';
  md += '---\n\n';
  md += '## 1. Executive Overview\n\n';
  md += 'In the Tangent Science Fantasy Roleplaying Game, species trait packages exist on two primary structural layers:\n\n';
  md += '1. **Composite Lineage Base Packages (Chassis Bundles)**: Pre-packaged biological, metaphysical, or cybernetic trait groups that form the foundation of major lineages (e.g. Aeld, Asi, Auluran, Kitin, Dragonkin, Progenitor, Synthetic).\n';
  md += '2. **Species Inherent Trait Packages (Character Creation Allocation)**: The complete set of traits granted inherently to each of the **83 species** across all **10 lineages**. These inherent traits cost **0 CP** on the character folio sheet because their point cost is pre-factored into the species chassis BP total.\n\n';
  md += '---\n\n';

  md += '## 2. Canonical Composite Lineage Trait Packages\n\n';
  md += '| Package Name | Trait ID | BP Cost | Component Traits & Mechanics | Inherited By |\n';
  md += '| :--- | :--- | :---: | :--- | :--- |\n';
  md += '| **Aeld Lineage Traits** | `trait-aeld-lineage-traits` | **5 BP** | Awakened (Arcane) [2 BP], Longevity / Lifespan 600+ yrs [1 BP], Sleepless / Sleep Immunity [2 BP] | Alterian, Doppelganger, Draconian, Kovian |\n';
  md += '| **Asi Base Traits** | `trait-asi-base-traits` | **8 BP** | Ageless [2 BP], Obfuscate [2 BP], Sleepless [2 BP], Fey Nature / Primal Resonance [2 BP] | Ferren, Fey (Base), Frellin, Koban, Sigal, Tozen, Whisper, Wildling |\n';
  md += '| **Auluran Base Traits** | `trait-auluran-base-traits` | **9 BP** | Biotechnology Affinity [2 BP], Low Light Vision [1 BP], Prehensile Limbs / Tail [3 BP], Scent [1 BP], Natural Weapons (Claws/Teeth) [2 BP] | Dar, Graa, Koda, Prokos |\n';
  md += '| **Dragonkin Traits** | `trait-dragonkin-traits` | **6 BP** | Low Light Vision [1 BP], Sharp Senses / Dragon Senses [1 BP], Scales / Natural Armor DR 2 [2 BP], Natural Weapons (1d6 lethal claws/fangs/horns) [2 BP] | Draconian Aeld, Draconic Human |\n';
  md += '| **Kitin Base Traits** | `trait-kitin-base-traits` | **8 BP** | Awakened (Psychic) [2 BP], Biotechnology [2 BP], Hive Connection [2 BP], Torpor / Sleepless [2 BP] | Maantene, Manelli, Murex, Rakne, Riezen, Syndess |\n';
  md += '| **Progenitor Heritage Base** | `trait-progenitor-heritage-base` | **26 BP** | Awakened x6 (All Disciplines) [12 BP], Telepathy [2 BP], Telekinesis [2 BP], Fast Heal [2 BP], Regeneration [2 BP], Ageless [2 BP], Immortal [4 BP] | Ila, U’Nonn |\n';
  md += '| **Synthetic Base Traits** | `trait-synthetic-base-traits` | **14 BP** | Immunities (Asphyxiation, Bleed, Crit, Starve, Sleep, Bio Needs) [9 BP], Repair Required [-3 BP], Digitized Mind [2 BP], Robotic Strength (+1 Size) [2 BP], Resilient Design (DR 5/-) [2 BP], Low-Light Vision [2 BP] | All 12 Synthetics (Android, Scrap, Skin, Biomechanical, Eidolon, Golem, Intellect, Mekan, Protocol, Sentient Machine, Shell, Swarm) |\n\n';
  md += '> [!NOTE]\n';
  md += '> In companion rules (`99. MODULAR COMPANION MATRIX.md`), an abbreviated **Synthetic Traits Package (Immunities/No Vit)** is valued at **6 BP**.\n\n';
  md += '---\n\n';

  md += '## 3. Master Directory of Inherent Trait Packages (All 83 Species)\n\n';

  const lineages = [
    'Aeld',
    'Asi (Fey Lineages)',
    'Aulurans',
    'Humans (Core & Variants)',
    'Engineered Humans (Gen-E)',
    'Kitin',
    'Progenitors',
    "Sha'nor & Void Lineages",
    'Synthetics',
    'Independent Xenotypes'
  ];

  const byLineage = {};
  speciesList.forEach(s => {
    let p = s.parent_species || 'Independent Xenotypes';
    if (p === 'humans') p = 'Humans (Core & Variants)';
    if (p === 'gene') p = 'Engineered Humans (Gen-E)';
    if (p === 'asi') p = 'Asi (Fey Lineages)';
    if (p === 'aulurans') p = 'Aulurans';
    if (p === 'kitin') p = 'Kitin';
    if (p === 'synthetics') p = 'Synthetics';
    if (p === 'progenitors') p = 'Progenitors';
    if (p === 'shanor') p = "Sha'nor & Void Lineages";
    if (p === 'independent') p = 'Independent Xenotypes';
    if (p === 'Aeld') p = 'Aeld';

    if (!byLineage[p]) byLineage[p] = [];
    byLineage[p].push(s);
  });

  lineages.forEach(lin => {
    const list = byLineage[lin] || [];
    md += `### ${lin} (${list.length} Species)\n\n`;
    md += '| Species Name | Total BP | Inherent Trait Package (Granted at 0 CP) | Composite Package Used | Sample Recommended Features |\n';
    md += '| :--- | :---: | :--- | :--- | :--- |\n';

    list.forEach(s => {
      const traitNames = (s.traits || []).map(id => {
        const obj = traitMap.get(id);
        return obj ? obj.name : id;
      });
      const traitListStr = traitNames.length > 0 ? traitNames.map(t => '`' + t + '`').join(', ') : '*None*';
      
      let basePkg = '—';
      if ((s.traits || []).includes('trait-aeld-lineage-traits')) basePkg = 'Aeld Lineage [5 BP]';
      if ((s.traits || []).includes('trait-asi-base-traits')) basePkg = 'Asi Base [8 BP]';
      if ((s.traits || []).includes('trait-auluran-base-traits')) basePkg = 'Auluran Base [9 BP]';
      if ((s.traits || []).includes('trait-dragonkin-traits')) basePkg = 'Dragonkin [6 BP]';
      if ((s.traits || []).includes('trait-kitin-base-traits')) basePkg = 'Kitin Base [8 BP]';
      if ((s.traits || []).includes('trait-progenitor-heritage-base')) basePkg = 'Progenitor Heritage [26 BP]';
      if ((s.traits || []).includes('trait-synthetic-base-traits')) basePkg = 'Synthetic Base [14 BP]';

      const recStr = (s.recommended_features || []).slice(0, 4).join(', ') || 'Standard';
      md += `| **${s.name}** | **${s.costs?.bp ?? s.cp_cost} BP** | ${traitListStr} | ${basePkg} | ${recStr} |\n`;
    });
    md += '\n';
  });

  const outPath = 'C:/Users/Tangent/.gemini/antigravity/brain/2ae0ba04-7c51-4b7b-9986-59f4e24d4a2c/species_trait_packages_catalog_report.md';
  fs.writeFileSync(outPath, md, 'utf8');
  console.log('Successfully written artifact to:', outPath);
});
