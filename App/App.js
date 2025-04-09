
import { StyleSheet, Text, View } from 'react-native';
import MainPage from './components/MainPage';
import MainPageNoAuth from './components/MainPageNoAuth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import SupportScreen from './components/SupportScreen';
import SupportScreenNoAuth from './components/SupportScreenNoAuth';
import ProfileScreen from './components/ProfileScreen';
import RestaurantProfileScreen from './components/RestaurantProfileScreen';
import RestaurantSignUp from './components/RestaurantSignUp';
import MyDeals from './components/MyDeals';
import RestaurantView from './components/RestaurantView';
import UserRestaurantView from './components/UserRestaurantView';
import UserRestaurantViewFromMap from './components/UserRestaurantViewFromMap';
import AddDeal from './components/AddDeals';
import DealView from './components/DealView';
import RestaurantDealView from './components/RestaurantDealView';
import ForgotPassword from './components/ForgotPassword';
import AnalyticsScreen from './components/AnalyticsScreen';
import PrivacyScreen from './components/PrivacyScreen';
import TNA from './components/TNA';
import TNANoButton from './components/TNANoButton';
import LoadingScreen from './components/LoadingScreen';
import Map from './components/Map';
import EditRestaurantProfile from './components/EditRestaurantProfile';
import EditBusinessHours from './components/EditBusinessHours';
import EditDealPhoto from './components/EditDealPhoto';
import ProfilePhotoEdit from './components/ProfilePhotoEdit';
import DetailEditScreen from './components/DetailEditScreen';
import * as amplitude from '@amplitude/analytics-react-native';
import { init } from '@amplitude/analytics-react-native';
import { SessionProvider } from './SessionContext';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Add this import
import { LogBox } from 'react-native';


const cfg = require('./cfg/cfg');
init(cfg.amplitude);






//---------------------------------------------------------------------------------------------------------------

const Stack = createNativeStackNavigator();


//const analytics = getAnalytics(app);
LogBox.ignoreLogs(['Constants.platform.ios.model has been deprecated']);
LogBox.ignoreLogs(['initialScrollIndex "-1" is not valid']);


//---------------------------------------------------------------------------------------------------------------

const App = () => {


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="LoadingScreen" component={LoadingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="MainPageNoAuth" component={MainPageNoAuth} options={{ headerShown: false }} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SupportScreen" component={SupportScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SupportScreenNoAuth" component={SupportScreenNoAuth} options={{ headerShown: false }} />
            <Stack.Screen name="RestaurantSignUp" component={RestaurantSignUp} options={{ headerShown: false }} />
            <Stack.Screen name="MainPage" component={MainPage} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="RestaurantView" component={RestaurantView} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="AddDeal" component={AddDeal} options={{ headerShown: false }} />
            <Stack.Screen name="RestaurantDealView" component={RestaurantDealView} options={{ headerShown: false }} />
            <Stack.Screen name="DealView" component={DealView} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
            <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="UserRestaurantView" component={UserRestaurantView} options={{ headerShown: false }} />
            <Stack.Screen name="UserRestaurantViewFromMap" component={UserRestaurantViewFromMap} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RestaurantProfile" component={RestaurantProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyDeals" component={MyDeals} options={{ headerShown: false }} />
            <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TNA" component={TNA} options={{ headerShown: false }} />
            <Stack.Screen name="Map" component={Map} options={{ headerShown: false }} />
            <Stack.Screen name="TNANoButton" component={TNANoButton} options={{ headerShown: false }} />
            <Stack.Screen name="EditRestaurantProfile" component={EditRestaurantProfile} options={{ headerShown: false }} />
            <Stack.Screen name="EditBusinessHours" component={EditBusinessHours} options={{ headerShown: false }} />
            <Stack.Screen name="EditDealPhoto" component={EditDealPhoto} options={{ headerShown: false }} />
            <Stack.Screen name="DetailEditScreen" component={DetailEditScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilePhotoEdit" component={ProfilePhotoEdit} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SessionProvider>
    </GestureHandlerRootView>
  );
};


//---------------------------------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});



export default App;