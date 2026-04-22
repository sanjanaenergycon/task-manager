import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function TasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const tasks = [
    { id: '1', title: 'Design System Update', project: 'Orange Web App', due: 'Today', priority: 'High', status: 'in-progress', members: ['J', 'A', 'M'] },
    { id: '2', title: 'Client Dashboard', project: 'Orange Web App', due: 'Tomorrow', priority: 'Medium', status: 'todo', members: ['J', 'S'] },
    { id: '3', title: 'UI Kit Research', project: 'Product Design', due: 'Apr 20', priority: 'Low', status: 'completed', members: ['J'] },
    { id: '4', title: 'User Interviews', project: 'UX Research', due: 'Apr 22', priority: 'High', status: 'in-progress', members: ['J', 'A', 'K', 'L'] },
    { id: '5', title: 'Brand Guidelines', project: 'Marketing', due: 'Apr 25', priority: 'Medium', status: 'todo', members: ['J', 'M'] },
  ];

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

  const renderTask = ({ item }: { item: typeof tasks[0] }) => (
    <TouchableOpacity style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
        </View>
        <TouchableOpacity>
          <IconSymbol name="ellipsis" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskProject}>{item.project}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.membersContainer}>
          {item.members.slice(0, 3).map((member, idx) => (
            <View key={idx} style={[styles.memberCircle, { marginLeft: idx > 0 ? -8 : 0 }]}>
              <Text style={styles.memberInitial}>{member}</Text>
            </View>
          ))}
          {item.members.length > 3 && (
            <View style={[styles.memberCircle, { marginLeft: -8, backgroundColor: '#ddd' }]}>
              <Text style={[styles.memberInitial, { color: '#666' }]}>+{item.members.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.dueContainer}>
          <IconSymbol name="clock" size={14} color="#999" />
          <Text style={styles.dueText}>{item.due}</Text>
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
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <Text style={styles.searchPlaceholder}>Search tasks...</Text>
      </View>

      <View style={styles.tabsContainer}>
        {['all', 'todo', 'in-progress', 'completed'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
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
