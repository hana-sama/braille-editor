/**
 * CLIPBOARD MANAGER
 * =================
 * Handles copy-to-clipboard operations and toast notifications.
 */

export class ClipboardManager {
  private toastEl: HTMLDivElement;

  constructor(toastEl: HTMLDivElement) {
    this.toastEl = toastEl;
  }

  /** Show a temporary toast notification. */
  showToast(message: string, duration = 2000): void {
    this.toastEl.textContent = message;
    this.toastEl.classList.add("show");
    setTimeout(() => this.toastEl.classList.remove("show"), duration);
  }

  /** Copy text to clipboard and animate the button. */
  async copyToClipboard(
    text: string,
    btn: HTMLButtonElement
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);

      const original = btn.textContent;
      btn.textContent = "✓ Copied!";
      btn.style.background = "#4caf50";
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = "";
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }
}
