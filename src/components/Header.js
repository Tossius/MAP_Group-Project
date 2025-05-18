import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Colors from '../constants/colors';

const Header = ({ title, showLogo = true }) => {
  return (
    <View style={styles.header}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.primary,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;
