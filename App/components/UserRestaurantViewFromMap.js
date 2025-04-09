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

const UserRestaurantViewFromMap = ({ route }) => {
    const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const { restaurant } = route.params;
  const { session, favoritedDeals, setFavoritedDeals, restaurantData, setRestaurantData, dealsData, setDealsData } = useContext(SessionContext);
  const navigation = useNavigation();

const associatedDeals = dealsData.filter(deal => deal.email === restaurant.email);


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
        const url = `https://www.google.com/maps/dir/${lat},${lon}/${restaurant.location}`;
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

  const handleReportRestaurant = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      MailComposer.composeAsync({
        recipients: [supportEmail],
        subject: `Report a Restaurant - ${restaurant.restaurant_name} `,
        body: `Hello, \n\nI'd like to report a restaurant with the following information:\n\n Name: "${restaurant.restaurant_name}"\n Location: ${restaurant.location}\n Email: ${restaurant.email} \n Phone: ${restaurant.phone_number}\n\n Please add your comments here: \n\n\nThank you.`,
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

  const relatedDeal = dealsData.find(deal => deal.email === restaurant.email);
  const randomDealImage = relatedDeal ? relatedDeal.imagePath : null;


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
        <Text style={styles.restaurantName}>{restaurant.restaurant_name}</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: associatedDeals.length > 0 ? associatedDeals[0].imagePath : '' }} style={styles.restaurantImage} />
        </View>
        <TouchableOpacity style={styles.directionButton} onPress={openMapsForDirections}>
          <View style={styles.buttonContent}>
            <Text style={styles.address}>{formatLocation(restaurant.location)}</Text>
            <Image source={require('../assets/Icons/DirectionsIconView2.png')} style={styles.directionIcon} />
          </View>
        </TouchableOpacity>
        <View style={styles.infoContainer}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.infoText}>{restaurant.phone_number}</Text>
        </View>

            {restaurant.description && (
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.infoText}>{restaurant.description}</Text>
            </View>
            )}

            {restaurant.businessHours && <View style={styles.infoContainerB}>
                <Text style={styles.label}>Business Hours</Text>
                {daysOrder.map(day => {
                    if (restaurant.businessHours && restaurant.businessHours[day]) {
                    return (
                        <View key={day} style={styles.businessHourRow}>
                        <Text style={styles.dayText}>{day}</Text>
                        <Text style={styles.timeText}>{restaurant.businessHours[day].openTime} - {restaurant.businessHours[day].closeTime}</Text>
                        </View>
                    );
                    }
                    return null;
                })}
                </View>

                                }

            {restaurant.email && (
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.infoText}>{restaurant.email}</Text>
            </View>
            )}

        <View style={styles.reportButtonContainer}>
          <TouchableOpacity onPress={handleReportRestaurant} style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report Restaurant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {
        associatedDeals.length > 0 && (
          <View style={styles.moreDealsContainer}>
            <Text style={styles.moreDealsText}>Deals from {restaurant.restaurant_name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {associatedDeals.map((deal, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('DealView', { deal: deal })}
                  style={styles.touchableArea}
                >
                  <View style={styles.similarDealContainer}>
                    <Image source={{ uri: deal.imagePath }} style={styles.similarDealImage} />
                    <Text style={styles.similarDealTitle}>{deal.dealTitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      }
    </View>
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
      borderColor: 'white',
      borderBottomWidth: 5,
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
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0', 
        marginVertical: 10,     
        marginHorizontal: 5,     
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

export default UserRestaurantViewFromMap;