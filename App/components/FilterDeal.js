import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'; 
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from '@firebase/firestore';
import { SessionContext } from '../SessionContext';
import Slider from '@react-native-community/slider';


const assets = require('../assets/tags.json');

const MAXDISTANCE = 40;
const MINDISTANCE = 1;

  const FilterDeal = ({ onClose }) => {
    const { session } = useContext(SessionContext);
    const { userData } = session || {};

    const [sliderValue, setSliderValue] = useState(userData.proximityValue !== undefined ? userData.proximityValue : MAXDISTANCE);
    const [initialValue, setInitialValue] = useState(userData.proximityValue !== undefined ? userData.proximityValue : MAXDISTANCE);
    const [proximitySort, setProximitySort] = useState(userData.proximitySort !== undefined ? userData.proximitySort : false);


    
  
    const handleClose = async () => {
        const userId = auth.currentUser.uid;
        const userDoc = doc(db, 'users', userId);
      
        let updates = {};
      
        if (sliderValue !== initialValue) {
          updates.proximityValue = sliderValue;
        }
      
        if (typeof userData.proximitySort === "undefined" || userData.proximitySort !== proximitySort) {
          updates.proximitySort = proximitySort;
        }
      
        if (Object.keys(updates).length > 0) {
          await setDoc(userDoc, updates, { merge: true });
          userData.proximitySort = proximitySort;
          userData.proximityValue = sliderValue;
        }
      
        if (!userData.proximityValue) {
          userData.proximityValue = 40;
        }
        
      
        onClose();
      }
      
      
  
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Save</Text>
          </TouchableOpacity>
      
          <Text style={styles.proximityLabel}>Proximity Filter</Text>
            <View style={[styles.filterContainer, !proximitySort && {backgroundColor: '#E0E0E0'}]}>
                <Text style={[styles.filterTitle, !proximitySort && {color: 'lightgrey'}]}>Up to {sliderValue} kilometers away</Text>

                <Slider
                    style={styles.slider}
                    minimumValue={MINDISTANCE}
                    maximumValue={MAXDISTANCE}
                    step={1}
                    value={sliderValue}
                    onValueChange={value => setSliderValue(value)}
                    thumbTintColor={proximitySort ? "rgb(81,150,116)" : "lightgrey"}
                    minimumTrackTintColor={proximitySort ? "rgb(81,150,116)" : "lightgrey"}
                    maximumTrackTintColor={proximitySort ? "lightgrey" : "#D0D0D0"}
                    disabled={!proximitySort}
                />

                <View style={styles.proximitySortContainer}>
                    <Text style={[styles.proximitySortText, !proximitySort && {color: 'lightgrey'}]}>Toggle proximity filter on deals</Text>
                    <Switch
                        style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                        trackColor={{ false: "lightgrey", true: "rgb(81,150,116)" }}
                        thumbColor={"white"}
                        onValueChange={() => setProximitySort(!proximitySort)}
                        value={proximitySort}
                    />
                </View>
            </View>
          <View style={{ flex: 1 }} /> 
          <Text style={styles.version}>{assets.version}</Text>
        </View>
      );
  };
      const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#F8F8F8',
            padding: 10,
            justifyContent: 'space-between', 
          },
          
        closeButton: {
          alignSelf: 'flex-end',
          padding: 10,
          borderRadius: 15,
          backgroundColor: 'rgb(81,150,116)' 
        },
        closeButtonText: {
          color: 'white'
        },
        filterContainer: {
          marginTop: 5,
          padding: 10,
          borderColor: 'lightgrey',
          borderWidth: 1,
          borderRadius: 10,
          backgroundColor: 'white'
        },
        filterTitle: {
          fontSize: 22,
          fontWeight: '600',  
          color: 'darkgrey',
          textAlign: 'center',
          marginBottom: 10
        },
        proximitySortContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20
        },
        proximitySortText: {
          fontSize: 17,
          color: 'darkgrey'
        },
        proximityLabel: {
          fontSize: 16,
          fontWeight: '600',  
          color: 'darkgrey',
          marginBottom: 10
        },
        slider: {
          marginTop: 10
        },version:{
            color:"rgb(81,150, 116)",
            textAlign: 'center',
            marginBottom: 20,
            marginTop: 20,
          },
      });
      
      export default FilterDeal;
      