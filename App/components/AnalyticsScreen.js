import React, {useState} from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Header from './Header';
import BottomBarRestaurant from './BottomBarRestaurant';

import NavMenuRestaurant from './NavMenuRestaurant';

const AnalyticsScreen = ({ navigation }) => {

  const [modalVisible, setModalVisible] = useState(false); 

  const handleNavigation = (screenName) => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300); // delay in ms
}

  return (
    <View style={{ flex: 1 }}>
      <Header openMenu={() => setModalVisible(true)}/>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
      >
        <NavMenuRestaurant setModalVisible={setModalVisible} handleNavigation={handleNavigation} />
      </Modal>

      <View style={styles.content}>
        <Text>Statistics and Analytics are coming soon!</Text>
        <Text>Thank you for remaining patient</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalyticsScreen;
