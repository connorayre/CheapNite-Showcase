import React, { useState, useContext } from 'react';
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { doc, updateDoc } from '@firebase/firestore';
import { db } from '../firebase'; 
import { SessionContext } from '../SessionContext';


import Header from './Header';
import cfg from '../cfg/cfg';

const DetailEditScreen = ({ route, navigation }) => {
  const { field, currentValue, restaurantId } = route.params;
  const [value, setValue] = useState(currentValue);
  const [key, setKey] = useState(Math.random().toString()); 
  const { setSession, session } = useContext(SessionContext);
  const { userData } = session || {};
  const [coords, setCoords] = useState('');

  const clearInput = () => {
    setValue(''); 
    setKey(Math.random().toString()); 
  };

 
    const validateRestaurantName = (restaurantName) => {
        if(restaurantName.length > 50){
        return false;
        }
        return true;
    };
    

    const validateLocation = (location) => {
      if(location.length > 255){
        return false;
      }
      return true;
    };

  
    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\d{10}$/; 
        return phoneRegex.test(phoneNumber);
    };

    const validateDescription = (desc) => {
        if(!desc || desc.length > 1000) {
          return false;
        }
        return true;
      };
      

const saveChanges = (fieldKey, newValue) => {
    const updatedUserData = { ...userData };
  
    if(fieldKey === 'restaurant_name') {
      updatedUserData.restaurant_name = newValue;
    } else if (fieldKey === 'location') {
      updatedUserData.location = newValue;
    } else if (fieldKey === 'phone_number') {
      updatedUserData.phone_number = newValue;
    } else if (fieldKey === 'description') {
      updatedUserData.description = newValue;
    }
  
   
    setSession({ ...session, userData: updatedUserData });
  };
  

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Error', `${field} cannot be empty.`);
      return;
    }

    if (!validateRestaurantName(value) && field === 'Restaurant Name') {
        Alert.alert('Invalid restaurant name', 'Restaurant name must be less than 50 characters');
        return;
      }
    
    if (!validatePhoneNumber(value) && field === 'Phone Number') {
        Alert.alert('Invalid phone number', 'Phone number must contain exactly 10 digits');
        return;
    }
    

    if (!validateLocation(value) && field === 'Location') {
        Alert.alert('Invalid address', 'Location must be less than 255 characters');
        return;
    }
    if (!validateDescription(value) && field === 'Description') {
        Alert.alert('Invalid description', 'Description should not be empty and must be less than 1000 characters');
        return;
    }

    const fieldKey = getFieldKey(field);
    if (fieldKey) {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      if(field === 'Location'){
        try {
            await updateDoc(restaurantRef, {
            [fieldKey]: value,
            coords: coords,
            });
            Alert.alert('Success', `${field} updated successfully.`);
            
            saveChanges(fieldKey, value)
            navigation.goBack();
        } catch (error) {
            console.error('Error updating document:', error);
            Alert.alert('Error', 'There was an error updating the information.');
        }
      } else{

        try {
            await updateDoc(restaurantRef, {
            [fieldKey]: value,
            });
            Alert.alert('Success', `${field} updated successfully.`);
            
            saveChanges(fieldKey, value)
            navigation.goBack();
        } catch (error) {
            console.error('Error updating document:', error);
            Alert.alert('Error', 'There was an error updating the information.');
        }
        }
    } else {
      Alert.alert('Error', 'Invalid field specified.');
    }
  };


    const getFieldKey = (fieldName) => {
        switch (fieldName) {
        case 'Restaurant Name':
            return 'restaurant_name';
        case 'Location':
            return 'location';
        case 'Phone Number':
            return 'phone_number';
        case 'Description':
            return 'description';
        default:
            return null; 
        }
    };

  const renderInputField = () => {
    if (field === "Location") {
      return (
        <View style={styles.inputContainer}>
          <GooglePlacesAutocomplete
          fetchDetails={true}
            placeholder={value ? userData.location : "Search location"}
            onPress={(data, details = null) => {
                try {
                    if (details) {
                        const locationName = details.formatted_address; 
                        const { lat, lng } = details.geometry.location;
                
                        setValue(locationName);
                        setCoords({ latitude: lat, longitude: lng });
                    }
                } catch (error) {
                    console.error("Error in handleLocationSelect:", error);
                }
            }}
            query={{
              key: cfg.maps,
              language: 'en',
              components: 'country:ca|country:us',
            }}
            textInputProps={{
              placeholderTextColor: 'black',
            }}
            styles={{
              textInputContainer: styles.ACCont,
              textInput: styles.input,
            }}
            listViewDisplayed="auto"
          />
          {value && (
            <TouchableOpacity style={styles.clearIcon} onPress={clearInput}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (field === "Description") {
        const isDescriptionField = field === "Description";
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, isDescriptionField && styles.inputMultiline]}
                    value={value}
                    onChangeText={setValue}
                    autoFocus
                    keyboardType={field === "Phone Number" ? "phone-pad" : "default"}
                    multiline={isDescriptionField}
                    numberOfLines={isDescriptionField ? 4 : 1}
                />
                {value && (
                    <TouchableOpacity onPress={clearInput}>
                        <Ionicons name="close-circle" size={24} color="gray" />
                    </TouchableOpacity>
                )}
            </View>
        );
    } else {
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              autoFocus
              keyboardType={field === "Phone Number" ? "phone-pad" : "default"} 
            />
            {value && (
              <TouchableOpacity onPress={clearInput}>
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>
        );
      }
  };

  return (
    <>
    <Header />
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.label}>{field}</Text>
          {renderInputField()}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  label: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingBottom: 8,
    marginBottom: 20,
    width: '90%',
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgb(81,150,116)',
    borderColor: 'rgb(81,150,116)',
  },
  saveButtonText: {
    color: 'white',
  },
  clearIcon: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  ACCont: {
    flex: 1,
    marginRight: 10,
    borderWidth: 0, 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  label: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingBottom: 8,
    marginBottom: 20,
    width: '90%', 
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    width: '100%', 
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: '40%', 
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgb(81,150,116)',
    borderColor: 'rgb(81,150,116)',
  },
  saveButtonText: {
    color: 'white',
  },
  ACCont: {
    width: '90%',
    borderWidth: 0,
  },
});

export default DetailEditScreen;
