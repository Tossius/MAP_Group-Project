import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  
  // Mock event data
  const [event, setEvent] = useState({
    id: eventId,
    title: 'National Championship',
    date: '2025-06-15',
    endDate: '2025-06-20',
    location: 'Windhoek Stadium',
    registrationFee: 'N$500',
    registrationDeadline: '2025-05-30',
    organizer: 'Namibia Hockey Union',
    contactEmail: 'events@namibiahockey.org',
    contactPhone: '+264 61 234 5678',
    description: 'The annual National Hockey Championship brings together the best teams from across Namibia to compete for the national title. The tournament features men\'s and women\'s divisions with teams from all regions of the country.',
    schedule: [
      { id: '1', time: '09:00', description: 'Opening Ceremony' },
      { id: '2', time: '10:00', description: 'Group Stage Matches Begin' },
      { id: '3', time: '13:00', description: 'Lunch Break' },
      { id: '4', time: '14:00', description: 'Group Stage Matches Continue' },
      { id: '5', time: '18:00', description: 'End of Day 1' },
    ],
  });
  
  // Mock registered teams
  const [registeredTeams, setRegisteredTeams] = useState([
    { id: '1', name: 'Windhoek Hockey Club', category: 'Men', registrationDate: '2025-05-01' },
    { id: '2', name: 'Coastal Hockey Club', category: 'Women', registrationDate: '2025-05-03' },
    { id: '3', name: 'University of Namibia', category: 'Men', registrationDate: '2025-05-05' },
  ]);
  
  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.scheduleTime}>{item.time}</Text>
      <Text style={styles.scheduleDescription}>{item.description}</Text>
    </View>
  );
  
  const renderTeamItem = ({ item }) => (
    <Card style={styles.teamCard} onPress={() => navigation.navigate('TeamDetails', { teamId: item.id })}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.registrationDate}>Registered: {new Date(item.registrationDate).toLocaleDateString()}</Text>
    </Card>
  );
  
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
              {new Date(event.date).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
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
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Schedule (Day 1)</Text>
          <FlatList
            data={event.schedule}
            keyExtractor={item => item.id}
            renderItem={renderScheduleItem}
            scrollEnabled={false}
          />
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
        
        <Text style={styles.sectionTitle}>Registered Teams</Text>
        
        <FlatList
          data={registeredTeams}
          keyExtractor={item => item.id}
          renderItem={renderTeamItem}
          scrollEnabled={false}
          style={styles.teamsList}
        />
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
    color: Colors.secondary,
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.secondary,
    lineHeight: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  scheduleTime: {
    width: 80,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scheduleDescription: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
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
});

export default EventDetailsScreen;
