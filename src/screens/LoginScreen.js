import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { loginUser } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Reset error
    setError('');
    
    // Validate input
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Attempt to login
      const user = await loginUser(username, password);
      
      // Use the signIn function from AuthContext to update authentication state
      signIn(user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'Local storage cleared.');
    } catch (error) {
      console.error('Storage clear error:', error);
      Alert.alert('Error', 'Failed to clear local storage.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Ionicons name="trophy-outline" size={80} color={Colors.warning} />
          <Text style={styles.appTitle}>NamHockey</Text>
          <Text style={styles.appSubtitle}>Official Information and Team Management App</Text>
        </View>
        
        <Card style={styles.loginCard}>
          <Text style={styles.cardTitle}>Login</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <Button
            title={isLoading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading}
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: Colors.secondary,
  },
  loginCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: Colors.secondary,
  },
  signupLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  helpText: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 8,
  },
  credentials: {
    fontSize: 14,
    color: Colors.primary,
  },
});

export default LoginScreen;