import { GUESS_MAX_LENGTH, GuessSchema, firstIssueMessage } from '@drawtopia/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Txt } from '../../components/ui/Txt';
import { errorMessage } from '../../services/gameClient';
import { sendGuess } from '../../services/gameApi';
import { haptics } from '../../services/haptics';
import { showToast } from '../../stores/toastStore';
import { colors, ink, TOUCH_MIN } from '../../theme/tokens';
import { typography } from '../../theme/typography';

/** Text field + Send for guessers. Empty guesses are refused before reaching the server. */
export function GuessInput() {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const parsed = GuessSchema.safeParse(text);
    if (!parsed.success) {
      haptics.warning();
      showToast(firstIssueMessage(parsed.error), 'error');
      return;
    }
    setSending(true);
    const result = await sendGuess(parsed.data);
    setSending(false);
    if (!result.ok) {
      showToast(errorMessage(result.error), 'error');
      return;
    }
    setText('');
    if (result.value.verdict === 'correct') haptics.success();
    else if (result.value.verdict === 'close') haptics.warning();
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your guess"
        placeholderTextColor={colors.muted}
        maxLength={GUESS_MAX_LENGTH}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="send"
        onSubmitEditing={send}
        submitBehavior="submit"
        accessibilityLabel="Your guess"
        style={styles.input}
      />
      <Pressable
        onPress={send}
        disabled={sending}
        accessibilityRole="button"
        accessibilityLabel="Send guess"
        style={({ pressed }) => [styles.send, pressed && styles.pressed]}
      >
        <Txt variant="heading">Send</Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  input: {
    ...typography.input,
    flex: 1,
    minHeight: TOUCH_MIN,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
  },
  send: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    boxShadow: `3px 3px 0px ${colors.ink}`,
  },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: 'none' },
});
