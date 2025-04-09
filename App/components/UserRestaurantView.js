import React, { useContext, useState } from 'react';
import { View, Image, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SessionContext } from '../SessionContext';
import Header from './Header';
import * as MailComposer from 'expo-mail-composer';
import { useNavigation } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';

import Geolocation from '@react-native-community/geolocation';

const assets = require('../assets/tags.json');
const supportEmail = assets.supportEmail;
const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const UserRestaurantView = ({ route }) => {
  const { deal } = route.params;
  const { session, favoritedDeals, setFavoritedDeals, restaurantData, setRestaurantData, dealsData, setDealsData, } = useContext(SessionContext);
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
  const openMapsForDirections = async () => {
    const permissionStatus = await requestLocationPermission();
  
    console.log("permission status is: " + permissionStatus)
    if (permissionStatus === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/${lat},${lon}/${deal.location}`;
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

  const handleReportDeal = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      MailComposer.composeAsync({
        recipients: [supportEmail],
        subject: `Report a Restaurant - ${deal.restName} `,
        body: `Hello, \n\nI'd like to report a restaurant with the following information:\n\n Title: "${deal.dealTitle}"\n Location: ${deal.location}\n Email: ${deal.email} \n Phone: ${selectedRestaurant.phone_number}\n\n Please add your comments here: \n\n\nThank you.`,
      });
    } else {
      Alert.alert(
        "Email is not available on this device.",
        "Please send a report email to: " + supportEmail,
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: false }
      );
    }
  };

  const getRandomTags = (deals) => {
    let allTags = [].concat(...deals.map(deal => deal.tags));

    let uniqueTags = [...new Set(allTags)];

    let shuffledTags = uniqueTags.sort(() => 0.5 - Math.random());

    return shuffledTags.slice(0, 5);
  }

  const selectedRestaurant = restaurantData.find(restaurant => restaurant.restaurant_name === deal.restName);
  const selectedRestaurantDeals = dealsData.filter(d => d.restName === selectedRestaurant.restaurant_name && d.id !== deal.id);
  const randomTags = getRandomTags(selectedRestaurantDeals);

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
      <Header />
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.restaurantName}>{deal.restName}</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: deal.imagePath }} style={styles.restaurantImage} />
        </View>


        <TouchableOpacity style={styles.directionButton} onPress={openMapsForDirections}>
          <View style={styles.buttonContent}>
            <Text style={styles.address}>{formatLocation(deal.location)}</Text>
            <Image source={require('../assets/Icons/DirectionsIconView2.png')} style={styles.directionIcon} />
          </View>
        </TouchableOpacity>
        <View style={styles.infoContainer}>

          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.infoText}>{selectedRestaurant.phone_number}</Text>

        </View>

        {selectedRestaurant.description && (
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.infoText}>{selectedRestaurant.description}</Text>
            </View>
            )}

        {selectedRestaurant.businessHours && <View style={styles.infoContainerB}>
                <Text style={styles.label}>Business Hours</Text>
                {daysOrder.map(day => {
                    if (selectedRestaurant.businessHours && selectedRestaurant.businessHours[day]) {
                    return (
                        <View key={day} style={styles.businessHourRow}>
                        <Text style={styles.dayText}>{day}</Text>
                        <Text style={styles.timeText}>{selectedRestaurant.businessHours[day].openTime} - {selectedRestaurant.businessHours[day].closeTime}</Text>
                        </View>
                    );
                    }
                    return null;
                })}
                </View>}

        <View style={styles.infoContainer}>
          <View style={styles.tagsContainer}>

            <Text style={styles.label}>Tags</Text>

            <View style={styles.tagsList}>
              {randomTags.map((tag, index) => (
                <React.Fragment key={index}>
                  <Text style={styles.tag}>{tag}</Text>
                  {index !== randomTags.length - 1 && <Text style={styles.tagSeparator}></Text>}
                </React.Fragment>
              ))}
            </View>
          </View>

        </View >
        <View style={styles.reportButtonContainer}>
          <TouchableOpacity onPress={handleReportDeal} style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report Restaurant</Text>
          </TouchableOpacity>
        </View>

      </ScrollView >

      {
        selectedRestaurantDeals.length > 0 && (
          <View style={styles.moreDealsContainer}>
            <Text style={styles.moreDealsText}>Deals from {selectedRestaurant.restaurant_name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {selectedRestaurantDeals.map((restDeal, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('DealView', { deal: restDeal })}
                  style={styles.touchableArea}
                >
                  <View style={styles.similarDealContainer}>
                    <Image source={{ uri: restDeal.imagePath }} style={styles.similarDealImage} />
                    <Text style={styles.similarDealTitle}>{restDeal.dealTitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      }
    </View >
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200, 
    overflow: 'hidden',
  },

  imageWrapper: {
    padding: 5,
    backgroundColor: '#333333',
  },

  restaurantImage: {
    width: '100%',
    height: 200,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'left',
    marginBottom: 4,
  },

  directionButton: {
    marginTop: 8,
    backgroundColor: 'rgba(81, 150, 116, 1)',
    margin: 3,
    borderRadius: 5,
    padding: 5,
    borderColor: 'white',
    borderWidth: 1,
  },

  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  address: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  directionIcon: {
    width: 40,
    height: 40,
    marginVertical: 5,
    marginLeft: 5,
  },

  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 15,
  },

  phoneNumber: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  }, moreDealsContainer: {
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#333333',
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  similarDealContainer: {
    width: 200,
    marginRight: 2.5,
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
    padding: 5,
    backgroundColor: 'rgba(65,65,65,1)',
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 10,
  },
  similarDealImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    margin: 10,
  }
  ,
  similarDealTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    lineHeight: 25,
    flexWrap: 'wrap',
    flex: 1,
  },
  moreDealsText: {
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,

  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    marginBottom: 10
  },

  overlayText: {
    color: 'white',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(65,65,65,1)',
    margin: 3,
    borderRadius: 5,
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  label: {
    fontSize: 16,
    color: 'lightgrey',
    textAlign: 'left',
    padding: 5, 
    marginBottom: 4,
  },


  infoText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,

    paddingHorizontal: 20,
    lineHeight: 25,
  },
  tagsContainer: {
    flexWrap: 'wrap', 
    marginTop: 10,
    alignItems: 'left',
  },

  tag: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    lineHeight: 25,
  },
  tagSeparator: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5, 
  },
  reportButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  reportButton: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'rgb(220,103,108)',
    padding: 10,
    paddingHorizontal: 20,
  },

  reportButtonText: {
    color: 'white',
    fontSize: 16,
  },
      infoContainerB: {
        padding: 15,
        marginVertical: 10,

        borderRadius: 5,
        backgroundColor: 'rgba(65,65,65,1)'
      },
      businessHourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
      },
      dayText: {
        fontSize: 16,
        color: '#fff'
      },
      timeText: {
        fontSize: 16,
        color: '#fff'
      }
});

export default UserRestaurantView;
