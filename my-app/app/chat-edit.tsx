import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function ChatEditScreen() {
  const router = useRouter();
  const { id, name, type } = useLocalSearchParams();
  const [chatName, setChatName] = useState(name as string);
  const [description, setDescription] = useState('');

  const isGroup = type === 'group';

  const members = [
    { id: '1', name: 'Jennifer Smith', role: 'Admin', color: '#1e3a5f' },
    { id: '2', name: 'Alex Johnson', role: 'Member', color: '#4CAF50' },
    { id: '3', name: 'Sarah Williams', role: 'Member', color: '#FF9800' },
  ];

  const handleSave = () => {
    alert(`${isGroup ? 'Group' : 'Profile'} updated successfully!`);
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {isGroup ? 'Group' : 'Profile'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, isGroup && styles.groupAvatar]}>
            <Text style={styles.avatarText}>{(name as string).charAt(0)}</Text>
          </View>
          <TouchableOpacity style={styles.cameraButton}>
            <IconSymbol name="camera.fill" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.changePhotoText}>Change {isGroup ? 'Group Photo' : 'Profile Photo'}</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isGroup ? 'Group Name' : 'Display Name'}</Text>
          <TextInput
            style={styles.input}
            value={chatName}
            onChangeText={setChatName}
            placeholder={`Enter ${isGroup ? 'group' : 'profile'} name`}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={`Add ${isGroup ? 'group' : 'profile'} description`}
            multiline
            numberOfLines={4}
          />
        </View>

        {isGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Members ({members.length})</Text>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberLeft}>
                  <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.removeButton}>
                  <IconSymbol name="xmark" size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMemberButton}>
              <IconSymbol name="person.badge.plus" size={20} color="#1e3a5f" />
              <Text style={styles.addMemberText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="bell.fill" size={20} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="lock.fill" size={20} color="#666" />
            <Text style={styles.settingText}>Privacy</Text>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="doc.text.fill" size={20} color="#666" />
            <Text style={styles.settingText}>Media Visibility</Text>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton}>
          <IconSymbol name="trash.fill" size={20} color="#FF4444" />
          <Text style={styles.deleteButtonText}>
            {isGroup ? 'Delete Group' : 'Delete Chat'}
          </Text>
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  avatarSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatar: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  memberRole: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addMemberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
  },
  bottomPadding: {
    height: 40,
  },
});
