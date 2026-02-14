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
  // Contraction context
  atWordBoundary?: boolean;
  atWordStart?: boolean;
  standalone?: boolean;
}

// ==================== SEQUENCE RESOLUTION ====================

/**
 * Result of resolving a multi-cell braille sequence.
 */
export interface SequenceResult {
  name: string;
  text: string;
  type: string;
  action: string;
}

/**
 * Resolver for variable-length braille sequences.
 * Used for indicators that span 2+ cells (e.g., capital passage ⠠⠠⠠).
 */
export interface SequenceResolver {
  /** Minimum number of cells required to attempt resolution */
  minCells: number;
  /** Maximum number of cells this sequence can contain */
  maxCells: number;
  /** First cell codes that can start this sequence type */
  prefixCodes: Set<BrailleCode>;
  /**
   * Attempt to resolve a sequence of codes.
   * @param codes The braille codes in sequence (first = prefix)
   * @param context Editor context for context-dependent resolution
   * @returns SequenceResult if resolved, null if not a valid sequence
   */
  resolve: (codes: BrailleCode[], context: EditorContext) => SequenceResult | null;
}

/**
 * State for tracking multi-cell sequence input.
 */
export interface SequenceState {
  /** Codes accumulated so far in the current sequence */
  pendingCodes: BrailleCode[];
  /** Whether we're actively collecting a sequence */
  isActive: boolean;
  /** Maximum depth reached so far */
  depth: number;
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
  categoryId?: string;
}

export interface ModeCategory {
  id: string;
  name: string;
  description?: string;
  modes: ModeInfo[];
}

export interface ModeChangeEvent {
  type: "modeChange";
  previousMode: ModeInfo | null;
  currentMode: ModeInfo;
}

export type ModeChangeListener = (event: ModeChangeEvent) => void;

// ==================== MODE TRANSITION ====================

export interface ModeTransition {
  from: string;
  to: string;
  preserveContent: boolean;
  stateMapping?: (oldState: ModeState) => ModeState;
}

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
