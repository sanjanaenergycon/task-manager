import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

type TimeFilter = 'week' | 'month' | '30days';

type StatCard = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
};

type ProjectStat = {
  name: string;
  progress: number;
  tasks: number;
  completed: number;
  color: string;
};

type TeamMember = {
  name: string;
  avatar: string;
  tasksCompleted: number;
  efficiency: number;
  color: string;
};

const ANALYTICS_DATA: Record<TimeFilter, { stats: StatCard[]; weeklyData: { day: string; value: number }[]; projects: ProjectStat[]; team: TeamMember[]; taskBreakdown: { label: string; value: number; color: string }[]; formsData: { name: string; responses: number }[] }> = {
  week: {
    stats: [
      { label: 'Total Tasks', value: '156', change: '+12%', positive: true, icon: 'checkmark.circle.fill', color: '#2196F3' },
      { label: 'Completed', value: '89', change: '+8%', positive: true, icon: 'checkmark.seal.fill', color: '#4CAF50' },
      { label: 'In Progress', value: '45', change: '-3%', positive: false, icon: 'arrow.clockwise', color: '#FF9800' },
      { label: 'Overdue', value: '12', change: '-5%', positive: true, icon: 'exclamationmark.triangle.fill', color: '#FF4444' },
    ],
    weeklyData: [
      { day: 'Mon', value: 40 },
      { day: 'Tue', value: 65 },
      { day: 'Wed', value: 45 },
      { day: 'Thu', value: 80 },
      { day: 'Fri', value: 55 },
      { day: 'Sat', value: 30 },
      { day: 'Sun', value: 20 },
    ],
    projects: [
      { name: 'Orange Web App', progress: 75, tasks: 24, completed: 18, color: '#2196F3' },
      { name: 'Product Design', progress: 45, tasks: 18, completed: 8, color: '#FF9800' },
      { name: 'UX Research', progress: 90, tasks: 12, completed: 11, color: '#4CAF50' },
      { name: 'Marketing', progress: 30, tasks: 8, completed: 2, color: '#9C27B0' },
    ],
    team: [
      { name: 'Alex Johnson', avatar: 'A', tasksCompleted: 24, efficiency: 92, color: '#2196F3' },
      { name: 'Sarah Williams', avatar: 'S', tasksCompleted: 19, efficiency: 88, color: '#FF9800' },
      { name: 'Mike Chen', avatar: 'M', tasksCompleted: 22, efficiency: 85, color: '#4CAF50' },
      { name: 'Emily Davis', avatar: 'E', tasksCompleted: 15, efficiency: 78, color: '#9C27B0' },
      { name: 'You', avatar: 'Y', tasksCompleted: 18, efficiency: 90, color: '#1e3a5f' },
    ],
    taskBreakdown: [
      { label: 'Completed', value: 89, color: '#4CAF50' },
      { label: 'In Progress', value: 45, color: '#FF9800' },
      { label: 'Pending', value: 22, color: '#2196F3' },
      { label: 'Overdue', value: 12, color: '#FF4444' },
    ],
    formsData: [
      { name: 'Employee Feedback', responses: 45 },
      { name: 'Project Request', responses: 12 },
      { name: 'Leave Application', responses: 89 },
      { name: 'Expense Report', responses: 34 },
    ],
  },
  month: {
    stats: [
      { label: 'Total Tasks', value: '642', change: '+24%', positive: true, icon: 'checkmark.circle.fill', color: '#2196F3' },
      { label: 'Completed', value: '389', change: '+18%', positive: true, icon: 'checkmark.seal.fill', color: '#4CAF50' },
      { label: 'In Progress', value: '178', change: '+5%', positive: false, icon: 'arrow.clockwise', color: '#FF9800' },
      { label: 'Overdue', value: '45', change: '-12%', positive: true, icon: 'exclamationmark.triangle.fill', color: '#FF4444' },
    ],
    weeklyData: [
      { day: 'W1', value: 60 },
      { day: 'W2', value: 85 },
      { day: 'W3', value: 70 },
      { day: 'W4', value: 95 },
    ],
    projects: [
      { name: 'Orange Web App', progress: 75, tasks: 98, completed: 74, color: '#2196F3' },
      { name: 'Product Design', progress: 45, tasks: 62, completed: 28, color: '#FF9800' },
      { name: 'UX Research', progress: 90, tasks: 34, completed: 31, color: '#4CAF50' },
      { name: 'Marketing', progress: 30, tasks: 24, completed: 7, color: '#9C27B0' },
      { name: 'Mobile App', progress: 60, tasks: 45, completed: 27, color: '#E91E63' },
    ],
    team: [
      { name: 'Alex Johnson', avatar: 'A', tasksCompleted: 98, efficiency: 94, color: '#2196F3' },
      { name: 'Sarah Williams', avatar: 'S', tasksCompleted: 87, efficiency: 91, color: '#FF9800' },
      { name: 'Mike Chen', avatar: 'M', tasksCompleted: 92, efficiency: 88, color: '#4CAF50' },
      { name: 'Emily Davis', avatar: 'E', tasksCompleted: 71, efficiency: 82, color: '#9C27B0' },
      { name: 'You', avatar: 'Y', tasksCompleted: 85, efficiency: 93, color: '#1e3a5f' },
    ],
    taskBreakdown: [
      { label: 'Completed', value: 389, color: '#4CAF50' },
      { label: 'In Progress', value: 178, color: '#FF9800' },
      { label: 'Pending', value: 89, color: '#2196F3' },
      { label: 'Overdue', value: 45, color: '#FF4444' },
    ],
    formsData: [
      { name: 'Employee Feedback', responses: 156 },
      { name: 'Project Request', responses: 48 },
      { name: 'Leave Application', responses: 312 },
      { name: 'Expense Report', responses: 98 },
    ],
  },
  '30days': {
    stats: [
      { label: 'Total Tasks', value: '598', change: '+20%', positive: true, icon: 'checkmark.circle.fill', color: '#2196F3' },
      { label: 'Completed', value: '356', change: '+15%', positive: true, icon: 'checkmark.seal.fill', color: '#4CAF50' },
      { label: 'In Progress', value: '165', change: '+4%', positive: false, icon: 'arrow.clockwise', color: '#FF9800' },
      { label: 'Overdue', value: '38', change: '-10%', positive: true, icon: 'exclamationmark.triangle.fill', color: '#FF4444' },
    ],
    weeklyData: [
      { day: 'W1', value: 55 },
      { day: 'W2', value: 78 },
      { day: 'W3', value: 65 },
      { day: 'W4', value: 88 },
    ],
    projects: [
      { name: 'Orange Web App', progress: 72, tasks: 92, completed: 66, color: '#2196F3' },
      { name: 'Product Design', progress: 42, tasks: 58, completed: 24, color: '#FF9800' },
      { name: 'UX Research', progress: 88, tasks: 32, completed: 28, color: '#4CAF50' },
      { name: 'Marketing', progress: 28, tasks: 22, completed: 6, color: '#9C27B0' },
    ],
    team: [
      { name: 'Alex Johnson', avatar: 'A', tasksCompleted: 91, efficiency: 93, color: '#2196F3' },
      { name: 'Sarah Williams', avatar: 'S', tasksCompleted: 82, efficiency: 89, color: '#FF9800' },
      { name: 'Mike Chen', avatar: 'M', tasksCompleted: 86, efficiency: 87, color: '#4CAF50' },
      { name: 'Emily Davis', avatar: 'E', tasksCompleted: 67, efficiency: 81, color: '#9C27B0' },
      { name: 'You', avatar: 'Y', tasksCompleted: 79, efficiency: 92, color: '#1e3a5f' },
    ],
    taskBreakdown: [
      { label: 'Completed', value: 356, color: '#4CAF50' },
      { label: 'In Progress', value: 165, color: '#FF9800' },
      { label: 'Pending', value: 82, color: '#2196F3' },
      { label: 'Overdue', value: 38, color: '#FF4444' },
    ],
    formsData: [
      { name: 'Employee Feedback', responses: 142 },
      { name: 'Project Request', responses: 45 },
      { name: 'Leave Application', responses: 298 },
      { name: 'Expense Report', responses: 91 },
    ],
  },
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('week');
  const data = ANALYTICS_DATA[activeFilter];

  const totalTasks = data.taskBreakdown.reduce((sum, t) => sum + t.value, 0);

  const handleExport = () => {
    const report = `WorkNest Analytics Report\nFilter: ${activeFilter === '30days' ? 'Last 30 Days' : activeFilter === 'month' ? 'This Month' : 'This Week'}\n\nTotal Tasks: ${data.stats[0].value}\nCompleted: ${data.stats[1].value}\nIn Progress: ${data.stats[2].value}\nOverdue: ${data.stats[3].value}\n\nGenerated on ${new Date().toLocaleDateString()}`;
    
    if (Platform.OS === 'web') {
      alert(report);
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Report', report);
    }
  };

  const handleShare = () => {
    if (Platform.OS === 'web') {
      alert('Report link copied to clipboard!');
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Shared', 'Analytics report shared with team!');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={handleShare}>
          <IconSymbol name="square.and.arrow.up" size={22} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {([
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: '30days', label: 'Last 30 Days' },
        ] as { id: TimeFilter; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterTab, activeFilter === f.id && styles.filterTabActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text style={[styles.filterTabText, activeFilter === f.id && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {data.stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
              <IconSymbol name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={styles.changeContainer}>
              <IconSymbol
                name={stat.positive ? 'arrow.up' : 'arrow.down'}
                size={12}
                color={stat.positive ? '#4CAF50' : '#FF4444'}
              />
              <Text style={[styles.changeText, { color: stat.positive ? '#4CAF50' : '#FF4444' }]}>
                {stat.change}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Weekly Activity Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <Text style={styles.sectionSubtitle}>{data.weeklyData.reduce((s, d) => s + d.value, 0)} total</Text>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {data.weeklyData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: Math.max(item.value * 1.2, 10) }]} />
                </View>
                <Text style={styles.barValue}>{item.value}</Text>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Task Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Status Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.donutContainer}>
            {data.taskBreakdown.map((item, index) => {
              const percentage = Math.round((item.value / totalTasks) * 100);
              return (
                <View key={index} style={styles.breakdownItem}>
                  <View style={styles.breakdownRow}>
                    <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownValue}>{item.value}</Text>
                    <Text style={styles.breakdownPercent}>{percentage}%</Text>
                  </View>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${percentage}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Project Progress */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Project Progress</Text>
          <Text style={styles.sectionSubtitle}>{data.projects.length} projects</Text>
        </View>
        {data.projects.map((project, index) => (
          <View key={index} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectNameRow}>
                <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                <Text style={styles.projectName}>{project.name}</Text>
              </View>
              <Text style={styles.projectTasks}>{project.completed}/{project.tasks} tasks</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: project.color }]} />
              </View>
              <Text style={[styles.progressText, { color: project.color }]}>{project.progress}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Team Productivity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Productivity</Text>
          <Text style={styles.sectionSubtitle}>Top performers</Text>
        </View>
        <View style={styles.teamCard}>
          {data.team.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={[styles.teamAvatar, { backgroundColor: member.color }]}>
                <Text style={styles.teamAvatarText}>{member.avatar}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <View style={styles.teamStatsRow}>
                  <Text style={styles.teamStatText}>{member.tasksCompleted} tasks</Text>
                  <Text style={styles.teamStatDot}>•</Text>
                  <Text style={styles.teamStatText}>{member.efficiency}% efficiency</Text>
                </View>
              </View>
              <View style={styles.teamRank}>
                <Text style={styles.teamRankText}>#{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Forms Responses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Form Responses</Text>
          <Text style={styles.sectionSubtitle}>{data.formsData.reduce((s, f) => s + f.responses, 0)} total</Text>
        </View>
        <View style={styles.formsCard}>
          {data.formsData.map((form, index) => (
            <View key={index} style={styles.formRow}>
              <View style={styles.formInfo}>
                <Text style={styles.formName}>{form.name}</Text>
                <View style={styles.formBarBg}>
                  <View
                    style={[
                      styles.formBarFill,
                      {
                        width: `${Math.min((form.responses / 350) * 100, 100)}%`,
                        backgroundColor: ['#2196F3', '#FF9800', '#4CAF50', '#9C27B0'][index],
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.formResponseCount}>{form.responses}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <IconSymbol name="doc.text.fill" size={20} color="#1e3a5f" />
        <Text style={styles.exportButtonText}>Export Report</Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1e3a5f',
  },
  filterTabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
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
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 32,
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: '#1e3a5f',
    borderRadius: 6,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  donutContainer: {
    gap: 14,
  },
  breakdownItem: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  breakdownPercent: {
    fontSize: 13,
    color: '#999',
    minWidth: 35,
    textAlign: 'right',
  },
  breakdownBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  projectTasks: {
    fontSize: 12,
    color: '#999',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 35,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  teamStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  teamStatText: {
    fontSize: 12,
    color: '#999',
  },
  teamStatDot: {
    fontSize: 12,
    color: '#ddd',
  },
  teamRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  formsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  formBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  formBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  formResponseCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    minWidth: 40,
    textAlign: 'right',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  bottomPadding: {
    height: 40,
  },
});
