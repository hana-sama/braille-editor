/**
 * MODE SYSTEM TEST
 * ================
 * Tests to verify the mode system works correctly.
 * Run with: npx vitest run
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ModeRegistry } from "../modes/ModeRegistry";
import { UEBGrade1Mode } from "../modes/ueb/UEBGrade1Mode";
import { EditorState } from "../core/EditorState";
import type { ModeState } from "../types";

describe("Mode System", () => {
  let registry: ModeRegistry;
  let ueb1: UEBGrade1Mode;

  beforeEach(() => {
    registry = new ModeRegistry();
    ueb1 = new UEBGrade1Mode();
  });

  it("should create ModeRegistry", () => {
    expect(registry).toBeDefined();
    expect(registry.modeCount).toBe(0);
  });

  it("should register UEB Grade 1 mode", () => {
    registry.register(ueb1);
    expect(registry.hasMode("ueb1")).toBe(true);
    expect(ueb1.name).toBe("UEB Grade 1");
    expect(ueb1.id).toBe("ueb1");
  });

  it("should set current mode", () => {
    registry.register(ueb1);
    registry.setMode("ueb1");
    expect(registry.getMode()?.name).toBe("UEB Grade 1");
  });

  it("should create EditorState", () => {
    registry.register(ueb1);
    registry.setMode("ueb1");
    const state = new EditorState(registry.getMode()!);
    expect(state).toBeDefined();
    expect(state.isEmpty()).toBe(true);
  });
});

describe("Code to Text Conversion", () => {
  let mode: UEBGrade1Mode;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
  });

  it("should convert letter codes to text", () => {
    const tests: Array<{ code: number; expected: string }> = [
      { code: 0x01, expected: "a" },
      { code: 0x03, expected: "b" },
      { code: 0x09, expected: "c" }
    ];

    tests.forEach(({ code, expected }) => {
      expect(mode.codeToText(code, {})).toBe(expected);
    });
  });

  it("should return indicator braille for number sign", () => {
    expect(mode.codeToText(0x3c, {})).toBe("⠼");
  });

  it("should convert codes to digits in number mode", () => {
    const state: ModeState = {
      numberMode: true,
      capitalMode: 0,
      pendingIndicator: null,
      typeformMode: null,
      typeformScope: null
    };

    const tests: Array<{ code: number; expected: string }> = [
      { code: 0x01, expected: "1" },
      { code: 0x03, expected: "2" },
      { code: 0x1a, expected: "0" }
    ];

    tests.forEach(({ code, expected }) => {
      expect(mode.codeToText(code, { state })).toBe(expected);
    });
  });

  it("should capitalize letters in capital mode", () => {
    const state: ModeState = {
      numberMode: false,
      capitalMode: 1,
      pendingIndicator: null,
      typeformMode: null,
      typeformScope: null
    };

    expect(mode.codeToText(0x01, { state })).toBe("A");
  });
});

describe("Dots to Code Conversion", () => {
  let mode: UEBGrade1Mode;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
  });

  it("should convert dot arrays to codes", () => {
    const tests: Array<{ dots: number[]; expected: number }> = [
      { dots: [1], expected: 0x01 },
      { dots: [1, 2], expected: 0x03 },
      { dots: [1, 4], expected: 0x09 },
      { dots: [3, 4, 5, 6], expected: 0x3c }
    ];

    tests.forEach(({ dots, expected }) => {
      expect(mode.dotsToCode(dots)).toBe(expected);
    });
  });
});

describe("Prefix Codes and Sequences", () => {
  let mode: UEBGrade1Mode;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
  });

  it("should have correct prefix codes", () => {
    const prefixCodes = mode.getPrefixCodes();
    expect(prefixCodes.has(0x28)).toBe(true); // italic prefix
    expect(prefixCodes.has(0x18)).toBe(true); // bold prefix
    expect(prefixCodes.has(0x38)).toBe(true); // underline prefix
  });

  it("should resolve italic symbol sequence", () => {
    const result = mode.resolveSequence(0x28, 0x06, {});
    expect(result).not.toBeNull();
    expect(result!.name).toBe("ITALIC_SYMBOL");
    expect(result!.text).toBeDefined();
  });

  it("should return null for invalid sequence", () => {
    const result = mode.resolveSequence(0x28, 0xff, {});
    expect(result).toBeNull();
  });
});

describe("Multi-Cell Sequence Support", () => {
  let mode: UEBGrade1Mode;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
  });

  it("should have sequence resolvers", () => {
    const resolvers = mode.getSequenceResolvers();
    expect(resolvers).toBeDefined();
    expect(resolvers.length).toBeGreaterThan(0);
  });

  it("should have max sequence depth of 3", () => {
    expect(mode.getMaxSequenceDepth()).toBe(3);
  });

  it("should detect capital sign can start sequence", () => {
    expect(mode.canStartSequence(0x20)).toBe(true); // capital sign
  });

  it("should resolve 3-cell capital passage sequence", () => {
    // Capital passage: ⠠⠠⠠ = 0x20, 0x20, 0x20
    const result = mode.resolveMultiCellSequence([0x20, 0x20, 0x20], {});
    expect(result).not.toBeNull();
    expect(result!.name).toBe("CAPITAL_PASSAGE");
    expect(result!.type).toBe("capital");
    expect(result!.action).toBe("passage");
  });

  it("should resolve 2-cell capital word sequence", () => {
    // Capital word: ⠠⠠ = 0x20, 0x20
    const result = mode.resolveMultiCellSequence([0x20, 0x20], {});
    expect(result).not.toBeNull();
    expect(result!.name).toBe("CAPITAL_WORD");
    expect(result!.action).toBe("word");
  });

  it("should resolve 2-cell italic word sequence", () => {
    // Italic word: ⠨⠁ = 0x28, 0x01
    const result = mode.resolveMultiCellSequence([0x28, 0x01], {});
    expect(result).not.toBeNull();
    expect(result!.name).toBe("ITALIC_WORD");
    expect(result!.action).toBe("word");
  });

  it("should resolve 3-cell italic passage sequence", () => {
    // Italic passage: ⠨⠶ = 0x28, 0x36
    const result = mode.resolveMultiCellSequence([0x28, 0x36], {});
    expect(result).not.toBeNull();
    expect(result!.name).toBe("ITALIC_PASSAGE");
    expect(result!.action).toBe("passage");
  });

  it("should return null for invalid multi-cell sequence", () => {
    const result = mode.resolveMultiCellSequence([0x20, 0xff], {});
    expect(result).toBeNull();
  });

  it("should return null for incomplete sequence", () => {
    // Capital sign alone is not a complete sequence
    const result = mode.resolveMultiCellSequence([0x20], {});
    expect(result).toBeNull();
  });

  it("should detect partial sequence is valid", () => {
    // After first capital sign, we can still collect more
    expect(mode.isPartialSequenceValid([0x20])).toBe(true);
  });

  it("should detect max depth reached", () => {
    // At max depth (3), no more cells should be collected
    expect(mode.isPartialSequenceValid([0x20, 0x20, 0x20])).toBe(false);
  });
});

describe("Multi-Cell EditorState Integration", () => {
  let mode: UEBGrade1Mode;
  let state: EditorState;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
    state = new EditorState(mode);
  });

  it("should create initial sequence state", () => {
    expect(state.sequenceState).toBeDefined();
    expect(state.sequenceState.isActive).toBe(false);
    expect(state.sequenceState.pendingCodes).toEqual([]);
  });

  it("should detect pending indicator via sequence state", () => {
    // Start a sequence: dot 6 only = 0x20 = capital sign ⠠
    state.addDot(6 as 1|2|3|4|5|6);
    const result = state.confirmChar();
    
    // Should be pending after capital sign
    expect(result.pending).toBe(true);
    expect(state.isPendingIndicator()).toBe(true);
    expect(state.getSequenceDepth()).toBe(1);
  });

  it("should resolve 2-cell sequence", () => {
    // Add capital sign ⠠ = 0x20 (dot 6 only)
    state.addDot(6 as 1|2|3|4|5|6);
    state.confirmChar();
    
    // Add second capital sign ⠠ = 0x20
    // With deferred resolution, this stays pending (could become 3-cell)
    state.addDot(6 as 1|2|3|4|5|6);
    const result2 = state.confirmChar();
    expect(result2.pending).toBe(true);
    
    // Add a letter 'a' (dot 1 = 0x01) — this triggers deferred 2-cell resolution
    state.addDot(1 as 1|2|3|4|5|6);
    state.confirmChar();
    
    // The capital word indicator should have been applied, making the letter uppercase
    expect(state.textContent).toContain("A");
    expect(state.brailleContent).toContain("⠠⠠");
  });

  it("should resolve 3-cell capital passage", () => {
    // Add three capital signs ⠠⠠⠠ = 0x20, 0x20, 0x20 (dot 6 only each)
    for (let i = 0; i < 3; i++) {
      state.addDot(6 as 1|2|3|4|5|6);
      state.confirmChar();
    }
    
    // The result should contain capital passage
    expect(state.brailleContent).toContain("⠠⠠⠠");
  });

  it("should get pending codes", () => {
    // Start sequence: dot 6 only = 0x20 = capital sign
    state.addDot(6 as 1|2|3|4|5|6);
    state.confirmChar();
    
    const pendingCodes = state.getPendingCodes();
    expect(pendingCodes.length).toBe(1);
    expect(pendingCodes[0]).toBe(0x20);
  });

  it("should cancel pending sequence on escape", () => {
    // Start sequence: dot 6 only = 0x20 = capital sign
    state.addDot(6 as 1|2|3|4|5|6);
    state.confirmChar();
    
    // Cancel
    state.cancelPendingIndicator();
    
    expect(state.isPendingIndicator()).toBe(false);
    expect(state.getPendingCodes().length).toBe(0);
  });
});

describe("State Management", () => {
  let mode: UEBGrade1Mode;

  beforeEach(() => {
    mode = new UEBGrade1Mode();
  });

  it("should create initial state", () => {
    const state = mode.createInitialState();
    expect(state.numberMode).toBe(false);
    expect(state.capitalMode).toBe(0);
    expect(state.typeformMode).toBeNull();
  });

  it("should enable number mode on number sign", () => {
    const state = mode.createInitialState();
    const newState = mode.updateState(state, 0x3c, "⠼");
    expect(newState.numberMode).toBe(true);
  });

  it("should disable number mode on space", () => {
    const state: ModeState = {
      ...mode.createInitialState(),
      numberMode: true
    };
    const newState = mode.updateState(state, 0, " ");
    expect(newState.numberMode).toBe(false);
  });

  it("should set capital mode on capital sign", () => {
    const state = mode.createInitialState();
    const newState = mode.updateState(state, 0x20, "⠠");
    expect(newState.capitalMode).toBe(1);
  });
});
