import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/tokens';

/** A strip of translucent tape, placed over the top edge of a card. Decorative only. */
export function Tape({ rotate = -6, style }: { rotate?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tape, { transform: [{ rotate: `${rotate}deg` }] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  tape: {
    position: 'absolute',
    top: -10,
    width: 64,
    height: 20,
    backgroundColor: colors.tape,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    zIndex: 2,
  },
});
