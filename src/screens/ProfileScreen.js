import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { submitRoleRequest, checkUserHasPendingRequest, getCurrentUser } from '../utils/storage';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [requestedRole, setRequestedRole] = useState('manager');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug function to check user data
  const debugUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('=== DEBUG INFO ===');
      console.log('User from AuthContext:', JSON.stringify(user, null, 2));
      console.log('User from getCurrentUser():', JSON.stringify(currentUser, null, 2));
      
      setDebugInfo({
        contextUser: user,
        storageUser: currentUser
      });
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  useEffect(() => {
    debugUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRoleRequest = async () => {
    try {
      await submitRoleRequest(user.id, requestedRole, user.team);
      Alert.alert('Success', 'Role request submitted!');
      setShowRoleRequest(false);
      setHasPendingRequest(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit request.');
    }
  };

  const handleReviewRequests = () => {
    navigation.navigate('RequestsScreen');
  };

  useEffect(() => {
    const checkRequest = async () => {
      const hasPending = await checkUserHasPendingRequest(user.id);
      setHasPendingRequest(hasPending);
    };
    if (user?.id) checkRequest();
  }, [user]);

  const userData = user || {
    username: 'Guest User',
    email: 'guest@example.com',
    team: 'Not assigned',
    position: 'Not assigned',
    role: 'user',
    memberSince: new Date().getFullYear().toString(),
    profileImage: null,
  };

  const userRole = userData.role || 'user';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const showRequestRole = userRole === 'user' && !hasPendingRequest;

  const handleRefreshUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // You might need to update your AuthContext here
        // This depends on your AuthContext implementation
        console.log('Refreshed user data:', currentUser);
        debugUserData();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        {/* Debug Information Card */}
        {debugInfo && (
          <Card style={[styles.infoCard, { backgroundColor: '#fff3cd' }]}>
            <Text style={styles.cardTitle}>🐛 Debug Information</Text>
            <Text style={styles.debugText}>
              Context Role: {debugInfo.contextUser?.role || 'undefined'}
            </Text>
            <Text style={styles.debugText}>
              Storage Role: {debugInfo.storageUser?.role || 'undefined'}
            </Text>
            <Text style={styles.debugText}>
              Context Username: {debugInfo.contextUser?.username || 'undefined'}
            </Text>
            <Text style={styles.debugText}>
              Storage Username: {debugInfo.storageUser?.username || 'undefined'}
            </Text>
            <Button 
              title="Refresh Debug Info" 
              onPress={handleRefreshUserData} 
              style={[styles.button, { backgroundColor: '#ffc107' }]} 
            />
          </Card>
        )}

        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={Colors.gray} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData.username || userData.name || 'User'}</Text>
          <Text style={styles.userRole}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Text>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          
          {/* Name */}
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{userData.username || userData.name || 'User'}</Text>
          </View>

          {/* Role */}
          <View style={styles.infoRow}>
            <Ionicons name="shield-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Text>
          </View>

          {/* Email */}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>

          {/* Team - only show if role is manager */}
          {isManager && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>Team: {userData.team}</Text>
            </View>
          )}
        </Card>

        {showRoleRequest && (
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>Request a Role</Text>
            <View style={styles.infoRow}>
              <Text style={{ marginRight: 10 }}>Select role:</Text>
              <Picker
                selectedValue={requestedRole}
                onValueChange={(itemValue) => setRequestedRole(itemValue)}
                style={{ flex: 1 }}
              >
                <Picker.Item label="Manager" value="manager" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
            <Button title="Submit Request" onPress={handleSubmitRoleRequest} style={styles.button} />
            <Button title="Cancel" onPress={() => setShowRoleRequest(false)} style={[styles.button, styles.secondaryButton]} />
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.button}
          />
          
          {/* Show Request Role button only for regular users without pending requests */}
          {showRequestRole && (
            <Button
              title="Request Role"
              onPress={() => setShowRoleRequest(true)}
              style={styles.button}
            />
          )}

          {/* Show Review Requests button only for admins */}
          {isAdmin && (
            <Button
              title="Review Requests"
              onPress={handleReviewRequests}
              style={[styles.button, styles.adminButton]}
            />
          )}

          <Button
            title="Logout"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.lightGray },
  container: { padding: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  profileImageContainer: { marginBottom: 16 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 4,
  },
  userRole: { 
    fontSize: 16, 
    color: Colors.primary,
    fontWeight: '600',
  },
  infoCard: { marginBottom: 16 },
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
  debugText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: { marginTop: 8 },
  button: { marginBottom: 12 },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  adminButton: {
    backgroundColor: Colors.secondary,
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
});

export default ProfileScreen;