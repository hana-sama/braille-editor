/**
 * MODE SIDEBAR COMPONENT
 * =======================
 * Sidebar UI for selecting braille modes organized by category.
 *
 * Features:
 * - Collapsible category sections
 * - Keyboard navigation
 * - Visual indication of current mode
 * - Responsive design
 *
 * @author Hana
 * @license MIT
 */

import { modeRegistry } from "../modes/ModeRegistry";
import type { ModeCategory, ModeInfo } from "../types";

export interface ModeSidebarOptions {
  containerId: string;
  collapsed?: boolean;
  onModeSelect?: (mode: ModeInfo) => void;
}

export class ModeSidebar {
  private container: HTMLElement;
  private collapsed: boolean;
  private onModeSelect?: (mode: ModeInfo) => void;
  private unsubscribe?: () => void;

  constructor(options: ModeSidebarOptions) {
    const el = document.getElementById(options.containerId);
    if (!el) {
      throw new Error(`Container not found: #${options.containerId}`);
    }
    this.container = el;
    this.collapsed = options.collapsed ?? false;
    this.onModeSelect = options.onModeSelect;

    this.render();
    this.attachListeners();
  }

  // ==================== RENDERING ====================

  /** Render the sidebar content. */
  render(): void {
    const categories = modeRegistry.getAllCategories();
    const currentMode = modeRegistry.getMode();

    if (categories.length === 0) {
      // Fallback: render without categories
      this.renderUncategorized();
      return;
    }

    this.container.innerHTML = `
      <div class="mode-sidebar ${this.collapsed ? "collapsed" : ""}">
        <div class="sidebar-header">
          <h3>Braille Modes</h3>
          <button class="sidebar-toggle" aria-label="Toggle sidebar">
            <span class="toggle-icon">${this.collapsed ? "»" : "«"}</span>
          </button>
        </div>
        <div class="sidebar-content">
          ${categories.map(cat => this.renderCategory(cat, currentMode?.id)).join("")}
        </div>
        <div class="sidebar-footer">
          <span class="shortcut-hint">Ctrl+M to cycle</span>
        </div>
      </div>
    `;
  }

  /** Render without categories (fallback). */
  private renderUncategorized(): void {
    const modes = modeRegistry.getAllModes();
    const currentMode = modeRegistry.getMode();

    this.container.innerHTML = `
      <div class="mode-sidebar ${this.collapsed ? "collapsed" : ""}">
        <div class="sidebar-header">
          <h3>Braille Modes</h3>
          <button class="sidebar-toggle" aria-label="Toggle sidebar">
            <span class="toggle-icon">${this.collapsed ? "»" : "«"}</span>
          </button>
        </div>
        <div class="sidebar-content">
          <div class="mode-list">
            ${modes.map(mode => this.renderModeItem(mode.getInfo(), currentMode?.id)).join("")}
          </div>
        </div>
        <div class="sidebar-footer">
          <span class="shortcut-hint">Ctrl+M to cycle</span>
        </div>
      </div>
    `;
  }

  /** Render a single category section. */
  private renderCategory(category: ModeCategory, currentModeId?: string): string {
    const isExpanded = !this.collapsed;
    
    return `
      <div class="category-section" data-category="${category.id}">
        <div class="category-header" role="button" tabindex="0" aria-expanded="${isExpanded}">
          <span class="category-name">${category.name}</span>
          <span class="category-toggle">${isExpanded ? "-" : "+"}</span>
        </div>
        <div class="category-content" ${!isExpanded ? 'style="display: none;"' : ""}>
          <div class="mode-list">
            ${category.modes.map(mode => this.renderModeItem(mode, currentModeId)).join("")}
          </div>
        </div>
      </div>
    `;
  }

  /** Render a single mode item. */
  private renderModeItem(mode: ModeInfo, currentModeId?: string): string {
    const isActive = mode.id === currentModeId;
    
    return `
      <div class="mode-item ${isActive ? "active" : ""}" 
           data-mode="${mode.id}" 
           role="button" 
           tabindex="0"
           aria-pressed="${isActive}">
        <span class="mode-name">${mode.name}</span>
        ${mode.description ? `<span class="mode-description">${mode.description}</span>` : ""}
      </div>
    `;
  }

  // ==================== EVENT HANDLING ====================

  /** Attach event listeners. */
  private attachListeners(): void {
    // Sidebar toggle
    this.container.querySelector(".sidebar-toggle")?.addEventListener("click", () => {
      this.toggle();
    });

    // Category toggles
    this.container.querySelectorAll(".category-header").forEach(header => {
      const headerEl = header as HTMLElement;
      headerEl.addEventListener("click", (e: Event) => {
        this.toggleCategory((e.currentTarget as HTMLElement).parentElement as HTMLElement);
      });
      headerEl.addEventListener("keydown", ((e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          e.preventDefault();
          this.toggleCategory((e.currentTarget as HTMLElement).parentElement as HTMLElement);
        }
      }) as EventListener);
    });

    // Mode selection
    this.container.querySelectorAll(".mode-item").forEach(item => {
      const itemEl = item as HTMLElement;
      itemEl.addEventListener("click", (e: Event) => {
        const modeId = (e.currentTarget as HTMLElement).dataset.mode;
        if (modeId) this.selectMode(modeId);
      });
      itemEl.addEventListener("keydown", ((e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          e.preventDefault();
          const modeId = (e.currentTarget as HTMLElement).dataset.mode;
          if (modeId) this.selectMode(modeId);
        }
      }) as EventListener);
    });

    // Listen for mode changes from registry
    this.unsubscribe = modeRegistry.addListener((event) => {
      if (event.type === "modeChange") {
        this.updateActiveMode(event.currentMode.id);
      }
    });
  }

  /** Toggle sidebar collapsed state. */
  toggle(): void {
    this.collapsed = !this.collapsed;
    const sidebar = this.container.querySelector(".mode-sidebar");
    sidebar?.classList.toggle("collapsed", this.collapsed);
    
    const toggleIcon = this.container.querySelector(".toggle-icon");
    if (toggleIcon) {
      toggleIcon.textContent = this.collapsed ? "»" : "«";
    }
  }

  /** Toggle a category section. */
  private toggleCategory(section: HTMLElement): void {
    const content = section.querySelector(".category-content") as HTMLElement;
    const toggle = section.querySelector(".category-toggle");
    const header = section.querySelector(".category-header");
    
    if (content) {
      const isHidden = content.style.display === "none";
      content.style.display = isHidden ? "" : "none";
      if (toggle) toggle.textContent = isHidden ? "-" : "+";
      header?.setAttribute("aria-expanded", String(isHidden));
    }
  }

  /** Select a mode. */
  private selectMode(modeId: string): void {
    try {
      modeRegistry.setMode(modeId);
      const mode = modeRegistry.getMode();
      if (mode && this.onModeSelect) {
        this.onModeSelect(mode.getInfo());
      }
    } catch (e) {
      console.error("[ModeSidebar] Failed to select mode:", e);
    }
  }

  /** Update the active mode indicator. */
  private updateActiveMode(currentModeId: string): void {
    // Remove active class from all
    this.container.querySelectorAll(".mode-item").forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    
    // Add active class to current
    const activeItem = this.container.querySelector(`[data-mode="${currentModeId}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
      activeItem.setAttribute("aria-pressed", "true");
    }
  }

  // ==================== KEYBOARD NAVIGATION ====================

  /** Handle keyboard navigation for the sidebar. */
  handleKeyboard(event: KeyboardEvent): void {
    if (this.collapsed) return;

    const focusable = Array.from(
      this.container.querySelectorAll<HTMLElement>(".mode-item, .category-header")
    );
    const currentFocus = document.activeElement as HTMLElement;
    const currentIndex = focusable.indexOf(currentFocus);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (currentIndex < focusable.length - 1) {
          focusable[currentIndex + 1].focus();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (currentIndex > 0) {
          focusable[currentIndex - 1].focus();
        }
        break;
      case "Home":
        event.preventDefault();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
        break;
      case "End":
        event.preventDefault();
        if (focusable.length > 0) {
          focusable[focusable.length - 1].focus();
        }
        break;
    }
  }

  // ==================== LIFECYCLE ====================

  /** Destroy the sidebar and clean up. */
  destroy(): void {
    this.unsubscribe?.();
    this.container.innerHTML = "";
  }

  /** Refresh the sidebar content. */
  refresh(): void {
    this.render();
    this.attachListeners();
  }
}