/**
 * @file ArtistHubModal.test.jsx
 * @description Vitest + React Testing Library suite for ADE ArtistHubModal.
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ArtistHubModal } from '../ArtistHubModal.jsx';

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: vi.fn(async () => `
<SUBJECT>Cybernetic Auluran ranger in smart-silk cloak</SUBJECT>
<NARRATIVE>Tracking a rogue drone through rain-slicked catwalks</NARRATIVE>
<SETTING_STYLE>Tangent Science Fantasy, Tech Level 3</SETTING_STYLE>
<CONTEXT>Elevated orbital hab-block walkways</CONTEXT>
<ATMOSPHERE>Low-key chiaroscuro with cyan holo-glare</ATMOSPHERE>
`)
}));

describe('ArtistHubModal — Style & Template Selectors', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders both Style options and all 6 canonical Templates, updating the compiled prompt live on selection', () => {
    render(
      <ArtistHubModal
        isOpen={true}
        onClose={vi.fn()}
        initialPrompt="Commander Vane (Persona) — Chrome optics"
        elementContext={{ type: 'Persona', title: 'Commander Vane' }}
      />
    );

    // Style options present
    const chromaRadio = screen.getByRole('radio', { name: /HIFI CHROMA/i });
    const sketchRadio = screen.getByRole('radio', { name: /HI-FI SKETCH/i });
    expect(chromaRadio.getAttribute('aria-checked')).toBe('true');
    expect(sketchRadio.getAttribute('aria-checked')).toBe('false');

    // All 6 template options present; Persona context auto-selects Character Concept
    const masterBtn = screen.getByRole('radio', { name: /Master/i });
    const closeupBtn = screen.getByRole('radio', { name: /Close-Up/i });
    const conceptBtn = screen.getByRole('radio', { name: /Character Concept/i });
    const archBtn = screen.getByRole('radio', { name: /Architectural/i });
    const vehicleBtn = screen.getByRole('radio', { name: /Vehicle/i });
    const interiorBtn = screen.getByRole('radio', { name: /Interior/i });

    expect(conceptBtn.getAttribute('aria-checked')).toBe('true');
    expect(masterBtn).toBeTruthy();
    expect(closeupBtn).toBeTruthy();
    expect(archBtn).toBeTruthy();
    expect(vehicleBtn).toBeTruthy();
    expect(interiorBtn).toBeTruthy();

    // Verify initial HIFI CHROMA + CHARACTER CONCEPT SHEET tokens appear
    expect(document.body.textContent).toContain('Painterly character turnaround sheet');
    expect(document.body.textContent).toContain('pure lineless rendering');

    // Switch style to HI-FI SKETCH -> live updates rendering & form tokens
    fireEvent.click(sketchRadio);
    expect(sketchRadio.getAttribute('aria-checked')).toBe('true');
    expect(document.body.textContent).toContain('micron pen illustration');
    expect(document.body.textContent).toContain('Character design sketchbook page');

    // Switch template to Vehicle -> live updates form tokens to industrial design sketch
    fireEvent.click(vehicleBtn);
    expect(vehicleBtn.getAttribute('aria-checked')).toBe('true');
    expect(document.body.textContent).toContain('Industrial design sketch, technical pen illustration');

    // Switch template to Master -> omits FORM block
    fireEvent.click(masterBtn);
    expect(masterBtn.getAttribute('aria-checked')).toBe('true');
    expect(document.body.textContent).not.toContain('FORM:\n');
  });

  it('passes structured style, template, and compiled modular prompt to onApplyAsset', () => {
    const onApplyAsset = vi.fn();
    const onClose = vi.fn();

    render(
      <ArtistHubModal
        isOpen={true}
        onClose={onClose}
        onApplyAsset={onApplyAsset}
        initialPrompt="Kestrel Frigate"
        initialStyle="hifi_sketch"
        initialTemplate="vehicle"
      />
    );

    const applyBtn = screen.getByRole('button', { name: /Apply to Element/i });
    fireEvent.click(applyBtn);

    expect(onApplyAsset).toHaveBeenCalledTimes(1);
    const payload = onApplyAsset.mock.calls[0][0];
    expect(payload.styleId).toBe('hifi_sketch');
    expect(payload.style).toBe('HI-FI SKETCH');
    expect(payload.templateId).toBe('vehicle');
    expect(payload.template).toBe('VEHICLE / MECH DESIGN');
    expect(payload.prompt).toContain('[CONTENT PROMPT]');
    expect(payload.prompt).toContain('[GUIDANCE PROMPT]');
    expect(payload.prompt).toContain('[RENDERING PROMPT]');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
