/**
 * BRAILLE MODE BASE CLASS
 * =======================
 * Abstract base class for all braille modes (UEB Grade 1, UEB Grade 2, Japanese Kana, etc.)
 *
 * Each mode must implement the required methods to provide:
 * - Character mapping (braille code ↔ text)
 * - Indicator handling
 * - State management
 * - Context-dependent resolution
 *
 * @author Hana
 * @license MIT
 */

import type {
  BrailleCode,
  DotNumber,
  EditorContext,
  Indicator,
  ModeInfo,
  ModeState,
  SequenceResolver,
  SequenceResult,
  SequenceState
} from "../types";

export interface BrailleModeConfig {
  name: string;
  id: string;
  description: string;
  language?: string;
}

export abstract class BrailleMode {
  readonly name: string;
  readonly id: string;
  readonly description: string;
  readonly language: string;

  /** Unicode offset for braille characters. */
  protected readonly BRAILLE_START = 0x2800;

  constructor(config: BrailleModeConfig) {
    this.name = config.name;
    this.id = config.id;
    this.description = config.description;
    this.language = config.language ?? "en";
  }

  // ==================== REQUIRED METHODS ====================

  /**
   * Convert a braille code to text character(s).
   */
  abstract codeToText(code: BrailleCode, context: EditorContext): string;

  /**
   * Get the alphabet mapping for this mode.
   */
  abstract getAlphabet(): Record<number, string>;

  // ==================== OPTIONAL OVERRIDES ====================

  /**
   * Get all indicators for this mode.
   */
  getIndicators(): Record<string, Indicator> {
    return {};
  }

  /**
   * Convert text to braille code.
   */
  textToCode(text: string): number | undefined {
    const alphabet = this.getAlphabet();
    for (const [code, char] of Object.entries(alphabet)) {
      if (char === text) return parseInt(code);
    }
    return undefined;
  }

  /**
   * Get the number mapping for this mode (if applicable).
   */
  getNumberMap(): Record<number, string> {
    return {};
  }

  /**
   * Get prefix codes that start multi-cell sequences.
   */
  getPrefixCodes(): Set<BrailleCode> {
    return new Set();
  }

  /**
   * Resolve a multi-cell sequence.
   * @deprecated Use resolveMultiCellSequence for 3+ cell support
   */
  resolveSequence(
    _prefixCode: BrailleCode,
    _baseCode: BrailleCode,
    _context: EditorContext
  ): SequenceResult | null {
    return null;
  }

  // ==================== MULTI-CELL SEQUENCE HANDLING ====================

  /**
   * Get sequence resolvers for this mode.
   * Override to provide mode-specific resolvers.
   */
  getSequenceResolvers(): SequenceResolver[] {
    return [];
  }

  /**
   * Get the maximum sequence depth for this mode.
   * Default is 3 cells (e.g., capital passage ⠠⠠⠠).
   */
  getMaxSequenceDepth(): number {
    return 3;
  }

  /**
   * Check if a code can start a multi-cell sequence.
   */
  canStartSequence(code: BrailleCode): boolean {
    const resolvers = this.getSequenceResolvers();
    return resolvers.some(r => r.prefixCodes.has(code));
  }

  /**
   * Resolve a multi-cell sequence using registered resolvers.
   * @param codes Array of braille codes (first = prefix)
   * @param context Editor context
   * @returns SequenceResult if resolved, null if incomplete or invalid
   */
  resolveMultiCellSequence(
    codes: BrailleCode[],
    context: EditorContext
  ): SequenceResult | null {
    if (codes.length === 0) return null;

    const resolvers = this.getSequenceResolvers();
    
    for (const resolver of resolvers) {
      // Check if we have enough codes to attempt resolution
      if (codes.length < resolver.minCells) continue;
      if (codes.length > resolver.maxCells) continue;
      
      // Check if first code matches this resolver's prefixes
      if (!resolver.prefixCodes.has(codes[0])) continue;
      
      // Attempt resolution
      const result = resolver.resolve(codes, context);
      if (result) return result;
    }
    
    return null;
  }

  /**
   * Check if a partial sequence could become valid with more cells.
   * Used to determine whether to wait for more input or flush.
   */
  isPartialSequenceValid(codes: BrailleCode[]): boolean {
    if (codes.length === 0) return false;
    
    const resolvers = this.getSequenceResolvers();
    const maxDepth = this.getMaxSequenceDepth();
    
    // If we've reached max depth, no more waiting
    if (codes.length >= maxDepth) return false;
    
    for (const resolver of resolvers) {
      // Check if this resolver could accept more cells
      if (codes.length < resolver.maxCells && resolver.prefixCodes.has(codes[0])) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Create initial sequence state.
   */
  createInitialSequenceState(): SequenceState {
    return {
      pendingCodes: [],
      isActive: false,
      depth: 0
    };
  }

  /**
   * Check if this mode requires context for resolution.
   */
  requiresContext(): boolean {
    return false;
  }

  /**
   * Get context-dependent codes and their rules.
   */
  getContextDependent(): Record<number, unknown> {
    return {};
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Create initial mode-specific state.
   */
  createInitialState(): ModeState {
    return {
      numberMode: false,
      capitalMode: 0,
      pendingIndicator: null,
      typeformMode: null,
      typeformScope: null
    };
  }

  /**
   * Update state after processing a code.
   */
  updateState(state: ModeState, _code: BrailleCode, _text: string): ModeState {
    return { ...state };
  }

  /**
   * Reset state (e.g., when deleting characters).
   */
  resetState(_state: ModeState): ModeState {
    return this.createInitialState();
  }

  /**
   * Apply indicator effect to state (override in subclasses).
   */
  applyIndicator(state: ModeState, _indicatorName: string): ModeState {
    return { ...state };
  }

  // ==================== UTILITY METHODS ====================

  /** Convert a code to a Unicode braille character. */
  codeToBraille(code: BrailleCode): string {
    return String.fromCharCode(this.BRAILLE_START + code);
  }

  /** Convert a braille character to code. */
  brailleToCode(braille: string): BrailleCode {
    return braille.charCodeAt(0) - this.BRAILLE_START;
  }

  /** Convert a dot array to code. */
  dotsToCode(dots: Iterable<DotNumber | number>): BrailleCode {
    let code = 0;
    for (const d of dots) {
      code |= 1 << (d - 1);
    }
    return code;
  }

  /** Convert code to dot array. */
  codeToDots(code: BrailleCode): DotNumber[] {
    const dots: DotNumber[] = [];
    for (let i = 1; i <= 6; i++) {
      if (code & (1 << (i - 1))) dots.push(i as DotNumber);
    }
    return dots;
  }

  /** Display name for the mode. */
  toString(): string {
    return this.name;
  }

  /** Mode info for UI display. */
  getInfo(): ModeInfo {
    return {
      name: this.name,
      id: this.id,
      description: this.description,
      language: this.language
    };
  }

  // ==================== HELPER METHODS (overridable) ====================

  /** Check if code is a letter a-j (used in number mode). */
  isLetterAtoJ(_code: BrailleCode): boolean {
    return false;
  }

  /** Check if code is a letter. */
  isLetter(_code: BrailleCode): boolean {
    return false;
  }

  /** Recalculate number mode from braille content. */
  recalculateNumberMode(_brailleContent: string): boolean {
    return false;
  }
}
