import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Image, Alert, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import DatePicker from './DatePicker';
import * as ImagePicker from 'expo-image-picker';
import { SessionContext } from '../SessionContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "@firebase/storage";
import { getApps, initializeApp } from "@firebase/app";
import { collection, addDoc } from "@firebase/firestore";
import { auth, db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';
import { getImagePath } from '../utils';
import Tooltip from 'react-native-walkthrough-tooltip';

import * as amplitude from '@amplitude/analytics-react-native';

import Header from './Header';


import liveIcon from '../assets/Icons/Live-Deal.png';
import heartFilledImage from '../assets/heart-filled.png';
const assets = require('./../assets/tags.json');
const cfg = require('./../cfg/cfg');

let app;
if (getApps().length === 0) {
  app = initializeApp(cfg.firebase);
} else {
  app = getApps()[0];
}

const AddDeal = () => {
  const navigation = useNavigation();

  const { session, setSession, restaurantDeals, setRestaurantDeals } = useContext(SessionContext);
  const { userData } = session || {};
  const [isLoading, setIsLoading] = useState(false);

  const [dealTitle, setDealTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [image, setImage] = useState(null);
  const [dealTypes, setDealTypes] = useState({ food: false, drink: false, event: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [recurringDeal, setRecurringDeal] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDays, setSelectedDays] = useState({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });


  const [toolTipDealIdentifierVisible, setToolTipDealIdentifierVisible] = useState(false);
  const [toolTipDealDatesVisible, setToolTipDealDatesVisible] = useState(false);
  const [toolTipDealTagsVisible, setToolTipDealTagsVisible] = useState(false);
  const [toolTipDealImageVisible, setToolTipDealImageVisible] = useState(false);
  const [toolTipVisible, setToolTipVisible] = useState(false);


  const isTitleValid = (title) => {
    return title.length <= 100 && title.length > 0;
  };

  const isStartDateValid = (startDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return startDate >= now;
  };

  const isEndDateValid = (startDate, endDate) => {
    return endDate >= startDate;
  };

  const isDescriptionValid = (description) => {
    return description.length <= 250 && description.length > 0;
  };

  const isTermsValid = (terms) => {
    return terms.length <= 250 && terms.length > 0;
  };

  const isTagsValid = (tags) => {
    return tags.length <= 3;
  };

  const handleDaySelection = (day) => {
    setSelectedDays(prevState => ({ ...prevState, [day]: !prevState[day] }));
  };

  const onSelectedTagsChange = (selectedTags1) => {

    if (selectedTags1.length <= 3) {
      setSelectedTags(selectedTags1);
    } else {
      Alert.alert('You can only select up to 3 tags');
    }
  };


  const onSelectedTypesChange = (selectedTypes1) => {

    setSelectedTypes(selectedTypes1);

  };


  const formatMySQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); 
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16,9],
      quality: 0.6,
    });

    if (result.assets && result.assets.length > 0) {
      const imageAsset = result.assets[0]; 
      const splitURI = imageAsset.uri.split('.');
      const fileType = splitURI[splitURI.length - 1];

      if (!imageAsset.cancelled && (fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg')) {
        setImage(imageAsset.uri);
      } else {
        alert('Please select a PNG or JPEG file');
      }
    }
  };

  function formatLocation(location) {
    const parts = location.split(',');

    if (parts.length < 2) {
      return location;
    }

    const street = parts[0].trim();
    const city = parts[1].trim();
  
    return `${street}, ${city}`;
  }


  const handleAddDeal = async () => {
    setIsLoading(true);


    if (!isTitleValid(dealTitle)) {
      Alert.alert('Title must be 100 characters or less');
      setIsLoading(false);
      return;
    }

    if (!isStartDateValid(startDate)) {
      Alert.alert('Start date must not be earlier than today');
      setIsLoading(false);
      return;
    }

    if (!isEndDateValid(startDate, endDate)) {
      Alert.alert('End date must not be earlier than start date');
      setIsLoading(false);
      return;
    }

    if (!isDescriptionValid(dealDescription)) {
      Alert.alert('Description must be 250 characters or less');
      setIsLoading(false);
      return;
    }

    if (!isTermsValid(termsAndConditions)) {
      Alert.alert('Terms and conditions must be 250 characters or less');
      setIsLoading(false);
      return;
    }

    if (!image) {
      Alert.alert('You must supply an image for your deal');
      setIsLoading(false);
      return
    }

    if (selectedTypes.length === 0) {
      Alert.alert('You must select at least one deal type');
      setIsLoading(false);
      return;
    }

    if (!isTagsValid(selectedTags)) {
      Alert.alert('You can select up to 3 tags only');
      setIsLoading(false);
      return;
    }

    if (recurringDeal) {
      if (Object.values(selectedDays).every(day => !day)) {
        Alert.alert('Error', 'At least one day must be selected for recurring deals');
        return;
      }
      if (!recurrencePattern) {
        Alert.alert('Error', 'Please select a recurrence pattern for recurring deals');
        return;
      }
    }

    let blob;
    try {
      const response = await fetch(image);
      blob = await response.blob();
    } catch (e) {
      Alert.alert('An error occurred while fetching the image file');
      setIsLoading(false);
      return;
    }

    const uuid = uuidv4();
    let imageName = (userData.email + "_" + uuid).replace(/[^a-z0-9]/gi, '_').toLowerCase();

    let storage = getStorage(app);
    let storageRef = ref(storage, "images/" + imageName);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed',
      (snapshot) => {
      },
      (error) => {
        Alert.alert('An error occurred while uploading the image');
        setIsLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const formattedStartDate = formatMySQLDate(startDate);
          const formattedEndDate = formatMySQLDate(endDate);

          const newDeal = {
            email: userData.email,
            restName: userData.restaurant_name,
            dealTitle: dealTitle,
            startDate: formattedStartDate,
            location: userData.location,
            endDate: formattedEndDate,
            dealDescription: dealDescription,
            terms: termsAndConditions,
            image: downloadURL,
            tags: selectedTags,
            dealTypes: selectedTypes,
            recurringDeal: recurringDeal,
            recurrencePattern: recurrencePattern,
            recurrenceDays: selectedDays,
          };

          addDoc(collection(db, 'restaurant_deals'), newDeal)
            .then((docRef) => {
              amplitude.logEvent("Create Deal - Add Deal", {
                dealTitle: dealTitle,
                restaurantName: userData.restaurant_name
              });


              Alert.alert("Success", 'Deal added successfully');
              const dealWithID = { ...newDeal, id: docRef.id, imagePath: image };


              setRestaurantDeals([...restaurantDeals, dealWithID])
              navigation.goBack();
              setIsLoading(false);
            })
            .catch((error) => {
              Alert.alert('An error occurred while creating the deal');
              setIsLoading(false);
            });

        }).catch((error) => {
          Alert.alert('An error occurred while getting the download URL');
          setIsLoading(false);
        });
      }
    );
  };

  const data = [
    { type: 'header', title: 'Deal Builder' },
    {
      type: 'group',
      label: 'Deal Identifiers',
      helpTitles: ['Deal Name','Deal Description', 'Terms & Conditions'],
      helpContent: ['Enter a name for your deal, this will be shown to all the users. No need to include the date, We will get to that later.','Enter a general description of your deal. What does it include? This part is the main information shown on individual deal pages.', 'Enter the terms for your deal. Is a drink required? Do customer need to be of legal age?' ],
      setter: setToolTipDealIdentifierVisible,
      getter: toolTipDealIdentifierVisible,
      items: [
        { type: 'textInput', placeholder: "Deal Name", onChangeText: setDealTitle, style: styles.textInput },
        { type: 'textInput', placeholder: "Deal Description", onChangeText: setDealDescription, style: styles.textInputLarge },
        { type: 'textInput', placeholder: "Terms & Conditions", onChangeText: setTermsAndConditions, style: styles.textInputLarge },
      ],
    },

    {
      type: 'group',
      label: 'Deal Dates & Recurrence',
      helpTitles: ['Start',
                    'End',
                    'Recurring Deal',
                    ''],
      helpContent: ['Enter the starting date for your deal. This is the date that your deal will start showing up to users. Tap the green calandar to get started!',
                    'Enter the end date for your deal. This is the date where your deal will stop being shown to users. Tap the green calandar to get it finished!',
                    'Only tap this if your deal is live on a specific day or set of days. If your deal is live everyday within the range specified above, then there is no need to check this.',
                    'If your deal is a "reccuring" deal, (that is, its only live on a specific set of days) then select the days that the deal will be live, then select one of our 3 patterns. The most common is weekly, for example, Tuesday Wing special.'],
      setter: setToolTipDealDatesVisible,
      getter: toolTipDealDatesVisible,
      items: [
        { type: 'datePicker', label: 'Start: ', date: startDate, setDate: setStartDate },
        { type: 'datePicker', label: 'End:   ', date: endDate, setDate: setEndDate },
        { type: 'recurringDeal', recurringDeal, handleDaySelection, selectedDays, recurrencePattern, setRecurrencePattern, setModalVisible, modalVisible },
      ],
    },
    {
      type: 'group',
      label: 'Deal Types and Tags',
      helpTitles: ['Deal Type',
                    'Deal Tags',
                    ''],
      helpContent: ['Enter the type of your deal. You must select at least 1',
                    'Select up to 3 tags that best represent your deal.',
                    'Deals with misleading types/tags will be flagged and may be removed'],
      setter: setToolTipDealTagsVisible,
      getter: toolTipDealTagsVisible,
      items: [
        { type: 'multiSelect', items: assets.addDealTypes, selectedItems: selectedTypes, onSelectedItemsChange: onSelectedTypesChange, selectText: 'Deal Type', submitText: "Add Types", style: { borderWidth: 1, borderColor: "lightgrey", padding: 5, height: 55, marginBottom: 0, borderBottomWidth: 0.1 } },
        { type: 'multiSelect', items: assets.addDealTags, selectedItems: selectedTags, onSelectedItemsChange: onSelectedTagsChange, selectText: 'Deal Tags (Optional)', submitText: "Add Tags", style: { borderWidth: 1, borderColor: "lightgrey", padding: 5, height: 55 } },
      ],
    },

    {
      type: 'group',
      label: 'Deal Image',
      helpTitles: ['Image', ''],
      helpContent: ['Please upload an image for your deal which will be shown to users.',
                    'Once you select an image, it will appear below as users would see it. Tap again if you would like to edit.'],
      setter: setToolTipDealImageVisible,
      getter: toolTipDealImageVisible,
      items: [
        { type: 'imagePicker', image, pickImage },
      ],
    },

    { type: 'addButton', handleAddDeal, isLoading }
  ];

  const renderSubItem = (item, index) => {
    switch (item.type) {
      case 'textInput':
        return (
          <TextInput
            key={index}
            style={[item.style, { color: 'black' }]}
            placeholder={item.placeholder}
            onChangeText={item.onChangeText}
            multiline={true}
            textAlignVertical='top'
          />
        );

      case 'datePicker':
        return (
          <DatePicker
            label={item.label}
            date={item.date}
            setDate={item.setDate}
            key={index}
          />
        );
      case 'recurringDeal':
        return (

          <View key={index}>
            <View>
              <TouchableOpacity onPress={() => setRecurringDeal(!recurringDeal)} style={styles.touchableContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={recurringDeal}
                  color={recurringDeal ? "rgb(81,150, 116)" : '#ccc'}
                />
                <Text style={styles.label}>Recurring Deal</Text>
              </TouchableOpacity>
            </View>

            {recurringDeal && (
              <View>
                <Text style={styles.labelRec}>Select Days</Text>
                {Object.keys(selectedDays).map((day, index) => (
                  <TouchableOpacity key={index} onPress={() => handleDaySelection(day)} style={styles.touchableContainer}>
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        style={styles.checkbox}
                        value={selectedDays[day]}
                        color={selectedDays[day] ? "rgb(81,150, 116)" : '#ccc'}
                      />
                      <Text style={styles.label}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                ))}




                <Text style={styles.labelRec}>Recurrence Pattern</Text>

                <TouchableOpacity style={styles.touchableContainerRecurrence} onPress={() => setModalVisible(true)}>
                  <Text style={styles.recurrencePattern}>{recurrencePattern || 'Select a recurrence'}</Text>
                </TouchableOpacity>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.pickerModal}>
                    <View style={styles.pickerWrapper}>

                      {/* Close button */}
                      <TouchableOpacity style={styles.closeButtonContainer} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>X</Text>
                      </TouchableOpacity>

                      <Picker
                        selectedValue={recurrencePattern || "placeholder"}
                        style={{ width: '100%' }}
                        onValueChange={(itemValue) => {
                          if (itemValue !== "placeholder") {
                            setRecurrencePattern(itemValue);
                            setModalVisible(false);
                          }
                        }}
                      >
                        <Picker.Item label="Select an option" value="placeholder" />
                        <Picker.Item label="Weekly" value="Weekly" />
                        <Picker.Item label="Biweekly" value="Biweekly" />
                        <Picker.Item label="Monthly" value="Monthly" />
                      </Picker>
                    </View>
                  </View>
                </Modal>

              </View>
            )}
          </View>
        );

      case 'multiSelect':
        return (
          <MultiSelect
            key={index}
            hideTags
            items={item.items}
            uniqueKey={item.selectText === 'Deal Type' ? "dbName" : "name"}
            onSelectedItemsChange={item.onSelectedItemsChange}
            selectedItems={item.selectedItems}
            selectText={item.selectText}
            searchInputPlaceholderText=""
            onChangeInput={(text) => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="darkgrey"
            selectedItemTextColor="rgb(81,150, 116)"
            selectedItemIconColor="rgb(81,150, 116)"
            itemTextColor="darkgrey"
            displayKey="name"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="rgb(81,150, 116)"
            submitButtonText={item.submitText}
            textInputProps={{ editable: false, autoFocus: false }}
            searchIcon={false}
            styleDropdownMenu={item.style}
          />
        );

      case 'imagePicker':
        return (
          <TouchableOpacity style={styles.group} onPress={pickImage} key={index}>
            <View style={styles.imagePickerButton}>
              <Text style={styles.imglabel}>Upload an Image</Text>
              <Image source={require('../assets/upload.png')} />
            </View>
            {image && 
            <View style={styles.dealContainer}>

            <View
              style={styles.touchableArea}
            >
              <Image
                source={{ uri: image }}
                style={styles.dealImage}
              />
              <View style={styles.restaurantNameContainer}>
    
              <Text style={styles.restaurantName}>
                {userData.restaurant_name}
                {' - 1.0KM away'}
              </Text>
    
              </View>
              <View style={styles.dealTitleContainer}>
    
                <Image source={liveIcon} style={styles.liveIcon} />
              </View>
              <View
                style={styles.heartButton}
              >
                <Image
                  source={heartFilledImage}
                  style={styles.heartImage}
                />
              </View>
    
            </View>
            <Text style={styles.dealTitle}>{ dealTitle ? dealTitle : "Deal Title"}</Text>
            <Text style={styles.restAddress}>{userData.location ? formatLocation(userData.location) : "123 Way"}</Text>
              <View style={styles.buttonContent}>
                <Image source={require('../assets/Icons/greenDirections4.png')} style={styles.directionIcon} />
              </View>
          </View>
            
            
}
          </TouchableOpacity>
        );
    }

  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'group':
        return (
          <View style={styles.group}>
          <TouchableOpacity onPress={() => item.setter(true)}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Image
                source={require('../assets/Help-Icon.png')}
                style={styles.helpIcon}
              />
            </View>
          </TouchableOpacity>

          {/* Modal for displaying help content */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={item.getter}
            onRequestClose={() => {
              item.setter(false);
            }}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPressOut={() => item.setter(false)} // Changed to onPressOut for better usability
            >
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                {/* Close Button in the top right corner */}
                <TouchableOpacity onPress={() => item.setter(false)} style={styles.closeButtonContainer}>
                  <Text style={styles.closeButton}>×</Text> 
                </TouchableOpacity>
                {/* Tooltip Content */}
                <View style={styles.tooltipContentContainer}>
                  {item.helpTitles.map((title, index) => (
                    <View key={title} style={styles.tooltipSection}>
                      <Text style={styles.tooltipTitle}>{title}</Text>
                      <Text style={styles.tooltipText}>{item.helpContent[index]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>






          {item.items.map((subItem, index) => renderSubItem(subItem, index))}
        </View>
      );
      // ..
      case 'header':
        return (
          <View style={styles.group}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        );

      case 'textInput':
        return (
          <TextInput
            style={styles.textInput}
            placeholder={item.placeholder}
            onChangeText={text => item.setValue(text)}
            value={item.value}
          />
        );

      case 'addButton':
        return (
          <View style={{ marginBottom: 150 }}>
            <TouchableOpacity style={styles.addButton} onPress={item.handleAddDeal} disabled={item.isLoading}>
              <Text style={styles.addButtonText}>Add Deal</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };





  return (
    <View style={styles.container}>
      <Header />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </KeyboardAvoidingView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  group: {
    margin: 5,
    padding: 0,
    marginTop: 15

  },
  header: {
    height: 120,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    padding: 45, 
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,

  },
  recur: {
    color: "white",
    borderColor: "rgb(81,150, 116)",
    backgroundColor: "rgb(81,150, 116)",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 5,
    color: "rgb(81,150, 116)"
  },
  label: {
    color: 'grey',
    textAlign: 'left',
    marginTop: 5,
  },
  labelRec: {
    color: 'grey',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  recurrencePattern: {
    color: 'grey',
    textAlign: 'left',
    marginTop: 5,
    textAlign: 'center'
  },
  textInput: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 1,
    marginBottom: 0,
    borderBottomWidth: 0.5,
    height: 50,
    paddingLeft: 10,
    color: "lightgrey"
  },
  textInputLarge: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 1,
    marginBottom: 0,
    borderBottomWidth: 0.5,
    height: 150,
    paddingLeft: 10,
    color: "lightgrey"
  },
  recurring: {
    color: "#B2B2B2"
  },
  addButton: {
    backgroundColor: "rgb(81,150, 116)",
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 20,
    marginBottom: 75,
    marginTop: 20 
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  }, imagePickerButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
  },
  touchableContainer: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 1,
    marginBottom: 0,
    borderBottomWidth: 0.5,
    height: 50,
    paddingLeft: 10,
    color: "lightgrey",
    flexDirection: 'row',
    paddingTop: 10,
  },
  touchableContainerRecurrence: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 1,
    marginBottom: 0,
    borderBottomWidth: 0.5,
    height: 50,
    color: "lightgrey",
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white'

  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white'
  },
  checkbox: {
    marginRight: 8,
    marginTop: 4,
    marginLeft: 10
  },
  imglabel: {
    color: "rgb(81,150, 116)"
  },
  pickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },

  pickerWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectionBox: {
    borderWidth: 1,
    borderColor: "rgb(81,150, 116)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
    alignItems: 'center',
    width: 150,
    backgroundColor: "rgb(81,150, 116)",
  },
  MainContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 20,

  },

  text: {
    padding: 2,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black'
  },
  imagePickerButton: {
    borderColor: "lightgrey",
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,

  },
  closeButtonContainer: {
    position: 'absolute', 
    top: 5,            
    right: 5,      
    backgroundColor: 'white',
    borderRadius: 20,  
    padding: 10,       
    width: 40,        
    height: 40,
    alignItems: 'center', 
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
},
labelContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
helpIcon: {
  width: 20,
  height: 20,
  marginLeft: 5,
},
helpText: {
  fontSize: 16,
  color: '#555555',
  textAlign: 'left',
},
tooltipContainer: {

  maxWidth: 300,
  maxHeight: 200, 
  borderRadius: 6,
  borderColor: "purple",
  padding: 10,
  backgroundColor: '#EEEEEE',
},
tooltipStyle: {
  backgroundColor: '#EEEEEE',
  borderRadius: 8,
  shadowColor: '#555555',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 6,
},
arrowStyle: {
  borderTopColor: '#EEEEEE',
},
backgroundStyle: {
  backgroundColor: 'rgba(85, 85, 85, 0.7)',
},
contentStyle: {
  backgroundColor: '#EEEEEE',
  borderRadius: 8,
},
sectionContainer: {
  maxWidth: '100%', 
  marginBottom: 10,
},
titleText: {
  fontWeight: 'bold',
  textDecorationLine: 'underline',
  color: 'rgb(81,150, 116)', 
  fontSize: 18,
  marginBottom: 4,
},
contentText: {
  fontSize: 16,
  color: '#333', 
  flexShrink: 1,
},
tooltipContentContainer: {
  backgroundColor: '#FFF',
  borderColor: 'rgb(81,150, 116)',
  borderWidth: 1,
  borderRadius: 8,
  padding: 10,
},
tooltipSection: {
  marginBottom: 10,
},
tooltipTitle: {
  fontWeight: 'bold',
  color: 'rgb(81,150, 116)',
  fontSize: 18,
},
tooltipText: {
  color: '#333',
  fontSize: 16,
},


dealContainer: {
  backgroundColor: 'rgba(65,65,65,1)',
  borderRadius: 5,
},
touchableArea: {
  borderRadius: 10,
  marginTop: 5,
},
dealImage: {
  width: '100%',
  height: 200,
},
directionIcon: {
  height: 40,
  width: 40,
},
restaurantNameContainer: {
  position: 'absolute',
  top: 10,
  left: 5,
  backgroundColor: 'rgb(81,150, 116)',
  padding: 5,
  borderRadius: 5,
},
restaurantName: {
  color: 'white',
  fontWeight: 'bold'
},
dealTitleContainer: {
  position: 'absolute',
  bottom: 10,
  left: 0,
  right: 0,
  padding: 5,
  marginHorizontal: 10,

},
dealTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'left',
  marginLeft: 10,
  marginTop: 12,
},
restAddress: {
  marginLeft: 10,
  fontSize: 14,
  color: 'lightgrey',
  marginTop: 5,
  fontWeight: 'bold',
},
heartButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  width: 24,
  height: 24,
},
heartImage: {
  width: '100%',
  height: '100%',
},
liveIcon: {
  position: 'absolute',
  right: 5,
  bottom: 5,
  width: 60,
  height: 20,
},
buttonContent: {
  position: 'absolute',
  bottom: 40,
  right: 40,
  width: 10,
  height: 10
},
closeButtonContainer: {
  position: 'absolute',
  right: 5,
  top: 5, 
  backgroundColor: 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
},
closeButton: {
  fontSize: 24,
  color: 'black',
  fontWeight: 'bold',
  marginLeft: 15
},
modalContent: {
  margin: 20,
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 20, 
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  width: '80%',
},
modalContainer: {
  flex: 1,
  justifyContent: 'center', 
  alignItems: 'center', 
  paddingTop: 0, 
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
}

  


});

export default AddDeal;