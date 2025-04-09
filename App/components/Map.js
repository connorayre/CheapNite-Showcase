import React, { useContext } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps'; 
import { SessionContext } from '../SessionContext';
import { View, Button, Image, Text, StyleSheet } from 'react-native';
import Header from './Header';

const userLocationIcon = require('../assets/User-Location-Icon.png');
const pinPoint = require('../assets/Icons/icons8-location-50.png');

const Map = ({ navigation }) => {
  const { session, restaurantData, userLocation } = useContext(SessionContext);
  const SOME_DEFAULT_LATITUDE = 45.4236;
  const SOME_DEFAULT_LONGITUDE = 75.7009;
  const restaurants = restaurantData;

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('UserRestaurantViewFromMap', { restaurant });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: userLocation?.latitude || SOME_DEFAULT_LATITUDE,
          longitude: userLocation?.longitude || SOME_DEFAULT_LONGITUDE,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        zoomEnabled={true}
        zoomTapEnabled={true}
      >
        {/* Render user's location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          >
            {/* Custom image for user's location */}
            <Image source={userLocationIcon} style={{ height: 30, width: 30 }} />
          </Marker>
        )}

        {restaurants.map((restaurant, index) => {
          const { coords } = restaurant;
          if (!coords) return null;
          return (
            <Marker
              key={index}
              image={pinPoint}
              coordinate={{
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
            >
              <Callout tooltip onPress={() => handleRestaurantPress(restaurant)}>
                <View style={styles.calloutOuterContainer}>
                  <View style={styles.calloutInnerContainer}>
                    <Text style={styles.calloutTitle}>{restaurant.restaurant_name}</Text>
                    <View style={styles.calloutDescriptionContainer} >
                      <Text style={styles.calloutDescription}>{restaurant.description}</Text>
                    </View>
                    <View style={styles.moreDetailsContainer}>
                      <Text style={styles.moreDetails}>Learn More →</Text>
                    </View>
                  </View>
                </View>
              </Callout>

            </Marker>
          );
        })}
      </MapView>
    </View >
  );
};

const styles = StyleSheet.create({
  calloutOuterContainer: {
    backgroundColor: 'rgba(65,65,65,1)',
    borderRadius: 10,
    padding: 5,
  },
  calloutInnerContainer: {
    backgroundColor: 'rgba(65,65,65,1)',
    borderRadius: 8,
    paddingHorizontal: 5,
    lineHeight: 25,
    alignItems: 'center',
    width: 200, 
  },
  calloutTitle: {
    color: 'white',
    fontWeight: 'bold',

    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(65,65,65,1)',
    padding: 5,
    borderColor: 'rgb(81,150,116)',
    borderBottomWidth: 2,
  },
  calloutDescriptionContainer: {
    backgroundColor: 'rgba(65,65,65,1)',
    borderTopColor: 'white',
    borderTopWidth: 1,
    paddingVertical: 5,
  },
  calloutDescription: {
    color: 'lightgrey',
    backgroundColor: 'rgba(65,65,65,1)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 10,

  },
  moreDetails: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    fontSize: 16,
    padding: 7.5,
    alignContent: 'center'
  },
  moreDetailsContainer: {

    backgroundColor: 'rgb(81,150,116)',


    borderRadius: 10,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
    borderColor: 'white',
    width: 125,
    alignContent: 'center'
  },
});



export default Map;