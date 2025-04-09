import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, Alert, Platform, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { check, PERMISSIONS, RESULTS, request, openSettings } from 'react-native-permissions';
import { SessionContext } from '../SessionContext';
import * as amplitude from '@amplitude/analytics-react-native';

const companyLogo = require('../assets/company-logo-white.png');
const mapIcon = require('../assets/Map-Icon.png');

const Header = ({ openMenu }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;
  const { session } = useContext(SessionContext);
  const { userData } = session || {};
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const shouldShowBackButton =
    currentScreen === 'DealView' ||
    currentScreen === 'SupportScreen' ||
    currentScreen === 'SupportScreenNoAuth' ||
    currentScreen === 'RestaurantDealView' ||
    currentScreen === 'AddDeal' ||
    currentScreen === 'MyDeals' ||
    currentScreen === 'AnalyticsScreen' ||
    currentScreen === 'ForgotPassword' ||
    currentScreen === 'PrivacyScreen' ||
    currentScreen === 'UserRestaurantView' ||
    currentScreen === 'UserRestaurantViewFromMap' ||
    currentScreen === 'TNA' ||
    currentScreen === 'Map' ||
    currentScreen === 'TNANoButton' ||
    currentScreen === 'EditRestaurantProfile' ||
    currentScreen === 'DetailEditScreen' ||
    currentScreen === 'ProfilePhotoEdit' ||
    currentScreen === 'EditBusinessHours' ||
    currentScreen === 'EditDealPhoto' ||
    currentScreen === 'RestaurantProfile' ||
    currentScreen === 'Profile';


  const handleMapNavigation = async () => {
    let permissionType;

    if (Platform.OS === 'ios') {
      permissionType = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permissionType = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    } else {
      console.warn('Unsupported platform');
      return;
    }

    const result = await check(permissionType);

    if (result === RESULTS.GRANTED) {
      amplitude.logEvent('Map Navigation');
      navigation.navigate('Map');
    } else if (result === RESULTS.DENIED) {
      const newResult = await request(permissionType);
      if (newResult !== RESULTS.GRANTED) {
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
      } else {
        amplitude.logEvent('Map Navigation');
        navigation.navigate('Map');
      }
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
  };

  return (
    <View style={styles.headerContainer}>
      {shouldShowBackButton ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      ) : null}
      
      {/* For user type 0, show the map icon on the left if no back button is shown */}
      {userData?.type === 0 && !shouldShowBackButton && (
        <TouchableOpacity onPress={handleMapNavigation} style={styles.iconLeft}>
          <Image source={mapIcon} style={styles.iconImage} />
        </TouchableOpacity>


      )}

      {/* For user type 1, ensure the menu icon is always on the right */}
      {userData?.type === 1 && (
        <View style={styles.flexGrow}>
          {/* Spacer View to push the menu to the right */}
        </View>
      )}

      <Image source={companyLogo} style={styles.companyLogo} />

      {/* For user type 0, show the menu icon on the right if back button is shown */}
      {userData?.type !== 1 && !shouldShowBackButton && (
        <TouchableOpacity onPress={openMenu} style={styles.menuIconRight}>
          <MaterialCommunityIcons name="menu" size={36} color="white" />
        </TouchableOpacity>
      )}

      {/* For user type 1, the menu icon placement */}
      {userData?.type === 1 && !shouldShowBackButton && (
        <TouchableOpacity onPress={openMenu} style={styles.menuIconRight}>
          <MaterialCommunityIcons name="menu" size={36} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    height: 125,
    backgroundColor: "rgb(81,150, 116)",
  },
  backButton: {
    paddingTop: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 32,
  },
  iconLeft: {
    paddingTop: 25,
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  companyLogo: {
    width: 75,
    height: 70,
    position: 'absolute',
    left: '50%',
    marginLeft: -37.5,
    bottom: 0,
  },
  menuIconRight: {
    marginLeft: 'auto',
    paddingTop: 25,
  },
  flexGrow: {
    flexGrow: 1,
  },
});

export default Header;
