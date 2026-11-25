import { ROOM_CODE_LENGTH, RoomCodeSchema, firstIssueMessage } from '@drawtopia/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { InkButton } from '../components/ui/InkButton';
import { InkCard } from '../components/ui/InkCard';
import { InkInput } from '../components/ui/InkInput';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Txt';
import { errorMessage } from '../services/gameClient';
import { haptics } from '../services/haptics';
import { joinRoom } from '../services/roomsApi';
import { fonts } from '../theme/tokens';

/** Fiche action 1: join an existing room with its 4-character code. */
export default function JoinRoomScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const join = async () => {
    const parsed = RoomCodeSchema.safeParse(code);
    if (!parsed.success) {
      setError(firstIssueMessage(parsed.error));
      haptics.error();
      return;
    }
    setJoining(true);
    const result = await joinRoom(parsed.data);
    setJoining(false);
    if (!result.ok) {
      haptics.error();
      setError(
        result.error === 'ROOM_NOT_FOUND'
          ? `No room with code ${parsed.data}`
          : errorMessage(result.error),
      );
      return;
    }
    haptics.success();
    router.replace(`/room/${result.value.room.code}`);
  };

  return (
    <Screen
      title="Join a room"
      footer={<InkButton label="Join" color="red" size="lg" loading={joining} onPress={join} />}
    >
      <Txt variant="body">Ask the host for the 4-character code shown in their lobby.</Txt>
      <InkCard tilt={-1}>
        <InkInput
          label="Room code"
          value={code}
          onChangeText={(text) => {
            setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            if (error) setError(null);
          }}
          placeholder="ABCD"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          maxLength={ROOM_CODE_LENGTH}
          returnKeyType="go"
          onSubmitEditing={join}
          error={error}
          style={{
            fontFamily: fonts.sansBold,
            fontSize: 32,
            letterSpacing: 12,
            textAlign: 'center',
          }}
        />
      </InkCard>
    </Screen>
  );
}
