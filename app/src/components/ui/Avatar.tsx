import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { Txt } from './Txt';

interface AvatarProps {
  nickname: string;
  color: string;
  size?: number;
  /** Greyed out when the player lost their connection. */
  dimmed?: boolean;
}

/** Round avatar showing the first letter of the nickname on the player's colour. */
export function Avatar({ nickname, color, size = 44, dimmed = false }: AvatarProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        dimmed && styles.dimmed,
      ]}
    >
      <Txt variant="heading" style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>
        {nickname.charAt(0).toUpperCase() || '?'}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: { opacity: 0.4 },
});
