import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ink, TOUCH_MIN } from '../../theme/tokens';
import { OfflineBanner } from './OfflineBanner';
import { PaperBackground } from './PaperBackground';
import { Txt } from './Txt';

interface ScreenProps {
  children: ReactNode;
  /** Shows a header with a back button and this title. */
  title?: string;
  /** Custom back behaviour (e.g. leave the room first). Defaults to router.back(). */
  onBack?: () => void;
  scroll?: boolean;
  footer?: ReactNode;
}

/** Page frame: graph paper, safe areas, optional header, offline banner. */
export function Screen({ children, title, onBack, scroll = true, footer }: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill]}>{children}</View>
  );

  return (
    <View style={styles.fill}>
      <PaperBackground />
      <SafeAreaView style={styles.fill} edges={['top', 'bottom', 'left', 'right']}>
        {title !== undefined && (
          <View style={styles.header}>
            <Pressable
              onPress={onBack ?? (() => router.back())}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            >
              <Txt variant="heading">←</Txt>
            </Pressable>
            <Txt variant="title" numberOfLines={1} style={styles.title} accessibilityRole="header">
              {title}
            </Txt>
          </View>
        )}
        <OfflineBanner />
        {body}
        {footer && <View style={styles.footer}>{footer}</View>}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16, gap: 16, flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { backgroundColor: colors.yellow },
  title: { flex: 1 },
  footer: { paddingHorizontal: 16, paddingBottom: 8, gap: 12 },
});
