# 09 — Drawing canvas (Skia)

**Goal:** smooth drawing on the drawer's phone, mirrored live on the other phones.

## Scope
- `@shopify/react-native-skia` canvas + `react-native-gesture-handler` pan; strokes stored as point arrays in
  normalized 0–1 coordinates, so they fit any screen size.
- Tools: 8 marker colours, 3 brush sizes, eraser, undo, clear.
- Network: points batched every 50 ms and simplified (Ramer–Douglas–Peucker, ε ≈ 0.002) before sending; the
  receiving side appends and redraws.
- Read-only mode for viewers; stroke replay reused by the Draw & Pass reveal and the history.

## Acceptance criteria
- [ ] Drawing stays smooth on the emulator; a remote device sees the stroke within ~150 ms on LAN.
- [ ] Undo and clear reach every viewer.
