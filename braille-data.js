// braille-data.js の冒頭
/**
 * BRAILLE DATA MODULE
 * ===================
 * All Braille lookup tables, layout configurations, and constants.
 * 
 * This module is designed to be:
 * - Audit-friendly: All mappings visible in one place
 * - Test-friendly: Pure data, no side effects
 * - Swap-friendly: Easy to add Grade 2, Japanese Braille, etc.
 * 
 * @author Hana
 * @license MIT
 */
// ==================== BRAILLE DATA MODULE ====================
// All Braille lookup tables, layout configurations, and constants
// live here so they can be audited, tested, and swapped independently.

// ==================== UNICODE CONSTANTS ====================

const BRAILLE_START = 0x2800;

// ==================== COMMON INDICATORS ====================
// Centralised registry of all UEB indicator codes.
// Adding a new indicator? Put it here first, then reference it everywhere.

const COMMON_INDICATORS = {
  NUMBER_SIGN:      0x3c,  // ⠼ dots 3456 — starts number mode
  CAPITAL_SIGN:     0x20,  // ⠠ dot 6     — next letter capitalised
  CONTINUOUS_CAPS:  0x30,  // dots 56     — continuous capitalisation
  LETTER_SIGN:      0x10,  // ⠐ dot 5     — ends number mode
  DECIMAL_POINT:    0x22,  // ⠲ dots 256  — decimal point (in numbers)
};

// ==================== DERIVED CONSTANTS ====================
// Convenience aliases used by braille.js — all point back to COMMON_INDICATORS.

const NUMBER_SIGN_CODE     = COMMON_INDICATORS.NUMBER_SIGN;
const CAPITAL_SIGN_CODE    = COMMON_INDICATORS.CAPITAL_SIGN;
const CONTINUOUS_CAPS_CODE = COMMON_INDICATORS.CONTINUOUS_CAPS;
const LETTER_SIGN_CODE     = COMMON_INDICATORS.LETTER_SIGN;

// ==================== UEB GRADE 1 MAPPING ====================
// Braille dot-pattern code → print text character.
// Each code is a bitmask: bit 0 = dot 1, bit 1 = dot 2, … bit 5 = dot 6.

const UEB_GRADE1 = {
  // Letters a-z
  0x01: 'a', 0x03: 'b', 0x09: 'c', 0x19: 'd', 0x11: 'e',
  0x0b: 'f', 0x1b: 'g', 0x13: 'h', 0x0a: 'i', 0x1a: 'j',
  0x05: 'k', 0x07: 'l', 0x0d: 'm', 0x1d: 'n', 0x15: 'o',
  0x0f: 'p', 0x1f: 'q', 0x17: 'r', 0x0e: 's', 0x1e: 't',
  0x25: 'u', 0x27: 'v', 0x3a: 'w', 0x2d: 'x', 0x3d: 'y',
  0x35: 'z',

  // Punctuation & symbols (UEB standard)
  0x02: ',',    // dots 2
  0x06: ';',    // dots 23
  0x12: ':',    // dots 25
  0x22: '.',    // dots 256
  0x16: '!',    // dots 235
  0x39: '?',    // dots 1456
  0x04: "'",    // dots 3
  0x26: '"',    // dots 236
  0x24: '-',    // dots 36 (hyphen)
  0x2e: '/',    // dots 346
  0x28: '"',    // dots 46 — opening quotation
  0x1c: ')',    // dots 345

  // Special sign indicators (displayed as their braille symbol)
  0x3c: '⠼',   // Number sign (dots 3456)
  0x20: '⠠',   // Capital sign (dot 6)
  0x10: '⠐',   // Letter sign (dot 5) — ends number mode

  // NOTE: 0x39 maps to '?' here.
  // TODO: 文脈判定実装後に opening/closing quotation も対応
};

// ==================== NUMBER MODE MAPPING ====================
// In number mode the letter patterns a-j map to digits 1-0.

const NUMBER_MAP = {
  0x01: '1',  // a → 1
  0x03: '2',  // b → 2
  0x09: '3',  // c → 3
  0x19: '4',  // d → 4
  0x11: '5',  // e → 5
  0x0b: '6',  // f → 6
  0x1b: '7',  // g → 7
  0x13: '8',  // h → 8
  0x0a: '9',  // i → 9
  0x1a: '0',  // j → 0
};

// ==================== REVERSE MAPPINGS ====================
// Built programmatically from the tables above.

const TEXT_TO_BRAILLE = {};
Object.entries(UEB_GRADE1).forEach(([code, text]) => {
  if (text.length === 1 && !'⠠⠼⠐'.includes(text)) {
    TEXT_TO_BRAILLE[text] = parseInt(code);
  }
});

const NUMBER_TO_BRAILLE = {};
Object.entries(NUMBER_MAP).forEach(([code, num]) => {
  NUMBER_TO_BRAILLE[num] = parseInt(code);
});

// ==================== KEYBOARD LAYOUTS ====================
// Each layout maps left-hand and right-hand keys to braille dots 1-6.

const LAYOUTS = {
  perkins: {
    name: 'Perkins Style',
    description: 'Standard QWERTY layout: F/D/S (left) and J/K/L (right)',
    leftHand: [
      { key: 'f', dot: 1 },
      { key: 'd', dot: 2 },
      { key: 's', dot: 3 },
    ],
    rightHand: [
      { key: 'j', dot: 4 },
      { key: 'k', dot: 5 },
      { key: 'l', dot: 6 },
    ],
  },
  sixkey: {
    name: 'Six Key',
    description: 'BrailleMemo/Annie style: D/W/Q (left) and K/O/P (right)',
    leftHand: [
      { key: 'd', dot: 1 },
      { key: 'w', dot: 2 },
      { key: 'q', dot: 3 },
    ],
    rightHand: [
      { key: 'k', dot: 4 },
      { key: 'o', dot: 5 },
      { key: 'p', dot: 6 },
    ],
  },
  homekeys: {
    name: 'Home Keys',
    description: 'ASDF (left) and JKL; (right) - ergonomic position',
    leftHand: [
      { key: 'a', dot: 1 },
      { key: 's', dot: 2 },
      { key: 'd', dot: 3 },
    ],
    rightHand: [
      { key: 'j', dot: 4 },
      { key: 'k', dot: 5 },
      { key: 'l', dot: 6 },
    ],
  },
  vimstyle: {
    name: 'Vim Style',
    description: 'F/D/S (left) and H/J/K (right) - familiar navigation keys',
    leftHand: [
      { key: 'f', dot: 1 },
      { key: 'd', dot: 2 },
      { key: 's', dot: 3 },
    ],
    rightHand: [
      { key: 'h', dot: 4 },
      { key: 'j', dot: 5 },
      { key: 'k', dot: 6 },
    ],
  },
};

const DEFAULT_LAYOUT = 'perkins';

// ==================== STORAGE KEYS ====================

const STORAGE_KEYS = {
  LAYOUT: 'brailleEditorLayout',
};

// ==================== EXPORTS ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRAILLE_START,
    COMMON_INDICATORS,
    NUMBER_SIGN_CODE,
    CAPITAL_SIGN_CODE,
    CONTINUOUS_CAPS_CODE,
    LETTER_SIGN_CODE,
    UEB_GRADE1,
    NUMBER_MAP,
    TEXT_TO_BRAILLE,
    NUMBER_TO_BRAILLE,
    LAYOUTS,
    DEFAULT_LAYOUT,
    STORAGE_KEYS,
  };
}