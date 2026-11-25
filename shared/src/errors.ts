/** Every error the server can answer with. The app maps each code to a human message. */
export const ERROR_CODES = [
  'INVALID_PAYLOAD',
  'ROOM_NOT_FOUND',
  'ROOM_FULL',
  'NICKNAME_TAKEN',
  'GAME_ALREADY_STARTED',
  'NOT_ENOUGH_PLAYERS',
  'NOT_HOST',
  'NOT_IN_ROOM',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_PAYLOAD: 'Something in that request was not valid.',
  ROOM_NOT_FOUND: 'No room with that code.',
  ROOM_FULL: 'This room is full.',
  NICKNAME_TAKEN: 'That nickname is taken in this room.',
  GAME_ALREADY_STARTED: 'This game has already started.',
  NOT_ENOUGH_PLAYERS: 'You need at least 3 players to start.',
  NOT_HOST: 'Only the host can do that.',
  NOT_IN_ROOM: 'You are not in a room.',
  INTERNAL_ERROR: 'Something went wrong on the server. Try again.',
};
