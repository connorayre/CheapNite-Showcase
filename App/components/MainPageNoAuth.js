import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Alert, StyleSheet, Modal, Button, Animated, Dimensions } from 'react-native';
import { SessionContext } from '../SessionContext';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '../firebase';
import { getImagePath } from '../utils';

import Header from './Header';
import SearchBar from './SearchBar';
import DealListNoAuth from './DealListNoAuth';
import HorizontalScroll from './HorizontalScroll';
import NavMenuNoAuth from './NavMenuNoAuth';
import QuoteBar from './QuoteBar';


const foodDealIcon = require('../assets/Food-Deals-Button.png'); //https://icons8.com/icon/8379/noodles
const drinkDealIcon = require('../assets/Drink-Deals-Button.png');// https://icons8.com/icon/h6GwlkPg3VI7/martini-glass
const eventsIcon = require('../assets/Event-Button.png'); //https://icons8.com/icon/BRNetXc4rflv/event-tent
const selectedFoodDealIcon = require('../assets/Selected-Food-Deals-Button.png'); //https://icons8.com/icon/8379/noodles
const selectedDrinkDealIcon = require('../assets/Selected-Drink-Deals-Button.png'); // https://icons8.com/icon/h6GwlkPg3VI7/martini-glass
const selectedEventsDealIcon = require('../assets/Select-Event-Button.png'); //https://icons8.com/icon/BRNetXc4rflv/event-tent 


const MainPageNoAuth = ({ navigation }) => {
  const { favoritedDeals, dealsData, setDealsData, restaurantData, setRestaurantData } = useContext(SessionContext);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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

      const restaurantQuery = query(collection(db, 'restaurants'), where('verified', '==', true));
      const restaurantSnapshot = await getDocs(restaurantQuery);
      const restaurantEmails = restaurantSnapshot.docs.map(doc => doc.id); 

      const allVerifiedRestaurants = restaurantSnapshot.docs.map(doc => {
        return {
          email: doc.id, 
          ...doc.data() 
        };
      });

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

      newDeals.sort((a, b) =>
        (b.liveToday ? 1 : 0) - (a.liveToday ? 1 : 0) ||

        (a.liveToday && b.liveToday ? (b.recurringDeal ? 1 : 0) - (a.recurringDeal ? 1 : 0) : 0) ||

        (b.liveSoon ? 1 : 0) - (a.liveSoon ? 1 : 0)
      );




      setDealsData(newDeals);
      setRefreshing(false);
    } catch (error) {
      Alert.alert("Error", "There was a problem loading your deals!\n\n Please try again")
      setRefreshing(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalPosition, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false
    }).start();
  };

  const closeModal = () => {
    Animated.spring(modalPosition, {
      toValue: Dimensions.get('window').width, 
      duration: 500,
      useNativeDriver: false 
    }).start(() => {
      setModalVisible(false); 
    });
  };
  const onRefresh = () => {
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
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const filteredDeals = [];

  const seenDeals = new Set();

  dealsData.forEach(deal => {
    const matchesSearch = (
      deal.dealTitle.toLowerCase().includes(lowerCaseSearchTerm) ||
      deal.restName.toLowerCase().includes(lowerCaseSearchTerm) ||
      (deal.tags && deal.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
    );

    const matchesDay = (
      daysOfWeek.includes(lowerCaseSearchTerm) && deal.recurrenceDays && deal.recurrenceDays[capitalize(lowerCaseSearchTerm)]
    );

    if (matchesSearch || matchesDay) {
      if (!seenDeals.has(deal.id)) { 
        seenDeals.add(deal.id);
        filteredDeals.push(deal);
      }
    }
  });


  const filteredDealsByType = filteredDeals.filter(deal =>
    selectedTypes.length ? (deal.dealTypes && selectedTypes.some(type => deal.dealTypes.includes(type))) : true
  );


  const filteredDealsByTag = selectedTag === "For You"
    ? getRecommendations()
    : filteredDealsByType.filter(deal =>
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
            height: Dimensions.get('window').height,// 3,
            width: '75%',
            backgroundColor: 'white',
            position: 'absolute', top: 0, right: 0,

          }}>
            <NavMenuNoAuth closeModal={closeModal} handleNavigation={handleNavigation} navigation={navigation} />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <QuoteBar />
      <SearchBar onSearch={onSearch} />

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


      <DealListNoAuth
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

export default MainPageNoAuth;
