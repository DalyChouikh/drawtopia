/**
 * Game constants shared by the app and the server.
 * Player limits come from the validated project proposal (3 to 8 players per room).
 */
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 16;
/** Letters (any alphabet), digits and underscore. */
export const NICKNAME_PATTERN = /^[\p{L}\p{N}_]+$/u;

export const GUESS_MAX_LENGTH = 40;

/** Round (Draw & Guess) or step (Draw & Pass) durations the host can pick, in seconds. */
export const ROUND_DURATIONS = [30, 60, 90] as const;
export const DEFAULT_ROUND_DURATION = 60;

export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 5;
export const DEFAULT_ROUNDS = 2;

export const ROOM_CODE_LENGTH = 4;
/** No 0/O or 1/I/L so codes can be read aloud and typed without confusion. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** How long a disconnected player keeps their seat before being removed. */
export const RECONNECT_GRACE_MS = 60_000;

/** Marker colours players can pick for their avatar (one per possible player). */
export const AVATAR_COLORS = [
  '#FF5A4E',
  '#3D7BFF',
  '#B6F03C',
  '#FFD23F',
  '#FF8AD8',
  '#FF9F1C',
  '#9B5DE5',
  '#2EC4B6',
] as const;

/** Drawing limits: keep network messages small and bounded. */
export const STROKE_MAX_POINTS = 512;
export const BRUSH_SIZES = [4, 10, 22] as const;
