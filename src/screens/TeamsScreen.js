import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getTeams, getPlayers } from '../utils/storage';

const TeamsScreen = ({ navigation }) => {
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
    </Card>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <Button 
          title="Register New Team" 
          onPress={() => navigation.navigate('TeamRegistration')}
          style={styles.registerButton}
          textStyle={styles.registerButtonText}
        />
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
              <Button
                title="Register New Team"
                onPress={() => navigation.navigate('TeamRegistration')}
              />
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
    color: Colors.secondary,
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
    color: Colors.secondary,
  },
});

export default TeamsScreen;
