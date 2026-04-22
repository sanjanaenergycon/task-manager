import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useRef, useEffect } from 'react';

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

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  name?: string;
  avatar?: string;
  type?: 'text' | 'file';
  fileName?: string;
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hi team! How is the progress?', sender: 'me', time: '10:25 AM' },
    { id: '2', text: 'Going well! Just finishing up the designs.', sender: 'other', time: '10:28 AM', name: 'Alex', avatar: 'A' },
    { id: '3', text: 'Great work on the new mockups!', sender: 'other', time: '10:30 AM', name: 'Sarah', avatar: 'S' },
    { id: '4', text: 'Thanks! Will share the final version soon.', sender: 'other', time: '10:32 AM', name: 'Alex', avatar: 'A' },
  ],
  '2': [
    { id: '1', text: 'Hey Alex!', sender: 'me', time: '9:00 AM' },
    { id: '2', text: 'Can you review the proposal?', sender: 'other', time: '9:15 AM', name: 'Alex', avatar: 'A' },
    { id: '3', text: 'Sure, I will check it out now.', sender: 'me', time: '9:20 AM' },
  ],
  '3': [
    { id: '1', text: 'Meeting at 2 PM today', sender: 'other', time: 'Yesterday', name: 'Product Manager', avatar: 'P' },
    { id: '2', text: 'Got it, I will be there.', sender: 'me', time: 'Yesterday' },
  ],
  '4': [
    { id: '1', text: 'Thanks for the feedback!', sender: 'other', time: 'Yesterday', name: 'Sarah', avatar: 'S' },
    { id: '2', text: 'You are welcome! Let me know if you need anything else.', sender: 'me', time: 'Yesterday' },
  ],
  '5': [
    { id: '1', text: 'Deploy is complete', sender: 'other', time: 'Mon', name: 'DevOps', avatar: 'D' },
    { id: '2', text: 'Great news! Thanks for the update.', sender: 'me', time: 'Mon' },
  ],
};

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id, name, type } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load messages for this chat
    const loadMessages = async () => {
      const chatId = id as string;
      const saved = await storage.getItem(`chat_${chatId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else if (INITIAL_MESSAGES[chatId]) {
        setMessages(INITIAL_MESSAGES[chatId]);
      }
    };
    loadMessages();
  }, [id]);

  useEffect(() => {
    // Save messages when they change
    const saveMessages = async () => {
      if (messages.length > 0) {
        await storage.setItem(`chat_${id}`, JSON.stringify(messages));
        
        // Update last message for sorting
        const lastMessage = messages[messages.length - 1];
        const lastMessageDataStr = await storage.getItem('chat_last_message');
        const lastMessageData = lastMessageDataStr ? JSON.parse(lastMessageDataStr) : {};
        lastMessageData[id as string] = {
          text: lastMessage.type === 'file' ? `📄 ${lastMessage.fileName || 'Document'}` : lastMessage.text,
          time: lastMessage.time,
          timestamp: Date.now(),
        };
        await storage.setItem('chat_last_message', JSON.stringify(lastMessageData));
      }
    };
    saveMessages();
  }, [messages, id]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replies = [
        'That sounds great!',
        'I agree with you.',
        'Let me check and get back to you.',
        'Thanks for the update!',
        'Can we discuss this in the meeting?',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomReply,
        sender: 'other',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        name: name as string,
        avatar: (name as string).charAt(0),
      };
      
      setMessages(prev => [...prev, replyMessage]);
      
      // Increment unread count for this chat when reply comes (simulating new message)
      const updateUnread = async () => {
        try {
          const unreadDataStr = await storage.getItem('chat_unread');
          const unreadData = unreadDataStr ? JSON.parse(unreadDataStr) : {};
          unreadData[id as string] = (unreadData[id as string] || 0) + 1;
          await storage.setItem('chat_unread', JSON.stringify(unreadData));
        } catch {
          console.error('Error updating unread count');
        }
      };
      updateUnread();
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    const isFile = item.type === 'file';

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMe && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>{item.avatar || '?'}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && item.name && (
            <Text style={styles.senderName}>{item.name}</Text>
          )}

          {isFile ? (
            <View style={styles.fileBubble}>
              <View style={styles.fileRow}>
                <View style={styles.fileIconContainer}>
                  <IconSymbol name="doc.fill" size={28} color="#fff" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>{item.fileName || 'Document'}</Text>
                  <Text style={styles.fileLabel}>Document</Text>
                </View>
              </View>
              {item.text !== `Shared document: ${item.fileName}` && (
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText, { marginTop: 6 }]}>
                  {item.text}
                </Text>
              )}
            </View>
          ) : (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
              {item.text}
            </Text>
          )}

          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.headerSubtitle}>{type === 'group' ? 'Group Chat' : 'Online'}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <IconSymbol name="ellipsis" size={24} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      {/* Menu Popup */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuOverlayTouch} onPress={() => setShowMenu(false)} />
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/photos' as any);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                <IconSymbol name="photo.fill" size={20} color="#2196F3" />
              </View>
              <Text style={styles.menuText}>Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/videos' as any);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                <IconSymbol name="video.fill" size={20} color="#9C27B0" />
              </View>
              <Text style={styles.menuText}>Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/voice-call' as any);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                <IconSymbol name="phone.fill" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.menuText}>Voice Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/video-call' as any);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                <IconSymbol name="video.badge.checkmark" size={20} color="#FF9800" />
              </View>
              <Text style={styles.menuText}>Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push({ 
                  pathname: '/chat-edit', 
                  params: { id, name, type } 
                } as any);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#E0F2F1' }]}>
                <IconSymbol name="square.and.pencil" size={20} color="#009688" />
              </View>
              <Text style={styles.menuText}>Edit {type === 'group' ? 'Group' : 'Profile'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => setShowMenu(false)}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
                <IconSymbol name="xmark" size={20} color="#F44336" />
              </View>
              <Text style={styles.menuText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <IconSymbol name="plus" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <IconSymbol name="paperplane.fill" size={20} color={inputText.trim() ? '#fff' : '#999'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#1e3a5f',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  menuOverlayTouch: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 110,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  fileBubble: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fileLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
