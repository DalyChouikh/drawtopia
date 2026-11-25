import { type GameResult, rankPlayers } from '@drawtopia/shared';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { Confetti } from '../../components/ui/Confetti';
import { InkCard } from '../../components/ui/InkCard';
import { Txt } from '../../components/ui/Txt';
import { colors, ink } from '../../theme/tokens';

const STEP_HEIGHT = [120, 90, 64];
const STEP_COLOR = [colors.yellow, colors.blue, colors.red];
/** Display order: 2nd, 1st, 3rd. */
const PODIUM_ORDER = [1, 0, 2];

/** Final ranking of a Draw & Guess game: a podium for the top 3, a list for the rest. */
export function Podium({ result, myId }: { result: GameResult; myId: string | null }) {
  const ranked = rankPlayers(result.players);
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <View style={styles.container}>
      <Confetti trigger={ranked[0]?.id === myId ? 1 : 0} />
      <Txt variant="display" align="center">
        {ranked[0]?.id === myId ? 'You win!' : `${ranked[0]?.nickname ?? ''} wins!`}
      </Txt>
      <View style={styles.podium}>
        {PODIUM_ORDER.filter((i) => top[i]).map((i) => {
          const player = top[i]!;
          return (
            <Animated.View
              key={player.id}
              entering={FadeInUp.delay(300 + i * 250).springify()}
              style={styles.column}
            >
              <Avatar nickname={player.nickname} color={player.color} size={i === 0 ? 64 : 52} />
              <Txt variant="heading" numberOfLines={1}>
                {player.nickname}
              </Txt>
              <View
                style={[styles.step, { height: STEP_HEIGHT[i], backgroundColor: STEP_COLOR[i] }]}
              >
                <Txt variant="title">{player.rank}</Txt>
                <Txt variant="number">{player.score}</Txt>
              </View>
            </Animated.View>
          );
        })}
      </View>
      {rest.map((player, i) => (
        <Animated.View key={player.id} entering={FadeInDown.delay(1000 + i * 120)}>
          <InkCard shadow={false} padded={false}>
            <View style={styles.restRow}>
              <Txt variant="number">{player.rank}</Txt>
              <Avatar nickname={player.nickname} color={player.color} size={32} />
              <Txt variant="body" style={styles.flex}>
                {player.nickname}
              </Txt>
              <Txt variant="number">{player.score}</Txt>
            </View>
          </InkCard>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  column: { flex: 1, alignItems: 'center', gap: 6 },
  step: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderTopLeftRadius: ink.radiusSmall,
    borderTopRightRadius: ink.radiusSmall,
  },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  flex: { flex: 1 },
});
