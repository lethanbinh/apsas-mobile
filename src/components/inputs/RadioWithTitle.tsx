import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface RadioWithTitle {
  selected: boolean;
  title: string;
  onPress: () => void;
}

const RadioWithTitle = ({ selected, title, onPress }: RadioWithTitle) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.circle}>
        {selected && <View style={styles.innerCircle}></View>}
      </View>
      <AppText
        variant="body14pxRegular"
        style={[styles.title, selected && styles.selected]}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default RadioWithTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(3),
  },

  circle: {
    height: s(15),
    width: s(15),
    borderRadius: '50%',
    borderWidth: 2,
    borderColor: AppColors.n300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerCircle: {
    height: s(10),
    width: s(10),
    borderRadius: '50%',
    backgroundColor: AppColors.pr500,
  },

  title: {
    marginStart: s(7),
  },
  selected: {
    color: AppColors.pr500,
  },
});
