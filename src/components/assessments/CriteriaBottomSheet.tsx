import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import BottomSheet from '../common/BottomSheet';

interface CriteriaItem {
  id: number;
}

interface CriteriaBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  questionNumber: number;
}

const CriteriaBottomSheet = ({
  visible,
  onClose,
  questionNumber,
}: CriteriaBottomSheetProps) => {
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([
    { id: 1 },
  ]);
  const [expandedCriteriaId, setExpandedCriteriaId] = useState<number | null>(
    1
  );
  const [selectedDataType, setSelectedDataType] = useState('Numeric');
  const { control } = useForm();
  const DATA_TYPES = ['Numeric', 'Boolean', 'String', 'Special'];

  const handleAddCriteria = () => {
    const newId = (criteriaList[criteriaList.length - 1]?.id || 0) + 1;
    setCriteriaList([...criteriaList, { id: newId }]);
    setExpandedCriteriaId(newId);
  };

  const handleRemoveCriteria = (idToRemove: number) => {
    if (criteriaList.length > 1) {
      setCriteriaList(prevList =>
        prevList.filter(item => item.id !== idToRemove)
      );
    }
  };

  const renderCriteriaItem = (item: CriteriaItem, index: number) => {
    const isExpanded = expandedCriteriaId === item.id;
    return (
      <View key={item.id} style={styles.criteriaContainer}>
        <TouchableOpacity
          style={styles.criteriaHeader}
          onPress={() =>
            setExpandedCriteriaId(prevId => (prevId === item.id ? null : item.id))
          }
        >
          <AppText variant="body16pxBold" style={{ color: AppColors.n900 }}>
            Criteria {index + 1}
          </AppText>

          <View style={styles.headerActions}>
            {criteriaList.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveCriteria(item.id)}>
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
              name={`criteria_input_${item.id}`}
              label={`Criteria ${index + 1} input`}
              placeholder="5, 5"
            />
            <AppTextInputController
              control={control}
              name={`criteria_output_${item.id}`}
              label={`Criteria ${index + 1} output`}
              placeholder="10"
            />
            <AppText
              variant="body16pxBold"
              style={{ color: AppColors.n700 }}
            >
              Data type
            </AppText>
            {DATA_TYPES.map(type => (
              <RadioWithTitle
                key={type}
                title={type}
                selected={selectedDataType === type}
                onPress={() => setSelectedDataType(type)}
              />
            ))}
            <View style={{ height: vs(8) }}></View>
            <AppTextInputController
              control={control}
              name={`description_${item.id}`}
              label="Description"
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sapien ornare vitae amet."
              multiline
              numberOfLines={4}
            />
            <AppTextInputController
              control={control}
              name={`score_${item.id}`}
              label="Score"
              placeholder="2"
              keyboardType="numeric"
            />
            <AppButton title="Confirm" onPress={() => {}} />
          </View>
        )}
      </View>
    );
  };
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <AppText variant="h3">Criteria (Q{questionNumber})</AppText>
        <TouchableOpacity onPress={handleAddCriteria}>
          <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
            Add
          </AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {criteriaList.map(renderCriteriaItem)}
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