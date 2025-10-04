import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { s, vs } from 'react-native-size-matters';

type SemesterDropdownProps = {
  semesters: string[];
  onSelect: (value: string) => void;
};

const SemesterDropdown: React.FC<SemesterDropdownProps> = ({
  semesters,
  onSelect,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Choose Semesters</AppText>

      <RNPickerSelect
        onValueChange={value => {
          setSelectedSemester(value);
          if (value) onSelect(value);
        }}
        placeholder={{ label: 'Select', value: null }}
        items={semesters.map(semester => ({
          label: semester,
          value: semester,
        }))}
        value={selectedSemester}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          placeholder: styles.placeholder,
          iconContainer: styles.iconContainer,
        }}
        useNativeAndroidPickerStyle={false}
        Icon={() => <View style={styles.icon} />}
      />
    </View>
  );
};

export default SemesterDropdown;

const styles = StyleSheet.create({
  container: {
    marginVertical: vs(10),
  },
  label: {
    fontSize: s(14),
    color: AppColors.black,
    marginBottom: vs(8),
  },
  input: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    color: AppColors.black,
    paddingRight: s(30),
  },
  placeholder: {
    color: AppColors.n500,
  },
  iconContainer: {
    top: '50%',
    right: s(20),
    transform: [{ translateY: s(-2) }],
  },
  icon: {
    borderTopWidth: 5,
    borderTopColor: AppColors.black,
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    width: 0,
    height: 0,
  },
});
