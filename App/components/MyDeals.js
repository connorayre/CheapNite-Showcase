import React, { useContext, useEffect, useState } from 'react';
import { View, Modal, Button, Text, Alert } from 'react-native';
import { SessionContext } from '../SessionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs, query, where, doc, getDoc } from '@firebase/firestore';
import { auth, db } from '../firebase';

import Header from './Header';
import SearchBar from './SearchBar';
import DealList from './DealList';
import BottomBar from './BottomBar';
import NavMenu from './NavMenu';
import QuoteBar from './QuoteBar';

const MyDeals = ({ navigation, route }) => {
  const { session, favoritedDeals, setFavoritedDeals, dealsData, setDealsData } = useContext(SessionContext);
  const { userData } = session || {};
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  let favoritedDealsData = [];

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const userFavoritesRef = doc(db, 'user_favorites', userData.email);
      const userFavoritesDoc = await getDoc(userFavoritesRef);

      if (userFavoritesDoc.exists()) {
        setFavoritedDeals(userFavoritesDoc.data().favoritedDeals);
      }
    } catch (error) {
      Alert.alert("Error", "Sorry we had trouble getting your favourite deals, Please try again");
    }
  };

  const onRefresh = () => {
    loadFavorites();
    favoritedDealsData = dealsData.filter(deal => favoritedDeals.includes(deal.id));
  };

  favoritedDealsData = dealsData.filter(deal => favoritedDeals.includes(deal.id));

  const onSearch = (text) => {
    setSearchTerm(text);
  };

  const handleNavigation = (screenName) => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300); // delay in ms
  }

  const filteredDeals = favoritedDealsData.filter(deal =>
    deal.dealTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#333333" }}>
      {/* Header */}
      <Header openMenu={() => setModalVisible(true)} />
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
      >
        <NavMenu setModalVisible={setModalVisible} handleNavigation={handleNavigation} />
      </Modal>
      <QuoteBar />
      {/* Search Bar */}
      <SearchBar onSearch={onSearch} />

      {/* Deal List */}
      <DealList
        dealsData={filteredDeals}
        onRefresh={onRefresh}
        refreshing={refreshing}

      />
    </View>
  );
};

export default MyDeals;
