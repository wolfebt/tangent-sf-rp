/**
 * @file StageTokenLayer.tsx
 * @description Encapsulates Token context menus, radial action wheels, and target overlays on The Stage.
 */

import React from 'react';
import { TokenRadialMenu } from '../TokenRadialMenu';

export interface StageTokenLayerProps {
  radialMenuState: {
    isOpen: boolean;
    position: { x: number; y: number };
    token: any;
  };
  onCloseRadialMenu: () => void;
  targetToken: any;
  downedAllyNearby?: any;
  nearbyInteractiveObj?: any;
  isPointBlankTarget?: boolean;
  onSelectAction: (actionKey: string) => void;
}

export const StageTokenLayer: React.FC<StageTokenLayerProps> = ({
  radialMenuState,
  onCloseRadialMenu,
  targetToken,
  downedAllyNearby,
  nearbyInteractiveObj,
  isPointBlankTarget = false,
  onSelectAction
}) => {
  if (!radialMenuState.isOpen) return null;

  return (
    <TokenRadialMenu
      isOpen={radialMenuState.isOpen}
      onClose={onCloseRadialMenu}
      position={radialMenuState.position}
      token={radialMenuState.token}
      targetToken={targetToken}
      isAdjacentToMortalityAlly={Boolean(downedAllyNearby)}
      mortalityAllyName={downedAllyNearby?.name || 'Allied Operative'}
      isAdjacentToInteractiveObj={Boolean(nearbyInteractiveObj)}
      interactiveObjName={nearbyInteractiveObj?.name || 'Bulkhead / Terminal'}
      isPointBlankRange={isPointBlankTarget}
      onSelectAction={onSelectAction}
    />
  );
};

export default StageTokenLayer;
