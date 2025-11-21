import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { LecturerListData } from '../../api/lecturerService';

const pickerSelectStyles = {
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
  placeholder: {
    color: AppColors.n500,
  },
};

interface LecturerPickerProps {
  control: Control<any>;
  allLecturers: LecturerListData[];
}

const LecturerPicker: React.FC<LecturerPickerProps> = ({
  control,
  allLecturers = [],
}) => {
  const lecturerOptions = useMemo(() => {
    try {
      return (allLecturers || [])
        .filter(l => l && l.lecturerId)
        .map(l => ({
          label: `${(l.fullName && typeof l.fullName === 'string') ? l.fullName : 'Unknown'} (${l.accountCode || 'N/A'})`,
          value: Number(l.lecturerId),
        }))
        .filter(opt => !isNaN(opt.value));
    } catch (err) {
      console.error('Error creating lecturer options:', err);
      return [];
    }
  }, [allLecturers]);

  return (
    <View style={styles.formGroup}>
      <AppText style={styles.label}>Select Teacher *</AppText>
      <Controller
        control={control}
        name="lecturerId"
        render={({ field: { onChange, value } }) => (
          <RNPickerSelect
            onValueChange={onChange}
            value={value}
            placeholder={{ label: 'Select teacher', value: null }}
            items={lecturerOptions}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />
        )}
      />
    </View>
  );
};

export default LecturerPicker;

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: vs(15),
  },
  label: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(8),
  },
});

