import type { ChainEntry, PassChain } from '@drawtopia/shared';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { InkCard } from '../../components/ui/InkCard';
import { Txt } from '../../components/ui/Txt';
import { colors } from '../../theme/tokens';
import { type Brush, DrawingCanvas } from '../drawing/DrawingCanvas';
import { nameOf, type PlayerInfo } from './usePlayers';

const ENTRY_DELAY_MS = 700;
const NO_BRUSH: Brush = { color: colors.ink, size: 10 };

/**
 * End of Draw & Pass: pick a chain and watch it unfold entry by entry,
 * from the first sentence to the last guess.
 */
export function ChainReveal({
  chains,
  players,
}: {
  chains: PassChain[];
  players: Map<string, PlayerInfo>;
}) {
  const [selected, setSelected] = useState(0);
  const chain = chains[selected];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {chains.map((c, i) => (
          <Chip
            key={c.ownerId}
            label={`${nameOf(players, c.ownerId)}'s chain`}
            selected={i === selected}
            onPress={() => setSelected(i)}
          />
        ))}
      </ScrollView>
      {/* The key replays the animation when another chain is selected. */}
      <View key={selected} style={styles.entries}>
        {chain?.entries.map((entry, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(i * ENTRY_DELAY_MS)
              .springify()
              .damping(14)}
          >
            <EntryCard
              entry={entry}
              players={players}
              first={i === 0}
              tilt={i % 2 === 0 ? -1 : 1}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function EntryCard({
  entry,
  players,
  first,
  tilt,
}: {
  entry: ChainEntry;
  players: Map<string, PlayerInfo>;
  first: boolean;
  tilt: number;
}) {
  const author = players.get(entry.authorId);
  const verb = entry.kind === 'drawing' ? 'drew' : first ? 'wrote' : 'guessed';
  return (
    <InkCard color={entry.kind === 'text' ? 'white' : 'paper'} tilt={tilt}>
      <View style={styles.author}>
        <Avatar
          nickname={author?.nickname ?? '?'}
          color={author?.color ?? colors.paperLine}
          size={28}
        />
        <Txt variant="label">
          {nameOf(players, entry.authorId)} {verb}
        </Txt>
      </View>
      {entry.kind === 'text' ? (
        <Txt variant="title">{entry.text}</Txt>
      ) : (
        <DrawingCanvas strokes={entry.strokes} editable={false} brush={NO_BRUSH} />
      )}
    </InkCard>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  tabs: { gap: 8 },
  entries: { gap: 14 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
});
