/**
 * MODE REGISTRY
 * =============
 * Central registry for managing braille modes.
 *
 * Features:
 * - Register new braille modes
 * - Switch between modes
 * - Persist mode preference
 * - Notify listeners on mode change
 *
 * @author Hana
 * @license MIT
 */

import { BrailleMode } from "./BrailleMode";
import type { ModeChangeEvent, ModeChangeListener, ModeInfo } from "../types";

export class ModeRegistry {
  private modes: Map<string, BrailleMode> = new Map();
  private currentMode: BrailleMode | null = null;
  private listeners: Set<ModeChangeListener> = new Set();
  private storageKey = "brailleEditorMode";

  // ==================== REGISTRATION ====================

  /** Register a new braille mode. */
  register(mode: BrailleMode): void {
    if (!mode?.id || !mode.name) {
      throw new Error("Invalid mode: must have id and name");
    }
    if (this.modes.has(mode.id)) {
      throw new Error(`Mode already registered: ${mode.id}`);
    }
    this.modes.set(mode.id, mode);
    console.log(`[ModeRegistry] Registered mode: ${mode.name} (${mode.id})`);
  }

  /** Unregister a mode. */
  unregister(modeId: string): void {
    if (this.currentMode?.id === modeId) {
      this.currentMode = null;
    }
    this.modes.delete(modeId);
  }

  // ==================== MODE SELECTION ====================

  /** Set the current mode. */
  setMode(modeId: string): void {
    if (!this.modes.has(modeId)) {
      throw new Error(`Unknown mode: ${modeId}`);
    }

    const previousMode = this.currentMode;
    this.currentMode = this.modes.get(modeId)!;

    this.savePreference(modeId);
    this.notifyListeners({
      type: "modeChange",
      previousMode: previousMode?.getInfo() ?? null,
      currentMode: this.currentMode.getInfo()
    });

    console.log(`[ModeRegistry] Switched to mode: ${this.currentMode.name}`);
  }

  /** Get the current mode. */
  getMode(): BrailleMode | null {
    return this.currentMode;
  }

  /** Get a specific mode by ID. */
  getModeById(modeId: string): BrailleMode | undefined {
    return this.modes.get(modeId);
  }

  /** Get all registered modes. */
  getAllModes(): BrailleMode[] {
    return Array.from(this.modes.values());
  }

  /** Get mode info for UI display. */
  getModeOptions(): ModeInfo[] {
    return this.getAllModes().map(mode => mode.getInfo());
  }

  // ==================== CYCLING ====================

  /** Cycle to the next mode. */
  cycleToNext(): BrailleMode {
    const modeIds = Array.from(this.modes.keys());
    if (modeIds.length === 0) {
      throw new Error("No modes registered");
    }

    const currentIndex = this.currentMode
      ? modeIds.indexOf(this.currentMode.id)
      : -1;

    const nextIndex = (currentIndex + 1) % modeIds.length;
    this.setMode(modeIds[nextIndex]);

    return this.currentMode!;
  }

  /** Cycle to the previous mode. */
  cycleToPrevious(): BrailleMode {
    const modeIds = Array.from(this.modes.keys());
    if (modeIds.length === 0) {
      throw new Error("No modes registered");
    }

    const currentIndex = this.currentMode
      ? modeIds.indexOf(this.currentMode.id)
      : -1;

    const previousIndex = (currentIndex - 1 + modeIds.length) % modeIds.length;
    this.setMode(modeIds[previousIndex]);

    return this.currentMode!;
  }

  // ==================== PERSISTENCE ====================

  /** Save mode preference to localStorage. */
  savePreference(modeId: string): void {
    try {
      localStorage.setItem(this.storageKey, modeId);
    } catch (e) {
      console.warn("[ModeRegistry] Failed to save mode preference:", e);
    }
  }

  /** Load mode preference from localStorage. */
  loadPreference(defaultModeId: string): string {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && this.modes.has(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn("[ModeRegistry] Failed to load mode preference:", e);
    }
    return defaultModeId;
  }

  /** Clear saved preference. */
  clearPreference(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn("[ModeRegistry] Failed to clear mode preference:", e);
    }
  }

  // ==================== EVENT HANDLING ====================

  /** Add a mode change listener. Returns an unsubscribe function. */
  addListener(listener: ModeChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Remove a mode change listener. */
  removeListener(listener: ModeChangeListener): void {
    this.listeners.delete(listener);
  }

  /** Notify all listeners of a change. */
  private notifyListeners(event: ModeChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error("[ModeRegistry] Listener error:", e);
      }
    });
  }

  // ==================== UTILITY ====================

  /** Check if a mode is registered. */
  hasMode(modeId: string): boolean {
    return this.modes.has(modeId);
  }

  /** Get number of registered modes. */
  get modeCount(): number {
    return this.modes.size;
  }

  /** Check if a mode is currently active. */
  isModeActive(modeId: string): boolean {
    return this.currentMode?.id === modeId;
  }
}

/** Singleton instance. */
export const modeRegistry = new ModeRegistry();
