import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage keys
export const STORAGE_KEYS = {
  TEAMS: 'hockey_teams',
  PLAYERS: 'hockey_players',
  EVENTS: 'hockey_events',
  EVENT_REGISTRATIONS: 'hockey_event_registrations',
  USERS: 'hockey_users',
  CURRENT_USER: 'hockey_current_user',
  ANNOUNCEMENTS: 'hockey_announcements',
};

// Helper functions
const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
    return false;
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for ${key}:`, error);
    return null;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Teams
export const getTeams = async () => {
  const teams = await getData(STORAGE_KEYS.TEAMS);
  return teams || [];
};

export const saveTeam = async (team) => {
  const teams = await getTeams();
  
  // If team has an id, it's an update
  if (team.id) {
    const updatedTeams = teams.map(t => t.id === team.id ? team : t);
    return storeData(STORAGE_KEYS.TEAMS, updatedTeams);
  } else {
    // New team
    const newTeam = {
      ...team,
      id: generateId(),
    };
    return storeData(STORAGE_KEYS.TEAMS, [...teams, newTeam]);
  }
};

export const deleteTeam = async (teamId) => {
  const teams = await getTeams();
  const filteredTeams = teams.filter(team => team.id !== teamId);
  return storeData(STORAGE_KEYS.TEAMS, filteredTeams);
};

// Players
export const getPlayers = async () => {
  const players = await getData(STORAGE_KEYS.PLAYERS);
  return players || [];
};

export const savePlayer = async (player) => {
  const players = await getPlayers();
  
  // If player has an id, it's an update
  if (player.id) {
    const updatedPlayers = players.map(p => p.id === player.id ? player : p);
    return storeData(STORAGE_KEYS.PLAYERS, updatedPlayers);
  } else {
    // New player
    const newPlayer = {
      ...player,
      id: generateId(),
    };
    return storeData(STORAGE_KEYS.PLAYERS, [...players, newPlayer]);
  }
};

export const deletePlayer = async (playerId) => {
  const players = await getPlayers();
  const filteredPlayers = players.filter(player => player.id !== playerId);
  return storeData(STORAGE_KEYS.PLAYERS, filteredPlayers);
};

// Events
export const getEvents = async () => {
  const events = await getData(STORAGE_KEYS.EVENTS);
  return events || [];
};

export const saveEvent = async (event) => {
  const events = await getEvents();
  
  // If event has an id, it's an update
  if (event.id) {
    const updatedEvents = events.map(e => e.id === event.id ? event : e);
    return storeData(STORAGE_KEYS.EVENTS, updatedEvents);
  } else {
    // New event
    const newEvent = {
      ...event,
      id: generateId(),
    };
    return storeData(STORAGE_KEYS.EVENTS, [...events, newEvent]);
  }
};

export const deleteEvent = async (eventId) => {
  const events = await getEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  return storeData(STORAGE_KEYS.EVENTS, filteredEvents);
};

// Event Registrations
export const getEventRegistrations = async () => {
  const registrations = await getData(STORAGE_KEYS.EVENT_REGISTRATIONS);
  return registrations || [];
};

export const saveEventRegistration = async (registration) => {
  const registrations = await getEventRegistrations();
  
  // If registration has an id, it's an update
  if (registration.id) {
    const updatedRegistrations = registrations.map(r => r.id === registration.id ? registration : r);
    return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, updatedRegistrations);
  } else {
    // New registration
    const newRegistration = {
      ...registration,
      id: generateId(),
      registrationDate: new Date().toISOString(),
    };
    return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, [...registrations, newRegistration]);
  }
};

export const deleteEventRegistration = async (registrationId) => {
  const registrations = await getEventRegistrations();
  const filteredRegistrations = registrations.filter(registration => registration.id !== registrationId);
  return storeData(STORAGE_KEYS.EVENT_REGISTRATIONS, filteredRegistrations);
};

// User Authentication Functions
export const getUsers = async () => {
  try {
    const data = await getData(STORAGE_KEYS.USERS);
    return data || [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const registerUser = async (userData) => {
  try {
    const users = await getUsers();
    
    // Check if username already exists
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Create new user object
    const newUser = {
      id: generateId(),
      username: userData.username,
      password: userData.password, // In a real app, this should be hashed
      email: userData.email,
      isAdmin: false, // New users are not admins by default
      createdAt: new Date().toISOString()
    };
    
    // Add to users array and save
    users.push(newUser);
    await storeData(STORAGE_KEYS.USERS, users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const users = await getUsers();
    
    // Find user with matching credentials
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Save current user to storage
    const { password: pwd, ...userWithoutPassword } = user;
    await storeData(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await getData(STORAGE_KEYS.CURRENT_USER);
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

// Announcement Functions
export const getAnnouncements = async () => {
  try {
    const data = await getData(STORAGE_KEYS.ANNOUNCEMENTS);
    return data || [];
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
};

export const createAnnouncement = async (announcementData, user) => {
  try {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      throw new Error('Only administrators can create announcements');
    }
    
    const announcements = await getAnnouncements();
    
    // Create new announcement
    const newAnnouncement = {
      id: generateId(),
      title: announcementData.title,
      content: announcementData.content,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
      important: announcementData.important || false
    };
    
    // Add to announcements array and save
    announcements.unshift(newAnnouncement); // Add to beginning of array
    await storeData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    
    return newAnnouncement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId, user) => {
  try {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      throw new Error('Only administrators can delete announcements');
    }
    
    const announcements = await getAnnouncements();
    
    // Filter out the announcement to delete
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);
    
    // Save updated announcements
    await storeData(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
    
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Initialize storage with sample data
export const initializeStorage = async () => {
  try {
    // Check if teams exist, if not, initialize with sample data
    const teams = await getTeams();
    if (teams.length === 0) {
      const sampleTeams = [
        { id: '1', name: 'Windhoek Hockey Club', category: 'Men', division: 'Premier', contactName: 'John Smith', contactEmail: 'john@whc.com', contactPhone: '123-456-7890' },
        { id: '2', name: 'Coastal Hockey Club', category: 'Women', division: 'Premier', contactName: 'Sarah Johnson', contactEmail: 'sarah@chc.com', contactPhone: '234-567-8901' },
        { id: '3', name: 'University of Namibia', category: 'Men', division: 'First', contactName: 'Michael Brown', contactEmail: 'michael@unam.com', contactPhone: '345-678-9012' },
        { id: '4', name: 'Namibia Defense Force', category: 'Women', division: 'First', contactName: 'Emma Williams', contactEmail: 'emma@ndf.com', contactPhone: '456-789-0123' },
        { id: '5', name: 'Swakopmund Hockey Club', category: 'Men', division: 'Premier', contactName: 'David Miller', contactEmail: 'david@shc.com', contactPhone: '567-890-1234' },
      ];
      await storeData(STORAGE_KEYS.TEAMS, sampleTeams);
    }

    // Initialize players if none exist
    const players = await getPlayers();
    if (players.length === 0) {
      const samplePlayers = [
        { id: '1', firstName: 'John', lastName: 'Smith', dateOfBirth: '1995-05-15', gender: 'Male', teamId: '1', position: 'Forward', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', dateOfBirth: '1997-08-22', gender: 'Female', teamId: '2', position: 'Midfielder', email: 'sarah@example.com', phone: '234-567-8901' },
        { id: '3', firstName: 'Michael', lastName: 'Brown', dateOfBirth: '1994-03-10', gender: 'Male', teamId: '3', position: 'Defender', email: 'michael@example.com', phone: '345-678-9012' },
        { id: '4', firstName: 'Emma', lastName: 'Williams', dateOfBirth: '1996-11-28', gender: 'Female', teamId: '4', position: 'Goalkeeper', email: 'emma@example.com', phone: '456-789-0123' },
        { id: '5', firstName: 'David', lastName: 'Miller', dateOfBirth: '1993-07-05', gender: 'Male', teamId: '5', position: 'Forward', email: 'david@example.com', phone: '567-890-1234' },
      ];
      await storeData(STORAGE_KEYS.PLAYERS, samplePlayers);
    }

    // Check if events exist, if not, initialize with sample data
    const events = await getEvents();
    if (events.length === 0) {
      const sampleEvents = [
        { 
          id: '1', 
          title: 'National Championship', 
          date: '2025-06-15', 
          location: 'Windhoek Stadium', 
          category: 'Tournament',
          registrationDeadline: '2025-05-30',
          description: 'The annual National Hockey Championship brings together the best teams from across Namibia to compete for the national title.',
          registrationFee: 'N$500'
        },
        { 
          id: '2', 
          title: 'Junior Development Camp', 
          date: '2025-07-10', 
          location: 'University of Namibia', 
          category: 'Training',
          registrationDeadline: '2025-06-25',
          description: 'A development camp for junior players to improve their skills and learn from experienced coaches.',
          registrationFee: 'N$300'
        },
        { 
          id: '3', 
          title: 'Coastal Cup', 
          date: '2025-08-05', 
          location: 'Swakopmund Sports Complex', 
          category: 'Tournament',
          registrationDeadline: '2025-07-20',
          description: 'A regional tournament for teams from the coastal areas of Namibia.',
          registrationFee: 'N$400'
        },
        { 
          id: '4', 
          title: 'Coaching Workshop', 
          date: '2025-09-12', 
          location: 'Namibia Sports Commission', 
          category: 'Workshop',
          registrationDeadline: '2025-08-30',
          description: 'A workshop for coaches to improve their coaching skills and learn new techniques.',
          registrationFee: 'N$200'
        },
        { 
          id: '5', 
          title: 'Schools Championship', 
          date: '2025-10-01', 
          location: 'Windhoek High School', 
          category: 'Tournament',
          registrationDeadline: '2025-09-15',
          description: 'A tournament for school teams from across Namibia.',
          registrationFee: 'N$350'
        },
      ];
      await storeData(STORAGE_KEYS.EVENTS, sampleEvents);
    }
    
    // Initialize users with default admin account if none exist
    const users = await getUsers();
    if (users.length === 0) {
      const defaultAdmin = {
        id: generateId(),
        username: 'admin123',
        password: '12345', // In a real app, this should be hashed
        isAdmin: true,
        email: 'admin@hockeyapp.com',
        createdAt: new Date().toISOString()
      };
      await storeData(STORAGE_KEYS.USERS, [defaultAdmin]);
    }
    
    // Initialize announcements if none exist
    const announcements = await getAnnouncements();
    if (announcements.length === 0) {
      const welcomeAnnouncement = {
        id: generateId(),
        title: 'Welcome to Hockey App',
        content: 'This is the official app for managing hockey teams, players, and events.',
        createdBy: 'admin123',
        createdAt: new Date().toISOString(),
        important: true
      };
      await storeData(STORAGE_KEYS.ANNOUNCEMENTS, [welcomeAnnouncement]);
    }

    console.log('Async storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
