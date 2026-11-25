import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';
import { ChainReveal } from '../../features/game/ChainReveal';
import { DrawGuessBoard } from '../../features/game/DrawGuessBoard';
import { DrawPassBoard } from '../../features/game/DrawPassBoard';
import { Podium } from '../../features/game/Podium';
import { usePlayers } from '../../features/game/usePlayers';
import { GAME_MODES } from '../../features/rooms/modes';
import { syncGame } from '../../services/gameApi';
import { leaveRoom } from '../../services/roomsApi';
import { useGameStore } from '../../stores/gameStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/tokens';

/** The game itself: Draw & Guess or Draw & Pass, then the results. */
export default function GameScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const view = useGameStore((s) => s.view);
  const myId = useSessionStore((s) => s.playerId);
  const players = usePlayers();

  // The first view may have been sent before this screen mounted: ask for it.
  useEffect(() => {
    void syncGame();
  }, []);

  const leave = async () => {
    await leaveRoom();
    useGameStore.getState().reset();
    router.replace('/');
  };

  const backToLobby = () => {
    useGameStore.getState().reset();
    router.replace(`/room/${code}`);
  };

  if (!view) {
    return (
      <Screen title="Game" onBack={leave}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.ink} />
          <Txt variant="heading">Getting the game ready…</Txt>
        </View>
      </Screen>
    );
  }

  const finished = view.phase === 'finished';
  const title = finished ? 'Results' : GAME_MODES[view.mode].label;

  if (finished) {
    return (
      <Screen
        title={title}
        onBack={backToLobby}
        footer={<InkButton label="Back to lobby" color="blue" size="lg" onPress={backToLobby} />}
      >
        {view.mode === 'draw-guess' && view.result ? (
          <Podium result={view.result} myId={myId} />
        ) : view.mode === 'draw-pass' && view.chains ? (
          <ChainReveal chains={view.chains} players={players} />
        ) : (
          <InkCard>
            <Txt variant="heading">The game ended early.</Txt>
          </InkCard>
        )}
      </Screen>
    );
  }

  return (
    <Screen title={title} onBack={leave} scroll={view.mode === 'draw-pass'}>
      {view.mode === 'draw-guess' ? (
        <DrawGuessBoard view={view} myId={myId} players={players} />
      ) : (
        <DrawPassBoard view={view} myId={myId} players={players} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
