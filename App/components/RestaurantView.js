// RestaurantView.js
import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal, Animated, Dimensions } from 'react-native';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../SessionContext';
import { getImagePath } from '../utils';

import Header from './Header';
import RestaurantDealList from './RestaurantDealList';
import BottomBarRestaurant from './BottomBarRestaurant';
import NavMenuRestaurant from './NavMenuRestaurant';

const RestaurantView = ({ navigation }) => {
  const { session, setSession, restaurantDeals, setRestaurantDeals } = useContext(SessionContext);
  const { userData } = session || {};
  const [modalVisible, setModalVisible] = useState(false);
  const modalPosition = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  let userName = "Restaurant Owner";

  const fetchDeals = async () => {
    const q = query(collection(db, "restaurant_deals"), where("email", "==", userData.email));

    try {
      const querySnapshot = await getDocs(q);
      const dealsArray = await Promise.all(querySnapshot.docs.map(async doc => {
        const deal = doc.data();
        if (deal.image) {
          deal.imagePath = await getImagePath(deal.image, `${doc.id}.jpeg`);
        }
        return {
          ...deal,
          id: doc.id, 
        };
      }));
      setRestaurantDeals(dealsArray);
      setRefreshing(false);
    } catch (error) {
      Alert.alert("Error", "There seems to have been a problem with getting your deals. Please try again soon");
    }
  };

  useEffect(() => {
    setRestaurantDeals(restaurantDeals || '');
    
  }, [restaurantDeals]);



  useEffect(() => {
    fetchDeals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals();
  };

  if (userData) {
    userName = userData.restaurant_name;
  }


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


  const handleNavigation = (screenName) => {
    closeModal();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300);
  }

  return (
    <View style={{ flex: 1 }}>
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
            <NavMenuRestaurant closeModal={closeModal} handleNavigation={handleNavigation} />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <RestaurantDealList
        userData={userData}
        navigation={navigation}
        deals={restaurantDeals}
        onRefresh={onRefresh}
        refreshing={refreshing} />
    </View>
  );

};

export default RestaurantView;