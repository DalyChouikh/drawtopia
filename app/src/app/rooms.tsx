import type { PublicRoomSummary } from '@drawtopia/shared';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { InkButton } from '../components/ui/InkButton';
import { InkCard } from '../components/ui/InkCard';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Txt';
import { GAME_MODES } from '../features/rooms/modes';
import { errorMessage } from '../services/gameClient';
import { haptics } from '../services/haptics';
import { joinRoom, listPublicRooms } from '../services/roomsApi';
import { showToast } from '../stores/toastStore';
import { colors } from '../theme/tokens';

/** Public rooms waiting for players. Pull down to refresh. */
export default function BrowseRoomsScreen() {
  const [rooms, setRooms] = useState<PublicRoomSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [joiningCode, setJoiningCode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listPublicRooms();
    setLoading(false);
    if (result.ok) setRooms(result.value);
    else showToast(errorMessage(result.error), 'error');
  }, []);

  // Reload every time the screen comes into view.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const join = async (code: string) => {
    setJoiningCode(code);
    const result = await joinRoom(code);
    setJoiningCode(null);
    if (result.ok) {
      haptics.success();
      router.replace(`/room/${code}`);
    } else {
      haptics.error();
      showToast(errorMessage(result.error), 'error');
      void refresh(); // the room may have filled up or started
    }
  };

  return (
    <Screen title="Public rooms" scroll={false}>
      <FlatList
        data={rooms}
        keyExtractor={(room) => room.code}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListEmptyComponent={
          loading ? undefined : (
            <InkCard tilt={-1}>
              <Txt variant="heading">No open rooms right now</Txt>
              <Txt variant="body">Create a public room and others can join you from here.</Txt>
              <View style={styles.emptyAction}>
                <InkButton
                  label="Create room"
                  color="blue"
                  onPress={() => router.replace('/create')}
                />
              </View>
            </InkCard>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60)}>
            <Pressable
              onPress={() => join(item.code)}
              disabled={joiningCode !== null}
              accessibilityRole="button"
              accessibilityLabel={`Join ${item.hostNickname}'s ${GAME_MODES[item.mode].label} room, ${item.playerCount} of ${item.maxPlayers} players`}
            >
              <InkCard color={joiningCode === item.code ? 'yellow' : 'white'}>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Txt variant="heading">{item.hostNickname}&apos;s room</Txt>
                    <Txt variant="caption" color={colors.ink}>
                      {GAME_MODES[item.mode].label} · code {item.code}
                    </Txt>
                  </View>
                  <Txt variant="number">
                    {item.playerCount}/{item.maxPlayers}
                  </Txt>
                </View>
              </InkCard>
            </Pressable>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  emptyAction: { marginTop: 12 },
});
