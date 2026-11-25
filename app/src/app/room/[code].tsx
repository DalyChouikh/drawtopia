import { MIN_PLAYERS, type Player, type RoomSettings } from '@drawtopia/shared';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Tape } from '../../components/ui/Tape';
import { Txt } from '../../components/ui/Txt';
import { SettingsPicker } from '../../features/rooms/SettingsPicker';
import { errorMessage } from '../../services/gameClient';
import { haptics } from '../../services/haptics';
import { leaveRoom, startGame, updateRoomSettings } from '../../services/roomsApi';
import { useSessionStore } from '../../stores/sessionStore';
import { showToast } from '../../stores/toastStore';
import { colors, fonts, ink } from '../../theme/tokens';

/** Lobby: who is here, the room code to share, host settings and the Start button. */
export default function LobbyScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const room = useSessionStore((s) => (s.room?.code === code ? s.room : null));
  const playerId = useSessionStore((s) => s.playerId);
  const [starting, setStarting] = useState(false);
  /** Set when we navigate to the game, so leaving this screen does not leave the room. */
  const enteringGame = useRef(false);

  // Leaving the lobby (back button, swipe, Android back) unmounts it: leave the room,
  // unless we are moving on to the game screen.
  useEffect(
    () => () => {
      if (!enteringGame.current) void leaveRoom();
    },
    [],
  );

  // Everyone moves to the game screen when the server says the game started.
  useEffect(() => {
    if (room?.status === 'playing') {
      enteringGame.current = true;
      haptics.success();
      router.replace(`/game/${room.code}`);
    }
  }, [room?.status, room?.code]);

  if (!room) {
    return (
      <Screen title={`Room ${code}`}>
        <InkCard>
          <Txt variant="heading">You are not in this room</Txt>
          <Txt variant="body">It may have closed. Join again with its code.</Txt>
        </InkCard>
        <InkButton
          label="Join a room"
          onPress={() => router.replace({ pathname: '/join', params: { code } })}
        />
      </Screen>
    );
  }

  const isHost = room.hostId === playerId;
  const onlineCount = room.players.filter((p) => p.connected).length;
  const missing = Math.max(0, MIN_PLAYERS - onlineCount);

  const changeSettings = async (patch: Partial<RoomSettings>) => {
    const result = await updateRoomSettings(patch);
    if (!result.ok) showToast(errorMessage(result.error), 'error');
  };

  const start = async () => {
    setStarting(true);
    const result = await startGame();
    setStarting(false);
    if (!result.ok) {
      haptics.error();
      showToast(errorMessage(result.error), 'error');
    }
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(room.code);
    haptics.tap();
    showToast(`Code ${room.code} copied`, 'success');
  };

  return (
    <Screen
      title="Lobby"
      onBack={() => router.back()}
      footer={
        isHost ? (
          <InkButton
            label={
              missing > 0 ? `Need ${missing} more player${missing > 1 ? 's' : ''}` : 'Start game'
            }
            color="red"
            size="lg"
            disabled={missing > 0}
            loading={starting}
            onPress={start}
            accessibilityHint={
              missing > 0 ? `A game needs at least ${MIN_PLAYERS} players` : undefined
            }
          />
        ) : (
          <Txt variant="heading" align="center">
            Waiting for the host to start…
          </Txt>
        )
      }
    >
      <Pressable
        onPress={copyCode}
        accessibilityRole="button"
        accessibilityLabel={`Room code ${room.code}. Copy`}
      >
        <InkCard color="yellow" tilt={-1.5}>
          <Tape style={{ right: 28 }} rotate={5} />
          <Txt variant="caption" color={colors.ink}>
            {room.settings.visibility === 'private'
              ? 'Private room · share this code'
              : 'Public room · code'}
          </Txt>
          <View style={styles.codeRow}>
            <Txt style={styles.code}>{room.code}</Txt>
            <Txt variant="label">COPY</Txt>
          </View>
        </InkCard>
      </Pressable>

      <InkCard>
        <Txt variant="label">Players {room.players.length}/8</Txt>
        <View style={styles.players}>
          {room.players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isHost={player.id === room.hostId}
              isMe={player.id === playerId}
            />
          ))}
        </View>
      </InkCard>

      <InkCard>
        <SettingsPicker
          value={room.settings}
          editable={isHost}
          showVisibility={false}
          onChange={changeSettings}
        />
        {!isHost && (
          <Txt variant="caption" style={styles.hostNote}>
            Only the host can change the settings.
          </Txt>
        )}
      </InkCard>
    </Screen>
  );
}

function PlayerRow({ player, isHost, isMe }: { player: Player; isHost: boolean; isMe: boolean }) {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      exiting={FadeOut}
      layout={LinearTransition}
      style={styles.playerRow}
    >
      <Avatar nickname={player.nickname} color={player.color} dimmed={!player.connected} />
      <Txt variant="heading" style={styles.flex} numberOfLines={1}>
        {player.nickname}
        {isMe ? ' (you)' : ''}
      </Txt>
      {!player.connected && <Txt variant="caption">offline</Txt>}
      {isHost && (
        <View style={styles.hostBadge}>
          <Txt variant="label">HOST</Txt>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: {
    fontFamily: fonts.sansBold,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: 10,
    color: colors.ink,
  },
  players: { gap: 10, marginTop: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
  },
  hostNote: { marginTop: 8 },
});
