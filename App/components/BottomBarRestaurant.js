// BottomBar.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomBarRestaurant = () => {
  const navigation = useNavigation();

  const handleMyDealsPress = () => {
    navigation.navigate('RestaurantView');
  };

  const handleAnalyticsPress = () => {
    navigation.navigate('AnalyticsScreen');
  };

  const handleMyAccountPress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 25, backgroundColor: "rgb(81,150, 116)" }}>
      <TouchableOpacity onPress={handleMyDealsPress}>
        <Text style={{ color: 'white' }}>My Deals</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleAnalyticsPress}>
        <Text style={{ color: 'white' }}>Analytics</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleMyAccountPress}>
        <Text style={{ color: 'white' }}>My Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomBarRestaurant;
