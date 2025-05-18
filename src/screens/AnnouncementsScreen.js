import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

const AnnouncementsScreen = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch announcements
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

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle creating a new announcement
  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      setIsLoading(true);
      await createAnnouncement({
        title: newTitle,
        content: newContent,
        important: isImportant
      }, user);

      // Reset form
      setNewTitle('');
      setNewContent('');
      setIsImportant(false);
      setShowForm(false);

      // Refresh announcements
      await fetchAnnouncements();
      Alert.alert('Success', 'Announcement created successfully');
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', error.message || 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = async (id) => {
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
              setIsLoading(true);
              await deleteAnnouncement(id, user);
              await fetchAnnouncements();
              Alert.alert('Success', 'Announcement deleted successfully');
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', error.message || 'Failed to delete announcement');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Render an announcement item
  const renderAnnouncementItem = ({ item }) => {
    const date = new Date(item.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <Card style={[styles.announcementCard, item.important && styles.importantCard]}>
        {item.important && (
          <View style={styles.importantBadge}>
            <Ionicons name="alert-circle" size={16} color={Colors.background} />
            <Text style={styles.importantText}>Important</Text>
          </View>
        )}
        
        <View style={styles.headerRow}>
          <Text style={styles.announcementTitle}>{item.title}</Text>
          {user && user.isAdmin && (
            <TouchableOpacity onPress={() => handleDeleteAnnouncement(item.id)}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.announcementContent}>{item.content}</Text>
        
        <View style={styles.footerRow}>
          <Text style={styles.createdBy}>Posted by: {item.createdBy}</Text>
          <Text style={styles.createdAt}>{formattedDate}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {user && user.isAdmin && (
          <View style={styles.adminSection}>
            {!showForm ? (
              <Button
                title="Create New Announcement"
                onPress={() => setShowForm(true)}
                style={styles.createButton}
              />
            ) : (
              <Card style={styles.formCard}>
                <Text style={styles.formTitle}>Create New Announcement</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Title:</Text>
                  <TextInput
                    style={styles.input}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="Enter announcement title"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Content:</Text>
                  <TextInput
                    style={[styles.input, styles.contentInput]}
                    value={newContent}
                    onChangeText={setNewContent}
                    placeholder="Enter announcement content"
                    multiline
                    numberOfLines={4}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.importantContainer}
                  onPress={() => setIsImportant(!isImportant)}
                >
                  <Ionicons
                    name={isImportant ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.importantLabel}>Mark as important</Text>
                </TouchableOpacity>
                
                <View style={styles.buttonRow}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowForm(false);
                      setNewTitle('');
                      setNewContent('');
                      setIsImportant(false);
                    }}
                    style={[styles.formButton, styles.cancelButton]}
                    textStyle={styles.cancelButtonText}
                  />
                  <Button
                    title="Post Announcement"
                    onPress={handleCreateAnnouncement}
                    style={styles.formButton}
                    disabled={isLoading}
                  />
                </View>
              </Card>
            )}
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Announcements</Text>
        
        {announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements available</Text>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={item => item.id}
            renderItem={renderAnnouncementItem}
            contentContainerStyle={styles.listContainer}
            refreshing={isLoading}
            onRefresh={fetchAnnouncements}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 16,
  },
  adminSection: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: Colors.primary,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: Colors.secondary,
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  importantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  importantLabel: {
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  announcementCard: {
    marginBottom: 12,
    padding: 16,
  },
  importantCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.error,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  importantText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
  },
  announcementContent: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 8,
  },
  createdBy: {
    fontSize: 12,
    color: Colors.gray,
  },
  createdAt: {
    fontSize: 12,
    color: Colors.gray,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AnnouncementsScreen;
