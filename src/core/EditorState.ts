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
  ModeState
} from "../types";

export class EditorState {
  mode!: BrailleMode;
  activeDots: Set<DotNumber> = new Set();
  brailleContent = "";
  textContent = "";
  modeState!: ModeState;
  pendingIndicator: BrailleCode | null = null;

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

    // Check for pending indicator (second cell of sequence)
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

    // Check if this code starts a multi-cell sequence
    if (this.mode.getPrefixCodes().has(code)) {
      this.pendingIndicator = code;
      this.resetDots();
      return { braille, text: "", indicator: null, pending: true };
    }

    // Process as single code
    this._processSingleCode(code);
    this.resetDots();

    return { braille, text: this.textContent.slice(-1), indicator: null };
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
    return this.pendingIndicator !== null;
  }

  /** Get pending indicator code. */
  getPendingIndicator(): BrailleCode | null {
    return this.pendingIndicator;
  }

  /** Cancel pending indicator. */
  cancelPendingIndicator(): void {
    this.pendingIndicator = null;
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
