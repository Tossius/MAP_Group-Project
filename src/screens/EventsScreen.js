import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getEvents, deleteEvent, initializeStorage } from '../utils/storage';

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load events from storage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Initialize storage with sample data if empty
        await initializeStorage();
        
        // Load events
        const storedEvents = await getEvents();
        setEvents(storedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  // Refresh events when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        setIsLoading(true);
        const storedEvents = await getEvents();
        setEvents(storedEvents);
      } catch (error) {
        console.error('Error refreshing events:', error);
      } finally {
        setIsLoading(false);
      }
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      Alert.alert('Success', 'Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event. Please try again.');
    }
  };

  const renderEventItem = ({ item }) => {
    const eventDate = new Date(item.date);
    const deadlineDate = new Date(item.registrationDeadline);
    const currentDate = new Date();
    
    const isRegistrationOpen = currentDate <= deadlineDate;
    
    return (
      <Card style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
        <View style={styles.deleteButtonContainer}>
          <Button
            title="Delete"
            onPress={() => {
              Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete ${item.title}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => handleDeleteEvent(item.id), style: 'destructive' }
                ]
              );
            }}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={[
            styles.categoryBadge, 
            item.category === 'Tournament' ? styles.tournamentBadge : 
            item.category === 'Training' ? styles.trainingBadge : styles.workshopBadge
          ]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.eventInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{eventDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        </View>
        
        <View style={styles.registrationContainer}>
          <Text style={styles.deadlineText}>
            Registration {isRegistrationOpen ? 'closes' : 'closed'} on {deadlineDate.toLocaleDateString()}
          </Text>
          {isRegistrationOpen && (
            <Button 
              title="Register" 
              onPress={() => navigation.navigate('EventRegistration', { eventId: item.id })}
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Button
          title="Create"
          onPress={() => navigation.navigate('EventCreation')}
          style={styles.createButton}
          textStyle={styles.createButtonText}
        />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found</Text>
              <Button
                title="Create New Event"
                onPress={() => navigation.navigate('EventCreation')}
              />
            </View>
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 0,
    backgroundColor: Colors.primary,
  },
  createButtonText: {
    fontSize: 14,
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 0,
    backgroundColor: Colors.danger,
  },
  deleteButtonText: {
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  list: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tournamentBadge: {
    backgroundColor: Colors.primary,
  },
  trainingBadge: {
    backgroundColor: Colors.info,
  },
  workshopBadge: {
    backgroundColor: Colors.warning,
  },
  categoryText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.secondary,
  },
  registrationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    paddingTop: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  registerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  registerButtonText: {
    fontSize: 12,
  },
});

export default EventsScreen;
