import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

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

const ALL_DOCS = [
  { id: '1', name: 'Q2 Project Roadmap.pdf', type: 'pdf', size: '2.4 MB', date: 'Today', author: 'Jennifer Smith', description: 'Quarter 2 project roadmap outlining all major milestones and deliverables for the team.', content: 'This document contains the detailed Q2 project roadmap including:\n\n1. Sprint Planning\n2. Design System Updates\n3. Client Dashboard Development\n4. User Research Phase\n5. Brand Guidelines Update\n\nAll timelines and resources have been allocated.' },
  { id: '2', name: 'Design System v2.0.fig', type: 'figma', size: '15 MB', date: 'Yesterday', author: 'Alex Chen', description: 'Updated design system with new color palette, typography scale, and component library.', content: 'Design System v2.0 includes:\n\n- Color Palette\n- Typography Scale\n- Button Components\n- Input Fields\n- Card Layouts\n- Navigation Patterns' },
  { id: '3', name: 'User Research Summary.docx', type: 'doc', size: '1.2 MB', date: 'Apr 15', author: 'Maria Garcia', description: 'Comprehensive summary of user research conducted in March 2024.', content: 'User Research Summary:\n\nKey Findings:\n- 85% of users prefer dark mode\n- Navigation needs simplification\n- Search functionality is most used\n- Mobile experience needs improvement' },
  { id: '4', name: 'Sprint Planning Notes.txt', type: 'text', size: '12 KB', date: 'Apr 14', author: 'John Doe', description: 'Notes from the sprint planning meeting held on April 14, 2024.', content: 'Sprint Planning Notes:\n\nAttendees: Jennifer, Alex, Maria, John\n\nSprint Goals:\n1. Complete dashboard UI\n2. Fix navigation bugs\n3. Implement search\n4. Update documentation' },
  { id: '5', name: 'API Documentation.pdf', type: 'pdf', size: '3.1 MB', date: 'Apr 13', author: 'Tech Team', description: 'Complete API documentation for the WorkNest backend services.', content: 'API Documentation:\n\nEndpoints:\n- GET /api/tasks\n- POST /api/tasks\n- PUT /api/tasks/:id\n- DELETE /api/tasks/:id\n- GET /api/users\n- POST /api/auth/login' },
  { id: '6', name: 'Meeting Notes - April 10.docx', type: 'doc', size: '850 KB', date: 'Apr 10', author: 'Jennifer Smith', description: 'Weekly team meeting notes covering project updates and blockers.', content: 'Meeting Notes - April 10:\n\nProject Updates:\n- Dashboard 80% complete\n- Chat feature in testing\n- Task management working\n- Profile section ready' },
  { id: '7', name: 'Budget Report Q1.xlsx', type: 'doc', size: '1.5 MB', date: 'Apr 8', author: 'Finance Team', description: 'First quarter budget report with expense breakdown and forecasts.', content: 'Budget Report Q1:\n\nTotal Budget: $150,000\nSpent: $127,500\nRemaining: $22,500\n\nBreakdown:\n- Development: $80,000\n- Design: $25,000\n- Marketing: $22,500' },
  { id: '8', name: 'Brand Guidelines.pdf', type: 'pdf', size: '5.2 MB', date: 'Apr 5', author: 'Design Team', description: 'Official brand guidelines including logo usage, colors, and typography.', content: 'Brand Guidelines:\n\nLogo Usage:\n- Minimum size: 32px\n- Clear space: 10px\n- Colors: Primary #1e3a5f, Secondary #4a90d9\n\nTypography:\n- Headings: Inter Bold\n- Body: Inter Regular' },
];

export default function DocDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showMenu, setShowMenu] = useState(false);

  const doc = ALL_DOCS.find((d) => d.id === id);

  if (!doc) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Document not found</Text>
        </View>
      </View>
    );
  }

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return 'doc.fill';
      case 'figma': return 'paintbrush.fill';
      case 'doc': return 'doc.text.fill';
      case 'text': return 'text.alignleft';
      default: return 'doc.fill';
    }
  };

  const getFileColor = (type: string) => {
    switch(type) {
      case 'pdf': return '#FF4444';
      case 'figma': return '#FF9800';
      case 'doc': return '#2196F3';
      case 'text': return '#4CAF50';
      default: return '#666';
    }
  };

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      alert(`Downloading ${doc.name}...`);
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Download', `Downloading ${doc.name}...`);
    }
  };

  const handleShare = () => {
    router.push({ pathname: '/share-doc', params: { docId: doc.id, docName: doc.name } });
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this document?')) {
        alert('Document deleted!');
        router.back();
      }
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Delete Document',
        'Are you sure you want to delete this document?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { alert('Document deleted!'); router.back(); } }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{doc.name}</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <IconSymbol name="ellipsis" size={24} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menuPopup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={20} color="#1e3a5f" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDownload}>
            <IconSymbol name="arrow.down.circle" size={20} color="#1e3a5f" />
            <Text style={styles.menuText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <IconSymbol name="trash.fill" size={20} color="#FF4444" />
            <Text style={[styles.menuText, { color: '#FF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.docPreview}>
          <View style={[styles.docIconLarge, { backgroundColor: getFileColor(doc.type) + '15' }]}>
            <IconSymbol name={getFileIcon(doc.type) as any} size={48} color={getFileColor(doc.type)} />
          </View>
          <Text style={styles.docName}>{doc.name}</Text>
          <Text style={styles.docMeta}>{doc.type.toUpperCase()} • {doc.size} • {doc.date}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{doc.description}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Author</Text>
            <Text style={styles.detailValue}>{doc.author}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File Type</Text>
            <Text style={styles.detailValue}>{doc.type.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size</Text>
            <Text style={styles.detailValue}>{doc.size}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{doc.date}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Content Preview</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{doc.content}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <IconSymbol name="arrow.down.circle.fill" size={24} color="#fff" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up.fill" size={24} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
    flex: 1,
    marginHorizontal: 12,
    textAlign: 'center',
  },
  menuPopup: {
    position: 'absolute',
    top: 110,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  docPreview: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
  },
  docIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  docName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  docMeta: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
