import type { RoomSettings } from '@drawtopia/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { InkButton } from '../components/ui/InkButton';
import { Screen } from '../components/ui/Screen';
import { DEFAULT_SETTINGS } from '../features/rooms/modes';
import { SettingsPicker } from '../features/rooms/SettingsPicker';
import { errorMessage } from '../services/gameClient';
import { haptics } from '../services/haptics';
import { createRoom } from '../services/roomsApi';
import { showToast } from '../stores/toastStore';

/** Fiche action 1 + 2: create a public or private room, pick the mode and the round duration. */
export default function CreateRoomScreen() {
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_SETTINGS);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    const result = await createRoom(settings);
    setCreating(false);
    if (!result.ok) {
      haptics.error();
      showToast(errorMessage(result.error), 'error');
      return;
    }
    haptics.success();
    // The room code travels to the lobby as a route parameter.
    router.replace(`/room/${result.value.room.code}`);
  };

  return (
    <Screen
      title="New room"
      footer={
        <InkButton label="Create room" color="blue" size="lg" loading={creating} onPress={create} />
      }
    >
      <SettingsPicker
        value={settings}
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
      />
    </Screen>
  );
}
