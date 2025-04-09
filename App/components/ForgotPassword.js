import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Image, Alert, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import {  sendPasswordResetEmail } from '@firebase/auth';
import { auth, db } from '../firebase'; 

import Header from './Header';


const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const validateEmail = () => {
    if (email.length < 3) {
      return false;
    }
    return true;
  };

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);

    if (!validateEmail()) {
      Alert.alert('Invalid email', 'Please provide a valid email');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent! \n\n Please also check your junk folder');
        navigation.goBack();
      })
      .catch((error) => {
        Alert.alert('Error', 'Error sending password reset email.');
      });
  };

  return (
    <View style={styles.container}>
      <Header/>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.headerText}>Forgot your password?</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={"gray"}
              value={email}
              onChangeText={text => setEmail(text)}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleForgotPassword}>
              <Text style={styles.loginButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

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
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 20,
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: 20, 
      paddingTop: 40, 
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      color: 'grey',
    },
    input: {
      borderWidth: 1,
      borderColor: 'grey',
      padding: 10,
      marginBottom: 10,
    },
    loginButton: {
      backgroundColor: 'rgb(81,150, 116)',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    forgotPasswordText: {
      color: 'green',
      marginBottom: 10,
    },
    signupText: {
      color: 'green',
      marginBottom: 10,
    },
    privacyText: {
      color: 'green',
    },
    bottomText: {
      color: 'black',
      marginRight: 5,
    },
    link: {
      color: 'green',
    },
  });

export default ForgotPassword;
