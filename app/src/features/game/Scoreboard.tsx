import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { Txt } from '../../components/ui/Txt';
import { colors, ink } from '../../theme/tokens';
import type { PlayerInfo } from './usePlayers';

interface ScoreboardProps {
  players: Map<string, PlayerInfo>;
  scores: Record<string, number>;
  drawerId?: string;
  guessedIds?: string[];
  myId: string | null;
}

/** Horizontal strip of players with their score; marks the drawer and who already guessed. */
export function Scoreboard({ players, scores, drawerId, guessedIds = [], myId }: ScoreboardProps) {
  const ids = Object.keys(scores).sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.row}
    >
      {ids.map((id) => {
        const player = players.get(id);
        const guessed = guessedIds.includes(id);
        return (
          <View
            key={id}
            style={[styles.cell, guessed && styles.guessed, id === myId && styles.me]}
            accessibilityLabel={`${player?.nickname ?? 'Player'}: ${scores[id]} points${id === drawerId ? ', drawing' : ''}${guessed ? ', guessed it' : ''}`}
          >
            <View>
              <Avatar
                nickname={player?.nickname ?? '?'}
                color={player?.color ?? colors.paperLine}
                size={34}
                dimmed={player ? !player.connected : true}
              />
              {(id === drawerId || guessed) && (
                <Animated.View entering={ZoomIn} style={styles.badge}>
                  <Txt variant="label" style={styles.badgeText}>
                    {id === drawerId ? '✎' : '✓'}
                  </Txt>
                </Animated.View>
              )}
            </View>
            <View>
              <Txt variant="label" numberOfLines={1} style={styles.name}>
                {player?.nickname ?? '…'}
              </Txt>
              <Txt variant="number" style={styles.score}>
                {scores[id] ?? 0}
              </Txt>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A horizontal ScrollView grows to fill a column parent unless told not to.
  strip: { flexGrow: 0 },
  row: { gap: 8, paddingVertical: 2, alignItems: 'center' },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
  },
  guessed: { backgroundColor: colors.lime },
  me: { borderWidth: 3 },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, lineHeight: 14 },
  name: { maxWidth: 80 },
  score: { fontSize: 15, lineHeight: 18 },
});
