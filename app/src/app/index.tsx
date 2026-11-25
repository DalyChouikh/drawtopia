import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Avatar } from '../components/ui/Avatar';
import { InkButton } from '../components/ui/InkButton';
import { InkCard } from '../components/ui/InkCard';
import { Screen } from '../components/ui/Screen';
import { Tape } from '../components/ui/Tape';
import { Txt } from '../components/ui/Txt';
import { DEFAULT_SETTINGS } from '../features/rooms/modes';
import { useProfileGate } from '../features/rooms/useProfileGate';
import { errorMessage } from '../services/gameClient';
import { createRoom, joinRoom, listPublicRooms } from '../services/roomsApi';
import { useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { showToast } from '../stores/toastStore';
import { TOUCH_MIN } from '../theme/tokens';

/** Home: profile card and the ways into a game. */
export default function Home() {
  const nickname = useProfileStore((s) => s.nickname);
  const color = useProfileStore((s) => s.color);
  const withProfile = useProfileGate();
  const [quickPlaying, setQuickPlaying] = useState(false);

  /** Joins the first open public room, or opens a new public one if there is none. */
  const quickPlay = async () => {
    setQuickPlaying(true);
    const rooms = await listPublicRooms();
    let joined = rooms.ok && rooms.value[0] ? await joinRoom(rooms.value[0].code) : null;
    if (!joined?.ok) joined = await createRoom({ ...DEFAULT_SETTINGS, visibility: 'public' });
    setQuickPlaying(false);
    if (joined.ok) router.push(`/room/${joined.value.room.code}`);
    else showToast(errorMessage(joined.error), 'error');
  };

  return (
    <Screen>
      <Logo />

      <Animated.View entering={FadeInDown.delay(100)}>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={nickname ? `Your profile: ${nickname}. Edit` : 'Create your profile'}
        >
          <InkCard tilt={-1}>
            <Tape style={{ left: 24 }} />
            <View style={styles.profileRow}>
              <Avatar nickname={nickname || '?'} color={color} />
              <View style={styles.flex}>
                <Txt variant="caption">Your nickname</Txt>
                <Txt variant="heading">{nickname || 'Tap to pick one'}</Txt>
              </View>
              <Txt variant="body">✎</Txt>
            </View>
          </InkCard>
        </Pressable>
      </Animated.View>

      <ResumeRoomCard />

      <Animated.View entering={FadeInDown.delay(200)} style={styles.actions}>
        <InkButton
          label="Quick play"
          color="red"
          size="lg"
          tilt={-1}
          loading={quickPlaying}
          onPress={() => withProfile('/', quickPlay)}
        />
        <InkButton
          label="Create room"
          color="blue"
          tilt={1}
          onPress={() => withProfile('/create')}
        />
        <InkButton label="Join with code" onPress={() => withProfile('/join')} />
        <InkButton label="Browse public rooms" color="lime" onPress={() => withProfile('/rooms')} />
      </Animated.View>

      <View style={styles.footer}>
        <FooterLink label="History" onPress={() => router.push('/history')} />
        <FooterLink label="Settings" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

/**
 * After the app was closed or lost its connection, the saved session rejoins the room
 * automatically; this card leads back to it (lobby, or the game if one is running).
 */
function ResumeRoomCard() {
  const room = useSessionStore((s) => s.room);
  if (!room) return null;
  const playing = room.status === 'playing';
  return (
    <Animated.View entering={FadeInDown}>
      <InkButton
        label={playing ? `Back to your game (${room.code})` : `Back to room ${room.code}`}
        color="yellow"
        tilt={1}
        onPress={() => router.push(playing ? `/game/${room.code}` : `/room/${room.code}`)}
      />
    </Animated.View>
  );
}

function Logo() {
  const tilt = useSharedValue(-2);
  useEffect(() => {
    tilt.value = withRepeat(
      withTiming(2, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [tilt]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.value}deg` }] }));

  return (
    <View style={styles.logoBlock}>
      <Animated.View style={style}>
        <Image
          source={require('../../assets/logo-lockup.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="DrawTopia"
        />
      </Animated.View>
      <Txt variant="body" color="#5F5A4F" align="center">
        draw it. guess it. pass it.
      </Txt>
    </View>
  );
}

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.footerLink} hitSlop={6}>
      <Txt variant="heading" style={styles.underline}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logoBlock: { alignItems: 'center', gap: 4, marginTop: 8 },
  logo: { width: 300, height: 70 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { gap: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 'auto' },
  footerLink: { minHeight: TOUCH_MIN, justifyContent: 'center', paddingHorizontal: 12 },
  underline: { textDecorationLine: 'underline' },
});
