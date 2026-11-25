import type { DrawGuessView } from '@drawtopia/shared';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Txt } from '../../components/ui/Txt';
import { useCountdown } from '../../hooks/useCountdown';
import { errorMessage } from '../../services/gameClient';
import { chooseWord, sendClear, sendStroke, sendUndo } from '../../services/gameApi';
import { useGameStore } from '../../stores/gameStore';
import { showToast } from '../../stores/toastStore';
import { colors, fonts } from '../../theme/tokens';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { useDrawing } from '../drawing/useDrawing';
import { Feed, LatestNotice } from './Feed';
import { GuessInput } from './GuessInput';
import { Scoreboard } from './Scoreboard';
import { TimerPill } from './TimerPill';
import { nameOf, type PlayerInfo } from './usePlayers';

interface DrawGuessBoardProps {
  view: DrawGuessView;
  myId: string | null;
  players: Map<string, PlayerInfo>;
}

/** Draw & Guess screen: the drawer draws the secret word, the others guess it. */
export function DrawGuessBoard({ view, myId, players }: DrawGuessBoardProps) {
  const receivedAt = useGameStore((s) => s.receivedAt);
  const strokes = useGameStore((s) => s.strokes);
  const feed = useGameStore((s) => s.feed);
  const seconds = useCountdown(view.remainingMs, receivedAt);
  const { brush, setBrush } = useDrawing();

  const isDrawer = view.drawerId === myId;
  const drawerName = nameOf(players, view.drawerId);
  const iGuessed = myId !== null && view.guessedIds.includes(myId);

  const pick = async (word: string) => {
    const result = await chooseWord(word);
    if (!result.ok) showToast(errorMessage(result.error), 'error');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
    >
      <View style={styles.header}>
        <TimerPill seconds={seconds} />
        <WordLine view={view} isDrawer={isDrawer} />
        <Txt variant="label">
          {view.turn}/{view.totalTurns}
        </Txt>
      </View>

      <Scoreboard
        players={players}
        scores={view.scores}
        drawerId={view.drawerId}
        guessedIds={view.guessedIds}
        myId={myId}
      />

      {view.phase === 'choosing' ? (
        isDrawer ? (
          <Animated.View entering={ZoomIn} style={styles.choices}>
            <Txt variant="title" align="center">
              Pick a word to draw
            </Txt>
            {(view.wordChoices ?? []).map((word, i) => (
              <InkButton
                key={word}
                label={word}
                color={(['yellow', 'lime', 'blue'] as const)[i % 3]}
                tilt={i % 2 === 0 ? -1 : 1}
                onPress={() => pick(word)}
              />
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.waiting}>
            <Avatar
              nickname={drawerName}
              color={players.get(view.drawerId)?.color ?? colors.paperLine}
              size={72}
            />
            <Txt variant="title" align="center">
              {drawerName} is choosing a word…
            </Txt>
          </Animated.View>
        )
      ) : (
        <>
          <View>
            <DrawingCanvas
              strokes={strokes}
              editable={isDrawer && view.phase === 'drawing'}
              brush={brush}
              onStrokeEnd={sendStroke}
            />
            {view.phase === 'reveal' && <RevealCard view={view} players={players} />}
          </View>

          {isDrawer && view.phase === 'drawing' ? (
            <>
              <LatestNotice feed={feed} players={players} />
              <DrawingToolbar
                brush={brush}
                onBrushChange={setBrush}
                onUndo={sendUndo}
                onClear={sendClear}
                canUndo={strokes.length > 0}
              />
            </>
          ) : (
            <View style={styles.chat}>
              <Feed feed={feed} players={players} />
              {view.phase === 'drawing' &&
                (iGuessed ? (
                  <InkCard color="lime" shadow={false}>
                    <Txt variant="heading" align="center">
                      You got it! Watch the others guess.
                    </Txt>
                  </InkCard>
                ) : (
                  <GuessInput />
                ))}
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}

/** The drawer sees the word; guessers see the mask with revealed hint letters. */
function WordLine({ view, isDrawer }: { view: DrawGuessView; isDrawer: boolean }) {
  const text =
    view.phase === 'drawing'
      ? isDrawer
        ? view.word
        : view.mask.split('').join(' ')
      : (view.word ?? '');
  return (
    <View style={styles.word}>
      {isDrawer && view.phase === 'drawing' && <Txt variant="caption">Draw this</Txt>}
      <Txt
        style={styles.wordText}
        numberOfLines={1}
        adjustsFontSizeToFit
        accessibilityLabel={
          isDrawer ? `Your word: ${view.word}` : `Word with ${view.mask.length} letters`
        }
      >
        {text}
      </Txt>
    </View>
  );
}

function RevealCard({ view, players }: { view: DrawGuessView; players: Map<string, PlayerInfo> }) {
  const gains = Object.entries(view.turnPoints ?? {}).filter(([, points]) => points > 0);
  return (
    <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.reveal}>
      <InkCard color="yellow" tilt={-2}>
        <Txt variant="caption" color={colors.ink} align="center">
          The word was
        </Txt>
        <Txt variant="display" align="center">
          {view.word}
        </Txt>
        {gains.map(([id, points]) => (
          <Txt key={id} variant="body" align="center">
            {nameOf(players, id)} +{points}
          </Txt>
        ))}
        {gains.length === 0 && (
          <Txt variant="body" align="center">
            Nobody found it this time.
          </Txt>
        )}
      </InkCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { flex: 1, alignItems: 'center' },
  wordText: { fontFamily: fonts.sansBold, fontSize: 24, color: colors.ink, letterSpacing: 2 },
  choices: { gap: 14, paddingTop: 16 },
  waiting: { alignItems: 'center', gap: 12, paddingTop: 40 },
  chat: { flex: 1, gap: 8, minHeight: 120 },
  reveal: { position: 'absolute', left: 16, right: 16, top: '20%' },
});
