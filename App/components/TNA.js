import React, {useContext} from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import { signOut } from "@firebase/auth";
import { getFirestore, doc, setDoc , collection, query, where, getDocs, updateDoc} from "@firebase/firestore";
import { auth, db } from '../firebase';
import { CommonActions } from '@react-navigation/native';


import { SessionContext } from '../SessionContext';
import Header from './Header';

const TNA = ({navigation}) => {
    const { session, setSession } = useContext(SessionContext);
    const { userData } = session || {};

    const handleAgree = async () => {
        userData.hasAcceptedTerms = true;
        setSession({ userData: userData });
    
        try {
            let targetCollection, q;
    
            if (userData.type === 0) {
                targetCollection = collection(db, 'users');
                q = query(targetCollection, where("email", "==", userData.email));
            } else if (userData.type === 1) {
                targetCollection = collection(db, 'restaurants');

                q = doc(targetCollection, userData.email);
            }
    
            if (userData.type === 0) {
                const querySnapshot = await getDocs(q);
    
                if (querySnapshot.empty) {
                    
                }
    
                querySnapshot.forEach((document) => {
                    const userDoc = document.data();
                    if (userDoc.email === userData.email) {
                        const userRef = doc(db, 'users', document.id);
                        updateDoc(userRef, { hasAcceptedTerms: true });
                    }
                });
                
            } else if (userData.type === 1) {
                await updateDoc(q, { hasAcceptedTerms: true });
            }
    
            if (userData.type === 0) {
                Alert.alert("Success","Welcome to CheapNite \n\n View Deals, Events and more!");
                navigation.navigate('MainPage');
            } else {
                if(userData.verified){
                    Alert.alert('Login Success', 'Welcome Back');
                  }else{
                    Alert.alert('Welcome to CheapNite!', 'Login Success\n\nPlease feel free to add your deals, and dont forget to request Verification in "My Account" to go live!');
                  }
                  navigation.navigate('RestaurantView');
            }
    
        } catch (error) {
            Alert.alert('An error occurred while updating user preferences');
            handleDisagree();
        }
    };
    
    const handleDisagree = () => {
    
        signOut(auth)
          .then(() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  { name: 'LoginScreen' },
                ],
              })
            );
    
            setSession(null); 
          }).catch((error) => {
          });
    };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <Text style={styles.title}>
          {"CheapNite Terms of Use"}
        </Text>
        <Text style={styles.date}>
          {"Last Updated: August 15, 2023"}
        </Text>

        <Text style={styles.text}>
          {"Welcome to CheapNite! These Terms of Use ('Terms') govern your access to and use of the CheapNite platform and services ('Services'). By accessing or using CheapNite, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, please refrain from using our Services."}
        </Text>

        <Text style={styles.textTitle}>
          {"**1. Acceptance of Terms**"}
        </Text>
        <Text style={styles.text}>
          {"By accessing and using CheapNite, you acknowledge that you have read, understood, and agree to abide by these Terms and any additional guidelines or rules provided within the platform. If you disagree with any part of these Terms, you may not access or use the Services."}
        </Text>

        <Text style={styles.textTitle}>
          {"**2. Use of the Services**"}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"a. **User Accounts**:"}
        </Text>
        <Text style={styles.text}>
          {"In order to access certain features of the Services, you may need to create a user account. You are responsible for maintaining the confidentiality of your account information, including your username and password."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"b. **User Conduct**:"}
        </Text>
        <Text style={styles.text}>
          {"You agree to use the Services in a lawful and responsible manner. You shall not engage in any activity that is harmful, offensive, or violates the rights of others, including, but not limited to, posting misleading information, spamming, or engaging in any form of harassment."}
        </Text>

        <Text style={styles.textTitle}>
          {"**3. Content and Intellectual Property**"}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"a. **User-Generated Content**:"}
        </Text>
        <Text style={styles.text}>
          {" You may have the opportunity to submit content to CheapNite, such as reviews, comments, or ratings. By submitting content, you grant CheapNite a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, and sublicensable right to use, reproduce, modify, adapt, publish, translate, distribute, and display such content."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"b. **Intellectual Property**:"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite and its content, including but not limited to logos, graphics, and software, are protected by copyright, trademark, and other intellectual property laws. You agree not to reproduce, modify, distribute, or create derivative works based on such content without obtaining explicit permission."}
        </Text>

        <Text style={styles.textTitle}>
          {"**4. Third-Party Links and Content**"}
        </Text>
        <Text style={styles.text}>
          {"The Services may include links to third-party websites or content that are not owned or controlled by CheapNite. We are not responsible for the content, privacy policies, or practices of any third-party websites or services. You access these third-party resources at your own risk."}
        </Text>

        <Text style={styles.textTitle}>
          {"**5. Disclaimer of Warranties**"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite provides the Services 'as is' and makes no representations or warranties, either express or implied, regarding the accuracy, reliability, or completeness of the content or functionality provided through the Services."}
        </Text>

        <Text style={styles.textTitle}>
          {"**6. Limitation of Liability**"}
        </Text>
        <Text style={styles.text}>
          {"To the fullest extent permitted by law, CheapNite shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly."}
        </Text>

        <Text style={styles.textTitle}>
          {"**7. Changes to Terms**"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite reserves the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms."}
        </Text>

        <Text style={styles.textTitle}>
          {"**8. Governing Law and Dispute Resolution**"}
        </Text>
        <Text style={styles.text}>
          {"These Terms shall be governed by and construed in accordance with the laws of Ontario/Quebec. Any disputes arising out of or related to these Terms or the use of the Services shall be subject to the exclusive jurisdiction of the courts of Ontario/Quebec."}
        </Text>

        <Text style={styles.textTitle}>
          {"**9. Alcohol Promotion **"}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"a. Legal Compliance:"}
        </Text>
        <Text style={styles.text}>
          {"Restaurants using CheapNite to promote alcoholic beverages must ensure that their promotions and advertisements are compliant with all applicable laws and regulations regarding the sale and promotion of alcohol in their jurisdiction. This includes verifying the legal drinking age and adhering to any restrictions on alcohol advertising."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"b. Responsibility:"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite does not endorse or encourage the excessive consumption of alcohol. Restaurants are responsible for providing accurate information about their alcohol-related offerings and should encourage responsible drinking."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"c. Age Verification:"}
        </Text>
        <Text style={styles.text}>
          {"Users of CheapNite must be of legal drinking age to access and interact with alcohol-related content. By using the Services, you represent and warrant that you are of legal drinking age in your jurisdiction."}
        </Text>
        <Text style={styles.subSectionTitle}>
          {"d. Liability:"}
        </Text>
        <Text style={styles.text}>
          {"CheapNite shall not be held responsible for any consequences arising from the misuse or violation of alcohol-related laws and regulations by restaurants or users. Any disputes or issues related to alcohol promotions must be resolved directly between the restaurant and the concerned parties."}
        </Text>

        <View style={styles.buttonContainer}>
    <View style={styles.borderButton}>
        <Button title="Disagree" onPress={handleDisagree} color="red" />
    </View>
    <View style={styles.borderButtonAgree}>
        <Button title="Agree" onPress={handleAgree} color="rgb(81,150, 116)" />
    </View>
</View>


       
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20
},
buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20
},
borderButtonAgree: {
    borderWidth: 1,
    borderColor: 'rgb(81,150, 116)', 
    borderRadius: 5,     
    flex: 1,          
    marginHorizontal: 5 
},
borderButton: {
    borderWidth: 1,
    borderColor: 'red', 
    borderRadius: 5,     
    flex: 1,             
    marginHorizontal: 5 
}

});

export default TNA;
