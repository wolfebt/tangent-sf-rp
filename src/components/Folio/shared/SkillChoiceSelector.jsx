import React from 'react';
import { SKILL_CATEGORY_SECTIONS } from '../../../data/skillsData';
import { resolveSkillChoiceModifierOptions, ALL_SKILL_GROUP_KEYS } from '../../../engines/tangentModifierEngine';
import { useFolio, normalizeTraitName } from '../../../context/FolioContext';

/**
 * Reusable interactive Skill / Option Choice selector for Features and Traits
 * that grant a bonus to a skill of choice (or from a mentioned category/list of skills).
 */
const SkillChoiceSelector = ({
  item,
  itemType,
  characterData: propCharacterData,
  onSelectChange,
  compact = false,
  style = {}
}) => {
  const folio = useFolio() || {};
  const characterData = propCharacterData || folio.characterData || {};
  const updateTraitSkillSelection = folio.updateTraitSkillSelection;
  const updateFeatureSkillSelection = folio.updateFeatureSkillSelection;

  if (!item) return null;

  const modOptions = item?.modifier_options?.enabled
    ? item.modifier_options
    : resolveSkillChoiceModifierOptions(item);

  if (!modOptions || !modOptions.enabled) return null;

  const isTrait = itemType === 'trait' ||
    (!itemType && (
      item?.category === 'traits' ||
      Boolean(item?.trait_type) ||
      String(item?.id || '').toLowerCase().startsWith('trait-')
    ));

  const cleanId = String(item?.id || '').trim().toLowerCase();
  const rawName = item?.name || item?.title || item?.id || '';
  const cleanName = normalizeTraitName(rawName).toLowerCase();

  // Resolve persisted selection from item, characterData.*SkillSelections, or characterData.traits/features
  const selectionMap = isTrait
    ? (characterData?.traitSkillSelections || {})
    : (characterData?.featureSkillSelections || {});
  const mapEntry = (cleanId && selectionMap[cleanId]) || (cleanName && selectionMap[cleanName]) || null;

  const matchingListItem = (() => {
    const list = isTrait
      ? (Array.isArray(characterData?.traits) ? characterData.traits : [])
      : (Array.isArray(characterData?.features) ? characterData.features : []);
    return list.find(entry => {
      if (!entry || typeof entry !== 'object') return false;
      const eId = String(entry.id || '').trim().toLowerCase();
      const eName = normalizeTraitName(entry.name || entry.title || entry.id || '').toLowerCase();
      return (cleanId && eId === cleanId) || (cleanName && eName === cleanName);
    });
  })();

  const handleApplySelection = (payload) => {
    if (typeof onSelectChange === 'function') {
      onSelectChange(payload);
      return;
    }
    if (isTrait && typeof updateTraitSkillSelection === 'function') {
      updateTraitSkillSelection(item, payload);
    } else if (!isTrait && typeof updateFeatureSkillSelection === 'function') {
      updateFeatureSkillSelection(item, payload);
    }
  };

  const itemRank = Math.max(1, parseInt(item?.rank ?? matchingListItem?.rank ?? 1, 10) || 1);
  const isRanked = Boolean(item?.is_ranked || matchingListItem?.is_ranked);
  const rankMult = isRanked ? itemRank : 1;

  // MODE 1: Group Pool Skill Selection
  if (modOptions.mode === 'group_pool') {
    const groupKeys = Array.isArray(modOptions.group_keys) && modOptions.group_keys.length > 0
      ? modOptions.group_keys
      : (modOptions.group_key ? [modOptions.group_key] : ALL_SKILL_GROUP_KEYS);

    const groupedPools = [];
    const flatPoolSkills = [];
    groupKeys.forEach(gKey => {
      const section = SKILL_CATEGORY_SECTIONS[gKey];
      if (section && Array.isArray(section.skills)) {
        const skillsInGroup = section.skills.map(s => ({ ...s, categoryTitle: section.title }));
        groupedPools.push({ key: gKey, title: section.title, skills: skillsInGroup });
        flatPoolSkills.push(...skillsInGroup);
      }
    });

    const maxSkills = parseInt(modOptions.max_skills, 10) || 1;
    const baseVal = parseInt(modOptions.value, 10) || 2;
    const optVal = baseVal * rankMult;

    const itemSelected = Array.isArray(item?.selected_skills) && item.selected_skills.length > 0
      ? item.selected_skills
      : (item?.selected_skill ? [item.selected_skill] : null);
    const listSelected = Array.isArray(matchingListItem?.selected_skills) && matchingListItem.selected_skills.length > 0
      ? matchingListItem.selected_skills
      : (matchingListItem?.selected_skill ? [matchingListItem.selected_skill] : null);
    const mapSelected = Array.isArray(mapEntry?.selected_skills)
      ? mapEntry.selected_skills
      : (Array.isArray(mapEntry) ? mapEntry : (mapEntry?.selected_skill ? [mapEntry.selected_skill] : null));

    const currentSelected = itemSelected || listSelected || mapSelected || [];
    const groupLabel = modOptions.group_label || 'Eligible Skills';

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: compact ? '6px' : '8px',
          padding: compact ? '6px 8px' : '8px 10px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          ...style
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#10b981', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            SKILL BONUS SELECTION ({currentSelected.length}/{maxSkills}) — {groupLabel}
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 900,
            color: '#6ee7b7',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>
            {optVal >= 0 ? `+${optVal}` : optVal} {isRanked && itemRank > 1 ? `(Rank ${itemRank})` : 'Bonus'}
          </span>
        </div>

        {currentSelected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {currentSelected.map(skillName => (
              <span
                key={skillName}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  borderRadius: '4px',
                  color: '#6ee7b7',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                {skillName} ({optVal >= 0 ? `+${optVal}` : optVal})
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = currentSelected.filter(s => s !== skillName);
                    handleApplySelection({
                      selected_skills: updated,
                      selected_skill: updated[0] || ''
                    });
                  }}
                  title={`Remove ${skillName}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {(currentSelected.length < maxSkills || maxSkills === 1) && (
          <select
            value={maxSkills === 1 ? (currentSelected[0] || '') : ''}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const chosen = e.target.value;
              if (!chosen) {
                if (maxSkills === 1) {
                  handleApplySelection({ selected_skills: [], selected_skill: '' });
                }
                return;
              }
              let updated;
              if (maxSkills === 1) {
                updated = [chosen];
              } else {
                if (currentSelected.includes(chosen)) return;
                updated = [...currentSelected, chosen].slice(0, maxSkills);
              }
              handleApplySelection({
                selected_skills: updated,
                selected_skill: updated[0] || ''
              });
            }}
            style={{
              width: '100%',
              background: 'rgba(9, 13, 22, 0.92)',
              color: '#e2e8f0',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              borderRadius: '4px',
              padding: compact ? '4px 6px' : '5px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">
              {maxSkills === 1
                ? `-- Select ${groupLabel} (${optVal >= 0 ? `+${optVal}` : optVal}) --`
                : `+ Add Skill (${currentSelected.length}/${maxSkills}) from ${groupLabel}...`}
            </option>
            {groupedPools.length > 1
              ? groupedPools.map(group => (
                  <optgroup key={group.key} label={group.title}>
                    {group.skills
                      .filter(s => maxSkills === 1 || !currentSelected.includes(s.name))
                      .map(s => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({optVal >= 0 ? `+${optVal}` : optVal})
                        </option>
                      ))}
                  </optgroup>
                ))
              : flatPoolSkills
                  .filter(s => maxSkills === 1 || !currentSelected.includes(s.name))
                  .map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({optVal >= 0 ? `+${optVal}` : optVal})
                    </option>
                  ))}
          </select>
        )}
      </div>
    );
  }

  // MODE 2: Single / Explicit Option List
  if (Array.isArray(modOptions.options) && modOptions.options.length > 0) {
    const selectedId = item?.selected_option_id ||
      matchingListItem?.selected_option_id ||
      mapEntry?.selected_option_id ||
      (typeof mapEntry === 'string' ? mapEntry : '');

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: compact ? '6px' : '8px',
          padding: compact ? '6px 8px' : '8px 10px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          ...style
        }}
      >
        <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          {modOptions.group_label ? `${modOptions.group_label.toUpperCase()} SELECTION:` : 'SELECT OPTION / SPECIALIZATION:'}
        </span>
        <select
          value={selectedId}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            handleApplySelection({ selected_option_id: e.target.value });
          }}
          style={{
            width: '100%',
            background: 'rgba(9, 13, 22, 0.92)',
            color: '#e2e8f0',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '4px',
            padding: compact ? '4px 6px' : '5px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">-- Choose Option --</option>
          {modOptions.options.map((opt, oIdx) => {
            const optId = typeof opt === 'object' ? (opt.id || opt.label || `opt_${oIdx}`) : String(opt);
            const optLabel = typeof opt === 'object' ? (opt.label || opt.id || `Option ${oIdx + 1}`) : String(opt);
            return (
              <option key={optId} value={optId}>
                {optLabel}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return null;
};

export default SkillChoiceSelector;
