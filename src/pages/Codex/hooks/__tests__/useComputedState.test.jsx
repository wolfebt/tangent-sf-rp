/**
 * @file useComputedState.test.jsx
 * @description Vitest + React Testing Library suite for Codex reactive formula engine hook (useComputedState).
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComputedState } from '../useComputedState.js';

describe('useComputedState Hook — Codex Reactive Formula Matrix Calculations', () => {
  it('computes live economic and UDU outputs and supports _chained output references', () => {
    const matrixConfig = {
      computedOutputs: [
        {
          id: 'baseCost',
          engine: 'econ',
          fn: 'calculateCreditValue',
          inputField: 'craft_dc'
        },
        {
          id: 'materialCost',
          engine: 'econ',
          fn: 'calculateMaterialCost',
          inputField: '_baseCost'
        },
        {
          id: 'slotCapacity',
          engine: 'udu',
          fn: 'getNodeCapacity',
          inputField: 'bodySlot'
        }
      ],
      computeOnSave: (formData) => ({
        summaryLabel: `${formData.name || 'Prototype'} [DC ${formData.craft_dc}]`
      })
    };

    const initialFormData = {
      name: 'Aegis Frame',
      craft_dc: 15,
      bodySlot: 'Torso'
    };

    const { result, rerender } = renderHook(
      ({ config, data }) => useComputedState(config, data),
      { initialProps: { config: matrixConfig, data: initialFormData } }
    );

    expect(result.current.isCalculating).toBe(false);
    expect(result.current.computedValues.baseCost).toBe(640); // 10 * 4^(15/5) = 640
    expect(result.current.computedValues.materialCost).toBe(320); // 50% of _baseCost
    expect(result.current.computedValues.slotCapacity).toBe(50); // Torso -> 50 nodes
    expect(result.current.computedValues.summaryLabel).toBe('Aegis Frame [DC 15]');

    // Rerender with higher DC and Head slot
    const updatedFormData = {
      name: 'Aegis Frame Mk II',
      craft_dc: 24,
      bodySlot: 'Head'
    };
    rerender({ config: matrixConfig, data: updatedFormData });

    expect(result.current.computedValues.slotCapacity).toBe(10); // Head -> 10 nodes
    expect(result.current.computedValues.summaryLabel).toBe('Aegis Frame Mk II [DC 24]');

    // Manual recalculate invocation
    act(() => {
      result.current.recalculate();
    });
    expect(result.current.computedValues.slotCapacity).toBe(10);
  });

  it('gracefully handles null/empty matrixConfig or formData without throwing', () => {
    const { result } = renderHook(() => useComputedState(null, null));
    expect(result.current.computedValues).toEqual({});
    expect(result.current.isCalculating).toBe(false);
  });
});
