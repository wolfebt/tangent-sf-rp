import React from 'react';
import { AssetStudio } from '../../components/Codex/AssetStudio';

/**
 * CodexMatrixBuilder
 * Authoritative Studio page component for the Codex Suite, backed by the unified AssetStudio engine.
 */
export const CodexMatrixBuilder = ({
  matrix,
  initialData,
  onSaveComplete,
  onCancel,
  onOpenAiSynthesizer,
  onDelete
}) => {
  return (
    <AssetStudio
      matrix={matrix}
      initialData={initialData}
      isModal={false}
      isEditMode={true}
      onSaveComplete={onSaveComplete}
      onClose={onCancel}
      onDelete={onDelete}
      devMode={true}
      isAdmin={true}
    />
  );
};

export default React.memo(CodexMatrixBuilder);
