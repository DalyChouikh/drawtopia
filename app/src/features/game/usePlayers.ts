import type { Player } from '@drawtopia/shared';
import { useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useSessionStore } from '../../stores/sessionStore';

export type PlayerInfo = Pick<Player, 'id' | 'nickname' | 'color'> & { connected: boolean };

/**
 * Everyone in the game by id: current room members, plus players listed in the final result
 * (so a player who left still has a name on the podium).
 */
export function usePlayers(): Map<string, PlayerInfo> {
  const room = useSessionStore((s) => s.room);
  const result = useGameStore((s) => s.view?.result);

  return useMemo(() => {
    const map = new Map<string, PlayerInfo>();
    for (const p of result?.players ?? []) map.set(p.id, { ...p, connected: false });
    for (const p of room?.players ?? []) map.set(p.id, p);
    return map;
  }, [room, result]);
}

export const nameOf = (players: Map<string, PlayerInfo>, id: string) =>
  players.get(id)?.nickname ?? 'Someone';
