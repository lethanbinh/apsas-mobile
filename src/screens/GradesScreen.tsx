import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import CurriculumList from '../components/courses/CurriculumList';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getClassAssessments } from '../api/classAssessmentService';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';
import { showErrorToast } from '../components/toasts/AppToast';
import { ViewIcon } from '../assets/icons/courses';
import { useNavigation } from '@react-navigation/native';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';

const GradesScreen = () => {
  const navigation = useNavigation<any>();
  const { studentId, isLoading: isLoadingStudentId } = useGetCurrentStudentId();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (isLoadingStudentId || !studentId) {
      if (!isLoadingStudentId && !studentId) {
        showErrorToast('Error', 'Could not identify current student.');
        setIsLoading(false);
      }
      return;
    }

    const loadGrades = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        // Fetch all graded submissions (status = 2 means graded)
        const allSubmissions = await getSubmissionList({
          studentId: Number(studentId),
          status: 2, // Only graded submissions
        });

        if (!isMounted) return;

        // Fetch class assessments to get assignment details
        const classAssessmentsRes = await getClassAssessments({
          studentId: Number(studentId),
          pageNumber: 1,
          pageSize: 1000,
        });

        if (!isMounted) return;

        const assessmentMap = new Map<number, any>();
        (classAssessmentsRes?.items || []).forEach(ca => {
          if (ca && ca.id) {
            assessmentMap.set(ca.id, ca);
          }
        });

        // Group submissions by classAssessmentId and get the latest graded one
        const gradedSubmissionsMap = new Map<number, Submission>();
        allSubmissions.forEach(sub => {
          if (!sub || !sub.classAssessmentId || !sub.submittedAt || sub.lastGrade <= 0) return;
          const existing = gradedSubmissionsMap.get(sub.classAssessmentId);
          if (
            !existing ||
            (existing.submittedAt && new Date(sub.submittedAt).getTime() > new Date(existing.submittedAt).getTime())
          ) {
            gradedSubmissionsMap.set(sub.classAssessmentId, sub);
          }
        });

        // Build assignment and exercise lists
        const assignmentItems: any[] = [];
        const exerciseItems: any[] = [];
        let assignmentIndex = 1;
        let exerciseIndex = 1;

        gradedSubmissionsMap.forEach((sub, classAssessmentId) => {
          if (!sub || !sub.id || !sub.submittedAt) return;
          const assessment = assessmentMap.get(classAssessmentId);
          if (!assessment || !assessment.id) return;

          try {
            const courseElementName = (assessment.courseElementName && typeof assessment.courseElementName === 'string') 
              ? assessment.courseElementName 
              : 'Unknown Assignment';
            const isExercise = courseElementName.toLowerCase().includes('exercise') ||
                              courseElementName.toLowerCase().includes('lab');

            const grade = (typeof sub.lastGrade === 'number' && sub.lastGrade >= 0) ? sub.lastGrade : 0;
            const itemNumber = isExercise ? exerciseIndex++ : assignmentIndex++;
            const formattedNumber = itemNumber < 10 ? `0${itemNumber}` : String(itemNumber);

            const item = {
              id: sub.id,
              number: formattedNumber,
              title: courseElementName,
              linkFile: `${grade}/100`,
              rightIcon: ViewIcon,
              detailNavigation: 'ScoreDetailScreen',
              onAction: () => {
                try {
                  if (sub && sub.id) {
                    navigation.navigate('ScoreDetailScreen', {
                      submissionId: sub.id,
                    });
                  } else {
                    showErrorToast('Error', 'Invalid submission data.');
                  }
                } catch (navErr) {
                  console.error('Error navigating to score detail:', navErr);
                  showErrorToast('Error', 'Failed to open score details.');
                }
              },
            };

            if (isExercise) {
              exerciseItems.push(item);
            } else {
              assignmentItems.push(item);
            }
          } catch (itemErr) {
            console.error('Error processing grade item:', itemErr);
          }
        });

        if (!isMounted) return;
        setAssignments(assignmentItems);
        setExercises(exerciseItems);
      } catch (error: any) {
        console.error('Failed to load grades:', error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load grades.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGrades();
    return () => {
      setIsMounted(false);
    };
  }, [studentId, isLoadingStudentId]);

  if (isLoading || isLoadingStudentId) {
    return (
      <AppSafeView>
        <ScreenHeader title="Grades" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  const sections = [
    ...(assignments.length > 0 ? [{ title: 'Assignments', data: assignments }] : []),
    ...(exercises.length > 0 ? [{ title: 'Exercises', data: exercises }] : []),
  ];

  return (
    <AppSafeView>
      <ScreenHeader title="Grades" />
      {sections.length > 0 ? (
        <CurriculumList sections={sections} isGraded={true} />
      ) : (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>No grades available yet.</AppText>
        </View>
      )}
    </AppSafeView>
  );
};

export default GradesScreen;

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
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
