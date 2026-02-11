# Accessibility Improvement Plan for Braille Editor

## Overview

This document outlines the accessibility improvements needed for `braille.html` to make it fully accessible for visually impaired users. The improvements focus on ARIA attributes, screen reader support, and keyboard navigation.

---

## 1. ARIA Live Regions

### 1.1 Toast Notifications
**Current:** `<div id="toast" class="toast"></div>` (line 135)  
**Issue:** Screen readers won't announce toast messages when they appear.  
**Fix:** Add `aria-live="polite"` to announce messages without interrupting.

```html
<div id="toast" class="toast" aria-live="polite" aria-atomic="true"></div>
```

### 1.2 Status Bar
**Current:** `<span id="status-text">Ready</span>` (line 122)  
**Issue:** Status changes like "Number Mode Active" aren't announced.  
**Fix:** Add `aria-live="polite"` to the status text container.

```html
<span id="status-text" aria-live="polite">Ready</span>
```

### 1.3 Preview Box - Current Input
**Current:** Preview values at lines 37, 41, 45  
**Issue:** When users press keys, the braille/text/dots preview updates but isn't announced.  
**Fix:** Add `aria-live="polite"` to each preview value.

```html
<span class="preview-value braille-display" id="braille-preview" aria-live="polite">⠀</span>
<span class="preview-value text-display" id="text-preview" aria-live="polite">-</span>
<span class="preview-value dots-display" id="dots-preview" aria-live="polite">-</span>
```

### 1.4 Mode Indicators
**Current:** Mode indicators at lines 51-58  
**Issue:** When number mode or capital mode activates, screen readers aren't notified.  
**Fix:** Add `aria-live="polite"` and `aria-atomic="true"`.

```html
<div class="mode-indicator" id="number-mode-indicator" aria-live="polite">
  <span class="mode-icon">⠼</span>
  <span>Number Mode</span>
</div>
<div id="capital-mode-indicator" class="capital-indicator" style="display: none;" aria-live="polite">
  <span>⬆</span>
  <span>Capital</span>
</div>
```

### 1.5 Editor Content Areas
**Current:** Editor content at lines 103, 115  
**Issue:** When content is added/deleted, screen readers aren't notified.  
**Fix:** Add `aria-live="polite"` and proper role attributes.

```html
<div class="editor-content" id="braille-editor" role="textbox" aria-label="Braille content" aria-live="polite" aria-readonly="true"><span class="cursor"></span></div>
<div class="editor-content" id="text-editor" role="textbox" aria-label="Print text content" aria-live="polite" aria-readonly="true"><span class="cursor"></span></div>
```

---

## 2. Heading Structure with aria-level

### 2.1 Section Titles
**Current:** Section titles use `<div class="section-title">` without semantic meaning.  
**Issue:** Screen readers can't navigate by headings.  
**Fix:** Convert to proper heading elements or add `role="heading"` with `aria-level`.

**Option A - Use semantic headings (recommended):**
```html
<h2 class="section-title">Keyboard Layout</h2>
<h2 class="section-title">Input Keys</h2>
<h2 class="section-title">Current Input</h2>
<h2 class="section-title">Active Modes</h2>
<h2 class="section-title">How to Input</h2>
<h3 class="section-title">Alphabet Reference</h3>
<h3 class="section-title">Number Reference</h3>
```

**Option B - Add ARIA roles (if styling constraints):**
```html
<div class="section-title" role="heading" aria-level="2">Keyboard Layout</div>
```

### 2.2 Main Title Structure
**Current:** `<h1>` contains multiple spans (line 11-14)  
**Issue:** This is acceptable, but ensure the subtitle is properly associated.

```html
<header role="banner">
  <h1>
    <span>⠃⠗⠁⠊⠇⠇⠑</span>
    <span>6-Dot Braille Editor</span>
  </h1>
  <div class="subtitle" role="docsubtitle">Unified English Braille (UEB) Grade 1 - Learning Mode</div>
</header>
```

---

## 3. ARIA Roles and Labels for Interactive Elements

### 3.1 Main Layout Structure
**Add landmark roles:**

```html
<header role="banner">...</header>
<div class="sidebar" role="complementary" aria-label="Controls and Reference">...</div>
<div class="editor-area" role="main" aria-label="Braille Editor">...</div>
```

### 3.2 Layout Selector
**Current:** `<div class="layout-selector" id="layout-selector"></div>` (line 24)  
**Issue:** Radio buttons are dynamically generated without proper grouping.  
**Fix:** Add `role="radiogroup"` and `aria-label`.

```html
<div class="layout-selector" id="layout-selector" role="radiogroup" aria-label="Keyboard layout selection"></div>
```

### 3.3 Keyboard Layout Display
**Current:** `<div class="keyboard-layout" id="keyboard-layout"></div>` (line 30)  
**Issue:** Interactive keys need proper labeling.  
**Fix:** Add `role="group"` and `aria-label`.

```html
<div class="keyboard-layout" id="keyboard-layout" role="group" aria-label="Braille input keys"></div>
```

### 3.4 Preview Box
**Current:** `<div class="preview-box">` (line 34)  
**Issue:** No semantic grouping for preview information.  
**Fix:** Add `role="region"` and `aria-label`.

```html
<div class="preview-box" role="region" aria-label="Current input preview">
  ...
</div>
```

### 3.5 Buttons
**Current:** Buttons at lines 61-65  
**Issue:** Buttons have text but could benefit from more descriptive labels.  
**Fix:** Add `aria-label` for clearer context.

```html
<button class="primary" onclick="confirmChar()" aria-label="Confirm character (Space key)">⏎ Confirm (Space)</button>
<button class="secondary" onclick="deleteLastChar()" aria-label="Delete last character">⌫ Delete Last</button>
<button class="secondary" id="btn-copy-braille" onclick="copyToClipboard('braille')" aria-label="Copy braille content to clipboard">Copy Braille</button>
<button class="secondary" id="btn-copy-text" onclick="copyToClipboard('text')" aria-label="Copy text content to clipboard">Copy Text</button>
<button class="danger" onclick="clearEditor()" aria-label="Clear all content">Clear All</button>
```

### 3.6 Alphabet and Number Grids
**Current:** Grids at lines 82, 87  
**Issue:** No semantic meaning for reference grids.  
**Fix:** Add `role="list"` or `role="grid"` with proper labels.

```html
<div class="alphabet-grid" id="alphabet-grid" role="list" aria-label="Alphabet reference"></div>
<div class="alphabet-grid" id="number-grid" role="list" aria-label="Number reference"></div>
```

### 3.7 Editor Panels
**Current:** Editor panels at lines 95, 107  
**Issue:** No clear association between panel header and content.  
**Fix:** Add `aria-labelledby` to associate labels.

```html
<div class="editor-panel" role="region">
  <div class="panel-header" id="braille-panel-label">
    <div class="panel-title">
      <span class="icon">⠿</span>
      <span>Braille (点字)</span>
    </div>
    <span class="char-count" id="braille-count" aria-label="Character count">0 chars</span>
  </div>
  <div class="editor-content" id="braille-editor" role="textbox" aria-labelledby="braille-panel-label" aria-live="polite" aria-readonly="true">...</div>
</div>
```

---

## 4. Focus Management and Keyboard Navigation

### 4.1 Skip Link
**Add a skip link at the beginning of the page:**

```html
<body>
  <a href="#braille-editor" class="skip-link">Skip to editor</a>
  <header>...</header>
  ...
</body>
```

**Add CSS for skip link:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

### 4.2 Focus Indicators
**Ensure all interactive elements have visible focus states:**

```css
button:focus, 
.key:focus,
input:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}
```

### 4.3 Tabindex for Editor Areas
**Make editor areas focusable:**

```html
<div class="editor-content" id="braille-editor" tabindex="0" ...>...</div>
<div class="editor-content" id="text-editor" tabindex="0" ...>...</div>
```

---

## 5. Additional Improvements

### 5.1 Character Count Updates
**Add aria-live to character counts:**

```html
<span class="char-count" id="braille-count" aria-live="polite">0 chars</span>
<span class="char-count" id="text-count" aria-live="polite">0 chars</span>
```

### 5.2 Instructions Section
**Add proper list semantics:**

```html
<div class="instructions" role="region" aria-label="Input instructions">
  <ul>
    <li>Hold <kbd>F</kbd><kbd>D</kbd><kbd>S</kbd> + <kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> to form dots.</li>
    <li>Press <kbd>Space</kbd> to confirm character.</li>
    ...
  </ul>
</div>
```

### 5.3 Keyboard Visual Keys
**In JavaScript, add aria-labels to dynamically generated keys:**

```javascript
function renderKey(key, dot) {
  return `<div class="key" data-key="${key.toLowerCase()}" data-dot="${dot}" 
    role="button" 
    tabindex="0"
    aria-label="Dot ${dot} - Key ${key.toUpperCase()}"
    aria-pressed="false">
    <span class="key-letter">${key.toUpperCase()}</span>
    <span class="key-dot">${dot}</span>
  </div>`;
}
```

### 5.4 Layout Description
**Add aria-live to layout description:**

```html
<div class="layout-description" id="layout-description" aria-live="polite"></div>
```

---

## Summary of Changes

| Element | Line | Change |
|---------|------|--------|
| Toast | 135 | Add `aria-live="polite" aria-atomic="true"` |
| Status text | 122 | Add `aria-live="polite"` |
| Braille preview | 37 | Add `aria-live="polite"` |
| Text preview | 41 | Add `aria-live="polite"` |
| Dots preview | 45 | Add `aria-live="polite"` |
| Number mode indicator | 51 | Add `aria-live="polite"` |
| Capital mode indicator | 55 | Add `aria-live="polite"` |
| Section titles | 21, 27, 32, 50, 68, 81, 86 | Convert to `<h2>` or `<h3>` with proper `aria-level` |
| Layout selector | 24 | Add `role="radiogroup" aria-label` |
| Keyboard layout | 30 | Add `role="group" aria-label` |
| Preview box | 34 | Add `role="region" aria-label` |
| Buttons | 61-65 | Add descriptive `aria-label` |
| Alphabet grid | 82 | Add `role="list" aria-label` |
| Number grid | 87 | Add `role="list" aria-label` |
| Braille editor | 103 | Add `role="textbox" aria-label aria-live tabindex` |
| Text editor | 115 | Add `role="textbox" aria-label aria-live tabindex` |
| Char counts | 101, 113 | Add `aria-live="polite"` |
| Layout description | 25 | Add `aria-live="polite"` |
| Sidebar | 20 | Add `role="complementary" aria-label` |
| Editor area | 92 | Add `role="main"` |
| Header | 10 | Add `role="banner"` |
| Skip link | New | Add skip link before header |

---

## Implementation Order

1. Add `aria-live` regions for dynamic content (toast, status, previews, editors)
2. Convert section titles to proper headings with `aria-level`
3. Add landmark roles (banner, main, complementary)
4. Add `aria-label` to buttons and interactive elements
5. Add skip link for keyboard navigation
6. Update JavaScript to add ARIA attributes to dynamically generated content
