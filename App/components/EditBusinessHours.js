import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { doc, updateDoc } from '@firebase/firestore';
import { db } from '../firebase';


import Header from './Header';
import { SessionContext } from '../SessionContext';

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const copyIcon = require('./../assets/Copy-Icon.png')


const EditBusinessHours = ({ route, navigation }) => {
    const defaultBusinessHours = {
        "Monday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Tuesday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Wednesday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Thursday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Friday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Saturday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
        "Sunday": { "openTime": "CLOSED", "closeTime": "CLOSED" },
      };
  const { businessHours: initialBusinessHours } = route.params;
  const [newBusinessHours, setNewBusinessHours] = useState(initialBusinessHours || defaultBusinessHours);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [timeType, setTimeType] = useState(''); // 'open' or 'close'
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [daysToCopy, setDaysToCopy] = useState({});
  const { setSession, session } = useContext(SessionContext);
  const { userData } = session || {};
  const [defaultPickerTime, setDefaultPickerTime] = useState(new Date());

  const [refreshKey, setRefreshKey] = useState(0);

const forceRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
};


  useEffect(() => {
    Alert.alert(
      "Edit your business hours!", 
      "Manually pick the hours for each day\n\nOr select the green clock to set the hours as closed, and again to reopen\n\nSelect the far right square to copy that days hours to another day", 
      [{ text: "OK" }] 
    );
  }, []);

  useEffect(() => {
  }, [newBusinessHours])

  const showDatePicker = (day, type) => {
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0, 0); 
    setCurrentDay(day);
    setDefaultPickerTime(defaultTime);
    setTimeType(type);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  
  const handleCopyToSelectedDays = () => {
    const currentDayHours = newBusinessHours[currentDay];
    let updatedHours = { ...newBusinessHours };
    Object.keys(daysToCopy).forEach(day => {
      if (daysToCopy[day]) { 
        updatedHours[day] = {...currentDayHours};
      }
    });
  
    setNewBusinessHours(updatedHours); 
    setDaysToCopy({}); 
  };
  
  

  const handleConfirm = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    setNewBusinessHours(prevState => ({
      ...prevState,
      [currentDay]: {
        openTime: timeType==='open' ? time : prevState[currentDay].openTime,
        closeTime: timeType==='close' ? time : prevState[currentDay].closeTime
      }
    }));
    

    setNewBusinessHours(prevState => ({
      ...prevState,
      [currentDay]: {
        ...prevState[currentDay],
        [timeType]: time
      }
    }));

    hideDatePicker();
  };

  const toggleClosedState = (day) => {
    setNewBusinessHours(prevState => {
        const newState = { ...prevState };
        if (newState[day].openTime === "CLOSED") {
            newState[day] = { openTime: "09:00", closeTime: "17:00" }; 
        } else {
            newState[day] = { openTime: "CLOSED", closeTime: "CLOSED" };
        }
        return newState;
    });
};

const handleSaveBusinessHours = () => {
    const isValid = Object.values(newBusinessHours).every(({ openTime, closeTime }) =>
      (openTime === "CLOSED" && closeTime === "CLOSED") ||
      ((/^\d{2}:\d{2}$/).test(openTime) && (/^\d{2}:\d{2}$/).test(closeTime))
    );
  
    if (!isValid) {
      Alert.alert("Invalid Input", "Please enter valid business hours or mark as CLOSED.");
      return;
    }
    saveBusinessHoursToFirebase(newBusinessHours);
  };

  const saveBusinessHoursToFirebase = async (updatedHours) => {
    const restaurantRef = doc(db, 'restaurants', userData.email);
    try {
      await updateDoc(restaurantRef, { businessHours: updatedHours });
      Alert.alert("Success", "Business hours updated successfully.");
      const updatedUserData = { ...userData };
      updatedUserData.businessHours = updatedHours;
      setSession({ ...session, userData: updatedUserData });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating document:", error);
      Alert.alert("Error", "There was an error updating the business hours.");
    }
  };
  


return (
  <>
  <Header />
    <ScrollView style={styles.scrollView}>
      
      <Text style={styles.header}>Edit Business Hours</Text>
      {dayOrder.map(day => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View style={styles.timeContainer} >
            <TouchableOpacity
              onPress={() => showDatePicker(day, 'open')}
              style={styles.timeButton}
              disabled={newBusinessHours[day]?.openTime === 'CLOSED' ? true : false}
            >
              <Text style={styles.timeText} >
                {newBusinessHours[day]?.openTime || 'Open Time'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.toText}>to</Text>
            <TouchableOpacity
              onPress={() => showDatePicker(day, 'close')}
              style={styles.timeButton}
              disabled={newBusinessHours[day]?.closeTime === 'CLOSED' ? true : false}
            >
              <Text style={styles.timeText}>
                {newBusinessHours[day]?.closeTime || 'Close Time'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleClosedState(day)}
              style={styles.closedButton}
            >
              <MaterialCommunityIcons
                name={newBusinessHours[day]?.openTime === "CLOSED" ? "office-building" : "clock-outline"}
                size={24}
                color={newBusinessHours[day]?.openTime === "CLOSED" ? "red" : "green"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setCurrentDay(day);
                setCopyModalVisible(true);
              }}
              style={styles.copyButton}
            >
              <Image source={copyIcon} style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
          
        </View>
      ))}
      <Modal
        animationType="slide"
        transparent={true}
        visible={copyModalVisible}
        onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setCopyModalVisible(!copyModalVisible);
        }}
        >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Copy {currentDay}'s hours to the following days:</Text>
            <ScrollView style={{width: '100%'}}>
                {dayOrder.map((day) => (
                <View key={day} style={styles.modalItem}>
                    <Text style={styles.modalText}>{day}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "rgb(81,150, 116)" }}
                        thumbColor={daysToCopy[day] ? "#f4f3f4" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(newValue) => setDaysToCopy(current => ({ ...current, [day]: newValue }))}
                        value={!!daysToCopy[day]}
                        />
                </View>
                ))}
            </ScrollView>
            <View style={styles.modalButtons}>
                <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setCopyModalVisible(!copyModalVisible)}
                >
                <Text style={styles.textStyleClose}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={() => {
                    handleCopyToSelectedDays();
                    setCopyModalVisible(!copyModalVisible);
                    Alert.alert("Business hours copied successfully.");
                }}
                >
                <Text style={styles.textStyle}>Confirm</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>
        <View style={styles.confirmationButtonsContainer}>
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => Alert.alert("Confirmation", "Are you sure you want to discard changes?", [
                { text: "No" },
                { text: "Yes", onPress: () => navigation.goBack() }
                ])}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSaveBusinessHours}
            >
                <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            </View>
            <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="time"
                    date={defaultPickerTime}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                  />

    </ScrollView>
    </>
  );
  
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#e7e7e7',
    borderRadius: 5,
  },
  timeText: {
    fontWeight: 'bold',
  },
  toText: {
    marginHorizontal: 5,
  },
  closedButton: {
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  
  modalView: {
    margin: 20,
    width: '90%', 
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonClose: {
    backgroundColor: "white",
    borderColor: "rgb(81,150, 116)", 
    borderWidth: 1,
    color: "rgb(81,150, 116)",
  },
  buttonSave: {
    backgroundColor: "rgb(81,150, 116)", 
    borderColor: "rgb(81,150, 116)", 
    borderWidth: 1, 
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyleClose: {
    color: "rgb(81,150, 116)",
    fontWeight: "bold",
    textAlign: "center",
  },
  copyButton: {
    marginLeft: 10,
    backgroundColor: '#e7e7e7',
    padding: 10,
    borderRadius: 5,
  },
  iconStyle: {
    width: 20,  
    height: 20, 
    resizeMode: 'contain', 
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    fontSize: 22,
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "white",
    borderColor: "rgb(81,150, 116)",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "rgb(81,150, 116)", 
  },
  confirmButton: {
    backgroundColor: "rgb(81,150, 116)", 
    borderColor: "rgb(81,150, 116)",
    borderWidth: 1,
  },
  confirmButtonText: {
    color: "white", 
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '40%', 
    alignItems: 'center',
  },
  
});

export default EditBusinessHours;
