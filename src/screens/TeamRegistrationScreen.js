import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Colors from '../constants/colors';
import { saveTeam } from '../utils/storage';

const TeamRegistrationScreen = ({ navigation }) => {
  const [teamName, setTeamName] = useState('');
  const [category, setCategory] = useState('Men');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const categoryOptions = [
    'Men', 'Women', 'Boys U18', 'Girls U18', 'Boys U16', 'Girls U16', 'Boys U14', 'Girls U14'
  ];
  
  const [division, setDivision] = useState('Premier');
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const divisionOptions = ['Premier', 'First', 'Second', 'Development'];
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!teamName || !category || !division || !contactName || !contactEmail || !contactPhone) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const teamData = {
        name: teamName,
        category,
        division,
        contactName,
        contactEmail,
        contactPhone,
      };

      await saveTeam(teamData);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Team registration submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Teams');
            },
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save team. Please try again.');
      console.error('Error saving team:', error);
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
        <Text style={styles.title}>Team Registration</Text>
        <Text style={styles.subtitle}>Register your team for the upcoming season</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Team Name *</Text>
          <TextInput
            style={styles.input}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectText}>{category}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                {categoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, category === option && styles.selectedOption]}
                    onPress={() => {
                      setCategory(option);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, category === option && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Division *</Text>
          <TouchableOpacity 
            style={styles.selectField}
            onPress={() => setShowDivisionModal(true)}
          >
            <Text style={styles.selectText}>{division}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <Modal
            visible={showDivisionModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDivisionModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDivisionModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Division</Text>
                {divisionOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, division === option && styles.selectedOption]}
                    onPress={() => {
                      setDivision(option);
                      setShowDivisionModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, division === option && styles.selectedOptionText]}>
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
          <Text style={styles.label}>Contact Person *</Text>
          <TextInput
            style={styles.input}
            value={contactName}
            onChangeText={setContactName}
            placeholder="Enter contact person's name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="Register Team"
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
});

export default TeamRegistrationScreen;
