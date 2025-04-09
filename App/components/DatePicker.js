import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, SafeAreaView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({ label, date, setDate, stylesView, borderColour }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());

  const onChange = (event, selectedDate) => {
    console.log(stylesView)
    const currentDate = selectedDate || date;
    Platform.OS === 'ios' ? setTempDate(currentDate) : setDate(currentDate);
    if (Platform.OS === 'android') {
      setModalVisible(false); 
    }
  };

  const confirmDate = () => { // iOS only
    setDate(tempDate);
    setModalVisible(false);
  };

  const openDatePicker = () => { // Android or iOS
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={stylesView ? stylesView : styles.label}>{label}</Text>
      <TouchableOpacity onPress={openDatePicker}>
        <Image source={require('../assets/calendar.png')} style={styles.image} />
      </TouchableOpacity>
      {date ? <Text style={styles.dateText}>{date.toDateString()}</Text> : <Text style={styles.dateText}>← Tap the Calendar to choose</Text>}

      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalView}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline" // This setting applies to iOS only
                textColor="rgb(81,150, 116)"
                accentColor='rgb(81,150, 116)'
                onChange={onChange}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={confirmDate}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {Platform.OS === 'android' && modalVisible && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'lightgrey',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1,
    borderBottomWidth: 0.5,
    height: 50,
    paddingLeft: 10,
  },
  label: {
    marginRight: 8,
    color: "darkgrey",
    padding: 5,
  },
  dateText: {
    marginLeft: 8,
    color: "rgb(81,150, 116)"
  },
  image: {
    width: 40,
    height: 40
  },
  modalContainer: Platform.OS === 'ios' ? {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } : {},
  modalView: Platform.OS === 'ios' ? {
    margin: 20,
    backgroundColor: 'rgba(65,65,65,1)',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } : {},
  modalButtonContainer: Platform.OS === 'ios' ? {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  } : {},
  button: Platform.OS === 'ios' ? {
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgb(81,150, 116)',
    borderRadius: 5,
  } : {},
  buttonText: Platform.OS === 'ios' ? {
    color: 'rgb(81,150, 116)',
  } : {},
});

export default DatePicker;
