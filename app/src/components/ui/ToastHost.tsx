import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ToastTone, useToastStore } from '../../stores/toastStore';
import { colors, ink } from '../../theme/tokens';
import { Txt } from './Txt';

const toneColor: Record<ToastTone, string> = {
  info: colors.yellow,
  success: colors.lime,
  error: colors.red,
};

/** Renders the toast queue above every screen. Tap a toast to dismiss it. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          entering={FadeInUp.springify().damping(16)}
          exiting={FadeOutUp}
          layout={LinearTransition}
        >
          <Pressable
            onPress={() => dismiss(toast.id)}
            accessibilityRole="alert"
            accessibilityHint="Dismisses the message"
            style={[styles.toast, { backgroundColor: toneColor[toast.tone] }]}
          >
            <Txt variant="body">{toast.message}</Txt>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, gap: 8, zIndex: 100 },
  toast: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radius,
    boxShadow: `${ink.shadow}px ${ink.shadow}px 0px ${colors.ink}`,
  },
});
