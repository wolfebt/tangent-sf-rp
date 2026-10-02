/**
 * @file useModuleHealth.js
 * @description Hook to compute module health preflight telemetry based on universeState and elementsCatalog,
 * powered by the central ADE Engine Bridge.
 */

import { useMemo } from 'react';
import { validateUniverseRules } from '../../../../services/ade/adeEngineBridge';

export function useModuleHealth(universeState, elementsCatalog) {
  return useMemo(() => {
    const telemetry = validateUniverseRules(universeState, elementsCatalog);
    const score = telemetry.score;

    return {
      score,
      issues: telemetry.issues,
      warnings: telemetry.warnings,
      color: score >= 80 
        ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' 
        : score >= 50 
        ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' 
        : 'text-red-400 border-red-500/40 bg-red-950/40'
    };
  }, [universeState, elementsCatalog]);
}
