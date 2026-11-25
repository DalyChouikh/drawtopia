# 06 — App design system and screen skeleton

**Goal:** the neobrutal-sketchbook look as reusable components, and every screen reachable.

## Scope (`app/src/`)
- `theme/`: colour tokens (from `brand/BRAND.md`), spacing, radii, border width 3, shadow offset 4, font families.
- Fonts via `@expo-google-fonts` (Patrick Hand, Space Grotesk, Permanent Marker); splash held until loaded.
- Components: `PaperBackground` (graph-paper grid), `InkButton` (hard shadow, press-in animation with
  Reanimated, haptic tick), `InkCard`, `Tape`, `InkInput`, `Pill`, `Avatar`, `Toast`.
- Routes (expo-router): `index` (home), `profile`, `rooms` (browse), `room/[code]` (lobby), `game/[code]`,
  `results/[code]`, `history/index`, `history/[id]`, `settings`.
- App icon, adaptive icon and splash from `brand/final/export`.

## Acceptance criteria
- [ ] Every screen is reachable and Back works, on the Android emulator and the iPhone (Expo Go).
- [ ] Touch targets ≥ 48 dp; text contrast ≥ 4.5:1 on every fill.
