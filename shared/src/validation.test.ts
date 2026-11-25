import { describe, expect, it } from 'vitest';
import { STROKE_MAX_POINTS } from './constants';
import { CreateRoomPayloadSchema, JoinRoomPayloadSchema } from './protocol';
import { GuessSchema, NicknameSchema, StrokeSchema } from './validation';

describe('NicknameSchema', () => {
  it('accepts letters, digits and underscore, trimming spaces', () => {
    expect(NicknameSchema.parse('  Pixel_Rider7 ')).toBe('Pixel_Rider7');
    expect(NicknameSchema.parse('Amélie')).toBe('Amélie');
  });

  it('rejects empty, too short, too long and symbol nicknames', () => {
    expect(NicknameSchema.safeParse('').success).toBe(false);
    expect(NicknameSchema.safeParse('a').success).toBe(false);
    expect(NicknameSchema.safeParse('a'.repeat(17)).success).toBe(false);
    expect(NicknameSchema.safeParse('bad name!').success).toBe(false);
  });
});

describe('room payloads', () => {
  const profile = { nickname: 'Nova', color: '#3D7BFF' };

  it('parses a valid create-room payload', () => {
    const result = CreateRoomPayloadSchema.safeParse({
      profile,
      settings: { mode: 'draw-guess', visibility: 'private', roundDuration: 60, rounds: 2 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a round duration that is not offered', () => {
    const result = CreateRoomPayloadSchema.safeParse({
      profile,
      settings: { mode: 'draw-guess', visibility: 'public', roundDuration: 45, rounds: 2 },
    });
    expect(result.success).toBe(false);
  });

  it('normalizes the room code to upper case and rejects ambiguous characters', () => {
    expect(JoinRoomPayloadSchema.parse({ code: 'abcd', profile }).code).toBe('ABCD');
    expect(JoinRoomPayloadSchema.safeParse({ code: 'AB0D', profile }).success).toBe(false);
  });
});

describe('StrokeSchema', () => {
  const base = { id: 's1', color: '#1A1A1A', size: 10 };

  it('accepts normalized x,y pairs', () => {
    expect(StrokeSchema.safeParse({ ...base, points: [0.1, 0.2, 0.3, 0.4] }).success).toBe(true);
  });

  it('rejects an oversized batch, odd point counts and out-of-range coordinates', () => {
    const tooMany = Array.from({ length: STROKE_MAX_POINTS * 2 + 2 }, () => 0.5);
    expect(StrokeSchema.safeParse({ ...base, points: tooMany }).success).toBe(false);
    expect(StrokeSchema.safeParse({ ...base, points: [0.1, 0.2, 0.3] }).success).toBe(false);
    expect(StrokeSchema.safeParse({ ...base, points: [1.5, 0.2] }).success).toBe(false);
  });
});

describe('GuessSchema', () => {
  it('rejects empty and whitespace-only guesses', () => {
    expect(GuessSchema.safeParse('').success).toBe(false);
    expect(GuessSchema.safeParse('   ').success).toBe(false);
  });
});
