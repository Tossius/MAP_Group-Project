import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

import Button from '../components/Button';
import Colors from '../constants/colors';
import { getTeams, getPlayers, getEvents, saveEventRegistration } from '../utils/storage';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamName, setSelectedTeamName] = useState('Select a team');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [minimumPlayers, setMinimumPlayers] = useState(2); // Minimum players required for an event
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for event, teams, and players data
  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  
  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load event data
        const events = await getEvents();
        const foundEvent = events.find(e => e.id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          // Handle case when event is not found
          console.error('Event not found with ID:', eventId);
          Alert.alert(
            'Error',
            'Event not found. Please try again or contact support.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        // Load teams
        const storedTeams = await getTeams();
        setTeams(storedTeams);
        
        // Format teams for dropdown
        const formattedTeams = storedTeams.map(team => ({
          name: team.name,
          id: team.id
        }));
        setTeamOptions(formattedTeams);
        
        // Load players
        const storedPlayers = await getPlayers();
        // Format player names for display
        const formattedPlayers = storedPlayers.map(player => ({
          id: player.id,
          name: `${player.firstName} ${player.lastName}`,
          teamId: player.teamId
        }));
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    };
    
    loadData();
  }, [eventId]);
  
  // Update team name when team id changes
  useEffect(() => {
    if (selectedTeam) {
      const team = teamOptions.find(t => t.id === selectedTeam);
      if (team) {
        setSelectedTeamName(team.name);
      }
    }
  }, [selectedTeam, teamOptions]);
  
  // Filter players based on selected team
  const teamPlayers = players.filter(player => player.teamId === selectedTeam);
  
  // Get the number of players in the team
  const playerCount = teamPlayers.length;
  

  
  const handleSubmit = async () => {
    if (!selectedTeam) {
      Alert.alert('Validation Error', 'Please select a team');
      return;
    }
    
    if (playerCount < minimumPlayers) {
      Alert.alert('Validation Error', `Your team needs at least ${minimumPlayers} players to register (currently has ${playerCount})`);
      return;
    }
    
    if (!acceptedTerms) {
      Alert.alert('Validation Error', 'Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get all player IDs from the team (up to the first minimumPlayers)
      const playerIds = teamPlayers.slice(0, minimumPlayers).map(player => player.id);
      
      const registrationData = {
        eventId,
        teamId: selectedTeam,
        playerIds: playerIds,
        acceptedTerms,
      };
      
      await saveEventRegistration(registrationData);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Event registration submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save registration. Please try again.');
      console.error('Error saving registration:', error);
    }
  };
  
  // Show loading or error state if event is not loaded yet
  if (!event) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Text>Loading event details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
        <Text style={styles.title}>Event Registration</Text>
        <Text style={styles.subtitle}>Register for {event.title}</Text>
        
        <View style={styles.eventInfoCard}>
          <Text style={styles.eventInfoTitle}>Event Details</Text>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Date:</Text>
            <Text style={styles.eventInfoValue}>{new Date(event.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Location:</Text>
            <Text style={styles.eventInfoValue}>{event.location}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Registration Fee:</Text>
            <Text style={styles.eventInfoValue}>{event.registrationFee}</Text>
          </View>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Team *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowTeamModal(true)}
          >
            <Text style={selectedTeam ? styles.selectText : styles.placeholderText}>{selectedTeamName}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <Modal
            visible={showTeamModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTeamModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowTeamModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Team</Text>
                {teamOptions.length > 0 ? (
                  teamOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.modalOption, selectedTeam === option.id && styles.selectedOption]}
                      onPress={() => {
                        setSelectedTeam(option.id);
                        setSelectedTeamName(option.name);
                        setShowTeamModal(false);
                        // No need to reset selected players as we're using all team players
                      }}
                    >
                      <Text style={[styles.modalOptionText, selectedTeam === option.id && styles.selectedOptionText]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noOptionsText}>No teams available</Text>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        
        {selectedTeam && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Team Players</Text>
            <View style={styles.playersContainer}>
              <Text style={styles.playerCountText}>
                {playerCount} players registered for this team
              </Text>
              {playerCount < minimumPlayers && (
                <Text style={styles.warningText}>
                  Your team needs at least {minimumPlayers} players to register for this event.
                </Text>
              )}
              {playerCount >= minimumPlayers && (
                <Text style={styles.successText}>
                  Your team meets the minimum requirement of {minimumPlayers} players.
                </Text>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.termsContainer}>
          <Checkbox
            status={acceptedTerms ? 'checked' : 'unchecked'}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            color={Colors.primary}
          />
          <Text style={styles.termsText}>
            I accept the terms and conditions for this event and confirm that all registered players are eligible to participate.
          </Text>
        </View>
        
        <Button
          title="Submit Registration"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 24,
  },
  eventInfoCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  eventInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  eventInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.secondary,
    width: 120,
  },
  eventInfoValue: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.secondary,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.background,
    padding: 12,
    height: 50,
  },
  selectText: {
    fontSize: 16,
    color: Colors.secondary,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '20', // 20% opacity
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.secondary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  noOptionsText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    padding: 15,
  },
  playersContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    padding: 8,
    backgroundColor: Colors.background,
  },
  playerCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  playerName: {
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 8,
  },
  noPlayersText: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
    padding: 8,
  },
  playerCountText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#d9534f', // Red color for warning
    fontStyle: 'italic',
    padding: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#5cb85c', // Green color for success
    fontStyle: 'italic',
    padding: 8,
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
    marginLeft: 8,
  },
});

export default EventRegistrationScreen;
