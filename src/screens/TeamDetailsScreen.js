import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getTeams, getPlayers } from '../utils/storage';

const TeamDetailsScreen = ({ route, navigation }) => {
  const { teamId } = route.params;
  
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch team and player data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teams
        const teamsData = await getTeams();
        const foundTeam = teamsData.find(t => t.id === teamId);
        
        if (!foundTeam) {
          setError('Team not found');
          return;
        }
        
        setTeam(foundTeam);
        
        // Fetch players for this team
        const allPlayers = await getPlayers();
        const teamPlayers = allPlayers.filter(p => p.teamId === teamId);
        setPlayers(teamPlayers);
        
        // Enhanced Debug: Log the players data to check structure
        console.log('=== PLAYER DATA DEBUG ===');
        console.log('Total Team Players:', teamPlayers.length);
        teamPlayers.forEach((player, index) => {
          console.log(`Player ${index + 1}:`, JSON.stringify(player, null, 2));
          console.log(`Player ${index + 1} keys:`, Object.keys(player));
          console.log(`Player ${index + 1} age-related properties:`, {
            age: player.age,
            playerAge: player.playerAge,
            dateOfBirth: player.dateOfBirth,
            dob: player.dob,
            birthDate: player.birthDate,
          });
        });
        
      } catch (error) {
        console.error('Error fetching team details:', error);
        setError('Failed to load team details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [teamId]);
  
  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Function to get player age with multiple fallback options
  const getPlayerAge = (player) => {
    // Try direct age property first
    if (player.age !== undefined && player.age !== null && player.age !== '') {
      return player.age;
    }
    
    // Try playerAge property
    if (player.playerAge !== undefined && player.playerAge !== null && player.playerAge !== '') {
      return player.playerAge;
    }
    
    // Try to calculate from date of birth variants
    const dobFields = ['dateOfBirth', 'dob', 'birthDate', 'date_of_birth'];
    for (const field of dobFields) {
      if (player[field]) {
        const calculatedAge = calculateAge(player[field]);
        if (calculatedAge !== null) {
          return calculatedAge;
        }
      }
    }
    
    return null;
  };
  
  // Function to get player name with fallbacks
  const getPlayerName = (player) => {
    return player.name || 
           player.playerName || 
           player.fullName || 
           `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
           'Unknown Player';
  };
  
  // Function to get player position with fallbacks
  const getPlayerPosition = (player) => {
    return player.position || 
           player.playerPosition || 
           player.pos || 
           'No Position';
  };
  
  // Mock upcoming matches (we'll keep this as mock data for now)
  const [upcomingMatches, setUpcomingMatches] = useState([
    { id: '1', opponent: 'Coastal Hockey Club', date: '2025-06-10', venue: 'Home' },
    { id: '2', opponent: 'University of Namibia', date: '2025-06-17', venue: 'Away' },
    { id: '3', opponent: 'Namibia Defense Force', date: '2025-06-24', venue: 'Home' },
  ]);
  
  const renderPlayerItem = ({ item }) => {
    const playerName = getPlayerName(item);
    const playerPosition = getPlayerPosition(item);
    const playerAge = getPlayerAge(item);
    
    // Debug: Log processed player data
    console.log(`Rendering player: ${playerName}`);
    console.log(`- Position: ${playerPosition}`);
    console.log(`- Age: ${playerAge}`);
    console.log(`- Raw data:`, JSON.stringify(item, null, 2));
    
    return (
      <Card style={styles.playerCard} onPress={() => navigation.navigate('PlayersTab', { screen: 'PlayerDetails', params: { playerId: item.id } })}>
        <View style={styles.playerInfo}>
          <View style={styles.playerMainInfo}>
            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.playerPosition}>{playerPosition}</Text>
          </View>
          <View style={styles.playerSecondaryInfo}>
            <Text style={styles.playerAge}>
              Age: {playerAge !== null ? playerAge : 'N/A'}
            </Text>
          </View>
          
      
          
        </View>
      </Card>
    );
  };
  
  const renderMatchItem = ({ item }) => (
    <Card style={styles.matchCard}>
      <View style={styles.matchInfo}>
        <Text style={styles.matchDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.matchOpponent}>vs {item.opponent}</Text>
        <View style={[styles.venueBadge, item.venue === 'Home' ? styles.homeVenue : styles.awayVenue]}>
          <Text style={styles.venueText}>{item.venue}</Text>
        </View>
      </View>
    </Card>
  );
  
  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading team details...</Text>
      </View>
    );
  }
  
  // Show error message
  if (error || !team) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Team not found'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{team.category}</Text>
          </View>
        </View>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Team Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Division: {team.division}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Founded: {team.founded}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Home Ground: {team.homeGround}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Coach: {team.coach}</Text>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{team.contactEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{team.contactPhone}</Text>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>{team.description}</Text>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Players ({players.length})</Text>
          <Button 
            title="Add Player" 
            onPress={() => navigation.navigate('PlayersTab', {
              screen: 'PlayerRegistration',
              params: { teamId: teamId }
            })}
            style={styles.addButton}
            textStyle={styles.addButtonText}
          />
        </View>
        
        {players.length === 0 ? (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No players registered yet</Text>
          </Card>
        ) : (
          <FlatList
            data={players}
            keyExtractor={item => item.id}
            renderItem={renderPlayerItem}
            scrollEnabled={false}
          />
        )}
        
        <Text style={styles.sectionTitle}>Upcoming Matches</Text>
        
        <FlatList
          data={upcomingMatches}
          keyExtractor={item => item.id}
          renderItem={renderMatchItem}
          scrollEnabled={false}
          style={styles.matchesList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 20,
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  categoryText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 16,
  },
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
  description: {
    fontSize: 16,
    color: Colors.secondary,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  addButtonText: {
    fontSize: 14,
  },
  playerCard: {
    marginBottom: 8,
    padding: 12,
  },
  playerInfo: {
    flexDirection: 'column',
  },
  playerMainInfo: {
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  playerSecondaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAge: {
    fontSize: 14,
    color: Colors.secondary,
    opacity: 0.8,
  },
  debugInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyStateCard: {
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.secondary,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  matchesList: {
    marginBottom: 16,
  },
  matchCard: {
    marginBottom: 8,
    padding: 12,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchDate: {
    fontSize: 14,
    color: Colors.secondary,
  },
  matchOpponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
    marginLeft: 12,
  },
  venueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  homeVenue: {
    backgroundColor: Colors.success,
  },
  awayVenue: {
    backgroundColor: Colors.info,
  },
  venueText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TeamDetailsScreen;