import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {  createUserWithEmailAndPassword } from '@firebase/auth';
import { auth, db } from '../firebase';
import { getFirestore, collection, addDoc, setDoc, doc } from '@firebase/firestore';
import ModalDropdown from 'react-native-modal-dropdown';

const cfg = require('./../cfg/cfg');
import { months } from '../assets/tags.json';
import { Ionicons } from '@expo/vector-icons';

//---------------------------------------------------------------------------------------------------------------


const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1903 }, (_, i) => 1904 + i);

  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    return emailRegex.test(email);
  };

  const handleSignup = () => {
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Email Faux Pas!', "Your email's looking a little undercooked. Mind seasoning it with an '@' and a '.com'?");
      return;
}

if (!password) {
      Alert.alert('Password MIA!', 'The gateway to CheapNite glory requires a password. Try to make it memorable, not like "password123".');
      return;
}

if (!dobMonth) {
      Alert.alert('Birthday Blunder', "You can't hide your birth month from us! Were you born in 'Foodbruary' or 'Drinkember'?");
      return;
}

if (!dobDay) {
      Alert.alert('Date Dilemma', "Hey, every day's a party, but which one's YOURS? Give us the day!");
      return;
}
    if (!dobYear) {
      Alert.alert('Year Yo-Yo', "Can't sip a brewski without a birth year. Share the secret?");
      return;
}
  
    createUserWithEmailAndPassword(auth, trimmedEmail, password)
    .then((userCredential) => {
      var user = userCredential.user;
      Alert.alert('Sign Up Successful','You have successfully signed up! You can now log in.',);
      addUser(user);
      navigation.navigate('LoginScreen');
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      Alert.alert('Sign Up Error', 'Sorry, someone is already having a cheap night with that email');
    });
  };

  

//---------------------------------------------------------------------------------------------------------------
  const handleSignInPress = () => {
    navigation.navigate('LoginScreen');
  };

  const handleRestaurantSignupPress = () => {
    navigation.navigate('RestaurantSignUp');
  };

  async function addUser(user) {
    try {
        const lowerCaseEmail = email.toLowerCase(); 
        await setDoc(doc(db, "users", user.uid), {
            email: lowerCaseEmail, 
            phone_number: phoneNumber ? phoneNumber : "",
            dob: {
              month: dobMonth,
              day: dobDay,
              year: dobYear
            },
            type: 0
        });

    } catch (e) {
        Alert.alert("Error","Sorry there seems to be a problem. Please try again")
    }
} 

//---------------------------------------------------------------------------------------------------------------

return (
  <View style={styles.container}>
    
    <View style={styles.logoContainer}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Text>
        <Ionicons name="arrow-back" size={36} color="white" />
    </Text>
</TouchableOpacity>
    <Image source={require('../assets/company-logo-white.png')} style={styles.logo} />
</View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Sign up for a CheapNite</Text>
          <Text style={styles.subtitle}>Ever Expanding</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholderTextColor="gray"
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              placeholderTextColor="gray"
              style={styles.input}
              placeholder="ie: 6138237170"
              value={phoneNumber}
              onChangeText={text => setPhoneNumber(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholderTextColor="gray"
              style={styles.input}
              placeholder="Your password"
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.labelDOB}>Date of Birth</Text>
            <View style={styles.dateDropdownContainer}>
                <ModalDropdown
                    style={styles.dateDropdown}
                    textStyle={[styles.dropdownText, !dobMonth ? { color: 'grey' } : {}]}
                    dropdownStyle={styles.dropdownList}
                    options={months}
                    defaultValue="Month"
                    onSelect={(index, value) => setDobMonth(value)}
                />
                <ModalDropdown
                    style={styles.dateDropdown}
                    textStyle={[styles.dropdownText, !dobDay ? { color: 'grey' } : {}]}
                    dropdownStyle={styles.dropdownList}
                    options={[...Array(new Date(currentYear, months.indexOf(dobMonth) + 1, 0).getDate()).keys()].map(day => `${day + 1}`)}
                    defaultValue="Day"
                    onSelect={(index, value) => setDobDay(value)}
                />
                <ModalDropdown
                    style={styles.dateDropdown}
                    textStyle={[styles.dropdownText, !dobYear ? { color: 'grey' } : {}]}
                    dropdownStyle={styles.dropdownList}
                    options={years.map(year => `${year}`)}
                    defaultValue="Year"
                    onSelect={(index, value) => setDobYear(value)}
                />
            </View>
        </View>


          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
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
              Restaurant?{' '}
              <TouchableOpacity onPress={handleRestaurantSignupPress}>
                <Text style={styles.link}>Sign up</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

//---------------------------------------------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 0, 
    paddingTop: 0,
  },
  logoContainer: {
    width: '100%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(81,150, 116)',
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
  subtitle: {
    color: 'darkgrey',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: 'grey',
  },
  labelDOB: {
    color: 'grey',
    marginLeft: 5
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: 'rgb(81,150, 116)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomTextContainer: {
    flexDirection: 'col',
    justifyContent: 'center',
    marginBottom: 50,
  },
  bottomText: {
    color: 'black',
    marginRight: 5,
  },
  link: {
    color: 'rgb(81,150, 116)',
  },
  dateDropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateDropdown: {
    flex: 1,
    borderColor: 'grey',
    borderWidth: 1,
    padding: 10,
    marginRight: 5,
    marginLeft: 5
  },
  dropdownText: {
    textAlign: 'center',
    color:"gray"
  },
  dropdownList: {
    width: 100 
  },
  backButton: {
    position: 'absolute', 
    left: 10, 
    padding: 10,
},
});

//---------------------------------------------------------------------------------------------------------------

export default SignupScreen;