import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Header from './Header';

const PrivacyScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <Text style={styles.title}>
          {"CheapNite Privacy Statement"}
        </Text>
        <Text style={styles.date}>
          {"Last Updated: August 15, 2023"}
        </Text>
        <Text style={styles.text}>
          {"At CheapNite, we are committed to protecting the privacy of our users. This Privacy Statement outlines our practices regarding the collection, use, and disclosure of personal and non-personal information when you use the CheapNite mobile application (the 'App'). By using our App, you consent to the practices described in this Privacy Statement."}
        </Text>
        <Text style={styles.textTitle}>
          {"1. Information We Collect"}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"1.1 Personal Information"}
        </Text>
        <Text style={styles.text}>
          {"We may collect certain personal information that you voluntarily provide when you create an account, such as your name, email address, age, and location. This information is necessary for you to use certain features of the App, such as receiving personalized deals and notifications."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"1.2 Location Information"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite requires access to your device's location to provide you with relevant deals from nearby restaurants. We collect this information only when you grant us permission, and you can choose to disable location sharing in your device settings at any time."}
        </Text>

        <Text style={styles.subSectionTitle}>
          {"1.3 Usage Information"}
        </Text>
        <Text style={styles.text}>
          {"We collect information about how you use the App, including the actions you take and the features you interact with. This may include data such as the deals you view, the restaurants you are interested in, and the frequency of your app usage. This information helps us improve our services and provide you with a better user experience."}
        </Text>

        <Text style={styles.textTitle}>
          {"2. How We Use Your Information"}
        </Text>
        <Text style={styles.text}>
          {"We use the information collected to provide you with personalized deals from nearby restaurants and to enhance your overall experience on the App. This includes sending you notifications, recommendations, and updates based on your preferences and location."}
        </Text>

        <Text style={styles.subSectionTitle}>
          {"2.1 Analytics and Improvements"}
        </Text>
        <Text style={styles.text}>
          {"We analyze aggregated usage data to understand how our App is being used, identify trends, and improve its functionality and features."}
        </Text>

        <Text style={styles.subSectionTitle}>
          {"2.2 Communication"}
        </Text>
        <Text style={styles.text}>
          {"We may use your contact information to communicate with you about the App, including updates, new features, and promotions. You can opt out of these communications at any time."}
        </Text>
        <Text style={styles.textTitle}>
          {"3. Disclosure of Information"}
        </Text>
        <Text style={styles.text}>
          {"We do not "}
          <Text style={styles.boldText}>sell, rent, or lease your personal information</Text>
          {" to third parties. However, we may share certain information under the following circumstances:"}
        </Text>
        <Text style={styles.text}>
          {"- "}
          <Text style={styles.boldText}>With Restaurants:</Text>
          {" We share your location and preferences with restaurants to show you relevant deals and offers."}
        </Text>
        <Text style={styles.text}>
          {"- "}
          <Text style={styles.boldText}>With Service Providers:</Text>
          {" We may engage third-party service providers to assist us in operating the App and providing services. These providers are bound by confidentiality agreements and are only allowed to use the information for the purpose of providing their services to us."}
        </Text>
        <Text style={styles.text}>
          {"- "}
          <Text style={styles.boldText}>Legal Requirements:</Text>
          {" We may disclose your information if required by law, legal process, or governmental request."}
        </Text>
        <Text style={styles.textTitle}>
          {"4. Data Security"}
        </Text>
        <Text style={styles.text}>
          {"We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."}
        </Text>
        <Text style={styles.textTitle}>
          {"5. Children's Privacy"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information."}
        </Text>
        <Text style={styles.textTitle}>
          {"6. Changes to Privacy Statement"}
        </Text>
        <Text style={styles.text}>
          {"We may update this Privacy Statement from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. Any changes will be effective when the revised Privacy Statement is posted on the App."}
        </Text>
        <Text style={styles.textTitle}>
          {"7. Contact Us"}
        </Text>
        <Text style={styles.text}>
          {"If you have any questions, concerns, or requests regarding your privacy or this Privacy Statement, you can contact us at support@cheapnite.ca."}
        </Text>
        <Text style={styles.text}>
          {"By using the CheapNite App, you acknowledge that you have read and understood this Privacy Statement and agree to its terms."}
        </Text>
        <View style={styles.bottom}></View>

      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 0, 
    paddingTop: 0, 


  },
  bottom: {
    marginTop: "10%",
  },
  date: {
    color: "#333333",
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 25
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    marginLeft: "10%",
    marginRight: "10%"
  },
  textTitle: {
    marginTop: 20,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: "rgb(81,150, 116)",
    marginBottom: 20,
    marginLeft: "10%",
    marginRight: "10%"

  },
  title: {
    marginTop: 20,
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: "rgb(81,150, 116)",
    marginBottom: 20
  },
  subSectionTitle: {
    marginTop: 20,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: "rgb(81,150, 116)",
    marginBottom: 20
  },
  boldText: {
    fontWeight: "bold",
  }

});

export default PrivacyScreen;
