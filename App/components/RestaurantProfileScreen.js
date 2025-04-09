import { View, Button, Image, Text, TouchableOpacity, Switch, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import { signOut, sendPasswordResetEmail } from '@firebase/auth';
import React, { useContext, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { SessionContext } from '../SessionContext';
import { auth, db } from '../firebase';
import * as MailComposer from 'expo-mail-composer';
import { GoogleSignin } from "@react-native-google-signin/google-signin";


import BottomBar from './BottomBar';
import BottomBarRestaurant from './BottomBarRestaurant';
import NavMenu from './NavMenu';
import NavMenuRestaurant from './NavMenuRestaurant';
import Header from './Header';

const assets = require('../assets/tags.json');
const companyLogo = require('../assets/company-logo.png');
const supportEmail = assets.supportEmail;

const RestaurantProfileScreen = ({ navigation }) => {
    
  const { session, setSession } = useContext(SessionContext);
  const { userData } = session || {};
  const [isRadiusEnabled, setRadiusEnabled] = useState(false);
  const [isNotificationEnabled, setNotificationEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Error signing out from Google:', error);
        }
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'LoginScreen' },
        ],
      })
    );
    setSession(null);
};


  const handleSupportNavigation = () => {
    navigation.navigate('SupportScreen');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditRestaurantProfile');
  };

  const handleTerms = () => {
    navigation.navigate('TNANoButton');
  };

  const handleRequestVerification = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      MailComposer.composeAsync({
        recipients: [supportEmail],
        subject: 'Request for Restaurant Verification',
        body: `Hello, \n\nI'd like to request verification for my restaurant associated with the email: ${userData.email}. \n\nThank you. \n\n ${userData.phone_number}`,
      });
    } else {
      Alert.alert(
        "Email is not available on this device.",
        "Please send a verification request email to: " + supportEmail,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')}
        ],
        { cancelable: false }
      );
    }
  };

  const handlePasswordReset = () => {

    sendPasswordResetEmail(auth, userData.email)
      .then(() => {
        Alert.alert(
          "Password reset email sent!",
          'Please check your junk folder. \n\n If you are having any problems please email support at: '+ supportEmail,
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')}
          ],
          { cancelable: false }
        );
        handleLogout();
      })
      .catch((error) => {
        alert('Error sending password reset email.');
      });
  };

  const handleNavigation = (screenName) => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300); // delay in ms
  }

  return (
    <View style={{ flex: 1 }}>
      <Header openMenu={() => setModalVisible(true)} />
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
      >
        {userData.type == "1" ? <NavMenuRestaurant setModalVisible={setModalVisible} handleNavigation={handleNavigation} /> : <NavMenu setModalVisible={setModalVisible} handleNavigation={handleNavigation} />}
      </Modal>

      <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.supportButton} onPress={handleSupportNavigation}>
            <View style={styles.centeredContainer}>
                <View style={styles.questionMarkContainer}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
                <Text style={styles.supportButtonText}>Support</Text>
            </View>
            </TouchableOpacity>

            {1 && (
              <TouchableOpacity style={styles.supportButton} onPress={handleEditProfile}>
                <View style={styles.centeredContainer}>
                    <View style={styles.editIconContainer}>
                      <Text style={styles.editIcon}>+</Text>
                    </View>
                    <Text style={styles.supportButtonText}>Edit Profile</Text>
                </View>
        
              </TouchableOpacity>
            )}

      </View>


      <ScrollView style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text>Email:</Text>
          <Text>{userData.email}</Text>
        </View>
        {userData.phone_number && (
        <View style={styles.infoRow}>
          <Text>Phone:</Text>
          <Text>{userData.phone_number}</Text>
        </View>
              )}
        
          <View style={styles.infoRow}>
            <Text>Verified:</Text>
            <Text>{userData.verified ? "True" : "False"}</Text>
          </View>
 

        <TouchableOpacity style={styles.actionRow} onPress={handleTerms}>
          <Text style={styles.infoTermText}>Terms & Agreements</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.actionRow} onPress={handlePasswordReset}>
          <Text style={styles.infoTermText}>Reset Password</Text>
        </TouchableOpacity>

        {!userData.verified && (
        <TouchableOpacity style={styles.actionRow} onPress={handleRequestVerification}>
          <Text style={styles.actionText}>Request Verification</Text>
        </TouchableOpacity>
      )}
        <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
          <Text style={styles.actionText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <Text style={styles.version}>{assets.version}</Text>
    </View >
  );
};

const styles = StyleSheet.create({

  logo: {
    width: 120,
    height: 90,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    width: 140,
    height: 140, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "rgb(81,150, 116)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  questionMarkContainer: {
    backgroundColor: 'transparent',
    borderColor: 'rgb(81,150, 116)',
    borderWidth: 1,
    borderRadius: 25, 
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  questionMark: {
    color: 'rgb(81,150, 116)',
    fontSize: 20
  },
  supportButtonText: {
    marginTop: 10, 
    color: 'rgb(81,150, 116)',
    fontWeight: 'bold',
    fontSize: 16, 
  },
  infoContainer: {
    flex: 1,
    padding: 10, 
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    borderTopWidth: 0,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    borderTopWidth: 0,
  },
  actionText: {
    color: '#333333',
  },
  infoTermText: {
    color:"rgb(81,150, 116)",
  },
  version:{
    color:"rgb(81,150, 116)",
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
},
editIconContainer: {
  backgroundColor: 'transparent',
  borderColor: 'rgb(81,150, 116)',
  borderWidth: 1,
  borderRadius: 25, 
  width: 50,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
},
editIcon: {
  color: 'rgb(81,150, 116)',
    fontSize: 20
},
buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 10,
  },


});

export default RestaurantProfileScreen;
