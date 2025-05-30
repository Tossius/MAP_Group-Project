import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { getCurrentUser, updateUser as updateUserStorage } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (user) {
        setUsername(user.username || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setTeam(user.team || '');
        setPosition(user.position || '');
      } else {
        const storedUser = await getCurrentUser();
        if (storedUser) {
          setUsername(storedUser.username || '');
          setEmail(storedUser.email || '');
          setPhone(storedUser.phone || '');
          setTeam(storedUser.team || '');
          setPosition(storedUser.position || '');
        }
      }
    };

    loadUser();
  }, [user]);

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      Alert.alert('Validation', 'Username and email are required.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = {
        ...user,
        username: trimmedUsername,
        email: trimmedEmail,
        phone,
        team,
        position,
      };

      await updateUserStorage(updatedUser);
      updateUser(updatedUser);

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
            disabled={isLoading || !username.trim() || !email.trim()}
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
    color: Colors.text,
  },
});

export default EditProfileScreen;
