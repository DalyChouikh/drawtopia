import { router } from 'expo-router';
import { InkButton } from '../../components/ui/InkButton';
import { InkCard } from '../../components/ui/InkCard';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';

/** Finished games saved on this phone (filled in by ticket 12). */
export default function HistoryScreen() {
  return (
    <Screen title="History">
      <InkCard tilt={1}>
        <Txt variant="heading">No games yet</Txt>
        <Txt variant="body">
          Finish a game and its scores and drawings are kept here, even offline.
        </Txt>
      </InkCard>
      <InkButton label="Play now" color="red" onPress={() => router.replace('/')} />
    </Screen>
  );
}
