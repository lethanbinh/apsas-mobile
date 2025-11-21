import { StyleSheet, View, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import CollapsibleSection from '../components/common/CollapsibleSection';
import { s, vs } from 'react-native-size-matters';
import { submissionFeedbackService } from '../api/submissionFeedbackService';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { showErrorToast } from '../components/toasts/AppToast';

interface FeedbackData {
  overallFeedback: string;
  strengths: string;
  weaknesses: string;
  codeQuality: string;
  algorithmEfficiency: string;
  suggestionsForImprovement: string;
  bestPractices: string;
  errorHandling: string;
}

const FeedbackScreen = () => {
  const route = useRoute();
  const submissionId = (route.params as { submissionId?: number })?.submissionId;
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      if (!submissionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const feedbackList = await submissionFeedbackService.getSubmissionFeedbackList({
          submissionId: submissionId,
        });

        if (feedbackList.length > 0) {
          const existingFeedback = feedbackList[0];
          
          // Try to parse feedback as JSON (structured format)
          try {
            const parsedFeedback = JSON.parse(existingFeedback.feedbackText);
            if (parsedFeedback && typeof parsedFeedback === 'object') {
              setFeedback({
                overallFeedback: parsedFeedback.overallFeedback || '',
                strengths: parsedFeedback.strengths || '',
                weaknesses: parsedFeedback.weaknesses || '',
                codeQuality: parsedFeedback.codeQuality || '',
                algorithmEfficiency: parsedFeedback.algorithmEfficiency || '',
                suggestionsForImprovement: parsedFeedback.suggestionsForImprovement || '',
                bestPractices: parsedFeedback.bestPractices || '',
                errorHandling: parsedFeedback.errorHandling || '',
              });
            } else {
              // If parsed but not an object, treat as plain text
              setFeedback({
                overallFeedback: existingFeedback.feedbackText,
                strengths: '',
                weaknesses: '',
                codeQuality: '',
                algorithmEfficiency: '',
                suggestionsForImprovement: '',
                bestPractices: '',
                errorHandling: '',
              });
            }
          } catch {
            // If not JSON, treat as plain text and put in overallFeedback
            setFeedback({
              overallFeedback: existingFeedback.feedbackText,
              strengths: '',
              weaknesses: '',
              codeQuality: '',
              algorithmEfficiency: '',
              suggestionsForImprovement: '',
              bestPractices: '',
              errorHandling: '',
            });
          }
        }
      } catch (error: any) {
        console.error('Failed to load feedback:', error);
        showErrorToast('Error', error.message || 'Failed to load feedback');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [submissionId]);

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Feedbacks" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Feedbacks" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!feedback ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              No feedback available for this submission yet.
            </AppText>
          </View>
        ) : (
          <CollapsibleSection
            title="Detailed Feedback"
            defaultExpanded={true}
            style={{ marginTop: vs(10) }}
          >
            <AppText variant="body12pxRegular" style={{ color: AppColors.n600, marginBottom: vs(16) }}>
              Feedback provided by your lecturer
            </AppText>
            
            {/* Overall Feedback */}
            <View style={styles.feedbackField}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Overall Feedback
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={6}
                value={feedback.overallFeedback}
                placeholder="No overall feedback provided yet..."
                editable={false}
              />
            </View>

            {/* Two column layout for other fields */}
            <View style={styles.feedbackRow}>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Strengths
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={8}
                  value={feedback.strengths}
                  placeholder="No strengths feedback provided yet..."
                  editable={false}
                />
              </View>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Weaknesses
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={8}
                  value={feedback.weaknesses}
                  placeholder="No weaknesses feedback provided yet..."
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.feedbackRow}>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Code Quality
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={6}
                  value={feedback.codeQuality}
                  placeholder="No code quality feedback provided yet..."
                  editable={false}
                />
              </View>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Algorithm Efficiency
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={6}
                  value={feedback.algorithmEfficiency}
                  placeholder="No algorithm efficiency feedback provided yet..."
                  editable={false}
                />
              </View>
            </View>

            {/* Suggestions for Improvement - Full width */}
            <View style={styles.feedbackField}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Suggestions for Improvement
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={6}
                value={feedback.suggestionsForImprovement}
                placeholder="No suggestions provided yet..."
                editable={false}
              />
            </View>

            <View style={styles.feedbackRow}>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Best Practices
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={5}
                  value={feedback.bestPractices}
                  placeholder="No best practices feedback provided yet..."
                  editable={false}
                />
              </View>
              <View style={styles.feedbackFieldHalf}>
                <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                  Error Handling
                </AppText>
                <TextInput
                  style={styles.feedbackTextInput}
                  multiline
                  numberOfLines={5}
                  value={feedback.errorHandling}
                  placeholder="No error handling feedback provided yet..."
                  editable={false}
                />
              </View>
            </View>
          </CollapsibleSection>
        )}
      </ScrollView>
    </AppSafeView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: s(25),
    paddingVertical: s(20),
    paddingBottom: vs(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
    minHeight: vs(200),
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
    textAlign: 'center',
  },
  feedbackField: {
    marginBottom: vs(16),
  },
  feedbackFieldHalf: {
    flex: 1,
    marginBottom: vs(16),
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: s(16),
    marginBottom: vs(16),
  },
  feedbackLabel: {
    marginBottom: vs(8),
    color: AppColors.n900,
  },
  feedbackTextInput: {
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    padding: s(12),
    fontSize: s(14),
    color: AppColors.n900,
    textAlignVertical: 'top',
    minHeight: vs(100),
    backgroundColor: AppColors.n50, // Different background for read-only
  },
});
