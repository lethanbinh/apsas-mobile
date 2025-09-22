import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppSafeView from '../components/views/AppSafeView';
import AppHeader from '../components/common/AppHeader';
import { s, vs } from 'react-native-size-matters';
import SectionHeader from '../components/common/SectionHeader';
import { AppColors } from '../styles/color';
import ClassList from '../components/classes/ClassList';

const HomeScreen = () => {
  const handleViewAllClass = () => {};
  return (
    <AppSafeView style={styles.container}>
      <AppHeader />
      <View style={{ marginTop: vs(25) }}>
        <SectionHeader
          title="Classes"
          buttonText="View all"
          onPress={handleViewAllClass}
        />
      </View>
      <View style={{ marginTop: vs(15) }}>
        <ClassList />
      </View>
    </AppSafeView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
  },
});
