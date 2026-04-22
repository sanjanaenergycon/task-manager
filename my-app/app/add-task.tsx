import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function AddTaskScreen() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedProject, setSelectedProject] = useState('Orange Web App');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; role: string; color: string }[]>([]);

  const priorities = ['Low', 'Medium', 'High'];
  const projects = ['Orange Web App', 'Product Design', 'UX Research', 'Marketing'];

  const TEAM_USERS = [
    { id: '1', name: 'Jennifer Smith', role: 'Product Designer', color: '#1e3a5f' },
    { id: '2', name: 'Alex Johnson', role: 'Developer', color: '#4CAF50' },
    { id: '3', name: 'Sarah Williams', role: 'Project Manager', color: '#FF9800' },
    { id: '4', name: 'Mike Brown', role: 'QA Engineer', color: '#9C27B0' },
    { id: '5', name: 'Emily Davis', role: 'UI Designer', color: '#E91E63' },
    { id: '6', name: 'David Wilson', role: 'Backend Dev', color: '#2196F3' },
    { id: '7', name: 'Lisa Anderson', role: 'Frontend Dev', color: '#00BCD4' },
    { id: '8', name: 'Tom Martinez', role: 'DevOps', color: '#795548' },
  ];

  const toggleUserSelection = (user: typeof TEAM_USERS[0]) => {
    const isSelected = selectedUsers.find(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a task name');
      } else {
        Alert.alert('Error', 'Please enter a task name');
      }
      return;
    }
    
    // Create task object
    const newTask = {
      id: Date.now().toString(),
      title: taskName,
      description: description,
      project: selectedProject,
      priority: selectedPriority,
      dueDate: selectedDate,
      dueTime: selectedTime,
      alarm: alarmEnabled,
      status: 'todo',
      members: selectedUsers.map(u => u.name.charAt(0)),
    };
    
    // Save to storage
    try {
      const existingData = await storage.getItem('tasks');
      const existingTasks = existingData ? JSON.parse(existingData) : [];
      existingTasks.push(newTask);
      await storage.setItem('tasks', JSON.stringify(existingTasks));
    } catch {
      console.error('Error saving task');
    }
    
    if (Platform.OS === 'web') {
      window.alert('Task saved successfully!' + (alarmEnabled ? ' Alarm set!' : ''));
    } else {
      Alert.alert('Success', 'Task saved successfully!' + (alarmEnabled ? ' Alarm set!' : ''));
    }
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Task</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task name"
            value={taskName}
            onChangeText={setTaskName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project</Text>
          <View style={styles.optionsContainer}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project}
                style={[styles.optionButton, selectedProject === project && styles.optionButtonActive]}
                onPress={() => setSelectedProject(project)}
              >
                <Text style={[styles.optionText, selectedProject === project && styles.optionTextActive]}>
                  {project}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.optionButton, 
                  selectedPriority === priority && styles.optionButtonActive,
                  priority === 'High' && styles.highPriority,
                  priority === 'Medium' && styles.mediumPriority,
                  priority === 'Low' && styles.lowPriority,
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <Text style={[
                  styles.optionText, 
                  selectedPriority === priority && styles.optionTextActive,
                  priority === 'High' && styles.highPriorityText,
                  priority === 'Medium' && styles.mediumPriorityText,
                  priority === 'Low' && styles.lowPriorityText,
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(!showDatePicker)}>
            <IconSymbol name="calendar" size={20} color="#666" />
            <Text style={styles.dateText}>{selectedDate || 'Select Date'}</Text>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <View style={styles.pickerContainer}>
              {['Today', 'Tomorrow', 'Next Week'].map((date) => (
                <TouchableOpacity
                  key={date}
                  style={styles.pickerOption}
                  onPress={() => {
                    const today = new Date();
                    let selected = new Date();
                    if (date === 'Tomorrow') selected.setDate(today.getDate() + 1);
                    if (date === 'Next Week') selected.setDate(today.getDate() + 7);
                    setSelectedDate(formatDate(selected));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(!showTimePicker)}>
            <IconSymbol name="clock" size={20} color="#666" />
            <Text style={styles.dateText}>{selectedTime || 'Select Time'}</Text>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
          
          {showTimePicker && (
            <View style={styles.pickerContainer}>
              {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.alarmContainer}>
            <View style={styles.alarmLeft}>
              <View style={styles.alarmIcon}>
                <IconSymbol name="bell.fill" size={20} color="#1e3a5f" />
              </View>
              <View>
                <Text style={styles.alarmTitle}>Set Alarm</Text>
                <Text style={styles.alarmSubtitle}>Get notified before due time</Text>
              </View>
            </View>
            <Switch
              value={alarmEnabled}
              onValueChange={setAlarmEnabled}
              trackColor={{ false: '#ddd', true: '#1e3a5f' }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Assign To</Text>
          <TouchableOpacity style={styles.assignButton} onPress={() => setShowUserPicker(!showUserPicker)}>
            <View style={styles.assignLeft}>
              <View style={styles.assignIcon}>
                <IconSymbol name="person.badge.plus" size={20} color="#1e3a5f" />
              </View>
              <View>
                <Text style={styles.assignText}>
                  {selectedUsers.length > 0 ? `${selectedUsers.length} member(s) selected` : 'Assign members'}
                </Text>
                {selectedUsers.length > 0 && (
                  <View style={styles.selectedUsersRow}>
                    {selectedUsers.map((user, idx) => (
                      <Text key={idx} style={styles.selectedUserText}>{user.name}{idx < selectedUsers.length - 1 ? ', ' : ''}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>

          {showUserPicker && (
            <View style={styles.userPickerContainer}>
              <View style={styles.userPickerHeader}>
                <Text style={styles.userPickerTitle}>Select Team Members</Text>
                <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                  <Text style={styles.userPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              {TEAM_USERS.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userOption}
                  onPress={() => toggleUserSelection(user)}
                >
                  <View style={styles.userInfo}>
                    <View style={[styles.userAvatar, { backgroundColor: user.color }]}>
                      <Text style={styles.userInitial}>{user.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userRole}>{user.role}</Text>
                    </View>
                  </View>
                  <View style={[styles.checkbox, selectedUsers.find(u => u.id === user.id) && styles.checkboxSelected]}>
                    {selectedUsers.find(u => u.id === user.id) && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveTask}
      >
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>

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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  highPriority: {
    borderColor: '#FF4444',
  },
  highPriorityText: {
    color: '#FF4444',
  },
  mediumPriority: {
    borderColor: '#FF9800',
  },
  mediumPriorityText: {
    color: '#FF9800',
  },
  lowPriority: {
    borderColor: '#4CAF50',
  },
  lowPriorityText: {
    color: '#4CAF50',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  assignLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assignIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#1e3a5f',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  alarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alarmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
  selectedUsersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  selectedUserText: {
    fontSize: 12,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  userPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  userPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userPickerDone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
});
