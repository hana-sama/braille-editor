/**
 * UEB GRADE 2 MODE
 * ================
 * Unified English Braille Grade 2 (contracted) mode implementation.
 *
 * Features:
 * - Inherits full alphabet, numbers, indicators from Grade 1
 * - Whole-word contractions (and, for, of, the, with, etc.)
 * - Part-word contractions (ch, sh, th, ing, etc.)
 * - Lower contractions (be, con, dis, en, in)
 * - Initial-letter contractions (day, know, name, etc.)
 * - Final-letter contractions (-tion, -ness, -ment, etc.)
 * - Word boundary detection
 * - Context-aware contraction resolution
 *
 * @author Hana
 * @license MIT
 */

import { UEBGrade1Mode } from "./UEBGrade1Mode";
import type {
  BrailleCode,
  EditorContext,
  ModeState,
  SequenceResolver,
  SequenceResult
} from "../../types";
import {
  WHOLE_WORD_CONTRACTIONS,
  PART_WORD_CONTRACTIONS,
  LOWER_CONTRACTIONS,
  INITIAL_LETTER_CONTRACTIONS,
  FINAL_LETTER_CONTRACTIONS,
  GRADE_1_INDICATOR,
  type ContractionEntry
} from "./data/contractions";

/** Extended state for Grade 2 mode */
export interface Grade2ModeState extends ModeState {
  /** Whether contraction mode is active */
  contractionMode: boolean;
  /** Pending contraction codes waiting for resolution */
  pendingContraction: BrailleCode[] | null;
  /** Word buffer for boundary detection */
  wordBuffer: string;
  /** Last word boundary position */
  lastWordBoundary: number;
  /** Whether we're at start of word */
  atWordStart: boolean;
  /** Whether previous was a contraction */
  wasContraction: boolean;
}

/** Result of contraction resolution */
interface ContractionResult {
  text: string;
  contraction: ContractionEntry;
}

export class UEBGrade2Mode extends UEBGrade1Mode {
  private contractionResolvers: SequenceResolver[] = [];
  private grade1Mode: boolean = false;

  constructor() {
    super();

    this._initContractionResolvers();
  }

  // ==================== INITIALIZATION ====================

  private _initContractionResolvers(): void {
    this.contractionResolvers = [];

    // Whole-word contraction resolver
    const wholeWordResolver: SequenceResolver = {
      minCells: 1,
      maxCells: 1,
      prefixCodes: new Set(Object.keys(WHOLE_WORD_CONTRACTIONS).map(k => parseInt(k, 16))),
      resolve: (codes: BrailleCode[], context: EditorContext): SequenceResult | null => {
        if (codes.length !== 1) return null;
        
        // Only apply whole-word contractions at word boundaries or standalone
        if (!context.atWordBoundary && !context.standalone) return null;
        
        const entry = WHOLE_WORD_CONTRACTIONS[codes[0]];
        if (!entry) return null;
        
        return {
          name: `whole-word:${entry.text}`,
          text: entry.text,
          type: 'contraction',
          action: 'word'
        };
      }
    };
    this.contractionResolvers.push(wholeWordResolver);

    // Lower contraction resolver (at start of word)
    const lowerResolver: SequenceResolver = {
      minCells: 1,
      maxCells: 1,
      prefixCodes: new Set(Object.keys(LOWER_CONTRACTIONS).map(k => parseInt(k, 16))),
      resolve: (codes: BrailleCode[], context: EditorContext): SequenceResult | null => {
        if (codes.length !== 1) return null;
        
        // Only apply at word start
        if (!context.atWordStart) return null;
        
        const entry = LOWER_CONTRACTIONS[codes[0]];
        if (!entry) return null;
        
        return {
          name: `lower:${entry.text}`,
          text: entry.text,
          type: 'contraction',
          action: 'word'
        };
      }
    };
    this.contractionResolvers.push(lowerResolver);

    // Part-word contraction resolver (for 2-cell contractions like ch, sh, th)
    const partWordResolver: SequenceResolver = {
      minCells: 1,
      maxCells: 1,
      prefixCodes: new Set([
        0x21, // ch
        0x23, // gh
        0x29, // sh
        0x39, // th
        0x31, // wh
        0x2b, // ed
        0x3b, // er
        0x33, // ou
        0x2a, // ow
        0x0c, // st
        0x2c  // ing
      ]),
      resolve: (codes: BrailleCode[], context: EditorContext): SequenceResult | null => {
        if (codes.length !== 1) return null;
        
        // Part-word contractions can be in middle or end of word
        if (context.atWordBoundary) return null;
        
        const key = codes[0].toString(16);
        const entry = PART_WORD_CONTRACTIONS[key];
        if (!entry) return null;
        
        return {
          name: `part:${entry.text}`,
          text: entry.text,
          type: 'contraction',
          action: 'middle'
        };
      }
    };
    this.contractionResolvers.push(partWordResolver);
  }

  // ==================== SEQUENCE RESOLVERS ====================

  getSequenceResolvers(): SequenceResolver[] {
    // Combine Grade 1 resolvers with Grade 2 contraction resolvers
    return [
      ...super.getSequenceResolvers(),
      ...this.contractionResolvers
    ];
  }

  // ==================== CONTEXT ====================

  requiresContext(): boolean {
    return true;
  }

  // ==================== TEXT TO BRAILLE CONVERSION ====================

  /**
   * Convert text to braille codes with Grade 2 contractions.
   * This is the forward conversion (text → braille)
   */
  textToBraille(text: string): BrailleCode[] {
    const result: BrailleCode[] = [];
    let i = 0;
    
    while (i < text.length) {
      // Skip whitespace
      if (/\s/.test(text[i])) {
        result.push(0); // space
        i++;
        continue;
      }
      
      // Check for whole-word contractions at word start
      let foundContraction = false;
      
      // Check whole-word contractions
      for (const [code, entry] of Object.entries(WHOLE_WORD_CONTRACTIONS)) {
        if (text.substring(i).toLowerCase().startsWith(entry.text)) {
          // Check it's a whole word (followed by space or end)
          const nextChar = text.substring(i + entry.text.length).charAt(0);
          if (!nextChar || /\s/.test(nextChar)) {
            result.push(parseInt(code, 16));
            i += entry.text.length;
            foundContraction = true;
            break;
          }
        }
      }
      
      if (foundContraction) continue;
      
      // Check initial-letter contractions
      for (const [word, entry] of Object.entries(INITIAL_LETTER_CONTRACTIONS)) {
        if (text.substring(i).toLowerCase().startsWith(word)) {
          // Add grade 1 indicator first, then contraction
          result.push(GRADE_1_INDICATOR);
          result.push(...entry.braille);
          i += word.length;
          foundContraction = true;
          break;
        }
      }
      
      if (foundContraction) continue;
      
      // Check for final-letter contractions at word end
      let j = i;
      while (j < text.length && !/\s/.test(text[j])) {
        j++;
      }
      const word = text.substring(i, j).toLowerCase();
      
      // Check final contractions
      for (const [suffix, entry] of Object.entries(FINAL_LETTER_CONTRACTIONS)) {
        if (word.endsWith(suffix)) {
          result.push(GRADE_1_INDICATOR);
          result.push(...entry.braille);
          i += word.length;
          foundContraction = true;
          break;
        }
      }
      
      if (foundContraction) continue;
      
      // Check part-word contractions within the word
      // This is a simplified check - a full implementation would be more complex
      for (const [pattern, entry] of Object.entries(PART_WORD_CONTRACTIONS)) {
        if (word.includes(pattern)) {
          // For now, just add the contraction pattern
          result.push(...entry.braille);
          // Remove the matched pattern from further processing
          const idx = word.indexOf(pattern);
          // Add remaining letters as regular letters
          const before = word.substring(0, idx);
          const after = word.substring(idx + pattern.length);
          
          // Convert remaining letters individually
          for (const char of (before + after).split('')) {
            const code = this.textToCode(char);
            if (code !== undefined) {
              result.push(code);
            }
          }
          i += word.length;
          foundContraction = true;
          break;
        }
      }
      
      if (foundContraction) continue;
      
      // No contraction found, convert as regular letter
      const code = this.textToCode(text[i].toLowerCase());
      if (code !== undefined) {
        result.push(code);
      }
      i++;
    }
    
    return result;
  }

  // ==================== BRAILLE TO TEXT CONVERSION ====================

  /**
   * Convert braille code to text with Grade 2 contraction support.
   * This is the reverse conversion (braille → text)
   */
  codeToText(code: BrailleCode, context: EditorContext = {}): string {
    const state = context.state as Grade2ModeState | undefined;
    
    // Check for contraction mode first
    if (state?.contractionMode && !this.grade1Mode) {
      // Try to resolve as contraction
      const contractionResult = this.resolveContraction([code], context);
      if (contractionResult) {
        return contractionResult.text;
      }
    }
    
    // Fall back to Grade 1 behavior
    return super.codeToText(code, context);
  }

  /**
   * Resolve a contraction from braille codes
   */
  private resolveContraction(codes: BrailleCode[], context: EditorContext): ContractionResult | null {
    // Try whole-word contraction
    if (codes.length === 1) {
      const whole = WHOLE_WORD_CONTRACTIONS[codes[0]];
      if (whole && (context.atWordBoundary || context.standalone)) {
        return { text: whole.text, contraction: whole };
      }
      
      // Try lower contraction at word start
      if (context.atWordStart) {
        const lower = LOWER_CONTRACTIONS[codes[0]];
        if (lower) {
          return { text: lower.text, contraction: lower };
        }
      }
    }
    
    // Try part-word contraction
    if (codes.length >= 1) {
      const key = codes[0].toString(16);
      const part = PART_WORD_CONTRACTIONS[key];
      if (part && !context.atWordBoundary) {
        return { text: part.text, contraction: part };
      }
    }
    
    return null;
  }

  // ==================== STATE MANAGEMENT ====================

  createInitialState(): Grade2ModeState {
    const baseState = super.createInitialState();
    return {
      ...baseState,
      contractionMode: true,
      pendingContraction: null,
      wordBuffer: "",
      lastWordBoundary: 0,
      atWordStart: true,
      wasContraction: false
    };
  }

  updateState(state: Grade2ModeState, code: BrailleCode, text: string): Grade2ModeState {
    const newState = { ...state };

    // Handle space - marks word boundary
    if (code === 0) {
      newState.atWordStart = true;
      newState.pendingContraction = null;
      newState.wasContraction = text.length > 0 && 
        (WHOLE_WORD_CONTRACTIONS[code as BrailleCode] !== undefined ||
         LOWER_CONTRACTIONS[code as BrailleCode] !== undefined);
    } else {
      newState.atWordStart = false;
    }

    // Handle grade 1 indicator
    if (code === GRADE_1_INDICATOR) {
      this.grade1Mode = true;
      newState.contractionMode = false;
    }

    // Update base state
    super.updateState(state, code, text);

    return newState;
  }

  // ==================== WORD BOUNDARY DETECTION ====================

  /**
   * Check if we're at a word boundary
   */
  isAtWordBoundary(context: EditorContext): boolean {
    return context.atWordBoundary ?? false;
  }

  /**
   * Detect word boundaries in text
   */
  detectWordBoundaries(text: string): number[] {
    const boundaries: number[] = [0];
    
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i]) && i > 0 && !/\s/.test(text[i - 1])) {
        boundaries.push(i);
      }
    }
    
    return boundaries;
  }

  /**
   * Get the word at a given position
   */
  getWordAtPosition(text: string, position: number): { word: string; start: number; end: number } | null {
    // Find word start
    let start = position;
    while (start > 0 && !/\s/.test(text[start - 1])) {
      start--;
    }
    
    // Find word end
    let end = position;
    while (end < text.length && !/\s/.test(text[end])) {
      end++;
    }
    
    if (start === end) return null;
    
    return {
      word: text.substring(start, end),
      start,
      end
    };
  }

  // ==================== CONTEXT BUILDING ====================

  /**
   * Build editor context for contraction resolution
   */
  buildContractionContext(
    text: string,
    position: number,
    state: Grade2ModeState
  ): EditorContext {
    const precedingText = text.substring(0, position);
    const lastChar = precedingText.slice(-1);
    const atWordBoundary = lastChar === "" || /\s/.test(lastChar);
    
    return {
      precedingText,
      state,
      atWordBoundary,
      atWordStart: state.atWordStart,
      standalone: precedingText.length === 0 || /\s$/.test(precedingText)
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if contraction is valid at this position
   */
  isValidContractionPosition(
    contraction: ContractionEntry,
    context: EditorContext
  ): boolean {
    switch (contraction.position) {
      case 'standalone':
        return context.standalone === true;
      case 'start':
        return context.atWordStart === true;
      case 'end':
        return context.atWordBoundary === true;
      case 'middle':
        return !context.atWordBoundary && !context.atWordStart;
      default:
        return true;
    }
  }

  /**
   * Toggle Grade 1 indicator mode
   */
  setGrade1Mode(enabled: boolean): void {
    this.grade1Mode = enabled;
  }

  /**
   * Get mode info
   */
  getInfo() {
    return {
      name: this.name,
      id: this.id,
      description: this.description,
      language: "en"
    };
  }
}
