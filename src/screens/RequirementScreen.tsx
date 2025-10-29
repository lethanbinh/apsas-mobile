import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  AssessmentPaperQuestion,
  AssessmentTemplateData,
} from '../api/assessmentTemplateService';
import QuestionAccordion from '../components/assessments/QuestionAccordion';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const RequirementScreen = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const route = useRoute();
  const assessmentTemplate = (
    route.params as { assessmentTemplate?: AssessmentTemplateData }
  )?.assessmentTemplate;

  const [questions, setQuestions] = useState<AssessmentPaperQuestion[]>([]);
  const [paperName, setPaperName] = useState('Requirement Details');

  useEffect(() => {
    if (assessmentTemplate && assessmentTemplate.papers.length > 0) {
      const paper = assessmentTemplate.papers[0];
      setPaperName(paper.name || 'Requirement Details');
      setQuestions(paper.questions || []);
      if (paper.questions.length > 0) {
        setExpandedId(paper.questions[0].id);
      }
    } else {
      setQuestions([]);
      setPaperName('Requirement Details');
    }
  }, [assessmentTemplate]);

  const handleToggle = (id: number) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };
  return (
    <AppSafeView>
      <ScreenHeader title={paperName} />
      <ScrollView contentContainerStyle={styles.container}>
        {questions.length === 0 ? (
          <AppText style={styles.errorText}>
            No requirement details available.
          </AppText>
        ) : (
          questions.map((question, index) => (
            <QuestionAccordion
              key={question.id}
              title={`Question ${index + 1}: ${question.questionText}`}
              description={`Sample Input:\n${question.questionSampleInput}\n\nSample Output:\n${question.questionSampleOutput}`}
              imageUrl={null}
              isExpanded={expandedId === question.id}
              onPress={() => handleToggle(question.id)}
              showCriteria={false}
            />
          ))
        )}
      </ScrollView>
    </AppSafeView>
  );
};

export default RequirementScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
  },
  errorText: {
    textAlign: 'center',
    color: AppColors.n500,
    marginTop: vs(20),
  },
});
