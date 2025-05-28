import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StatusBar, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Linking
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Feather 
} from '@expo/vector-icons';

import Card from '../components/Card';
import Button from '../components/Button';
import Colors from '../constants/colors';
import { getAnnouncements } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch announcements from storage
  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await getAnnouncements();
      // Only show the 3 most recent announcements on home screen
      setAnnouncements(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      {/* Header with gradient background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Namibia Hockey</Text>
            <Text style={styles.subtitle}>Official Mobile App</Text>
          </View>
        </View>
        
        {/* User welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome{user ? `, ${user.username || user.name || 'User'}` : ''}!
          </Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Feather name="user" size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary, Colors.secondary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Main action buttons */}
        <View style={styles.mainActions}>
          <TouchableOpacity 
            style={styles.mainActionButton}
            onPress={() => navigation.navigate('EventsTab')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: Colors.primary }]}>
              <FontAwesome5 name="hockey-puck" size={24} color={Colors.background} />
            </View>
            <Text style={styles.mainActionText}>Events</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mainActionButton}
            onPress={() => navigation.navigate('TeamsTab')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="people" size={24} color={Colors.background} />
            </View>
            <Text style={styles.mainActionText}>Teams</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mainActionButton}
            onPress={() => navigation.navigate('PlayersTab',{ screen: 'Players' })}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: Colors.accent }]}>
              <Ionicons name="person" size={24} color={Colors.background} />
            </View>
            <Text style={styles.mainActionText}>Players</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('TeamsTab', { screen: 'TeamRegistration' })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="people-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Register Team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('PlayersTab', { screen: 'PlayerRegistration' })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Register Player</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('EventsTab', { screen: 'EventRegistration',})}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Event Entry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Announcements')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="bullhorn-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Announcements Section */}
        <View style={styles.announcementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Announcements</Text>
            <TouchableOpacity 
              style={styles.viewAllLink}
              onPress={() => navigation.navigate('Announcements')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading announcements...</Text>
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="info" size={24} color={Colors.gray} />
              <Text style={styles.emptyText}>No announcements available</Text>
            </View>
          ) : (
            <View style={styles.announcementsList}>
              {announcements.map(announcement => (
                <TouchableOpacity 
                  key={announcement.id} 
                  style={[styles.announcementCard, announcement.important && styles.importantCard]}
                  onPress={() => {}}
                >
                  {announcement.important && (
                    <View style={styles.importantBadge}>
                      <Ionicons name="alert-circle" size={12} color={Colors.background} />
                      <Text style={styles.importantText}>Important</Text>
                    </View>
                  )}
                  <View style={styles.announcementHeader}>
                    <Text style={styles.announcementTitle} numberOfLines={1}>{announcement.title}</Text>
                    <Text style={styles.announcementDate}>{new Date(announcement.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.announcementMessage} numberOfLines={2}>
                    {announcement.content}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* External Links Section */}
        <View style={styles.linksSection}>
          <Text style={styles.linksSectionTitle}>Quick Links</Text>
          
          <TouchableOpacity 
          style={styles.linkCard} 
          onPress={() => Linking.openURL('https://www.facebook.com/NamibiaHockey/')}
          >
            <View style={styles.linkIconContainer}>
              <Feather name="globe" size={20} color={Colors.background} />
            </View>
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkTitle}>Official Website</Text>
              <Text style={styles.linkSubtitle}>Visit the Namibia Hockey Union website</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkCard} 
            onPress={() => navigation.navigate('EventsTab')}
          >
            <View style={[styles.linkIconContainer, {backgroundColor: Colors.secondary}]}>
              <Feather name="calendar" size={20} color={Colors.background} />
            </View>
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkTitle}>Upcoming Events</Text>
              <Text style={styles.linkSubtitle}>View all scheduled hockey events</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkCard}
            onPress={() => navigation.navigate('TeamsTab')}
          >
            <View style={[styles.linkIconContainer, {backgroundColor: Colors.accent}]}>
              <Feather name="users" size={20} color={Colors.background} />
            </View>
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkTitle}>Teams Directory</Text>
              <Text style={styles.linkSubtitle}>Browse all registered hockey teams</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    marginRight: 15,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.background,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.background,
    opacity: 0.9,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: '500',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  mainActionButton: {
    alignItems: 'center',
    width: width / 3 - 20,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  mainActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: Colors.background,
    borderRadius: 15,
    margin: 15,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    marginRight: 10,
  },
  quickActionText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  announcementsSection: {
    margin: 15,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 3,
  },
  loadingContainer: {
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: Colors.background,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: 10,
  },
  announcementsList: {
    marginBottom: 10,
  },
  announcementCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  importantCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  importantText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.primary,
    flex: 1,
    marginRight: 10,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  announcementMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  linksSection: {
    margin: 15,
    marginTop: 5,
    marginBottom: 30,
  },
  linksSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  linkCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  linkSubtitle: {
    fontSize: 12,
    color: Colors.darkGray,
  },
});

export default HomeScreen;
