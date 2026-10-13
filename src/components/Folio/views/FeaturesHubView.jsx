import React from 'react';
import FeaturesTab from '../tabs/FeaturesTab';

export const FeaturesHubView = ({ 
  onSelectSection,
  onOpenMetaphysicsModal,
  onOpenSelectorModal,
  onOpenAssetModal,
  ...props
}) => {
  return (
    <FeaturesTab
      {...props}
      activeSection="overview"
      onNavigate={onSelectSection}
      onOpenMetaphysicsModal={onOpenMetaphysicsModal}
      onOpenSelectorModal={onOpenSelectorModal}
      onOpenAssetModal={onOpenAssetModal}
    />
  );
};

export default React.memo(FeaturesHubView);
