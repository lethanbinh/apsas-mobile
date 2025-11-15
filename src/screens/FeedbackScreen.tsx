import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import FeedbackItem from '../components/score/FeedbackItem';
import { s, vs } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';

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
        const savedFeedback = await AsyncStorage.getItem(`feedback_${submissionId}`);
        if (savedFeedback) {
          setFeedback(JSON.parse(savedFeedback));
        }
      } catch (error) {
        console.error('Failed to load feedback:', error);
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

  const feedbackData = feedback
    ? [
        feedback.overallFeedback && {
          title: 'Overall Feedback',
          textColor: '#2F80ED',
          backgroundColor: '#EAF4FF',
          content: feedback.overallFeedback,
        },
        feedback.strengths && {
          title: 'Strengths',
          textColor: '#27AE60',
          backgroundColor: '#F0FAF3',
          content: feedback.strengths,
        },
        feedback.weaknesses && {
          title: 'What you should avoid',
          textColor: '#EB5757',
          backgroundColor: '#FFF0F0',
          content: feedback.weaknesses,
        },
        feedback.suggestionsForImprovement && {
          title: 'What you should improve',
          textColor: '#EB5757',
          backgroundColor: '#FFF0F0',
          content: feedback.suggestionsForImprovement,
        },
        feedback.codeQuality && {
          title: 'Code Quality',
          textColor: '#2D9CDB',
          backgroundColor: '#F0F8FF',
          content: feedback.codeQuality,
        },
        feedback.algorithmEfficiency && {
          title: 'Performance',
          textColor: '#BB6BD9',
          backgroundColor: '#FAF0FF',
          content: feedback.algorithmEfficiency,
        },
        feedback.bestPractices && {
          title: 'Best Practices',
          textColor: '#2D9CDB',
          backgroundColor: '#F0F8FF',
          content: feedback.bestPractices,
        },
        feedback.errorHandling && {
          title: 'Error Handling',
          textColor: '#EB5757',
          backgroundColor: '#FFF0F0',
          content: feedback.errorHandling,
        },
      ].filter(Boolean)
    : [];

  return (
    <AppSafeView>
      <ScreenHeader title="Feedbacks" />
      <View
        style={{
          paddingHorizontal: s(25),
          paddingVertical: s(20),
        }}
      >
        {feedbackData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              No feedback available for this submission yet.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={feedbackData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }: any) => (
              <FeedbackItem
                title={item.title}
                content={item.content}
                textColor={item.textColor}
                backgroundColor={item.backgroundColor}
              />
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: vs(15) }} />}
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
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
});
