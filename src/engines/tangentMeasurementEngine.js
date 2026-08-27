/**
 * Tangent Science Fantasy Roleplay — Measurement Conversion Engine
 * Automated Imperial / Metric Conversion for Character Height and Weight
 *
 * Requirements:
 * - Height: Feet & Inches (e.g. 5'11", 5 ft 11 in, 6', 70 in) <-> Meters (e.g. 1.80 m, 180 cm)
 *   Displays the other in brackets, e.g. "5'11\" [1.80 m]" or "1.85 m [6'1\"]"
 * - Weight: Pounds (e.g. 180 lbs, 180#) <-> Kilograms (e.g. 82 kg, 82 kilograms)
 *   Displays the other in brackets, e.g. "180 lbs [81.6 kg]" or "82 kg [180.8 lbs]"
 */

/**
 * Remove bracketed conversions (e.g. "[1.80 m]" or "[81.6 kg]") to obtain base user input.
 */
export function stripBracketedConversion(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\s*\[.*?\]\s*/g, ' ').trim();
}

/**
 * Extract the base measurement from an input string, even if the user deleted the unbracketed part.
 */
export function extractBaseMeasurement(str) {
  if (typeof str !== 'string') return '';
  const cleaned = str.replace(/\s*\[.*?\]\s*/g, ' ').trim();
  if (cleaned) return cleaned;
  // If user only left the bracketed part, extract inside brackets
  const match = str.match(/\[(.*?)\]/);
  return match ? match[1].trim() : '';
}

/**
 * Parse Height string into imperial or metric components
 * Returns: { type: 'imperial' | 'metric', feet, inches, meters, converted, originalClean } or null
 */
export function parseHeight(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = extractBaseMeasurement(inputStr);
  if (!clean) return null;

  // 1. Check for Feet & Inches patterns:
  // e.g. 5'11", 5' 11", 5'11, 5 ft 11 in, 5ft 11in, 5 feet 11 inches, 5' 11
  const ftInMatch = clean.match(/^(\d+)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inches)?$/i)
    || clean.match(/^(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*"?$/i)
    || clean.match(/^([3-8])\s+([0-9]|1[0-1])(?:\s*")?$/); // e.g. "5 11"

  if (ftInMatch) {
    const feet = parseInt(ftInMatch[1], 10);
    const inches = parseFloat(ftInMatch[2]);
    const totalInches = (feet * 12) + inches;
    const meters = (totalInches * 2.54) / 100;
    return {
      type: 'imperial',
      feet,
      inches,
      totalInches,
      meters,
      converted: `${meters.toFixed(2)} m`,
      originalClean: clean
    };
  }

  // 2. Check for Feet only:
  // e.g. 6', 6 ft, 6 feet, 6ft, 6.0 ft
  const ftOnlyMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)$/i);
  if (ftOnlyMatch) {
    const totalFeet = parseFloat(ftOnlyMatch[1]);
    const totalInches = totalFeet * 12;
    const meters = (totalInches * 2.54) / 100;
    const feet = Math.floor(totalFeet);
    const inches = Math.round((totalFeet - feet) * 12);
    return {
      type: 'imperial',
      feet,
      inches,
      totalInches,
      meters,
      converted: `${meters.toFixed(2)} m`,
      originalClean: clean
    };
  }

  // 3. Check for Inches only:
  // e.g. 71", 71 in, 71 inches, 71in
  const inOnlyMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:"|in|inches)$/i);
  if (inOnlyMatch) {
    const totalInches = parseFloat(inOnlyMatch[1]);
    const meters = (totalInches * 2.54) / 100;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return {
      type: 'imperial',
      feet,
      inches,
      totalInches,
      meters,
      converted: `${meters.toFixed(2)} m`,
      originalClean: clean
    };
  }

  // 4. Check for Metric - Meters:
  // e.g. 1.85m, 1.85 m, 1.85 meters, 1.85 metre
  const mMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)$/i);
  if (mMatch) {
    const meters = parseFloat(mMatch[1]);
    if (meters > 0) {
      const totalInches = meters * 39.37007874;
      let feet = Math.floor(totalInches / 12);
      let inches = Math.round(totalInches % 12);
      if (inches === 12) {
        feet += 1;
        inches = 0;
      }
      return {
        type: 'metric',
        meters,
        feet,
        inches,
        totalInches,
        converted: `${feet}'${inches}"`,
        originalClean: clean
      };
    }
  }

  // 5. Check for Metric - Centimeters:
  // e.g. 185cm, 185 cm, 185 centimeters
  const cmMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:cm|centimeter|centimeters|centimetre|centimetres)$/i);
  if (cmMatch) {
    const cm = parseFloat(cmMatch[1]);
    if (cm > 0) {
      const meters = cm / 100;
      const totalInches = cm / 2.54;
      let feet = Math.floor(totalInches / 12);
      let inches = Math.round(totalInches % 12);
      if (inches === 12) {
        feet += 1;
        inches = 0;
      }
      return {
        type: 'metric',
        meters,
        feet,
        inches,
        totalInches,
        converted: `${feet}'${inches}"`,
        originalClean: clean
      };
    }
  }

  // 6. Implicit Decimal Meters (e.g. 1.85 or 2.10)
  const implicitMeters = clean.match(/^([0-3]\.\d{1,3})$/);
  if (implicitMeters) {
    const meters = parseFloat(implicitMeters[1]);
    if (meters >= 0.5 && meters <= 3.5) {
      const totalInches = meters * 39.37007874;
      let feet = Math.floor(totalInches / 12);
      let inches = Math.round(totalInches % 12);
      if (inches === 12) {
        feet += 1;
        inches = 0;
      }
      return {
        type: 'metric',
        meters,
        feet,
        inches,
        totalInches,
        converted: `${feet}'${inches}"`,
        originalClean: clean
      };
    }
  }

  // 7. Implicit Centimeters (e.g. 175, 180, 195 - numbers between 90 and 300)
  const implicitCm = clean.match(/^([1-2]\d{2})$/);
  if (implicitCm) {
    const cm = parseFloat(implicitCm[1]);
    if (cm >= 90 && cm <= 300) {
      const meters = cm / 100;
      const totalInches = cm / 2.54;
      let feet = Math.floor(totalInches / 12);
      let inches = Math.round(totalInches % 12);
      if (inches === 12) {
        feet += 1;
        inches = 0;
      }
      return {
        type: 'metric',
        meters,
        feet,
        inches,
        totalInches,
        converted: `${feet}'${inches}"`,
        originalClean: clean
      };
    }
  }

  return null;
}

/**
 * Format height with converted figure in brackets.
 * e.g. "5'11\"" -> "5'11\" [1.80 m]"
 *      "1.85m"  -> "1.85m [6'1\"]"
 */
export function formatHeightWithConversion(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return inputStr;
  const base = extractBaseMeasurement(inputStr);
  if (!base) return '';

  const parsed = parseHeight(base);
  if (!parsed) return inputStr;

  return `${base} [${parsed.converted}]`;
}

/**
 * Get just the converted height figure (e.g. "1.80 m" or "5'11\"")
 */
export function getHeightConversion(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const base = extractBaseMeasurement(inputStr);
  if (!base) return null;
  const parsed = parseHeight(base);
  return parsed ? parsed.converted : null;
}

/**
 * Parse Weight string into imperial or metric components
 * Returns: { type: 'imperial' | 'metric', lbs, kg, converted, normalizedBase, originalClean } or null
 */
export function parseWeight(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = extractBaseMeasurement(inputStr);
  if (!clean) return null;

  // 1. Check for Kilograms:
  // e.g. 82 kg, 82kg, 82 kgs, 82 kilo, 82 kilos, 82 kilograms
  const kgMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|kilogram|kilograms)$/i);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (kg > 0) {
      const lbs = kg * 2.20462262;
      const roundedLbs = Math.round(lbs * 10) / 10;
      return {
        type: 'metric',
        kg,
        lbs,
        converted: `${roundedLbs} lbs`,
        normalizedBase: clean,
        originalClean: clean
      };
    }
  }

  // 2. Check for Pounds / lbs:
  // e.g. 180 lbs, 180 lb, 180#, 180 pounds, 180pound
  const lbsMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:lbs|lb|#|pound|pounds)$/i);
  if (lbsMatch) {
    const lbs = parseFloat(lbsMatch[1]);
    if (lbs > 0) {
      const kg = lbs * 0.45359237;
      const roundedKg = (Math.round(kg * 10) / 10).toFixed(1);
      return {
        type: 'imperial',
        lbs,
        kg,
        converted: `${roundedKg} kg`,
        normalizedBase: clean,
        originalClean: clean
      };
    }
  }

  // 3. Plain numeric input without unit:
  // e.g. 180, 200, 150, 75 (defaults to lbs in character sheet)
  const numMatch = clean.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (num > 0) {
      const lbs = num;
      const kg = lbs * 0.45359237;
      const roundedKg = (Math.round(kg * 10) / 10).toFixed(1);
      return {
        type: 'imperial',
        lbs,
        kg,
        converted: `${roundedKg} kg`,
        normalizedBase: `${num} lbs`,
        originalClean: clean
      };
    }
  }

  return null;
}

/**
 * Format weight with converted figure in brackets.
 * e.g. "180 lbs" -> "180 lbs [81.6 kg]"
 *      "82 kg"   -> "82 kg [180.8 lbs]"
 */
export function formatWeightWithConversion(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return inputStr;
  const base = extractBaseMeasurement(inputStr);
  if (!base) return '';

  const parsed = parseWeight(base);
  if (!parsed) return inputStr;

  const displayBase = parsed.normalizedBase || base;
  return `${displayBase} [${parsed.converted}]`;
}

/**
 * Get just the converted weight figure (e.g. "81.6 kg" or "180.8 lbs")
 */
export function getWeightConversion(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const base = extractBaseMeasurement(inputStr);
  if (!base) return null;
  const parsed = parseWeight(base);
  return parsed ? parsed.converted : null;
}
