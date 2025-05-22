import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { getCurrentUser, updateUser } from '../utils/storage'; // Adjust these based on your storage logic

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current user data
    const loadUser = async () => {
      const user = await getCurrentUser(); // Replace with actual logic
      if (user) {
        setUsername(user.username || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setTeam(user.team || '');
        setPosition(user.position || '');
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    if (!username || !email) {
      Alert.alert('Validation', 'Username and email are required.');
      return;
    }

    setIsLoading(true);

    try {
      await updateUser({
        username,
        email,
        phone,
        team,
        position,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Edit Profile</Text>

        <Card style={styles.card}>
          <InputField icon="person-outline" value={username} onChangeText={setUsername} placeholder="Username" />
          <InputField icon="mail-outline" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <InputField icon="call-outline" value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
          <InputField icon="people-outline" value={team} onChangeText={setTeam} placeholder="Team" />
          <InputField icon="briefcase-outline" value={position} onChangeText={setPosition} placeholder="Position" />

          <Button
            title={isLoading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={isLoading}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const InputField = ({ icon, ...props }) => (
  <View style={styles.inputContainer}>
    <Ionicons name={icon} size={20} color={Colors.primary} style={styles.inputIcon} />
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
  },
});

export default EditProfileScreen;
