import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "@firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { SessionContext } from '../SessionContext';
import { getApps, initializeApp } from "@firebase/app";
import { collection, addDoc, doc, updateDoc } from "@firebase/firestore";
import { auth, db } from '../firebase';


import Header from './Header';

const companyLogo = require('../assets/company-logo-white.png');

const ProfilePhotoEdit = () => {
  const { session, setSession } = useContext(SessionContext);
  const { userData } = session || {};
  const [image, setImage] = useState(null);
  const navigation = useNavigation(); 
  const [displayImage, setDisplayImage] = useState(userData.profileImageUrl || null)

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();

    Alert.alert("Info", "Tap the image to choose");

  }, []);

  useEffect(() => {
    setDisplayImage(userData.profileImageUrl || null);

  }, [userData]);

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
          setDisplayImage(imageAsset.uri || null);
        } else {
          alert('Please select a PNG or JPEG file');
        }
      }
  };

  const uploadImage = async () => {
    if(!image){
        Alert.alert('Upload Error', 'No image selected.');
        return;
    }
    try {
        const response = await fetch(image);
        const blob = await response.blob();

        let imageName;
        if (userData.profileImageName) {
        imageName = userData.profileImageName;
        } else {
        const uuid = uuidv4();
        imageName = `profile_${userData.restaurant_name}_${uuid}.jpg`;
        userData.profileImageName = imageName;
        }
    
        const storage = getStorage();
        const storageReference = storageRef(storage, `profile_images/${imageName}`);
        const uploadTask = uploadBytesResumable(storageReference, blob);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
            }, 
            (error) => {
                Alert.alert('Upload Error', error.message);
            }, 
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadURL);
                const updatedUserData = { ...userData };
                updatedUserData.profileImageUrl = downloadURL;
                setSession({ ...session, userData: updatedUserData });
                

                const userDocRef = doc(db, "restaurants", userData.email); 
                await updateDoc(userDocRef, {
                profileImageUrl: downloadURL,
                profileImageName: imageName, 
                });

                Alert.alert('Upload Successful', 'Profile picture updated successfully.');
                navigation.goBack();
            }
            );
        } catch (error) {
            console.error("Error uploading image: ", error);
            Alert.alert('Upload Error', 'An error occurred while uploading the image.');
        }
        };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={pickImage} style={image ? styles.imageContainer : styles.placeholderContainer}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.image} />
          ) : (
            <Image source={companyLogo} style={styles.logo} />
          )}
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={goBack} style={[styles.button, styles.cancelButton]}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={uploadImage} style={styles.button}>
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 10, 
    },
    button: {
      backgroundColor: 'rgb(81,150, 116)',
      padding: 10,
      borderRadius: 5,
      marginVertical: 10,
      flex: 1,
      marginHorizontal: 5, 
      alignItems: 'center',
      minWidth: 100,
    },
    cancelButton: {
      backgroundColor: '#fff', 
      borderColor: 'rgb(81,150, 116)',
      borderWidth: 2,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    cancelButtonText: {
      color: 'rgb(81,150, 116)', 
    },
    imageContainer: {
      width: '100%',
      height: 200,
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    placeholderContainer: {
      width: '100%',
      height: 200,
      backgroundColor: 'lightgrey',
      borderColor: 'grey',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
  });
  
  export default ProfilePhotoEdit;