import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useCallback } from 'react';

// Storage helper that works on both web and mobile
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      } catch {
        // Silent fail
      }
    }
  },
};

type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime?: string;
  time: string;
  unread: number;
  type: 'group' | 'individual';
};

const DEFAULT_CHATS: Chat[] = [
  { id: '1', name: 'Design Team', lastMessage: 'Great work on the new mockups!', time: '10:30 AM', unread: 3, type: 'group' },
  { id: '2', name: 'Alex Johnson', lastMessage: 'Can you review the proposal?', time: '9:15 AM', unread: 1, type: 'individual' },
  { id: '3', name: 'Product Team', lastMessage: 'Meeting at 2 PM today', time: 'Yesterday', unread: 0, type: 'group' },
  { id: '4', name: 'Sarah Williams', lastMessage: 'Thanks for the feedback!', time: 'Yesterday', unread: 0, type: 'individual' },
  { id: '5', name: 'Development', lastMessage: 'Deploy is complete', time: 'Mon', unread: 0, type: 'group' },
];

export default function ChatScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>(DEFAULT_CHATS);

  // Load unread counts and last message times from storage when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadChats = async () => {
        try {
          const unreadDataStr = await storage.getItem('chat_unread');
          const unreadData = unreadDataStr ? JSON.parse(unreadDataStr) : {};
          const lastMessageDataStr = await storage.getItem('chat_last_message');
          const lastMessageData = lastMessageDataStr ? JSON.parse(lastMessageDataStr) : {};
          
          // Sort chats: unread first, then by last message time
          const updatedChats = DEFAULT_CHATS.map(chat => {
            const lastMsg = lastMessageData[chat.id];
            return {
              ...chat,
              unread: unreadData[chat.id] !== undefined ? unreadData[chat.id] : chat.unread,
              lastMessageTime: lastMsg?.time || chat.time,
              lastMessage: lastMsg?.text || chat.lastMessage,
            };
          }).sort((a, b) => {
            // First sort by unread (unread chats first)
            if (a.unread > 0 && b.unread === 0) return -1;
            if (a.unread === 0 && b.unread > 0) return 1;
            // Then sort by time (recent first)
            return 0;
          });
          
          setChats(updatedChats);
        } catch {
          setChats(DEFAULT_CHATS);
        }
      };
      loadChats();
    }, [])
  );

  const handleChatPress = async (chat: Chat) => {
    // Mark as read - set unread to 0
    const updatedChats = chats.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    );
    setChats(updatedChats);
    
    // Save to storage
    try {
      const unreadDataStr = await storage.getItem('chat_unread');
      const unreadData = unreadDataStr ? JSON.parse(unreadDataStr) : {};
      unreadData[chat.id] = 0;
      await storage.setItem('chat_unread', JSON.stringify(unreadData));
    } catch {
      console.error('Error saving unread status');
    }
    
    // Navigate to chat room
    router.push(`/chat-room?id=${chat.id}&name=${encodeURIComponent(chat.name)}&type=${chat.type}` as any);
  };

  const messages = [
    { id: '1', text: 'Hi team! How is the progress?', sender: 'me', time: '10:25 AM' },
    { id: '2', text: 'Going well! Just finishing up the designs.', sender: 'other', time: '10:28 AM', name: 'Alex' },
    { id: '3', text: 'Great work on the new mockups!', sender: 'other', time: '10:30 AM', name: 'Sarah' },
  ];

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={[styles.chatAvatar, item.type === 'group' && styles.groupAvatar]}>
        <Text style={styles.chatAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, item.unread > 0 && styles.unreadName]}>{item.name}</Text>
          <Text style={[styles.chatTime, item.unread > 0 && styles.unreadTime]}>{item.lastMessageTime || item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={[styles.chatMessage, item.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
            {item.unread > 0 && <Text style={styles.unreadDot}>● </Text>}
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Chat</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <Text style={styles.searchPlaceholder}>Search conversations...</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#999',
    fontSize: 14,
  },
  chatList: {
    padding: 20,
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatar: {
    backgroundColor: '#4CAF50',
  },
  chatAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 5,
  },
  unreadName: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadTime: {
    color: '#25D366',
    fontWeight: '600',
  },
  unreadMessage: {
    fontWeight: '500',
    color: '#333',
  },
  unreadDot: {
    color: '#25D366',
    fontSize: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
