import React from 'react';
import { View, Text,StyleSheet } from 'react-native';

const PasswordRequirements = ({ password }) => {

    const getPasswordRequirements = (password) => {
        return {
          minLength: password.length >= 8,
          lowerCase: /[a-z]/.test(password),
          upperCase: /[A-Z]/.test(password),
          number: /\d/.test(password),
          specialChar: /[@$!%*?#&]/.test(password),
        };
      };

    const requirements = getPasswordRequirements(password);
  
    const RequirementItem = ({ test, text }) => (
        <View style={styles.requirementItem}>
          <Text style={[styles.requirementText, test ? styles.valid : styles.invalid]}>
            {test ? '✓' : '✗'} {text}
          </Text>
        </View>
      );
    
      return (
        <View style={styles.requirementsList}>
          <RequirementItem test={requirements.minLength} text="At least 8 characters" />
          <RequirementItem test={requirements.lowerCase} text="A lowercase letter (a-z)" />
          <RequirementItem test={requirements.upperCase} text="An uppercase letter (A-Z)" />
          <RequirementItem test={requirements.number} text="A number (0-9)" />
          <RequirementItem test={requirements.specialChar} text="A special character (@$!%*?#&)" />
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      requirementsList: {
        marginTop: 10,
      },
      requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4, 
        paddingHorizontal: 10, 
      },
      requirementText: {
        fontSize: 12,
      },
      valid: {
        color: 'green',
      },
      invalid: {
        color: 'red',
      },
    });
  export default PasswordRequirements;