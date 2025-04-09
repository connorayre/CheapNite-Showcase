import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "@firebase/storage";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from '../firebase';
import Header from './Header';
import { SessionContext } from '../SessionContext';
import { updateCacheIfNeeded } from '../utils';

import liveIcon from '../assets/Icons/Live-Deal.png';
import heartFilledImage from '../assets/heart-filled.png';

const EditDealPhoto = ({ route }) => {
  const { dealId, currentImage } = route.params; 
  const { session, setSession, restaurantDeals, setRestaurantDeals } = useContext(SessionContext);
  const { userData } = session || {};
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const deal = restaurantDeals.find(d => d.id === dealId);
  
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });

    if (result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0]; 
        const splitURI = imageAsset.uri.split('.');
        const fileType = splitURI[splitURI.length - 1];
  
        if (!imageAsset.cancelled && (fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg')) {
          setImage(imageAsset.uri);
        } else {
          alert('Please select a PNG or JPEG file');
        }
      }
  };

//--------------------------------------------------------------------------------------------------------------------------------------

function formatLocation(location) {
    const parts = location.split(',');

    if (parts.length < 2) {
      return location;
    }
  
    const street = parts[0].trim();
    const city = parts[1].trim();
  
    return `${street}, ${city}`;
  }

const updateDealPhotoInContext = async (dealId, downloadURL) => {
    const newImagePath = await updateCacheIfNeeded(downloadURL, `${dealId}.jpeg`);
    console.log(newImagePath)
    const updatedDeals = restaurantDeals.map( deal => {
      if (deal.id === dealId) {
        
        return { ...deal, image: downloadURL, imagePath: newImagePath };
      }
      return deal; 
    });
  
    setRestaurantDeals(updatedDeals); 
  };

const uploadImage = async () => {
    if (!image) {
      Alert.alert('Upload Error', 'No image selected.');
      return;
    }
  
    try {
      const response = await fetch(image);
      const blob = await response.blob();
  
      let imageName;
      if (deal.image) {
        const urlSegments = deal.image.split('/');
        const decodedString = decodeURIComponent(urlSegments[urlSegments.length - 1]);
        imageName = decodedString.split('?')[0];
        imageName = imageName.substring(7); 
        console.log(imageName)
      } else {
        const uuid = uuidv4();
        imageName = `${userData.email}_${uuid}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      }
  
      const storage = getStorage();
      const storageReference = storageRef(storage, `images/${imageName}`);
      const uploadTask = uploadBytesResumable(storageReference, blob);
  
      uploadTask.on('state_changed', 
        (snapshot) => {

        }, 
        (error) => {
          console.error("Error uploading image: ", error);
          Alert.alert('Upload Error', error.message);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
          
          const dealRef = doc(db, "restaurant_deals", deal.id);
          await updateDoc(dealRef, {
            image: downloadURL, 
            imageName: imageName, 
          });
          updateDealPhotoInContext(dealId, downloadURL);
          Alert.alert('Upload Successful', 'Deal photo updated successfully.');
          navigation.goBack(); 
          navigation.goBack(); 
        }
      );
    } catch (error) {
      console.error("Error fetching image blob: ", error);
      Alert.alert('Upload Error', 'An error occurred while uploading the image.');
    }
  };
  

  return (

        <View style={styles.container}>
            <Header />
            <Text style={styles.header}>Tap the photo to choose</Text>
            <TouchableOpacity style={styles.group} onPress={pickImage}>
                <View style={styles.imagePickerButton}>
                </View>
                <View style={styles.dealContainer}>

                <View
                style={styles.touchableArea}
                >
                <Image
                    source={{ uri: (image ? image : (currentImage + "?" + Math.random().toString(36))) }}
                    style={styles.dealImage}
                />
                <View style={styles.restaurantNameContainer}>
        
                <Text style={styles.restaurantName}>
                    {userData.restaurant_name}
                    {' - 1.0KM away'}
                </Text>
        
                </View>
                <View style={styles.dealTitleContainer}>
        
                    
                </View>
                <View
                    style={styles.heartButton}
                >
                    <Image
                    source={heartFilledImage}
                    style={styles.heartImage}
                    />
                </View>
        
                </View>
                <Text style={styles.dealTitle}>{ deal.dealTitle ? deal.dealTitle : "Deal Title"}</Text>
                <Text style={styles.restAddress}>{userData.location ? formatLocation(userData.location) : "123 Way"}</Text>
                <View style={styles.buttonContent}>
                    <Image source={require('../assets/Icons/getDirections.png')} style={styles.directionIcon} />
                </View>
            </View>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={uploadImage} style={styles.button}>
                    <Text style={styles.buttonText}>Save Image</Text>
                </TouchableOpacity>
            </View>
          </View>































  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    imageContainer: {
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5, // Only applies to Android
    },
    image: {
      width: 300, // Adjust based on your needs
      height: 200, // Adjust based on your needs
      borderRadius: 8,
      
      resizeMode: 'cover',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 10,
    },
    button: {
      backgroundColor: 'rgb(81,150, 116)', // Your app's theme color
      padding: 15,
      borderRadius: 8,
      marginHorizontal: 10, // Space between buttons
      minWidth: 100, // Ensure buttons have a consistent width
    },
    cancelButton: {
      backgroundColor: '#fff', // White background for the cancel button
      borderWidth: 2,
      borderColor: 'rgb(81,150, 116)', // Border color matching the save button's background
    },
    buttonText: {
      color: '#fff', // White text for the save button
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButtonText: {
      color: 'rgb(81,150, 116)', // Text color for the cancel button matches the save button's background
      fontWeight: 'bold',
      textAlign: 'center',
    },
    dealContainer: {
        backgroundColor: 'rgba(65,65,65,1)',
      },
      touchableArea: {
        borderRadius: 10,
        marginTop: 5,
      },
      dealImage: {
        width: '100%',
        height: 200,
      },
      directionIcon: {
        height: 40,
        width: 120,
        bottom: 2.5,
        right: 75,
        //borderColor: 'rgba(81, 150, 116, 1)',
        //borderWidth: 1,
        borderRadius: 5,
        //opacity: '50%'
      },
      restaurantNameContainer: {
        position: 'absolute',
        top: 10,
        left: 5,
        backgroundColor: 'rgb(81,150, 116)',
        padding: 5,
        borderRadius: 5,
      },
      restaurantName: {
        color: 'white',
        fontWeight: 'bold'
      },
      dealTitleContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        //backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 5,
        marginHorizontal: 10,
      
      },
      dealTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'left',
        marginLeft: 10,
        marginTop: 12,
      },
      restAddress: {
        marginLeft: 10,
        fontSize: 14,
        color: 'lightgrey',
        marginTop: 5,
        fontWeight: 'bold',
      },
      heartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
      },
      heartImage: {
        width: '100%',
        height: '100%',
      },
      liveIcon: {
        position: 'absolute',
        right: 5, // adjust this value accordingly
        bottom: 5,
        width: 60, // adjust the width and height as per the icon's dimensions
        height: 20,
      },
      buttonContent: {
        position: 'absolute',
        bottom: 40,
        right: 40,
        width: 10,
        height: 10
      },
      group: {
        marginTop: 15
      },
      header: {
        fontSize: 22,
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
      },
        
  });
  

export default EditDealPhoto;
