import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { 
  submitRoleRequest, 
  checkUserHasPendingRequest, 
  getCurrentUser,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getUsers
} from '../utils/storage';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [showReviewRequests, setShowReviewRequests] = useState(false);
  const [requestedRole, setRequestedRole] = useState('manager');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [users, setUsers] = useState([]);

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

  const loadPendingRequests = async () => {
    try {
      const requests = await getPendingRoleRequests();
      const allUsers = await getUsers();
      setPendingRequests(requests);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const handleReviewRequests = async () => {
    await loadPendingRequests();
    setShowReviewRequests(true);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveRoleRequest(requestId, user.id);
      Alert.alert('Success', 'Role request approved!');
      // Reload pending requests
      await loadPendingRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this role request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectRoleRequest(requestId, user.id, 'Request rejected by admin');
              Alert.alert('Success', 'Role request rejected!');
              // Reload pending requests
              await loadPendingRequests();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to reject request.');
            }
          }
        }
      ]
    );
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
        console.log('Refreshed user data:', currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
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

        {/* Role Request Form */}
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
            <Button title="Cancel" onPress={() => setShowRoleRequest(false)} style={[styles.button, styles.logoutButton]} />
          </Card>
        )}

        {/* Review Requests Section */}
        {showReviewRequests && (
          <Card style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pending Role Requests</Text>
              <Button 
                title="Close" 
                onPress={() => setShowReviewRequests(false)} 
                style={[styles.smallButton, styles.logoutButton]} 
              />
            </View>
            
            {pendingRequests.length === 0 ? (
              <Text style={styles.noRequestsText}>No pending role requests</Text>
            ) : (
              <ScrollView style={styles.requestsList}>
                {pendingRequests.map((request) => {
                  const requestUser = getUserById(request.userId);
                  return (
                    <View key={request.id} style={styles.requestItem}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestUserName}>
                          {requestUser ? requestUser.username : 'Unknown User'}
                        </Text>
                        <Text style={styles.requestDetails}>
                          Requested Role: {request.requestedRole.charAt(0).toUpperCase() + request.requestedRole.slice(1)}
                        </Text>
                        <Text style={styles.requestDetails}>
                          Email: {requestUser ? requestUser.email : 'N/A'}
                        </Text>
                        {request.team && (
                          <Text style={styles.requestDetails}>
                            Team: {request.team}
                          </Text>
                        )}
                        <Text style={styles.requestDate}>
                          Requested: {formatDate(request.requestDate)}
                        </Text>
                      </View>
                      
                      <View style={styles.requestActions}>
                        <Button
                          title="Approve"
                          onPress={() => handleApproveRequest(request.id)}
                          style={[styles.smallButton, styles.approveButton]}
                        />
                        <Button
                          title="Reject"
                          onPress={() => handleRejectRequest(request.id)}
                          style={[styles.smallButton, styles.logoutButton]}
                        />
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  buttonContainer: { marginTop: 8 },
  button: { marginBottom: 12 },
  smallButton: { 
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  adminButton: {
    backgroundColor: Colors.secondary,
  },
  approveButton: {
    backgroundColor: Colors.success || '#28a745',
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  requestsList: {
    maxHeight: 400,
  },
  requestItem: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 4,
  },
  requestDetails: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noRequestsText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.gray,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default ProfileScreen;