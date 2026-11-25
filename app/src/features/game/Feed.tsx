import { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Txt } from '../../components/ui/Txt';
import type { FeedEntry } from '../../stores/gameStore';
import { colors, ink } from '../../theme/tokens';
import { nameOf, type PlayerInfo } from './usePlayers';

/** Chat, "close" and "guessed it" notices of a Draw & Guess round, newest at the bottom. */
export function Feed({ feed, players }: { feed: FeedEntry[]; players: Map<string, PlayerInfo> }) {
  const list = useRef<FlatList<FeedEntry>>(null);

  return (
    <FlatList
      ref={list}
      data={feed}
      keyExtractor={(item) => String(item.id)}
      style={styles.list}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <FeedLine entry={item} players={players} />}
      // Keep the newest message in view.
      onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
      accessibilityLabel="Game messages"
    />
  );
}

/** The newest notice only, for the drawer (whose screen has no room for the whole feed). */
export function LatestNotice({
  feed,
  players,
}: {
  feed: FeedEntry[];
  players: Map<string, PlayerInfo>;
}) {
  const last = feed.at(-1);
  if (!last || last.event.kind === 'chat') return null;
  return (
    <Animated.View key={last.id} entering={FadeInDown}>
      <FeedLine entry={last} players={players} />
    </Animated.View>
  );
}

function FeedLine({ entry, players }: { entry: FeedEntry; players: Map<string, PlayerInfo> }) {
  const { event } = entry;
  switch (event.kind) {
    case 'chat':
      return (
        <Txt variant="body">
          <Txt variant="body" style={styles.bold}>
            {nameOf(players, event.playerId)}:
          </Txt>{' '}
          {event.text}
        </Txt>
      );
    case 'system':
      return (
        <Txt variant="caption" style={styles.system}>
          {event.text}
        </Txt>
      );
    case 'close':
      return (
        <Notice color={colors.yellow}>
          {event.text
            ? `"${event.text}" is so close!`
            : `${nameOf(players, event.playerId)} is close!`}
        </Notice>
      );
    case 'guessed':
      return (
        <Notice color={colors.lime} trailing={`+${event.points}`}>
          {`${nameOf(players, event.playerId)} guessed it!`}
        </Notice>
      );
  }
}

function Notice({
  color,
  children,
  trailing,
}: {
  color: string;
  children: string;
  trailing?: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      style={[styles.notice, { backgroundColor: color }]}
      accessibilityLiveRegion="polite"
    >
      <Txt variant="body" style={styles.flex}>
        {children}
      </Txt>
      {trailing && <Txt variant="number">{trailing}</Txt>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: 6, paddingVertical: 4 },
  bold: { textDecorationLine: 'underline' },
  system: { fontStyle: 'italic' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    boxShadow: `3px 3px 0px ${colors.ink}`,
    marginRight: 4,
  },
  flex: { flex: 1 },
});
