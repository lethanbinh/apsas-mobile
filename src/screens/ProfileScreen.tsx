import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { s } from 'react-native-size-matters';
import SectionHeader from '../components/common/SectionHeader';
import ProfileForm from '../components/forms/ProfileForm';
import AppSafeView from '../components/views/AppSafeView';

const ProfileScreen = () => {
  return (
    <AppSafeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <SectionHeader title="Profile" textVariant="h3" />
          <ProfileForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: s(25),
    flexGrow: 1,
  },
});
