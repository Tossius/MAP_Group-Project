import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

const AnnouncementsScreen = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const canCreate = isAdmin || isManager;
  const canDelete = isAdmin;

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      await createAnnouncement({
        title: newTitle,
        content: newContent,
        important: isImportant
      }, user);

      setNewTitle('');
      setNewContent('');
      setIsImportant(false);
      setShowForm(false);
      fetchAnnouncements();
      Alert.alert('Success', 'Announcement created successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnouncement(id, user);
              fetchAnnouncements();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        {item.important && (
          <View style={styles.badge}>
            <Ionicons name="alert-circle" size={14} color={Colors.background} />
            <Text style={styles.badgeText}>Important</Text>
          </View>
        )}
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>By: {item.createdBy}</Text>
        <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {canDelete && (
        <View style={styles.actionRow}>
          <Button
            title="Delete"
            onPress={() => handleDeleteAnnouncement(item.id)}
            style={styles.deleteButton}
            textStyle={styles.deleteText}
          />
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        {canCreate && !showForm && (
          <Button
            title="New Announcement"
            onPress={() => setShowForm(true)}
            style={styles.createButton}
          />
        )}
      </View>

      {showForm && (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>Create Announcement</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Content"
            value={newContent}
            onChangeText={setNewContent}
            multiline
          />
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsImportant(!isImportant)}
          >
            <Ionicons
              name={isImportant ? 'checkbox' : 'square-outline'}
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.checkboxLabel}>Mark as Important</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => setShowForm(false)} />
            <Button title="Post" onPress={handleCreateAnnouncement} />
          </View>
        </Card>
      )}

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No announcements found.</Text>
            {canCreate && (
              <Button title="Create One" onPress={() => setShowForm(true)} />
            )}
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchAnnouncements}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  form: {
    margin: 16,
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    fontSize: 14,
    marginVertical: 8,
    color: Colors.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: Colors.gray,
  },
  actionRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
});

export default AnnouncementsScreen;
