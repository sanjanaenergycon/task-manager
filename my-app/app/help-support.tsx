import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'To create a new task, go to the Tasks tab and tap the + button in the bottom right corner. Fill in the task details including title, project, priority, and due date.',
    },
    {
      question: 'How do I assign tasks to team members?',
      answer: 'When creating or editing a task, tap on "Assign To" and select team members from the list. You can assign multiple members to a single task.',
    },
    {
      question: 'Can I set reminders for tasks?',
      answer: 'Yes! When creating a task, enable the "Set Alarm" toggle. You\'ll receive notifications before the task due time.',
    },
    {
      question: 'How do I chat with my team?',
      answer: 'Go to the Chat tab to see all your conversations. Tap on any chat to open it and start messaging. You can also make voice and video calls.',
    },
    {
      question: 'How do I track my productivity?',
      answer: 'Visit the Analytics tab to see detailed reports about your tasks, completed work, and team performance.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data. You can also enable two-factor authentication in Privacy & Security settings.',
    },
  ];

  const supportOptions = [
    { icon: 'message.fill', title: 'Live Chat', subtitle: 'Chat with our support team', color: '#4CAF50' },
    { icon: 'mail.fill', title: 'Email Support', subtitle: 'support@worknest.com', color: '#2196F3' },
    { icon: 'phone.fill', title: 'Phone Support', subtitle: '+1 (800) 123-4567', color: '#FF9800' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Support Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {supportOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.supportCard}>
            <View style={[styles.supportIcon, { backgroundColor: option.color + '20' }]}>
              <IconSymbol name={option.icon as any} size={24} color={option.color} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <IconSymbol
                name={expandedFaq === index ? 'chevron.down' : 'chevron.right'}
                size={20}
                color="#999"
              />
            </View>
            {expandedFaq === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>WorkNest App v1.0.0</Text>
        <Text style={styles.versionSubtext}>© 2024 WorkNest Inc. All rights reserved.</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
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
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportInfo: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
