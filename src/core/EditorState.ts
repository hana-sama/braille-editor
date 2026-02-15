/**
 * EDITOR STATE
 * ============
 * Mode-agnostic editor state management.
 *
 * This class manages the editor's state while delegating
 * mode-specific logic to the current BrailleMode instance.
 *
 * @author Hana
 * @license MIT
 */

import { BrailleMode } from "../modes/BrailleMode";
import type {
  BrailleCode,
  ConfirmResult,
  DotNumber,
  EditorContext,
  ModeState,
  SequenceState
} from "../types";

export class EditorState {
  mode!: BrailleMode;
  activeDots: Set<DotNumber> = new Set();
  brailleContent = "";
  textContent = "";
  modeState!: ModeState;
  
  /** @deprecated Use sequenceState instead for multi-cell support */
  pendingIndicator: BrailleCode | null = null;
  
  /** Multi-cell sequence state */
  sequenceState!: SequenceState;

  constructor(mode: BrailleMode) {
    this.setMode(mode);
  }

  /** Set the braille mode and reset state. */
  setMode(mode: BrailleMode): void {
    this.mode = mode;
    this.activeDots = new Set();
    this.brailleContent = "";
    this.textContent = "";
    this.modeState = mode ? mode.createInitialState() : ({} as ModeState);
    this.pendingIndicator = null;
    this.sequenceState = mode ? mode.createInitialSequenceState() : { pendingCodes: [], isActive: false, depth: 0 };
  }

  // ==================== DOT INPUT ====================

  /** Reset only the current dot input, keeping document content. */
  resetDots(): void {
    this.activeDots.clear();
  }

  /** Add a dot to the current input. */
  addDot(dot: DotNumber): void {
    this.activeDots.add(dot);
  }

  /** Remove a dot from the current input. */
  removeDot(dot: DotNumber): void {
    this.activeDots.delete(dot);
  }

  /** Check if a dot is active. */
  hasDot(dot: DotNumber): boolean {
    return this.activeDots.has(dot);
  }

  /** Get current dot pattern as sorted array. */
  getDotsArray(): DotNumber[] {
    return Array.from(this.activeDots).sort((a, b) => a - b);
  }

  /** Get current braille code from active dots. */
  getCurrentCode(): BrailleCode {
    return this.mode.dotsToCode(this.activeDots);
  }

  /** Get current braille character from active dots. */
  getCurrentBraille(): string {
    return this.mode.codeToBraille(this.getCurrentCode());
  }

  // ==================== CONTENT MANAGEMENT ====================

  /** Clear the entire document and all modes. */
  clearAll(): void {
    this.activeDots.clear();
    this.brailleContent = "";
    this.textContent = "";
    this.modeState = this.mode.createInitialState();
    this.pendingIndicator = null;
    this.sequenceState = this.mode.createInitialSequenceState();
  }

  /** Delete the last character and recalculate state. */
  deleteLastChar(): void {
    if (this.brailleContent.length === 0) return;

    this.brailleContent = this.brailleContent.slice(0, -1);
    this.textContent = this.textContent.slice(0, -1);

    this._recalculateState();
  }

  /** Add a newline. */
  addNewline(): void {
    this.brailleContent += "\n";
    this.textContent += "\n";
    this.modeState = this.mode.updateState(this.modeState, 0, " ");
  }

  // ==================== CHARACTER CONFIRMATION ====================

  /** Confirm the current dot pattern as a character. */
  confirmChar(): ConfirmResult {
    const code = this.getCurrentCode();
    const braille = this.mode.codeToBraille(code);
    let text = "";
    let indicator: ConfirmResult["indicator"] = null;

    const context: EditorContext = {
      precedingText: this.textContent,
      precedingBraille: this.brailleContent,
      state: this.modeState
    };

    // ========== MULTI-CELL SEQUENCE HANDLING ==========
    
    // If we're already collecting a sequence, add this code
    if (this.sequenceState.isActive) {
      this.sequenceState.pendingCodes.push(code);
      this.sequenceState.depth++;
      
      // Try to resolve the sequence
      const result = this.mode.resolveMultiCellSequence(
        this.sequenceState.pendingCodes,
        context
      );
      
      // Check if a longer sequence could still form
      const maxDepth = this.mode.getMaxSequenceDepth();
      const canContinue = this.mode.isPartialSequenceValid(this.sequenceState.pendingCodes);
      
      if (result) {
        // If we could still extend to a longer match, defer resolution
        if (canContinue && this.sequenceState.depth < maxDepth) {
          this.resetDots();
          return { braille, text: "", indicator: null, pending: true };
        }
        
        // Sequence resolved and cannot extend further — commit
        indicator = result;
        text = result.text;
        
        // Add all pending braille characters
        const brailleStr = this.sequenceState.pendingCodes
          .map(c => this.mode.codeToBraille(c))
          .join("");
        this.brailleContent += brailleStr;
        this.textContent += text;
        
        this.modeState = this.mode.applyIndicator(this.modeState, result.name);
        this._resetSequenceState();
        this.resetDots();
        
        return { braille, text, indicator };
      }
      
      if (!canContinue || this.sequenceState.depth >= maxDepth) {
        // Try to resolve the best (longest) sub-sequence
        const pending = [...this.sequenceState.pendingCodes];
        this._resetSequenceState();
        
        let resolved = false;
        // Try progressively shorter sub-sequences (longest first)
        for (let len = pending.length - 1; len >= 2; len--) {
          const subCodes = pending.slice(0, len);
          const subResult = this.mode.resolveMultiCellSequence(subCodes, context);
          if (subResult) {
            // Sub-sequence matched — commit it
            const brailleStr = subCodes.map(c => this.mode.codeToBraille(c)).join("");
            this.brailleContent += brailleStr;
            this.textContent += subResult.text;
            this.modeState = this.mode.applyIndicator(this.modeState, subResult.name);
            
            // Process remaining codes as single codes
            for (let i = len; i < pending.length; i++) {
              this._processSingleCode(pending[i]);
            }
            resolved = true;
            break;
          }
        }
        
        if (!resolved) {
          // No sub-sequence matched — process all as single codes
          for (const c of pending) {
            this._processSingleCode(c);
          }
        }
        
        this.resetDots();
        return { braille, text: this.textContent.slice(-1), indicator: null };
      }
      
      // Wait for more cells
      this.resetDots();
      return { braille, text: "", indicator: null, pending: true };
    }
    
    // ========== NEW SEQUENCE CHECK ==========
    
    // Check if this code can start a multi-cell sequence
    if (this.mode.canStartSequence(code)) {
      this.sequenceState.isActive = true;
      this.sequenceState.pendingCodes = [code];
      this.sequenceState.depth = 1;
      this.resetDots();
      return { braille, text: "", indicator: null, pending: true };
    }

    // ========== LEGACY 2-CELL SUPPORT (deprecated) ==========
    
    // Check for pending indicator (second cell of sequence) - legacy support
    if (this.pendingIndicator !== null) {
      const result = this.mode.resolveSequence(
        this.pendingIndicator,
        code,
        context
      );

      if (result) {
        indicator = result;
        text = result.text;

        this.brailleContent +=
          this.mode.codeToBraille(this.pendingIndicator) + braille;
        this.textContent += text;

        this.modeState = this.mode.applyIndicator(this.modeState, result.name);
        this.pendingIndicator = null;
        this.resetDots();

        return { braille, text, indicator };
      } else {
        this._processSingleCode(this.pendingIndicator);
        this.pendingIndicator = null;
      }
    }

    // Check if this code starts a multi-cell sequence (legacy)
    if (this.mode.getPrefixCodes && this.mode.getPrefixCodes().has(code)) {
      this.pendingIndicator = code;
      this.resetDots();
      return { braille, text: "", indicator: null, pending: true };
    }

    // Process as single code
    this._processSingleCode(code);
    this.resetDots();

    return { braille, text: this.textContent.slice(-1), indicator: null };
  }
  
  /** Reset the multi-cell sequence state. */
  private _resetSequenceState(): void {
    this.sequenceState = {
      pendingCodes: [],
      isActive: false,
      depth: 0
    };
  }
  

  /** Process a single braille code. */
  private _processSingleCode(code: BrailleCode): void {
    const braille = this.mode.codeToBraille(code);

    const context: EditorContext = {
      precedingText: this.textContent,
      precedingBraille: this.brailleContent,
      state: this.modeState
    };

    let text = this.mode.codeToText(code, context);

    // Handle special codes that don't produce visible text
    if (code === 0) {
      text = " ";
    }

    this.brailleContent += braille;
    this.textContent += text;

    this.modeState = this.mode.updateState(this.modeState, code, text);
  }

  /** Recalculate mode state from content. */
  private _recalculateState(): void {
    this.modeState = this.mode.createInitialState();

    if (this.mode.recalculateNumberMode) {
      this.modeState.numberMode = this.mode.recalculateNumberMode(
        this.brailleContent
      );
    }
  }

  // ==================== STATE QUERIES ====================

  /** Get current context for display/debugging. */
  getContext(): EditorContext {
    return {
      precedingText: this.textContent,
      precedingBraille: this.brailleContent,
      state: this.modeState
    };
  }

  /** Check if in number mode. */
  isInNumberMode(): boolean {
    return this.modeState.numberMode ?? false;
  }

  /** Get capital mode. */
  getCapitalMode(): number {
    return this.modeState.capitalMode ?? 0;
  }

  /** Cycle capital mode. */
  cycleCapitalMode(): void {
    if (this.modeState.capitalMode !== undefined) {
      this.modeState.capitalMode = (this.modeState.capitalMode + 1) % 3;
    }
  }

  /** Get typeform mode. */
  getTypeformMode(): { mode: string; scope: string } | null {
    if (this.modeState.typeformMode && this.modeState.typeformScope) {
      return {
        mode: this.modeState.typeformMode,
        scope: this.modeState.typeformScope
      };
    }
    return null;
  }

  /** Check if waiting for second cell of indicator. */
  isPendingIndicator(): boolean {
    return this.pendingIndicator !== null || this.sequenceState.isActive;
  }

  /** Get pending indicator code. */
  getPendingIndicator(): BrailleCode | null {
    // For multi-cell sequences, return the first pending code
    if (this.sequenceState.isActive && this.sequenceState.pendingCodes.length > 0) {
      return this.sequenceState.pendingCodes[0];
    }
    return this.pendingIndicator;
  }
  
  /** Get all pending codes in the current sequence. */
  getPendingCodes(): BrailleCode[] {
    return this.sequenceState.isActive ? [...this.sequenceState.pendingCodes] : [];
  }
  
  /** Get current sequence depth. */
  getSequenceDepth(): number {
    return this.sequenceState.depth;
  }

  /** Cancel pending indicator. */
  cancelPendingIndicator(): void {
    this.pendingIndicator = null;
    this._resetSequenceState();
  }

  // ==================== CONTENT QUERIES ====================

  /** Get braille content length. */
  get length(): number {
    return this.brailleContent.length;
  }

  /** Get text content length. */
  get textLength(): number {
    return this.textContent.length;
  }

  /** Check if content is empty. */
  isEmpty(): boolean {
    return this.brailleContent.length === 0;
  }

  /** Check if there are active dots. */
  hasActiveDots(): boolean {
    return this.activeDots.size > 0;
  }
}
