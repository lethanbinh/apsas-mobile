import React from 'react';
import { Control } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppColors } from '../../styles/color';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';

interface CriteriaAccordionProps {
  control: Control<any>;
  questionIndex: number;
  criteriaIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  editable?: boolean; // << THÊM PROP MỚI
}

const CriteriaAccordion = ({
  control,
  questionIndex,
  criteriaIndex,
  isExpanded,
  onToggle,
  editable = true, // << GIÁ TRỊ MẶC ĐỊNH
}: CriteriaAccordionProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <AppText style={styles.title}>Criteria {criteriaIndex + 1}</AppText>
        <AntDesign
          name={isExpanded ? 'up' : 'down'}
          size={16}
          color={AppColors.n700}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.body}>
          <AppTextInputController
            control={control}
            name={`questions.${questionIndex}.criteria.${criteriaIndex}.score`}
            label="Score"
            placeholder="2"
            keyboardType="numeric"
            editable={editable} // << SỬ DỤNG PROP
          />
          <AppTextInputController
            control={control}
            name={`questions.${questionIndex}.criteria.${criteriaIndex}.comment`}
            label="Comment"
            placeholder="Lorem ipsum dolor sit amet..."
            multiline
            numberOfLines={4}
            editable={editable} // << SỬ DỤNG PROP
          />
        </View>
      )}
    </View>
  );
};

// ... styles không đổi
const styles = StyleSheet.create({
    container: {
      marginBottom: vs(10),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: vs(8),
    },
    title: {
      color: AppColors.n700,
    },
    body: {
      paddingTop: vs(4),
    },
  });
  
  export default CriteriaAccordion;