import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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

type Task = {
  id: string;
  title: string;
  project: string;
  due?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  alarm?: boolean;
  priority: string;
  status: string;
  members: string[];
};

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Design System Update', project: 'Orange Web App', due: 'Today', priority: 'High', status: 'in-progress', members: ['J', 'A', 'M'] },
  { id: '2', title: 'Client Dashboard', project: 'Orange Web App', due: 'Tomorrow', priority: 'Medium', status: 'todo', members: ['J', 'S'] },
  { id: '3', title: 'UI Kit Research', project: 'Product Design', due: 'Apr 20', priority: 'Low', status: 'completed', members: ['J'] },
  { id: '4', title: 'User Interviews', project: 'UX Research', due: 'Apr 22', priority: 'High', status: 'in-progress', members: ['J', 'A', 'K', 'L'] },
  { id: '5', title: 'Brand Guidelines', project: 'Marketing', due: 'Apr 25', priority: 'Medium', status: 'todo', members: ['J', 'M'] },
];

export default function TasksTabScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);

  // Reload tasks every time screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadTasks = async () => {
        try {
          const savedData = await storage.getItem('tasks');
          const saved = savedData ? JSON.parse(savedData) as Task[] : [];
          setTasks([...DEFAULT_TASKS, ...saved]);
        } catch {
          setTasks(DEFAULT_TASKS);
        }
      };
      loadTasks();
    }, [])
  );

  const filteredTasks = activeTab === 'all' ? tasks : 
    activeTab === 'completed' ? tasks.filter(t => t.status === 'completed') :
    activeTab === 'in-progress' ? tasks.filter(t => t.status === 'in-progress') :
    tasks.filter(t => t.status === 'todo');

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[styles.taskCard, dynamicStyles.taskCard]}
      onPress={() => router.push({ pathname: '/task-detail', params: { id: item.id } })}
    >
      <View style={styles.taskHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
        </View>
        <TouchableOpacity onPress={(e) => e.stopPropagation()}>
          <IconSymbol name="ellipsis" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.taskTitle, dynamicStyles.taskTitle]}>{item.title}</Text>
      <Text style={[styles.taskProject, dynamicStyles.taskProject]}>{item.project}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.membersContainer}>
          {item.members.slice(0, 3).map((member, idx) => (
            <View key={idx} style={[styles.memberCircle, { marginLeft: idx > 0 ? -8 : 0 }]}>
              <Text style={styles.memberInitial}>{member}</Text>
            </View>
          ))}
          {item.members.length > 3 && (
            <View style={[styles.memberCircle, { marginLeft: -8, backgroundColor: colors.border }]}>
              <Text style={[styles.memberInitial, { color: colors.textSecondary }]}>+{item.members.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.dueContainer}>
          <IconSymbol name="clock" size={14} color={item.alarm ? '#FF4444' : colors.textMuted} />
          <Text style={[styles.dueText, dynamicStyles.dueText, item.alarm && styles.alarmText]}>
            {item.dueDate || item.due}{item.dueTime ? ` at ${item.dueTime}` : ''}
            {item.alarm && ' 🔔'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.header },
    headerTitle: { color: colors.primary },
    searchContainer: { backgroundColor: colors.card },
    searchPlaceholder: { color: colors.textMuted },
    tab: { backgroundColor: colors.card },
    activeTab: { backgroundColor: colors.primary },
    tabText: { color: colors.text },
    activeTabText: { color: '#fff' },
    taskCard: { backgroundColor: colors.card },
    taskTitle: { color: colors.text },
    taskProject: { color: colors.textSecondary },
    dueText: { color: colors.textSecondary },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>My Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textMuted} />
        <Text style={[styles.searchPlaceholder, dynamicStyles.searchPlaceholder]}>Search tasks...</Text>
      </View>

      <View style={styles.tabsContainer}>
        {['all', 'todo', 'in-progress', 'completed'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, dynamicStyles.tab, activeTab === tab && dynamicStyles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, dynamicStyles.tabText, activeTab === tab && dynamicStyles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-task')}
      >
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#1e3a5f',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskProject: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersContainer: {
    flexDirection: 'row',
  },
  memberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 12,
    color: '#999',
  },
  alarmText: {
    color: '#FF4444',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
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
