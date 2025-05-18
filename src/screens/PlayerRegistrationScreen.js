import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import Button from '../components/Button';
import Colors from '../constants/colors';
import { savePlayer, getTeams } from '../utils/storage';

const PlayerRegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Gender state
  const [gender, setGender] = useState('Male');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const genderOptions = ['Male', 'Female'];
  
  // Team state
  const [team, setTeam] = useState('');
  const [teamName, setTeamName] = useState('Select a team');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  
  // Position state
  const [position, setPosition] = useState('Forward');
  const [showPositionModal, setShowPositionModal] = useState(false);
  const positionOptions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load teams from storage
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const storedTeams = await getTeams();
        // Format teams for dropdown
        const formattedTeams = storedTeams.map(team => ({
          name: team.name,
          id: team.id
        }));
        setTeamOptions(formattedTeams);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };

    loadTeams();
  }, []);
  
  // Update team name when team id changes
  useEffect(() => {
    if (team) {
      const selectedTeam = teamOptions.find(t => t.id === team);
      if (selectedTeam) {
        setTeamName(selectedTeam.name);
      }
    }
  }, [team, teamOptions]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !team || !email || !phone) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const playerData = {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        gender,
        teamId: team,
        position,
        email,
        phone,
      };

      await savePlayer(playerData);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Player registration submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save player. Please try again.');
      console.error('Error saving player:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
        <Text style={styles.title}>Player Registration</Text>
        <Text style={styles.subtitle}>Register as a player in the Namibia Hockey Union</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <Button
            title={dateOfBirth.toLocaleDateString()}
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          />
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={styles.selectText}>{gender}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <Modal
            visible={showGenderModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowGenderModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowGenderModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, gender === option && styles.selectedOption]}
                    onPress={() => {
                      setGender(option);
                      setShowGenderModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, gender === option && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Team *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowTeamModal(true)}
          >
            <Text style={team ? styles.selectText : styles.placeholderText}>{teamName}</Text>
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
                      style={[styles.modalOption, team === option.id && styles.selectedOption]}
                      onPress={() => {
                        setTeam(option.id);
                        setTeamName(option.name);
                        setShowTeamModal(false);
                      }}
                    >
                      <Text style={[styles.modalOptionText, team === option.id && styles.selectedOptionText]}>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Position *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowPositionModal(true)}
          >
            <Text style={styles.selectText}>{position}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <Modal
            visible={showPositionModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPositionModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowPositionModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Position</Text>
                {positionOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, position === option && styles.selectedOption]}
                    onPress={() => {
                      setPosition(option);
                      setShowPositionModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, position === option && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="Register Player"
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginTop: 24,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
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
  dateButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
});

export default PlayerRegistrationScreen;
