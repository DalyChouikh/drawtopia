# 13 — Motion and polish

**Goal:** make it feel alive without hurting clarity.

## Scope
- Reanimated: notices pop in, the timer pulses under 10 s, scores count up, lobby avatars bounce in, buttons
  press into their shadow.
- Confetti burst on a correct guess (Skia particles); `expo-haptics` on press, correct guess and time-up.
- Empty states (no public rooms, empty history) with doodle illustrations.
- Respect the system "reduce motion" setting.

## Acceptance criteria
- [ ] Rounds stay smooth on the emulator; with reduce motion on, bounces and confetti are off.
