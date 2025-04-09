import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { SessionContext } from '../SessionContext';
import { signOut } from '@firebase/auth';


const windowHeight = Dimensions.get('window').height; 
const topPadding = windowHeight * 0.1; 

const version = require('../assets/tags.json');
const companyLogo = require('../assets/company-logo-green.png');

const NavMenuRestaurant = ({ closeModal, handleNavigation }) => {

  const { session, setSession, favoritedDeals, setFavoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData } = useContext(SessionContext);
  const handleLogout = () => {

    signOut(auth)
      .then(() => {
        handleNavigation('LoginScreen');
        closeModal();
        setSession(null);
      }).catch((error) => {
        Alert.alert("Error", "There was a problem logging you out");
      });
  };

  return (
    <View style={styles.container}>
      <Image source={companyLogo} style={{ width: 100, height: 100, position: 'absolute', left: '40%', marginLeft: -25, bottom: 25, top: 50 }} />



      <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
        <Ionicons name="close" size={32} color="black" />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('RestaurantView');
            }}
          >
            <Text style={styles.navText}>My Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('AnalyticsScreen');
            }}
          >
            <Text style={styles.navText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('RestaurantProfile');
            }}
          >
            <Text style={styles.navText}>My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              closeModal();
              handleNavigation('SupportScreen');
            }}
            activeOpacity={0.7} 
          >
            <Text style={styles.version}>Support ~ {version.version}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    paddingTop: topPadding,
    shadowColor: 'black', 
    shadowOffset: { width: -3, height: 0 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 3.84, 
    elevation: 5, 
    borderLeftWidth: 2,
    borderLeftColor: '#333333',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2, 
    height: '100%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    top: '-2.5%',
  },
  navItem: {
    padding: 4,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginTop: 5,
  },

  navText: {
    fontSize: 22,
    color: '#333333',
    fontWeight: 'bold'

  },

  version: {
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  logoutButton: {
    padding: 4,
    backgroundColor: 'rgba(81, 150, 116, 1)',
    bottom: 0,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: '150%',
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold'
  },
  navContainer: {
    marginTop: '25%',
  }

});

export default NavMenuRestaurant;
