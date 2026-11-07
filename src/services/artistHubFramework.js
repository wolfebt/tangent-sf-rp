/**
 * @file artistHubFramework.js
 * @description Canonical Image Prompt Framework for ADE Artist Hub.
 * Aligns all visual concept synthesis with the official Tangent SF RP modular styles:
 *   - Styles: HIFI CHROMA (Lineless Painted Ink) & HI-FI SKETCH (Micron Pen Line Art)
 *   - Templates: Master, Close-Up, Character Concept, Architectural, Vehicle, Interior
 */

export const ARTIST_STYLE_OPTIONS = [
  {
    id: 'hifi_chroma',
    name: 'HIFI CHROMA',
    subtitle: 'Painted Ink & Painterly Realism',
    desc: 'Pure lineless rendering, dense pigment blocking, striking chiaroscuro, wet-on-dry ink washes, and crisp planar forms.',
    aiStyleGuidance:
      'Emphasize rich pigment contrast, planar light-and-shadow separation, vivid color washes, and dramatic chiaroscuro lighting suited for pure lineless painted ink.',
    renderingTokens:
      'Hyper-detailed painted ink, painterly realism, micro fine brush strokes, sharp edges, pure lineless rendering, volumetric form, rich ink medium, dense pigment blocking, striking chiaroscuro, wet-on-dry ink blending, crisp planar forms, vivid color washes, meticulous brushwork, cinematic composition, rule of thirds, dramatic low key lighting, intense rim lighting, sharp texture definition, intricate material layering, deep shadow recesses, mixed media digital painting.',
    negativeTokens:
      'outlines, border lines, contour lines, black lines, line art, line weight, hatching, cross-hatching, pen strokes, sketch, cartoon, anime, comic book coloring, 3d render, CGI, photorealism, raw photo, airbrushed, blurred, fuzzy, soft edges, flat colors, heavy block shading, smudged, messy, watermark, text.',
    formModifiers: {
      master: '',
      closeup:
        'Extreme macro painting details, highly visible micro fine brush strokes, sharp planar facial structure, stark lighting contrasts, crisp transitions between ink washes, rich pigment density in core shadows, detailed iris color blocking, sharp painted eye catchlight, intricate material textures rendered without lines.',
      character_concept:
        'Painterly character turnaround sheet, precise anatomical proportions, five distinct views: (full body front view:1.5), (full body back view:1.5), (full body profile side view:1.5), and a detailed (face close-up profile:1.8). The five images should be presented as a clean, highly detailed array on a single sheet, with a minimal flat background for clarity.',
      architectural:
        'Wide establishing environment painting, dynamic multi-point perspective, sharp architectural geometry, monumental scale, pure painted edges, crisp light and shadow separation, intricate painted masonry and facade details, pure ink wash skies, extreme depth achieved through atmospheric color blocking, hyper-detailed environmental realism.',
      vehicle:
        'Dynamic industrial design painting, hard-edged metallic reflections rendered purely with sharp brush strokes, extreme foreshortening, striking high-contrast surface rendering, dense black recesses, painted structural panels without contour lines, highly detailed functional realism, sharp glossy highlights, painted grime and wear.',
      interior:
        'Dramatic interior setting, complex spatial painting, sharp light shafts piercing shadows, crisp diegetic lighting, sharp edge occlusion, heavy cast shadows, rich ambient color blocking, expansive framing, hyper-detailed narrative clutter rendered entirely through painterly brushwork and form rather than line.'
    }
  },
  {
    id: 'hifi_sketch',
    name: 'HI-FI SKETCH',
    subtitle: 'Micron Pen & Technical Line Art',
    desc: 'Fine black ink contour lines, volumetric cross-hatching, stipple shading, clean negative space, and subtle selective color accents.',
    aiStyleGuidance:
      'Emphasize crisp structural draftsmanship, tactile surface linework, stark ink-on-paper contrast, clean negative space, and subtle selective marker/ink focal accents.',
    renderingTokens:
      'Hyper-detailed ink sketch, fine line art, micron pen illustration, masterwork drawing, precise contour lines, intricate cross-hatching, stipple shading, dynamic line weight, mostly monochrome, black ink on clean paper, subtle selective color accents, architectural precision, traditional media aesthetic, highly detailed draftsmanship, volumetric cross-hatching, expressive ink strokes, clean negative space, technical illustration qualities, crisp line execution.',
    negativeTokens:
      'photorealism, photography, raw photo, 3d render, CGI, oil painting, watercolor, lineless, soft shading, airbrushed, blurred, depth of field, out of focus, gradient mesh, flat colors, heavy block shading, smudged, messy lines, scratchy, poorly drawn contours, text, watermark, anime, comic book coloring, cinematic lighting.',
    formModifiers: {
      master: '',
      closeup:
        'Extreme macro ink details, highly visible pen strokes, intricate facial cross-hatching, dense stippling for core shadows, sharp ink contours, distinct fine-liner weights, detailed eye shading using only lines, subtle single-color marker accent on focal point.',
      character_concept:
        'Character design sketchbook page, precise anatomical draftsmanship, turnaround views: (front view ink sketch:1.5), (back view ink sketch:1.5), (side profile ink sketch:1.5), faint construction lines visible, clean white paper background, highly detailed costume line art, organized sketch array.',
      architectural:
        'Architectural ink rendering, traditional multi-point perspective drafting, precise vanishing points, technical drawing style, dense structural cross-hatching, faint wireframe accents, intricate masonry line art, monumental scale conveyed through line density, pure white background.',
      vehicle:
        'Industrial design sketch, technical pen illustration, dynamic perspective, wireframe construction lines, high-contrast mechanical hatching, metallic reflections rendered purely in ink lines, exploded view accents, subtle design marker accent colors (e.g., Copic marker splash).',
      interior:
        'Environmental perspective sketch, complex spatial line art, diegetic lighting rendered via varying hatching density, architectural interior drafting, detailed clutter rendered in pure line work, varying line thickness to simulate depth and atmospheric perspective.'
    }
  }
];

export const ARTIST_TEMPLATE_OPTIONS = [
  {
    id: 'master',
    label: 'Master',
    fullTitle: 'MASTER',
    desc: 'Standard character-in-environment scenes and narrative keyframes.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '16:9',
    aiFramingDirective:
      'Frame a standard character-in-environment scene or narrative keyframe with clear focal subject, grounded action, and cohesive environmental staging.'
  },
  {
    id: 'closeup',
    label: 'Close-Up',
    fullTitle: 'CLOSE-UP',
    desc: 'Macro portrait or detail shot emphasizing facial structure, eyes, and material micro-textures.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '1:1',
    aiFramingDirective:
      'Frame a tight macro close-up or portrait focusing on facial planes, eyes/optics, expression, collar/armor details, and tactile surface micro-textures.'
  },
  {
    id: 'character_concept',
    label: 'Character Concept',
    fullTitle: 'CHARACTER CONCEPT SHEET',
    desc: 'Multi-view full-body character turnaround sheet on a clean minimal background.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '3:4',
    aiFramingDirective:
      'Describe full-body character proportions, silhouette, layered attire, gear/weapon loadouts, and distinctive facial traits for a multi-view turnaround sheet on a clean minimal background.'
  },
  {
    id: 'architectural',
    label: 'Architectural',
    fullTitle: 'ARCHITECTURAL ESTABLISHING SHOT',
    desc: 'Wide multi-point perspective establishing vista for settlements, citadels, and megastructures.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '16:9',
    aiFramingDirective:
      'Focus on monumental exterior architecture, structural geometry, facade materials, scale indicators, and deep atmospheric perspective.'
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    fullTitle: 'VEHICLE / MECH DESIGN',
    desc: 'Dynamic industrial design showcase for starships, mechs, rovers, and heavy hardware.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '16:9',
    aiFramingDirective:
      'Focus on industrial hull geometry, structural panels, propulsion thrusters, weapon hardpoints, functional markings, and operational wear.'
  },
  {
    id: 'interior',
    label: 'Interior',
    fullTitle: 'INTERIOR SPACE',
    desc: 'Dramatic enclosed setting with complex spatial framing, light shafts, and lived-in clutter.',
    defaultAspectRatio: 'native',
    recommendedRatioHint: '16:9',
    aiFramingDirective:
      'Focus on interior spatial layout, architectural ribs/bulkheads, diegetic lighting and shadow occlusion, and rich narrative environmental clutter.'
  }
];

export const ASPECT_RATIOS = [
  { id: 'native', label: 'Template Native', promptPhrase: '' },
  { id: '16:9', label: '16:9 (Widescreen)', promptPhrase: '16:9 widescreen aspect ratio' },
  { id: '1:1', label: '1:1 (Square)', promptPhrase: '1:1 square aspect ratio' },
  { id: '3:4', label: '3:4 (Concept / Standee)', promptPhrase: '3:4 vertical portrait aspect ratio' },
  { id: '4:3', label: '4:3 (Standard)', promptPhrase: '4:3 standard aspect ratio' },
  { id: '9:16', label: '9:16 (Tall Portrait)', promptPhrase: '9:16 tall vertical aspect ratio' },
  { id: '21:9', label: '21:9 (Ultrawide)', promptPhrase: '21:9 ultrawide cinematic aspect ratio' }
];

/**
 * Resolves a style configuration by ID or name, defaulting to HIFI CHROMA.
 */
export function getArtistStyleById(styleIdOrName) {
  if (!styleIdOrName) return ARTIST_STYLE_OPTIONS[0];
  const normalized = String(styleIdOrName).trim().toLowerCase();
  return (
    ARTIST_STYLE_OPTIONS.find(
      (s) => s.id.toLowerCase() === normalized || s.name.toLowerCase() === normalized
    ) || ARTIST_STYLE_OPTIONS[0]
  );
}

/**
 * Resolves a template configuration by ID or label, defaulting to Master.
 */
export function getArtistTemplateById(templateIdOrLabel) {
  if (!templateIdOrLabel) return ARTIST_TEMPLATE_OPTIONS[0];
  const normalized = String(templateIdOrLabel)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  const aliases = {
    close_up: 'closeup',
    portrait: 'closeup',
    character: 'character_concept',
    character_concept_sheet: 'character_concept',
    concept: 'character_concept',
    archtectural: 'architectural',
    architecture: 'architectural',
    architectural_establishing_shot: 'architectural',
    vehicle_mech_design: 'vehicle',
    mech: 'vehicle',
    starship: 'vehicle',
    interior_space: 'interior'
  };

  const resolvedId = aliases[normalized] || normalized;
  return (
    ARTIST_TEMPLATE_OPTIONS.find(
      (t) =>
        t.id === resolvedId ||
        t.label.toLowerCase() === String(templateIdOrLabel).trim().toLowerCase() ||
        t.fullTitle.toLowerCase() === String(templateIdOrLabel).trim().toLowerCase()
    ) || ARTIST_TEMPLATE_OPTIONS[0]
  );
}

/**
 * Infers the best starting template ID from an ADE Element, type string, or text hint.
 */
export function inferTemplateFromContext(elementOrType = null, textHint = '') {
  const type =
    typeof elementOrType === 'string'
      ? elementOrType
      : elementOrType?.type || '';
  const fields =
    typeof elementOrType === 'object' && elementOrType !== null
      ? elementOrType.fields || {}
      : {};
  const title =
    typeof elementOrType === 'object' && elementOrType !== null
      ? elementOrType.title || elementOrType.name || ''
      : '';

  const corpus = [
    type,
    title,
    textHint,
    fields.category,
    fields.classification,
    fields.archetype,
    fields.oneLinePitch,
    fields.summary
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(starship|frigate|corvette|cruiser|dreadnought|shuttle|mech|mecha|walker|rover|skiff|vehicle|dropship|interceptor)\b/.test(corpus)) {
    return 'vehicle';
  }

  if (/\b(turnaround|concept sheet|character sheet)\b/.test(corpus)) {
    return 'character_concept';
  }

  if (/\b(portrait|headshot|close-up|closeup|macro|face)\b/.test(corpus)) {
    return 'closeup';
  }

  const normalizedType = String(type).trim().toLowerCase();

  if (normalizedType === 'persona' || normalizedType === 'species') {
    return 'character_concept';
  }

  if (normalizedType === 'world') {
    return 'architectural';
  }

  if (normalizedType === 'setting') {
    if (/\b(interior|corridor|bridge|deck|chamber|room|vault|bar|cantina|lab|bay|cockpit|bunker|tunnel|cabin)\b/.test(corpus)) {
      return 'interior';
    }
    return 'architectural';
  }

  if (normalizedType === 'scene') {
    if (/\b(interior|corridor|bridge|deck|chamber|room|vault|bar|cantina|lab|bay|bunker)\b/.test(corpus)) {
      return 'interior';
    }
    return 'master';
  }

  if (normalizedType === 'item' || normalizedType === 'technology') {
    return 'closeup';
  }

  if (/\b(interior|corridor|deckplan|room|chamber|hangar bay|laboratory)\b/.test(corpus)) {
    return 'interior';
  }

  if (/\b(citadel|skyline|arcology|megastructure|spires|outpost|colony|cathedral|spaceport|plaza)\b/.test(corpus)) {
    return 'architectural';
  }

  return 'master';
}

function stripHtml(text = '') {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically derives the 5 modular prompt slots from a seed prompt and/or ADE element context.
 * Ensures instant assembly and 100% offline reliability without LLM drift.
 */
export function buildDeterministicModularSections({
  seedPrompt = '',
  styleId = 'hifi_chroma',
  templateId = 'master',
  element = null
} = {}) {
  const style = getArtistStyleById(styleId);
  const template = getArtistTemplateById(templateId);
  const fields = element?.fields || {};
  const guidance = element?.guidance || {};
  const cleanSeed = stripHtml(seedPrompt);

  const title = element?.title || element?.name || '';
  const physical =
    fields.physicalDescription ||
    fields.geographyArchitecture ||
    fields.sensoryDetails ||
    fields.symbolsIconography ||
    '';
  const pitch =
    fields.oneLinePitch ||
    fields.corePremise ||
    fields.functionPurpose ||
    fields.summary ||
    '';
  const tl = fields['tech-level'] || fields.techLevel || '';
  const ml = fields['meta-level'] || fields.metaLevel || '';

  // 1. SUBJECT
  let subject = cleanSeed;
  if (!subject && title) {
    subject = physical ? `${title} — ${stripHtml(physical)}` : title;
  } else if (title && physical && !cleanSeed.toLowerCase().includes(stripHtml(physical).slice(0, 24).toLowerCase())) {
    subject = `${cleanSeed}. Physical details: ${stripHtml(physical)}`;
  }
  if (!subject) {
    subject = 'Focal Tangent Science Fantasy subject rendered with crisp material and structural fidelity.';
  }

  // 2. NARRATIVE
  let narrative = '';
  if (template.id === 'character_concept') {
    narrative = pitch
      ? `Neutral, poised character study showcasing functional gear, posture, and lived-in wear reflecting: ${stripHtml(pitch)}`
      : 'Poised orthographic turnaround stances displaying functional equipment loadouts, silhouette readability, and subtle operational wear.';
  } else if (template.id === 'closeup') {
    narrative = pitch
      ? `Intimate focal moment capturing micro-expression, lived-in surface wear, and character presence: ${stripHtml(pitch)}`
      : 'Focused close-range study highlighting expression, surface micro-wear, and tactile material craftsmanship.';
  } else if (template.id === 'vehicle') {
    narrative = pitch
      ? `Operational industrial showcase highlighting propulsion, structural articulation, and field wear: ${stripHtml(pitch)}`
      : 'Dynamic three-quarter industrial design presentation showing functional hardpoints, panel seams, and service weathering.';
  } else if (template.id === 'architectural') {
    narrative = pitch
      ? `Environmental storytelling conveying scale, civic/industrial function, and lived history: ${stripHtml(pitch)}`
      : 'Sweeping establishing view with subtle scale cues, transit activity, and weathered structural storytelling.';
  } else if (template.id === 'interior') {
    narrative = pitch
      ? `Lived-in spatial storytelling through workstations, conduits, and environmental traces: ${stripHtml(pitch)}`
      : 'Atmospheric interior staging with functional consoles, structural ribs, and lived-in narrative clutter.';
  } else {
    narrative = pitch
      ? stripHtml(pitch)
      : stripHtml(element?.content || '').slice(0, 200) ||
        'Grounded narrative moment capturing tension, functional technology, and lived-in environmental storytelling.';
  }

  // 3. SETTING STYLE
  const genreParts = [
    guidance.genre || guidance.Genre || 'Tangent Science Fantasy',
    tl ? `Tech Level ${String(tl).replace(/^TL-?/i, '')}` : 'Used-Future & High Sci-Fi',
    ml && Number(ml) > 0 ? `Meta Level ${ml} Aether/Psionic Accents` : null
  ].filter(Boolean);
  const settingStyle = genreParts.join(', ');

  // 4. CONTEXT
  let context = '';
  if (template.id === 'character_concept') {
    context =
      style.id === 'hifi_sketch'
        ? 'Clean, uncluttered white sketchbook paper background with subtle construction guidelines and organized turnaround spacing.'
        : 'Clean, minimal flat neutral studio background isolating each turnaround view with crisp silhouette separation.';
  } else if (fields.geographyArchitecture && template.id !== 'architectural') {
    context = stripHtml(fields.geographyArchitecture);
  } else if (template.id === 'architectural') {
    context =
      style.id === 'hifi_sketch'
        ? 'Monumental sci-fi masonry, alloy superstructures, and multi-point perspective vanishing lines against clean negative space.'
        : 'Layered sci-fi megastructure facades, weathered alloy and stone geometry, and deep atmospheric horizon planes.';
  } else if (template.id === 'vehicle') {
    context =
      style.id === 'hifi_sketch'
        ? 'Clean technical design presentation space with subtle perspective grid cues and exploded mechanical callout accents.'
        : 'Industrial hangar or atmospheric slipway framing emphasizing metallic hull silhouettes and scale.';
  } else if (template.id === 'interior') {
    context =
      'Enclosed sci-fi architectural interior with ribbed bulkheads, exposed conduits, recessed floor grates, and tactile equipment stations.';
  } else {
    context =
      'Grounded Tangent SFF environment with tactile composite alloys, weathered industrial surfaces, and cohesive worldbuilding detail.';
  }

  // 5. ATMOSPHERE
  const moodHint = [guidance.tone || guidance.Tone, guidance.mood || guidance.Mood]
    .filter(Boolean)
    .join(', ');
  let atmosphere = '';
  if (style.id === 'hifi_sketch') {
    atmosphere = moodHint
      ? `${moodHint}; crisp ink-on-paper contrast, directional hatching density for volume, and a restrained single-color focal accent.`
      : 'Crisp black ink contrast on clean paper, volumetric cross-hatching and stipple shadow gradients, with subtle selective color accents.';
  } else {
    atmosphere = moodHint
      ? `${moodHint}; dramatic low-key chiaroscuro, intense rim lighting, rich shadow recesses, and vivid painted ink washes.`
      : 'Dramatic chiaroscuro lighting, crisp rim-lit edges, deep pigment-rich shadow recesses, and vibrant atmospheric color blocking.';
  }

  const extraNegative = stripHtml(fields.negative_keywords || '');

  return {
    subject,
    narrative,
    settingStyle,
    context,
    atmosphere,
    extraNegative
  };
}

/**
 * Builds the meta-prompt sent to AIME to synthesize the [CONTENT PROMPT] and [GUIDANCE PROMPT]
 * slots while keeping the [RENDERING PROMPT] strictly governed by the canonical Style & Template engine.
 */
export function buildArtistHubAimeMetaPrompt({
  seedPrompt,
  styleId = 'hifi_chroma',
  templateId = 'master',
  aspectRatio = 'native',
  element = null
}) {
  const style = getArtistStyleById(styleId);
  const template = getArtistTemplateById(templateId);
  const ratioObj = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  const elementSummary = element
    ? [
        element.title ? `Element Title: "${element.title}" (${element.type || 'Element'})` : null,
        element.fields?.oneLinePitch ? `Pitch: ${element.fields.oneLinePitch}` : null,
        element.fields?.physicalDescription ? `Physical: ${element.fields.physicalDescription}` : null,
        element.fields?.sensoryDetails ? `Sensory: ${element.fields.sensoryDetails}` : null,
        element.fields?.geographyArchitecture ? `Architecture: ${element.fields.geographyArchitecture}` : null,
        element.fields?.['tech-level'] || element.fields?.techLevel
          ? `Tech Level: ${element.fields['tech-level'] || element.fields.techLevel}`
          : null,
        element.fields?.negative_keywords ? `Lore Negative Railguards: ${element.fields.negative_keywords}` : null
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return `You are the Lead Art Director for the Tangent Science Fantasy RPG universe.
Synthesize the modular CONTENT and GUIDANCE sections for an image prompt strictly aligned to the "${style.name}" visual framework and the "${template.fullTitle}" shot template.

Input Concept / Seed: "${String(seedPrompt || '').trim()}"
${elementSummary ? `\nCanonical Element Context:\n${elementSummary}\n` : ''}
Target Style Engine: ${style.name} (${style.subtitle})
Style Direction: ${style.aiStyleGuidance}
Target Template: ${template.fullTitle} — ${template.desc}
Template Framing Directive: ${template.aiFramingDirective}
${ratioObj.promptPhrase ? `Target Aspect Ratio: ${ratioObj.promptPhrase}` : ''}

IMPORTANT RULES:
1. Do NOT output camera brand names, photorealistic photography lenses, or 3D engine buzzwords (no "Unreal Engine", "Octane", "85mm RAW photo").
2. Keep descriptions vivid, concrete, and visual (1–3 concise sentences or comma-separated phrases per field).
3. Return ONLY the five tagged sections below using these exact XML-like tags:

<SUBJECT>
[Main physical subject, anatomy/silhouette, attire/hull/structure, and key focal details]
</SUBJECT>
<NARRATIVE>
[Action, pose, functional activity, or environmental storytelling elements]
</NARRATIVE>
<SETTING_STYLE>
[Specific Tangent sci-fi/science-fantasy aesthetic, tech level textures, and design language]
</SETTING_STYLE>
<CONTEXT>
[Surrounding environment, background treatment, materials, and spatial context appropriate for ${template.fullTitle}]
</CONTEXT>
<ATMOSPHERE>
[Mood, palette accents, and lighting conditions tailored to ${style.name}]
</ATMOSPHERE>`;
}

/**
 * Parses AIME's tagged output into structured modular sections, falling back deterministically
 * if AIME is running in offline local-cognition mode or omits tags.
 */
export function parseAimeModularResponse(rawResponse = '', fallbackParams = {}) {
  const fallback = buildDeterministicModularSections(fallbackParams);
  const text = String(rawResponse || '').trim();

  if (!text || text.includes('[AIME LOCAL COGNITION]') || text.includes('[DETERMINISTIC COGNITION]')) {
    return { sections: fallback, usedFallback: true };
  }

  const extractTag = (tagName, labelRegex) => {
    const xmlMatch = text.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    if (xmlMatch && xmlMatch[1]?.trim()) {
      return xmlMatch[1].trim();
    }
    if (labelRegex) {
      const lineMatch = text.match(labelRegex);
      if (lineMatch && lineMatch[1]?.trim()) {
        return lineMatch[1].trim();
      }
    }
    return '';
  };

  const subject = extractTag(
    'SUBJECT',
    /(?:\*\*|\[)?SUBJECT(?:\*\*|\])?:\s*([^\n]+(?:\n(?!(?:\*\*|\[)?(?:NARRATIVE|SETTING STYLE|CONTEXT|ATMOSPHERE|RENDERING))[^\n]+)*)/i
  );
  const narrative = extractTag(
    'NARRATIVE',
    /(?:\*\*|\[)?NARRATIVE(?:\*\*|\])?:\s*([^\n]+(?:\n(?!(?:\*\*|\[)?(?:SETTING STYLE|GUIDANCE|CONTEXT|ATMOSPHERE|RENDERING))[^\n]+)*)/i
  );
  const settingStyle = extractTag(
    'SETTING_STYLE',
    /(?:\*\*|\[)?SETTING[_\s]STYLE(?:\*\*|\])?:\s*([^\n]+(?:\n(?!(?:\*\*|\[)?(?:CONTEXT|ATMOSPHERE|RENDERING))[^\n]+)*)/i
  );
  const context = extractTag(
    'CONTEXT',
    /(?:\*\*|\[)?CONTEXT(?:\*\*|\])?:\s*([^\n]+(?:\n(?!(?:\*\*|\[)?(?:ATMOSPHERE|RENDERING))[^\n]+)*)/i
  );
  const atmosphere = extractTag(
    'ATMOSPHERE',
    /(?:\*\*|\[)?ATMOSPHERE(?:\*\*|\])?:\s*([^\n]+(?:\n(?!(?:\*\*|\[)?(?:RENDERING|FORM|NEGATIVE|<\/))[^\n]+)*)/i
  );

  const hasAnyParsed = Boolean(subject || narrative || settingStyle || context || atmosphere);
  if (!hasAnyParsed) {
    return { sections: fallback, usedFallback: true };
  }

  return {
    sections: {
      subject: subject || fallback.subject,
      narrative: narrative || fallback.narrative,
      settingStyle: settingStyle || fallback.settingStyle,
      context: context || fallback.context,
      atmosphere: atmosphere || fallback.atmosphere,
      extraNegative: fallback.extraNegative || ''
    },
    usedFallback: false
  };
}

/**
 * Compiles the final production-ready modular prompt strictly adhering to the selected
 * Style Engine (HIFI CHROMA or HI-FI SKETCH) and Template Form Modifier.
 */
export function compileModularArtistPrompt({
  styleId = 'hifi_chroma',
  templateId = 'master',
  aspectRatio = 'native',
  sections = {}
} = {}) {
  const style = getArtistStyleById(styleId);
  const template = getArtistTemplateById(templateId);
  const ratioObj = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  const subject = String(sections.subject || '').trim() || '[Insert main subject]';
  const narrative = String(sections.narrative || '').trim() || '[Insert action or story elements]';
  const settingStyle = String(sections.settingStyle || '').trim() || '[Insert overall style]';
  const context = String(sections.context || '').trim() || '[Insert environmental context]';
  const atmosphere = String(sections.atmosphere || '').trim() || '[Insert mood and lighting conditions]';
  const extraNegative = String(sections.extraNegative || '').trim();

  const templateFormTokens = style.formModifiers?.[template.id] || '';
  const formParts = [
    ratioObj.promptPhrase || '',
    templateFormTokens
  ].filter(Boolean);
  const compiledForm = formParts.join(', ');

  const compiledNegative = extraNegative
    ? `${style.negativeTokens.replace(/\.$/, '')}, ${extraNegative}`
    : style.negativeTokens;

  const lines = [
    '[CONTENT PROMPT]',
    `SUBJECT:\n${subject}`,
    '',
    `NARRATIVE:\n${narrative}`,
    '',
    '[GUIDANCE PROMPT]',
    `SETTING STYLE:\n${settingStyle}`,
    '',
    `CONTEXT:\n${context}`,
    '',
    `ATMOSPHERE:\n${atmosphere}`,
    '',
    '[RENDERING PROMPT]',
    `RENDERING TOKENS:\n${style.renderingTokens}`
  ];

  if (compiledForm) {
    lines.push('', `FORM:\n${compiledForm}`);
  }

  lines.push('', `NEGATIVE PROMPT TOKENS:\n${compiledNegative}`);

  return {
    fullPrompt: lines.join('\n'),
    renderingTokens: style.renderingTokens,
    formTokens: compiledForm,
    negativeTokens: compiledNegative,
    style,
    template
  };
}
