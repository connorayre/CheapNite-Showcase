import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomBar = () => {

    const navigation = useNavigation();

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleMyDealPress = () => {
        navigation.navigate('MyDeals');
    };

    const handleHomePress = () => {
        navigation.navigate('MainPage');
    };

    return (
        <View style={{
            flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 25, backgroundColor: "rgb(81,150, 116)"
        }}>
            <TouchableOpacity onPress={handleHomePress}>
                <Text style={{ color: 'white', borderRightColor: 'white' }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMyDealPress}>
                <Text style={{ color: 'white' }}>My Deals</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress}>
                <Text style={{ color: 'white' }}>My Profile</Text>
            </TouchableOpacity>
        </View>
    );
};


//example stylesheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 0,
        paddingTop: 0, 
        justifyContent: 'flex-end',
        position: 'absolute'
    }
})



export default BottomBar;
