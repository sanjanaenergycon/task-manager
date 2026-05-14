import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using WorkNest, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application. These terms apply to all users, including team members, administrators, and guests.',
    },
    {
      title: '2. Description of Service',
      content: 'WorkNest is a task management and team collaboration platform designed to help teams organize projects, track tasks, communicate effectively, and improve productivity. Features include task creation and assignment, real-time chat, file sharing, analytics, and team management tools.',
    },
    {
      title: '3. User Accounts',
      content: 'You must create an account to use WorkNest. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.',
    },
    {
      title: '4. User Conduct',
      content: 'You agree not to use WorkNest for any unlawful purpose or in any way that could damage, disable, overburden, or impair our service. You may not attempt to gain unauthorized access to any part of the application, other accounts, or computer systems. Harassment, abuse, or inappropriate behavior towards other users is strictly prohibited.',
    },
    {
      title: '5. Data and Privacy',
      content: 'Your privacy is important to us. WorkNest collects and processes personal data as described in our Privacy Policy. By using our service, you consent to the collection, use, and sharing of your data as outlined in the Privacy Policy. We implement industry-standard security measures to protect your information.',
    },
    {
      title: '6. Intellectual Property',
      content: 'WorkNest and its original content, features, and functionality are owned by WorkNest Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, create derivative works, or distribute any part of our service without explicit permission.',
    },
    {
      title: '7. Content Ownership',
      content: 'You retain ownership of any content you create, upload, or share through WorkNest. By using our service, you grant us a license to use, store, and display your content solely for the purpose of providing and improving our services. We will not sell or share your content with third parties without your consent.',
    },
    {
      title: '8. Termination',
      content: 'We may terminate or suspend your account and access to WorkNest immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease. You may also delete your account at any time through the Privacy & Security settings.',
    },
    {
      title: '9. Limitation of Liability',
      content: 'WorkNest Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.',
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify or replace these Terms at any time. We will provide notice of significant changes through the application or via email. Your continued use of WorkNest after any changes constitutes acceptance of the new Terms.',
    },
    {
      title: '11. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts located in San Francisco, California.',
    },
    {
      title: '12. Contact Information',
      content: 'If you have any questions about these Terms, please contact us at legal@worknest.com or through our Help & Support section in the application.',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: January 1, 2024</Text>
        
        <Text style={styles.intro}>
          Welcome to WorkNest! These Terms of Service govern your use of our task management 
          and team collaboration platform. Please read these terms carefully before using our service.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.agreementBox}>
          <Text style={styles.agreementText}>
            By using WorkNest, you acknowledge that you have read, understood, and agree to be 
            bound by these Terms of Service.
          </Text>
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
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  agreementBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  agreementText: {
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '500',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});





















