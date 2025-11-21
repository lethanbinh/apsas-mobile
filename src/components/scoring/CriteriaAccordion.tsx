import React, { useEffect } from 'react';
import { Control, useWatch } from 'react-hook-form';
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
  editable?: boolean;
  description?: string;
  currentScore?: number;
  maxScore?: number;
  comment?: string;
}

const CriteriaAccordion = ({
  control,
  questionIndex,
  criteriaIndex,
  isExpanded,
  onToggle,
  editable = true,
  description,
  currentScore = 0,
  maxScore = 0,
  comment = '',
}: CriteriaAccordionProps) => {
  // Watch form values to sync with props
  const formScore = useWatch({
    control,
    name: `questions.${questionIndex}.criteria.${criteriaIndex}.score`,
  });
  const formComment = useWatch({
    control,
    name: `questions.${questionIndex}.criteria.${criteriaIndex}.comment`,
  });

  // Use form values if available, otherwise use props
  const displayScore = formScore !== undefined && formScore !== '' ? formScore : String(currentScore);
  const displayComment = formComment !== undefined && formComment !== '' ? formComment : comment;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerContent}>
          <AppText style={styles.title}>
            {description || `Criteria ${criteriaIndex + 1}`}
          </AppText>
          {maxScore > 0 && (
            <AppText style={styles.maxScoreText}>(Max: {maxScore})</AppText>
          )}
        </View>
        <View style={styles.headerRight}>
          {currentScore > 0 && (
            <View style={styles.scoreBadge}>
              <AppText style={styles.scoreText}>{currentScore.toFixed(2)}</AppText>
            </View>
          )}
          <AntDesign
            name={isExpanded ? 'up' : 'down'}
            size={16}
            color={AppColors.n700}
          />
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.body}>
          <AppTextInputController
            control={control}
            name={`questions.${questionIndex}.criteria.${criteriaIndex}.score`}
            label="Score"
            placeholder={String(currentScore) || "0"}
            keyboardType="numeric"
            editable={editable}
          />
          <AppTextInputController
            control={control}
            name={`questions.${questionIndex}.criteria.${criteriaIndex}.comment`}
            label="Comment"
            placeholder={comment || "Enter comment..."}
            multiline
            numberOfLines={4}
            editable={editable}
          />
        </View>
      )}
    </View>
  );
};

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
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },
    title: {
      color: AppColors.n700,
      flex: 1,
    },
    maxScoreText: {
      color: AppColors.n600,
      fontSize: s(12),
    },
    scoreBadge: {
      backgroundColor: AppColors.pr100,
      paddingHorizontal: s(8),
      paddingVertical: vs(2),
      borderRadius: s(4),
    },
    scoreText: {
      color: AppColors.pr500,
      fontSize: s(12),
      fontWeight: '600',
    },
    body: {
      paddingTop: vs(4),
    },
  });
  
  export default CriteriaAccordion;