import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Alert, StyleSheet, Modal, Button, Animated, Dimensions } from 'react-native';
import { SessionContext } from '../SessionContext';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { getDoc, doc, setDoc } from '@firebase/firestore';
import { auth, db } from '../firebase';
import { getImagePath } from '../utils';
import Geolocation from '@react-native-community/geolocation';
import { PERMISSIONS, request, openSettings, RESULTS, check } from 'react-native-permissions';
import { Platform } from 'react-native';



import Header from './Header';
import SearchBar from './SearchBar';
import DealList from './DealList';
import BottomBar from './BottomBar';
import HorizontalScroll from './HorizontalScroll';
import NavMenu from './NavMenu';
import QuoteBar from './QuoteBar';
import FilterDeal from './FilterDeal';
import Map from './Map';


const cfg = require('./../cfg/cfg');

const foodDealIcon = require('../assets/Food-Deals-Button.png'); //https://icons8.com/icon/8379/noodles
const drinkDealIcon = require('../assets/Drink-Deals-Button.png');// https://icons8.com/icon/h6GwlkPg3VI7/martini-glass
const eventsIcon = require('../assets/Event-Button.png'); //https://icons8.com/icon/BRNetXc4rflv/event-tent
const selectedFoodDealIcon = require('../assets/Selected-Food-Deals-Button.png'); //https://icons8.com/icon/8379/noodles
const selectedDrinkDealIcon = require('../assets/Selected-Drink-Deals-Button.png'); // https://icons8.com/icon/h6GwlkPg3VI7/martini-glass
const selectedEventsDealIcon = require('../assets/Select-Event-Button.png'); //https://icons8.com/icon/BRNetXc4rflv/event-tent 

const MainPage = ({ navigation }) => {
  const { session, favoritedDeals, setFavoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData, userLocation, setUserLocation } = useContext(SessionContext);
  const { userData } = session || {};

  //const [dealsData, setDealsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;

  const modalPosition = useRef(new Animated.Value(Dimensions.get('window').width)).current;


useEffect(() => {
        loadDeals(); 
}, []);

               
  const daysMap = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };


  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
  };


const requestLocationPermission = async () => {
  let permissionType;

  if (Platform.OS === 'ios') {
    permissionType = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  } else if (Platform.OS === 'android') {
    permissionType = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  } else {
    console.warn('Unsupported platform');
    return;
  }

  try {
    const result = await request(permissionType);

    if (result === RESULTS.GRANTED) {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } else if (result === RESULTS.DENIED) {
      Alert.alert(
        "Permission Denied", 
        "Permission to access location was denied. Do you want to enable it in settings?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          { 
            text: "Settings", 
            onPress: () => openSettings().catch(() => console.warn('Cannot open settings'))
          },
        ],
        { cancelable: false }
      );
    } else if (result === RESULTS.BLOCKED) {
      Alert.alert(
        "Permission Blocked", 
        "Permission to access location was blocked. Please enable it in your device settings.",
        [
          {
            text: "OK",
            style: "cancel",
          },
          { 
            text: "Settings", 
            onPress: () => openSettings().catch(() => console.warn('Cannot open settings'))
          },
        ],
        { cancelable: false }
      );
    }

  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Unable to request location permission.");
  }
};



const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1)); 
  };


  const willBeLiveSoon = (deal) => {
    const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;
    const startDate = new Date(deal.startDate);
    const currentDate = new Date();
    const twoDaysLater = new Date(currentDate.getTime() + twoDaysInMilliseconds);

    const isWithinNextTwoDays = (date) => {
      return (date - currentDate <= twoDaysInMilliseconds) && (date > currentDate);
    };

    if (!deal.recurringDeal) {
      return isWithinNextTwoDays(startDate);
    }


    if (startDate > currentDate) {
      return isWithinNextTwoDays(startDate);
    }


    switch (deal.recurrencePattern) {
      case "Weekly":
        for (let day in deal.recurrenceDays) {
          if (deal.recurrenceDays[day]) {
            let nextDate = new Date();
            while (nextDate.getUTCDay() !== daysMap[day]) {
              nextDate.setDate(nextDate.getDate() + 1);
            }
            if (nextDate < startDate) continue;

            if (isWithinNextTwoDays(nextDate)) return true;
          }
        }
        return false;


      case "Biweekly":
        const daysDiff = Math.floor((twoDaysLater - startDate) / (24 * 60 * 60 * 1000));
        if (daysDiff % 14 < 7) {
          for (let day in deal.recurrenceDays) {
            if (deal.recurrenceDays[day]) {
              let nextDate = new Date(currentDate);
              while (nextDate.getUTCDay() !== daysMap[day]) {
                nextDate.setDate(nextDate.getDate() + 1);
              }
              if (isWithinNextTwoDays(nextDate)) return true;
            }
          }
        }
        return false;

      case "Monthly":
        const weeksDiff = Math.floor((twoDaysLater - startDate) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff % 4 === 0) {
          for (let day in deal.recurrenceDays) {
            if (deal.recurrenceDays[day]) {
              let nextDate = new Date(currentDate);
              while (nextDate.getUTCDay() !== daysMap[day]) {
                nextDate.setDate(nextDate.getDate() + 1);
              }
              if (isWithinNextTwoDays(nextDate)) return true;
            }
          }
        }
        return false;

      default:
        return false;
    }
  };


  const getRecommendations = () => {
    const actualFavoritedDeals = dealsData.filter(deal => favoritedDeals.includes(deal.id));
    const tagsFromFavorited = actualFavoritedDeals.flatMap(deal => deal.tags || []);
    const restaurantsFromFavorited = actualFavoritedDeals.map(deal => deal.restName);

    const matchingDeals = dealsData.filter(
      deal => !favoritedDeals.includes(deal.id) && (
        (deal.tags && tagsFromFavorited.some(tag => deal.tags.includes(tag))) ||
        restaurantsFromFavorited.includes(deal.restName)
      )
    );

    const shuffled = matchingDeals.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const sortedSelected = selected.sort((a, b) => {
      if (a.liveToday && !b.liveToday) return -1;
      if (b.liveToday && !a.liveToday) return 1;
      if (a.liveSoon && !b.liveSoon) return -1;
      if (b.liveSoon && !a.liveSoon) return 1;
      return 0;
    });

    return selected;
  }

  
const loadDeals = async () => {
  try {
    setRefreshing(true);

    const locationPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const permissionResult = await request(locationPermission);

    let fetchedUserLocation = null;

    if (permissionResult === RESULTS.GRANTED) {
      await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            fetchedUserLocation = position.coords;
            resolve();
          },
          error => {
            reject(error);
          }
        );
      });
    }

    const restaurantQuery = query(collection(db, 'restaurants'), where('verified', '==', true));
    const restaurantSnapshot = await getDocs(restaurantQuery);
    const restaurantEmails = restaurantSnapshot.docs.map(doc => doc.id);

    const allVerifiedRestaurants = restaurantSnapshot.docs.map(doc => {
      return {
        email: doc.id,
        ...doc.data()
      };
    });

    const restaurantLookup = {};

    if (fetchedUserLocation) {
      for (let rest of allVerifiedRestaurants) {
        let lat, lon;

        if (rest.coords) {
          lat = rest.coords.latitude;
          lon = rest.coords.longitude;
        } else {
          continue;
        }

        rest.distanceFromUser = calculateDistance(fetchedUserLocation.latitude, fetchedUserLocation.longitude, lat, lon);
        restaurantLookup[rest.email] = rest;
      }
    }

    setRestaurantData(allVerifiedRestaurants);

    let newDeals = [];

    const currentDateFormatted = new Date().toISOString().split('T')[0];

    for (let email of restaurantEmails) {
      const dealQuery = query(
        collection(db, 'restaurant_deals'),
        where('email', '==', email),
        where('endDate', '>=', currentDateFormatted)
      );

      const dealSnapshot = await getDocs(dealQuery);

      const dealData = dealSnapshot.docs.map(async doc => {
        const deal = doc.data();
        deal.imagePath = await getImagePath(deal.image, `${doc.id}.jpeg`);
        
        if (fetchedUserLocation && restaurantLookup[deal.email]) {
          deal.distanceFromUser = restaurantLookup[deal.email].distanceFromUser;
        }

        return { ...deal, id: doc.id };
      });

      newDeals = [...newDeals, ...(await Promise.all(dealData))];
    }

    const currentDate = new Date();
    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate);

      const tagDealStatus = (deal) => {
        const startDate = new Date(deal.startDate);
        const endDate = new Date(deal.endDate);
        let isLive = false;
        if (deal.recurringDeal) {
          if (currentDate < startDate) { 
            isLive = false;
          } else {
            switch (deal.recurrencePattern) {
              case "Weekly":
                isLive = deal.recurrenceDays[currentDay];
                break;
              case "Biweekly":
                const daysDiff = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
                isLive = (daysDiff % 14 < 7) && deal.recurrenceDays[currentDay];
                break;
              case "Monthly":
                const weeksDiff = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
                isLive = (weeksDiff % 4 === 0) && deal.recurrenceDays[currentDay];
                break;
              default:
                break;
            }
          }
        } else {
          isLive = currentDate >= startDate && currentDate <= endDate;
        }

        deal.liveToday = isLive; 
        deal.liveSoon = !isLive && willBeLiveSoon(deal);
      };


      for (let deal of newDeals) {
        tagDealStatus(deal);
      }

      if (fetchedUserLocation && userData) {
        console.log("Sort 1")
        newDeals.sort((a, b) => {
            // 1. Prioritize liveToday deals
            if (a.liveToday !== b.liveToday) return a.liveToday ? -1 : 1;
    
            // 2. Within liveToday deals, prioritize recurring deals
            if (a.liveToday && b.liveToday && a.recurringDeal !== b.recurringDeal) {
                return a.recurringDeal ? -1 : 1;
            }
    
            // 3. Then prioritize liveSoon deals
            if (a.liveSoon !== b.liveSoon) return a.liveSoon ? -1 : 1;
    
            // 4. Finally, sort by distance within each of those categories
            return a.distanceFromUser - b.distanceFromUser;
        });
    }
    
    
    else {
      console.log("Sort 1")
        newDeals.sort((a, b) => 
          // Prioritize liveToday deals over the rest
          (b.liveToday ? 1 : 0) - (a.liveToday ? 1 : 0) ||

          // Within liveToday deals, prioritize recurring deals over the rest
          (a.liveToday && b.liveToday ? (b.recurringDeal ? 1 : 0) - (a.recurringDeal ? 1 : 0) : 0) ||

          // Then prioritize liveSoon deals over the rest
          (b.liveSoon ? 1 : 0) - (a.liveSoon ? 1 : 0)
        );

      }
  

      
      setDealsData(newDeals);
      setUserLocation(fetchedUserLocation)
      setRefreshing(false);
    } catch (error) {
      Alert.alert("Error", "There was a problem loading your deals!\n\n Please try again")
      setRefreshing(false);
      console.log(error)
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalPosition, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };


  const closeModal = () => {
    Animated.timing(modalPosition, {
      toValue: Dimensions.get('window').width,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const openFilterModal = async () => {
    const permissionType = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  
    const result = await check(permissionType);
  
    if (result === RESULTS.GRANTED) {
      setFilterModalVisible(true);
    } else if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
      Alert.alert(
        "Permission Required", 
        "To access this feature, please grant location permission in settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          { 
            text: "Settings", 
            onPress: () => openSettings().catch(() => console.warn('Cannot open settings'))
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Permission Problem",
        "There was a problem checking for location permissions.",
        [{ text: "OK", style: "cancel" }],
        { cancelable: false }
      );
    }
  };

  
  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const onRefresh = () => {
    loadDeals();
  };

  const calculateAge = (dob) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(dob.year);
    if (new Date(dob.month + ' ' + dob.day + ', ' + dob.year).getTime() > new Date().getTime()) {
      return age - 1;
    }
    return age;
  };

  const handleNavigation = (screenName) => {
    closeModal();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300); 
  }


  const handleTypeButtonPress = (type) => {
    setSelectedTag(null);
    setSelectedTypes(prevTypes => {
      if (prevTypes.includes(type)) {
        return prevTypes.filter(item => item !== type);
      } else {
        return [...prevTypes, type];
      }
    });

  };

  const onSearch = (text) => {
    setSearchTerm(text);
  };


  const filteredDeals = [];

  const seenDeals = new Set();

  dealsData.forEach(deal => {
    if (
      deal.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.restName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.tags && deal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    ) {
      if (!seenDeals.has(deal.id)) {
        seenDeals.add(deal.id);
        filteredDeals.push(deal);
      }
    }
  });

  const filteredDealsByType = filteredDeals.filter(deal =>
    selectedTypes.length ? (deal.dealTypes && selectedTypes.some(type => deal.dealTypes.includes(type))) : true
  );
  
  let visibleDeals;

  if (userData) {
      visibleDeals = userData.proximitySort 
          ? filteredDealsByType.filter(deal => deal.distanceFromUser <= userData.proximityValue)
          : filteredDealsByType;
  } else {
      visibleDeals = filteredDealsByType;
  }

  const filteredDealsByTag = selectedTag === "For You"
    ? getRecommendations()
    : visibleDeals.filter(deal =>
      selectedTag ? (deal.tags && deal.tags.includes(selectedTag)) : true
    );

  

  return (
    <View style={{ flex: 1, backgroundColor: "#333333" }}>
      <Header openMenu={() => openModal()} />
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={closeModal}
          activeOpacity={1}
        >
          <Animated.View style={{
            transform: [{ translateX: modalPosition }],
            height: Dimensions.get('window').height,
            width: '75%',
            backgroundColor: 'white',
            position: 'absolute', top: 0, right: 0,

          }}>
            <NavMenu closeModal={closeModal} handleNavigation={handleNavigation} navigation={navigation} />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <QuoteBar />
      <SearchBar onSearch={onSearch} onFilterPress={openFilterModal} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={closeFilterModal}
            activeOpacity={1}
          >
            <View style={{
              height: 2/3 * screenHeight, 
              backgroundColor: 'transparent', 
              position: 'absolute', bottom: 0, left: 0, right: 0,
            }}>
              <FilterDeal onClose={closeFilterModal} />
            </View>
          </TouchableOpacity>
        </Modal>


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, selectedTypes.includes('food') && styles.selectedType]} onPress={() => handleTypeButtonPress('food')}>
          <Image source={selectedTypes.includes('food') ? selectedFoodDealIcon : foodDealIcon} style={styles.buttonIcon} />
          <Text style={[
            styles.buttonText,
            selectedTypes.includes('food') && styles.selectedTypeText,
          ]}>Food Deals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, selectedTypes.includes('drink') && styles.selectedType]} onPress={() => handleTypeButtonPress('drink')}>
          <Image source={selectedTypes.includes('drink') ? selectedDrinkDealIcon : drinkDealIcon} style={styles.buttonIcon} />
          <Text style={[
            styles.buttonText,
            selectedTypes.includes('drink') && styles.selectedTypeText,
          ]}>Drink Deals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, selectedTypes.includes('event') && styles.selectedType]} onPress={() => handleTypeButtonPress('event')}>
          <Image source={selectedTypes.includes('event') ? selectedEventsDealIcon : eventsIcon} style={styles.buttonIcon} />
          <Text style={[
            styles.buttonText,
            selectedTypes.includes('event') && styles.selectedTypeText,
          ]}>Events</Text>
        </TouchableOpacity>

      </View>
      <HorizontalScroll selectedTypes={selectedTypes} setSelectedTag={setSelectedTag} />


      <DealList
        dealsData={filteredDealsByTag}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
    backgroundColor: '#333333',
  },
  button: {
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
    backgroundColor: '#333333',
    height: 100, 
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
  selectedTypeText: {
    color: "rgb(81,150, 116)",
  },
  buttonIcon: {
    width: 30, 
    height: 30, 
    marginBottom: 10,
  },
  selectedType: {
    borderColor: "rgb(81,150, 116)",

  },
});

export default MainPage;
