import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';

const ScoreDetailScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Score Detail" />
      <SectionHeader title="File Submit" />
    </AppSafeView>
  );
};

export default ScoreDetailScreen;

const styles = StyleSheet.create({});
