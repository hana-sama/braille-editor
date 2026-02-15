/**
 * KEYBOARD HANDLER
 * ================
 * Handles keydown/keyup events for braille dot input,
 * layout cycling, mode cycling, and editor actions.
 */

import { EditorState } from "../core/EditorState";
import { DisplayUpdater } from "../display/DisplayUpdater";
import { LayoutManager } from "../layout/LayoutManager";
import type { DotNumber } from "../types";

export interface KeyboardCallbacks {
  confirmChar: () => void;
  deleteLastChar: () => void;
  addNewline: () => void;
  resetDotsUI: () => void;
  cycleToNextMode: () => void;
  cycleToPreviousMode: () => void;
  cycleCapitalMode: () => void;
}

export class KeyboardHandler {
  private editorState: EditorState;
  private display: DisplayUpdater;
  private layout: LayoutManager;
  private callbacks: KeyboardCallbacks;

  constructor(
    editorState: EditorState,
    display: DisplayUpdater,
    layout: LayoutManager,
    callbacks: KeyboardCallbacks
  ) {
    this.editorState = editorState;
    this.display = display;
    this.layout = layout;
    this.callbacks = callbacks;
  }

  /** Set a new editor state (e.g., after mode change). */
  setEditorState(editorState: EditorState): void {
    this.editorState = editorState;
  }

  /** Initialize keyboard event listeners. */
  init(): void {
    const KEY_ACTIONS: Record<string, () => void> = {
      Space: () => this.callbacks.confirmChar(),
      Backspace: () =>
        this.editorState.hasActiveDots()
          ? this.callbacks.resetDotsUI()
          : this.callbacks.deleteLastChar(),
      Delete: () => this.callbacks.deleteLastChar(),
      Escape: () => this.callbacks.resetDotsUI(),
      Enter: () => this.callbacks.addNewline()
    };

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyMap = this.layout.getKeyMap();

      // ── Modifier shortcuts (must be checked BEFORE dot input) ──

      // Ctrl+L = cycle layout
      if (key === "l" && e.ctrlKey) {
        e.preventDefault();
        this.layout.cycleToNext();
        return;
      }

      // Ctrl+M or Alt+M = cycle mode forward
      if (key === "m" && (e.ctrlKey || e.altKey) && !e.shiftKey) {
        e.preventDefault();
        this.callbacks.cycleToNextMode();
        return;
      }

      // Ctrl+Shift+M or Alt+Shift+M = cycle mode backward
      if (key === "m" && (e.ctrlKey || e.altKey) && e.shiftKey) {
        e.preventDefault();
        this.callbacks.cycleToPreviousMode();
        return;
      }

      // Alt+C or CapsLock = cycle capital mode
      if ((e.key === "c" && e.altKey) || e.key === "CapsLock") {
        e.preventDefault();
        this.callbacks.cycleCapitalMode();
        return;
      }

      // ── Braille dot input (skip if modifier keys are held) ──
      if (key in keyMap && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        this.handleBrailleDotKey(key, keyMap);
        return;
      }

      // ── Mapped action keys ──
      const action = KEY_ACTIONS[e.code] || KEY_ACTIONS[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyMap = this.layout.getKeyMap();
      if (key in keyMap) this.display.updateKeyVisual(key, false);
    });
  }

  /** Handle a braille dot key press. */
  private handleBrailleDotKey(
    key: string,
    keyMap: Record<string, DotNumber>
  ): void {
    const dot = keyMap[key];
    if (!this.editorState.hasDot(dot)) {
      this.editorState.addDot(dot);
      this.display.updateKeyVisual(key, true);
      this.display.updatePreview(this.editorState);
    }
  }
}
