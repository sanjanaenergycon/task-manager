import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Platform } from 'react-native';
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

type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  pinned?: boolean;
  image?: string;
};

const NOTE_COLORS = [
  '#FFE4B5', '#E0FFFF', '#FFE4E1', '#F0E68C', '#E6E6FA',
  '#98FB98', '#FFDAB9', '#DDA0DD', '#B0E0E6', '#F5DEB3',
];

const DEFAULT_NOTES: Note[] = [
  { id: '1', title: 'Project Ideas', content: '1. New dashboard design\n2. Mobile app redesign\n3. User feedback analysis...', date: 'Today', color: '#FFE4B5' },
  { id: '2', title: 'Meeting Notes', content: 'Discussed Q2 roadmap and new features. Action items assigned to team members.', date: 'Yesterday', color: '#E0FFFF' },
  { id: '3', title: 'Design Inspiration', content: 'Color palette ideas: Navy blue, Coral, Mint green...', date: 'Apr 15', color: '#FFE4E1' },
  { id: '4', title: 'Research Findings', content: 'User testing results show 85% satisfaction rate with new interface.', date: 'Apr 14', color: '#F0E68C' },
  { id: '5', title: 'Quick Thoughts', content: 'Remember to update the style guide and share with the team.', date: 'Apr 12', color: '#E6E6FA' },
];

const NOTES_KEY = 'worknest_notes';

export default function NotepadScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadNotes = async () => {
        const saved = await storage.getItem(NOTES_KEY);
        if (saved) {
          setNotes(JSON.parse(saved));
        } else {
          setNotes(DEFAULT_NOTES);
        }
      };
      loadNotes();
    }, [])
  );

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const filteredNotes = sortedNotes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await storage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  };

  const handleDelete = async () => {
    if (!menuNoteId) return;
    const newNotes = notes.filter((n) => n.id !== menuNoteId);
    await saveNotes(newNotes);
    setMenuNoteId(null);
  };

  const handlePin = async () => {
    if (!menuNoteId) return;
    const newNotes = notes.map((n) =>
      n.id === menuNoteId ? { ...n, pinned: !n.pinned } : n
    );
    await saveNotes(newNotes);
    setMenuNoteId(null);
  };

  const handleDuplicate = async () => {
    if (!menuNoteId) return;
    const note = notes.find((n) => n.id === menuNoteId);
    if (!note) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dup: Note = {
      ...note,
      id: Date.now().toString(),
      title: note.title + ' (Copy)',
      date: dateStr,
      pinned: false,
    };
    await saveNotes([dup, ...notes]);
    setMenuNoteId(null);
  };

  const handleChangeColor = async (color: string) => {
    if (!menuNoteId) return;
    const newNotes = notes.map((n) =>
      n.id === menuNoteId ? { ...n, color } : n
    );
    await saveNotes(newNotes);
    setShowColorPicker(false);
    setMenuNoteId(null);
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: item.color }]}
      onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })}
      onLongPress={() => setMenuNoteId(item.id)}
      delayLongPress={500}
    >
      <View style={styles.noteHeaderRow}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        {item.pinned && (
          <IconSymbol name="pin.fill" size={14} color="#1e3a5f" />
        )}
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
      <View style={styles.noteFooterRow}>
        <Text style={styles.noteDate}>{item.date}</Text>
        {item.image && (
          <IconSymbol name="photo.fill" size={14} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notepad</Text>
        <TouchableOpacity>
          <IconSymbol name="ellipsis" size={24} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
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

      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found' : 'No notes yet. Tap + to create one!'}
          </Text>
        </View>
      )}

      {/* Long Press Menu */}
      {menuNoteId && !showColorPicker && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuOverlayTouch} onPress={() => setMenuNoteId(null)} />
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePin}>
              <IconSymbol name="pin.fill" size={20} color="#1e3a5f" />
              <Text style={styles.menuText}>
                {notes.find((n) => n.id === menuNoteId)?.pinned ? 'Unpin' : 'Pin to Top'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowColorPicker(true)}>
              <IconSymbol name="paintbrush.fill" size={20} color="#FF9800" />
              <Text style={styles.menuText}>Change Color</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDuplicate}>
              <IconSymbol name="doc.on.doc.fill" size={20} color="#4CAF50" />
              <Text style={styles.menuText}>Duplicate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleDelete}>
              <IconSymbol name="trash.fill" size={20} color="#FF4444" />
              <Text style={[styles.menuText, { color: '#FF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Color Picker */}
      {showColorPicker && menuNoteId && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuOverlayTouch} onPress={() => { setShowColorPicker(false); setMenuNoteId(null); }} />
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {NOTE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => handleChangeColor(color)}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/note-detail', params: { id: 'new' } })}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
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
  notesList: {
    padding: 20,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
  },
  noteCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 150,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  noteDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  menuOverlayTouch: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  colorPickerContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  colorPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
