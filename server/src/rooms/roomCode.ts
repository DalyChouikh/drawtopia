import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, type Rng } from '@drawtopia/shared';

const MAX_ATTEMPTS = 100;

/**
 * Generates a room code that is not in use yet.
 * 31^4 ≈ 923 000 possible codes, so a collision retry is rare.
 */
export function generateRoomCode(rng: Rng, isTaken: (code: string) => boolean): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += ROOM_CODE_ALPHABET[Math.floor(rng() * ROOM_CODE_ALPHABET.length)];
    }
    if (!isTaken(code)) return code;
  }
  throw new Error('Could not generate a free room code');
}
