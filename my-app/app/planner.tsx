import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Platform, Modal } from 'react-native';
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

type PlannerEvent = {
  id: string;
  title: string;
  duration: string;
  type: 'meeting' | 'work' | 'call' | 'break' | 'deadline' | 'reminder';
  color: string;
  time: string;
  date: string;
};

type Priority = {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
};

const EVENT_COLORS: Record<string, string> = {
  meeting: '#1e3a5f',
  work: '#FF9800',
  call: '#2196F3',
  break: '#4CAF50',
  deadline: '#FF4444',
  reminder: '#9C27B0',
};

const EVENT_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  work: 'Work',
  call: 'Call',
  break: 'Break',
  deadline: 'Deadline',
  reminder: 'Reminder',
};

const DEFAULT_EVENTS: PlannerEvent[] = [
  { id: '1', title: 'Team Standup', duration: '30 min', type: 'meeting', color: '#1e3a5f', time: '9:00 AM', date: 'today' },
  { id: '2', title: 'Design Review', duration: '1 hr', type: 'work', color: '#FF9800', time: '10:00 AM', date: 'today' },
  { id: '3', title: 'Lunch Break', duration: '1 hr', type: 'break', color: '#4CAF50', time: '12:00 PM', date: 'today' },
  { id: '4', title: 'Client Call', duration: '45 min', type: 'call', color: '#2196F3', time: '2:00 PM', date: 'today' },
  { id: '5', title: 'Focus Time', duration: '2 hr', type: 'work', color: '#9C27B0', time: '3:00 PM', date: 'today' },
  { id: '6', title: 'Project Deadline', duration: 'All day', type: 'deadline', color: '#FF4444', time: '5:00 PM', date: 'today' },
];

const DEFAULT_PRIORITIES: Priority[] = [
  { id: '1', title: 'Complete dashboard design', priority: 'High', completed: false },
  { id: '2', title: 'Review pull requests', priority: 'Medium', completed: true },
  { id: '3', title: 'Update documentation', priority: 'Low', completed: false },
  { id: '4', title: "Prepare for tomorrow's meeting", priority: 'High', completed: false },
];

const EVENTS_KEY = 'worknest_planner_events';
const PRIORITIES_KEY = 'worknest_planner_priorities';

const TIME_SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

export default function PlannerScreen() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState('day');
  const [events, setEvents] = useState<PlannerEvent[]>(DEFAULT_EVENTS);
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [menuType, setMenuType] = useState<'event' | 'priority' | null>(null);

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('9:00 AM');
  const [eventDuration, setEventDuration] = useState('1 hr');
  const [eventType, setEventType] = useState<PlannerEvent['type']>('meeting');

  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityTitle, setPriorityTitle] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<Priority['priority']>('Medium');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedEvents = await storage.getItem(EVENTS_KEY);
        const savedPriorities = await storage.getItem(PRIORITIES_KEY);
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        else setEvents(DEFAULT_EVENTS);
        if (savedPriorities) setPriorities(JSON.parse(savedPriorities));
        else setPriorities(DEFAULT_PRIORITIES);
      };
      loadData();
    }, [])
  );

  const saveEvents = async (newEvents: PlannerEvent[]) => {
    setEvents(newEvents);
    await storage.setItem(EVENTS_KEY, JSON.stringify(newEvents));
  };

  const savePriorities = async (newPriorities: Priority[]) => {
    setPriorities(newPriorities);
    await storage.setItem(PRIORITIES_KEY, JSON.stringify(newPriorities));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const goToToday = () => setCurrentDate(new Date());
  const goPrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#999';
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) {
      if (Platform.OS === 'web') alert('Please enter event title');
      return;
    }
    const newEvent: PlannerEvent = {
      id: Date.now().toString(),
      title: eventTitle.trim(),
      duration: eventDuration,
      type: eventType,
      color: EVENT_COLORS[eventType],
      time: eventTime,
      date: 'today',
    };
    await saveEvents([...events, newEvent]);
    setShowEventModal(false);
    setEventTitle('');
    setEventTime('9:00 AM');
    setEventDuration('1 hr');
    setEventType('meeting');
  };

  const handleAddPriority = async () => {
    if (!priorityTitle.trim()) {
      if (Platform.OS === 'web') alert('Please enter priority title');
      return;
    }
    const newPriority: Priority = {
      id: Date.now().toString(),
      title: priorityTitle.trim(),
      priority: priorityLevel,
      completed: false,
    };
    await savePriorities([...priorities, newPriority]);
    setShowPriorityModal(false);
    setPriorityTitle('');
    setPriorityLevel('Medium');
  };

  const togglePriority = async (id: string) => {
    const updated = priorities.map((p) =>
      p.id === id ? { ...p, completed: !p.completed } : p
    );
    await savePriorities(updated);
  };

  const handleDelete = async () => {
    if (!menuItemId || !menuType) return;
    if (menuType === 'event') {
      await saveEvents(events.filter((e) => e.id !== menuItemId));
    } else {
      await savePriorities(priorities.filter((p) => p.id !== menuItemId));
    }
    setMenuItemId(null);
    setMenuType(null);
  };

  const handleDeleteCompleted = async () => {
    await savePriorities(priorities.filter((p) => !p.completed));
  };

  const getEventsForTime = (time: string) => events.filter((e) => e.time === time);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planner</Text>
          <TouchableOpacity onPress={goToToday}>
            <Text style={styles.todayButton}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSection}>
          <View style={styles.dateNav}>
            <TouchableOpacity onPress={goPrevDay}>
              <IconSymbol name="chevron.left" size={24} color="#1e3a5f" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            <TouchableOpacity onPress={goNextDay}>
              <IconSymbol name="chevron.right" size={24} color="#1e3a5f" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewToggle}>
            {['day', 'week'].map((view) => (
              <TouchableOpacity
                key={view}
                style={[styles.viewButton, selectedView === view && styles.viewButtonActive]}
                onPress={() => setSelectedView(view)}
              >
                <Text style={[styles.viewButtonText, selectedView === view && styles.viewButtonTextActive]}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedView === 'day' ? (
          <>
            {/* Weekly mini calendar */}
            <View style={styles.miniCalendar}>
              <View style={styles.weekRow}>
                {getWeekDates().map((date, idx) => (
                  <TouchableOpacity key={idx} style={styles.dayCell} onPress={() => setCurrentDate(date)}>
                    <Text style={[styles.dayLabel, isSelected(date) && styles.dayLabelActive]}>{weekDays[idx]}</Text>
                    <View style={[styles.dayNumberBox, isSelected(date) && styles.dayNumberBoxActive]}>
                      <Text style={[styles.dayNumber, isSelected(date) && styles.dayNumberActive]}>{date.getDate()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                <TouchableOpacity onPress={() => setShowEventModal(true)}>
                  <Text style={styles.addButton}>+ Add Event</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeline}>
                {TIME_SLOTS.map((slot, index) => {
                  const slotEvents = getEventsForTime(slot);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.timeSlot}
                      onPress={() => { setEventTime(slot); setShowEventModal(true); }}
                    >
                      <Text style={styles.timeText}>{slot}</Text>
                      <View style={styles.slotContent}>
                        {slotEvents.length > 0 ? (
                          slotEvents.map((task) => (
                            <TouchableOpacity
                              key={task.id}
                              style={[styles.taskCard, { backgroundColor: task.color + '15', borderLeftColor: task.color }]}
                              onLongPress={() => { setMenuItemId(task.id); setMenuType('event'); }}
                              delayLongPress={500}
                            >
                              <Text style={[styles.taskTitle, { color: task.color }]}>{task.title}</Text>
                              <View style={styles.taskMeta}>
                                <Text style={styles.taskDuration}>{task.duration}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: task.color + '20' }]}>
                                  <Text style={[styles.typeBadgeText, { color: task.color }]}>{EVENT_LABELS[task.type]}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.emptySlot} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Week View</Text>
            <View style={styles.weekViewContainer}>
              {getWeekDates().map((date, idx) => (
                <View key={idx} style={[styles.weekDayColumn, isSelected(date) && styles.weekDayColumnActive]}>
                  <Text style={[styles.weekDayHeader, isSelected(date) && styles.weekDayHeaderActive]}>
                    {weekDays[idx]} {date.getDate()}
                  </Text>
                  {events.slice(0, 2).map((e) => (
                    <View key={`${idx}-${e.id}`} style={[styles.weekEvent, { backgroundColor: e.color + '20' }]}>
                      <Text style={[styles.weekEventText, { color: e.color }]} numberOfLines={1}>{e.title}</Text>
                      <Text style={styles.weekEventTime}>{e.time}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Priorities</Text>
            <TouchableOpacity onPress={() => setShowPriorityModal(true)}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {priorities.length > 0 ? (
            priorities.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.priorityCard}
                onPress={() => togglePriority(item.id)}
                onLongPress={() => { setMenuItemId(item.id); setMenuType('priority'); }}
                delayLongPress={500}
              >
                <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                  {item.completed && <IconSymbol name="checkmark" size={14} color="#fff" />}
                </View>
                <View style={styles.priorityContent}>
                  <Text style={[styles.priorityTitle, item.completed && styles.priorityTitleCompleted]}>
                    {item.title}
                  </Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No priorities yet. Tap + Add to create one!</Text>
            </View>
          )}

          {priorities.some((p) => p.completed) && (
            <TouchableOpacity style={styles.clearCompletedButton} onPress={handleDeleteCompleted}>
              <Text style={styles.clearCompletedText}>Clear Completed</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Long Press Menu */}
      {menuItemId && menuType && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuOverlayTouch} onPress={() => { setMenuItemId(null); setMenuType(null); }} />
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <IconSymbol name="trash.fill" size={20} color="#FF4444" />
              <Text style={[styles.menuText, { color: '#FF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Event Modal */}
      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Event title"
              placeholderTextColor="#999"
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <Text style={styles.modalLabel}>Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              <View style={styles.timeRow}>
                {TIME_SLOTS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeOption, eventTime === t && styles.timeOptionActive]}
                    onPress={() => setEventTime(t)}
                  >
                    <Text style={[styles.timeOptionText, eventTime === t && styles.timeOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(EVENT_COLORS) as PlannerEvent['type'][]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, eventType === type && { borderColor: EVENT_COLORS[type], borderWidth: 2 }]}
                  onPress={() => setEventType(type)}
                >
                  <View style={[styles.typeDot, { backgroundColor: EVENT_COLORS[type] }]} />
                  <Text style={styles.typeOptionText}>{EVENT_LABELS[type]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleAddEvent}>
              <Text style={styles.createButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Priority Modal */}
      <Modal visible={showPriorityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Priority</Text>
              <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Priority title"
              placeholderTextColor="#999"
              value={priorityTitle}
              onChangeText={setPriorityTitle}
            />

            <Text style={styles.modalLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.priorityOption, priorityLevel === level && { borderColor: getPriorityColor(level), borderWidth: 2 }]}
                  onPress={() => setPriorityLevel(level)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(level) }]} />
                  <Text style={styles.priorityOptionText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleAddPriority}>
              <Text style={styles.createButtonText}>Add Priority</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  todayButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a5f',
    backgroundColor: '#e8f0f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#1e3a5f',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#666',
  },
  viewButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  miniCalendar: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    color: '#999',
  },
  dayLabelActive: {
    color: '#1e3a5f',
    fontWeight: '600',
  },
  dayNumberBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberBoxActive: {
    backgroundColor: '#1e3a5f',
  },
  dayNumber: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  dayNumberActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  timeline: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timeText: {
    width: 70,
    fontSize: 12,
    color: '#999',
    paddingTop: 8,
  },
  slotContent: {
    flex: 1,
  },
  taskCard: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  taskDuration: {
    fontSize: 12,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptySlot: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  weekViewContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDayColumn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    minHeight: 200,
  },
  weekDayColumnActive: {
    backgroundColor: '#e8f0f8',
  },
  weekDayHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  weekDayHeaderActive: {
    color: '#1e3a5f',
  },
  weekEvent: {
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  weekEventText: {
    fontSize: 10,
    fontWeight: '600',
  },
  weekEventTime: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  priorityTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clearCompletedButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  clearCompletedText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  bottomPadding: {
    height: 100,
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
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  timeScroll: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  timeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  timeOptionActive: {
    backgroundColor: '#1e3a5f',
  },
  timeOptionText: {
    fontSize: 13,
    color: '#666',
  },
  timeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeOptionText: {
    fontSize: 13,
    color: '#333',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
