import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { theme, toggleTheme, colors } = useTheme();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const darkMode = theme === 'dark';

  const menuItems = [
    { icon: 'person.fill', label: 'Edit Profile', route: '/edit-profile' },
    { icon: 'bell.fill', label: 'Notifications', route: null, toggle: true, value: notifications, onToggle: setNotifications },
    { icon: 'moon.fill', label: 'Dark Mode', route: null, toggle: true, value: darkMode, onToggle: toggleTheme },
    { icon: 'lock.fill', label: 'Privacy & Security', route: '/privacy-security' },
    { icon: 'questionmark.circle.fill', label: 'Help & Support', route: '/help-support' },
    { icon: 'doc.text.fill', label: 'Terms of Service', route: '/terms-of-service' },
  ];

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.header },
    headerTitle: { color: colors.primary },
    profileSection: { backgroundColor: colors.card },
    name: { color: colors.text },
    email: { color: colors.textSecondary },
    roleBadge: { backgroundColor: colors.primary + '20' },
    roleText: { color: colors.primary },
    statsContainer: { backgroundColor: colors.card },
    statNumber: { color: colors.primary },
    statLabel: { color: colors.textSecondary },
    statDivider: { backgroundColor: colors.border },
    menuItem: { backgroundColor: colors.card },
    menuLabel: { color: colors.text },
    menuIconContainer: { backgroundColor: colors.primary + '20' },
    logoutButton: { backgroundColor: colors.card },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Profile</Text>
        <TouchableOpacity>
          <IconSymbol name="gear" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.profileSection, dynamicStyles.profileSection]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <IconSymbol name="camera.fill" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, dynamicStyles.name]}>Jennifer Smith</Text>
        <Text style={[styles.email, dynamicStyles.email]}>jennifer.smith@worknest.com</Text>
        <View style={[styles.roleBadge, dynamicStyles.roleBadge]}>
          <Text style={[styles.roleText, dynamicStyles.roleText]}>Product Designer</Text>
        </View>
      </View>

      <View style={[styles.statsContainer, dynamicStyles.statsContainer]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>24</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Tasks</Text>
        </View>
        <View style={[styles.statDivider, dynamicStyles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>12</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Projects</Text>
        </View>
        <View style={[styles.statDivider, dynamicStyles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>156</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Hours</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, dynamicStyles.menuItem]}
            onPress={() => {
              if (item.route) {
                try {
                  router.push(item.route as any);
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }
            }}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, dynamicStyles.menuIconContainer]}>
                <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, dynamicStyles.menuLabel]}>{item.label}</Text>
            </View>
            {item.toggle ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#ddd', true: colors.primary }}
              />
            ) : (
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, dynamicStyles.logoutButton]}
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      >
        <IconSymbol name="arrow.right.square" size={20} color="#FF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#e8f0f8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  roleText: {
    fontSize: 13,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 2,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    color: '#FF4444',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
