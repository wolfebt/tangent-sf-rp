import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Map } from 'lucide-react';
import DashboardCatalogPanel from './DashboardCatalogPanel';
import './Dashboard.css';

const modules = [
  {
    id: 'story',
    title: 'Adventure Development Environment (ADE)',
    description: 'Craft fictional narratives from short stories to novel series, run granular interactive gated story beats, and compile tactical adventure modules.',
    icon: <BookOpen size={32} />,
    path: '/foundry/story',
    color: 'var(--accent-primary)',
  },
  {
    id: 'map-maker',
    title: 'Map Maker',
    description: 'Craft dynamic tactical maps, grid alignments, and terrain for your encounters.',
    icon: <Map size={32} />,
    path: '/foundry/map-maker',
    color: '#34EBF7',
  },
  {
    id: 'stage',
    title: 'THE STAGE VTT',
    description: 'Launch real-time WebGPU tactical encounter viewport with 5ft grid, LoS & combat arbitration.',
    icon: <Map size={32} />,
    path: '/stage',
    color: '#f59e0b',
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page animate-fade-in pt-2">
      <div className="dashboard-content">
        {/* Left/Main Column: Cards */}
        <div className="dashboard-modules-block">
          <div className="dashboard-grid">
            {modules.map((mod) => (
              <div 
                key={mod.id} 
                className={`module-card glass-pane ${mod.id === 'stage' ? 'module-card-vtt' : ''}`}
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

        {/* Right Column: Tabbed Catalog & Recent Activity */}
        <aside className="dashboard-recent-block">
          <DashboardCatalogPanel />
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
