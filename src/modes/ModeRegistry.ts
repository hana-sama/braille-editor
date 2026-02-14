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
 * - Organize modes by category
 * - Handle mode transitions
 *
 * @author Hana
 * @license MIT
 */

import { BrailleMode } from "./BrailleMode";
import type { ModeCategory, ModeChangeEvent, ModeChangeListener, ModeInfo, ModeTransition } from "../types";

export class ModeRegistry {
  private modes: Map<string, BrailleMode> = new Map();
  private categories: Map<string, ModeCategory> = new Map();
  private transitions: Map<string, ModeTransition> = new Map();
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

  // ==================== CATEGORY MANAGEMENT ====================

  /** Register a mode category. */
  registerCategory(category: Omit<ModeCategory, "modes">): void {
    if (this.categories.has(category.id)) {
      console.warn(`[ModeRegistry] Category already exists: ${category.id}`);
      return;
    }
    this.categories.set(category.id, { ...category, modes: [] });
    console.log(`[ModeRegistry] Registered category: ${category.name} (${category.id})`);
  }

  /** Register a mode with a category. */
  registerModeWithCategory(mode: BrailleMode, categoryId: string): void {
    // Register the mode first
    this.register(mode);

    // Add to category
    const category = this.categories.get(categoryId);
    if (category) {
      category.modes.push(mode.getInfo());
      console.log(`[ModeRegistry] Added mode ${mode.name} to category ${category.name}`);
    } else {
      console.warn(`[ModeRegistry] Category not found: ${categoryId}, mode registered without category`);
    }
  }

  /** Get a category by ID. */
  getCategory(categoryId: string): ModeCategory | undefined {
    return this.categories.get(categoryId);
  }

  /** Get all categories. */
  getAllCategories(): ModeCategory[] {
    return Array.from(this.categories.values());
  }

  /** Get modes by category. */
  getModesByCategory(categoryId: string): ModeInfo[] {
    const category = this.categories.get(categoryId);
    return category?.modes ?? [];
  }

  /** Get the category of the current mode. */
  getCurrentCategory(): ModeCategory | null {
    if (!this.currentMode) return null;
    
    for (const category of this.categories.values()) {
      if (category.modes.some(m => m.id === this.currentMode?.id)) {
        return category;
      }
    }
    return null;
  }

  // ==================== TRANSITION MANAGEMENT ====================

  /** Register a mode transition. */
  registerTransition(transition: ModeTransition): void {
    const key = `${transition.from}:${transition.to}`;
    this.transitions.set(key, transition);
  }

  /** Get a transition between two modes. */
  getTransition(fromId: string, toId: string): ModeTransition | undefined {
    return this.transitions.get(`${fromId}:${toId}`);
  }

  /** Set mode with transition handling. */
  setModeWithTransition(modeId: string): void {
    const previousMode = this.currentMode;
    const transition = previousMode 
      ? this.getTransition(previousMode.id, modeId) 
      : null;

    // If there's a transition defined, we could apply state mapping here
    // For now, just set the mode normally
    this.setMode(modeId);

    if (transition) {
      console.log(`[ModeRegistry] Applied transition: ${transition.from} -> ${transition.to}`);
    }
  }
}

/** Singleton instance. */
export const modeRegistry = new ModeRegistry();
