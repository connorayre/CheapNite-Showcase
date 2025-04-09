import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Image, Alert, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../SessionContext';
import { GoogleSignin, GoogleSigninButton  } from '@react-native-google-signin/google-signin';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { getDoc, doc, setDoc ,collection, getDocs, query, where} from '@firebase/firestore';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import { getAuth, OAuthProvider } from '@firebase/auth';

import { auth, db } from '../firebase';

const appleIcon = require('../assets/Icons/Apple-Icon.png'); 
const cfg = require('./../cfg/cfg');
const version = require('../assets/tags.json');

GoogleSignin.configure({
  webClientId: 'cfg.web_id', 
});

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setSession, setToken } = useContext(SessionContext);
  const [token, setTokenState] = useState('');


  const validateEmail = () => {
    if (email.length < 3) {
      return false;
    }
    return true;
  };

  const handleAppleLogin = async () => {
    if (!appleAuth.isSupported) {
      console.log('Apple Sign-In is not supported on this device.');
      return;
    }
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
  
      const nonce = appleAuthRequestResponse.nonce;
      const appleIdToken = appleAuthRequestResponse.identityToken;
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: appleIdToken,
        rawNonce: nonce,
      });
  
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userEmail = user.email.toLowerCase().trim();

      const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      let userDoc = null;
      if (!userSnapshot.empty) {
          userDoc = userSnapshot.docs[0];
      }

      if (!userDoc || !userDoc.exists()) {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', userEmail));
          if (restaurantDoc.exists()) {
              userDoc = restaurantDoc;
          }
      }

      if (userDoc && userDoc.exists()) {
          const userData = userDoc.data();
          setSession({ userData: userData });

          if (userData.type === 0) {
            if(!userData.hasAcceptedTerms){
              Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
              navigation.navigate('TNA');
            }else{
              navigation.navigate('MainPage');
            }
            
        }
          else if (userData.type === 1) {
            if(!userData.hasAcceptedTerms){
              Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
              navigation.navigate('TNA');
            }else{
              if(userData.verified){
                Alert.alert('Login Success', 'Welcome Back');
              }else{
                Alert.alert('Welcome to CheapNite!', 'Login Success\n\nPlease feel free to add your deals, and dont forget to request Verification in "My Account" to go live!');
              }
              navigation.navigate('RestaurantView');
            }
          } else if (userData.type === 2) {
            Alert.alert('Login Success', 'Welcome back Mr. Ayre. The keys to the kingdom are yours. The higher the fewer.');
            navigation.navigate('MasterView');
          } else {
            navigation.navigate('MainPage');
          }
      } else {
        try {
            await setDoc(doc(db, "users", user.uid), {
                email: userEmail,
                type: 0
            });
            Alert.alert('Account Created', 'Welcome to CheapNite! Your account has been created using Google Sign-in.');
            const userData = {email: userEmail, type: 0}
            setSession({ userData: userData });
            navigation.navigate('MainPage');
        } catch (e) {
            Alert.alert("Error","Sorry there seems to be a problem. Please try again");
        }
    }


    } catch (error) {
      console.log(error);
      Alert.alert("Sorry this shouldnt shows")
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
        
        const firebaseUserCredential = await signInWithCredential(auth, googleCredential);
        const user = firebaseUserCredential.user;
        const userEmail = user.email.toLowerCase().trim();
        const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        const userSnapshot = await getDocs(userQuery);
        
        let userDoc = null;
        if (!userSnapshot.empty) {
            userDoc = userSnapshot.docs[0];
        }

        if (!userDoc || !userDoc.exists()) {
            const restaurantDoc = await getDoc(doc(db, 'restaurants', userEmail));
            if (restaurantDoc.exists()) {
                userDoc = restaurantDoc;
            }
        }

        if (userDoc && userDoc.exists()) {
            const userData = userDoc.data();
            setSession({ userData: userData });

            if (userData.type === 0) {
              if(!userData.hasAcceptedTerms){
                Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
                navigation.navigate('TNA');
              }else{

                navigation.navigate('MainPage');
              }
              
          }
            else if (userData.type === 1) {
              if(!userData.hasAcceptedTerms){
                Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
                navigation.navigate('TNA');
              }else{
                if(userData.verified){
                  Alert.alert('Login Success', 'Welcome Back');
                }else{
                  Alert.alert('Welcome to CheapNite!', 'Login Success\n\nPlease feel free to add your deals, and dont forget to request Verification in "My Account" to go live!');
                }
                navigation.navigate('RestaurantView');
              }
            } else if (userData.type === 2) {
              Alert.alert('Login Success', 'Welcome back Mr. Ayre. The keys to the kingdom are yours. The higher the fewer.');
              navigation.navigate('MasterView');
            } else {
              navigation.navigate('MainPage');
            }
        } else {
          try {
              await setDoc(doc(db, "users", user.uid), {
                  email: userEmail,
                  type: 0
              });
              Alert.alert('Account Created', 'Welcome to CheapNite! Your account has been created using Google Sign-in.');
              const userData = {email: userEmail, type: 0}
              setSession({ userData: userData });
              navigation.navigate('MainPage');
          } catch (e) {
              Alert.alert("Error","Sorry there seems to be a problem. Please try again");
          }
      }
    } catch (error) {
        console.log(error);
    }
};

  const handleLogin = () => {
    const lowerCaseEmail = email.toLowerCase();
    const trimmedEmail = lowerCaseEmail.trim();
    if (!validateEmail()) {
      Alert.alert('Hey you!', "That email's got a bit of a limp. Could you help it stand with an '@' and '.com'?");
      return;
    }

    if (!password) {
      Alert.alert('I think you forgot something...', 'Your password seems to have gone on a snack break. Could you remind it to come back?');
      return;
    }

    signInWithEmailAndPassword(auth, trimmedEmail, password)
      .then(async (userCredential) => {
        var user = userCredential.user;

        const userQuery = query(collection(db, 'users'), where('email', '==', trimmedEmail));
        const userSnapshot = await getDocs(userQuery);

        let userDoc = null;
        if (!userSnapshot.empty) {
          userDoc = userSnapshot.docs[0];
        }

        if (!userDoc || !userDoc.exists()) {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', trimmedEmail));
          if (restaurantDoc.exists()) {
            userDoc = restaurantDoc;
          }
        }
        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data();

          setSession({ userData: userData });

          if (userData.type === 0) {
            if (!userData.hasAcceptedTerms) {
              Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
              navigation.navigate('TNA');
            } else {
              navigation.navigate('MainPage');
            }

          }
          else if (userData.type === 1) {
            if (!userData.hasAcceptedTerms) {
              Alert.alert("Terms and Agreement", "Please accept our terms and agreements");
              navigation.navigate('TNA');
            } else {
              if (userData.verified) {
                Alert.alert('Login Success', 'Welcome Back');
              } else {
                Alert.alert('Welcome to CheapNite!', 'Login Success\n\nPlease feel free to add your deals, and dont forget to request Verification in "My Account" to go live!');
              }
              navigation.navigate('RestaurantView');
            }
          } else if (userData.type === 2) {
            Alert.alert('Login Success', 'Welcome back Mr. Ayre. The keys to the kingdom are yours. The higher the fewer.');
            navigation.navigate('MasterView');
          } else {
            navigation.navigate('MainPage');
          }
        } else {
          Alert.alert("Error", "No user was found")
        }
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        Alert.alert('Login Failed', "Either you dont have an account or your password was incorrect");
      });

  }
  //---------------------------------------------------------------------------------------------------------------

  const navigateToSignup = () => {
    navigation.navigate('SignupScreen');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRestaurantSignupPress = () => {
    navigation.navigate('RestaurantSignUp');
  };

  const navigateToPrivacy = () => {
    navigation.navigate('PrivacyScreen');
  };
  const navigateToTerms = () => {
    navigation.navigate('TNANoButton');
  };
  const navigateToGuest = () => {
    Alert.alert("Welcome to CheapNite!", "Feel free to view our deals, but it is recommended to create an account and sign in to access all account features!\n\n\nAre you a restaurant? \n\nPlease head to our login page to sign in or sign up as a restaurant!");
    navigation.navigate('MainPageNoAuth');
  };


  //---------------------------------------------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/company-logo-white.png')} style={styles.logo} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.headerText}>Are you ready for a CheapNite?</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="gray"
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          {appleAuth.isSupported && (
          <View style={styles.mainContainer}>
            {/* Google Login Button */}
            <View style={styles.buttonWrapper}>
              <GoogleSigninButton
                  style={styles.uniformButtonGoogle}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleLogin}
              />
            </View>
          
            {/* Apple Login Button */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity style={styles.uniformButtonApple} onPress={handleAppleLogin}>
                <Image source={appleIcon} style={styles.iconStyle} />
                <Text style={styles.buttonText}>Sign in with Apple</Text>
              </TouchableOpacity>
            </View>
        
            {/* Guest Login Button */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity style={styles.guest} onPress={navigateToGuest}>
                <Text style={styles.guestButtonText}>Guest →</Text>
              </TouchableOpacity>
            </View>
        </View>
        
        
         )}
         {!appleAuth.isSupported && (
          <View style={styles.buttonContainer}>
            <GoogleSigninButton
                style={styles.buttonAndroid}
                size={GoogleSigninButton.Size.Standard}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleLogin}
            />
            <TouchableOpacity style={[styles.shadow,styles.buttonAndroid]} onPress={navigateToGuest}>
                <Text style={styles.guest}>Guest →</Text>
            </TouchableOpacity>
        </View>
         )}
          <TouchableOpacity onPress={navigateToSignup}>
            <Text style={styles.signupText}>Don't have an account? Sign up!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestaurantSignupPress}>
            <Text style={styles.signupText}>Restaurant? Sign up!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToPrivacy}>
            <Text style={styles.forgotPasswordText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToTerms}>
            <Text style={styles.terms}>Terms</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
      <Text style={styles.version}>{version.version}</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
},
buttonContainerApple: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
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
    color: 'rgb(81,150, 116)',
    marginBottom: 10,
    fontSize: 18
  },
  terms: {
    color: 'rgb(81,150, 116)',
    marginBottom: 60,
    fontSize: 18
  },


  signupText: {
    color: 'rgb(81,150, 116)',
    marginBottom: 10,
    fontSize: 18
  },
  privacyText: {
    color: 'rgb(81,150, 116)',
    fontSize: 18
  },
  bottomText: {
    color: 'black',
    marginRight: 5,
  },
  link: {
    color: 'rgb(81,150, 116)',
  },
  version: {
    color: "rgb(81,150, 116)",
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonAndroid: {
    flex: 1,
    marginHorizontal: 5,
},
  buttonApple: { 
    flex: 1,
    marginRight: 10,
},
appleButton: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,

},

guest: {
    color: 'rgb(81,150, 116)', 
    fontSize: 14,
    textAlign: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderWidth: 1,       
    borderColor: 'rgb(81,150, 116)',  
    borderRadius: 5,      
    backgroundColor: 'white',  
    shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4, 
  width: '98%', 
  marginLeft: 4,
},
guestApple: {
  color: 'rgb(81,150, 116)', 
  fontSize: 14,
  textAlign: 'center', 
  paddingVertical: 10,  
  paddingHorizontal: 20, 
  borderWidth: 1,       
  borderColor: 'rgb(81,150, 116)',  
  borderRadius: 5,      
  backgroundColor: 'white',
  marginBottom: 10,
  marginTop: -10,  
},
buttonText: {
  color: '#fff', 
  marginLeft: 8, 
},
guestButtonText: {
  color: 'rgb(81,150, 116)', 
  textAlign: 'center',
},
iconStyle: {
  width: 22,
  height: 22,
},
shadow: {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4, 
},
signInButtonWrapper: {
  justifyContent: 'center',
  alignItems: 'center',
},
signInButtonWrapperApple: {
  justifyContent: 'center',
  alignItems: 'center',
},
mainContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 10,
},
buttonWrapper: {
  width: '100%',
  marginBottom: 10, 
},
uniformButtonApple: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,
  borderRadius: 4,
  backgroundColor: '#000',
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4,
  width: '98%',
  marginLeft: 4,
  paddingVertical: 8,
},
uniformButtonGuest: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10, 
  borderRadius: 4, 
  borderColor: 'rgb(81,150, 116)',
  backgroundColor: 'white', 
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4, 
  width: '100%', 
  paddingVertical: 8,
},
uniformButtonGoogle: {
  flexDirection: 'row', 
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10, 
  borderRadius: 4, 
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4, 
  width: '100%', 
},


});


//---------------------------------------------------------------------------------------------------------------

export default LoginScreen;
