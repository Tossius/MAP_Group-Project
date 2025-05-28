import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { getTeams, getPlayers, deleteTeam } from '../utils/storage';

const TeamsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playerCounts, setPlayerCounts] = useState({});
  
  // Load teams from storage
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const storedTeams = await getTeams();
        setTeams(storedTeams);
        
        // Load player counts for each team
        const storedPlayers = await getPlayers();
        const counts = {};
        storedPlayers.forEach(player => {
          if (player.teamId) {
            counts[player.teamId] = (counts[player.teamId] || 0) + 1;
          }
        });
        setPlayerCounts(counts);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeams();
  }, []);
  
  // Refresh teams when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        setIsLoading(true);
        const storedTeams = await getTeams();
        setTeams(storedTeams);
        
        // Refresh player counts
        const storedPlayers = await getPlayers();
        const counts = {};
        storedPlayers.forEach(player => {
          if (player.teamId) {
            counts[player.teamId] = (counts[player.teamId] || 0) + 1;
          }
        });
        setPlayerCounts(counts);
      } catch (error) {
        console.error('Error refreshing teams:', error);
      } finally {
        setIsLoading(false);
      }
    });
    
    return unsubscribe;
  }, [navigation]);

  // Handle team deletion
  const handleDeleteTeam = async (teamId, teamName) => {
    try {
      // Check if team has players
      const playerCount = playerCounts[teamId] || 0;
      if (playerCount > 0) {
        Alert.alert(
          'Cannot Delete Team',
          `This team has ${playerCount} player(s). Please remove all players from the team before deleting it.`,
          [{ text: 'OK' }]
        );
        return;
      }

      await deleteTeam(teamId);
      setTeams(teams.filter(team => team.id !== teamId));
      Alert.alert('Success', 'Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      Alert.alert('Error', 'Failed to delete team. Please try again.');
    }
  };

  // Check user permissions
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const canRegisterTeam = isAdmin || isManager;
  const canDeleteTeam = isAdmin; // Only admins can delete teams

  const renderTeamItem = ({ item }) => (
    <Card style={styles.teamCard} onPress={() => navigation.navigate('TeamDetails', { teamId: item.id })}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.teamInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="trophy-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>{item.division} Division</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>{playerCounts[item.id] || 0} Players</Text>
        </View>
      </View>
      {canDeleteTeam && (
        <View style={styles.actionContainer}>
          <Button
            title="Delete"
            onPress={() => {
              Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete ${item.name}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => handleDeleteTeam(item.id, item.name), style: 'destructive' }
                ]
              );
            }}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        {/* Only show Register New Team button for admins and managers */}
        {canRegisterTeam && (
          <Button 
            title="Register New Team" 
            onPress={() => navigation.navigate('TeamRegistration')}
            style={styles.registerButton}
            textStyle={styles.registerButtonText}
          />
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <Text>Loading teams...</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={item => item.id}
          renderItem={renderTeamItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No teams found</Text>
              {/* Only show Register New Team button for admins and managers in empty state */}
              {canRegisterTeam && (
                <Button
                  title="Register New Team"
                  onPress={() => navigation.navigate('TeamRegistration')}
                />
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  registerButtonText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  teamCard: {
    marginBottom: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.text,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    paddingTop: 8,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 0,
    backgroundColor: Colors.accent,
  },
  deleteButtonText: {
    fontSize: 12,
  },
});

export default TeamsScreen;