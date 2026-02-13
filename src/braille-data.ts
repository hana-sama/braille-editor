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

import type {
  BrailleCode,
  CommonIndicators,
  ContextDependentEntry,
  Indicator,
  Layout,
  PunctuationRule,
  StorageKeys
} from "./types";

// ==================== UNICODE CONSTANTS ====================

export const BRAILLE_START: BrailleCode = 0x2800;

// ==================== COMMON INDICATORS ====================
// Centralised registry of all UEB indicator codes.
// Adding a new indicator? Put it here first, then reference it everywhere.

export const COMMON_INDICATORS: CommonIndicators = {
  NUMBER_SIGN: 0x3c, // ⠼ dots 3456 — starts number mode
  CAPITAL_SIGN: 0x20, // ⠠ dot 6     — next letter capitalised
  CONTINUOUS_CAPS: 0x30, // dots 56     — continuous capitalisation
  LETTER_SIGN: 0x10, // ⠐ dot 5     — ends number mode
  DECIMAL_POINT: 0x32 // ⠲ dots 256  — decimal point (in numbers)
};

// ==================== INDICATORS (STRUCTURED) ====================
// All UEB indicator sequences. Single-cell and multi-cell unified.

export const INDICATORS: Record<string, Indicator> = {
  // ── Number / Letter ──
  NUMBER: { codes: [0x3c], display: "⠼", type: "number", action: "start" },
  LETTER: { codes: [0x10], display: "⠐", type: "number", action: "end" },

  // ── Capitalisation ──
  CAPITAL_LETTER: {
    codes: [0x20],
    display: "⠠",
    type: "capital",
    action: "symbol"
  },
  CAPITAL_WORD: {
    codes: [0x20, 0x20],
    display: "⠠⠠",
    type: "capital",
    action: "word"
  },
  CAPITAL_PASSAGE: {
    codes: [0x20, 0x20, 0x20],
    display: "⠠⠠⠠",
    type: "capital",
    action: "passage"
  },
  CAPITAL_TERMINATOR: {
    codes: [0x20, 0x04],
    display: "⠠⠄",
    type: "capital",
    action: "end"
  },

  // ── Italic  (prefix: dots 46 = 0x28) ──
  ITALIC_SYMBOL: {
    codes: [0x28, 0x06],
    display: "⠨⠆",
    type: "italic",
    action: "symbol"
  },
  ITALIC_WORD: {
    codes: [0x28, 0x01],
    display: "⠨⠁",
    type: "italic",
    action: "word"
  },
  ITALIC_PASSAGE: {
    codes: [0x28, 0x36],
    display: "⠨⠶",
    type: "italic",
    action: "passage"
  },
  ITALIC_TERMINATOR: {
    codes: [0x28, 0x04],
    display: "⠨⠄",
    type: "italic",
    action: "end"
  },

  // ── Bold  (prefix: dots 45 = 0x18) ──
  BOLD_SYMBOL: {
    codes: [0x18, 0x06],
    display: "⠘⠆",
    type: "bold",
    action: "symbol"
  },
  BOLD_WORD: {
    codes: [0x18, 0x01],
    display: "⠘⠁",
    type: "bold",
    action: "word"
  },
  BOLD_PASSAGE: {
    codes: [0x18, 0x36],
    display: "⠘⠶",
    type: "bold",
    action: "passage"
  },
  BOLD_TERMINATOR: {
    codes: [0x18, 0x04],
    display: "⠘⠄",
    type: "bold",
    action: "end"
  },

  // ── Underline  (prefix: dots 456 = 0x38) ──
  UNDERLINE_SYMBOL: {
    codes: [0x38, 0x06],
    display: "⠸⠆",
    type: "underline",
    action: "symbol"
  },
  UNDERLINE_WORD: {
    codes: [0x38, 0x01],
    display: "⠸⠁",
    type: "underline",
    action: "word"
  },
  UNDERLINE_PASSAGE: {
    codes: [0x38, 0x36],
    display: "⠸⠶",
    type: "underline",
    action: "passage"
  },
  UNDERLINE_TERMINATOR: {
    codes: [0x38, 0x04],
    display: "⠸⠄",
    type: "underline",
    action: "end"
  },

  // ── Script  (prefix: dots 4 = 0x08) ──
  SCRIPT_SYMBOL: {
    codes: [0x08, 0x06],
    display: "⠈⠆",
    type: "script",
    action: "symbol"
  },
  SCRIPT_WORD: {
    codes: [0x08, 0x01],
    display: "⠈⠁",
    type: "script",
    action: "word"
  },
  SCRIPT_PASSAGE: {
    codes: [0x08, 0x36],
    display: "⠈⠶",
    type: "script",
    action: "passage"
  },
  SCRIPT_TERMINATOR: {
    codes: [0x08, 0x04],
    display: "⠈⠄",
    type: "script",
    action: "end"
  }
};

// ==================== INDICATOR LOOKUP TABLES ====================
// Derived from INDICATORS — do NOT edit manually.

/** Set of first-cell codes that can start a multi-cell indicator sequence. */
export const INDICATOR_PREFIXES: Set<BrailleCode> = new Set();

/** Map of "firstCode:secondCode" → indicator key name. */
export const INDICATOR_SEQUENCES: Record<string, string> = {};

(function buildIndicatorLookups(): void {
  for (const [name, ind] of Object.entries(INDICATORS)) {
    if (ind.codes.length >= 2) {
      INDICATOR_PREFIXES.add(ind.codes[0]);
      const key = ind.codes[0] + ":" + ind.codes[1];
      INDICATOR_SEQUENCES[key] = name;
    }
  }
})();

// ==================== PUNCTUATION RULES ====================

export const PUNCTUATION_RULES: Record<string, PunctuationRule> = {
  ".": { braille: 0x32, spaceBefore: false, spaceAfter: true },
  ",": { braille: 0x02, spaceBefore: false, spaceAfter: true },
  "?": { braille: 0x26, spaceBefore: false, spaceAfter: true },
  "!": { braille: 0x16, spaceBefore: false, spaceAfter: true },
  ":": { braille: 0x12, spaceBefore: false, spaceAfter: true },
  ";": { braille: 0x06, spaceBefore: false, spaceAfter: true },
  "'": { braille: 0x04, spaceBefore: false, spaceAfter: false },
  "-": { braille: 0x24, spaceBefore: false, spaceAfter: false },
  "/": { braille: 0x2e, spaceBefore: false, spaceAfter: false }
};

// ==================== DERIVED CONSTANTS ====================

export const NUMBER_SIGN_CODE: BrailleCode = COMMON_INDICATORS.NUMBER_SIGN;
export const CAPITAL_SIGN_CODE: BrailleCode = COMMON_INDICATORS.CAPITAL_SIGN;
export const CONTINUOUS_CAPS_CODE: BrailleCode =
  COMMON_INDICATORS.CONTINUOUS_CAPS;
export const LETTER_SIGN_CODE: BrailleCode = COMMON_INDICATORS.LETTER_SIGN;

// ==================== UEB GRADE 1 MAPPING ====================
// Braille dot-pattern code → print text character.
// Each code is a bitmask: bit 0 = dot 1, bit 1 = dot 2, … bit 5 = dot 6.

export const UEB_GRADE1: Record<number, string> = {
  // Letters a-z
  0x01: "a",
  0x03: "b",
  0x09: "c",
  0x19: "d",
  0x11: "e",
  0x0b: "f",
  0x1b: "g",
  0x13: "h",
  0x0a: "i",
  0x1a: "j",
  0x05: "k",
  0x07: "l",
  0x0d: "m",
  0x1d: "n",
  0x15: "o",
  0x0f: "p",
  0x1f: "q",
  0x17: "r",
  0x0e: "s",
  0x1e: "t",
  0x25: "u",
  0x27: "v",
  0x3a: "w",
  0x2d: "x",
  0x3d: "y",
  0x35: "z",

  // Punctuation & symbols (UEB standard)
  0x02: ",", // dots 2
  0x06: ";", // dots 23
  0x12: ":", // dots 25
  0x32: ".", // dots 256
  0x16: "!", // dots 235
  0x26: "?", // dots 236 (context-dependent: also opening quote)
  0x04: "'", // dots 3
  0x24: "-", // dots 36 (hyphen)
  0x2e: "/", // dots 346
  0x28: '"', // dots 46 — opening quotation
  0x1c: ")", // dots 345

  // Special sign indicators (displayed as their braille symbol)
  0x3c: "⠼", // Number sign (dots 3456)
  0x20: "⠠", // Capital sign (dot 6)
  0x10: "⠐" // Letter sign (dot 5) — ends number mode
};

// ==================== CONTEXT-DEPENDENT CODES ====================

export const CONTEXT_DEPENDENT: Record<number, ContextDependentEntry> = {
  0x26: {
    // dots 236
    default: "?",
    variants: { opening_quote: '"' },
    // 前がスペース・改行・文頭 → opening quote、それ以外 → ?
    rule: "space_or_start_before"
  }
};

// ==================== NUMBER MODE MAPPING ====================
// In number mode the letter patterns a-j map to digits 1-0.

export const NUMBER_MAP: Record<number, string> = {
  0x01: "1", // a → 1
  0x03: "2", // b → 2
  0x09: "3", // c → 3
  0x19: "4", // d → 4
  0x11: "5", // e → 5
  0x0b: "6", // f → 6
  0x1b: "7", // g → 7
  0x13: "8", // h → 8
  0x0a: "9", // i → 9
  0x1a: "0" // j → 0
};

// ==================== REVERSE MAPPINGS ====================

export const TEXT_TO_BRAILLE: Record<string, number> = {};
Object.entries(UEB_GRADE1).forEach(([code, text]) => {
  if (text.length === 1 && !"⠠⠼⠐".includes(text)) {
    TEXT_TO_BRAILLE[text] = parseInt(code);
  }
});

export const NUMBER_TO_BRAILLE: Record<string, number> = {};
Object.entries(NUMBER_MAP).forEach(([code, num]) => {
  NUMBER_TO_BRAILLE[num] = parseInt(code);
});

// ==================== KEYBOARD LAYOUTS ====================

export const LAYOUTS: Record<string, Layout> = {
  perkins: {
    name: "Perkins Style",
    description: "Standard QWERTY layout: F/D/S (left) and J/K/L (right)",
    leftHand: [
      { key: "f", dot: 1 },
      { key: "d", dot: 2 },
      { key: "s", dot: 3 }
    ],
    rightHand: [
      { key: "j", dot: 4 },
      { key: "k", dot: 5 },
      { key: "l", dot: 6 }
    ]
  },
  sixkey: {
    name: "Six Key",
    description: "BrailleMemo/Annie style: D/W/Q (left) and K/O/P (right)",
    leftHand: [
      { key: "d", dot: 1 },
      { key: "w", dot: 2 },
      { key: "q", dot: 3 }
    ],
    rightHand: [
      { key: "k", dot: 4 },
      { key: "o", dot: 5 },
      { key: "p", dot: 6 }
    ]
  },
  homekeys: {
    name: "Home Keys",
    description: "ASDF (left) and JKL; (right) - ergonomic position",
    leftHand: [
      { key: "a", dot: 1 },
      { key: "s", dot: 2 },
      { key: "d", dot: 3 }
    ],
    rightHand: [
      { key: "j", dot: 4 },
      { key: "k", dot: 5 },
      { key: "l", dot: 6 }
    ]
  },
  vimstyle: {
    name: "Vim Style",
    description: "F/D/S (left) and H/J/K (right) - familiar navigation keys",
    leftHand: [
      { key: "f", dot: 1 },
      { key: "d", dot: 2 },
      { key: "s", dot: 3 }
    ],
    rightHand: [
      { key: "h", dot: 4 },
      { key: "j", dot: 5 },
      { key: "k", dot: 6 }
    ]
  }
};

export const DEFAULT_LAYOUT = "perkins" as const;

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS: StorageKeys = {
  LAYOUT: "brailleEditorLayout"
};
