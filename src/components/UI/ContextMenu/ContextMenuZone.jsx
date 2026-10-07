import React from 'react';

/**
 * Declarative wrapper that injects data-context attributes onto a container
 * for seamless context menu detection without requiring manual event binding.
 */
export const ContextMenuZone = ({
  children,
  zone,          // 'folio' | 'cortex' | 'ade' | 'stage' | 'compendium' | 'comms'
  category,      // 'identity' | 'stats' | 'skills' | 'combat' | 'species' | 'story-beat' etc.
  entityId,
  entityType,
  entityTitle,
  entityData,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const dataAttributes = {};
  if (zone) dataAttributes['data-context-zone'] = zone;
  if (category) dataAttributes['data-context-category'] = category;
  if (entityId) dataAttributes['data-context-entity-id'] = entityId;
  if (entityType) dataAttributes['data-context-entity-type'] = entityType;
  if (entityTitle) dataAttributes['data-context-entity-title'] = entityTitle;
  if (entityData) dataAttributes['data-context-entity-data'] = JSON.stringify(entityData);

  return (
    <Component className={className} {...dataAttributes} {...props}>
      {children}
    </Component>
  );
};

export default ContextMenuZone;
