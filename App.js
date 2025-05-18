import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, LogBox, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

import AppNavigator from './src/navigation/AppNavigator';
import Colors from './src/constants/colors';
import { initializeStorage } from './src/utils/storage';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
  'Non-serializable values were found in the navigation state',
]);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger || 'red',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 20,
    textAlign: 'center',
  }
});

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize async storage with sample data if empty
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing async storage...');
        await initializeStorage();
        console.log('Async storage initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing storage:', error);
        setError(error.message);
      }
    };
    
    initialize();
  }, []);
  
  // Show loading screen while initializing
  if (!isInitialized && !error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Show error screen if initialization failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error initializing app:</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button title="Retry" onPress={() => window.location.reload()} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
