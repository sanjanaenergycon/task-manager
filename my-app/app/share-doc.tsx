import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

const TEAM_MEMBERS = [
  { id: '2', name: 'Alex Johnson', role: 'Product Manager', avatar: 'A', color: '#2196F3' },
  { id: '4', name: 'Sarah Williams', role: 'Designer', avatar: 'S', color: '#FF9800' },
  { id: '1', name: 'Design Team', role: 'Group', avatar: 'D', color: '#1e3a5f' },
  { id: '3', name: 'Product Team', role: 'Group', avatar: 'P', color: '#1e3a5f' },
  { id: '5', name: 'Development', role: 'Group', avatar: 'D', color: '#1e3a5f' },
];

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

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
  type: 'text' | 'file';
  fileName?: string;
};

export default function ShareDocScreen() {
  const router = useRouter();
  const { docId, docName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const filteredMembers = TEAM_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (selectedMembers.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please select at least one contact');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please select at least one contact');
      }
      return;
    }

    const shareText = message.trim() || `Shared document: ${docName}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Send message to each selected member's chat
    for (const memberId of selectedMembers) {
      const chatKey = `chat_${memberId}`;
      try {
        const existing = await storage.getItem(chatKey);
        let messages: Message[] = existing ? JSON.parse(existing) : [];

        messages.push({
          id: Date.now().toString() + memberId,
          text: shareText,
          sender: 'me',
          time: timestamp,
          type: 'file',
          fileName: docName as string,
        });

        await storage.setItem(chatKey, JSON.stringify(messages));

        // Update last message for chat list
        const lastMessageDataStr = await storage.getItem('chat_last_message');
        const lastMessageData = lastMessageDataStr ? JSON.parse(lastMessageDataStr) : {};
        lastMessageData[memberId] = {
          text: `📄 ${docName}`,
          time: timestamp,
          timestamp: Date.now(),
        };
        await storage.setItem('chat_last_message', JSON.stringify(lastMessageData));

        // Update unread count for this chat
        const unreadKey = 'chat_unread';
        const unreadData = await storage.getItem(unreadKey);
        const unread = unreadData ? JSON.parse(unreadData) : {};
        unread[memberId] = (unread[memberId] || 0) + 1;
        await storage.setItem(unreadKey, JSON.stringify(unread));
      } catch {
        console.error('Error saving message');
      }
    }

    if (Platform.OS === 'web') {
      alert(`Document shared with ${selectedMembers.length} contact(s)!`);
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Success', `Document shared with ${selectedMembers.length} contact(s)!`);
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Document</Text>
        <TouchableOpacity onPress={handleShare} disabled={selectedMembers.length === 0}>
          <Text style={[styles.shareButton, selectedMembers.length === 0 && styles.shareButtonDisabled]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.docPreview}>
        <IconSymbol name="doc.fill" size={32} color="#1e3a5f" />
        <Text style={styles.docName} numberOfLines={1}>{docName}</Text>
      </View>

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Add a message (optional)..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {selectedMembers.length > 0 ? `${selectedMembers.length} selected` : 'Select Contacts'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredMembers.map((member) => {
          const isSelected = selectedMembers.includes(member.id);
          return (
            <TouchableOpacity
              key={member.id}
              style={[styles.memberItem, isSelected && styles.memberItemSelected]}
              onPress={() => toggleSelection(member.id)}
            >
              <View style={[styles.avatar, { backgroundColor: member.color }]}>
                <Text style={styles.avatarText}>{member.avatar}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <IconSymbol name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  shareButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  shareButtonDisabled: {
    color: '#ccc',
  },
  docPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0f8',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  messageInputContainer: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  memberItemSelected: {
    backgroundColor: '#e8f0f8',
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberRole: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bottomPadding: {
    height: 40,
  },
});
