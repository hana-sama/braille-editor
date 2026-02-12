# Braille-v2.html Fix Plan

## Problem Summary

The `braille-v2.html` page loads but:
1. Default keyboard layout (FDS JKL) does not load initially
2. After cycling through keyboard layouts, "some mode appears"
3. No output is registered when pressing keys

## Root Cause Analysis

After analyzing the code, I identified the following issues:

### Issue 1: `KEY_MAP` Not Initialized on Page Load

In [`braille-new.js`](../braille-new.js:44-45), `KEY_MAP` is initialized as an empty object:

```javascript
let currentLayout = DEFAULT_LAYOUT;
let KEY_MAP = {};
```

The `KEY_MAP` is only populated when `setLayout()` is called. If `init()` throws an error before reaching `setLayout()`, the keyboard input will not work because the keydown handler checks `if (key in KEY_MAP)`.

### Issue 2: Potential Error in `initModes()`

The [`initModes()`](../braille-new.js:103-117) function is called first in `init()`:

```javascript
function init() {
  // Initialize mode system first
  initModes();  // <-- If this throws, setLayout() never runs!
  
  // Initialize UI
  initLayoutSelector();
  initModeSelector();
  setLayout(LayoutStorage.load(DEFAULT_LAYOUT));  // <-- Never reached if error above
  // ...
}
```

If `initModes()` throws an error, `setLayout()` is never called, leaving `KEY_MAP` empty.

### Issue 3: Global Variable Capture Timing

In [`braille-new.js`](../braille-new.js:48-51), global variables are captured at script load time:

```javascript
const modeRegistry = window.modeRegistry;
const UEBGrade1Mode = window.UEBGrade1Mode;
const EditorState = window.EditorState;
```

If any of these are `undefined` when the script loads, the `const` will be `undefined`, and subsequent calls like `new UEBGrade1Mode()` will throw `TypeError: UEBGrade1Mode is not a constructor`.

### Issue 4: Inline Script References Local Variable

The inline script at the end of [`braille-v2.html`](../braille-v2.html:356-370) references `modeRegistry`:

```javascript
modeRegistry.addListener(function(event) { ... });
```

However, `modeRegistry` is a local `const` in `braille-new.js`, not a global. The inline script relies on `window.modeRegistry` being set by `modes/ModeRegistry.js`.

## Proposed Fixes

### Fix 1: Add Error Handling and Defensive Initialization

Modify [`braille-new.js`](../braille-new.js) to:

1. Check if globals are defined before using them
2. Add try-catch around initialization
3. Ensure `setLayout()` is called even if other initialization fails

```javascript
// At the top of braille-new.js
const modeRegistry = window.modeRegistry;
const UEBGrade1Mode = window.UEBGrade1Mode;
const EditorState = window.EditorState;

// Add validation
if (!modeRegistry || !UEBGrade1Mode || !EditorState) {
  console.error("Missing required globals:", {
    modeRegistry: !!modeRegistry,
    UEBGrade1Mode: !!UEBGrade1Mode,
    EditorState: !!EditorState
  });
}
```

### Fix 2: Restructure `init()` Function

Ensure `setLayout()` is called early and handle errors gracefully:

```javascript
function init() {
  try {
    // Initialize mode system first
    initModes();
  } catch (e) {
    console.error("Failed to initialize mode system:", e);
  }
  
  // Initialize UI - always attempt these
  try {
    initLayoutSelector();
    initModeSelector();
  } catch (e) {
    console.error("Failed to initialize UI selectors:", e);
  }
  
  // CRITICAL: Always set layout so keyboard works
  try {
    setLayout(LayoutStorage.load(DEFAULT_LAYOUT));
  } catch (e) {
    console.error("Failed to set layout:", e);
    // Fallback to default
    setLayout(DEFAULT_LAYOUT);
  }
  
  // ... rest of init
}
```

### Fix 3: Initialize `KEY_MAP` with Default Layout

Instead of initializing `KEY_MAP` as empty, build it from the default layout immediately:

```javascript
// Build initial KEY_MAP from default layout
let currentLayout = DEFAULT_LAYOUT;
let KEY_MAP = buildKeyMap(LAYOUTS[DEFAULT_LAYOUT]);

function buildKeyMap(layout) {
  const map = {};
  [...layout.leftHand, ...layout.rightHand].forEach(({ key, dot }) => {
    map[key.toLowerCase()] = dot;
    map[key.toUpperCase()] = dot;
  });
  return map;
}
```

### Fix 4: Use `window.modeRegistry` in Inline Script

Update the inline script in [`braille-v2.html`](../braille-v2.html:356-370) to explicitly use `window.modeRegistry`:

```javascript
<script>
  // Use window.modeRegistry explicitly
  window.modeRegistry.addListener(function(event) {
    if (event.type === 'modeChange') {
      var display = document.getElementById('current-mode-display');
      if (display) {
        display.textContent = event.currentMode.name;
      }
    }
  });
  
  // Initial update - with null check
  var currentMode = window.modeRegistry ? window.modeRegistry.getMode() : null;
  if (currentMode) {
    document.getElementById('current-mode-display').textContent = currentMode.name;
  }
</script>
```

## Implementation Order

1. **Fix 3** - Initialize `KEY_MAP` with default layout (most critical for keyboard input)
2. **Fix 2** - Add error handling to `init()` function
3. **Fix 1** - Add validation for global variables
4. **Fix 4** - Update inline script to use `window.modeRegistry`

## Testing

After implementing fixes, verify:
1. Page loads without JavaScript errors in console
2. Default keyboard layout (FDS JKL) is active on page load
3. Pressing F, D, S, J, K, L keys registers braille dots
4. Space key confirms character
5. Mode display shows "UEB Grade 1" in status bar
