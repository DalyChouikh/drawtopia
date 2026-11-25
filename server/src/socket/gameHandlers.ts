import {
  ChooseWordPayloadSchema,
  GuessPayloadSchema,
  PassSubmitPayloadSchema,
  type Result,
  StrokeSchema,
  err,
  ok,
} from '@drawtopia/shared';
import { DrawGuessGame } from '../game/DrawGuessGame';
import { DrawPassGame } from '../game/DrawPassGame';
import type { AnyGame, GameManager } from '../game/GameManager';
import { parse, respond } from './respond';
import type { GameSocket } from './types';

/** In-game events: sync, Draw & Guess (word, guesses, strokes) and Draw & Pass (submissions). */
export function registerGameHandlers(socket: GameSocket, games: GameManager): void {
  /** The player's id and their room's game, or an error result. */
  const context = (): Result<{ playerId: string; roomCode: string; game: AnyGame }> => {
    const { playerId, roomCode } = socket.data;
    const game = games.get(roomCode);
    if (!playerId || !roomCode) return err('NOT_IN_ROOM');
    if (!game) return err('NO_GAME');
    return ok({ playerId, roomCode, game });
  };

  socket.on('game:sync', (ack) =>
    respond(ack, () => {
      const ctx = context();
      return ctx.ok ? ok(ctx.value.game.viewFor(ctx.value.playerId)) : ctx;
    }),
  );

  socket.on('game:choose-word', (payload, ack) =>
    respond(ack, () => {
      const input = parse(ChooseWordPayloadSchema, payload);
      const ctx = context();
      if (!input.ok) return input;
      if (!ctx.ok) return ctx;
      if (!(ctx.value.game instanceof DrawGuessGame)) return err('NOT_ALLOWED');
      return ctx.value.game.chooseWord(ctx.value.playerId, input.value.word);
    }),
  );

  socket.on('game:guess', (payload, ack) =>
    respond(ack, () => {
      const input = parse(GuessPayloadSchema, payload);
      const ctx = context();
      if (!input.ok) return input;
      if (!ctx.ok) return ctx;
      if (!(ctx.value.game instanceof DrawGuessGame)) return err('NOT_ALLOWED');
      return ctx.value.game.guess(ctx.value.playerId, input.value.text);
    }),
  );

  socket.on('pass:submit', (payload, ack) =>
    respond(ack, () => {
      const input = parse(PassSubmitPayloadSchema, payload);
      const ctx = context();
      if (!input.ok) return input;
      if (!ctx.ok) return ctx;
      if (!(ctx.value.game instanceof DrawPassGame)) return err('NOT_ALLOWED');
      return ctx.value.game.submit(ctx.value.playerId, input.value);
    }),
  );

  // Drawing is fire-and-forget: invalid strokes are dropped silently, valid ones relayed.
  socket.on('draw:stroke', (payload) => {
    const stroke = StrokeSchema.safeParse(payload);
    const ctx = context();
    if (!stroke.success || !ctx.ok || !(ctx.value.game instanceof DrawGuessGame)) return;
    if (ctx.value.game.addStroke(ctx.value.playerId, stroke.data)) {
      socket.to(ctx.value.roomCode).emit('draw:stroke', stroke.data);
    }
  });

  socket.on('draw:undo', () => {
    const ctx = context();
    if (!ctx.ok || !(ctx.value.game instanceof DrawGuessGame)) return;
    if (ctx.value.game.undo(ctx.value.playerId)) socket.to(ctx.value.roomCode).emit('draw:undo');
  });

  socket.on('draw:clear', () => {
    const ctx = context();
    if (!ctx.ok || !(ctx.value.game instanceof DrawGuessGame)) return;
    if (ctx.value.game.clear(ctx.value.playerId)) socket.to(ctx.value.roomCode).emit('draw:clear');
  });
}
