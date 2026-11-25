import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useConnectionStore } from '../../services/connectionStore';
import { colors, ink } from '../../theme/tokens';
import { Txt } from './Txt';

/** Visible on every screen while the game server cannot be reached. */
export function OfflineBanner() {
  const status = useConnectionStore((s) => s.status);
  if (status === 'online') return null;

  const connecting = status === 'connecting';
  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: connecting ? colors.yellow : colors.red }]}
    >
      <View style={styles.dot} />
      <Txt variant="label">
        {connecting ? 'Connecting to the game server…' : 'Offline: game server unreachable'}
      </Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
});
