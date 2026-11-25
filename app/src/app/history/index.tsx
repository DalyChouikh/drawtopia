import { type GameMode, rankPlayers } from '@drawtopia/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';
import { formatDate } from '../../features/history/formatDate';
import { GAME_MODES } from '../../features/rooms/modes';
import { filterGames, useHistoryStore } from '../../stores/historyStore';
import { colors } from '../../theme/tokens';

const FILTERS: { label: string; value: GameMode | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draw & Guess', value: 'draw-guess' },
  { label: 'Draw & Pass', value: 'draw-pass' },
];

/** Fiche action 4: finished games saved on this phone, readable offline. */
export default function HistoryScreen() {
  const games = useHistoryStore((s) => s.games);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const visible = useMemo(() => filterGames(games, filter), [games, filter]);

  return (
    <Screen title="History" scroll={false}>
      <View style={styles.filters} accessibilityRole="radiogroup">
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </View>
      <FlatList
        data={visible}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <InkCard tilt={1}>
            <Txt variant="heading">{games.length ? 'No games in this mode' : 'No games yet'}</Txt>
            <Txt variant="body">
              Finish a game and its scores and drawings are kept here, even offline.
            </Txt>
            {games.length === 0 && (
              <View style={styles.emptyAction}>
                <InkButton label="Play now" color="red" onPress={() => router.replace('/')} />
              </View>
            )}
          </InkCard>
        }
        renderItem={({ item, index }) => {
          const winner = item.mode === 'draw-guess' ? rankPlayers(item.players)[0] : undefined;
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60)}>
              <Pressable
                onPress={() => router.push({ pathname: '/history/[id]', params: { id: item.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${GAME_MODES[item.mode].label}, ${formatDate(item.finishedAt)}, ${item.players.length} players`}
              >
                <InkCard color={item.mode === 'draw-guess' ? 'white' : 'paper'}>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Txt variant="heading">{GAME_MODES[item.mode].label}</Txt>
                      <Txt variant="caption" color={colors.ink}>
                        {formatDate(item.finishedAt)} · {item.players.length} players
                        {winner ? ` · ${winner.nickname} won` : ''}
                      </Txt>
                    </View>
                    <View style={styles.avatars}>
                      {item.players.slice(0, 4).map((p, i) => (
                        <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -12 }}>
                          <Avatar nickname={p.nickname} color={p.color} size={32} />
                        </View>
                      ))}
                    </View>
                  </View>
                </InkCard>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  avatars: { flexDirection: 'row' },
  emptyAction: { marginTop: 12 },
});
