import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

const ALL_FOLDERS = [
  { id: '1', name: 'Project Documents', count: 12, icon: 'folder.fill' },
  { id: '2', name: 'Design Assets', count: 8, icon: 'photo.fill' },
  { id: '3', name: 'Meeting Notes', count: 24, icon: 'doc.text.fill' },
  { id: '4', name: 'Reports', count: 6, icon: 'chart.bar.fill' },
];

const ALL_DOCS = [
  { id: '1', name: 'Q2 Project Roadmap.pdf', type: 'pdf', size: '2.4 MB', date: 'Today', folder: 'Project Documents' },
  { id: '2', name: 'Design System v2.0.fig', type: 'figma', size: '15 MB', date: 'Yesterday', folder: 'Design Assets' },
  { id: '3', name: 'User Research Summary.docx', type: 'doc', size: '1.2 MB', date: 'Apr 15', folder: 'Project Documents' },
  { id: '4', name: 'Sprint Planning Notes.txt', type: 'text', size: '12 KB', date: 'Apr 14', folder: 'Meeting Notes' },
  { id: '5', name: 'API Documentation.pdf', type: 'pdf', size: '3.1 MB', date: 'Apr 13', folder: 'Project Documents' },
  { id: '6', name: 'Meeting Notes - April 10.docx', type: 'doc', size: '850 KB', date: 'Apr 10', folder: 'Meeting Notes' },
  { id: '7', name: 'Budget Report Q1.xlsx', type: 'doc', size: '1.5 MB', date: 'Apr 8', folder: 'Reports' },
  { id: '8', name: 'Brand Guidelines.pdf', type: 'pdf', size: '5.2 MB', date: 'Apr 5', folder: 'Design Assets' },
];

export default function DocsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [docs, setDocs] = useState(ALL_DOCS);

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? doc.folder === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const filteredFolders = ALL_FOLDERS.map((folder) => ({
    ...folder,
    count: docs.filter((d) => d.folder === folder.name).length,
  }));

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

  const handleAddDocument = () => {
    if (!newDocName.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a document name');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please enter a document name');
      }
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      name: newDocName,
      type: 'doc',
      size: '0 KB',
      date: 'Just now',
      folder: 'Project Documents',
    };

    setDocs([newDoc, ...docs]);
    setNewDocName('');
    setShowAddModal(false);

    if (Platform.OS === 'web') {
      alert('Document created successfully!');
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Success', 'Document created successfully!');
    }
  };

  const handleDeleteDoc = (docId: string) => {
    setDocs(docs.filter((d) => d.id !== docId));
    if (Platform.OS === 'web') {
      alert('Document deleted!');
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Deleted', 'Document deleted!');
    }
  };

  const renderFolder = ({ item }: { item: typeof ALL_FOLDERS[0] }) => (
    <TouchableOpacity
      style={[
        styles.folderCard,
        selectedFolder === item.name && styles.folderCardActive,
      ]}
      onPress={() => setSelectedFolder(selectedFolder === item.name ? null : item.name)}
    >
      <View style={[styles.folderIconContainer, selectedFolder === item.name && { backgroundColor: '#1e3a5f' }]}>
        <IconSymbol name={item.icon as any} size={28} color={selectedFolder === item.name ? '#fff' : '#1e3a5f'} />
      </View>
      <Text style={styles.folderName}>{item.name}</Text>
      <Text style={styles.folderCount}>{item.count} files</Text>
    </TouchableOpacity>
  );

  const renderDoc = ({ item }: { item: typeof ALL_DOCS[0] }) => (
    <TouchableOpacity
      style={styles.docItem}
      onPress={() => router.push({ pathname: '/doc-detail', params: { id: item.id } })}
    >
      <View style={[styles.docIcon, { backgroundColor: getFileColor(item.type) + '15' }]}>
        <IconSymbol name={getFileIcon(item.type) as any} size={24} color={getFileColor(item.type)} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName}>{item.name}</Text>
        <Text style={styles.docMeta}>{item.size} • {item.date}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} onPress={() => handleDeleteDoc(item.id)}>
        <IconSymbol name="trash.fill" size={18} color="#FF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documents</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>J</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <FlatList
            data={filteredFolders}
            renderItem={renderFolder}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foldersList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFolder ? selectedFolder : 'Recent Files'}
              {selectedFolder && (
                <Text style={styles.fileCount}> ({filteredDocs.length})</Text>
              )}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFolder(null)}>
              <Text style={styles.seeAll}>{selectedFolder ? 'Clear Filter' : 'See All'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.docsList}>
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <View key={doc.id}>
                  {renderDoc({ item: doc })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No documents found</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Document</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Document name..."
              placeholderTextColor="#999"
              value={newDocName}
              onChangeText={setNewDocName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => { setShowAddModal(false); setNewDocName(''); }}>
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCreate} onPress={handleAddDocument}>
                <Text style={styles.modalButtonCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  fileCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  seeAll: {
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  foldersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  folderCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  folderCardActive: {
    backgroundColor: '#e8f0f8',
    borderWidth: 2,
    borderColor: '#1e3a5f',
  },
  folderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  folderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 12,
    color: '#999',
  },
  docsList: {
    paddingHorizontal: 20,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  docIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  modalButtonCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
  },
  modalButtonCreateText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
