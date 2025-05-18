import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import Button from '../components/Button';
import Colors from '../constants/colors';
import { saveEvent } from '../utils/storage';

const EventCreationScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  
  // Category dropdown state
  const [category, setCategory] = useState('Tournament');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Tournament', value: 'Tournament' },
    { label: 'Training', value: 'Training' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Meeting', value: 'Meeting' },
    { label: 'Other', value: 'Other' },
  ]);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [currentDateField, setCurrentDateField] = useState(null);
  const [registrationDeadline, setRegistrationDeadline] = useState(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    
    if (currentDateField === 'date') {
      setDate(currentDate);
    } else if (currentDateField === 'deadline') {
      setRegistrationDeadline(currentDate);
    }
  };

  const showDatePickerFor = (field) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!title || !location || !registrationFee) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const newEvent = {
        title,
        category,
        date: date.toISOString().split('T')[0],
        registrationDeadline: registrationDeadline.toISOString().split('T')[0],
        location,
        registrationFee,
        description,
      };

      await saveEvent(newEvent);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create event. Please try again.');
      console.error('Error creating event:', error);
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
        <Text style={styles.title}>Create New Event</Text>
        <Text style={styles.subtitle}>Add a new event to the calendar</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            setItems={setCategoryItems}
            style={styles.dropdownStyle}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            textStyle={styles.dropdownTextStyle}
            placeholderStyle={styles.dropdownPlaceholderStyle}
            listItemContainerStyle={styles.dropdownListItemStyle}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Date *</Text>
          <Button
            title={date.toLocaleDateString()}
            onPress={() => showDatePickerFor('date')}
            style={styles.dateButton}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Registration Deadline *</Text>
          <Button
            title={registrationDeadline.toLocaleDateString()}
            onPress={() => showDatePickerFor('deadline')}
            style={styles.dateButton}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={currentDateField === 'date' ? date : registrationDeadline}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter event location"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Registration Fee *</Text>
          <TextInput
            style={styles.input}
            value={registrationFee}
            onChangeText={setRegistrationFee}
            placeholder="Enter registration fee (e.g., N$500)"
            keyboardType="default"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title="Create Event"
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.background,
    minHeight: 50,
  },
  dropdownContainerStyle: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.background,
  },
  dropdownTextStyle: {
    fontSize: 16,
    color: Colors.secondary,
  },
  dropdownPlaceholderStyle: {
    fontSize: 16,
    color: Colors.gray,
  },
  dropdownListItemStyle: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dateButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
});

export default EventCreationScreen;
