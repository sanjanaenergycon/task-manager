import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function VideoCallScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Main Video Area */}
      <View style={styles.mainVideo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(name as string)?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.name}>{name || 'Unknown'}</Text>
        <Text style={styles.status}>Calling...</Text>
      </View>

      {/* Self View */}
      <View style={styles.selfView}>
        <View style={styles.selfAvatar}>
          <Text style={styles.selfAvatarText}>J</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <IconSymbol name="video.fill" size={24} color="#fff" />
          <Text style={styles.controlText}>Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <IconSymbol name="bell.fill" size={24} color="#fff" />
          <Text style={styles.controlText}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <IconSymbol name="camera.fill" size={24} color="#fff" />
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.endCallButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="phone.fill" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  mainVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  selfView: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 100,
    height: 140,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selfAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
});
