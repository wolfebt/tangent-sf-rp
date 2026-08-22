import React from 'react';
import { 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Dice5, 
  Sparkles, 
  Layers, 
  Building, 
  Info 
} from 'lucide-react';
import { 
  WORKSPACE_SCALES, 
  COMPUTER_PR_RATINGS, 
  EPR_RATINGS, 
  EQUIPMENT_SIZES,
  MANUFACTURER_SKINS 
} from '../../../engines/tangentConstants';

export const EquipmentCategoryConfigurator = ({
  formData = {},
  onChange = () => {}
}) => {
  const category = formData.category || 'Electronics';
  const size = formData.size || 'Small';
  const workspaceScale = formData.workspace_scale || 'Belt';
  const computerPR = formData.computer_pr ?? 1;
  const softwareLevel = formData.software_level || 0;
  const eprRating = formData.epr_rating ?? 0;
  const supplyDie = formData.supply_die || 'None';
  const skin = formData.faction_skin || formData.skin || 'Syndicate';

  const isToolsCategory = category.includes('Tools') || category.includes('Maintenance');
  const isDataCategory = category.includes('Electronics') || category.includes('Data') || category.includes('Surveillance');
  const isSurvivalCategory = category.includes('Survival') || category.includes('Medical');

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-white">Equipment Matrix Configurator</span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
          {category}
        </span>
      </div>

      {/* Size Category Footprint */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Physical Footprint / Size Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {Object.values(EQUIPMENT_SIZES).map((s) => {
            const isSelected = size === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange('size', s.id);
                  if (formData.base_dc === undefined || formData.base_dc === null) {
                    onChange('base_dc', s.defaultDC);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{s.name}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{s.mass}</div>
                <div className="text-[9px] text-amber-400/80 mt-0.5">{s.capacityDisplay}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Section: Tools Workspace Scale */}
      {isToolsCategory && (
        <div className="space-y-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] uppercase">
            <Wrench size={13} />
            <span>Vocation Workspace Scale</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.values(WORKSPACE_SCALES).map((ws) => {
              const isSelected = workspaceScale === ws.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => onChange('workspace_scale', ws.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow-sm font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>{ws.name}</span>
                    <span className="text-amber-400 font-bold">+{ws.dcMod} DC</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">{ws.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Section: Electronics & Computer PR / Software */}
      {isDataCategory && (
        <div className="space-y-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase">
              <Cpu size={13} />
              <span>Computational Architecture & Processor Rating (PR)</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PR {computerPR}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {Object.values(COMPUTER_PR_RATINGS).map((pr) => {
              const isSelected = Number(computerPR) === pr.pr;
              return (
                <button
                  key={pr.pr}
                  type="button"
                  onClick={() => onChange('computer_pr', pr.pr)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 font-bold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>PR {pr.pr}</span>
                    <span className="text-cyan-400 font-bold">+{pr.dcMod} DC</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium mt-0.5">{pr.name}</div>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">{pr.description}</p>
                </button>
              );
            })}
          </div>

          {/* Software Level Slider */}
          <div className="flex items-center justify-between gap-4 p-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-200">Installed Software Rating</span>
              <p className="text-[9px] text-slate-500">Grants +{softwareLevel} to designated tasks (+5 DC / rank)</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                value={softwareLevel}
                onChange={(e) => onChange('software_level', Number(e.target.value))}
                className="w-28 accent-cyan-400 cursor-pointer"
              />
              <span className="w-8 text-center text-xs font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
                +{softwareLevel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Section: Survival Environmental Protection (EPR) */}
      {isSurvivalCategory && (
        <div className="space-y-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase">
            <ShieldCheck size={13} />
            <span>Environmental Protection Rating (EPR)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {Object.values(EPR_RATINGS).map((epr) => {
              const isSelected = Number(eprRating) === epr.rating;
              return (
                <button
                  key={epr.rating}
                  type="button"
                  onClick={() => onChange('epr_rating', epr.rating)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>EPR {epr.rating}</span>
                    <span className="text-emerald-400 font-bold">+{epr.dcMod} DC</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">{epr.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Logistics & Cultural Manufacturer Skin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Supply Die Selector */}
        <div className="space-y-1.5 p-3 bg-slate-900/40 border border-slate-800/90 rounded-xl">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Dice5 size={13} className="text-amber-400" />
            <span>Consumable Supply Die</span>
          </label>
          <div className="flex items-center gap-1.5">
            {['None', 'd4', 'd6', 'd8', 'd10', 'd12'].map((die) => (
              <button
                key={die}
                type="button"
                onClick={() => onChange('supply_die', die)}
                className={`flex-1 py-1.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                  supplyDie === die
                    ? 'bg-amber-950 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {die}
              </button>
            ))}
          </div>
        </div>

        {/* Cultural Skin / Manufacturer */}
        <div className="space-y-1.5 p-3 bg-slate-900/40 border border-slate-800/90 rounded-xl">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-purple-400" />
            <span>Cultural Skin / Manufacturer</span>
          </label>
          <select
            value={skin}
            onChange={(e) => {
              onChange('faction_skin', e.target.value);
              onChange('skin', e.target.value);
            }}
            className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
          >
            {Object.values(MANUFACTURER_SKINS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.title} {m.dcMod !== 0 ? `(${m.dcMod > 0 ? '+' : ''}${m.dcMod} DC)` : ''}
              </option>
            ))}
          </select>
          {MANUFACTURER_SKINS[skin] && (
            <p className="text-[10px] text-purple-300/90 leading-tight mt-1">
              <strong>Trait:</strong> {MANUFACTURER_SKINS[skin].trait}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCategoryConfigurator;
