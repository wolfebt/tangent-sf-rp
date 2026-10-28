import React from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { 
  Briefcase, 
  Shield, 
  Sword, 
  Bot, 
  Building2, 
  Layers, 
  Plus, 
  Dices, 
  Trash2, 
  Edit3,
  Scale
} from 'lucide-react';
import { scaleCarryingCapacity } from '../../../engines/tangentScalingEngine';
import { 
  calculateCreditValue, 
  calculateDCFromCredits, 
  resolveItemCostDC 
} from '../../../engines/tangentItemEngines';
import FolioTooltip from '../shared/FolioTooltip';

const PROPERTY_CONFIG = {
  weaponry: {
    title: 'Weaponry',
    icon: '⚔️',
    key: 'weapons',
    altKey: 'weaponry',
    dbPath: 'weaponry',
    color: 'amber',
    description: 'Offensive armaments, firearms, blades, energy ordnance & weapon systems'
  },
  armoring: {
    title: 'Armoring',
    icon: '🛡️',
    key: 'armoring',
    altKey: 'armor',
    dbPath: 'armoring',
    color: 'emerald',
    description: 'Body armor, ballistic plate, kinetic force fields, powered suits & tactical carapaces'
  },
  gear: {
    title: 'Gear',
    icon: '🎒',
    key: 'gear',
    altKey: 'equipment',
    dbPath: 'gear',
    color: 'cyan',
    description: 'Field kits, surveillance gadgets, medical injectors, comms arrays & persona tools'
  },
  mech: {
    title: 'Mech',
    icon: '🤖',
    key: 'mecha',
    altKey: 'mech',
    dbPath: 'mecha',
    color: 'purple',
    description: 'Piloted combat mecha, motorized vehicles, atmospheric hovers, starcraft & tactical drones'
  },
  architecture: {
    title: 'Architecture',
    icon: '🏛️',
    key: 'architecture',
    altKey: 'structures',
    dbPath: 'architecture',
    color: 'blue',
    description: 'Real estate, covert safehouses, research laboratories, fortifications & orbital installations'
  },
  other: {
    title: 'Other',
    icon: '📦',
    key: 'other',
    altKey: 'misc',
    dbPath: 'other',
    color: 'slate',
    description: 'Commodities, trade goods, precious relics, currency stores & miscellaneous property'
  }
};

export const PropertyTab = ({ 
  activeSection = 'gear', 
  onOpenSelectorModal, 
  onOpenAssetModal,
  onBackToHub,
  onNavigate
}) => {
  const { characterData, updateField, getAttrTotal, derivedStats } = useFolio();
  const { openDiceRoller } = useDice();

  const getArray = (key, altKey) => {
    let val = characterData[key];
    if (!val && altKey) val = characterData[altKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const sumWeight = (list) => {
    return (list || []).reduce((acc, item) => {
      if (typeof item === 'object' && item !== null) {
        const wt = parseFloat(item.weight ?? item.wt ?? item.mass ?? 0) || 0;
        const qty = parseInt(item.qty ?? item.quantity ?? 1, 10) || 1;
        return acc + (wt * qty);
      }
      return acc;
    }, 0);
  };

  const weaponryList = getArray('weapons', 'weaponry');
  const armoringList = getArray('armoring', 'armor');
  const gearList = getArray('gear', 'equipment');
  const otherList = getArray('other', 'misc');

  const carriedWeight = Math.round((sumWeight(weaponryList) + sumWeight(armoringList) + sumWeight(gearList) + sumWeight(otherList)) * 10) / 10;
  const strScore = getAttrTotal ? getAttrTotal('attr-strength') : parseInt(characterData['attr-strength'] || 0, 10);
  const sizeKey = characterData['char-size'] || derivedStats?.size || 'Medium';
  const baseMaxCapacity = (Math.max(0, strScore) + 2) * 50; // 100 lbs base at STR 0
  const maxCapacity = scaleCarryingCapacity(baseMaxCapacity, sizeKey);
  const lightCapacity = Math.round(maxCapacity * 0.5);
  const loadPercent = Math.min(100, Math.round((carriedWeight / Math.max(1, maxCapacity)) * 100));
  const isOverburdened = carriedWeight > maxCapacity;
  const isEncumbered = carriedWeight > lightCapacity && !isOverburdened;

  const handleRollDamage = (damageExpr, weaponName, e = null) => {
    if (!damageExpr) return;
    openDiceRoller({
      label: `${weaponName || 'Weapon'} Damage`,
      expression: damageExpr,
      baseModifier: 0,
      rollMode: 'normal',
      characterName: characterData['char-name'] || 'Persona',
      personaId: characterData['character-doc-id'] || characterData.id,
      autoRoll: e?.shiftKey || false
    });
  };

  // Determine sections to render: if activeSection is specified and valid, show that section. If 'all', show all.
  const targetSections = (activeSection && PROPERTY_CONFIG[activeSection])
    ? [PROPERTY_CONFIG[activeSection]]
    : Object.values(PROPERTY_CONFIG);

  const renderSection = (config) => {
    const list = getArray(config.key, config.altKey);

    const handleRemoveItem = async (index) => {
      const item = list[index];
      const name = typeof item === 'object' ? (item.name || item.title || 'Item') : String(item);
      if (!(await confirmTypedDeletion(name, `${config.title.toLowerCase()} property item`))) return;
      const updated = list.filter((_, i) => i !== index);
      updateField(config.key, updated);
    };

    const handleAddQuickRow = () => {
      const newItem = {
        name: '',
        qty: 1,
        weight: 0,
        craft_dc: 10,
        purchase_dc: 10,
        cost: 160,
        credit_value: 160,
        tl: characterData['tech-level'] || '3',
        description: '',
        notes: ''
      };
      updateField(config.key, [...list, newItem]);
    };

    const handleUpdateItemField = (index, field, val) => {
      const updated = [...list];
      const target = typeof updated[index] === 'object' ? { ...updated[index] } : { name: updated[index] };
      target[field] = val;
      updated[index] = target;
      updateField(config.key, updated);
    };

    return (
      <div key={config.key} className="bg-slate-900/70 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-slate-950 rounded-lg border border-slate-800">
              {config.icon}
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                <span>{config.title} Property &amp; Inventory</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
                  {list.length} {list.length === 1 ? 'Item' : 'Items'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(config.key, config.title, config.dbPath)}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.15)] cursor-pointer"
                title={`Open sorted ${config.title} catalog with build option`}
              >
                <span>✨</span>
                <span>+ Add {config.title}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAddQuickRow}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Add empty quick row"
            >
              + Quick Row
            </button>
          </div>
        </div>

        {/* Inventory Items List */}
        {list.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-8 text-center border border-dashed border-slate-800 rounded-lg">
            No {config.title.toLowerCase()} items registered in character dossier. Click "+ Add {config.title}" to browse catalog or create a custom build.
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((item, idx) => {
              const isObj = typeof item === 'object' && item !== null;
              const name = isObj ? (item.name || item.title || 'Item') : String(item);
              const itemDC = isObj ? resolveItemCostDC(item) : 10;
              const qty = isObj && item.qty !== undefined ? item.qty : 1;
              const weight = isObj && item.weight !== undefined ? item.weight : '';
              const cost = isObj && (item.cost !== undefined || item.credit_value !== undefined || item.price !== undefined)
                ? (item.cost ?? item.credit_value ?? item.price)
                : calculateCreditValue(itemDC);
              const tl = isObj && item.tl !== undefined ? item.tl : '';
              const damage = isObj && item.damage ? item.damage : '';
              const resistance = isObj && item.resistance ? item.resistance : '';

              return (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 hover:border-cyan-900/60 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors">
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleUpdateItemField(idx, 'name', e.target.value)}
                        placeholder="Item name..."
                        className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 font-medium text-xs flex-1 min-w-[120px]"
                      />
                      {isObj && (
                        <FolioTooltip
                          title={name}
                          badge={config.title}
                          badgeColor={config.color === 'emerald' ? 'emerald' : config.color === 'amber' ? 'amber' : config.color === 'purple' ? 'purple' : 'cyan'}
                          description={item.description || item.desc || item.summary || 'No description provided.'}
                          cost={`${(parseInt(cost, 10) || 0).toLocaleString()} Cr`}
                          modifiers={[
                            { label: 'Craft/Buy DC', value: `DC ${itemDC}` },
                            ...(damage ? [{ label: 'Damage', value: damage }] : []),
                            ...(resistance ? [{ label: 'DR', value: resistance }] : []),
                            ...(weight ? [{ label: 'Weight', value: `${weight} lbs` }] : []),
                            ...(tl ? [{ label: 'TL', value: String(tl) }] : [])
                          ]}
                          rules={item.rules || item.rule || item.notes || item.special}
                          notes={item.notes}
                          showInfoIcon={true}
                        >
                          <span className="sr-only">{name}</span>
                        </FolioTooltip>
                      )}
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 shrink-0"
                      title="Crafting DC = Purchase DC = Cost DC"
                    >
                      DC {itemDC}
                    </span>

                    {damage && (
                      <button
                        type="button"
                        onClick={(e) => handleRollDamage(damage, name, e)}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                        title={`Roll weapon damage (${damage})`}
                      >
                        <span>🎲</span>
                        <span>{damage}</span>
                      </button>
                    )}

                    {resistance && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 shrink-0">
                        DR {resistance}
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500">Qty:</span>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => handleUpdateItemField(idx, 'qty', parseInt(e.target.value, 10) || 1)}
                        className="w-10 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-slate-200"
                      />
                    </div>

                    {weight !== '' && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span className="text-slate-500">Wt:</span>
                        <input
                          type="text"
                          value={weight}
                          onChange={(e) => handleUpdateItemField(idx, 'weight', e.target.value)}
                          placeholder="lbs"
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-slate-200"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold" title="Crafting DC = Purchase DC = Cost DC">DC:</span>
                      <input
                        type="number"
                        value={itemDC}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const updated = [...list];
                          const target = typeof updated[idx] === 'object' ? { ...updated[idx] } : { name: updated[idx] };
                          if (!isNaN(val)) {
                            const cr = calculateCreditValue(val);
                            target.craft_dc = val;
                            target.purchase_dc = val;
                            target.cost = cr;
                            target.credit_value = cr;
                          } else {
                            target.craft_dc = '';
                            target.purchase_dc = '';
                          }
                          updated[idx] = target;
                          updateField(config.key, updated);
                        }}
                        placeholder="DC"
                        className="w-12 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-0.5 text-center text-cyan-300"
                        title="Crafting/Purchase DC"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400 font-bold" title="Tangent Standard Curve Credit Value">Cost:</span>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const updated = [...list];
                          const target = typeof updated[idx] === 'object' ? { ...updated[idx] } : { name: updated[idx] };
                          if (!isNaN(val)) {
                            const dc = calculateDCFromCredits(val);
                            target.cost = val;
                            target.credit_value = val;
                            target.craft_dc = dc;
                            target.purchase_dc = dc;
                          } else {
                            target.cost = '';
                            target.credit_value = '';
                          }
                          updated[idx] = target;
                          updateField(config.key, updated);
                        }}
                        placeholder="Cr"
                        className="w-16 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-1 py-0.5 text-center text-amber-300 font-semibold"
                        title="Cost in Credits (Cr)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 shrink-0">
                    {onOpenAssetModal && isObj && (
                      <button
                        type="button"
                        onClick={() => onOpenAssetModal(config.key, config.title, 'edit', idx, item)}
                        className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit properties in Asset Modal"
                      >
                        <Edit3 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-6 pb-20 w-full">
      {/* Property Category Navigation Bar & Compact Encumbrance Telemetry */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-900/60 pb-3 gap-2.5">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {(() => {
            const totalItemsCount = Object.values(PROPERTY_CONFIG).reduce(
              (sum, cfg) => sum + getArray(cfg.key, cfg.altKey).length,
              0
            );
            const isAllActive = !activeSection || activeSection === 'all';
            return (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (onNavigate) onNavigate('property');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAllActive
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Show All Personal Property & Holdings"
              >
                <Briefcase size={13} className="text-cyan-400" />
                <span>All Property</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-cyan-300 font-mono">
                  {totalItemsCount}
                </span>
              </button>
            );
          })()}

          {Object.entries(PROPERTY_CONFIG).map(([secKey, cfg]) => {
            const isSecActive = activeSection === secKey;
            const count = getArray(cfg.key, cfg.altKey).length;

            return (
              <button
                key={secKey}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  if (onNavigate) onNavigate(`property-${secKey}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSecActive
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.title}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-cyan-300 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Carrying Capacity & Encumbrance Pill */}
        <FolioTooltip
          title="Carrying Capacity & Encumbrance"
          badge={isOverburdened ? 'Overburdened' : isEncumbered ? 'Encumbered' : 'Unencumbered'}
          badgeColor={isOverburdened ? 'rose' : isEncumbered ? 'amber' : 'emerald'}
          description={`STR +${strScore} (${sizeKey} Chassis). Light load limit: ${lightCapacity} lbs. Exceeding light load imposes -1 Reflex; exceeding max capacity (${maxCapacity} lbs) imposes -2 Reflex and halves speed.`}
          formula={`Carried: ${carriedWeight} lbs / Max: ${maxCapacity} lbs (${loadPercent}%)`}
        >
          <div className="flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono shrink-0">
            <Scale size={14} className={isOverburdened ? 'text-rose-400' : isEncumbered ? 'text-amber-400' : 'text-cyan-400'} />
            <span className="text-slate-300">
              Load: <strong className={isOverburdened ? 'text-rose-400' : isEncumbered ? 'text-amber-300' : 'text-cyan-300'}>{carriedWeight}</strong>/{maxCapacity} lbs
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverburdened ? 'bg-rose-500' : isEncumbered ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${loadPercent}%` }}
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
              isOverburdened
                ? 'bg-red-950 border-red-500/60 text-red-300 animate-pulse'
                : isEncumbered
                ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            }`}>
              {isOverburdened ? 'Overburdened' : isEncumbered ? 'Encumbered' : 'Light'}
            </span>
          </div>
        </FolioTooltip>
      </div>

      {/* Render Target Sections */}
      <div className="space-y-6">
        {targetSections.map(renderSection)}
      </div>
    </div>
  );
};

export default React.memo(PropertyTab);
