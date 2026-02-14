/**
 * UEB GRADE 2 CONTRACTION DATA
 * ============================
 * Unified English Braille Grade 2 contracted braille data.
 * 
 * Contains:
 * - Whole-word contractions
 * - Part-word (letter-group) contractions
 * - Lower contractions
 * - Strong contractions
 * 
 * @author Hana
 * @license MIT
 */

import type { BrailleCode } from "../../../types";

/** Contraction type for classification */
export type ContractionType = 
  | 'whole'      // Complete word contraction
  | 'part'       // Part-word contraction (can be in middle of word)
  | 'lower'      // Lower contraction (beginning of word)
  | 'initial'    // Initial-letter contraction
  | 'final';     // Final-letter contraction

/** Contraction entry */
export interface ContractionEntry {
  /** Braille codes representing this contraction */
  braille: BrailleCode[];
  /** Original text representation */
  text: string;
  /** Type of contraction */
  type: ContractionType;
  /** Position where contraction can appear */
  position?: 'start' | 'middle' | 'end' | 'standalone';
  /** Grade 1 indicator prefix if required */
  grade1Indicator?: boolean;
}

/** 
 * Whole-word contractions 
 * These replace entire words with single braille patterns
 */
export const WHOLE_WORD_CONTRACTIONS: Record<BrailleCode, ContractionEntry> = {
  // Strong contractions (most common)
  0x2f: { braille: [0x2f], text: "and", type: 'whole', position: 'standalone' },      // ⠯ dots 1246
  0x3f: { braille: [0x3f], text: "for", type: 'whole', position: 'standalone' },     // ⠿ dots 123456
  0x37: { braille: [0x37], text: "of", type: 'whole', position: 'standalone' },      // ⠷ dots 12356
  0x2e: { braille: [0x2e], text: "the", type: 'whole', position: 'standalone' },      // ⠮ dots 23456
  0x3e: { braille: [0x3e], text: "with", type: 'whole', position: 'standalone' },      // ⠾ dots 23456
  
  // Common whole-word contractions
  0x13: { braille: [0x13], text: "have", type: 'whole', position: 'standalone' },    // ⠓ dots 125
  0x06: { braille: [0x06], text: "be", type: 'whole', position: 'standalone' },      // ⠆ dots 23
  0x09: { braille: [0x09], text: "can", type: 'whole', position: 'standalone' },      // ⠉ dots 14
  0x0b: { braille: [0x0b], text: "from", type: 'whole', position: 'standalone' },     // ⠋ dots 124
  0x1d: { braille: [0x1d], text: "not", type: 'whole', position: 'standalone' },     // ⠝ dots 1345
  0x36: { braille: [0x36], text: "were", type: 'whole', position: 'standalone' },      // ⠶ dots 2356
  0x3a: { braille: [0x3a], text: "will", type: 'whole', position: 'standalone' },     // ⠺ dots 2456
  0x3d: { braille: [0x3d], text: "you", type: 'whole', position: 'standalone' },     // ⠽ dots 13456
  0x22: { braille: [0x22], text: "enough", type: 'whole', position: 'standalone' },  // ⠢ dots 26
  0x26: { braille: [0x26], text: "his", type: 'whole', position: 'standalone' },      // ⠦ dots 236
  0x14: { braille: [0x14], text: "in", type: 'whole', position: 'standalone' },       // ⠔ dots 35
  0x34: { braille: [0x34], text: "was", type: 'whole', position: 'standalone' },      // ⠴ dots 356
  0x21: { braille: [0x21], text: "child", type: 'whole', position: 'standalone' },    // ⠡ dots 16
  0x29: { braille: [0x29], text: "shall", type: 'whole', position: 'standalone' },    // ⠩ dots 146
  0x31: { braille: [0x31], text: "which", type: 'whole', position: 'standalone' },    // ⠱ dots 156
  0x33: { braille: [0x33], text: "out", type: 'whole', position: 'standalone' },     // ⠳ dots 1256
  0x0c: { braille: [0x0c], text: "still", type: 'whole', position: 'standalone' },    // ⠌ dots 34
};

/** 
 * Lower contractions 
 * These are used at the beginning of words or standing alone
 * Maps from braille code to contraction entry
 */
export const LOWER_CONTRACTIONS: Record<BrailleCode, ContractionEntry> = {
  // be (⠆)
  0x06: { braille: [0x06], text: "be", type: 'lower', position: 'start' },
  // con (⠒)
  0x12: { braille: [0x12], text: "con", type: 'lower', position: 'start' },
  // dis (⠲)
  0x32: { braille: [0x32], text: "dis", type: 'lower', position: 'start' },
  // enough/en (⠢)
  0x22: { braille: [0x22], text: "en", type: 'lower', position: 'start' },
  // in (⠔)
  0x14: { braille: [0x14], text: "in", type: 'lower', position: 'start' },
};

/**
 * Strong contractions
 * These are high-frequency words that get contracted
 */
export const STRONG_CONTRACTIONS: Record<BrailleCode, ContractionEntry> = {
  // and (⠯) - already in whole-word
  // for (⠿) - already in whole-word  
  // of (⠷) - already in whole-word
  // the (⠮) - already in whole-word
  // with (⠾) - already in whole-word
};

/**
 * Part-word contractions (letter-group contractions)
 * These replace letter combinations within words
 * Key is the braille pattern
 */
export const PART_WORD_CONTRACTIONS: Record<string, ContractionEntry> = {
  // ch (⠡)
  "ch": { braille: [0x21], text: "ch", type: 'part', position: 'middle' },
  // gh (⠣)
  "gh": { braille: [0x23], text: "gh", type: 'part', position: 'middle' },
  // sh (⠩)
  "sh": { braille: [0x29], text: "sh", type: 'part', position: 'middle' },
  // th (⠹)
  "th": { braille: [0x39], text: "th", type: 'part', position: 'middle' },
  // wh (⠱)
  "wh": { braille: [0x31], text: "wh", type: 'part', position: 'middle' },
  // ed (⠫)
  "ed": { braille: [0x2b], text: "ed", type: 'part', position: 'middle' },
  // er (⠻)
  "er": { braille: [0x3b], text: "er", type: 'part', position: 'middle' },
  // ou (⠳)
  "ou": { braille: [0x33], text: "ou", type: 'part', position: 'middle' },
  // ow (⠪)
  "ow": { braille: [0x2a], text: "ow", type: 'part', position: 'middle' },
  // st (⠌)
  "st": { braille: [0x0c], text: "st", type: 'part', position: 'middle' },
  // ing (⠬)
  "ing": { braille: [0x2c], text: "ing", type: 'part', position: 'end' },
};

/**
 * Initial-letter contractions
 * These use dot 5 prefix for words starting with specific letters
 */
export const INITIAL_LETTER_CONTRACTIONS: Record<string, ContractionEntry> = {
  // day (⠐⠙) - dots 5, 145
  "day": { braille: [0x10, 0x19], text: "day", type: 'initial', position: 'start', grade1Indicator: true },
  // know (⠐⠅) - dots 5, 13
  "know": { braille: [0x10, 0x05], text: "know", type: 'initial', position: 'start', grade1Indicator: true },
  // name (⠐⠝) - dots 5, 1345
  "name": { braille: [0x10, 0x1d], text: "name", type: 'initial', position: 'start', grade1Indicator: true },
  // part (⠐⠏) - dots 5, 1234
  "part": { braille: [0x10, 0x0f], text: "part", type: 'initial', position: 'start', grade1Indicator: true },
  // time (⠐⠞) - dots 5, 2345
  "time": { braille: [0x10, 0x1e], text: "time", type: 'initial', position: 'start', grade1Indicator: true },
  // father (⠐⠋) - dots 5, 124
  "father": { braille: [0x10, 0x0b], text: "father", type: 'initial', position: 'start', grade1Indicator: true },
  // mother (⠐⠍) - dots 5, 134
  "mother": { braille: [0x10, 0x0d], text: "mother", type: 'initial', position: 'start', grade1Indicator: true },
  // lord (⠐⠇) - dots 5, 123
  "lord": { braille: [0x10, 0x07], text: "lord", type: 'initial', position: 'start', grade1Indicator: true },
  // one (⠐⠕) - dots 5, 135
  "one": { braille: [0x10, 0x15], text: "one", type: 'initial', position: 'start', grade1Indicator: true },
  // under (⠐⠥) - dots 5, 136
  "under": { braille: [0x10, 0x25], text: "under", type: 'initial', position: 'start', grade1Indicator: true },
};

/**
 * Final-letter contractions
 * These use dots 4-6 prefix for word endings
 */
export const FINAL_LETTER_CONTRACTIONS: Record<string, ContractionEntry> = {
  // -ance (⠨⠑) - dots 46, 15
  "-ance": { braille: [0x28, 0x11], text: "ance", type: 'final', position: 'end', grade1Indicator: true },
  // -ence (⠰⠑) - dots 56, 15
  "-ence": { braille: [0x30, 0x11], text: "ence", type: 'final', position: 'end', grade1Indicator: true },
  // -ful (⠰⠇) - dots 56, 123
  "-ful": { braille: [0x30, 0x07], text: "ful", type: 'final', position: 'end', grade1Indicator: true },
  // -ness (⠰⠎) - dots 56, 234
  "-ness": { braille: [0x30, 0x0e], text: "ness", type: 'final', position: 'end', grade1Indicator: true },
  // -ity (⠰⠽) - dots 56, 13456
  "-ity": { braille: [0x30, 0x3d], text: "ity", type: 'final', position: 'end', grade1Indicator: true },
  // -ment (⠰⠞) - dots 56, 2345
  "-ment": { braille: [0x30, 0x1e], text: "ment", type: 'final', position: 'end', grade1Indicator: true },
  // -tion (⠰⠝) - dots 56, 1345
  "-tion": { braille: [0x30, 0x1d], text: "tion", type: 'final', position: 'end', grade1Indicator: true },
  // -sion (⠨⠝) - dots 46, 1345
  "-sion": { braille: [0x28, 0x1d], text: "sion", type: 'final', position: 'end', grade1Indicator: true },
};

/**
 * Grade 1 indicator sign (⠐)
 * Used to indicate a contraction should be read as individual letters
 */
export const GRADE_1_INDICATOR: BrailleCode = 0x10; // dots 5

/**
 * Create a lookup map for contractions by their braille codes
 * This enables fast O(1) lookup during conversion
 */
export function createContractionLookup(): Map<string, ContractionEntry> {
  const lookup = new Map<string, ContractionEntry>();
  
  // Add whole-word contractions
  for (const [code, entry] of Object.entries(WHOLE_WORD_CONTRACTIONS)) {
    lookup.set(code, entry);
  }
  
  // Add lower contractions
  for (const [code, entry] of Object.entries(LOWER_CONTRACTIONS)) {
    lookup.set(code, entry);
  }
  
  return lookup;
}

/**
 * Check if a braille code sequence represents a contraction
 */
export function findContraction(codes: BrailleCode[]): ContractionEntry | null {
  if (codes.length === 0) return null;
  
  // Try single code lookup first (most common)
  if (codes.length === 1) {
    const single = WHOLE_WORD_CONTRACTIONS[codes[0]];
    if (single) return single;
    
    const lower = LOWER_CONTRACTIONS[codes[0]];
    if (lower) return lower;
  }
  
  // Try multi-cell lookup
  const key = codes.map(c => c.toString(16)).join(',');
  const multi = PART_WORD_CONTRACTIONS[key];
  if (multi) return multi;
  
  return null;
}

/**
 * Check if text at position could start a contraction
 */
export function couldStartContraction(text: string, position: number): boolean {
  const substr = text.substring(position).toLowerCase();
  
  // Check initial contractions
  for (const key of Object.keys(INITIAL_LETTER_CONTRACTIONS)) {
    if (substr.startsWith(key)) return true;
  }
  
  return false;
}

/**
 * Check if text at position could end with a contraction
 */
export function couldEndWithContraction(text: string, position: number): boolean {
  // Check final contractions
  for (const key of Object.keys(FINAL_LETTER_CONTRACTIONS)) {
    const ending = text.substring(position - key.length, position).toLowerCase();
    if (ending === key) return true;
  }
  
  return false;
}
