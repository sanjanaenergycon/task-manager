import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';

const NOTE_COLORS = [
  '#FFE4B5', '#E0FFFF', '#FFE4E1', '#F0E68C', '#E6E6FA',
  '#98FB98', '#FFDAB9', '#DDA0DD', '#B0E0E6', '#F5DEB3',
];

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

type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  pinned?: boolean;
  image?: string;
};

const DEFAULT_NOTES: Note[] = [
  { id: '1', title: 'Project Ideas', content: '1. New dashboard design\n2. Mobile app redesign\n3. User feedback analysis...', date: 'Today', color: '#FFE4B5' },
  { id: '2', title: 'Meeting Notes', content: 'Discussed Q2 roadmap and new features. Action items assigned to team members.', date: 'Yesterday', color: '#E0FFFF' },
  { id: '3', title: 'Design Inspiration', content: 'Color palette ideas: Navy blue, Coral, Mint green...', date: 'Apr 15', color: '#FFE4E1' },
  { id: '4', title: 'Research Findings', content: 'User testing results show 85% satisfaction rate with new interface.', date: 'Apr 14', color: '#F0E68C' },
  { id: '5', title: 'Quick Thoughts', content: 'Remember to update the style guide and share with the team.', date: 'Apr 12', color: '#E6E6FA' },
];

const NOTES_KEY = 'worknest_notes';

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isNew = id === 'new';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isNew && id) {
      const loadNote = async () => {
        const saved = await storage.getItem(NOTES_KEY);
        const notes: Note[] = saved ? JSON.parse(saved) : DEFAULT_NOTES;
        const note = notes.find((n) => n.id === id);
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setSelectedColor(note.color);
          setImage(note.image);
        }
      };
      loadNote();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a title');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please enter a title');
      }
      return;
    }

    const saved = await storage.getItem(NOTES_KEY);
    let notes: Note[] = saved ? JSON.parse(saved) : DEFAULT_NOTES;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (isNew) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        date: dateStr,
        color: selectedColor,
        image,
      };
      notes = [newNote, ...notes];
    } else {
      notes = notes.map((n) =>
        n.id === id
          ? { ...n, title: title.trim(), content: content.trim(), color: selectedColor, date: dateStr, image }
          : n
      );
    }

    await storage.setItem(NOTES_KEY, JSON.stringify(notes));

    if (Platform.OS === 'web') {
      alert(isNew ? 'Note created!' : 'Note updated!');
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Success', isNew ? 'Note created!' : 'Note updated!');
    }

    router.back();
  };

  const handleDelete = async () => {
    if (isNew) {
      router.back();
      return;
    }

    if (Platform.OS === 'web') {
      if (!confirm('Are you sure you want to delete this note?')) return;
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Delete Note',
        'Are you sure you want to delete this note?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const saved = await storage.getItem(NOTES_KEY);
              const notes: Note[] = saved ? JSON.parse(saved) : DEFAULT_NOTES;
              const filtered = notes.filter((n) => n.id !== id);
              await storage.setItem(NOTES_KEY, JSON.stringify(filtered));
              Alert.alert('Deleted', 'Note deleted!');
              router.back();
            },
          },
        ]
      );
      return;
    }

    const saved = await storage.getItem(NOTES_KEY);
    const notes: Note[] = saved ? JSON.parse(saved) : DEFAULT_NOTES;
    const filtered = notes.filter((n) => n.id !== id);
    await storage.setItem(NOTES_KEY, JSON.stringify(filtered));
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? 'New Note' : 'Edit Note'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={(text) => { setTitle(text); setHasChanges(true); }}
          maxLength={100}
        />

        <View style={styles.colorSection}>
          <Text style={styles.sectionLabel}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorCircleSelected,
                  ]}
                  onPress={() => { setSelectedColor(color); setHasChanges(true); }}
                >
                  {selectedColor === color && (
                    <IconSymbol name="checkmark" size={16} color="#333" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <TextInput
          style={[styles.contentInput, { backgroundColor: selectedColor + '40' }]}
          placeholder="Write your note here..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={(text) => { setContent(text); setHasChanges(true); }}
          multiline
          textAlignVertical="top"
        />

        {image && (
          <View style={styles.imagePreviewContainer}>
            <View style={styles.imagePreview}>
              <IconSymbol name="photo.fill" size={48} color="#1e3a5f" />
              <Text style={styles.imagePreviewText}>Image Attached</Text>
            </View>
            <TouchableOpacity style={styles.removeImageButton} onPress={() => { setImage(undefined); setHasChanges(true); }}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.attachSection}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                const url = prompt('Enter image URL (or leave blank for demo):');
                if (url !== null) {
                  setImage(url.trim() || 'https://via.placeholder.com/300x200');
                  setHasChanges(true);
                }
              } else {
                setImage('https://via.placeholder.com/300x200');
                setHasChanges(true);
              }
            }}
          >
            <IconSymbol name="photo.fill" size={22} color="#1e3a5f" />
            <Text style={styles.attachButtonText}>Attach Image</Text>
          </TouchableOpacity>
        </View>

        {!isNew && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash.fill" size={20} color="#FF4444" />
            <Text style={styles.deleteText}>Delete Note</Text>
          </TouchableOpacity>
        )}

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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  scrollView: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  colorSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#1e3a5f',
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    minHeight: 300,
  },
  deleteButton: {
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
  deleteText: {
    fontSize: 15,
    color: '#FF4444',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  imagePreviewContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    position: 'relative',
  },
  imagePreview: {
    backgroundColor: '#e8f0f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  imagePreviewText: {
    fontSize: 14,
    color: '#1e3a5f',
    marginTop: 8,
    fontWeight: '500',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  attachSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 15,
    color: '#1e3a5f',
    fontWeight: '600',
  },
});
