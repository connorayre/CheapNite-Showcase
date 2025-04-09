import React, { useState, useContext } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { MaterialIcons } from '@expo/vector-icons';
import { SessionContext } from '../SessionContext';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import { ScrollView } from 'react-native-gesture-handler';
import { auth, db } from '../firebase'; 
import { getStorage, ref, deleteObject } from '@firebase/storage';
import { getDocs, query, collection, where, doc, deleteDoc } from '@firebase/firestore';



const assets = require('./../assets/tags.json');

const SupportScreen = () => {
  const { session, setSession } = useContext(SessionContext);
  const { userData } = session || {};
  const [activeSections, setActiveSections] = useState([]);
  const faqData = assets.faq;
  const navigation = useNavigation();
  const toggleSection = index => {
    let active = [...activeSections];
    if (active.includes(index)) {
      active = active.filter(i => i !== index);
    } else {
      active.push(index);
    }
    setActiveSections(active);
  };

  const navigateToPrivacy = () => {
    navigation.navigate('PrivacyScreen');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account with us? All of your data will be deleted.\n\nThis move is permanent and cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (userData.type === 0) {
  
                const usersQuerySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', userData.email)));
                
                usersQuerySnapshot.forEach(async doc => {
                  await deleteDoc(doc.ref);
                });
  
                const userFavoritesDocRef = doc(db, 'user_favorites', userData.email);
                await deleteDoc(userFavoritesDocRef);
                
              } else if (userData.type === 1) {
                const dealsSnapshot = await getDocs(query(collection(db, 'restaurant_deals'), where('email', '==', userData.email)));
                
                dealsSnapshot.forEach(async doc => {
                  const dealData = doc.data();
                  const imageName = getImageNameFromUrl(dealData.image);
                  await deleteImage(imageName);
                  await deleteDoc(doc.ref);
                });
  
                const restaurantDocRef = doc(db, 'restaurants', userData.email);
                await deleteDoc(restaurantDocRef);
              }
  
              const user = auth.currentUser;
              if (user) {
                user.delete();
              }
  
              Alert.alert("Deletion Success","Your account and its data is gone forever ..  You will be missed");
              navigation.navigate('LoginScreen'); 
              setSession(null);
            } catch (error) {
              Alert.alert("Error", "An error occurred while trying to delete the account. Please try again.");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };
  
  const deleteImage = async (imageName) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageName);
      await deleteObject(imageRef);
    } catch (error) {
    }
  }
  
  const getImageNameFromUrl = (url) => {
    const partsWithoutQuery = url.split("?")[0];
    const pathParts = partsWithoutQuery.split("/");
    return decodeURIComponent(pathParts[pathParts.length - 1]);
  };
  

  const renderSection = (title, content, index) => (
    <View key={index} style={styles.sectionContainer}>
      <TouchableOpacity onPress={() => toggleSection(index)} style={styles.section}>
        <Text>{title}</Text>
        <MaterialIcons name={activeSections.includes(index) ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="black" />
      </TouchableOpacity>
      <Collapsible collapsed={!activeSections.includes(index)}>
        <View style={[styles.content, { backgroundColor: '#f0f0f0' }]}>
          {index === 2 ? (
            <TouchableOpacity onPress={navigateToPrivacy}>
              <Text style={styles.privacyText}>View our privacy policy here.</Text>
            </TouchableOpacity>
          ) : Array.isArray(content) ? (
            content.map(({ question, answer }) => (
              <View key={question} style={{ marginBottom: 10 }}>
          <Text style={styles.question}>{question}</Text>
          {question.includes("How do I delete my account") ? (
            <>
              <Text>{answer}</Text>
              <Text style={{color: "rgb(81,150, 116)"}} onPress={handleDeleteAccount}>here</Text>
            </>
          ) : (
            <Text>{answer}</Text>
          )}
        </View>
            ))
          ) : (
            <Text>{content}</Text>
          )}
        </View>
      </Collapsible>
    </View>
);

const aboutContent = (
  <Text>
    <Text style={{ fontWeight: 'bold' }}>What is CheapNite?</Text>{"\n\n"}
    CheapNite is a digital marketing platform aimed at helping users find and utilize restaurant deals, specials, and promotions in their local area.{"\n\n"}
    Cheapnite is also a great platform for restaurants to promote their specials and deals to customers living in, or traveling through their city at an affordable price.
  </Text>
);

  const userType = userData.type == 0 ? 'users' : 'restaurants';
  const faqContent = Object.entries(assets.faq[userType]).map(([question, answer]) => ({ question, answer }));


  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Support</Text>
        <ScrollView>
          {renderSection('Contact Us', 'Contact us at support@cheapnite.ca', 0)}
          {renderSection('FAQ', faqContent, 1)}
          {renderSection('Privacy', '', 2)}
          {renderSection('About', aboutContent, 3)}
        </ScrollView>
      </View>
    </View>
);



};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: "rgb(81,150, 116)",
  },


  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 5,
    borderBottomColor: "rgb(81,150, 116)",
    borderBottomWidth: 1,
  },
  content: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },

  privacyText: {
    color: "rgb(81,150, 116)"
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 5,
  }
});


export default SupportScreen;
