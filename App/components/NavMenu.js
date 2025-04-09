import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { SessionContext } from '../SessionContext';
import { signOut } from '@firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as amplitude from '@amplitude/analytics-react-native';





const windowHeight = Dimensions.get('window').height; 
const topPadding = windowHeight * 0.1;


const version = require('../assets/tags.json');
const companyLogo = require('../assets/company-logo-green.png');

const NavMenu = ({ closeModal, handleNavigation, navigation }) => {
  const { session, setSession, favoritedDeals, setFavoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData } = useContext(SessionContext);



  const handleLogout = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.warn("No user is currently signed in.");
      return;
    }

    const isGoogleSignIn = currentUser.providerData.some(
      (provider) => provider.providerId === 'google.com'
    );

    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "There was a problem signing you out from Firebase");
      return;
    }

    if (isGoogleSignIn) {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error('Error signing out from Google:', error);
      }
    }
    closeModal();
    navigation.navigate('LoginScreen');
    setSession(null);
  };





  return (
    <View style={styles.container}>
      <Image source={companyLogo} style={{ width: 100, height: 100, position: 'absolute', left: '40%', marginLeft: -25, bottom: 25, top: 50 }} />
      <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
        <Ionicons name="close" size={32} color="white" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('MainPage');
              amplitude.logEvent('Home Navigation');
            }}
          >
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('MyDeals');
              amplitude.logEvent('View My Deals Navigation');
            }}
          >
            <Text style={styles.navText}>My Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleNavigation('Profile');
              amplitude.logEvent('View My Profile Navigation');
            }}
          >
            <Text style={styles.navText}>Profile</Text>
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
            activeOpacity={0.7}  // to give a subtle touch feedback
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
    backgroundColor: '#333333',
    padding: 10,
    paddingTop: topPadding,
    shadowColor: 'black', 
    shadowOffset: { width: -3, height: 0 }, 
    shadowOpacity: 0.5,
    shadowRadius: 3.84, 
    elevation: 5,
    borderWidth: 2, 
    borderColor: 'rgba(0, 0, 0, 0.1)', 
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
    color: 'lightgrey',
    fontWeight: 'bold'

  },

  version: {
    color: 'white',
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




export default NavMenu;
