import React, { useContext, useState } from 'react';
import { SessionContext } from '../SessionContext';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { Linking, Platform } from 'react-native';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';
import * as amplitude from '@amplitude/analytics-react-native';
import Geolocation from '@react-native-community/geolocation';


import Header from './Header';



const assets = require('../assets/tags.json');
const supportEmail = assets.supportEmail;

const DealView = ({ route }) => {
  const { dealsData, setDealsData } = useContext(SessionContext);
  const { deal } = route.params;
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
          amplitude.logEvent('Get Directions from Deal', { destination: deal.location });

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
        subject: `Report a Deal - ${deal.dealTitle} `,
        body: `Hello, \n\nI'd like to report a deal with the following information:\n\n Title: "${deal.dealTitle}"\n Location: ${deal.location}\n Email: ${deal.email}\n\n Please add your comments here: \n\n\nThank you.`,
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


  const getRecurrenceDetails = () => {
    if (!deal.recurringDeal) return null;

    let prefix = '';
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    switch (deal.recurrencePattern) {
      case 'Weekly':
        prefix = 'Weekly Every ';
        break;
      case 'Biweekly':
        prefix = 'Biweekly Every ';
        break;
      case 'Monthly':
        prefix = 'Monthly Every ';
        break;
      default:
        return null;
    }

    const days = Object.keys(deal.recurrenceDays).filter(day => deal.recurrenceDays[day]);
    days.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));

    return (
      <Text style={styles.label}>
        {prefix}
        {days.map((day, index) => (
          <Text key={index} style={styles.labelValue}>
            {day}{index !== days.length - 1 ? ', ' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  const getSimilarDeals = (currentDeal, allDeals) => {

    const dealsWithoutCurrent = allDeals.filter(deal => deal.id !== currentDeal.id);

    const similarDeals = dealsWithoutCurrent.filter(deal =>
      deal.tags?.some(tag => currentDeal.tags.includes(tag)) ||
      deal.dealTypes === currentDeal.dealTypes ||
      deal.restName === currentDeal.restName
    );

    similarDeals.sort(() => Math.random() - 0.5);
    return similarDeals.slice(0, 5);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [similarDeals, setSimilarDeals] = useState(() => getSimilarDeals(deal, dealsData));

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

      <ScrollView>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{deal.dealTitle}</Text>
          <Text style={styles.subTitle}>{deal.restName}</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: deal.imagePath }} style={styles.dealImage} />

          </View>


          <TouchableOpacity style={styles.directionButton} onPress={openMapsForDirections}>
            <View style={styles.buttonContent}>
              <Text style={styles.address}>{formatLocation(deal.location)}</Text>
              <Image source={require('../assets/Icons/DirectionsIconView2.png')} style={styles.directionIcon} />
            </View>
          </TouchableOpacity>


          <View style={styles.labelContainer}>
            <Text style={styles.label}>Offer Valid</Text>
            <Text style={styles.labelValue}>{`${deal.startDate} - ${deal.endDate}`}</Text>
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.labelValue}>{deal.dealDescription}</Text>
          </View>

          {(deal.terms != " ") && (<View style={styles.labelContainer}>
            <Text style={styles.label}>Terms & Conditions</Text>
            <Text style={styles.labelValue}>{deal.terms}</Text>
          </View>)}
          {deal.recurringDeal && (<View style={styles.labelContainer}>
            <Text style={styles.label}>{getRecurrenceDetails()}</Text>
          </View>)}

        </View>


        <View style={styles.reportButtonContainer}>
          <TouchableOpacity onPress={handleReportDeal} style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report Deal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {

        <View style={styles.moreDealsContainer}>
          <Text style={styles.moreDealsText}>Similar Deals</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {similarDeals.map((similarDeal, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.push('DealView', { deal: similarDeal })}

                style={styles.touchableArea}
              >
                <View style={styles.similarDealContainer}>
                  <Image source={{ uri: similarDeal.imagePath }} style={styles.similarDealImage} />
                  <Text style={styles.similarDealTitle}>{similarDeal.dealTitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },

  subTitle: {
    color: 'lightgrey',
    marginBottom: 10,
    fontSize: 16
  },

  contentContainer: {
    flex: 1,
    padding: 16,
  },

  dealImage: {
    width: '100%',
    height: 200,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 2.5,
  },
  offerValid: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  dateRange: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  moreDealsContainer: {
    padding: 4, 
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
    marginLeft: 5,
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
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  labelContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(65,65,65,1)',
    margin: 3,
    borderRadius: 5,
    flexDirection: 'column', 
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
    height: 40,
    marginVertical: 5,
    marginLeft: 5,
  },


  label: {
    fontSize: 16,
    color: 'lightgrey',
    textAlign: 'left',
    padding: 5, 
    marginBottom: 4, 
  },



  labelValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    lineHeight: 25,
  }
  ,

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: 'rgba(81, 150, 116, 1)',
    padding: 8,
    marginBottom: 5,

    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  overlayImage: {
    width: 36,
    height: 36, 
    left: '400%',
  },
  reportButtonContainer: {
    alignItems: 'center',
    marginTop: 10, 
    marginBottom: 10, 
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
  directionsButton: {
    backgroundColor: 'rgb(81,150, 116)', 
    padding: 5,
    borderRadius: 4,
    marginTop: 5
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 12, 
  }

});

export default DealView;
