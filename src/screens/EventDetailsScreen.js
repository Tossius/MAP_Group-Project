import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getEvents, getEventRegistrations, getTeams } from '../utils/storage';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  
  const [event, setEvent] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load event data from storage
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setIsLoading(true);
        
        // Get the specific event
        const events = await getEvents();
        const foundEvent = events.find(e => e.id === eventId);
        
        if (foundEvent) {
          // Add sample data if not present
          const eventWithDefaults = {
            ...foundEvent,
            endDate: foundEvent.endDate || foundEvent.date, // Use same date if no end date
            organizer: foundEvent.organizer || 'Namibia Hockey Union',
            contactEmail: foundEvent.contactEmail || 'events@namibiahockey.org',
            contactPhone: foundEvent.contactPhone || '+264 61 234 5678'
          };
          setEvent(eventWithDefaults);
          
          // Get event registrations
          const registrations = await getEventRegistrations();
          const eventRegistrations = registrations.filter(reg => reg.eventId === eventId);
          
          // Get team details for registered teams
          const teams = await getTeams();
          const registeredTeamsData = eventRegistrations.map(reg => {
            const team = teams.find(t => t.id === reg.teamId);
            return {
              id: reg.teamId,
              name: team ? team.name : 'Unknown Team',
              category: team ? team.category : 'Unknown',
              registrationDate: reg.registrationDate
            };
          });
          
          setRegisteredTeams(registeredTeamsData);
        } else {
          Alert.alert('Error', 'Event not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        Alert.alert('Error', 'Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, [eventId, navigation]);
  
  // Refresh data when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const registrations = await getEventRegistrations();
        const eventRegistrations = registrations.filter(reg => reg.eventId === eventId);
        
        const teams = await getTeams();
        const registeredTeamsData = eventRegistrations.map(reg => {
          const team = teams.find(t => t.id === reg.teamId);
          return {
            id: reg.teamId,
            name: team ? team.name : 'Unknown Team',
            category: team ? team.category : 'Unknown',
            registrationDate: reg.registrationDate
          };
        });
        
        setRegisteredTeams(registeredTeamsData);
      } catch (error) {
        console.error('Error refreshing registrations:', error);
      }
    });
    
    return unsubscribe;
  }, [eventId, navigation]);
  
  const renderTeamItem = ({ item }) => (
    <Card style={styles.teamCard} onPress={() => navigation.navigate('TeamDetails', { teamId: item.id })}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.registrationDate}>
        Registered: {new Date(item.registrationDate).toLocaleDateString()}
      </Text>
    </Card>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading event details...</Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Event not found</Text>
      </View>
    );
  }
  
  const isRegistrationOpen = new Date() <= new Date(event.registrationDeadline);
  
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Event Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              {new Date(event.date).toLocaleDateString()} 
              {event.endDate && event.endDate !== event.date ? 
                ` - ${new Date(event.endDate).toLocaleDateString()}` : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Registration Fee: {event.registrationFee}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
            </Text>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Organizer Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{event.organizer}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{event.contactEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{event.contactPhone}</Text>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Event Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Card>
        
        <View style={styles.registrationContainer}>
          {isRegistrationOpen ? (
            <Button
              title="Register for Event"
              onPress={() => navigation.navigate('EventRegistration', { eventId: event.id })}
            />
          ) : (
            <Text style={styles.registrationClosed}>Registration is closed for this event</Text>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Registered Teams ({registeredTeams.length})</Text>
        
        {registeredTeams.length > 0 ? (
          <FlatList
            data={registeredTeams}
            keyExtractor={item => item.id}
            renderItem={renderTeamItem}
            scrollEnabled={false}
            style={styles.teamsList}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No teams registered yet</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  registrationContainer: {
    marginVertical: 16,
  },
  registrationClosed: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 12,
  },
  teamsList: {
    marginBottom: 16,
  },
  teamCard: {
    marginBottom: 8,
    padding: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  registrationDate: {
    fontSize: 14,
    color: Colors.gray,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
});

export default EventDetailsScreen;