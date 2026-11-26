import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  ELEMENT_TYPES,
  PROPERTY_SUBCATEGORIES,
  PERSONA_SUBCATEGORIES,
  METAPHYSICS_SUBCATEGORIES
} from '../elementSchemas';
import AimeThreeTierStack from './AimeThreeTierStack';
import { FOLIO_NARRATIVE_SECTIONS } from '../../../../utils/personaBridge';

const AutoExpandingElementTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(48, el.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={2}
      value={value || ''}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden`}
      style={{ fieldSizing: 'content' }}
    />
  );
};

/**
 * Direct Master Sheet editor form body for EditElementModal.
 */
export default function EditElementSheetModeBody({
  handleSubmit,
  title,
  setTitle,
  type,
  handleTypeSelectChange,
  fields,
  element,
  handleMergeFields,
  handleFieldChange,
  isUploadingImage,
  fileInputRef,
  showUrlInput,
  setShowUrlInput,
  urlInputValue,
  setUrlInputValue,
  handleUrlSubmit,
  setIsArtistHubOpen,
  imageUrl,
  setImageUrl,
  allTabs,
  activeTabIdx,
  setActiveTabIdx,
  currentTab,
  content,
  setContent,
  customFields,
  guidance,
  setGuidance,
  assetHub,
  setAssetHub,
  unifiedAssetCatalog,
  setRelationalSelectorState,
  setIsAimeGuidanceOpen,
  narrativeSectionId,
  setNarrativeSectionId,
  handleAddCustomField,
  handleCustomFieldChange,
  handleRemoveCustomField,
  resolvedSaveDestination,
  isDirty,
  isStoryReadOnly = false,
  handleSaveAsTemplate,
  handleRequestClose
}) {
  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Form Row: Title & Type & Image */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Element Title <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="E.g., Outpost Alpha, Lord Vane..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-semibold outline-none"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Element Type
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeSelectChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-amber-300 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
            >
              {ELEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {type === 'Property' && (
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                Subcategory
              </label>
              <select
                value={fields.propertySubcategory || element.propertySubcategory || 'gear'}
                onChange={(e) =>
                  handleMergeFields({
                    propertySubcategory: e.target.value,
                    itemCategory: e.target.value
                  })
                }
                className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-amber-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
              >
                {PROPERTY_SUBCATEGORIES.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {type === 'Metaphysics' && (
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
                Subcategory
              </label>
              <select
                value={fields.metaphysicsSubcategory || element.metaphysicsSubcategory || 'invocations'}
                onChange={(e) =>
                  handleMergeFields({
                    metaphysicsSubcategory: e.target.value
                  })
                }
                className="w-full bg-slate-950 border border-violet-500/50 focus:border-violet-400 text-violet-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
              >
                {METAPHYSICS_SUBCATEGORIES.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {type === 'Persona' && (
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Persona Track
              </label>
              <select
                value={fields.personaSubcategory || element.personaSubcategory || 'story'}
                onChange={(e) =>
                  handleMergeFields({
                    personaSubcategory: e.target.value
                  })
                }
                className="w-full bg-slate-950 border border-cyan-500/50 focus:border-cyan-400 text-cyan-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
              >
                {PERSONA_SUBCATEGORIES.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Element Image Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUploadingImage ? '⏳ Uploading...' : '🖼️ Upload'}
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Paste Image URL"
          >
            🌐 URL
          </button>
          <button
            type="button"
            onClick={() => setIsArtistHubOpen(true)}
            className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            title="Generate Art Concept with Artist Hub"
          >
            🎨 Artist Hub
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="px-2 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-bold cursor-pointer"
              title="Remove Image"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* URL Input Bar if opened */}
      {showUrlInput && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex gap-2">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded cursor-pointer"
          >
            Set URL
          </button>
        </div>
      )}

      {/* Image Preview Banner if active */}
      {imageUrl && (
        <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3">
          <img
            src={imageUrl}
            alt="Element Preview"
            className="w-12 h-12 object-cover rounded-lg border border-slate-700"
          />
          <span className="text-xs text-slate-400 font-mono truncate flex-1">
            Image Attached ({imageUrl.substring(0, 50)}...)
          </span>
        </div>
      )}

      {/* Dynamic Tabs Header */}
      <div className="flex flex-wrap items-center border-b border-slate-800/80 bg-[#090d16] p-3 gap-2 shrink-0">
        {allTabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTabIdx(idx)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer ${
              activeTabIdx === idx
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
        {/* Tab: AIME 3-Tier Architecture (Default & Master View) */}
        {currentTab === 'AIME 3-Tier Architecture' && (
          <AimeThreeTierStack
            elementType={type}
            elementTitle={title}
            fields={fields}
            onChangeField={handleFieldChange}
            onMergeFields={handleMergeFields}
            content={content}
            customFields={customFields}
            guidance={guidance}
            onChangeGuidance={setGuidance}
            assetHub={assetHub}
            onChangeAssetHub={setAssetHub}
            availableElements={unifiedAssetCatalog}
            currentElementId={element?.id}
            onOpenRelationalSelector={(fieldDef) =>
              setRelationalSelectorState({
                key: fieldDef.key,
                label: fieldDef.label,
                dbSource: fieldDef.dbSource || 'species'
              })
            }
            onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
          />
        )}

        {/* Tab: Narrative Prose & Lore */}
        {currentTab === 'Narrative Prose & Lore' && (
          <div className="space-y-4 h-full flex flex-col">
            {type === 'Persona' && (
              <div className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                      Persona Folio Narrative Fields (Synced with MCM &amp; Folio)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Structured narrative identity, physicality, backstory, and psychology fields carried directly into the Persona Folio &amp; MCM.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {FOLIO_NARRATIVE_SECTIONS.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setNarrativeSectionId(sec.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                          narrativeSectionId === sec.id
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const activeSec =
                    FOLIO_NARRATIVE_SECTIONS.find((s) => s.id === narrativeSectionId) ||
                    FOLIO_NARRATIVE_SECTIONS[0];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeSec.fields.map((nf) => {
                        const val =
                          fields[nf.id] ||
                          (nf.aliasKeys || []).map((k) => fields[k]).find(Boolean) ||
                          '';
                        return (
                          <div
                            key={nf.id}
                            className={`space-y-1 ${nf.span2 ? 'md:col-span-2' : ''}`}
                          >
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                              {nf.label}
                            </label>
                            <AutoExpandingElementTextarea
                              value={val}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                handleFieldChange(nf.id, nextVal);
                                (nf.aliasKeys || []).forEach((aliasKey) => {
                                  handleFieldChange(aliasKey, nextVal);
                                });
                              }}
                              placeholder={nf.placeholder}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Detailed Description, Narrative Prose &amp; Lore
              </label>
              <div className="bg-slate-950 text-white rounded-lg border border-slate-700 overflow-hidden flex-1 min-h-[280px]">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={(val) => {
                    setContent(val);
                    if (type === 'Persona') {
                      handleFieldChange('narrativeProse', val);
                    }
                  }}
                  placeholder="Write detailed lore, background, secrets, or description..."
                  className="h-full flex flex-col text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Custom Fields */}
        {currentTab === 'Custom Fields' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Custom Fields &amp; Key-Value Attributes
              </h4>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>➕</span> Add Custom Field
              </button>
            </div>

            {customFields.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                No custom fields defined. Click &quot;+ Add Custom Field&quot; above to add unique properties.
              </div>
            ) : (
              customFields.map((cf, idx) => (
                <div
                  key={cf.id || idx}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => handleCustomFieldChange(cf.id, 'label', e.target.value)}
                      placeholder="Field Label (e.g. Danger Rating)"
                      className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cf.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold cursor-pointer"
                      title="Remove Field"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <AutoExpandingElementTextarea
                    value={cf.value}
                    onChange={(e) => handleCustomFieldChange(cf.id, 'value', e.target.value)}
                    placeholder="Field value / description..."
                    className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-[#0d1117] border-t border-[#0D5C63]/60 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          <span>
            Type: <strong className="text-slate-300">{type}</strong>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${
              resolvedSaveDestination.tone === 'cyan'
                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
                : resolvedSaveDestination.tone === 'amber'
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                : resolvedSaveDestination.tone === 'purple'
                ? 'bg-purple-950/80 border-purple-500/40 text-purple-200'
                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            }`}
          >
            Saves to {resolvedSaveDestination.label}
          </span>
          {isDirty && <span className="text-amber-400 font-bold">• Unsaved Changes</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isStoryReadOnly}
            onClick={handleSaveAsTemplate}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-200 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Template
          </button>
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] cursor-pointer"
          >
            💾 Save Element Changes
          </button>
        </div>
      </div>
    </form>
  );
}
