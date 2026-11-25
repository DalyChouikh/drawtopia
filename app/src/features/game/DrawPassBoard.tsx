import type { DrawPassView } from '@drawtopia/shared';
import { GUESS_MAX_LENGTH } from '@drawtopia/shared';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { InkInput } from '../../components/ui/InkInput';
import { Txt } from '../../components/ui/Txt';
import { useCountdown } from '../../hooks/useCountdown';
import { errorMessage } from '../../services/gameClient';
import { submitPassEntry } from '../../services/gameApi';
import { haptics } from '../../services/haptics';
import { useGameStore } from '../../stores/gameStore';
import { showToast } from '../../stores/toastStore';
import { colors } from '../../theme/tokens';
import { type Brush, DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { useDrawing } from '../drawing/useDrawing';
import { TimerPill } from './TimerPill';
import { nameOf, type PlayerInfo } from './usePlayers';

interface DrawPassBoardProps {
  view: DrawPassView;
  myId: string | null;
  players: Map<string, PlayerInfo>;
}

const NO_BRUSH: Brush = { color: colors.ink, size: 10 };

/** One Draw & Pass step: write a sentence, draw the sentence you got, or describe a drawing. */
export function DrawPassBoard(props: DrawPassBoardProps) {
  // A fresh component per step resets the text field and the canvas.
  return <PassStep key={props.view.step} {...props} />;
}

function PassStep({ view, myId, players }: DrawPassBoardProps) {
  const receivedAt = useGameStore((s) => s.receivedAt);
  const seconds = useCountdown(view.remainingMs, receivedAt);
  const drawing = useDrawing();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const submitted = myId !== null && view.submittedIds.includes(myId);
  const autoSubmitted = useRef(false);

  const submit = async () => {
    setSending(true);
    const result = await submitPassEntry(
      view.stepKind === 'text'
        ? { kind: 'text', text }
        : { kind: 'drawing', strokes: drawing.strokes },
    );
    setSending(false);
    if (result.ok) haptics.success();
    else if (result.error !== 'NOT_ALLOWED') showToast(errorMessage(result.error), 'error');
  };

  // Time's up: send whatever is there (the server fills in anything still missing).
  useEffect(() => {
    if (seconds === 0 && !submitted && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit();
    }
  });

  const instruction =
    view.stepKind === 'text'
      ? view.prompt
        ? 'What is this drawing? Describe it.'
        : 'Write a sentence for someone to draw'
      : 'Draw this sentence';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TimerPill seconds={seconds} />
        <Txt variant="heading" style={styles.flex} numberOfLines={2}>
          {instruction}
        </Txt>
        <Txt variant="label">
          {view.step}/{view.totalSteps}
        </Txt>
      </View>

      {view.prompt && (
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <InkCard color={view.prompt.kind === 'text' ? 'yellow' : 'white'} tilt={-1}>
            <Txt variant="caption" color={colors.ink}>
              From {nameOf(players, view.prompt.authorId)}
            </Txt>
            {view.prompt.kind === 'text' ? (
              <Txt variant="title">{view.prompt.text}</Txt>
            ) : (
              <DrawingCanvas strokes={view.prompt.strokes} editable={false} brush={NO_BRUSH} />
            )}
          </InkCard>
        </Animated.View>
      )}

      {submitted ? (
        <Animated.View entering={FadeIn}>
          <InkCard color="lime">
            <Txt variant="heading" align="center">
              Sent! Waiting for the others ({view.submittedIds.length}/
              {players.size || view.totalSteps})
            </Txt>
            <View style={styles.avatars}>
              {view.submittedIds.map((id) => (
                <Avatar
                  key={id}
                  nickname={nameOf(players, id)}
                  color={players.get(id)?.color ?? colors.paperLine}
                  size={32}
                />
              ))}
            </View>
          </InkCard>
        </Animated.View>
      ) : view.stepKind === 'text' ? (
        <>
          <InkInput
            label={view.prompt ? 'Your guess' : 'Your sentence'}
            value={text}
            onChangeText={setText}
            placeholder={view.prompt ? 'A cat surfing a wave' : 'A pirate eating spaghetti'}
            maxLength={GUESS_MAX_LENGTH * 2}
            multiline
          />
          <InkButton label="Send" color="red" size="lg" loading={sending} onPress={submit} />
        </>
      ) : (
        <>
          <DrawingCanvas
            strokes={drawing.strokes}
            editable
            brush={drawing.brush}
            onStrokeEnd={drawing.addStroke}
          />
          <DrawingToolbar
            brush={drawing.brush}
            onBrushChange={drawing.setBrush}
            onUndo={drawing.undo}
            onClear={drawing.clear}
            canUndo={drawing.strokes.length > 0}
          />
          <InkButton label="Done drawing" color="red" loading={sending} onPress={submit} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
});
