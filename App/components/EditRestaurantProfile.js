import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import cfg from '../cfg/cfg'; 
import { useNavigation } from '@react-navigation/native';

import Header from './Header';
import EditableRow from './EditableRow';
import { SessionContext } from '../SessionContext';

const placeholderImage = 'https://via.placeholder.com/150';

const EditRestaurantProfile = () => {
  const { session } = useContext(SessionContext);
  const { userData } = session || {};
  const [restaurantName, setRestaurantName] = useState(userData.restaurant_name || '');
  const [phoneNumber, setPhoneNumber] = useState(userData.phone_number || '');
  const [description, setDescription] = useState(userData.description || '');
  const [location, setLocation] = useState(userData.location || '');
  const [image, setImage] = useState(userData.profileImageUrl || '');
  const [businessHours, setBusinessHours] = useState(userData.businessHours || '');
  const [isAutoCompleteFocused, setIsAutoCompleteFocused] = useState(false);
  const navigation = useNavigation();
  console.log(userData)

  useEffect(() => {
    setRestaurantName(userData.restaurant_name || '');
    setPhoneNumber(userData.phone_number || '');
    setDescription(userData.description || '');
    setLocation(userData.location || '');
    setImage(userData.profileImageUrl || '');
    setBusinessHours(userData.businessHours || '')
  }, [userData]);
  

  const summarizeBusinessHours = () => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    const sortedDays = dayOrder.filter(day => Object.keys(businessHours).includes(day));

    if (!sortedDays.length) return "Not Set";

    let summary = sortedDays.map(day => {
        const { openTime, closeTime } = businessHours[day];
        if (openTime === "CLOSED" || closeTime === "CLOSED") {
            return `${day}: Closed`;
        } else {
            return `${day}: ${openTime} - ${closeTime}`;
        }
    });
    return summary.join("\n");
};

  const navigateToPhotoEditScreen = () => {
    navigation.navigate('ProfilePhotoEdit');
  };

  const navigateToEditScreen = (field, currentValue) => {
    if (field === 'Business Hours') {
      navigation.navigate('EditBusinessHours', { businessHours: userData.businessHours });
    } else {
      navigation.navigate('DetailEditScreen', { field, currentValue, restaurantId: userData.email });
    }
  };

  return (
    <>
    <Header />
    <ScrollView style={styles.scrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps='always'>
        
        <View style={styles.formContainer}>
          <Text style={styles.header}>Edit Restaurant Profile</Text>

          <TouchableOpacity style={styles.profilePicContainer} onPress={navigateToPhotoEditScreen}>
            <Image
              source={{ uri: image || placeholderImage }}
              style={styles.profilePic}
            />
            <Text style={styles.editPhotoText}>Edit Photo</Text>
          </TouchableOpacity>

          <EditableRow 
            label="Restaurant Name" 
            value={restaurantName} 
            onPress={() => navigateToEditScreen('Restaurant Name', restaurantName)} 
          />

          <EditableRow 
            label="Location" 
            value={location} 
            onPress={() => navigateToEditScreen('Location', location)} 
          />

          <EditableRow 
            label="Phone Number" 
            value={phoneNumber} 
            onPress={() => navigateToEditScreen('Phone Number', phoneNumber)} 
          />

          <EditableRow 
            label="Description" 
            value={description} 
            onPress={() => navigateToEditScreen('Description', description)} 
          />

          <EditableRow 
            label="Business Hours" 
            value={summarizeBusinessHours()} 
            onPress={() => navigateToEditScreen('Business Hours', businessHours)} 
          />

        </View>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    color: '#333',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f7f7f7',
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  ACCont: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
  },
  ACinput: {
    backgroundColor: '#f7f7f7',
    fontSize: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "rgb(81,150, 116)",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profilePicContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: '100%',
    height: 200,
    borderRadius: 75,
    opacity: 0.8,
  },
  editPhotoText: {
    position: 'absolute',
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
});

export default EditRestaurantProfile;
