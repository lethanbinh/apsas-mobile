import React, { useState } from 'react';
import { Control } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import CriteriaAccordion from './CriteriaAccordion';

interface ScoreQuestionAccordionProps {
  question: { id: number; title: string; score: number; maxScore: number; criteria: any[] };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  control: Control<any>;
  editable?: boolean;
}

const ScoreQuestionAccordion = ({
  question,
  index,
  isExpanded,
  onToggle,
  control,
  editable = true,
}: ScoreQuestionAccordionProps) => {
  const [expandedCriteriaId, setExpandedCriteriaId] = useState<number | null>(1);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isExpanded ? AppColors.pr100 : AppColors.n100 },
      ]}
    >
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <AppText variant="label16pxBold" style={styles.title}>
          {question.title}
        </AppText>
        <View style={styles.scoreBadge}>
          <AppText
            variant="body12pxBold"
            style={{ color: AppColors.pr500 }}
          >
            {question.score}/{question.maxScore}
          </AppText>
        </View>
        <AppText style={styles.expandIcon}>{isExpanded ? '−' : '+'}</AppText>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          {question.criteria.map((criteria, criteriaIndex) => (
            <CriteriaAccordion
              key={criteria.id}
              control={control}
              questionIndex={index}
              criteriaIndex={criteriaIndex}
              isExpanded={expandedCriteriaId === criteria.id}
              onToggle={() =>
                setExpandedCriteriaId(prevId =>
                  prevId === criteria.id ? null : criteria.id
                )
              }
              editable={editable}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: s(15),
      marginBottom: vs(12),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      color: AppColors.n900,
    },
    scoreBadge: {
      backgroundColor: AppColors.white,
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
      borderRadius: 6,
      borderWidth: 1,
      borderColor: AppColors.pr500,
    },
    expandIcon: {
      fontSize: 18,
      marginLeft: s(10),
      color: AppColors.n700,
    },
    body: {
      backgroundColor: AppColors.white,
      borderRadius: 10,
      padding: s(15),
      marginTop: vs(12),
    },
  });
  
  export default ScoreQuestionAccordion;