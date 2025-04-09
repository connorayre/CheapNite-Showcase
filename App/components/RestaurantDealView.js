import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, FlatList, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, deleteDoc } from "@firebase/firestore";
import { db } from '../firebase';
import { getStorage, ref, deleteObject } from "@firebase/storage";
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import Header from './Header';
import { TextInput, Button } from 'react-native-paper';
import DatePicker from './DatePicker';
import MultiSelect from 'react-native-multiple-select';
import { SessionContext } from '../SessionContext';

const companyLogo = require('../assets/company-logo-white.png');
const assets = require('./../assets/tags.json');

const RestaurantDealView = ({ route, updateDeal }) => {
  const { deal } = route.params;
  const navigation = useNavigation();
  const getThemeForItem = (label) => ({
    colors: {
      primary: label === 'Title' ? 'lightgrey' : 'lightgrey',
      text: 'lightgrey',
      placeholder: 'lightgrey',
      background: 'white',
    },
  });

  const { restaurantDeals, setRestaurantDeals } = useContext(SessionContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editableDeal, setEditableDeal] = useState({ ...deal });
  const [startDate, setStartDate] = useState(deal.startDate ? new Date(deal.startDate) : new Date());
  const [endDate, setEndDate] = useState(deal.endDate ? new Date(deal.endDate) : new Date());
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recurringDeal, setRecurringDeal] = useState(editableDeal.recurringDeal || false);
  const [selectedDays, setSelectedDays] = useState(editableDeal.recurrenceDays || {
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [recurrencePattern, setRecurrencePattern] = useState(editableDeal.recurrencePattern || 'Select a recurrence');
  const [modalVisible, setModalVisible] = useState(false);

  const drinkLabels = {drink: "Drink",food:"Food",event:"Event"};

  const deleteDeal = async (dealId) => {
    try {
      const dealRef = doc(db, 'restaurant_deals', dealId);
      await deleteDoc(dealRef);
    } catch (error) {
    }
  };

  const deleteImage = async (imageName) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageName);
      await deleteObject(imageRef);
    } catch (error) {
    }
  };

  const getImageNameFromUrl = (url) => {
    const partsWithoutQuery = url.split("?")[0];
    const pathParts = partsWithoutQuery.split("/");
    return decodeURIComponent(pathParts[pathParts.length - 1]);
  };
  const onDelete = (dealId, imageUrl) => {
    Alert.alert(
      "Delete Deal",
      "Are you sure you want to delete this deal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const imageName = getImageNameFromUrl(imageUrl);
              await deleteImage(imageName);
              await deleteDeal(dealId);
              Alert.alert("Success", "Your deal is gone forever");

              const updatedDeals = restaurantDeals.filter(currentDeal => currentDeal.id !== dealId);
              setRestaurantDeals(updatedDeals);

              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', "Sorry, we ran into a problem deleting your deal.\n\nPlease try again");
            }
          }
        }
      ]
    );
  };


  const handleDaySelection = (day) => {
    setSelectedDays(prevDays => ({
      ...prevDays,
      [day]: !prevDays[day]
    }));
  };

  const isTitleValid = (title) => {
    return title.length <= 100 && title.length > 0;
  };

  const isLocationValid = (location) => {
    return location.length <= 100 && location.length > 0;
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

  const isTypesValid = (types) => {
    return types.length > 0 && types.length <= 3;
  };

  const isDaysSelectedValid = (days) => {
    return Object.values(days).some(day => day === true); 
  };

  const isRecurrencePatternValid = (pattern) => {
    return !!pattern && pattern !== 'Select a recurrence';
  };

  const validateFields = () => {
    if (!isTitleValid(editableDeal.dealTitle)) {
      Alert.alert("Validation Error", "Title should be between 1 to 100 characters.");
      return false;
    }
    if (editableDeal.location) {
      if (!isLocationValid(editableDeal.location)) {
        Alert.alert("Validation Error", "Location should be between 1 to 100 characters.");
        return false;
      }
    }
    if (!startDate) {
      Alert.alert("Validation Error", "Start date should be today or a future date.");
      return false;
    }

    if (!isEndDateValid(startDate, endDate)) {
      Alert.alert("Validation Error", "End date should be equal or after the start date.");
      return false;
    }

    if (!isDescriptionValid(editableDeal.dealDescription)) {
      Alert.alert("Validation Error", "Description should be between 1 to 250 characters.");
      return false;
    }

    if (!isTermsValid(editableDeal.terms)) {
      Alert.alert("Validation Error", "Terms should be between 1 to 250 characters.");
      return false;
    }

    if (selectedTags && selectedTags.length > 0) {
      if (!isTagsValid(selectedTags)) {
        Alert.alert("Validation Error", "You can select up to 3 tags.");
        return false;
      }
    } else {
      if (!isTagsValid(editableDeal.tags)) {
        Alert.alert("Validation Error", "You can select up to 3 tags.");
        return false;
      }
    }
    if (selectedTypes && selectedTypes.length > 0) {
      if (!isTypesValid(selectedTypes)) {
        Alert.alert("Validation Error", "You must select at least 1 tag");
        return false;
      }
    } else {
      if (!isTypesValid(editableDeal.dealTypes)) {
        Alert.alert("Validation Error", "You must select at least 1 tag");
        return false;
      }
    }

    if (recurringDeal) {
      if (!isDaysSelectedValid(selectedDays)) {
        Alert.alert("Validation Error", "At least one day should be selected for a recurring deal.");
        return false;
      }

      if (!isRecurrencePatternValid(recurrencePattern)) {
        Alert.alert("Validation Error", "Please select a recurrence pattern for the recurring deal.");
        return false;
      }
    } else {
      setSelectedDays({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      });
      setRecurrencePattern("");
    }

    return true; 
  };


  const data = [
    {
      type: 'Image',
      data: editableDeal.imagePath,
      onPress: () => isEditing && navigation.navigate('EditDealPhoto', { dealId: editableDeal.id, currentImage: editableDeal.imagePath }),
    },    
    {
      type: 'TextInput',
      label: 'Title',
      data: editableDeal.dealTitle,
      onChange: (text) => setEditableDeal(prevDeal => ({ ...prevDeal, dealTitle: text })),
      disabled: !isEditing,
      disable: false
    },
    {
      type: 'TextInput',
      label: 'Description',
      data: editableDeal.dealDescription,
      onChange: (text) => setEditableDeal(prevDeal => ({ ...prevDeal, dealDescription: text })),
      disabled: !isEditing,
      disable: false
    },
    {
      type: 'TextInput',
      label: 'Terms',
      data: editableDeal.terms,
      onChange: (text) => setEditableDeal(prevDeal => ({ ...prevDeal, terms: text })),
      disabled: !isEditing,
      disable: false
    },
    {
      type: 'DatePicker',
      label: 'Start Date',
      date: startDate,
      setDate: setStartDate,
      data: editableDeal.startDate
    },
    {
      type: 'DatePicker',
      label: 'End Date  ',
      date: endDate,
      setDate: setEndDate,
      data: editableDeal.endDate
    },
    {
      type: 'RecurringDeal',
      data: editableDeal.recurringDeal
    },
    {
      type: 'MultiSelectType',
      label: 'Types',
      data: editableDeal.dealTypes
    },
    {
      type: 'MultiSelectTag',
      label: 'Tags',
      data: editableDeal.tags
    },
  ];


  const renderItem = ({ item, index }) => {
    switch (item.type) {
      case 'Image':
      return (
        <TouchableOpacity disabled={!isEditing} onPress={item.onPress}>
          <Image key={Date.now()} source={{ uri: (item.data + "?" + Math.random().toString(36)) }} style={styles.dealImage} />
        </TouchableOpacity>
      );

      case 'TextInput':
        if (isEditing) {
          return (
          <View>
            {
              item.label === 'Title' && (
                <Text style={{
                  fontSize: 20,
                  color: 'rgb(81,150, 116)',
                  textAlign: 'center',
                  marginTop: 50,
                  fontFamily: 'Arial', 
                }}>
                  Deal Identifiers
                </Text>
              )
            }
            <TextInput
              label={item.label}
              value={item.data}
              textColor="lightgrey"
              onChangeText={item.onChange}
              disabled={item.disable}
              outlineColor="lightgray" 
              activeOutlineColor="rgb(81,150, 116)"
              mode="outlined"
              theme={{
                colors: {
                      text: 'lightgray',
                   }
             }}
              style={[
                { 
                  backgroundColor: 'white',
                  borderColor: 'lightgray',
                  
                  color: 'lightgray',
                  marginBottom: item.label === 'Terms' ? 20 : 0,
                }
              ]}
              placeholderTextColor="lightgray"
            />

            </View>

          );
        }
        return (
          <View>
            <Text style={styles.label}>{item.label + ":"}</Text>
            <Text style={styles.value}>{item.data}</Text>
            <View style={styles.line}></View>
          </View>
        );
      case 'DatePicker':
        if (isEditing) {
          return (
            <View>
            {
              item.label === 'Start Date' && (
                <Text style={{
                  fontSize: 20,
                  color: 'rgb(81,150, 116)',
                  textAlign: 'center',
                  marginTop: 50, 
                  fontFamily: 'Arial', 
                }}>
                  Deal dates & reccurence
                </Text>
              )
            }
            <DatePicker
              label={item.label}
              date={item.date}
              setDate={item.setDate}
              style={styles.textInput}
            />
            </View>
          );
        }
        return (
          <View>
            <Text style={styles.label}>{item.label + ":"}</Text>
            <Text style={styles.value}>{item.data}</Text>
            <View style={styles.line}></View>
          </View>
        );
      case 'RecurringDeal':
        return (
          <View key={index}>
            {isEditing ? (
              <>
                <View>
                      <TouchableOpacity style={styles.checkboxContainerRec} onPress={() => setRecurringDeal(!recurringDeal)}>
                          <Checkbox
                              style={styles.checkbox}
                              value={recurringDeal}
                              color={recurringDeal ? "rgb(81,150, 116)" : '#ccc'}
                          />
                          <Text style={styles.labelCheck}>Recurring Deal</Text>
                      </TouchableOpacity>

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
                                      <Text style={styles.labelCheck}>{day}</Text>
                                  </View>
                              </TouchableOpacity>
                          ))}

                          <Text style={styles.labelRec}>Recurrence Pattern</Text>

                          <TouchableOpacity style={styles.touchableContainerRecurrence} onPress={() => setModalVisible(true)}>
                              <Text style={styles.recurrencePattern}>
                                  {recurrencePattern || 'Select a recurrence'}
                              </Text>
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

              </>
            ) : (
              <View>
                <Text style={styles.label}>Recurring Deal:</Text>
                <Text style={styles.value}>{editableDeal.recurringDeal ? "Yes" : "No"}</Text>
                <View style={styles.line}></View>

                {editableDeal.recurringDeal && (
                  <View>
                    <Text style={styles.label}>Selected Days:</Text>
                    {Object.keys(editableDeal.recurrenceDays).map((day, index) => (
                      editableDeal.recurrenceDays[day] && (
                        <Text key={index} style={styles.value}>{day}</Text>
                      )
                    ))}
                    <View style={styles.line}></View>

                    <Text style={styles.label}>Recurrence Pattern:</Text>
                    <Text style={styles.value}>{editableDeal.recurrencePattern}</Text>
                    <View style={styles.line}></View>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      case 'MultiSelectType':
        if (isEditing) {
          return (
         <View>
                <Text style={{
                  fontSize: 20, 
                  color: 'rgb(81,150, 116)', 
                  textAlign: 'center',
                  marginTop: 50, 
                  fontFamily: 'Arial', 
                }}>
                  Deal Types & Tags
                </Text>
              
            <MultiSelect
              nestedScrollEnabled={true}
              hideTags
              items={assets.addDealTypes}
              uniqueKey="dbName"
              onSelectedItemsChange={onSelectedTypesChange}
              selectedItems={selectedTypes}
              selectText="Deal Type"

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
              submitButtonText="Add Tags"
              textInputProps={{ editable: false, autoFocus: false }}
              searchIcon={false}
              styleDropdownMenu={{ borderWidth: 1, borderColor: "lightgrey", padding: 5, height: 55, marginBottom: 0, borderBottomWidth: 0.1 }}
              styleDropdownMenuContent={{ height: 200 }}

            />
            </View>
          );
        }
        return (
          <View>
            <Text style={styles.text}>{item.label}</Text>
            {item.data.map(type => (
              <View style={styles.type} key={type}>
                <Text style={styles.typeText}>{drinkLabels[type]}</Text>
              </View>
            ))}
          </View>
        );
      case 'MultiSelectTag':
        if (isEditing) {
          return (
            <MultiSelect
              nestedScrollEnabled={true}
              hideTags
              items={assets.addDealTags}
              uniqueKey="name"
              onSelectedItemsChange={onSelectedTagsChange}
              selectedItems={selectedTags}
              selectText="Deal Tags"
              searchInputPlaceholderText="Search Tags Here..."
              onChangeInput={(text) => console.log(text)}
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#CCC"
              selectedItemTextColor="rgb(81,150, 116)"
              selectedItemIconColor="rgb(81,150, 116)"
              itemTextColor="darkgrey"
              displayKey="name"
              searchInputStyle={{ color: '#CCC' }}
              submitButtonColor="rgb(81,150, 116)"
              submitButtonText="Add Tags"
              textInputProps={{ autoFocus: false }}
              styleDropdownMenu={{ borderWidth: 1, borderColor: "lightgrey", padding: 5, height: 55 }}
              styleDropdownMenuContent={{ height: 200 }}
            />
          );
        }
        return (
          <View>
            <Text style={styles.text}>{item.label}</Text>
            {Array.isArray(item.data) && item.data.map(tag => (
              <View style={styles.tag} key={tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    setStartDate(deal.startDate ? new Date(deal.startDate) : new Date());
    setEndDate(deal.endDate ? new Date(deal.endDate) : new Date());
  }, [deal]);


  const onSelectedTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const onSelectedTypesChange = (types) => {
    setSelectedTypes(types);
  };

  const formatMySQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); 
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditableDeal({ ...deal });
    }
  };

  const handleSubmit = () => {
    if (validateFields()) {
      const updatedDeal = {
        ...editableDeal,
        startDate: formatMySQLDate(startDate),
        endDate: formatMySQLDate(endDate),

      };
      if (selectedTags) {
        if (selectedTags && selectedTags.length > 0) {
          updatedDeal.tags = selectedTags;
        }
      }
      if (selectedTypes) {
        if (selectedTypes && selectedTypes.length > 0) {
          updatedDeal.dealTypes = selectedTypes;
        }
      }
      if (recurringDeal) {
        updatedDeal.recurringDeal = recurringDeal;
        updatedDeal.recurrenceDays = selectedDays;
        updatedDeal.recurrencePattern = recurrencePattern;
      }
      else {
        updatedDeal.recurringDeal = false;
        updatedDeal.recurrenceDays = {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        }
        updatedDeal.recurrencePattern = "";
      }


      Alert.alert(
        "Update Deal",
        "Are you sure you want to update this deal?",
        [
          {
            text: "Cancel",
            onPress: () => { },
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {
              try {
                const dealRef = doc(db, 'restaurant_deals', editableDeal.id);
                await setDoc(dealRef, updatedDeal, { merge: true });

                const updatedRestaurantDeals = restaurantDeals.map(currentDeal => {
                  return currentDeal.id === deal.id ? editableDeal : currentDeal;
                });

                setRestaurantDeals(updatedRestaurantDeals);

                setEditableDeal(updatedDeal);
                setIsEditing(false);
                Alert.alert("Successfully edited your deal!");
                navigation.goBack();
              } catch (error) {
                Alert.alert('An error occurred while updating the deal');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Header />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(deal.id, deal.image)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {isEditing && 
        <Text style={styles.editImageTitle}>Tap the image to edit!</Text>
      }

      <FlatList
        data={data}
        renderItem={({ item, index }) => renderItem({ item, index })}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={() => (
          <>
            {isEditing &&
              <Button
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </Button>
            
            }
          </>
        )}
      />

      {isEditing && <View style={{ height: 25 }} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  recurrencePattern: {
    color: 'grey',
    textAlign: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 10,  
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'grey',
  },

  editButton: {
    backgroundColor: "rgb(81,150, 116)",
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '25%',
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentContainerWithBottomMargin: {
    flex: 1,
    padding: 16,
    marginBottom: 50, 
  },
  backArrow: {
    color: '#fff',
    fontSize: 28,
  },
  userLocation: {
    color: '#fff',
    fontSize: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  date: {
    color: '#fff',
    fontSize: 16,
  },
  dealImage: {
    width: '100%',
    height: 200,
  },
  location: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 8,
  },
  offerValid: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  dateRange: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  label: {
    fontSize: 18,       
    paddingBottom: 4,  
    color: "rgb(81,150, 116)",
    marginLeft: 5
  },
  labelCheck: {
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
  value: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
    marginBottom: 5
  },
  line: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    marginBottom: 5,  
    borderBottomWidth: 1,  
    borderBottomColor: 'lightgrey',  
    color: "rgb(81,150, 116)",
    marginLeft: 5
  },
  textValue: {
    fontSize: 16,
    marginBottom: 15,  
  },
  tag: {
    backgroundColor: "rgb(81,150, 116)",
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
    width: '25%',
    alignItems: 'center',
    color: "rgb(81,150, 116)",
    marginLeft: 15,
  },
  tagText: {
    fontSize: 14,
    color: 'white',

  },
  type: {
    backgroundColor: "rgb(81,150, 116)",
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
    width: '25%',
    alignItems: 'center',
    marginLeft: 15,


  },
  typeText: {
    fontSize: 14,
    color: 'white',

  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchableContainerRecurrence: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 1,
    marginBottom: 20,
    borderBottomWidth: 0.5,
    height: 50,
    color: "lightgrey",
    flexDirection: 'row',

    justifyContent: 'center',
      alignItems: 'center',
  },
  greyLine: {
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  greyLine: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 0,
  },

  deleteButton: {
    backgroundColor: "#333333",
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '25%',
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    marginRight: 5,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkbox: {
    marginRight: 8,
    marginTop: 4,
    marginLeft: 10
  },
  recurrencePattern: {
    color: 'grey',
    textAlign: 'left',
    marginTop: 5,
    textAlign: 'center'
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
checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  color: 'white'
  
},
checkboxContainerRec: {
  flexDirection: 'row',
  alignItems: 'center',
  color: 'white',
  marginTop: 10,
  marginBottom: 10,
  
},
submitButton: {
  backgroundColor: "rgb(81,150, 116)",
  marginTop: 20,
  marginLeft: 20,
  marginRight: 20,
  borderRadius: 5,
  paddingVertical: 10,
  paddingHorizontal: 20, 
  alignItems: 'center',
  justifyContent: 'center', 
  elevation: 3, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84, 
},
submitButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
editImageTitle: {
  textAlign: 'center',
  color: '#2e2e2e', 
  fontSize: 18, 
  fontWeight: 'bold',
  marginTop: 15, 
  fontFamily: 'Helvetica', 
  letterSpacing: 0.5,
},
textInput:{
  color: '#333333'
},
datePickerBorder:{
  color: '#333333'
}

});

export default RestaurantDealView;
