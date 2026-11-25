import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';
import { DrawingCanvas } from '../../features/drawing/DrawingCanvas';
import { DrawingToolbar } from '../../features/drawing/DrawingToolbar';
import { useDrawing } from '../../features/drawing/useDrawing';
import { GAME_MODES } from '../../features/rooms/modes';
import { leaveRoom } from '../../services/roomsApi';
import { useSessionStore } from '../../stores/sessionStore';

/**
 * Game screen. Tickets 10 and 11 add the Draw & Guess and Draw & Pass rules;
 * for now it hosts the canvas so drawing can be tried on every device.
 */
export default function GameScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const room = useSessionStore((s) => (s.room?.code === code ? s.room : null));
  const drawing = useDrawing();

  const leave = async () => {
    await leaveRoom();
    router.replace('/');
  };

  return (
    <Screen title={room ? GAME_MODES[room.settings.mode].label : 'Game'} onBack={leave}>
      <InkCard color="yellow" padded>
        <Txt variant="body">
          Room {code} · {room?.players.length ?? 0} players
        </Txt>
      </InkCard>
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
      <View style={styles.spacer} />
      <InkButton label="Leave game" onPress={leave} />
    </Screen>
  );
}

const styles = StyleSheet.create({ spacer: { height: 8 } });
