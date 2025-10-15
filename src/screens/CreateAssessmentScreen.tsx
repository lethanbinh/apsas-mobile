import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';

import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';

import AssignmentAccordion from '../components/assessments/AssignmentAccordion';
import StatusTag from '../components/assessments/StatusTag';
import { initialCoursesData } from '../data/coursesData';
import { AppColors } from '../styles/color';

const CreateAssessmentScreen = () => {
  const [courses, setCourses] = useState(initialCoursesData);
  const [expandedCourse, setExpandedCourse] = useState<string | null>('1');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null
  );

  return (
    <AppSafeView>
      <ScreenHeader title="Tasks" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: s(20), paddingBottom: vs(40) }}
        showsVerticalScrollIndicator={false}
      >
        {courses.map(course => (
          <View key={course.id} style={styles.courseCard}>
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() =>
                setExpandedCourse(
                  expandedCourse === course.id ? null : course.id
                )
              }
            >
              <AppText variant="label16pxBold" style={{ flex: 1 }}>
                {course.title}
              </AppText>
              <StatusTag status={course.status} />
              <AppText style={styles.expandIcon}>
                {expandedCourse === course.id ? '−' : '+'}
              </AppText>
            </TouchableOpacity>
            {expandedCourse === course.id && (
              <View style={styles.courseBody}>
                {course.assignments.map(assignment => (
                  <AssignmentAccordion
                    key={assignment.id}
                    assignment={assignment}
                    isExpanded={expandedAssignment === assignment.id}
                    onToggle={() =>
                      setExpandedAssignment(prevId =>
                        prevId === assignment.id ? null : assignment.id
                      )
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </AppSafeView>
  );
};

export default CreateAssessmentScreen;

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.pr100,
    marginBottom: vs(16),
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
  },
  expandIcon: {
    fontSize: 18,
    marginLeft: 6,
    color: AppColors.n700,
  },
  courseBody: {
    backgroundColor: AppColors.pr100,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: vs(2),
    paddingBottom: vs(10),
  },
});