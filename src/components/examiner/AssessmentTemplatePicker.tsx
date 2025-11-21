import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, Control, FieldErrors, UseFormClearErrors } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { GradingGroup } from '../../api/gradingGroupService';

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

interface AssessmentTemplatePickerProps {
  control: Control<any>;
  assessmentTemplates: any[];
  loadingTemplates: boolean;
  selectedLecturerId: number | undefined;
  existingGroups: GradingGroup[];
  errors: FieldErrors<any>;
  clearErrors: UseFormClearErrors<any>;
}

const AssessmentTemplatePicker: React.FC<AssessmentTemplatePickerProps> = ({
  control,
  assessmentTemplates,
  loadingTemplates,
  selectedLecturerId,
  existingGroups,
  errors,
  clearErrors,
}) => {
  const templateOptions = useMemo(() => {
    try {
      // Filter out templates that are already assigned to the selected lecturer
      const availableTemplates = (assessmentTemplates || [])
        .filter(t => {
          if (!t || !t.id || typeof t.id !== 'number') return false;
          if (!selectedLecturerId) return true;
          
          // Check if this template is already assigned to this lecturer
          const isAlreadyAssigned = (existingGroups || []).some(group => {
            if (!group || !group.id) return false;
            return group.lecturerId === Number(selectedLecturerId) && 
                   group.assessmentTemplateId === t.id;
          });
          
          return !isAlreadyAssigned;
        })
        .map(t => ({
          label: `${(t.name && typeof t.name === 'string') ? t.name : 'Unknown'} - ${(t.courseElementName && typeof t.courseElementName === 'string') ? t.courseElementName : 'N/A'}`,
          value: t.id,
        }));
      
      return availableTemplates;
    } catch (err) {
      console.error('Error creating template options:', err);
      return [];
    }
  }, [assessmentTemplates, selectedLecturerId, existingGroups]);

  return (
    <View style={styles.formGroup}>
      <AppText style={styles.label}>Assessment Template *</AppText>
      {loadingTemplates ? (
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText}>Loading templates...</AppText>
        </View>
      ) : (
        <>
          <Controller
            control={control}
            name="assessmentTemplateId"
            render={({ field: { onChange, value } }) => (
              <RNPickerSelect
                onValueChange={(val) => {
                  onChange(val);
                  clearErrors('assessmentTemplateId');
                }}
                value={value}
                placeholder={{ label: 'Select assessment template', value: null }}
                items={templateOptions}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                disabled={!selectedLecturerId}
              />
            )}
          />
          {errors.assessmentTemplateId && (
            <AppText style={styles.errorText}>
              {errors.assessmentTemplateId.message}
            </AppText>
          )}
          {!selectedLecturerId && (
            <AppText style={styles.helpText}>
              Please select a teacher first
            </AppText>
          )}
          {selectedLecturerId && templateOptions.length === 0 && (
            <AppText style={styles.helpText}>
              No available PE templates for this teacher (all templates have been assigned)
            </AppText>
          )}
        </>
      )}
    </View>
  );
};

export default AssessmentTemplatePicker;

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
  helpText: {
    fontSize: s(12),
    color: AppColors.n500,
    marginBottom: vs(8),
    marginTop: vs(4),
  },
  loadingContainer: {
    padding: vs(12),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: s(14),
    color: AppColors.n500,
  },
  errorText: {
    color: AppColors.r500,
    fontSize: s(12),
    marginTop: vs(4),
  },
});

