import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getPlayers, getTeams } from '../utils/storage';

const PlayersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load players and teams from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load teams first to get team names
        const storedTeams = await getTeams();
        const teamMap = {};
        storedTeams.forEach(team => {
          teamMap[team.id] = team.name;
        });
        setTeams(teamMap);
        
        // Load players
        const storedPlayers = await getPlayers();
        // Format player data
        const formattedPlayers = storedPlayers.map(player => ({
          id: player.id,
          name: `${player.firstName} ${player.lastName}`,
          team: teamMap[player.teamId] || 'Unknown Team',
          position: player.position,
          age: calculateAge(player.dateOfBirth),
          teamId: player.teamId
        }));
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Refresh data when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        setIsLoading(true);
        
        // Refresh teams
        const storedTeams = await getTeams();
        const teamMap = {};
        storedTeams.forEach(team => {
          teamMap[team.id] = team.name;
        });
        setTeams(teamMap);
        
        // Refresh players
        const storedPlayers = await getPlayers();
        const formattedPlayers = storedPlayers.map(player => ({
          id: player.id,
          name: `${player.firstName} ${player.lastName}`,
          team: teamMap[player.teamId] || 'Unknown Team',
          position: player.position,
          age: calculateAge(player.dateOfBirth),
          teamId: player.teamId
        }));
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error('Error refreshing players:', error);
      } finally {
        setIsLoading(false);
      }
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlayerItem = ({ item }) => (
    <Card style={styles.playerCard} onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{item.name}</Text>
        <View style={styles.ageBadge}>
          <Text style={styles.ageText}>{item.age}</Text>
        </View>
      </View>
      <View style={styles.playerInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>{item.team}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="football-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>{item.position}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Players</Text>
        <Button 
          title="Register New Player" 
          onPress={() => navigation.navigate('PlayerRegistration')}
          style={styles.registerButton}
          textStyle={styles.registerButtonText}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <Text>Loading players...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={item => item.id}
          renderItem={renderPlayerItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No players match your search' : 'No players found'}
              </Text>
              {!searchQuery && (
                <Button
                  title="Register New Player"
                  onPress={() => navigation.navigate('PlayerRegistration')}
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
    color: Colors.secondary,
    marginBottom: 20,
    textAlign: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    margin: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  playerCard: {
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
  },
  ageBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ageText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerInfo: {
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

export default PlayersScreen;
