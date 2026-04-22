import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';

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
  description?: string;
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

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState(false);

  useEffect(() => {
    // Find task from default tasks or localStorage
    const defaultTask = DEFAULT_TASKS.find(t => t.id === id);
    if (defaultTask) {
      setTask(defaultTask);
      setAlarmEnabled(defaultTask.alarm || false);
    } else {
      // Check storage
      const loadTask = async () => {
        try {
          const savedData = await storage.getItem('tasks');
          const saved = savedData ? JSON.parse(savedData) as Task[] : [];
          const savedTask = saved.find(t => t.id === id);
          if (savedTask) {
            setTask(savedTask);
            setAlarmEnabled(savedTask.alarm || false);
          }
        } catch {
          console.error('Error loading task');
        }
      };
      loadTask();
    }
  }, [id]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'todo': return '#FF9800';
      default: return '#999';
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading task...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Detail</Text>
        <TouchableOpacity>
          <IconSymbol name="ellipsis" size={24} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Priority & Status */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
              {task.priority} Priority
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
              {task.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{task.title}</Text>

        {/* Project */}
        <View style={styles.infoRow}>
          <IconSymbol name="folder.fill" size={20} color="#666" />
          <Text style={styles.infoText}>{task.project}</Text>
        </View>

        {/* Due Date */}
        <View style={styles.infoRow}>
          <IconSymbol name="calendar" size={20} color="#666" />
          <Text style={styles.infoText}>
            {task.dueDate || task.due}
            {task.dueTime && ` at ${task.dueTime}`}
          </Text>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned To</Text>
          <View style={styles.membersRow}>
            {task.members.map((member, idx) => (
              <View key={idx} style={[styles.memberCircle, { marginLeft: idx > 0 ? -8 : 0 }]}>
                <Text style={styles.memberInitial}>{member}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addMemberButton}>
              <IconSymbol name="plus" size={16} color="#1e3a5f" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Alarm Toggle */}
        <View style={styles.alarmSection}>
          <View style={styles.alarmLeft}>
            <View style={styles.alarmIcon}>
              <IconSymbol name="bell.fill" size={20} color="#1e3a5f" />
            </View>
            <View>
              <Text style={styles.alarmTitle}>Reminder Alarm</Text>
              <Text style={styles.alarmSubtitle}>Get notified before due time</Text>
            </View>
          </View>
          <Switch
            value={alarmEnabled}
            onValueChange={setAlarmEnabled}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => alert('Task marked as completed!')}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => alert('Edit task coming soon!')}
          >
            <IconSymbol name="square.and.pencil" size={20} color="#1e3a5f" />
            <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit Task</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              const deleteTask = async () => {
                // Delete from storage
                try {
                  const savedData = await storage.getItem('tasks');
                  const saved = savedData ? JSON.parse(savedData) : [];
                  const updated = saved.filter((t: any) => t.id !== id);
                  await storage.setItem('tasks', JSON.stringify(updated));
                } catch {
                  console.error('Error deleting task');
                }
                Alert.alert('Success', 'Task deleted successfully!');
                router.back();
              };

              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteTask();
                }
              } else {
                Alert.alert(
                  'Delete Task',
                  'Are you sure you want to delete this task?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: deleteTask },
                  ]
                );
              }
            }}
          >
            <IconSymbol name="trash.fill" size={20} color="#FF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addMemberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
  },
  alarmSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  alarmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  alarmSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionsSection: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  editButtonText: {
    color: '#1e3a5f',
  },
  deleteButtonText: {
    color: '#FF4444',
  },
  bottomPadding: {
    height: 40,
  },
});
