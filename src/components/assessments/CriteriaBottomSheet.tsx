import React, { useState } from 'react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import BottomSheet from '../common/BottomSheet';

interface CriteriaBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  questionNumber: number;
  questionIndex: number;
  control: Control<any>;
  isEditable?: boolean;
}

const CriteriaBottomSheet = ({
  visible,
  onClose,
  questionNumber,
  questionIndex,
  control,
  isEditable = true,
}: CriteriaBottomSheetProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.criteria`,
  });

  const [expandedCriteriaId, setExpandedCriteriaId] = useState<string | null>(
    fields.length > 0 ? fields[0].id : null,
  );

  const DATA_TYPES = ['Numeric', 'Boolean', 'String', 'Special'];

  const handleAddCriteria = () => {
    append({ input: '', output: '', dataType: 'Numeric', description: '', score: '' });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <AppText variant="h3">Criteria (Q{questionNumber})</AppText>
        {isEditable && (
          <TouchableOpacity onPress={handleAddCriteria}>
            <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
              Add
            </AppText>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.contentContainer}>
        {fields.map((field, index) => {
          const isExpanded = expandedCriteriaId === field.id;
          return (
            <View key={field.id} style={styles.criteriaContainer}>
              <TouchableOpacity
                style={styles.criteriaHeader}
                onPress={() =>
                  setExpandedCriteriaId(prevId =>
                    prevId === field.id ? null : field.id,
                  )
                }
              >
                <AppText
                  variant="body16pxBold"
                  style={{ color: AppColors.n900 }}
                >
                  Criteria {index + 1}
                </AppText>
                <View style={styles.headerActions}>
                  {isEditable && fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
                      <AppText style={styles.removeButtonText}>Remove</AppText>
                    </TouchableOpacity>
                  )}
                  <AppText style={{ color: AppColors.n700, fontSize: 18 }}>
                    {isExpanded ? '−' : '+'}
                  </AppText>
                </View>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.criteriaBody}>
                  <AppTextInputController
                    control={control}
                    name={`questions.${questionIndex}.criteria.${index}.input`}
                    label={`Criteria ${index + 1} input`}
                    placeholder="5, 5"
                    editable={isEditable}
                  />
                  <AppTextInputController
                    control={control}
                    name={`questions.${questionIndex}.criteria.${index}.output`}
                    label={`Criteria ${index + 1} output`}
                    placeholder="10"
                    editable={isEditable}
                  />
                  <AppText
                    variant="body16pxBold"
                    style={{ color: AppColors.n700, marginTop: vs(10) }}
                  >
                    Data type
                  </AppText>

                  <Controller
                    control={control}
                    name={`questions.${questionIndex}.criteria.${index}.dataType`}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        {DATA_TYPES.map(type => (
                          <RadioWithTitle
                            key={type}
                            title={type}
                            selected={value === type}
                            onPress={() => isEditable && onChange(type)}
                          />
                        ))}
                      </View>
                    )}
                  />

                  <View style={{ height: vs(8) }}></View>
                  <AppTextInputController
                    control={control}
                    name={`questions.${questionIndex}.criteria.${index}.description`}
                    label="Description"
                    placeholder="Description text..."
                    multiline
                    numberOfLines={4}
                    editable={isEditable}
                  />
                  <AppTextInputController
                    control={control}
                    name={`questions.${questionIndex}.criteria.${index}.score`}
                    label="Score"
                    placeholder="2"
                    keyboardType="numeric"
                    editable={isEditable}
                  />
                  {isEditable && <AppButton title="Confirm" onPress={onClose} />}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  contentContainer: {
    backgroundColor: AppColors.pr100,
    borderRadius: 12,
    padding: s(10),
  },
  criteriaContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.n200,
    marginBottom: vs(10),
    overflow: 'hidden',
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(15),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
  },
  removeButtonText: {
    color: AppColors.errorColor,
    fontSize: s(12),
  },
  criteriaBody: {
    padding: s(15),
  },
});

export default CriteriaBottomSheet;