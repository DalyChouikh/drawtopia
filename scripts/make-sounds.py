"""Generates DrawTopia's sound effects and music loop (original, synthesized: no third-party audio).

Run from the repo root:  python scripts/make-sounds.py
Writes 16-bit mono WAV files to app/assets/sounds/. Standard library only.
"""

import math
import random
import struct
import wave
from pathlib import Path

RATE = 22050
OUT = Path(__file__).resolve().parent.parent / "app" / "assets" / "sounds"

NOTE_INDEX = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def freq(note: str) -> float:
    """'C5', 'F#4', 'Bb3' -> Hz (A4 = 440)."""
    name, octave = note[:-1], int(note[-1])
    semitone = NOTE_INDEX[name[0]] + name[1:].count("#") - name[1:].count("b")
    midi = 12 * (octave + 1) + semitone
    return 440.0 * 2 ** ((midi - 69) / 12)


# --- oscillators (phase in cycles) -------------------------------------------------------


def square(phase: float, duty: float = 0.5) -> float:
    return 1.0 if (phase % 1.0) < duty else -1.0


def triangle(phase: float) -> float:
    p = phase % 1.0
    return 4 * p - 1 if p < 0.5 else 3 - 4 * p


def sine(phase: float) -> float:
    return math.sin(2 * math.pi * phase)


def envelope(i: int, n: int, attack: float = 0.005, release: float = 0.04) -> float:
    """Linear attack, exponential-ish decay to exactly 0 at the end (no clicks)."""
    t = i / RATE
    total = n / RATE
    a = min(1.0, t / attack) if attack > 0 else 1.0
    r = min(1.0, (total - t) / release) if release > 0 else 1.0
    return max(0.0, a * r)


def tone(note_or_hz, dur: float, wave_fn=square, vol: float = 0.5, slide_to=None, **env):
    """One note; optional pitch slide to `slide_to` (Hz or note)."""
    f0 = freq(note_or_hz) if isinstance(note_or_hz, str) else note_or_hz
    f1 = f0 if slide_to is None else (freq(slide_to) if isinstance(slide_to, str) else slide_to)
    n = int(dur * RATE)
    out, phase = [], 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n)
        phase += f / RATE
        out.append(wave_fn(phase) * vol * envelope(i, n, **env))
    return out


def silence(dur: float):
    return [0.0] * int(dur * RATE)


def noise(dur: float, vol: float = 0.3, release: float = 0.03, seed: int = 1):
    rnd = random.Random(seed)
    n = int(dur * RATE)
    return [(rnd.random() * 2 - 1) * vol * envelope(i, n, 0.001, release) for i in range(n)]


def concat(*parts):
    out = []
    for p in parts:
        out.extend(p)
    return out


def mix_at(buf, samples, start: int):
    end = start + len(samples)
    if end > len(buf):
        buf.extend([0.0] * (end - len(buf)))
    for i, s in enumerate(samples):
        buf[start + i] += s


def save(name: str, samples, peak: float = 0.9):
    top = max(1e-9, max(abs(s) for s in samples))
    scale = min(1.0, peak / top)
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(s * scale * 32767)) for s in samples))
    print(f"{name}.wav  {len(samples) / RATE:.2f}s")


# --- sound effects -----------------------------------------------------------------------


def sfx():
    # Button tap: short "pop" (quick downward sine blip).
    save("tap", tone(900, 0.05, sine, 0.6, slide_to=500, attack=0.001, release=0.03), 0.6)

    # My correct guess: bright rising arpeggio.
    save(
        "correct",
        concat(*(tone(n, 0.08, lambda p: square(p, 0.25), 0.35) for n in ("C5", "E5", "G5")),
               tone("C6", 0.22, lambda p: square(p, 0.25), 0.35, release=0.15)),
    )

    # Someone else guessed it: soft two-note ding.
    save("ding", concat(tone("G5", 0.07, triangle, 0.6), tone("D6", 0.18, triangle, 0.6, release=0.14)), 0.6)

    # Close guess: wobbly "ooh" (two quick alternating notes).
    save(
        "close",
        concat(tone("E5", 0.07, triangle, 0.6), tone("F5", 0.07, triangle, 0.6),
               tone("E5", 0.07, triangle, 0.6), tone("F5", 0.12, triangle, 0.6, release=0.08)),
        0.6,
    )

    # Timer tick (last seconds): tiny woodblock.
    save("tick", tone(1400, 0.035, sine, 0.5, slide_to=1100, attack=0.001, release=0.025), 0.5)

    # A turn/step starts: quick upward sweep + note.
    save(
        "start",
        concat(tone("C4", 0.12, lambda p: square(p, 0.5), 0.3, slide_to="C5", release=0.02),
               tone("G5", 0.16, lambda p: square(p, 0.25), 0.3, release=0.12)),
        0.7,
    )

    # Word revealed / time's up: descending three notes.
    save(
        "reveal",
        concat(*(tone(n, 0.1, triangle, 0.6) for n in ("G5", "E5")),
               tone("C5", 0.25, triangle, 0.6, release=0.2)),
        0.7,
    )

    # Draw & Pass entry sent: "whoosh" up.
    save("sent", concat(tone(300, 0.14, sine, 0.5, slide_to=1200, release=0.05)), 0.6)

    # Game over: little fanfare.
    lead = lambda p: square(p, 0.25)  # noqa: E731
    fanfare = concat(
        tone("G4", 0.11, lead, 0.3), tone("C5", 0.11, lead, 0.3), tone("E5", 0.11, lead, 0.3),
        tone("G5", 0.22, lead, 0.3), tone("E5", 0.11, lead, 0.3),
        tone("G5", 0.5, lead, 0.3, release=0.35),
    )
    bass = concat(tone("C3", 0.44, triangle, 0.5), tone("G2", 0.33, triangle, 0.5),
                  tone("C3", 0.5, triangle, 0.5, release=0.35))
    buf = list(fanfare)
    mix_at(buf, bass, 0)
    save("gameover", buf, 0.8)

    # Error (refused action): low buzz.
    save("error", concat(tone(220, 0.09, lambda p: square(p, 0.5), 0.3),
                         tone(165, 0.16, lambda p: square(p, 0.5), 0.3, release=0.1)), 0.5)


# --- music loop --------------------------------------------------------------------------

BPM = 112
BEAT = 60 / BPM
EIGHTH = BEAT / 2


def music():
    """8 bars of 4/4 in C major (C - Am - F - G, twice), loops seamlessly."""
    chords = [("C3", "G3"), ("A2", "E3"), ("F2", "C3"), ("G2", "D3")] * 2
    # Lead melody, one entry per eighth note (None = rest), 8 per bar.
    melody = [
        "E5", None, "G5", "E5", "C5", None, "D5", "E5",
        "C5", None, "E5", "C5", "A4", None, "C5", None,
        "F5", None, "A5", "F5", "C5", None, "D5", "F5",
        "D5", "E5", "F5", None, "G5", None, "B4", None,
        "E5", None, "G5", "E5", "C5", None, "D5", "E5",
        "A5", None, "G5", "E5", "C5", None, "E5", None,
        "F5", "E5", "D5", "C5", "A4", None, "C5", "D5",
        "D5", None, "B4", None, "C5", None, None, None,
    ]
    bar_len = int(4 * BEAT * RATE)
    total = bar_len * len(chords)
    buf = [0.0] * total
    eighth = int(EIGHTH * RATE)

    lead = lambda p: square(p, 0.25)  # noqa: E731
    for i, note in enumerate(melody):
        if note:
            mix_at(buf, tone(note, EIGHTH * 0.9, lead, 0.13, release=0.05), i * eighth)

    for bar, (root, fifth) in enumerate(chords):
        start = bar * bar_len
        # Bass: root - fifth - root - fifth on quarter notes.
        for beat, n in enumerate((root, fifth, root, fifth)):
            mix_at(buf, tone(n, BEAT * 0.85, triangle, 0.32, release=0.06), start + int(beat * BEAT * RATE))
        # Hats on every eighth, a slightly louder one on the off-beats.
        for e in range(8):
            mix_at(buf, noise(0.025, 0.05 if e % 2 == 0 else 0.08, 0.02, seed=bar * 8 + e),
                   start + e * eighth)

    save("music", buf[:total], 0.7)


if __name__ == "__main__":
    sfx()
    music()
