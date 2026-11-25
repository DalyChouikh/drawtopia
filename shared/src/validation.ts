/**
 * Validation schemas (zod) for every piece of data that crosses the network.
 * The server parses each incoming payload with these; the app reuses them for form errors.
 */
import { z } from 'zod';
import {
  AVATAR_COLORS,
  BRUSH_SIZES,
  GUESS_MAX_LENGTH,
  MAX_ROUNDS,
  MIN_ROUNDS,
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  NICKNAME_PATTERN,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  ROUND_DURATIONS,
  STROKE_MAX_POINTS,
} from './constants';

export const NicknameSchema = z
  .string()
  .trim()
  .min(NICKNAME_MIN_LENGTH, `At least ${NICKNAME_MIN_LENGTH} characters`)
  .max(NICKNAME_MAX_LENGTH, `At most ${NICKNAME_MAX_LENGTH} characters`)
  .regex(NICKNAME_PATTERN, 'Only letters, numbers and _');

export const AvatarColorSchema = z.enum(AVATAR_COLORS);

export const PlayerProfileSchema = z.object({
  nickname: NicknameSchema,
  color: AvatarColorSchema,
});

export const RoomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(ROOM_CODE_LENGTH, `Room codes have ${ROOM_CODE_LENGTH} characters`)
  .refine((code) => [...code].every((c) => ROOM_CODE_ALPHABET.includes(c)), 'Invalid room code');

export const RoomSettingsSchema = z.object({
  mode: z.enum(['draw-guess', 'draw-pass']),
  visibility: z.enum(['public', 'private']),
  roundDuration: z.literal(ROUND_DURATIONS),
  rounds: z.number().int().min(MIN_ROUNDS).max(MAX_ROUNDS),
});

export const GuessSchema = z
  .string()
  .trim()
  .min(1, 'Type a guess first')
  .max(GUESS_MAX_LENGTH, `At most ${GUESS_MAX_LENGTH} characters`);

const coordinate = z.number().min(0).max(1);

export const StrokeSchema = z.object({
  id: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  size: z.literal(BRUSH_SIZES),
  points: z
    .array(coordinate)
    .max(STROKE_MAX_POINTS * 2, 'Stroke batch too large')
    .refine((p) => p.length % 2 === 0, 'Points come in x,y pairs'),
});

/** Turns a zod error into the first human-readable message, for inline form errors. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid value';
}
