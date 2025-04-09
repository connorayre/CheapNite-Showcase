import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { auth, db } from '../firebase';
import { Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { doc, deleteDoc } from "@firebase/firestore";
import { getStorage, ref, deleteObject } from "@firebase/storage";
import * as amplitude from '@amplitude/analytics-react-native';

const cfg = require('./../cfg/cfg');

const RestaurantDealList = ({ userData, navigation, deals, onRefresh, refreshing }) => {
  const handleAddDealPress = () => {
    navigation.navigate('AddDeal');
    amplitude.logEvent('Create Deal - Deal Builder', { restaurantName: userData.restaurant_name });
  };

  const renderRightAction = (deal) => {
    return (
      <TouchableOpacity
        onPress={() => onDelete(deal.id, deal.image)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const onDelete = (dealId, imageUrl) => {
    Alert.alert(
      "Delete Deal",
      "Are you sure you want to delete this deal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const imageName = getImageNameFromUrl(imageUrl);
              await deleteImage(imageName);
              await deleteDeal(dealId);
              Alert.alert("Success", `Your deal is gone forever`);
              onRefresh();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };


  const deleteDeal = async (dealId) => {
    try {
      const dealRef = doc(db, 'restaurant_deals', dealId); 
      await deleteDoc(dealRef);
    } catch (error) {
    }
  };

  const deleteImage = async (imageName) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageName);
      await deleteObject(imageRef);
    } catch (error) {
    }
  };

  const getImageNameFromUrl = (url) => {
    const partsWithoutQuery = url.split("?")[0];
    const pathParts = partsWithoutQuery.split("/");
    return decodeURIComponent(pathParts[pathParts.length - 1]);
  };


  const renderItem = ({ item: deal }) => {
    return (
      <View style={styles.dealContainer}>
        <Swipeable
          style={styles.swipeContainer}
          renderRightActions={() => renderRightAction(deal)}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('RestaurantDealView', { deal })}
            style={styles.touchableArea}
          >
            <Image
              source={{ uri: (deal.imagePath + "?" + Math.random().toString(36)) }}
              style={styles.dealImage}
            />
          </TouchableOpacity>
          <Text style={styles.dealTitle}>{deal.dealTitle}</Text>
        </Swipeable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleAddDealPress}>
        <Text style={styles.addButtonText}>Add Deal</Text>
      </TouchableOpacity>
      <FlatList
        data={deals}
        renderItem={renderItem}
        keyExtractor={(deal) => deal.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='rgb(81,150, 116)' />
        }
      />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
    width: '100%',
        paddingBottom: 10,

  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#333333',
    width: '100%',
        paddingBottom: 10,
  },
  dealContainer: {
    paddingBottom: 15,
    paddingTop: 7.5,
    borderColor: '#e0e0e0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '100%',
  },
  touchableArea: {
    //width: '100%',
  },
  dealImage: {
    width: '100%',
    height: 200,
  },
  restaurantNameContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#333333',
    padding: 5,
    borderRadius: 5,
    },
  restaurantName: {
    color: '#333333',
  },
  dealTitleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: '#333333',
    padding: 5,
    width: '100%',
  },
  dealTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    paddingTop: 10,
  },
  addButton: {
    backgroundColor: "rgb(81,150, 116)",
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 20,
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'rgb(204, 41, 54)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    height: 200,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeContainer: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: 'white',
  },

});

export default RestaurantDealList;
