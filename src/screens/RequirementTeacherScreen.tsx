import { useRoute } from '@react-navigation/native'; // Import
import React, { useState, useEffect } from 'react'; // Import useEffect
import {
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'; // Import Alert, ActivityIndicator
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import QuestionAccordion from '../components/assessments/QuestionAccordion';
import CriteriaBottomSheet from '../components/assessments/CriteriaBottomSheet';
// Import
import {
  AssessmentPaperQuestion,
  AssessmentTemplateData,
} from '../api/assessmentTemplateService';
import {
  RubricItemData,
  getRubricItemsByQuestionId,
} from '../api/rubricItemService';
import { showErrorToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';
import AppText from '../components/texts/AppText';

const RequirementTeacherScreen = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isCriteriaVisible, setCriteriaVisible] = useState(false);

  const route = useRoute();
  const assessmentTemplate = (
    route.params as { assessmentTemplate?: AssessmentTemplateData }
  )?.assessmentTemplate;

  // State cho dữ liệu động
  const [questions, setQuestions] = useState<AssessmentPaperQuestion[]>([]);
  const [paperName, setPaperName] = useState('Requirement');
  const [fetchedRubrics, setFetchedRubrics] = useState<RubricItemData[]>([]);
  const [selectedQuestionNumber, setSelectedQuestionNumber] = useState(0);
  const [isLoadingRubrics, setIsLoadingRubrics] = useState(false);

  useEffect(() => {
    // Lấy questions từ template
    if (assessmentTemplate && assessmentTemplate.papers && assessmentTemplate.papers.length > 0) {
      const paper = assessmentTemplate.papers[0];
      if (paper) {
        setPaperName(paper.name || 'Requirement');
        setQuestions(paper.questions || []);
        // Tự động mở câu đầu tiên
        if (paper.questions && paper.questions.length > 0 && paper.questions[0]?.id) {
          setExpandedId(paper.questions[0].id);
        }
      }
    }
  }, [assessmentTemplate]);

  const handleToggle = (id: number) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  const handleCriteriaPress = async (questionId: number, index: number) => {
    setSelectedQuestionNumber(index + 1);
    setIsLoadingRubrics(true);
    // Mở sheet để hiển thị loading
    setCriteriaVisible(true);
    try {
      const rubrics = await getRubricItemsByQuestionId(questionId);
      setFetchedRubrics(rubrics);
    } catch (error) {
      console.error('Failed to fetch rubrics:', error);
      showErrorToast('Error', 'Failed to load criteria.');
      setCriteriaVisible(false); // Đóng sheet nếu lỗi
    } finally {
      setIsLoadingRubrics(false);
    }
  };

  return (
    <AppSafeView>
      <ScreenHeader title={paperName} />
      <ScrollView contentContainerStyle={styles.container}>
        {questions.length === 0 ? (
          <AppText style={styles.errorText}>
            No questions found for this paper.
          </AppText>
        ) : (
          questions
            .filter(q => q && q.id)
            .map((question, index) => (
              <QuestionAccordion
                key={question.id}
                title={`Question ${index + 1}: ${question.questionText || 'No question text'}`}
                description={`Sample Input:\n${question.questionSampleInput || 'N/A'}\n\nSample Output:\n${question.questionSampleOutput || 'N/A'}`}
                imageUrl={null} // Model không có imageUrl
                isExpanded={expandedId === question.id}
                onPress={() => handleToggle(question.id)}
                onCriteriaPress={() => handleCriteriaPress(question.id, index)}
              />
            ))
        )}
      </ScrollView>

      <CriteriaBottomSheet
        visible={isCriteriaVisible}
        onClose={() => {
          setCriteriaVisible(false);
          setFetchedRubrics([]); // Reset rubrics khi đóng
        }}
        questionNumber={selectedQuestionNumber}
        rubrics={fetchedRubrics}
        isEditable={false} // Giáo viên chỉ xem
      />
    </AppSafeView>
  );
};

export default RequirementTeacherScreen;

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