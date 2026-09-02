import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES, ELEMENT_SCHEMAS } from './elementSchemas';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { attachCreatorTag } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { useStory } from '../../../context/CampaignContext';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';


const EditElementModal = ({ isOpen, onClose, element, onSave, onDelete }) => {
  const { deleteSavedElement } = useStory();
  const [type, setType] = useState('Scenario');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fields, setFields] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const [pendingType, setPendingType] = useState(null);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (element) {
      setType(element.type || 'Scenario');
      setTitle(element.title || '');
      setContent(element.content || '');
      setImageUrl(element.imageUrl || '');
      setFields(element.fields || {});
      setCustomFields(Array.isArray(element.customFields) ? element.customFields : []);
      setActiveTabIdx(0);
      setPendingType(null);
      setShowTypeConfirm(false);
    }
  }, [element]);

  if (!isOpen || !element) return null;

  const schema = ELEMENT_SCHEMAS[type] || [];
  const schemaTabs = Array.from(new Set(schema.map(f => f.tab || 'General')));
  const allTabs = ['Main Content', ...schemaTabs, 'Custom Fields'];
  const currentTab = allTabs[activeTabIdx] || allTabs[0];

  const handleTypeSelectChange = (newType) => {
    if (newType === type) return;
    setPendingType(newType);
    setShowTypeConfirm(true);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setType(pendingType);
      setFields({});
      setActiveTabIdx(0);
    }
    setPendingType(null);
    setShowTypeConfirm(false);
  };

  const cancelTypeChange = () => {
    setPendingType(null);
    setShowTypeConfirm(false);
  };

  const handleFieldChange = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }));
  };

  const handleCustomFieldChange = (id, key, val) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { id: uuidv4(), label: '', value: '' }]);
  };

  const handleRemoveCustomField = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      setImageUrl(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Element title is required.");
      return;
    }
    const validCustomFields = customFields
      .filter(f => f.label && f.label.trim() !== '')
      .map(f => ({ id: f.id || uuidv4(), label: f.label.trim(), value: f.value || '' }));

    const rawUpdatedElement = {
      ...element,
      type,
      title: title.trim(),
      content,
      imageUrl,
      fields,
      customFields: validCustomFields,
      updatedAt: new Date().toISOString()
    };
    const updatedElement = attachCreatorTag(rawUpdatedElement, localStorage.getItem('userHandle'));

    onSave(updatedElement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans text-slate-200">
      <div className="bg-[#161b22] border border-cyan-500/70 rounded-2xl w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d1117] border-b border-[#0D5C63]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-cyan-600 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              ✏️
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                Edit Story Element
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {element.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
          {/* Type Change Confirmation Overlay */}
          {showTypeConfirm && (
            <div className="absolute inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-4 pt-16 pb-12 overflow-y-auto">
              <div className="bg-[#161b22] border border-amber-500/70 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl mx-auto shadow-md">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-400 uppercase tracking-wider">
                    Change Element Type?
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Changing type from <span className="font-bold text-amber-300 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/30">{type}</span> to <span className="font-bold text-cyan-300 px-1.5 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/30">{pendingType}</span> will reset type-specific fields as data will not carry over.
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={cancelTypeChange}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmTypeChange}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          )}

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

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Element Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeSelectChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-amber-300 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
              >
                {ELEMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Element Image Action */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 flex items-center justify-center gap-1.5"
              >
                🖼️ Upload
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                title="Paste Image URL"
              >
                🌐 URL
              </button>
              <button
                type="button"
                onClick={() => setIsArtistHubOpen(true)}
                className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                title="Generate Art Concept with Artist Hub"
              >
                🎨 Artist Hub
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-2 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-bold"
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
                className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded"
              >
                Set URL
              </button>
            </div>
          )}

          {/* Image Preview Banner if active */}
          {imageUrl && (
            <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3">
              <img src={imageUrl} alt="Element Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
              <span className="text-xs text-slate-400 font-mono truncate flex-1">Image Attached ({imageUrl.substring(0, 50)}...)</span>
            </div>
          )}

          {/* Dynamic Tabs Header */}
          <div className="flex flex-wrap items-center border-b border-slate-800/80 bg-[#090d16] p-3 gap-2 shrink-0">
            {allTabs.map((tab, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTabIdx(idx)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border ${
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
            {/* Tab: Main Content */}
            {currentTab === 'Main Content' && (
              <div className="space-y-2 h-full flex flex-col">
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Detailed Description & Narrative Notes
                </label>
                <div className="bg-slate-950 text-white rounded-lg border border-slate-700 overflow-hidden flex-1 min-h-[220px]">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Write detailed lore, background, secrets, or description..."
                    className="h-full flex flex-col text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Tab: Schema Fields */}
            {schemaTabs.includes(currentTab) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schema.filter(f => (f.tab || 'General') === currentTab).map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      {f.label}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={fields[f.key] || ''}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder || `Enter ${f.label}...`}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-all leading-relaxed"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fields[f.key] || ''}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder || `Enter ${f.label}...`}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded-lg text-xs outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Custom Fields */}
            {currentTab === 'Custom Fields' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Custom Fields & Key-Value Attributes
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <span>➕</span> Add Custom Field
                  </button>
                </div>

                {customFields.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                    No custom fields defined. Click "+ Add Custom Field" above to add unique properties.
                  </div>
                ) : (
                  customFields.map((cf, idx) => (
                    <div key={cf.id || idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={cf.label}
                          onChange={(e) => handleCustomFieldChange(cf.id, 'label', e.target.value)}
                          placeholder={`Field Label (e.g. Danger Rating)`}
                          className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(cf.id)}
                          className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold"
                          title="Remove Field"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={cf.value}
                        onChange={(e) => handleCustomFieldChange(cf.id, 'value', e.target.value)}
                        placeholder="Field value / description..."
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400 resize-none"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#0d1117] border-t border-[#0D5C63]/60 flex items-center justify-between gap-3">
            <div>
              {element && (element.id || element.title) && (
                <button
                  type="button"
                  onClick={() => {
                    const targetName = title || element.title || 'Untitled Element';
                    const itemDescriptor = type ? type.toLowerCase() : 'element';
                    if (confirmTypedDeletion(targetName, itemDescriptor)) {
                      if (onDelete) {
                        onDelete(element.id);
                      } else if (deleteSavedElement) {
                        deleteSavedElement(element.id);
                      }
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-lg text-xs font-bold uppercase transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🗑️</span> Delete Entry
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              >
                💾 Save Element Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
          initialPrompt={title ? `${title} (${type})` : ''}
          onApplyAsset={(asset) => {
            if (asset.prompt && !fields.summary) {
              handleFieldChange('summary', asset.prompt.substring(0, 160));
            }
          }}
        />
      )}
    </div>
  );
};

export default EditElementModal;


