import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SmallAppIcon } from '../../assets/icons/icon';
import { SearchIcon } from '../../assets/icons/header-icon';
import { s } from 'react-native-size-matters';

const AppHeader = () => {
  return (
    <View style={styles.container}>
      <SmallAppIcon />
      <SearchIcon />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
