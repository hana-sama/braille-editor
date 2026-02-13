/**
 * SHARED TYPE DEFINITIONS
 * =======================
 * Core types used across all braille editor modules.
 *
 * @author Hana
 * @license MIT
 */

// ==================== BRAILLE PRIMITIVES ====================

/** 6-bit bitmask (0–63) representing a braille dot pattern. */
export type BrailleCode = number;

/** Physical dot position on a braille cell. */
export type DotNumber = 1 | 2 | 3 | 4 | 5 | 6;

// ==================== INDICATOR TYPES ====================

export type IndicatorAction = "start" | "end" | "symbol" | "word" | "passage";

export interface Indicator {
  codes: BrailleCode[];
  display: string;
  type: string;
  action: IndicatorAction;
}

// ==================== PUNCTUATION ====================

export interface PunctuationRule {
  braille: BrailleCode;
  spaceBefore: boolean;
  spaceAfter: boolean;
}

// ==================== CONTEXT RESOLUTION ====================

export interface ContextDependentEntry {
  default: string;
  variants: Record<string, string>;
  rule: string;
}

// ==================== KEYBOARD / LAYOUT ====================

export interface KeyMapping {
  key: string;
  dot: DotNumber;
}

export interface Layout {
  name: string;
  description: string;
  leftHand: KeyMapping[];
  rightHand: KeyMapping[];
}

// ==================== MODE STATE ====================

export interface ModeState {
  numberMode: boolean;
  capitalMode: number; // 0: off, 1: next capital, 2: all caps
  pendingIndicator: BrailleCode | null;
  typeformMode: string | null; // 'italic' | 'bold' | 'underline' | 'script' | null
  typeformScope: string | null; // 'symbol' | 'word' | 'passage' | null
}

export interface EditorContext {
  precedingText?: string;
  precedingBraille?: string;
  state?: ModeState;
}

// ==================== SEQUENCE RESULT ====================

export interface SequenceResult {
  name: string;
  text: string;
  type: string;
  action: string;
}

// ==================== CONFIRM RESULT ====================

export interface ConfirmResult {
  braille: string;
  text: string;
  indicator: SequenceResult | null;
  pending?: boolean;
}

// ==================== MODE INFO / EVENTS ====================

export interface ModeInfo {
  name: string;
  id: string;
  description: string;
  language: string;
}

export interface ModeChangeEvent {
  type: "modeChange";
  previousMode: ModeInfo | null;
  currentMode: ModeInfo;
}

export type ModeChangeListener = (event: ModeChangeEvent) => void;

// ==================== STORAGE ====================

export interface StorageKeys {
  LAYOUT: string;
}

// ==================== COMMON INDICATORS ====================

export interface CommonIndicators {
  NUMBER_SIGN: BrailleCode;
  CAPITAL_SIGN: BrailleCode;
  CONTINUOUS_CAPS: BrailleCode;
  LETTER_SIGN: BrailleCode;
  DECIMAL_POINT: BrailleCode;
}
