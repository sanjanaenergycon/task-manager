import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
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
  questions?: { id: string; type: string; text: string; required: boolean; options?: string[] }[];
};

const DEFAULT_FORMS: Form[] = [
  {
    id: '1', title: 'Employee Feedback Form', description: 'Collect feedback from team members about workplace experience and suggestions for improvement.',
    responses: 45, lastModified: '2 hours ago', status: 'active', createdBy: 'Admin',
    questions: [
      { id: 'q1', type: 'short', text: 'Your Name', required: true },
      { id: 'q2', type: 'paragraph', text: 'What do you like most about working here?', required: true },
      { id: 'q3', type: 'radio', text: 'How satisfied are you with your work environment?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] },
      { id: 'q4', type: 'checkbox', text: 'Which benefits do you use?', required: false, options: ['Health Insurance', 'Remote Work', 'Gym Membership', 'Learning Budget'] },
      { id: 'q5', type: 'paragraph', text: 'Any suggestions for improvement?', required: false },
    ],
  },
  {
    id: '2', title: 'Project Request Form', description: 'Submit new project requests with details, budget, and timeline estimates.',
    responses: 12, lastModified: 'Yesterday', status: 'active', createdBy: 'Admin',
    questions: [
      { id: 'q1', type: 'short', text: 'Project Name', required: true },
      { id: 'q2', type: 'paragraph', text: 'Project Description', required: true },
      { id: 'q3', type: 'short', text: 'Estimated Budget', required: true },
      { id: 'q4', type: 'short', text: 'Expected Timeline', required: true },
    ],
  },
  {
    id: '3', title: 'Leave Application', description: 'Apply for leave with dates, type, and reason for absence.',
    responses: 89, lastModified: 'Apr 15', status: 'active', createdBy: 'Admin',
    questions: [
      { id: 'q1', type: 'short', text: 'Full Name', required: true },
      { id: 'q2', type: 'short', text: 'Department', required: true },
      { id: 'q3', type: 'radio', text: 'Leave Type', required: true, options: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Work From Home'] },
      { id: 'q4', type: 'short', text: 'Start Date', required: true },
      { id: 'q5', type: 'short', text: 'End Date', required: true },
      { id: 'q6', type: 'paragraph', text: 'Reason for Leave', required: true },
    ],
  },
  {
    id: '4', title: 'Expense Report', description: 'Submit expense reports with receipts and approval details.',
    responses: 34, lastModified: 'Apr 14', status: 'draft', createdBy: 'Admin',
    questions: [
      { id: 'q1', type: 'short', text: 'Employee Name', required: true },
      { id: 'q2', type: 'short', text: 'Expense Date', required: true },
      { id: 'q3', type: 'short', text: 'Amount', required: true },
      { id: 'q4', type: 'radio', text: 'Category', required: true, options: ['Travel', 'Food', 'Office Supplies', 'Software', 'Other'] },
      { id: 'q5', type: 'paragraph', text: 'Description', required: true },
    ],
  },
  {
    id: '5', title: 'Client Onboarding', description: 'New client onboarding questionnaire with requirements and preferences.',
    responses: 0, lastModified: 'Apr 12', status: 'draft', createdBy: 'Admin',
    questions: [
      { id: 'q1', type: 'short', text: 'Company Name', required: true },
      { id: 'q2', type: 'short', text: 'Contact Person', required: true },
      { id: 'q3', type: 'short', text: 'Email Address', required: true },
      { id: 'q4', type: 'paragraph', text: 'Project Requirements', required: true },
      { id: 'q5', type: 'radio', text: 'Budget Range', required: true, options: ['Under $5K', '$5K - $20K', '$20K - $50K', '$50K+'] },
    ],
  },
];

const FORMS_KEY = 'worknest_forms';

export default function FormViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadForm = async () => {
      const saved = await storage.getItem(FORMS_KEY);
      const forms: Form[] = saved ? JSON.parse(saved) : DEFAULT_FORMS;
      const f = forms.find((f) => f.id === id);
      if (f) {
        setForm(f);
        // Increment responses count
        const updated = forms.map((fm) =>
          fm.id === id ? { ...fm, responses: fm.responses + 1 } : fm
        );
        await storage.setItem(FORMS_KEY, JSON.stringify(updated));
      } else {
        setForm(DEFAULT_FORMS.find((f) => f.id === id) || null);
      }
    };
    loadForm();
  }, [id]);

  const handleSubmit = () => {
    if (Platform.OS === 'web') {
      alert('Form submitted successfully!');
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Success', 'Form submitted successfully!');
    }
    router.back();
  };

  const setAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  if (!form) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{form.title}</Text>
          <Text style={styles.formDescription}>{form.description}</Text>
          <Text style={styles.requiredLabel}>* Required</Text>
        </View>

        {form.questions?.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>
              {q.text}
              {q.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>

            {q.type === 'short' && (
              <TextInput
                style={styles.textInput}
                placeholder="Your answer"
                placeholderTextColor="#999"
                value={answers[q.id] || ''}
                onChangeText={(text) => setAnswer(q.id, text)}
              />
            )}

            {q.type === 'paragraph' && (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Your answer"
                placeholderTextColor="#999"
                value={answers[q.id] || ''}
                onChangeText={(text) => setAnswer(q.id, text)}
                multiline
                textAlignVertical="top"
              />
            )}

            {q.type === 'radio' && q.options && (
              <View style={styles.optionsContainer}>
                {q.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.radioOption}
                    onPress={() => setAnswer(q.id, opt)}
                  >
                    <View style={[styles.radioCircle, answers[q.id] === opt && styles.radioCircleSelected]}>
                      {answers[q.id] === opt && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {q.type === 'checkbox' && q.options && (
              <View style={styles.optionsContainer}>
                {q.options.map((opt) => {
                  const selected = (answers[q.id] || '').split(',').filter(Boolean);
                  const isChecked = selected.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={styles.checkboxOption}
                      onPress={() => {
                        const newSelected = isChecked
                          ? selected.filter((s) => s !== opt)
                          : [...selected, opt];
                        setAnswer(q.id, newSelected.join(','));
                      }}
                    >
                      <View style={[styles.checkboxSquare, isChecked && styles.checkboxSquareSelected]}>
                        {isChecked && <IconSymbol name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
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
  formHeader: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderTopWidth: 8,
    borderTopColor: '#673AB8',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  requiredLabel: {
    fontSize: 12,
    color: '#FF4444',
  },
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  requiredStar: {
    color: '#FF4444',
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionsContainer: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#673AB8',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#673AB8',
  },
  radioText: {
    fontSize: 15,
    color: '#333',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareSelected: {
    backgroundColor: '#673AB8',
    borderColor: '#673AB8',
  },
  checkboxText: {
    fontSize: 15,
    color: '#333',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#673AB8',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
