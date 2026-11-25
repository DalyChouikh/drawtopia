import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert } from 'react-native';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';
import { ChainReveal } from '../../features/game/ChainReveal';
import { Podium } from '../../features/game/Podium';
import type { PlayerInfo } from '../../features/game/usePlayers';
import { formatDate } from '../../features/history/formatDate';
import { GAME_MODES } from '../../features/rooms/modes';
import { haptics } from '../../services/haptics';
import { useHistoryStore } from '../../stores/historyStore';
import { useSessionStore } from '../../stores/sessionStore';
import { showToast } from '../../stores/toastStore';

/** One saved game: the podium or the chains, and a way to delete it. */
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = useHistoryStore((s) => s.games.find((g) => g.id === id));
  const removeGame = useHistoryStore((s) => s.removeGame);
  const myId = useSessionStore((s) => s.playerId);

  const players = useMemo(
    () =>
      new Map<string, PlayerInfo>(
        (game?.players ?? []).map((p) => [p.id, { ...p, connected: true }]),
      ),
    [game],
  );

  if (!game) {
    return (
      <Screen title="Game">
        <InkCard>
          <Txt variant="heading">This game is no longer in your history.</Txt>
        </InkCard>
      </Screen>
    );
  }

  const confirmDelete = () =>
    Alert.alert('Delete this game?', 'It will be removed from this phone for good.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeGame(game.id);
          haptics.success();
          showToast('Game deleted', 'success');
          router.back();
        },
      },
    ]);

  return (
    <Screen
      title={GAME_MODES[game.mode].label}
      footer={<InkButton label="Delete from history" onPress={confirmDelete} />}
    >
      <Txt variant="caption" align="center">
        {formatDate(game.finishedAt)}
      </Txt>
      {game.mode === 'draw-guess' ? (
        <Podium result={game} myId={myId} />
      ) : (
        <ChainReveal chains={game.chains ?? []} players={players} />
      )}
    </Screen>
  );
}
