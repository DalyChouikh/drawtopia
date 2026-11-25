# DrawTopia — brand guide

## The mark

**D-bubble**: the "D" of DrawTopia has a speech bubble as its inner hole. Drawing and guessing in one letter.
Style: neobrutalism + sketchbook — thick ink outline, hard offset shadow (down-right), flat marker colours.

| File | Use |
|---|---|
| `final/symbol-colour.svg` | Default symbol (yellow D, paper bubble) |
| `final/symbol-mono.svg` | One-colour (outline, real holes) — print, stamps, single-ink |
| `final/symbol-small.svg` | ≤ 32 px (favicon, notification icon): solid D, bubble cut out, no shadow |
| `final/wordmark-colour.svg` | Wordmark only ("Draw" ink + "Topia" on a lime tag) |
| `final/lockup-horizontal-colour.svg` | Symbol + wordmark |
| `final/app-icon.svg` | iOS / store icon on blue |
| `final/adaptive-foreground.svg` | Android adaptive icon foreground (inside the 66 % safe zone) |
| `final/splash-icon.svg` | Splash screen symbol |

PNG exports are in `final/export/`.

## Colours — "marker brights"

| Token | HEX | Role |
|---|---|---|
| `ink` | `#1A1A1A` | Outlines, shadows, text |
| `paper` | `#FBF7EE` | Backgrounds, bubble fill |
| `yellow` | `#FFD23F` | The D, highlights, timers |
| `blue` | `#3D7BFF` | App-icon background, primary actions |
| `red` | `#FF5A4E` | Main CTA, warnings |
| `lime` | `#B6F03C` | Success, "guessed it!", wordmark tag |

Text on any fill is always `ink` (white only on `blue`).

## Type

- **Permanent Marker** — logo wordmark only (outlined to paths in the logo files).
- **Patrick Hand** — buttons, headings, feed messages.
- **Space Grotesk** — numbers, timers, scores, inputs (legibility).

All three are SIL Open Font License / Apache 2.0 (Google Fonts), free for use in apps and logos.

## Rules

- **Clear space**: keep at least the bubble's width (≈ 40 % of the D's height) empty around the mark.
- **Minimum size**: colour symbol 32 px; below that use `symbol-small`. Lockup minimum 120 px wide.
- **Shadow** always falls down-right, same offset as the outline width ×1. Never soft or blurred.
- **Don't**: recolour the D outside the palette, add gradients or soft shadows, rotate the symbol,
  stretch it, or set "DrawTopia" in another font next to the mark.
