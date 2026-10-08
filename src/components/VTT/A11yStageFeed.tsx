/**
 * @file A11yStageFeed.tsx
 * @description Accessible Screen Reader Companion for the Tangent Tactical Stage & WebGL Viewport.
 * Provides off-screen ARIA live announcements (aria-live="polite") for tactical maneuvers,
 * token relocations, and bulkhead toggles, along with a navigable HTML summary of active operatives.
 */

import React, { useEffect, useState } from 'react';
import { useEngineStore, selectAllFusedTokens } from '../../engine';

export interface A11yStageFeedProps {
  mapName?: string;
}

export const A11yStageFeed: React.FC<A11yStageFeedProps> = ({ mapName = 'Tactical Sector' }) => {
  const tokens = useEngineStore(selectAllFusedTokens);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    // Listen for custom tactical engine events broadcasted by VTT / Three.js
    const handleTacticalEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail) return;

      const { type, detail } = customEvent;
      if (type === 'stage-token-moved') {
        setAnnouncement(`${detail.name || 'Operative'} repositioned to grid coordinates X ${detail.x}, Y ${detail.y}.`);
      } else if (type === 'stage-bulkhead-toggled') {
        setAnnouncement(`Bulkhead ${detail.objectId || 'door'} was ${detail.isOpen ? 'opened' : 'sealed'}.`);
      } else if (type === 'story-foundry-node-triggered') {
        setAnnouncement(`Interactive node triggered: ${detail.action || 'accessed'}.`);
      }
    };

    window.addEventListener('tangent-tactical-event', handleTacticalEvent);
    return () => {
      window.removeEventListener('tangent-tactical-event', handleTacticalEvent);
    };
  }, []);

  return (
    <div className="sr-only" tabIndex={-1} aria-label={`Tactical Accessibility Feed for ${mapName}`}>
      {/* Live announcement region for screen readers */}
      <div aria-live="polite" aria-atomic="true">
        {announcement && <p>{announcement}</p>}
      </div>

      {/* Accessible DOM structure describing active tokens on the stage */}
      <section aria-label="Active Stage Operatives">
        <h3>Current Tactical Operatives on {mapName} ({tokens.length} deployed)</h3>
        {tokens.length === 0 ? (
          <p>No operatives currently deployed on the tactical grid.</p>
        ) : (
          <table>
            <caption>List of deployed tokens and status</caption>
            <thead>
              <tr>
                <th scope="col">Operative</th>
                <th scope="col">Grid Position</th>
                <th scope="col">Elevation</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id}>
                  <th scope="row">{token.name || 'Unnamed Operative'}</th>
                  <td>X: {Math.round(token.x || 0)}, Y: {Math.round(token.y || 0)}</td>
                  <td>{token.elevation_ft || 0} ft</td>
                  <td>{token.current_hp <= 0 ? 'Incapacitated' : (token.active_conditions && token.active_conditions.length > 0 ? token.active_conditions.join(', ') : 'Active')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
