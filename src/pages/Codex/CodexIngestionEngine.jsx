import React, { useState } from 'react';
import { useDBM } from '../../context/DBMContext';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { Database, Play, CheckCircle, AlertTriangle, Download, Code, Search } from 'lucide-react';

export const CodexIngestionEngine = () => {
  const { saveEntry } = useDBM() || {};
  
  const [rawText, setRawText] = useState('');
  const [targetCollection, setTargetCollection] = useState('gear');
  const [defaultTL, setDefaultTL] = useState(0);
  const [defaultCategory, setDefaultCategory] = useState('');
  
  const [parsedItems, setParsedItems] = useState([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionResults, setInjectionResults] = useState(null);

  const collectionOptions = Object.keys(categoryConfig).map(key => ({
    value: key,
    label: categoryConfig[key].label || key
  })).sort((a, b) => a.label.localeCompare(b.label));

  const sanitizeFilename = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleParse = () => {
    if (!rawText.trim()) return;
    
    const lines = rawText.split('\n');
    let items = [];
    let headers = [];
    let isParsingTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('|')) {
        const rowData = line.split('|').map(x => x.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (rowData.length > 0 && rowData[0].startsWith('---')) {
          continue;
        }

        if (!isParsingTable) {
          headers = rowData.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
          isParsingTable = true;
        } else {
          if (rowData.length < headers.length) continue; 
          
          let item = {
            id: sanitizeFilename(rowData[0]),
            name: rowData[0],
            category: defaultCategory || targetCollection,
            tl: parseInt(defaultTL) || 0
          };

          for (let j = 1; j < headers.length; j++) {
            const h = headers[j];
            const val = rowData[j].replace(/[#*]/g, '');
            
            if (h.includes('dmg') || h.includes('damage')) item.damage = val;
            else if (h.includes('range')) item.range = val;
            else if (h.includes('ammo') || h.includes('capacity')) item.ammo = val;
            else if (h.includes('cost')) item.cost = val;
            else if (h.includes('dc')) item.craft_dc = val;
            else if (h.includes('sp') || h.includes('health') || h.includes('durability')) item.durability = val;
            else if (h.includes('dr')) item.dr = val;
            else if (h.includes('special') || h.includes('effect')) item.special = val;
            else item[h] = val;
          }

          items.push(item);
        }
      } else {
        isParsingTable = false;
      }
    }
    
    setParsedItems(items);
    setInjectionResults(null);
  };

  const handleInject = async () => {
    if (!saveEntry || parsedItems.length === 0) return;
    
    setIsInjecting(true);
    let successCount = 0;
    let errors = [];

    for (const item of parsedItems) {
      try {
        await saveEntry(targetCollection, item);
        successCount++;
      } catch (err) {
        errors.push(`Failed to save ${item.name}: ${err.message}`);
      }
    }

    setInjectionResults({ successCount, errors });
    setIsInjecting(false);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wider">OMNICORTEX INGESTION ENGINE</h2>
          <p className="text-sm text-slate-400">Bulk parse and inject external markdown tables into the database.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl h-full flex flex-col">
            <div className="p-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <Code size={16} className="mr-2 text-amber-500" />
                Raw Source Data (Markdown)
              </h3>
            </div>
            <div className="p-4 pt-4 flex-1 flex flex-col space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Target Collection</label>
                  <select 
                    value={targetCollection}
                    onChange={(e) => setTargetCollection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                  >
                    {collectionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Default Sub-Category</label>
                  <input 
                    type="text" 
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    placeholder="e.g. HEAVY WEAPONS"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Default Tech Level (TL)</label>
                  <input 
                    type="number" 
                    min="0" max="5"
                    value={defaultTL}
                    onChange={(e) => setDefaultTL(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-[400px]">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="| Name | Dmg | Range | Special | Cost |"
                  className="w-full h-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                onClick={handleParse}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium tracking-wide flex items-center justify-center transition-colors"
              >
                <Play size={16} className="mr-2 text-amber-500" />
                Parse Data
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl h-full flex flex-col">
            <div className="p-4 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <Search size={16} className="mr-2 text-amber-500" />
                Parsed Objects Preview ({parsedItems.length})
              </h3>

              {parsedItems.length > 0 && (
                <button
                  onClick={handleInject}
                  disabled={isInjecting}
                  className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded text-sm font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  <Download size={14} className="mr-2" />
                  {isInjecting ? 'Injecting...' : 'Inject into Omnicortex'}
                </button>
              )}
            </div>
            <div className="p-4 pt-4 flex-1 overflow-y-auto max-h-[700px]">
              
              {injectionResults && (
                <div className={`p-4 rounded-lg mb-6 border ${injectionResults.errors.length > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                  <div className="flex items-center font-semibold mb-1">
                    {injectionResults.errors.length > 0 ? <AlertTriangle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                    Injection Complete
                  </div>
                  <div className="text-sm opacity-80">
                    Successfully injected {injectionResults.successCount} items.
                    {injectionResults.errors.length > 0 && (
                      <ul className="list-disc pl-5 mt-2">
                        {injectionResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {parsedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                  <Database size={48} className="mb-4" />
                  <p>Paste markdown tables and parse to preview objects.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {parsedItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                        <h3 className="font-bold text-amber-500">{item.name || 'Unnamed'}</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">ID: {item.id}</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                        {Object.entries(item).map(([key, val]) => {
                          if (key === 'id' || key === 'name') return null;
                          return (
                            <div key={key} className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500">{key}</span>
                              <span className="text-slate-300 truncate" title={val}>{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
