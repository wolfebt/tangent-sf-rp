import { useState, useEffect, useMemo, useCallback } from 'react';
import * as econEngine from '../../../engines/tangentEconEngine';
import * as techEngine from '../../../engines/tangentTechEngine';
import * as uduEngine from '../../../engines/tangentUDUEngine';
import * as itemEngines from '../../../engines/tangentItemEngines';
import * as complexEngines from '../../../engines/tangentComplexEngines';
import * as entityEngines from '../../../engines/tangentEntityEngines';
import * as planetaryEngine from '../../../engines/tangentPlanetaryEngine';

const ENGINES = {
  econ: econEngine,
  tech: techEngine,
  udu: uduEngine,
  items: itemEngines,
  complex: complexEngines,
  entities: entityEngines,
  planetary: planetaryEngine
};

/**
 * Custom React hook that manages reactive formula calculations for Codex Matrix builders.
 * Recomputes live metrics whenever bound form fields change.
 * 
 * @param {object} matrixConfig - The active matrix configuration from codexConfig.js
 * @param {object} formData - Current form state from CodexMatrixBuilder
 * @returns {{ computedValues: object, isCalculating: boolean, recalculate: Function }}
 */
export function useComputedState(matrixConfig, formData) {
  const [computedValues, setComputedValues] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateOutputs = useCallback(() => {
    if (!matrixConfig || !formData) return {};

    const computed = {};
    const outputs = matrixConfig.computedOutputs || [];

    // First pass: extract standard DC for economic calculations if not explicitly set
    const effectiveDC = Number(
      formData.craft_dc ?? formData.design_dc ?? formData.dc ?? formData.tier_dc ?? 0
    ) || 0;

    outputs.forEach(output => {
      try {
        const engine = ENGINES[output.engine] || ENGINES.econ;
        if (!engine || typeof engine[output.fn] !== 'function') return;

        let inputVal;
        if (output.inputField) {
          if (output.inputField.startsWith('_')) {
            const refKey = output.inputField.slice(1);
            inputVal = computed[refKey];
          } else if (output.inputField === 'craft_dc' || output.inputField === 'design_dc' || output.inputField === 'dc') {
            inputVal = effectiveDC;
          } else {
            inputVal = formData[output.inputField];
          }
        } else if (Array.isArray(output.inputFields)) {
          inputVal = output.inputFields.map(f => {
            if (f.startsWith('_')) return computed[f.slice(1)];
            if (f === 'craft_dc' || f === 'design_dc' || f === 'dc') return effectiveDC;
            return formData[f];
          });
        } else {
          inputVal = effectiveDC;
        }

        if (Array.isArray(output.inputFields)) {
          computed[output.id] = engine[output.fn](...inputVal);
        } else {
          computed[output.id] = engine[output.fn](inputVal);
        }
      } catch (err) {
        console.warn(`[useComputedState] Error calculating output "${output.id}":`, err);
      }
    });

    // Also run full computeOnSave if defined, to capture any non-output computed values
    if (typeof matrixConfig.computeOnSave === 'function') {
      try {
        const fullComputed = matrixConfig.computeOnSave(formData, ENGINES);
        Object.assign(computed, fullComputed);
      } catch (err) {
        console.warn('[useComputedState] Error running computeOnSave:', err);
      }
    }

    return computed;
  }, [matrixConfig, formData]);

  useEffect(() => {
    setIsCalculating(true);
    const results = calculateOutputs();
    setComputedValues(results);
    setIsCalculating(false);
  }, [calculateOutputs]);

  return {
    computedValues,
    isCalculating,
    recalculate: () => {
      const results = calculateOutputs();
      setComputedValues(results);
    }
  };
}

export default useComputedState;
