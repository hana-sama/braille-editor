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
