import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';

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

type Form = {
  id: string;
  title: string;
  description: string;
  responses: number;
  lastModified: string;
  status: 'active' | 'draft';
  createdBy: string;
  sharedWith?: string[];
  questions?: { id: string; type: string; text: string; required: boolean }[];
};

const DEFAULT_FORMS: Form[] = [
  { id: '1', title: 'Employee Feedback Form', description: 'Collect feedback from team members about workplace experience and suggestions for improvement.', responses: 45, lastModified: '2 hours ago', status: 'active', createdBy: 'Admin' },
  { id: '2', title: 'Project Request Form', description: 'Submit new project requests with details, budget, and timeline estimates.', responses: 12, lastModified: 'Yesterday', status: 'active', createdBy: 'Admin' },
  { id: '3', title: 'Leave Application', description: 'Apply for leave with dates, type, and reason for absence.', responses: 89, lastModified: 'Apr 15', status: 'active', createdBy: 'Admin' },
  { id: '4', title: 'Expense Report', description: 'Submit expense reports with receipts and approval details.', responses: 34, lastModified: 'Apr 14', status: 'draft', createdBy: 'Admin' },
  { id: '5', title: 'Client Onboarding', description: 'New client onboarding questionnaire with requirements and preferences.', responses: 0, lastModified: 'Apr 12', status: 'draft', createdBy: 'Admin' },
];

const FORMS_KEY = 'worknest_forms';

export default function FormDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      const saved = await storage.getItem(FORMS_KEY);
      const forms: Form[] = saved ? JSON.parse(saved) : DEFAULT_FORMS;
      const f = forms.find((f) => f.id === id);
      if (f) setForm(f);
    };
    loadForm();
  }, [id]);

  const handleDelete = async () => {
    if (Platform.OS === 'web') {
      if (!confirm('Are you sure you want to delete this form?')) return;
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Delete Form',
        'Are you sure you want to delete this form?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const saved = await storage.getItem(FORMS_KEY);
              const forms: Form[] = saved ? JSON.parse(saved) : DEFAULT_FORMS;
              await storage.setItem(FORMS_KEY, JSON.stringify(forms.filter((f) => f.id !== id)));
              router.back();
            },
          },
        ]
      );
      return;
    }
    const saved = await storage.getItem(FORMS_KEY);
    const forms: Form[] = saved ? JSON.parse(saved) : DEFAULT_FORMS;
    await storage.setItem(FORMS_KEY, JSON.stringify(forms.filter((f) => f.id !== id)));
    router.back();
  };

  if (!form) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <IconSymbol name="trash.fill" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.statusBadge, form.status === 'active' ? styles.statusActive : styles.statusDraft]}>
            <Text style={[styles.statusText, form.status === 'active' ? styles.statusActiveText : styles.statusDraftText]}>
              {form.status === 'active' ? 'Active' : 'Draft'}
            </Text>
          </View>

          <Text style={styles.title}>{form.title}</Text>
          <Text style={styles.description}>{form.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol name="person.fill" size={20} color="#1e3a5f" />
              <Text style={styles.statValue}>{form.responses}</Text>
              <Text style={styles.statLabel}>Responses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="clock.fill" size={20} color="#1e3a5f" />
              <Text style={styles.statValue}>{form.lastModified}</Text>
              <Text style={styles.statLabel}>Last Modified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="person.circle.fill" size={20} color="#1e3a5f" />
              <Text style={styles.statValue}>{form.createdBy}</Text>
              <Text style={styles.statLabel}>Created By</Text>
            </View>
          </View>

          {form.sharedWith && form.sharedWith.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shared With</Text>
              {form.sharedWith.map((name, idx) => (
                <View key={idx} style={styles.sharedItem}>
                  <View style={styles.sharedAvatar}>
                    <Text style={styles.sharedAvatarText}>{name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.sharedName}>{name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => router.push({ pathname: '/form-view' as any, params: { id: form.id } })}
            >
              <IconSymbol name="doc.text.fill" size={20} color="#fff" />
              <Text style={styles.openButtonText}>Open Form</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => router.push({ pathname: '/form-share' as any, params: { formId: form.id, formName: form.title } })}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color="#1e3a5f" />
              <Text style={styles.shareButtonText}>Share Form</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  content: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusActive: {
    backgroundColor: '#4CAF5020',
  },
  statusDraft: {
    backgroundColor: '#99999920',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#4CAF50',
  },
  statusDraftText: {
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sharedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sharedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sharedAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sharedName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  shareButtonText: {
    color: '#1e3a5f',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
