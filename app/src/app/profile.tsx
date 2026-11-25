import {
  AVATAR_COLORS,
  type AvatarColor,
  NicknameSchema,
  firstIssueMessage,
} from '@drawtopia/shared';
import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '../components/ui/Avatar';
import { InkButton } from '../components/ui/InkButton';
import { InkCard } from '../components/ui/InkCard';
import { InkInput } from '../components/ui/InkInput';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Txt';
import { haptics } from '../services/haptics';
import { useProfileStore } from '../stores/profileStore';
import { showToast } from '../stores/toastStore';
import { colors, TOUCH_MIN } from '../theme/tokens';

/** Edit nickname and avatar colour. Validated with the same rule the server uses. */
export default function ProfileScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const saved = useProfileStore();
  const [nickname, setNickname] = useState(saved.nickname);
  const [color, setColor] = useState<AvatarColor>(saved.color);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const parsed = NicknameSchema.safeParse(nickname);
    if (!parsed.success) {
      setError(firstIssueMessage(parsed.error));
      haptics.error();
      return;
    }
    saved.saveProfile({ nickname: parsed.data, color });
    haptics.success();
    showToast('Profile saved', 'success');
    if (next && next !== '/') router.replace(next as Href);
    else router.back();
  };

  return (
    <Screen
      title="Your profile"
      footer={<InkButton label="Save" color="lime" size="lg" onPress={save} />}
    >
      <View style={styles.preview}>
        <Avatar nickname={nickname || '?'} color={color} size={96} />
        <Txt variant="heading">{nickname.trim() || 'Your name here'}</Txt>
      </View>

      <InkCard>
        <InkInput
          label="Nickname"
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            if (error) setError(null);
          }}
          placeholder="Pixel_Rider"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={save}
          error={error}
          hint="2–16 letters, numbers or _"
        />
      </InkCard>

      <InkCard>
        <Txt variant="label">Colour</Txt>
        <View style={styles.swatches} accessibilityRole="radiogroup">
          {AVATAR_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                haptics.tap();
                setColor(c);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: c === color }}
              accessibilityLabel={`Colour ${c}`}
              style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchSelected]}
            />
          ))}
        </View>
      </InkCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', gap: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  swatch: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: TOUCH_MIN / 2,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  swatchSelected: { borderWidth: 6, transform: [{ scale: 1.1 }] },
});
