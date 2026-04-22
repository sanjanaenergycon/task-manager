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

type Form = {
  id: string;
  title: string;
  description: string;
  responses: number;
  lastModified: string;
  status: 'active' | 'draft';
  createdBy: string;
  sharedWith?: string[];
};

const DEFAULT_FORMS: Form[] = [
  { id: '1', title: 'Employee Feedback Form', description: 'Collect feedback from team members...', responses: 45, lastModified: '2 hours ago', status: 'active', createdBy: 'Admin' },
  { id: '2', title: 'Project Request Form', description: 'Submit new project requests...', responses: 12, lastModified: 'Yesterday', status: 'active', createdBy: 'Admin' },
  { id: '3', title: 'Leave Application', description: 'Apply for leave with dates...', responses: 89, lastModified: 'Apr 15', status: 'active', createdBy: 'Admin' },
  { id: '4', title: 'Expense Report', description: 'Submit expense reports...', responses: 34, lastModified: 'Apr 14', status: 'draft', createdBy: 'Admin' },
  { id: '5', title: 'Client Onboarding', description: 'New client onboarding questionnaire...', responses: 0, lastModified: 'Apr 12', status: 'draft', createdBy: 'Admin' },
];

const FORMS_KEY = 'worknest_forms';

export default function FormsScreen() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>(DEFAULT_FORMS);
  const [activeCategory, setActiveCategory] = useState('1');
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadForms = async () => {
        const saved = await storage.getItem(FORMS_KEY);
        if (saved) {
          setForms(JSON.parse(saved));
        } else {
          setForms(DEFAULT_FORMS);
          await storage.setItem(FORMS_KEY, JSON.stringify(DEFAULT_FORMS));
        }
      };
      loadForms();
    }, [])
  );

  const categories = [
    { id: '1', name: 'All Forms', icon: 'doc.text.fill' },
    { id: '2', name: 'My Forms', icon: 'person.fill' },
    { id: '3', name: 'Shared', icon: 'person.2.fill' },
    { id: '4', name: 'Templates', icon: 'square.grid.2x2.fill' },
  ];

  const filteredForms = forms.filter((form) => {
    if (activeCategory === '1') return true;
    if (activeCategory === '2') return form.createdBy === 'Admin';
    if (activeCategory === '3') return (form.sharedWith || []).length > 0;
    if (activeCategory === '4') return form.status === 'draft';
    return true;
  });

  const sharedForms = forms.filter((form) => (form.sharedWith || []).length > 0);

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a form title');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please enter a form title');
      }
      return;
    }

    const newForm: Form = {
      id: Date.now().toString(),
      title: newFormTitle.trim(),
      description: newFormDescription.trim() || 'No description',
      responses: 0,
      lastModified: 'Just now',
      status: 'draft',
      createdBy: 'Admin',
    };

    const updated = [newForm, ...forms];
    setForms(updated);
    await storage.setItem(FORMS_KEY, JSON.stringify(updated));
    setShowNewFormModal(false);
    setNewFormTitle('');
    setNewFormDescription('');

    if (Platform.OS === 'web') {
      alert('New form created!');
    }
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, activeCategory === item.id && styles.categoryCardActive]}
      onPress={() => setActiveCategory(item.id)}
    >
      <View style={[styles.categoryIcon, activeCategory === item.id && styles.categoryIconActive]}>
        <IconSymbol name={item.icon as any} size={24} color={activeCategory === item.id ? '#fff' : '#1e3a5f'} />
      </View>
      <Text style={[styles.categoryName, activeCategory === item.id && styles.categoryNameActive]}>{item.name}</Text>
      <Text style={[styles.categoryCount, activeCategory === item.id && styles.categoryCountActive]}>
        {item.id === '1' ? forms.length : item.id === '2' ? forms.filter(f => f.createdBy === 'Admin').length : item.id === '3' ? sharedForms.length : forms.filter(f => f.status === 'draft').length}
      </Text>
    </TouchableOpacity>
  );

  const renderForm = ({ item }: { item: Form }) => (
    <TouchableOpacity
      style={styles.formCard}
      onPress={() => router.push({ pathname: '/form-detail' as any, params: { id: item.id } })}
    >
      <View style={styles.formHeader}>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusDraft]}>
          <Text style={[styles.statusText, item.status === 'active' ? styles.statusActiveText : styles.statusDraftText]}>
            {item.status === 'active' ? 'Active' : 'Draft'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/form-share' as any, params: { formId: item.id, formName: item.title } })}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.formTitle}>{item.title}</Text>
      <Text style={styles.formDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.formFooter}>
        <View style={styles.formStat}>
          <IconSymbol name="person.fill" size={14} color="#999" />
          <Text style={styles.formStatText}>{item.responses} responses</Text>
        </View>
        <Text style={styles.formDate}>{item.lastModified}</Text>
      </View>
      {(item.sharedWith || []).length > 0 && (
        <View style={styles.sharedBadge}>
          <IconSymbol name="person.2.fill" size={12} color="#fff" />
          <Text style={styles.sharedBadgeText}>{item.sharedWith?.length} shared</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forms</Text>
          <TouchableOpacity>
            <IconSymbol name="magnifyingglass" size={24} color="#1e3a5f" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === '1' ? 'All Forms' : activeCategory === '2' ? 'My Forms' : activeCategory === '3' ? 'Shared Forms' : 'Templates'}
            </Text>
            <Text style={styles.sectionCount}>{filteredForms.length} forms</Text>
          </View>
          {filteredForms.length > 0 ? (
            filteredForms.map((form) => (
              <View key={form.id}>{renderForm({ item: form })}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No forms found in this category</Text>
            </View>
          )}
        </View>

        {/* Shared With Me Section */}
        {sharedForms.length > 0 && activeCategory !== '3' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shared With Others</Text>
            </View>
            {sharedForms.map((form) => (
              <TouchableOpacity
                key={`shared-${form.id}`}
                style={styles.sharedFormItem}
                onPress={() => router.push({ pathname: '/form-detail' as any, params: { id: form.id } })}
              >
                <IconSymbol name="doc.text.fill" size={20} color="#1e3a5f" />
                <View style={styles.sharedFormInfo}>
                  <Text style={styles.sharedFormTitle}>{form.title}</Text>
                  <Text style={styles.sharedFormMeta}>
                    Shared with: {form.sharedWith?.join(', ')}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowNewFormModal(true)}>
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Form Modal */}
      <Modal
        visible={showNewFormModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewFormModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Form</Text>
              <TouchableOpacity onPress={() => setShowNewFormModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Form Title"
              placeholderTextColor="#999"
              value={newFormTitle}
              onChangeText={setNewFormTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={newFormDescription}
              onChangeText={setNewFormDescription}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.createButton} onPress={handleCreateForm}>
              <Text style={styles.createButtonText}>Create Form</Text>
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
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  categoryCard: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardActive: {
    backgroundColor: '#1e3a5f',
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  categoryNameActive: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  categoryCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  sectionCount: {
    fontSize: 14,
    color: '#999',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#4CAF5020',
  },
  statusDraft: {
    backgroundColor: '#99999920',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#4CAF50',
  },
  statusDraftText: {
    color: '#666',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formStatText: {
    fontSize: 13,
    color: '#666',
  },
  formDate: {
    fontSize: 12,
    color: '#999',
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
  },
  sharedBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  sharedFormItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  sharedFormInfo: {
    flex: 1,
  },
  sharedFormTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sharedFormMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
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
  bottomPadding: {
    height: 100,
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
  modalInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
