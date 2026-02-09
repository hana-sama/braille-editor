Below is a **Markdown reference table for the Nemeth Code (Mathematics Braille)**.  
The layout mirrors the “print – dots – pattern – Unicode” style you asked for for UEB, but the cells now contain the **Nemeth‑specific symbols** used for mathematics, science and engineering.

> **How to read the table**  
> * **Print** – the visual character (Latin letter, digit, Greek letter, operator, etc.).  
> * **Dots** – the six‑dot positions (1‑6) that make up the Braille cell.  
> * **Braille Pattern** – the actual Unicode Braille character you can copy‑paste.  
> * **Unicode** – the code‑point (e.g., `U+2801`).  

Nemeth uses the **same 6‑dot cell set as ordinary Braille**, but many symbols are prefixed by **indicator cells** (e.g., the *capital* indicator ⠠ U+2820, the *numeric* indicator ⠼ U+283C, the *Greek* indicator ⠐ U+2810, the *math‑letter* indicator ⠸ U+2838, etc.).  
In the tables below the indicator is shown **in front of** the symbol when it is required.

---

## 1. Latin Letters (lower‑case and upper‑case)

| Print | Dots (1‑6) | Braille Pattern | Unicode |
|-------|------------|----------------|---------|
| a | 1 | ⠁ | U+2801 |
| b | 1‑2 | ⠃ | U+2803 |
| c | 1‑4 | ⠉ | U+2809 |
| d | 1‑4‑5 | ⠙ | U+2819 |
| e | 1‑5 | ⠑ | U+2811 |
| f | 1‑2‑4 | ⠋ | U+280B |
| g | 1‑2‑4‑5 | ⠛ | U+281B |
| h | 1‑2‑5 | ⠓ | U+2813 |
| i | 2‑4 | ⠊ | U+280A |
| j | 2‑4‑5 | ⠚ | U+281A |
| k | 1‑3 | ⠅ | U+2805 |
| l | 1‑2‑3 | ⠇ | U+2807 |
| m | 1‑3‑4 | ⠍ | U+280D |
| n | 1‑3‑4‑5 | ⠝ | U+281D |
| o | 1‑3‑5 | ⠕ | U+2815 |
| p | 1‑2‑3‑4 | ⠏ | U+280F |
| q | 1‑2‑3‑4‑5 | ⠟ | U+281F |
| r | 1‑2‑3‑5 | ⠗ | U+2817 |
| s | 2‑3‑4 | ⠎ | U+280E |
| t | 2‑3‑4‑5 | ⠞ | U+281E |
| u | 1‑3‑6 | ⠥ | U+2825 |
| v | 1‑2‑3‑6 | ⠧ | U+2827 |
| w | 2‑4‑5‑6 | ⠺ | U+283A |
| x | 1‑3‑4‑6 | ⠭ | U+282D |
| y | 1‑3‑4‑5‑6 | ⠽ | U+283D |
| z | 1‑3‑5‑6 | ⠵ | U+2835 |
| **Capital A‑Z** | *capital‑indicator* ⠠ U+2820 + letter | ⠠⠁ … ⠠⠵ | U+2820 U+2801 … U+2820 U+2835 |

> The **capital‑indicator** (dot 6) is placed **before** the letter cell.  

---

## 2. Numbers

Nemeth follows the same number‑sign as literary Braille (⠼ U+283C) and then uses the *letter‑A‑J* patterns for the digits.

| Print | Dots | Braille Pattern | Unicode |
|-------|------|----------------|----------|
| # (numeric indicator) | 3‑4‑5‑6 | ⠼ | U+283C |
| 1 | 1 | ⠁ | U+2801 |
| 2 | 1‑2 | ⠃ | U+2803 |
| 3 | 1‑4 | ⠉ | U+2809 |
| 4 | 1‑4‑5 | ⠙ | U+2819 |
| 5 | 1‑5 | ⠑ | U+2811 |
| 6 | 1‑2‑4 | ⠋ | U+280B |
| 7 | 1‑2‑4‑5 | ⠛ | U+281B |
| 8 | 1‑2‑5 | ⠓ | U+2813 |
| 9 | 2‑4 | ⠊ | U+280A |
| 0 | 2‑4‑5 | ⠚ | U+281A |

To write **42** the Unicode cells: ⠼⠙⠃.

---

## 3. Basic Punctuation (as used in math)

| Print | Dots | Braille Pattern | Unicode |
|-------|------|----------------|----------|
| , (comma) | 2 | ⠂ | U+2802 |
| . (decimal point) | 2‑5‑6 | ⠲ | U+2832 |
| ; (semicolon) | 2‑3 | ⠆ | U+2806 |
| : (colon) | 2‑5 | ⠒ | U+2812 |
| ? (question) | 2‑3‑6 | ⠦ | U+2826 |
| ! (exclamation) | 2‑3‑5 | ⠖ | U+2816 |
| – (en‑dash) | 3‑6 | ⠤ | U+2824 |
| ’ (prime, also apostrophe) | 3 | ⠄ | U+2804 |
| “ ” (quotation marks) | 2‑3‑5‑6 | ⠶ | U+2836 |
| ( ) (parentheses) | 2‑3‑5‑6 | ⠶ | U+2836 |
| [ ] (brackets) | 2‑3‑5‑6 preceded by **math‑letter indicator** | ⠨⠶ | U+2828 U+2836 |
| { } (braces) | 2‑3‑5‑6 preceded by **math‑letter indicator** | ⠨⠶ | U+2828 U+2836 |
| / (fraction slash) | 3‑4 | ⠌ | U+280C |
| \ (back‑slash) | 3‑4‑5 | ⠸ | U+2838 |
| … (ellipsis) | 2‑5‑6 (×3) | ⠲⠲ | U+2832 ×3 |

---

## 4. Common Mathematical Operators

| Print | Dots | Braille Pattern | Unicode |
|-------|------|----------------|----------|
| + (plus) | 2‑3‑5‑6 | ⠖ | U+2816 |
| – (minus) | 3‑6 | ⠤ | U+2824 |
| × (multiplication) | 1‑3‑4‑6 | ⠭ | U+282D |
| ÷ (division) | 2‑3‑4‑5 | ⠹ | U+2839 |
| = (equals) | 4‑5‑6 | ⠶ | U+2836 |
| ≠ (not‑equal) | 4‑5‑6 + 2‑3‑5‑6 | ⠶⠖ | U+2836 U+2816 |
| < (less‑than) | 1‑2‑6 | ⠣ | U+2823 |
| > (greater‑than) | 3‑4‑6 | ⠜ | U+281C |
| ≤ (less‑or‑equal) | 1‑2‑6 + 4‑5‑6 | ⠣⠶ | U+2823 U+2836 |
| ≥ (greater‑or‑equal) | 3‑4‑6 + 4‑5‑6 | ⠜⠶ | U+281C U+2836 |
| ± (plus‑minus) | 2‑3‑5‑6 + 3‑6 | ⠖⠤ | U+2816 U+2824 |
| ∓ (minus‑plus) | 3‑6 + 2‑3‑5‑6 | ⠤⠖ | U+2824 U+2816 |
| ∞ (infinity) | 2‑5‑6‑6‑5‑4‑ pattern ⠲⠢ | U+2832 U+2822 |
| ∑ (summation) | 2‑3‑5‑6‑4‑5‑6 | ⠖⠶ | U+2816 U+2836 |
| ∏ (product) | 2‑3‑5‑6‑4‑5‑6 (same pattern as Σ) – context decides | ⠖⠶ | U+2816 U+2836 |
| √ (square‑root) | 3‑4‑5‑6 | ⠸ | U+2838 |
| ∫ (integral) | 2‑3‑5‑6‑3‑4‑5‑6 | ⠖⠸ | U+2816 U+2838 |
| ′ (prime, derivative) | 3 | ⠄ | U+2804 |
| ′′ (double‑prime) | 3‑3 | ⠄⠄ | U+2804 U+2804 |

---

## 5. Greek Letters (lower‑case & upper‑case)

Greek symbols are introduced by the **Greek indicator** ⠐ U+2810. The following table shows the indicator + letter pattern.

| Print | Dots (Greek cell + letter) | Braille Pattern | Unicode |
|-------|---------------------------|----------------|----------|
| α | 2‑5‑6 + 1 | ⠐⠁ | U+2810 U+2801 |
| β | 2‑5‑6 + 1‑2 | ⠐⠃ | U+2810 U+2803 |
| γ | 2‑5‑6 + 1‑4 | ⠐⠉ | U+2810 U+2809 |
| δ | 2‑5‑6 + 1‑4‑5 | ⠐⠙ | U+2810 U+2819 |
| ε | 2‑5‑6 + 1‑5 | ⠐⠑ | U+2810 U+2811 |
| ζ | 2‑5‑6 + 1‑2‑4 | ⠐⠋ | U+2810 U+280B |
| η | 2‑5‑6 + 1‑2‑4‑5 | ⠐⠛ | U+2810 U+281B |
| θ | 2‑5‑6 + 1‑2‑5 | ⠐⠓ | U+2810 U+2813 |
| ι | 2‑5‑6 + 2‑4 | ⠐⠊ | U+2810 U+280A |
| κ | 2‑5‑6 + 1‑3 | ⠐⠅ | U+2810 U+2805 |
| λ | 2‑5‑6 + 1‑2‑3 | ⠐⠇ | U+2810 U+2807 |
| μ | 2‑5‑6 + 1‑3‑4 | ⠐⠍ | U+2810 U+280D |
| ν | 2‑5‑6 + 1‑3‑4‑5 | ⠐⠝ | U+2810 U+281D |
| ξ | 2‑5‑6 + 1‑3‑5 | ⠐⠕ | U+2810 U+2815 |
| ο | 2‑5‑6 + 1‑2‑3‑4 | ⠐⠏ | U+2810 U+280F |
| π | 2‑5‑6 + 1‑2‑3‑4‑5 | ⠐⠟ | U+2810 U+281F |
| ρ | 2‑5‑6 + 1‑2‑3‑5 | ⠐⠗ | U+2810 U+2817 |
| σ | 2‑5‑6 + 2‑3‑4 | ⠐⠎ | U+2810 U+280E |
| τ | 2‑5‑6 + 2‑3‑4‑5 | ⠐⠞ | U+2810 U+281E |
| υ | 2‑5‑6 + 1‑3‑6 | ⠐⠥ | U+2810 U+2825 |
| φ | 2‑5‑6 + 1‑2‑3‑6 | ⠐⠧ | U+2810 U+2827 |
| χ | 2‑5‑6 + 2‑4‑5‑6 | ⠐⠺ | U+2810 U+283A |
| ψ | 2‑5‑6 + 1‑3‑4‑6 | ⠐⠭ | U+2810 U+282D |
| ω | 2‑5‑6 + 1‑3‑4‑5‑6 | ⠐⠽ | U+2810 U+283D |

**Upper‑case Greek letters** are written with the *capital indicator* ⠠ **after** the Greek indicator, i.e.:

```
α (lower)   → ⠐⠁
Α (upper)   → ⠐⠠⠁   (Greek indicator + capital indicator + letter)
```

---

## 6. Miscellaneous Symbols Frequently Used in Mathematics

| Print | Dots | Braille Pattern | Unicode |
|-------|------|----------------|----------|
| ∈ (element of) | 2‑5‑6 + 2‑3‑5‑6 | ⠲⠖ | U+2832 U+2816 |
| ∉ (not element) | 2‑5‑6 + 2‑3‑5‑6 + 2‑3‑5‑6 (prefix “not”) | ⠲⠖⠖ | U+2832 U+2816 U+2816 |
| ∅ (empty set) | 2‑5‑6 + 2‑4‑5‑6 | ⠲⠪ | U+2832 U+282A |
| ∈ (belongs to) – same as element of | 2‑5‑6 + 2‑3‑5‑6 | ⠲⠖ | U+2832 U+2816 |
| ∞ (infinity) | 2‑5‑6 + 2‑5‑6‑5‑4‑3‑2 | ⠲⠢ | U+2832 U+2822 |
| ⊂ (subset) | 2‑5‑6 + 1‑2‑5‑6 | ⠲⠖ | U+2832 U+2816 |
| ⊃ (superset) | 2‑5‑6 + 1‑2‑5‑6 + 2‑5‑6 | ⠲⠖⠲ | U+2832 U+2816 U+2832 |
| ⊆ (subset‑or‑equal) | 2‑5‑6 + 1‑2‑5‑6 + 4‑5‑6 | ⠲⠖⠶ | U+2832 U+2816 U+2836 |
| ⊇ (superset‑or‑equal) | 2‑5‑6 + 1‑2‑5‑6 + 4‑5‑6 + 2‑5‑6 | ⠲⠖⠶⠲ | U+2832 U+2816 U+2836 U+2832 |
| ∝ (proportional) | 2‑5‑6 + 2‑3‑5‑6 + 2‑3‑5‑6 | ⠲⠖⠖ | U+2832 U+2816 U+2816 |
| ≈ (approximately equal) | 2‑5‑6 + 2‑3‑5‑6 + 2‑3‑5‑6 | ⠲⠖⠖ | U+2832 U+2816 U+2816 |
| ∂ (partial differential) | 2‑5‑6 + 1‑2‑3‑4‑5 | ⠲⠟ | U+2832 U+281F |

*(Many of the “relation” symbols are built from a **prefix indicator** (⠲ U+2832, the “math‑letter indicator”) followed by a letter cell that represents the specific relation.)*

---

## 7. Quick Cheat‑Sheet

| Category | Example | Braille (Unicode) | Dots |
|----------|----------|-------------------|------|
| Capital A | **A** | ⠠⠁ | 6 + 1 |
| Number 7 | **7** | ⠼⠛ | 3‑4‑5‑6 + 1‑2‑4‑5 |
| Greek π | **π** | ⠐⠟ | 2‑5‑6 + 1‑2‑3‑4‑5 |
| Integral ∫ | **∫** | ⠖⠸ | 2‑3‑5‑6 + 3‑4‑5‑6 |
| Summation Σ | **Σ** | ⠖⠶ | 2‑3‑5‑6 + 4‑5‑6 |
| Equality = | **=** | ⠶ | 4‑5‑6 |
| Less‑or‑equal ≤ | **≤** | ⠣⠶ | 1‑2‑6 + 4‑5‑6 |
| Infinity ∞ | **∞** | ⠲⠢ | 2‑5‑6 + 2‑5‑6‑5‑4‑3‑2 |
| Prime (derivative) ′ | **′** | ⠄ | 3 |
| Fraction slash / | **/** | ⠌ | 3‑4 |

---

### Using the Table

1. **Copy‑paste** the Unicode column (the actual Braille characters) into any Unicode‑supporting document, or feed them to a Braille embosser.  
2. The **Dots** column tells you the tactile layout for a refreshable Braille display or manual embossing.  
3. Remember the **indicators** (Greek ⠐, capital ⠠, numeric ⠼, math‑letter ⠸) – they **always precede** the symbol they modify.  

Feel free to expand the list with additional Nemeth symbols (e.g., matrices, radicals, set‑theoretic symbols) – the same pattern of “indicator + cell(s)” applies throughout the code. Happy Brailling!