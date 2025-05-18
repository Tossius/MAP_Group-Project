import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser } from '../utils/storage';

// Create the authentication context
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Get user from storage
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setUserToken(userData.id);
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Auth context value
  const authContext = {
    isLoading,
    user,
    userToken,
    signIn: async (userData) => {
      setUser(userData);
      setUserToken(userData.id);
    },
    signOut: async () => {
      try {
        await logoutUser();
        setUser(null);
        setUserToken(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    signUp: async (userData) => {
      // This would be implemented with your registration logic
      setUser(userData);
      setUserToken(userData.id);
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
