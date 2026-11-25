import { MAX_PLAYERS, MIN_PLAYERS } from '@drawtopia/shared';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DrawTopia</Text>
      <Text>
        {MIN_PLAYERS}–{MAX_PLAYERS} players
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7EE',
  },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A' },
});
