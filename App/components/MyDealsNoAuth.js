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
import NavMenuNoAuth from './NavMenuNoAuth';
import QuoteBar from './QuoteBar';

const MyDealsNoAuth = ({ navigation, route }) => {
  const { noAuthFavoritedDeals, setNoAuthFavoritedDeals, dealsData, setDealsData } = useContext(SessionContext);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  let noAuthFavoritedDealsData = [];


  const onRefresh = () => {
    noAuthFavoritedDealsData = dealsData.filter(deal => noAuthFavoritedDeals.includes(deal.id));
  };

  noAuthFavoritedDealsData = dealsData.filter(deal => noAuthFavoritedDeals.includes(deal.id));

  const onSearch = (text) => {
    setSearchTerm(text);
  };

  const handleNavigation = (screenName) => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300); // delay in ms
  }



  const filteredDeals = noAuthFavoritedDealsData.filter(deal =>
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
        <NavMenuNoAuth setModalVisible={setModalVisible} handleNavigation={handleNavigation} />
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

export default MyDealsNoAuth;
