import React from 'react';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { useFolio } from '../../../context/FolioContext';
import './printStyles.css';

const DEFAULT_PHYSICAL_SKILLS = ['Acrobatics', 'Athletics', 'Piloting', 'Stealth'];
const DEFAULT_MENTAL_SKILLS = ['Alertness', 'Academics'];
const DEFAULT_KNOWLEDGE_SKILLS = [
  'Appraisal', 'Computers', 'Culture', 'History', 'Investigation',
  'Language', 'Medicine', 'Nature', 'Navigation', 'Nobility',
  'Physics', 'Religion', 'Science', 'Survival', 'Tactics', 'Technology'
];
const DEFAULT_VOCATION_SKILLS = [
  'Administrator', 'Alchemist', 'Ambassador', 'Architect', 'Archivist',
  'Armorer', 'Artist', 'Artificer', 'Broker', 'Celebrity', 'Constable',
  'Courtesan', 'Culinarian', 'Demolitionist', 'Electrician', 'Engineer',
  'Groundskeeper', 'Handler', 'Laborer', 'Mechanic', 'Researcher',
  'Salvager', 'Soldier', 'Tailor', 'Transporter', 'Weaponsmith'
];
const DEFAULT_MANIPULATION_SKILLS = ['Awareness', 'Bluff', 'Diplomacy', 'Intimidate', 'Streetwise'];
const DEFAULT_EXPRESSION_SKILLS = [
  'Acting', 'Comedy', 'Dancing', 'Disguise', 'Keyboard',
  'Legerdemain', 'Oratory', 'Percussion', 'Singing', 'String', 'Style', 'Wind'
];
const DEFAULT_COMBAT_ARCHAIC = ['Defense', 'Melee', 'Ranged', 'Unarmed'];
const DEFAULT_COMBAT_MODERN = ['Ballistic', 'Heavy Weapons'];
const DEFAULT_COMBAT_ADVANCED = ['Energy', 'Heavy Energy'];

const PrintFolio = ({ characterData, isScreenPreview = false }) => {
  const getNum = (id, defaultVal = 0) => {
    const val = characterData[id];
    return parseInt(val || defaultVal, 10) || defaultVal;
  };

  const getStr = (id, defaultVal = '') => {
    return characterData[id] || defaultVal;
  };

  const getArray = (key) => {
    const val = characterData[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  let folioCtx = null;
  try {
    folioCtx = useFolio();
  } catch {}

  // Attribute totals
  const getAttrTotal = (id) => {
    if (folioCtx?.getAttrTotal) {
      return folioCtx.getAttrTotal(id);
    }
    return getNum(id) + getNum(`${id}-mod`);
  };

  const strTotal = getAttrTotal('attr-strength');
  const mightTotal = getAttrTotal('attr-might');
  const agiTotal = getAttrTotal('attr-agility');
  const reflexTotal = getAttrTotal('attr-reflex');
  const conTotal = getAttrTotal('attr-stamina');
  const fortTotal = getAttrTotal('attr-fortitude');
  const intTotal = getAttrTotal('attr-intellect');
  const logicTotal = getAttrTotal('attr-logic');
  const wisTotal = getAttrTotal('attr-wisdom');
  const willTotal = getAttrTotal('attr-will');
  const chaTotal = getAttrTotal('attr-charisma');
  const etiqTotal = getAttrTotal('attr-etiquette');

  // Secondary Vitals & Perception
  const combatInitiativeMod = folioCtx?.computedModifiers?.combatMods?.['initiative-mod'] || 0;
  const initiative = reflexTotal + getNum('initiative-mod') + combatInitiativeMod;
  const health = characterData['health'] ?? 30;
  const vitality = characterData['vitality'] ?? 30;
  const karma = characterData['karma'] ?? 3;

  const alertnessMod = getNum('skill-mental-alertness-mod');
  const alertnessRank = getNum('skill-mental-alertness-rank');
  const attuneRank = getNum('skill-meta-attune-rank');
  const insightRank = getNum('skill-social-insight-rank');
  const techRank = getNum('skill-mental-technology-rank');

  const basePerception = intTotal + wisTotal + alertnessMod + alertnessRank;
  const metaPerception = intTotal + wisTotal + alertnessMod + attuneRank;
  const socialPerception = intTotal + wisTotal + alertnessMod + insightRank;
  const techPerception = intTotal + wisTotal + alertnessMod + techRank;

  // Attacks
  const attacks = getArray('attacks');
  // Defense / Armor
  const armors = getArray('armor');
  // Property & Lists
  const features = getArray('features');
  const disadvantages = getArray('disadvantages');
  const augmentations = getArray('augmentations');
  const awakened = getArray('awakened');
  const invocations = getArray('invocations');
  const specialAbilities = getArray('special_abilities');
  const gear = getArray('gear');
  const weapons = getArray('weapons');
  const armoring = getArray('armoring');
  const mecha = getArray('mecha');
  const otherItems = getArray('other');
  const specializations = getArray('specializations');
  const notes = getArray('notes');

  // Helper to render skill row
  const renderSkillRow = (skillName, prefix) => {
    const slug = skillName.toLowerCase().replace(/[^a-z0-0]+/g, '-');
    const fullId = `skill-${prefix}-${slug}`;
    const rank = getNum(`${fullId}-rank`, 0);
    const mod = getNum(`${fullId}-mod`, 0);
    const att = getStr(`${fullId}-att`, '');
    const ttl = rank + mod;

    return (
      <tr key={skillName}>
        <td className="font-semibold text-[8px] pl-1">{skillName}</td>
        <td className="text-center font-mono text-[8px]">{rank > 0 ? rank : ''}</td>
        <td className="text-center font-mono text-[8px] uppercase">{att}</td>
        <td className="text-center font-mono text-[8px]">{mod !== 0 ? mod : ''}</td>
        <td className="text-center font-bold font-mono text-[8px]">{ttl > 0 ? ttl : ''}</td>
      </tr>
    );
  };

  const containerClass = isScreenPreview ? 'folio-preview-container' : '';
  const pageClass = isScreenPreview ? 'folio-page-screen' : 'folio-page';

  return (
    <div id="printable-folio-wrapper" className={containerClass}>
      
      {/* ==========================================
          PAGE 1: PERSONA FOLIO 1
      ========================================== */}
      <div className={pageClass}>
        {/* Top Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
          <div className="text-xl font-extrabold tracking-widest folio-header-title">TANGENT</div>
          <div className="text-sm font-bold tracking-widest">SCI-FI FANTASY RPG</div>
          <div className="text-right flex flex-col items-end">
            <div className="text-xs font-bold tracking-wider">PERSONA FOLIO 1</div>
            {(() => {
              const creatorInfo = extractCreatorInfo(characterData, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '');
              return (
                <div className="text-[9px] font-mono font-bold leading-tight uppercase">
                  <span>CREATOR: {creatorInfo.creatorTag}</span>
                  {creatorInfo.contributorTags && creatorInfo.contributorTags.length > 0 && (
                    <span className="ml-1 text-[8px] text-gray-700">| CONTRIB: {creatorInfo.contributorTags.join(', ')}</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Identity Grid */}
        <div className="grid grid-cols-12 gap-1 mb-2 text-[9px]">
          <div className="col-span-8 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">NAME</span>
            <span className="font-semibold text-xs font-mono">{getStr('char-name')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">AGE</span>
            <span className="font-semibold font-mono">{getStr('char-age')}</span>
          </div>

          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">CONCEPT</span>
            <span className="font-semibold">{getStr('char-concept')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">ARCHETYPE</span>
            <span className="font-semibold">{getStr('char-archetype') || '—'}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">GENDER</span>
            <span className="font-semibold">{getStr('char-gender')}</span>
          </div>

          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">SPECIES</span>
            <span className="font-semibold">{getStr('char-species')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">ORIGIN</span>
            <span className="font-semibold">{getStr('char-origin')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">HEIGHT</span>
            <span className="font-semibold font-mono">{getStr('char-height')}</span>
          </div>

          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">FACTION</span>
            <span className="font-semibold">{getStr('char-faction')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">OCCU</span>
            <span className="font-semibold">{getStr('char-occu')}</span>
          </div>
          <div className="col-span-4 folio-box p-1">
            <span className="font-bold uppercase text-[8px] block">WEIGHT</span>
            <span className="font-semibold font-mono">{getStr('char-weight')}</span>
          </div>

          <div className="col-span-6 folio-box p-1 h-12">
            <span className="font-bold uppercase text-[8px] block">PERSONALITY / MOTIVE</span>
            <span className="text-[8.5px] leading-tight block truncate">{getStr('char-motive')}</span>
          </div>
          <div className="col-span-6 folio-box p-1 h-12">
            <span className="font-bold uppercase text-[8px] block">DESCRIPTION / STYLE</span>
            <span className="text-[8.5px] leading-tight block truncate">{getStr('char-style')}</span>
          </div>
        </div>

        {/* 3-Column Page 1 Body */}
        <div className="grid grid-cols-12 gap-2 flex-1 text-[8.5px]">
          
          {/* LEFT COLUMN: Attributes, Vitals, Attacks, Armor DR */}
          <div className="col-span-4 flex flex-col gap-2">
            
            {/* Core Attributes */}
            <div className="folio-box p-1 space-y-1">
              <div className="grid grid-cols-2 gap-1 text-center font-bold">
                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">STRENGTH</div>
                  <div className="text-xs font-mono">{strTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">MIGHT {mightTotal}</div>
                </div>
                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">INTELLECT</div>
                  <div className="text-xs font-mono">{intTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">LOGIC {logicTotal}</div>
                </div>

                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">AGILITY</div>
                  <div className="text-xs font-mono">{agiTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">REFLEX {reflexTotal}</div>
                </div>
                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">WISDOM</div>
                  <div className="text-xs font-mono">{wisTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">WILL {willTotal}</div>
                </div>

                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">CONSTITUTION</div>
                  <div className="text-xs font-mono">{conTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">FORTITUDE {fortTotal}</div>
                </div>
                <div className="border border-black p-0.5 bg-gray-100">
                  <div className="text-[7.5px] uppercase">CHARISMA</div>
                  <div className="text-xs font-mono">{chaTotal}</div>
                  <div className="text-[7px] border-t border-black mt-0.5 pt-0.5 uppercase">ETIQUETTE {etiqTotal}</div>
                </div>
              </div>
            </div>

            {/* Vitals & Secondary Stats */}
            <div className="folio-box p-1 space-y-1 bg-gray-50">
              <div className="grid grid-cols-3 gap-1 text-center font-bold text-[8px]">
                <div className="border border-black p-0.5">
                  <span className="block text-[7px]">INITIATIVE</span>
                  <span className="font-mono text-xs">{initiative}</span>
                </div>
                <div className="border border-black p-0.5">
                  <span className="block text-[7px]">HEALTH</span>
                  <span className="font-mono text-xs">{health}</span>
                </div>
                <div className="border border-black p-0.5">
                  <span className="block text-[7px]">VITALITY</span>
                  <span className="font-mono text-xs">{vitality}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[7.5px]">
                <div className="border border-black p-0.5">
                  <span className="font-bold">KARMA:</span> <span className="font-mono font-bold">{karma}</span>
                </div>
                <div className="border border-black p-0.5">
                  <span className="font-bold">PLOT POINTS:</span> <span className="font-mono font-bold">{getNum('plot-points', 0)}</span>
                </div>
                <div className="border border-black p-0.5">
                  <span className="font-bold">TECH LEVEL:</span> <span className="font-mono font-bold">{getNum('tech-level', 3)}</span>
                </div>
                <div className="border border-black p-0.5">
                  <span className="font-bold">WEALTH:</span> <span className="font-mono font-bold">{getStr('wealth-rating', 'Lvl 0')}</span>
                </div>
              </div>

              <div className="border border-black p-1 text-[7.5px]">
                <div className="font-bold border-b border-black mb-0.5 pb-0.5 uppercase">PERCEPTION</div>
                <div className="grid grid-cols-3 text-center font-mono font-semibold">
                  <div>Meta: {metaPerception}</div>
                  <div>Social: {socialPerception}</div>
                  <div>Tech: {techPerception}</div>
                </div>
              </div>

              <div className="border border-black p-1 text-[7.5px]">
                <div className="font-bold border-b border-black mb-0.5 pb-0.5 uppercase">MOVE</div>
                <div className="grid grid-cols-4 text-center font-mono">
                  <div>Walk: {getStr('move-walk', '30')}</div>
                  <div>Swim: {getStr('move-swim', '15')}</div>
                  <div>Climb: {getStr('move-climb', '15')}</div>
                  <div>Fly: {getStr('move-fly', '-')}</div>
                </div>
              </div>
            </div>

            {/* Attacks Table */}
            <div className="folio-box p-1 flex-1 flex flex-col justify-between">
              <div className="folio-section-banner mb-1">ATTACK</div>
              <table className="folio-table mb-1">
                <thead>
                  <tr>
                    <th className="w-2/5">Attack</th>
                    <th className="w-1/5">Score</th>
                    <th className="w-1/5">Damage</th>
                    <th className="w-1/5">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(5, attacks.length) }).map((_, idx) => {
                    const att = attacks[idx] || {};
                    return (
                      <tr key={idx} className="h-4">
                        <td className="font-semibold text-[7.5px] truncate">{att.name || ''}</td>
                        <td className="text-center font-mono text-[7.5px]">{att.score || ''}</td>
                        <td className="text-center font-mono text-[7.5px]">{att.damage || ''}</td>
                        <td className="text-[7px] truncate">{att.notes || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Armor Location DR Table */}
            <div className="folio-box p-1">
              <div className="folio-section-banner mb-1">ARMOR LOCATION</div>
              <table className="folio-table">
                <thead>
                  <tr>
                    <th className="w-2/5">Location</th>
                    <th className="w-1/5">Total DR</th>
                    <th className="w-2/5">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { loc: 'Head', key: 'head' },
                    { loc: 'Torso', key: 'torso' },
                    { loc: 'Right Arm', key: 'rarm' },
                    { loc: 'Left Arm', key: 'larm' },
                    { loc: 'Right Leg', key: 'rleg' },
                    { loc: 'Left Leg', key: 'lleg' }
                  ].map((item) => {
                    const foundArmor = armors.find(a => (a.notes || a.name || '').toLowerCase().includes(item.key));
                    const dr = foundArmor ? (foundArmor.resistance || foundArmor.dr || '') : '';
                    const notes = foundArmor ? (foundArmor.notes || foundArmor.name || '') : '';
                    return (
                      <tr key={item.loc} className="h-3.5">
                        <td className="font-bold text-[7.5px]">{item.loc}</td>
                        <td className="text-center font-mono font-bold text-[7.5px]">{dr}</td>
                        <td className="text-[7px] truncate">{notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* MIDDLE COLUMN: Modifiers Lined Column */}
          <div className="col-span-3 folio-box p-1 flex flex-col">
            <div className="folio-section-banner mb-1 text-center">MODIFIERS</div>
            <div className="flex-1 flex flex-col">
              {Array.from({ length: 28 }).map((_, idx) => (
                <div key={idx} className="folio-line-row flex-1 text-[8px] px-1 flex items-center font-mono">
                  {characterData[`modifier_row_${idx}`] || ''}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Complete Skills List */}
          <div className="col-span-5 folio-box p-1 flex flex-col justify-between overflow-hidden">
            
            <table className="folio-table mb-1">
              <thead>
                <tr>
                  <th className="text-left pl-1">SKILL</th>
                  <th className="w-8">RANK</th>
                  <th className="w-8">ATT</th>
                  <th className="w-8">MOD</th>
                  <th className="w-8">TTL</th>
                </tr>
              </thead>
            </table>

            <div className="space-y-1 flex-1 overflow-hidden">
              
              {/* PHYSICAL */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">PHYSICAL</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_PHYSICAL_SKILLS.map(s => renderSkillRow(s, 'physical'))}</tbody>
                </table>
              </div>

              {/* MENTAL */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">MENTAL</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_MENTAL_SKILLS.map(s => renderSkillRow(s, 'mental'))}</tbody>
                </table>
              </div>

              {/* KNOWLEDGE */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">KNOWLEDGE</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_KNOWLEDGE_SKILLS.map(s => renderSkillRow(s, 'mental'))}</tbody>
                </table>
              </div>

              {/* VOCATION */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">VOCATION</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_VOCATION_SKILLS.map(s => renderSkillRow(s, 'mental'))}</tbody>
                </table>
              </div>

              {/* SOCIAL */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">SOCIAL</div>
                <div className="font-semibold text-[7px] italic px-1 bg-gray-100 border-x border-black">MANIPULATION</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_MANIPULATION_SKILLS.map(s => renderSkillRow(s, 'social'))}</tbody>
                </table>
                <div className="font-semibold text-[7px] italic px-1 bg-gray-100 border-x border-black">EXPRESSION</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_EXPRESSION_SKILLS.map(s => renderSkillRow(s, 'social'))}</tbody>
                </table>
              </div>

              {/* COMBAT */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">COMBAT</div>
                <div className="font-semibold text-[7px] italic px-1 bg-gray-100 border-x border-black">ARCHAIC</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_COMBAT_ARCHAIC.map(s => renderSkillRow(s, 'combat'))}</tbody>
                </table>
                <div className="font-semibold text-[7px] italic px-1 bg-gray-100 border-x border-black">MODERN</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_COMBAT_MODERN.map(s => renderSkillRow(s, 'combat'))}</tbody>
                </table>
                <div className="font-semibold text-[7px] italic px-1 bg-gray-100 border-x border-black">ADVANCED</div>
                <table className="folio-table">
                  <tbody>{DEFAULT_COMBAT_ADVANCED.map(s => renderSkillRow(s, 'combat'))}</tbody>
                </table>
              </div>

              {/* SPECIALIZATIONS / OTHER */}
              <div>
                <div className="bg-gray-200 font-bold text-[7.5px] uppercase px-1 border border-black">SPECIALIZATIONS / OTHER</div>
                <table className="folio-table">
                  <tbody>
                    {specializations.length > 0 ? (
                      specializations.map((sp, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold text-[8px] pl-1">{typeof sp === 'object' ? sp.name : sp}</td>
                          <td className="text-center font-mono text-[8px]">{sp.rank || ''}</td>
                          <td className="text-center font-mono text-[8px]">{sp.base || ''}</td>
                          <td className="text-center font-mono text-[8px]">{sp.mod || ''}</td>
                          <td className="text-center font-bold font-mono text-[8px]">{(sp.rank || 0) + (sp.mod || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="h-3">
                          <td></td><td></td><td></td><td></td><td></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          PAGE 2: PERSONA FOLIO 2
      ========================================== */}
      <div className={pageClass}>
        {/* Top Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
          <div className="text-xl font-extrabold tracking-widest folio-header-title">TANGENT</div>
          <div className="text-sm font-bold tracking-widest">SCI-FI FANTASY RPG</div>
          <div className="text-xs font-bold tracking-wider">PERSONA FOLIO 2</div>
        </div>

        <div className="grid grid-cols-12 gap-3 flex-1 text-[8.5px]">
          
          {/* Left & Middle Columns (Traits, Features, Augmentations) */}
          <div className="col-span-8 flex flex-col gap-2">
            
            {/* TRAITS */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1 flex justify-between">
                <span>TRAITS</span>
                <span>EFFECT</span>
              </div>
              
              <div className="space-y-1 flex-1">
                <div className="border border-black p-1 bg-gray-50">
                  <div className="font-bold text-[8px] uppercase border-b border-black pb-0.5">SPECIES TRAITS</div>
                  <div className="text-[8px] mt-1 space-y-0.5">
                    {features.filter(f => (typeof f === 'object' ? f.category : '').toLowerCase().includes('species')).map((f, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-semibold">{typeof f === 'object' ? f.name : f}</span>
                        <span className="italic text-[7.5px]">{typeof f === 'object' ? f.description : ''}</span>
                      </div>
                    ))}
                    {features.filter(f => (typeof f === 'object' ? f.category : '').toLowerCase().includes('species')).length === 0 && (
                      <div className="text-gray-400 italic">No specific species traits recorded</div>
                    )}
                  </div>
                </div>

                <div className="border border-black p-1 bg-gray-50">
                  <div className="font-bold text-[8px] uppercase border-b border-black pb-0.5">ORIGIN TRAITS</div>
                  <div className="text-[8px] mt-1">
                    {getStr('char-origin') ? `Origin: ${getStr('char-origin')}` : 'No origin traits'}
                  </div>
                </div>

                <div className="border border-black p-1 bg-gray-50">
                  <div className="font-bold text-[8px] uppercase border-b border-black pb-0.5">OCCUPATION PERKS</div>
                  <div className="text-[8px] mt-1">
                    {getStr('char-occu') ? `Occupation: ${getStr('char-occu')}` : 'No occupation perks'}
                  </div>
                </div>

                <div className="border border-black p-1 bg-gray-50 flex-1">
                  <div className="font-bold text-[8px] uppercase border-b border-black pb-0.5">DISADVANTAGES & OTHER TRAITS</div>
                  <div className="text-[8px] mt-1 space-y-0.5">
                    {disadvantages.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-semibold">{typeof d === 'object' ? d.name : d}</span>
                        <span className="italic text-[7.5px]">{typeof d === 'object' ? d.description : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1 flex justify-between">
                <span>FEATURE</span>
                <span>EFFECT</span>
              </div>
              <div className="flex-1 space-y-0.5">
                {features.map((f, i) => (
                  <div key={i} className="folio-line-row flex justify-between items-center px-1">
                    <span className="font-bold text-[8px]">{typeof f === 'object' ? f.name : f}</span>
                    <span className="text-[7.5px] text-gray-700">{typeof f === 'object' ? (f.description || f.mechanic || '') : ''}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 8 - features.length) }).map((_, idx) => (
                  <div key={idx} className="folio-line-row h-4"></div>
                ))}
              </div>
            </div>

            {/* AUGMENTATION */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1 flex justify-between">
                <span>AUGMENTATION</span>
                <span>EFFECT</span>
              </div>
              <div className="flex-1 space-y-0.5">
                {augmentations.map((a, i) => (
                  <div key={i} className="folio-line-row flex justify-between items-center px-1">
                    <span className="font-bold text-[8px]">{typeof a === 'object' ? a.name : a}</span>
                    <span className="text-[7.5px] text-gray-700">{typeof a === 'object' ? (a.description || a.notes || '') : ''}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - augmentations.length) }).map((_, idx) => (
                  <div key={idx} className="folio-line-row h-4"></div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Meta Skills, Invocations, Special Abilities) */}
          <div className="col-span-4 flex flex-col gap-2">
            
            {/* Meta Skills / Disciplines */}
            <div className="folio-box p-1">
              <table className="folio-table mb-1">
                <thead>
                  <tr>
                    <th className="text-left pl-1">SKILL</th>
                    <th className="w-7">RANK</th>
                    <th className="w-7">BASE</th>
                    <th className="w-7">MODS</th>
                    <th className="w-7">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">METAFOCUS</td></tr>
                  {renderSkillRow('Attune', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">DIMENSION</td></tr>
                  {renderSkillRow('Summoning', 'meta')}
                  {renderSkillRow('Teleport', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">ENERGY</td></tr>
                  {renderSkillRow('Elemental', 'meta')}
                  {renderSkillRow('Force', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">ENTROPY</td></tr>
                  {renderSkillRow('Chaos', 'meta')}
                  {renderSkillRow('Order', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">ILLUSION</td></tr>
                  {renderSkillRow('Phantasmal', 'meta')}
                  {renderSkillRow('Shadow', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">MATTER</td></tr>
                  {renderSkillRow('Enhancement', 'meta')}
                  {renderSkillRow('Transmutation', 'meta')}

                  <tr className="bg-gray-200 font-bold text-[7.5px]"><td colSpan={5} className="pl-1">MENTAL</td></tr>
                  {renderSkillRow('Projection', 'meta')}
                  {renderSkillRow('Sense', 'meta')}
                </tbody>
              </table>
            </div>

            {/* Invocations */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1 flex justify-between">
                <span>INVOCATIONS</span>
                <span>LEVEL</span>
              </div>
              <div className="flex-1 space-y-0.5">
                {invocations.map((inv, i) => (
                  <div key={i} className="folio-line-row flex justify-between items-center px-1">
                    <span className="font-bold text-[8px]">{typeof inv === 'object' ? inv.name : inv}</span>
                    <span className="font-mono text-[7.5px]">{typeof inv === 'object' ? (inv.level || inv.cp || '1') : '1'}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 10 - invocations.length) }).map((_, idx) => (
                  <div key={idx} className="folio-line-row h-4"></div>
                ))}
              </div>
            </div>

            {/* Special Abilities */}
            <div className="folio-box p-1">
              <div className="folio-section-banner mb-1">SPECIAL ABILITIES</div>
              <table className="folio-table">
                <thead>
                  <tr>
                    <th className="text-left pl-1">SKILL</th>
                    <th className="w-7">RANK</th>
                    <th className="w-7">BASE</th>
                    <th className="w-7">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {specialAbilities.length > 0 ? (
                    specialAbilities.map((sa, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-[7.5px] pl-1">{typeof sa === 'object' ? sa.name : sa}</td>
                        <td className="text-center font-mono text-[7.5px]">{sa.rank || ''}</td>
                        <td className="text-center font-mono text-[7.5px]">{sa.base || ''}</td>
                        <td className="text-center font-bold font-mono text-[7.5px]">{(sa.rank || 0) + (sa.base || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} className="h-3.5">
                        <td></td><td></td><td></td><td></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>

      {/* ==========================================
          PAGE 3: PERSONA FOLIO 3
      ========================================== */}
      <div className={pageClass}>
        {/* Top Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
          <div className="text-xl font-extrabold tracking-widest folio-header-title">TANGENT</div>
          <div className="text-sm font-bold tracking-widest">SCI-FI FANTASY RPG</div>
          <div className="text-xs font-bold tracking-wider">PERSONA FOLIO 3</div>
        </div>

        <div className="grid grid-cols-12 gap-3 flex-1 text-[8.5px]">
          
          {/* Left Column (Mecha & Miscellaneous) */}
          <div className="col-span-6 flex flex-col gap-2">
            
            {/* MECHA */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1">MECHA & VEHICLE SYSTEMS</div>
              <div className="flex-1 space-y-0.5">
                {mecha.map((m, i) => (
                  <div key={i} className="folio-line-row flex justify-between items-center px-1">
                    <span className="font-bold text-[8px]">{typeof m === 'object' ? m.name : m}</span>
                    <span className="text-[7.5px] font-mono">{typeof m === 'object' ? `Qty: ${m.qty || 1}` : ''}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 16 - mecha.length) }).map((_, idx) => (
                  <div key={idx} className="folio-line-row h-4"></div>
                ))}
              </div>
            </div>

            {/* MISCELLANEOUS */}
            <div className="folio-box p-1 flex-1 flex flex-col">
              <div className="folio-section-banner mb-1">MISCELLANEOUS</div>
              <div className="flex-1 space-y-0.5">
                {otherItems.map((o, i) => (
                  <div key={i} className="folio-line-row flex justify-between items-center px-1">
                    <span className="font-bold text-[8px]">{typeof o === 'object' ? o.name : o}</span>
                    <span className="text-[7.5px]">{typeof o === 'object' ? (o.description || o.notes || '') : ''}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 16 - otherItems.length) }).map((_, idx) => (
                  <div key={idx} className="folio-line-row h-4"></div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Gear & Inventory) */}
          <div className="col-span-6 folio-box p-1 flex flex-col">
            <div className="folio-section-banner mb-1">GEAR & INVENTORY</div>
            <div className="flex-1 space-y-0.5">
              {[...gear, ...weapons, ...armoring].map((g, i) => (
                <div key={i} className="folio-line-row flex justify-between items-center px-1">
                  <span className="font-bold text-[8px]">{typeof g === 'object' ? g.name : g}</span>
                  <div className="text-[7.5px] font-mono space-x-2">
                    <span>Qty: {typeof g === 'object' ? (g.qty || 1) : 1}</span>
                    <span>Wt: {typeof g === 'object' ? (g.weight || 0) : 0}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 34 - (gear.length + weapons.length + armoring.length)) }).map((_, idx) => (
                <div key={idx} className="folio-line-row h-4"></div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          PAGE 4: PERSONA FOLIO 4
      ========================================== */}
      <div className={pageClass}>
        {/* Top Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
          <div className="text-xl font-extrabold tracking-widest folio-header-title">TANGENT</div>
          <div className="text-sm font-bold tracking-widest">SCI-FI FANTASY RPG</div>
          <div className="text-xs font-bold tracking-wider">PERSONA FOLIO 4</div>
        </div>

        <div className="folio-box p-2 flex-1 flex flex-col">
          <div className="folio-section-banner mb-2 text-center text-xs">CHARACTER NOTES, BACKSTORY & SESSION JOURNAL</div>
          
          <div className="flex-1 space-y-1">
            {notes.map((n, i) => (
              <div key={i} className="mb-2 p-1.5 border border-black bg-gray-50 text-[8.5px]">
                <div className="font-bold uppercase text-[7.5px] border-b border-black pb-0.5 mb-1">NOTE ENTRY #{i + 1}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{typeof n === 'object' ? n.text : n}</div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 36 - (notes.length * 4)) }).map((_, idx) => (
              <div key={idx} className="folio-line-row h-4"></div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default React.memo(PrintFolio);
