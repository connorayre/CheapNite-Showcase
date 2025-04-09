import React, { useContext, useState } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../SessionContext';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { db } from '../firebase';
import { setStatusBarBackgroundColor } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import * as amplitude from '@amplitude/analytics-react-native';

import liveIcon from '../assets/Icons/Live-Deal.png';
import liveSoon from '../assets/Icons/Coming-Soon-Green.png';
import heartFilledImage from '../assets/heart-filled.png';
import heartImage from '../assets/heart.png';


const DealList = ({ dealsData, onRefresh, refreshing }) => {

  const { session, favoritedDeals, setFavoritedDeals, restaurantData, setRestaurantData } = useContext(SessionContext);
  const { userData } = session || {};
  const navigation = useNavigation();

  const requestLocationPermission = async () => {
    const permissionType = Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const currentPermission = await check(permissionType);

    if (currentPermission === RESULTS.GRANTED) {
      return RESULTS.GRANTED;
    } else if (currentPermission === RESULTS.DENIED) {
      const result = await request(permissionType);
      return result;
    } else {
      return currentPermission;
    }
  };



  const openMapsForDirections = async (deal) => {
    const permissionStatus = await requestLocationPermission();

    console.log("permission status is: " + permissionStatus)
    if (permissionStatus === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/${lat},${lon}/${deal.location}`;

          // Track the "Get Directions" event before opening the URL
          amplitude.logEvent('Get Directions', { destination: deal.location });

          Linking.openURL(url);
        },
        error => {
          console.error("Geolocation Error:", error);
          Alert.alert(
            "Error",
            "Unable to fetch your current location. Please try again.",
            [{ text: 'OK' }],
            { cancelable: false }
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else if (permissionStatus === RESULTS.DENIED) {
      Alert.alert(
        "Location Access Denied",
        "CheapNite requires access to your location to provide directions. Please enable it in your device settings.",
        [
          { text: 'Cancel', onPress: () => console.log('Cancelled') },
          { text: 'Settings', onPress: () => Linking.openSettings() } 
        ],
        { cancelable: false }
      );
    }
  };

  const handlePress = async (deal) => {
    try {
      const userFavoritesRef = doc(db, 'user_favorites', userData.email);
      const userFavoritesDoc = await getDoc(userFavoritesRef);

      let newFavoritedDeals;

      if (userFavoritesDoc.exists()) {
        newFavoritedDeals = userFavoritesDoc.data().favoritedDeals || [];
        if (newFavoritedDeals.includes(deal.id)) {
          newFavoritedDeals = newFavoritedDeals.filter(id => id !== deal.id);
        } else {
          newFavoritedDeals.push(deal.id);
        }
      } else {
        newFavoritedDeals = [deal.id];
      }

      await setDoc(userFavoritesRef, { favoritedDeals: newFavoritedDeals }, { merge: true });

      setFavoritedDeals([...newFavoritedDeals]);

      amplitude.logEvent('Favourited Deal', {
        dealTitle: deal.dealTitle,
        restName: deal.restName,
      });
    } catch (error) {
      Alert.alert("Error", "There seems to be a problem favouriting the deal")
    }
  };

  const handleRestaurantPress = (deal) => {
    navigation.navigate('UserRestaurantView', { deal });
    amplitude.logEvent('View Restaurant', { restName: deal.restName });
  };

  const renderItem = ({ item: deal }) => {
    const isFavorited = favoritedDeals ? favoritedDeals.includes(deal.id) : false;

    let overlayText = '';

    if (!deal.liveToday && !deal.liveSoon) {
      overlayText = 'Currently Unavailable';
    } else if (deal.liveSoon) {
      overlayText = 'Coming Soon!';
    }

    function formatLocation(location) {
      const parts = location.split(',');
  
      if (parts.length < 2) {
   
        return location;
      }
    
      const street = parts[0].trim();
      const city = parts[1].trim();
    
      return `${street}, ${city}`;
    }

    return (
      <View style={styles.container}>

        <TouchableOpacity
          onPress={() => {
            amplitude.logEvent('View Deal', {
              dealTitle: deal.dealTitle,
              restName: deal.restName,
            });
            navigation.navigate('DealView', { deal })
          }}
          style={styles.touchableArea}
        >
          <Image
            source={{ uri: deal.imagePath }}
            style={styles.dealImage}
          />
          {overlayText && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{overlayText}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => handleRestaurantPress(deal)} style={styles.restaurantNameContainer}>

            <Text style={styles.restaurantName}>
              {deal.restName}
              {deal.distanceFromUser ? ` - ${deal.distanceFromUser.toFixed(1)}KM away` : ''}
            </Text>

          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handlePress(deal)}
          >
            <Image
              source={isFavorited ? heartFilledImage : heartImage}
              style={styles.heartImage}
            />
          </TouchableOpacity>

        </TouchableOpacity>
        <Text style={styles.dealTitle}>{deal.dealTitle}</Text>
        <Text style={styles.restAddress}>{formatLocation(deal.location)}</Text>
        <TouchableOpacity style={styles.directionButton} onPress={() => openMapsForDirections(deal)}>
          <View style={styles.buttonContent}>
            <Image source={require('../assets/Icons/getDirections.png')} style={styles.directionIcon} />

          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={dealsData}
      renderItem={renderItem}
      keyExtractor={(deal) => deal.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='white' />
      }
    />

  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
    borderColor: 'lightgrey',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    width: '100%',
  },
  dealContainer: {
    backgroundColor: 'rgba(65,65,65,1)',
  },
  touchableArea: {
    borderRadius: 10,
    marginTop: 5,
  },
  dealImage: {
    width: '100%',
    height: 200,
  },
  directionIcon: {
    height: 40,
    width: 120,
    bottom: 2.5,
    right: 75,
    borderRadius: 5,
  },
  restaurantNameContainer: {
    position: 'absolute',
    top: 10,
    left: 5,
    backgroundColor: 'rgb(81,150, 116)',
    padding: 8, 
    borderRadius: 5,
  },
  restaurantName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dealTitleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 5,
    marginHorizontal: 10,

  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    marginLeft: 10,
    marginTop: 12,
    marginRight: 125,
  },
  restAddress: {
    marginLeft: 10,
    fontSize: 14,
    color: 'lightgrey',
    marginTop: 5,
    fontWeight: 'bold',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,

  },
  heartImage: {
    width: '100%',
    height: '100%',
  },
  liveIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 60, 
    height: 20,
  },
  liveSoonIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
  },
  buttonContent: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    width: 10,
    height: 10
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 18,

  },
});


export default DealList;