import type { Container } from 'pixi.js';

/**
 * Removes all children from a PixiJS Container and destroys each child's GPU geometry/graphics
 * resources (without destroying shared cached textures).
 */
export function clearPixiContainer(container: Container | null | undefined): void {
  if (!container || (container as any).destroyed) return;
  const removed = container.removeChildren();
  for (let i = 0; i < removed.length; i++) {
    try {
      if (!(removed[i] as any).destroyed) {
        removed[i].destroy({ children: true });
      }
    } catch {
      // Ignore already-destroyed Pixi display objects
    }
  }
}
