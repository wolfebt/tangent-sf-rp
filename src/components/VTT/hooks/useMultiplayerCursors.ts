import { useEffect, type RefObject } from 'react';
import { Container, Graphics } from 'pixi.js';

export interface UseMultiplayerCursorsOptions {
  containerRef: RefObject<Container | null>;
  isMultiplayerSimActive: boolean;
  isSimulationPaused: boolean;
}

export function useMultiplayerCursors({
  containerRef,
  isMultiplayerSimActive,
  isSimulationPaused
}: UseMultiplayerCursorsOptions) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.removeChildren();
    if (!isMultiplayerSimActive || isSimulationPaused) return;

    const peers = [
      { id: 'peer-vex', name: 'Operative Vex', color: 0x10b981, baseX: 450, baseY: 300 },
      { id: 'peer-null', name: 'Architect Null (GM)', color: 0xf59e0b, baseX: 600, baseY: 220 },
      { id: 'peer-echo', name: 'Spectator Echo', color: 0xec4899, baseX: 300, baseY: 420 }
    ];

    const graphicsList: { g: Graphics; peer: typeof peers[0]; offset: number }[] = [];

    peers.forEach((peer, idx) => {
      const g = new Graphics();
      container.addChild(g);
      graphicsList.push({ g, peer, offset: idx * 2.1 });
    });

    let frame = 0;
    const interval = setInterval(() => {
      frame += 0.05;
      graphicsList.forEach(({ g, peer, offset }) => {
        g.clear();
        const curX = peer.baseX + Math.sin(frame + offset) * 70;
        const curY = peer.baseY + Math.cos(frame * 0.7 + offset) * 45;

        g.poly([
          curX, curY,
          curX + 16, curY + 12,
          curX + 8, curY + 14,
          curX + 12, curY + 22,
          curX + 8, curY + 24,
          curX + 4, curY + 16,
          curX, curY + 18
        ]);
        g.fill({ color: peer.color, alpha: 0.9 });
        g.stroke({ width: 1.5, color: 0xffffff });

        g.roundRect(curX + 18, curY + 4, peer.name.length * 7 + 10, 16, 4);
        g.fill({ color: 0x0f172a, alpha: 0.85 });
        g.stroke({ width: 1, color: peer.color, alpha: 0.7 });
      });
    }, 1000 / 30);

    return () => {
      clearInterval(interval);
      container.removeChildren();
    };
  }, [containerRef, isMultiplayerSimActive, isSimulationPaused]);
}
