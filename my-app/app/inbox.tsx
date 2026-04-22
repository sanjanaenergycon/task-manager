import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useCallback } from 'react';

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

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'task' | 'chat' | 'doc' | 'form' | 'system' | 'mention';
  read: boolean;
  actionRoute?: string;
  actionParams?: Record<string, string>;
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New task assigned', message: 'Alex assigned you to "Design System Update"', time: '10 min ago', type: 'task', read: false, actionRoute: '/tasks' },
  { id: '2', title: 'Sarah mentioned you', message: 'Sarah mentioned you in "Design Team" chat: "@you check the new mockups"', time: '25 min ago', type: 'mention', read: false, actionRoute: '/chat-room', actionParams: { id: '1', name: 'Design Team', type: 'group' } },
  { id: '3', title: 'New document shared', message: 'Jennifer shared "Q2 Roadmap.pdf" with you', time: '1 hour ago', type: 'doc', read: false, actionRoute: '/docs' },
  { id: '4', title: 'Form response received', message: 'New response on "Employee Feedback Form"', time: '2 hours ago', type: 'form', read: true, actionRoute: '/forms' },
  { id: '5', title: 'Task deadline approaching', message: '"Client Dashboard" is due tomorrow', time: '3 hours ago', type: 'task', read: true, actionRoute: '/tasks' },
  { id: '6', title: 'New message from Mike', message: 'Mike: "Can you review the proposal?"', time: '5 hours ago', type: 'chat', read: true, actionRoute: '/chat-room', actionParams: { id: '3', name: 'Mike Chen', type: 'individual' } },
  { id: '7', title: 'Meeting reminder', message: 'Team standup in 15 minutes', time: '6 hours ago', type: 'system', read: true, actionRoute: '/calendar' },
  { id: '8', title: 'Project milestone reached', message: '"Mobile App v2.0" reached 80% completion', time: 'Yesterday', type: 'system', read: true },
  { id: '9', title: 'New form shared', message: 'Admin shared "Leave Application" form', time: 'Yesterday', type: 'form', read: true, actionRoute: '/forms' },
  { id: '10', title: 'Comment on document', message: 'Alex commented on "API Documentation.docx"', time: 'Yesterday', type: 'doc', read: true, actionRoute: '/docs' },
];

const INBOX_KEY = 'worknest_inbox';

export default function InboxScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuNotifId, setMenuNotifId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        const saved = await storage.getItem(INBOX_KEY);
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          setNotifications(DEFAULT_NOTIFICATIONS);
          await storage.setItem(INBOX_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        }
      };
      loadNotifications();
    }, [])
  );

  const saveNotifications = async (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    await storage.setItem(INBOX_KEY, JSON.stringify(newNotifs));
  };

  const tabs = [
    { id: 'all', label: 'All', icon: 'tray.fill' },
    { id: 'task', label: 'Tasks', icon: 'checkmark.circle.fill' },
    { id: 'chat', label: 'Chat', icon: 'message.fill' },
    { id: 'doc', label: 'Docs', icon: 'doc.fill' },
    { id: 'form', label: 'Forms', icon: 'doc.text.fill' },
    { id: 'system', label: 'System', icon: 'gear' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    const matchesTab = activeTab === 'all' ? true : n.type === activeTab;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const tabCounts: Record<string, number> = {
    all: unreadCount,
    task: notifications.filter((n) => !n.read && n.type === 'task').length,
    chat: notifications.filter((n) => !n.read && n.type === 'chat').length,
    doc: notifications.filter((n) => !n.read && n.type === 'doc').length,
    form: notifications.filter((n) => !n.read && n.type === 'form').length,
    system: notifications.filter((n) => !n.read && n.type === 'system').length,
  };

  const handleMarkRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    await saveNotifications(updated);
  };

  const handleMarkUnread = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: false } : n));
    await saveNotifications(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    await saveNotifications(updated);
    setMenuNotifId(null);
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await saveNotifications(updated);
    if (Platform.OS === 'web') {
      alert('All notifications marked as read');
    }
  };

  const handleClearAll = async () => {
    if (Platform.OS === 'web') {
      if (!confirm('Clear all notifications?')) return;
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Clear All', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await saveNotifications([]);
            Alert.alert('Cleared', 'All notifications cleared');
          },
        },
      ]);
      return;
    }
    await saveNotifications([]);
  };

  const handlePress = (item: Notification) => {
    if (!item.read) {
      handleMarkRead(item.id);
    }
    if (item.actionRoute) {
      router.push({ pathname: item.actionRoute as any, params: item.actionParams || {} });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return 'checkmark.circle.fill';
      case 'chat': return 'message.fill';
      case 'mention': return 'at';
      case 'doc': return 'doc.fill';
      case 'form': return 'doc.text.fill';
      case 'system': return 'bell.fill';
      default: return 'bell.fill';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'task': return '#2196F3';
      case 'chat': return '#4CAF50';
      case 'mention': return '#FF9800';
      case 'doc': return '#1e3a5f';
      case 'form': return '#673AB8';
      case 'system': return '#9C27B0';
      default: return '#666';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handlePress(item)}
      onLongPress={() => setMenuNotifId(item.id)}
      delayLongPress={500}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '15' }]}>
        <IconSymbol name={getIcon(item.type) as any} size={22} color={getIconColor(item.type)} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadText]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>{item.time}</Text>
          {item.actionRoute && (
            <Text style={styles.actionHint}>Tap to open</Text>
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
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerAction}>
              <Text style={styles.headerActionText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClearAll}>
            <IconSymbol name="trash.fill" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <IconSymbol name={tab.icon as any} size={14} color={activeTab === tab.id ? '#fff' : '#666'} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
                {tabCounts[tab.id] > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tabCounts[tab.id]}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <IconSymbol name="tray.fill" size={48} color="#ddd" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notifications found' : 'No notifications'}
          </Text>
        </View>
      )}

      {/* Long Press Menu */}
      {menuNotifId && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuOverlayTouch} onPress={() => setMenuNotifId(null)} />
          <View style={styles.menuContainer}>
            {(() => {
              const notif = notifications.find((n) => n.id === menuNotifId);
              if (!notif) return null;
              return (
                <>
                  {notif.read ? (
                    <TouchableOpacity style={styles.menuItem} onPress={() => { handleMarkUnread(notif.id); setMenuNotifId(null); }}>
                      <IconSymbol name="envelope.fill" size={20} color="#1e3a5f" />
                      <Text style={styles.menuText}>Mark as unread</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.menuItem} onPress={() => { handleMarkRead(notif.id); setMenuNotifId(null); }}>
                      <IconSymbol name="envelope.open.fill" size={20} color="#1e3a5f" />
                      <Text style={styles.menuText}>Mark as read</Text>
                    </TouchableOpacity>
                  )}
                  {notif.actionRoute && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuNotifId(null);
                        handlePress(notif);
                      }}
                    >
                      <IconSymbol name="arrow.right.circle.fill" size={20} color="#4CAF50" />
                      <Text style={styles.menuText}>Open</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => handleDelete(notif.id)}>
                    <IconSymbol name="trash.fill" size={20} color="#FF4444" />
                    <Text style={[styles.menuText, { color: '#FF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f0f8',
    borderRadius: 16,
  },
  headerActionText: {
    fontSize: 12,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#1e3a5f',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationsList: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1e3a5f',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadText: {
    color: '#1e3a5f',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  actionHint: {
    fontSize: 11,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
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
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
