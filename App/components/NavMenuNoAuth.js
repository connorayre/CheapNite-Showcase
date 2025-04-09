import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { SessionContext } from '../SessionContext';
import { signOut } from '@firebase/auth';
import { useNavigation } from '@react-navigation/native';





const windowHeight = Dimensions.get('window').height;
const topPadding = windowHeight * 0.1;


const version = require('../assets/tags.json');
const companyLogo = require('../assets/company-logo-green.png');

const NavMenuNoAuth = ({ closeModal, handleNavigation, navigation }) => {
  const { session, setSession, favoritedDeals, setFavoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData } = useContext(SessionContext);

  const handleAlert = () => {
    closeModal();
    Alert.alert(
      "Sign in required",
      "You need to be signed in to use this feature. Do you want to sign in now?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled"),
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: () => navigation.navigate('LoginScreen'), 
        },
      ],
      { cancelable: false }
    );
  }




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
              handleNavigation('MainPageNoAuth');
            }}
          >
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleAlert();
            }}
          >
            <Text style={styles.navText}>My Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              closeModal();
              handleAlert();
            }}
          >
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              closeModal();
              handleNavigation('LoginScreen');
            }}
          >
            <Text style={styles.logoutText}>Login or Signup</Text>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => {
              closeModal();
              handleNavigation('SupportScreenNoAuth');
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
    top: '-2.5%'
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

export default NavMenuNoAuth;
