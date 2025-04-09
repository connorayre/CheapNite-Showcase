import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Image, StyleSheet, Alert, FlatList, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {  createUserWithEmailAndPassword } from '@firebase/auth';
import { auth, db } from '../firebase';
import { getFirestore, collection, addDoc, setDoc, doc } from '@firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import fetch from 'node-fetch';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import PasswordRequirements from './PasswordRequirements'; 

const copyIcon = require('./../assets/Copy-Icon.png')
const cfg = require('./../cfg/cfg');


const RestaurantSignUp = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessHours, setBusinessHours] = useState({
    Sunday: { openTime: "", closeTime: "" },
    Monday: { openTime: "", closeTime: "" },
    Tuesday: { openTime: "", closeTime: "" },
    Wednesday: { openTime: "", closeTime: "" },
    Thursday: { openTime: "", closeTime: "" },
    Friday: { openTime: "", closeTime: "" },
    Saturday: { openTime: "", closeTime: "" },
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
const [currentDay, setCurrentDay] = useState(null);
const [isClosed, setIsClosed] = useState({
  Sunday: false,
  Monday: false,
  Tuesday: false,
  Wednesday: false,
  Thursday: false,
  Friday: false,
  Saturday: false,
});
const [showCopyModal, setShowCopyModal] = useState(false);
const [dayToCopy, setDayToCopy] = useState(null);
const [currentPeriod, setCurrentPeriod] = useState(null); 
const [defaultPickerTime, setDefaultPickerTime] = useState(new Date());
const [description, setDescription] = useState('');

  //---------------------------------------------------------------------------------------
  const navigation = useNavigation();

  //---------------------------------------------------------------------------------------

  const handleCopyHours = (sourceDay) => {
    setDayToCopy(sourceDay);
    setShowCopyModal(true);
  };
  
  const executeCopyHours = (targetDays) => {
    let newHours = {...businessHours};
  
    targetDays.forEach(day => {
      newHours[day] = {...businessHours[dayToCopy]};
    });
  
    setBusinessHours(newHours);
    setShowCopyModal(false);
  };

  const toggleClosedState = (day) => {
    setIsClosed(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  
    if(!isClosed[day]) {
      setBusinessHours(prev => ({
        ...prev,
        [day]: { openTime: "CLOSED", closeTime: "CLOSED" }
      }));
    } else {
      setBusinessHours(prev => ({
        ...prev,
        [day]: { openTime: "", closeTime: "" }
      }));
    }
  };

  const showDatePicker = (day, period) => {
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0, 0); 
  
    setDefaultPickerTime(defaultTime);
    setCurrentDay(day);
    setCurrentPeriod(period);
    setDatePickerVisibility(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setCurrentDay(null);
    setCurrentPeriod(null);
  };
  
  const handleConfirm = (date) => {
    const selectedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    setBusinessHours((prev) => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [currentPeriod === "open" ? "openTime" : "closeTime"]: selectedTime,
      },
    }));
    hideDatePicker();
  };
  

  const formItems = [
    { type: 'title', content: 'Add your Restaurant' },
    { type: 'input', label: 'Restaurant Name', placeholder: 'Example Restaurant Name', value: restaurantName, setValue: setRestaurantName },
    { type: 'description', label: 'Description', value: description, setValue: setDescription },
    { type: 'input', label: 'Email', placeholder: 'example@email.com', value: email, setValue: setEmail },
    { type: 'input-password', label: 'Password', placeholder: 'Your password', value: password, setValue: setPassword, secureTextEntry: true },
    { type: 'input-password', label: 'Confirm Password', placeholder: 'Confirm your password', value: confirmPassword, setValue: setConfirmPassword, secureTextEntry: true },
    { type: 'phone-input', label: 'Phone Number', placeholder: 'CheapNite phone number', value: phoneNumber, setValue: setPhoneNumber },
    { type: 'autocomplete', label: 'Location' }, 
    { type: 'input', label: 'Relationship to Business', placeholder: 'eg., Owner', value: relationship, setValue: setRelationship },
    { type: 'businessHours', label: 'Business Operating Hours' },
  ];

  const handleLocationSelect = (data, details = null) => {
    try {
        if (details) {
            const locationName = details.formatted_address; 
            const { lat, lng } = details.geometry.location;
    
            setAddress(locationName);
            setCoords({ latitude: lat, longitude: lng });
        }
    } catch (error) {
        console.error("Error in handleLocationSelect:", error);
    }
};

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return passwordRegex.test(password);
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


const validateRelationship = (relationship) => {
  if(relationship.length > 30){
    return false;
  }
  return true;
};

const validateDescription = (desc) => {
  if(!desc || desc.length > 1000) {
    return false;
  }
  return true;
};

const validateBusinessHours = (hours) => {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for(let day in hours) {
    let openTimeValid = hours[day].openTime === 'CLOSED' || timePattern.test(hours[day].openTime);
    let closeTimeValid = hours[day].closeTime === 'CLOSED' || timePattern.test(hours[day].closeTime);

    if(!openTimeValid || !closeTimeValid) {
      return false;
    }
  }
  return true;
};

const getPasswordRequirements = (password) => {
  return {
    minLength: password.length >= 8,
    lowerCase: /[a-z]/.test(password),
    upperCase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[@$!%*?#&]/.test(password),
  };
};

//---------------------------------------------------------------------------------------
const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);
    if (!validateEmail(email)) {
      Alert.alert('Invalid email', 'Email must be in email format');
      return;
    }
  
    if (!validatePassword(password)) {
      Alert.alert('Invalid password', 'Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long');
      return;
    }
  
    if (!validateRestaurantName(restaurantName)) {
      Alert.alert('Invalid restaurant name', 'Restaurant name must be less than 50 characters');
      return;
    }
  
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid phone number', 'Phone number must contain exactly 10 digits');
      return;
    }
  
    if (!validateRelationship(relationship)) {
      Alert.alert('Invalid relationship', 'Relationship description must be less than 30 characters');
      return;
    }

    if (!validateLocation(address)) {
      Alert.alert('Invalid address', 'Location must be less than 255 characters');
      return;
    }
    if (!validateDescription(description)) {
      Alert.alert('Invalid description', 'Description should not be empty and must be less than 1000 characters');
      return;
    }
    
    if (!validateBusinessHours(businessHours)) {
      Alert.alert('Invalid business hours', 'Hours should be either "CLOSED" or a valid 24-hour time format like "09:00".');
      return;
    }
 
  
    if (!coords) {
      Alert.alert('Invalid Location', 'Sorry we had trouble finding your location. Please try again');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      var user = userCredential.user;
      Alert.alert('Sign Up Successful','You have successfully signed up! You can now log in.',);
      addRestaurant(user);
      navigation.navigate('LoginScreen');
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      Alert.alert('Sign Up Error', errorMessage);
    });
  };

//---------------------------------------------------------------------------------------

  const handleSignInPress = () => {
    navigation.navigate('LoginScreen');
  };

  const handleUserSignupPress = () => {
    navigation.navigate('SignupScreen');
  };


async function addRestaurant(restaurant) {
  try {
    const lowerCaseEmail = email.toLowerCase();
    await setDoc(doc(db, "restaurants", lowerCaseEmail), {
      email: lowerCaseEmail,
      restaurant_name: restaurantName,
      phone_number: phoneNumber,
      relationship: relationship,
      description: description,
      businessHours: businessHours,
      location: address,
      coords: coords,
      type: 1,
      verified: false
    });
  } catch (e) {

  }
}


//---------------------------------------------------------------------------------------

  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text>
            <Ionicons name="arrow-back" size={36} color="white" />
          </Text>
        </TouchableOpacity>
        <Image source={require('../assets/company-logo-white.png')} style={styles.logo} />
      </View>

      <View style={[styles.content, { flex: 1 }]}>
      <FlatList
        keyboardShouldPersistTaps='handled'
        data={formItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'title':
              return <Text style={styles.title}>{item.content}</Text>;
            case 'input':
              return (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={item.placeholder}
                    placeholderTextColor="gray"
                    value={item.value}
                    onChangeText={(text) => item.setValue(text)}
                    secureTextEntry={item.secureTextEntry || false}
                  />
                </View>
              );
              case 'input-password':
                const isPasswordMatching = password && confirmPassword && password === confirmPassword;
                const validationIconName = isPasswordMatching ? 'checkmark-circle-outline' : 'close-circle-outline';
                return (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{item.label}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        confirmPassword.length > 0 ? (isPasswordMatching ? styles.validInput : styles.invalidInput) : null,
                      ]}
                      placeholder={item.placeholder}
                      placeholderTextColor="gray"
                      value={item.value}
                      onChangeText={(text) => item.setValue(text)}
                      secureTextEntry={true}
                    />
                   {item.label === 'Password' && (
                    <PasswordRequirements password={password} />
                      )}
                      {item.label === 'Confirm Password' && confirmPassword.length > 0 && (
                        <Ionicons
                          name={validationIconName}
                          size={18}
                          color={isPasswordMatching ? 'green' : 'red'}
                          style={styles.validationIcon}
                        />
                      )}
                    </View>
                  );
              case 'phone-input':
              return (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={item.placeholder}
                    placeholderTextColor="gray"
                    value={item.value}
                    keyboardType="phone-pad"
                    onChangeText={(text) => item.setValue(text)}
                    secureTextEntry={item.secureTextEntry || false}
                  />
                </View>
              );
            case 'description':
              return (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Describe your restaurant..."
                    placeholderTextColor="gray"
                    multiline={true}
                    value={item.value}
                    onChangeText={(text) => item.setValue(text)}
                  />
                </View>
              );
            case 'autocomplete':
              return (
<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <View >
                  <GooglePlacesAutocomplete
                    styles={{
                      textInputContainer: styles.ACCont,
                      textInput: styles.ACinput,
                  }}
                    placeholder='Search'
                    fetchDetails={true}
                    onPress={handleLocationSelect}
                    query={{
                      key: cfg.maps,
                      language: 'en',
                      components: 'country:ca|country:us',
                    }}
                    onFail={(error) => console.error('GooglePlacesAutocomplete error', error)}
                    textInputProps={{
                      placeholderTextColor: 'gray',
                    }}
                  />
                  
                  </View>
                </View>
                </KeyboardAvoidingView>
              );
            case 'businessHours':
              return (
                <View >
                  <Text style={styles.labelHours}>{item.label}</Text>
                  <Text style={styles.labelHoursSubText}>
                    Please enter the operating hours of your business.
                    </Text>
                    <Text style={styles.labelHoursSubText}>
                     Tap the 
                    <Text style={{ color: "rgb(81,150, 116)" }}> green clock </Text>
                    icon if you are closed that day, or tap the
                    <Text style={{ color: "rgb(81,150, 116)" }}> green square </Text>
                     on the right to copy your time to another day.
                  </Text>

                  {Object.keys(businessHours).map((day) => (
                    <View key={day} style={styles.hoursContainer}>
                      <Text style={styles.label}>{day}</Text>

                      
                      <View style={styles.timeInputContainer}>
                      <TouchableOpacity onPress={() => toggleClosedState(day)}>
                        <MaterialCommunityIcons 
                          name="clock-outline" 
                          size={24} 
                          color={isClosed[day] ? "red" : "rgb(81,150, 116)"} 
                        />
                      </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => showDatePicker(day, "open")}
                          style={styles.timeInput}
                        >
                          <Text style={{ color: businessHours[day].openTime ? "black" : "gray" }}>
                            {businessHours[day].openTime || "Open Time (09:00)"}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.toText}>to</Text>
                        <TouchableOpacity
                          onPress={() => showDatePicker(day, "close")}
                          style={styles.timeInput}
                        >
                          <Text style={{ color: businessHours[day].closeTime ? "black" : "gray" }}>
                            {businessHours[day].closeTime || "Close Time (21:00)"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCopyHours(day)} style={styles.editButton}>
                          <Image source={copyIcon} style={styles.icon} />
                        </TouchableOpacity>



                      </View>
                    </View>
                  ))}
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="time"
                    date={defaultPickerTime}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                  />

                </View>
              );
            default:
              return null;
          }
        }}
        
        ListFooterComponent={() => (
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>
                Already a Member?{' '}
                <TouchableOpacity onPress={handleSignInPress}>
                  <Text style={styles.link}>Sign in</Text>
                </TouchableOpacity>
              </Text>
              <Text style={styles.bottomText}>
                User?{' '}
                <TouchableOpacity onPress={handleUserSignupPress}>
                  <Text style={styles.link}>Sign up</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        )}
      />
      </View>
      {showCopyModal && (
  <View style={styles.modal}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalHeaderText}>Copy {dayToCopy}'s hours to:</Text>
    </View>
    {Object.keys(businessHours).map(day => (
      <TouchableOpacity 
        key={day} 
        onPress={() => executeCopyHours([day])} 
        style={styles.modalItem}
      >
        <Text style={styles.modalItemText}>{day}</Text>
      </TouchableOpacity>
    ))}
    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCopyModal(false)}>
      <Text style={styles.modalCloseButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
)}

    </View>
  </TouchableWithoutFeedback>
  );
  
};

//---------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    width: '100%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
  },
  logoContainer: {
    width: '100%',
    height: '25%', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgb(81,150, 116)',
},
backButton: {
  position: 'absolute', 
  left: 10, 
  padding: 10,
},

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 50,
},
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: 'grey',
  },
  labelHours: {
    color: 'grey',
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  },
  labelHoursSubText: {
    color: 'grey',
    marginBottom:10,
    marginTop: 5,
    
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    marginBottom: 10,
  },
  ACinput: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    marginBottom: 10,
    borderRadius: 0,
  },
  
  signupButton: {
    backgroundColor: 'rgb(81,150, 116)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 30,
  },
  bottomText: {
    color: 'black',
    marginRight: 5,
  },
  link: {
    color: 'green',
  },
  priceSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  priceContainer: {
    marginHorizontal: 10,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: 'grey',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSelected: {
    borderColor: 'rgb(81,150, 116)',
  },
  priceText: {
    fontSize: 20,
    color: 'black',
  },
  priceSelectedText: {
    color: 'rgb(81,150, 116)',
  },
  hoursContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  timeInput: {
    flex: 1,
    padding: 5,
    borderWidth: 0, 
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  toText: {
    marginHorizontal: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    marginBottom: 20,
    height: 120, 
  },
  modal: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgb(81,150, 116)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center'
  },
  modalHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  modalItem: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'lightgrey'
  },
  modalItemText: {
    fontSize: 16,
    color: 'black'
  },
  modalCloseButton: {
    width: '100%',
    padding: 15,
    backgroundColor: 'grey',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center'
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },icon: {
    width: 20,   
    height: 20,
    resizeMode: 'contain',
  },
  passwordValidationText: {
    fontSize: 12,
    paddingTop: 5,
  },
  validationIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -9, 
  },
  
  validInput: {
    borderColor: 'green',
    borderWidth: 2,
  },
  
  invalidInput: {
    borderColor: 'red',
    borderWidth: 2,
  },
  
});

//---------------------------------------------------------------------------------------

export default RestaurantSignUp;