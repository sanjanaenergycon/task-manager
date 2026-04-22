import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const menuItems = [
    { icon: 'chart.bar.fill', label: 'Dashboard', route: '/dashboard' as const },
    { icon: 'checkmark.circle.fill', label: 'My Tasks', route: '/tasks' as const },
    { icon: 'message.fill', label: 'Team Chat', route: '/chat' as const },
    { icon: 'doc.fill', label: 'Docs', route: '/docs' as const },
    { icon: 'chart.pie.fill', label: 'Analytics', route: '/analytics' as const },
    { icon: 'person.fill', label: 'Profile', route: '/profile' as const },
    { icon: 'square.and.pencil', label: 'Notepad', route: '/notepad' as const },
    { icon: 'calendar', label: 'Calendar', route: '/calendar' as const },
    { icon: 'doc.text.fill', label: 'Forms', route: '/forms' as const },
    { icon: 'tray.fill', label: 'Inbox', route: '/inbox' as const },
    { icon: 'list.bullet', label: 'Planner', route: '/planner' as const },
  ];

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.header },
    greeting: { color: colors.primary },
    subGreeting: { color: colors.textSecondary },
    searchContainer: { backgroundColor: colors.card },
    searchPlaceholder: { color: colors.textMuted },
    sectionTitle: { color: colors.text },
    recentCard: { backgroundColor: colors.card },
    recentTitle: { color: colors.text },
    recentSubtitle: { color: colors.textSecondary },
    gridItem: { backgroundColor: colors.card },
    iconContainer: { backgroundColor: colors.primary + '20' },
    gridLabel: { color: colors.text },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, dynamicStyles.header]}>
        <View>
          <Text style={[styles.greeting, dynamicStyles.greeting]}>Hi Jennifer!</Text>
          <Text style={[styles.subGreeting, dynamicStyles.subGreeting]}>Welcome back</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textMuted} />
        <Text style={[styles.searchPlaceholder, dynamicStyles.searchPlaceholder]}>Search...</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recent</Text>
        <View style={[styles.recentCard, dynamicStyles.recentCard]}>
          <View style={styles.recentImage}>
            <Text style={styles.recentIcon}>📊</Text>
          </View>
          <View style={styles.recentInfo}>
            <Text style={[styles.recentTitle, dynamicStyles.recentTitle]}>Project Dashboard</Text>
            <Text style={[styles.recentSubtitle, dynamicStyles.recentSubtitle]}>Last edited 2h ago</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <IconSymbol name="ellipsis" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quick Access</Text>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.gridItem, dynamicStyles.gridItem]}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
                <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.gridLabel, dynamicStyles.gridLabel]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#999',
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentIcon: {
    fontSize: 24,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  recentSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});
