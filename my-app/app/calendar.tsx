import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(17);
  const [currentMonth, setCurrentMonth] = useState('April 2026');

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];       
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  
  const events = [
    { id: '1', title: 'Team Standup', time: '9:00 AM', type: 'meeting', color: '#1e3a5f' },
    { id: '2', title: 'Design Review', time: '11:00 AM', type: 'work', color: '#FF9800' },
    { id: '3', title: 'Client Call', time: '2:00 PM', type: 'call', color: '#4CAF50' },
    { id: '4', title: 'Project Deadline', time: '5:00 PM', type: 'deadline', color: '#FF4444' },
  ];

  const getDayPosition = (day: number) => {
    // April 2026 starts on Wednesday (index 3)
    const startDay = 3;
    return (startDay + day - 1) % 7;
  };

  const getWeekNumber = (day: number) => {
    const startDay = 3;
    return Math.floor((startDay + day - 1) / 7);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity>
          <IconSymbol name="plus" size={24} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      <View style={styles.monthContainer}>
        <TouchableOpacity>
          <IconSymbol name="chevron.left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth}</Text>
        <TouchableOpacity>
          <IconSymbol name="chevron.right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {/* Empty cells for days before the 1st */}
          {[0, 1, 2].map((i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                selectedDate === day && styles.selectedDay,
                day === 17 && styles.today,
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[
                styles.dayText,
                selectedDate === day && styles.selectedDayText,
                day === 17 && styles.todayText,
              ]}>
                {day}
              </Text>
              {(day === 17 || day === 20 || day === 25) && (
                <View style={styles.eventDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Events</Text>
          <Text style={styles.dateText}>April 17, 2026</Text>
        </View>
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={[styles.eventTimeIndicator, { backgroundColor: event.color }]} />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>
            <TouchableOpacity style={styles.eventMenu}>
              <IconSymbol name="ellipsis" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.upcomingCard}>
          <View style={styles.upcomingItem}>
            <View style={styles.upcomingDate}>
              <Text style={styles.upcomingDay}>20</Text>
              <Text style={styles.upcomingMonth}>Apr</Text>
            </View>
            <View style={styles.upcomingContent}>
              <Text style={styles.upcomingTitle}>Product Launch</Text>
              <Text style={styles.upcomingDesc}>All team members required</Text>
            </View>
          </View>
          <View style={styles.upcomingDivider} />
          <View style={styles.upcomingItem}>
            <View style={styles.upcomingDate}>
              <Text style={styles.upcomingDay}>25</Text>
              <Text style={styles.upcomingMonth}>Apr</Text>
            </View>
            <View style={styles.upcomingContent}>
              <Text style={styles.upcomingTitle}>Quarterly Review</Text>
              <Text style={styles.upcomingDesc}>Performance evaluation</Text>
            </View>
          </View>
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
  monthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#1e3a5f',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  today: {
    borderWidth: 2,
    borderColor: '#1e3a5f',
    borderRadius: 20,
  },
  todayText: {
    fontWeight: '600',
    color: '#1e3a5f',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF4444',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
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
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventTimeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  eventMenu: {
    padding: 8,
  },
  upcomingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDate: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  upcomingMonth: {
    fontSize: 11,
    color: '#666',
  },
  upcomingContent: {
    marginLeft: 16,
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  upcomingDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  upcomingDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
