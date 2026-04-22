import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <IconSymbol name="lock.fill" size={20} color="#2196F3" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Two-Factor Authentication</Text>
              <Text style={styles.menuSubtitle}>Add extra security to your account</Text>
            </View>
          </View>
          <Switch
            value={twoFactorAuth}
            onValueChange={setTwoFactorAuth}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <IconSymbol name="person.fill" size={20} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Biometric Login</Text>
              <Text style={styles.menuSubtitle}>Use fingerprint or face ID</Text>
            </View>
          </View>
          <Switch
            value={biometricLogin}
            onValueChange={setBiometricLogin}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <IconSymbol name="key.fill" size={20} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Change Password</Text>
              <Text style={styles.menuSubtitle}>Last changed 30 days ago</Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <IconSymbol name="eye.fill" size={20} color="#9C27B0" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Activity Status</Text>
              <Text style={styles.menuSubtitle}>Show when you're online</Text>
            </View>
          </View>
          <Switch
            value={activityStatus}
            onValueChange={setActivityStatus}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <IconSymbol name="doc.text.fill" size={20} color="#F44336" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Data Sharing</Text>
              <Text style={styles.menuSubtitle}>Share data with third parties</Text>
            </View>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E0F2F1' }]}>
              <IconSymbol name="chart.bar.fill" size={20} color="#009688" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Analytics</Text>
              <Text style={styles.menuSubtitle}>Help improve WorkNest</Text>
            </View>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ false: '#ddd', true: '#1e3a5f' }}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <IconSymbol name="arrow.down" size={20} color="#2196F3" />
            </View>
            <View>
              <Text style={styles.menuLabel}>Download My Data</Text>
              <Text style={styles.menuSubtitle}>Get a copy of your data</Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.dangerItem]}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <IconSymbol name="trash.fill" size={20} color="#F44336" />
            </View>
            <View>
              <Text style={[styles.menuLabel, styles.dangerText]}>Delete Account</Text>
              <Text style={styles.menuSubtitle}>Permanently delete your account</Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerText: {
    color: '#F44336',
  },
  bottomPadding: {
    height: 40,
  },
});
