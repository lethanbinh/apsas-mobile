import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-size-matters';
import { SearchIcon } from '../../assets/icons/header-icon';
import { SmallAppIcon } from '../../assets/icons/icon';

interface AppHeaderProps {
  onSearch?: () => void;
}

const AppHeader = ({ onSearch }: AppHeaderProps) => {
  return (
    <View style={styles.container}>
      <SmallAppIcon />
      <TouchableOpacity onPress={onSearch}>
        <SearchIcon />
      </TouchableOpacity>
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
