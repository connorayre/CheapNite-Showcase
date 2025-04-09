import React, { useEffect, useContext } from 'react';
import { View, ActivityIndicator, Image, Alert } from 'react-native';
import { onAuthStateChanged } from '@firebase/auth';

import { getDocs, query, collection, where, getDoc, doc } from '@firebase/firestore'; 
import { auth, db } from '../firebase';
import { SessionContext } from '../SessionContext';

import logo from '../assets/Splsh.png'; 


const LoadingScreen = ({ navigation }) => {
    const { setSession } = useContext(SessionContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
            navigation.navigate('MainPage');
          } else if (userData.type === 1){
          if(userData.verified){
            Alert.alert('Login Success', 'Welcome Back');
          }else{
            Alert.alert('Welcome to CheapNite!', 'Login Success\n\nPlease feel free to add your deals, and dont forget to request Verification in "My Account" to go live!');
          }
          navigation.navigate('RestaurantView');
        } else {
            navigation.navigate('LoginScreen');
          }
        } else {
          navigation.navigate('LoginScreen');
        }
      } else {
        navigation.navigate('LoginScreen');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Image source={logo} style={{ width: 200, height: 200 }} resizeMode="contain" />
      <ActivityIndicator color="grey" />
    </View>
  );
  
};


export default LoadingScreen;
