import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Database, Map, Sparkles, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import './Dashboard.css';

const modules = [
  {
    id: 'story',
    title: 'Story Module',
    description: 'Enter the gameplay environment and weave your narrative.',
    icon: <BookOpen size={32} />,
    path: '/foundry/story',
    color: 'var(--accent-primary)',
  },
  {
    id: 'elements',
    title: 'Element Editor',
    description: 'Design and manage your database of species, origins, and lore.',
    icon: <Database size={32} />,
    path: '/foundry/elements',
    color: 'var(--accent-green-dark)',
  },
  {
    id: 'map-maker',
    title: 'Map Maker',
    description: 'Craft dynamic maps for your scenarios and encounters.',
    icon: <Map size={32} />,
    path: '/foundry/map-maker',
    color: '#34EBF7',
  },
  {
    id: 'aime',
    title: 'AIME',
    description: 'Consult the Artificial Intellect Master Entity for creative generation.',
    icon: <Sparkles size={32} />,
    path: '/foundry/aime',
    color: 'var(--accent-cyan-dark)',
  }
];

const ActivityAccordion = ({ icon, title, items, color }) => {
  const [isOpen, setIsOpen] = useState(false);
  const latestItem = items[0];

  if (!latestItem) {
    return (
      <div className="activity-item opacity-50" style={{ borderLeft: '2px solid transparent' }}>
        <div className="activity-icon" style={{ color, borderColor: color }}>{icon}</div>
        <div className="activity-details">
          <span className="activity-title">No recent activity for {title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-accordion flex flex-col mb-2 last:mb-0">
      <div 
        className="activity-item cursor-pointer hover:bg-white/5 transition-colors m-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          borderLeft: `2px solid ${isOpen ? color : 'transparent'}`, 
          borderRadius: isOpen ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
          background: isOpen ? 'rgba(255,255,255,0.02)' : ''
        }}
      >
        <div className="activity-icon" style={{ color, borderColor: color }}>{icon}</div>
        <div className="activity-details flex-1 overflow-hidden">
          <span className="activity-title text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {title}: <span className="sci-fi-glow" style={{ color: color }}>"{latestItem.title}"</span>
          </span>
          <span className="activity-time text-xs opacity-70">
            {latestItem.date ? new Date(latestItem.date).toLocaleDateString() : 'Recently'}
          </span>
        </div>
        <div className="activity-toggle text-slate-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="activity-dropdown pl-[72px] pr-4 py-3 bg-black/20 border-t border-white/5 space-y-3" 
          style={{ 
            borderLeft: `2px solid ${color}`, 
            borderRadius: '0 0 var(--radius-md) var(--radius-md)' 
          }}
        >
          {items.length > 1 ? (
            items.slice(1, 8).map((item, idx) => (
              <div key={idx} className="text-sm text-slate-300 flex justify-between items-center group">
                <span className="truncate max-w-[190px] group-hover:text-cyan-300 transition-colors">{item.title}</span>
                <span className="text-xs opacity-50 ml-2 whitespace-nowrap">
                  {item.date ? new Date(item.date).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 italic py-1">
              No additional activity history
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { universeState, elementsCatalog, mapsCatalog } = useStory();

  // Helper to extract and format story scenarios
  const getStoryItems = () => {
    const extractScenarios = (nodes) => {
      let list = [];
      if (!nodes) return list;
      nodes.forEach(n => {
        list.push({ title: n.title || 'Untitled Scenario', date: n.updatedAt || universeState?.updatedAt });
        if (n.children && n.children.length > 0) {
          list = list.concat(extractScenarios(n.children));
        }
      });
      return list;
    };
    const scenarios = extractScenarios(universeState?.scenarios || []);
    return scenarios.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  };

  const getElementItems = () => {
    const elems = (elementsCatalog || []).map(e => ({ title: e.title || e.name || 'Untitled Element', date: e.updatedAt }));
    return elems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  };

  const getMapItems = () => {
    const maps = (mapsCatalog || []).map(m => ({ title: m.name || m.title || 'Untitled Map', date: m.updatedAt }));
    return maps.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  };

  const getAimeItems = () => {
    const cards = (universeState?.creativeState?.storyCards || []).map(c => ({ title: c.title || 'Idea Card', date: c.createdAt || universeState?.updatedAt }));
    return cards.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  };

  const storyItems = getStoryItems();
  const elementItems = getElementItems();
  const mapItems = getMapItems();
  const aimeItems = getAimeItems();

  return (
    <div className="dashboard-page animate-fade-in pt-2">
      <div className="dashboard-content">
        {/* Left/Main Column: Cards */}
        <div className="dashboard-modules-block">
          <div className="dashboard-grid">
            {modules.map((mod) => (
              <div 
                key={mod.id} 
                className="module-card glass-pane"
                onClick={() => navigate(mod.path)}
              >
                <div className="card-icon" style={{ color: mod.color, background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${mod.color}` }}>
                  {mod.icon}
                </div>
                <div className="card-content">
                  <h3>{mod.title}</h3>
                  <p>{mod.description}</p>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <aside className="dashboard-recent-block">
          <div className="section-header">
            <Activity size={20} className="sci-fi-glow" />
            <h2 className="sci-fi-glow" style={{ margin: 0 }}>Recent Activity</h2>
          </div>
          <div className="activity-list glass-pane p-2">
            <ActivityAccordion 
              icon={<BookOpen size={16} />} 
              title="Story" 
              items={storyItems} 
              color="var(--accent-primary)" 
            />
            <ActivityAccordion 
              icon={<Database size={16} />} 
              title="Element" 
              items={elementItems} 
              color="var(--accent-green-dark)" 
            />
            <ActivityAccordion 
              icon={<Map size={16} />} 
              title="Map" 
              items={mapItems} 
              color="#34EBF7" 
            />
            <ActivityAccordion 
              icon={<Sparkles size={16} />} 
              title="AIME" 
              items={aimeItems} 
              color="var(--accent-cyan-dark)" 
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
