import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { s } from 'react-native-size-matters';
import SectionHeader from '../components/common/SectionHeader';
import ProfileForm from '../components/forms/ProfileForm';
import AppSafeView from '../components/views/AppSafeView';

const ProfileScreen = () => {
  return (
    <AppSafeView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Profile" textVariant="h3" />
        <ProfileForm />
      </ScrollView>
    </AppSafeView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
  },
});
