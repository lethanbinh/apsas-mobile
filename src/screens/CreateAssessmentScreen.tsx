import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import AppText from '../components/texts/AppText';
import CurriculumList from '../components/courses/CurriculumList';
import RadioWithTitle from '../components/inputs/RadioWithTitle';
import { AppColors } from '../styles/color';
import { UploadIcon } from '../assets/icons/icon';

const CreateAssessmentScreen = () => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>('1');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState('Basic assignment');

  const ASSIGNMENT_TYPES = ['Basic assignment', 'Web API', 'Web UI'];

  const courses = [
    {
      id: '1',
      title: 'Capstone Project',
      status: 'Pending',
      assignments: [
        {
          id: 'a1',
          title: 'Assignment 1 - Nguyen NT',
          hasTestCase: true,
          sections: [
            {
              title: 'Materials',
              data: [
                {
                  id: 1,
                  number: '01',
                  title: 'Requirement',
                  linkFile: 'requirement.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 2,
                  number: '02',
                  title: 'Criteria',
                  linkFile: 'criteria.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 3,
                  number: '03',
                  title: 'Database file',
                  linkFile: 'database.sql',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
              ],
            },
          ],
        },
        {
          id: 'a2',
          title: 'Assignment 2 - Le TB',
          hasTestCase: false,
          sections: [
            {
              title: 'Materials',
              data: [
                {
                  id: 1,
                  number: '01',
                  title: 'Requirement',
                  linkFile: 'requirement_lab.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 2,
                  number: '02',
                  title: 'Criteria',
                  linkFile: 'criteria_lab.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 3,
                  number: '03',
                  title: 'Database file',
                  linkFile: 'lab_db.sql',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Lab211 Java',
      status: 'Approve',
      assignments: [
        {
          id: 'a3',
          title: 'Assignment 1 - Do TH',
          hasTestCase: true,
          sections: [
            {
              title: 'Materials',
              data: [
                {
                  id: 1,
                  number: '01',
                  title: 'Requirement',
                  linkFile: 'lab_requirement.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 2,
                  number: '02',
                  title: 'Criteria',
                  linkFile: 'lab_criteria.pdf',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
                {
                  id: 3,
                  number: '03',
                  title: 'Database file',
                  linkFile: 'lab_database.sql',
                  rightIcon: UploadIcon,
                  detailNavigation: '',
                  onAction: () => {},
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const renderStatusTag = (status: string) => {
    let bg = AppColors.b100;
    let color = AppColors.pr500;
    if (status === 'Approve') {
      bg = AppColors.g100;
      color = AppColors.g500;
    } else if (status === 'Rejected') {
      bg = AppColors.r100;
      color = AppColors.r500;
    }
    return (
      <View style={[styles.statusTag, { backgroundColor: bg }]}>
        <AppText style={[styles.statusText, { color }]}>{status}</AppText>
      </View>
    );
  };

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
            {/* --- Course Header --- */}
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() =>
                setExpandedCourse(
                  expandedCourse === course.id ? null : course.id,
                )
              }
            >
              <AppText variant="label16pxBold" style={{ flex: 1 }}>
                {course.title}
              </AppText>
              {renderStatusTag(course.status)}
              <AppText style={styles.expandIcon}>
                {expandedCourse === course.id ? '−' : '+'}
              </AppText>
            </TouchableOpacity>

            {/* --- Course Body --- */}
            {expandedCourse === course.id && (
              <View style={styles.courseBody}>
                {course.assignments.map(assignment => (
                  <View key={assignment.id} style={styles.assignmentCard}>
                    {/* --- Assignment Header --- */}
                    <TouchableOpacity
                      style={styles.assignmentHeader}
                      onPress={() =>
                        setExpandedAssignment(
                          expandedAssignment === assignment.id
                            ? null
                            : assignment.id,
                        )
                      }
                    >
                      <AppText
                        variant="body14pxBold"
                        style={{ flex: 1, color: AppColors.n900 }}
                      >
                        {assignment.title}
                      </AppText>
                      <AppText style={styles.expandIcon}>
                        {expandedAssignment === assignment.id ? '−' : '+'}
                      </AppText>
                    </TouchableOpacity>

                    {/* --- Assignment Expanded Body --- */}
                    {expandedAssignment === assignment.id && (
                      <View style={styles.assignmentBody}>
                        <AppText
                          variant="body14pxBold"
                          style={{
                            marginBottom: vs(8),
                            color: AppColors.n700,
                          }}
                        >
                          Assignment Type
                        </AppText>

                        {ASSIGNMENT_TYPES.map(item => (
                          <RadioWithTitle
                            key={item}
                            title={item}
                            selected={item === selectedType}
                            onPress={() => setSelectedType(item)}
                          />
                        ))}

                        <CurriculumList
                          sections={assignment.sections}
                          isDownloadable={false}
                          isSaved={true}
                          hasTestCase={assignment.hasTestCase}
                          containerStyle={{
                            paddingHorizontal: 0,
                            paddingBottom: 0,
                          }}
                        />
                      </View>
                    )}
                  </View>
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
  statusTag: {
    paddingHorizontal: s(8),
    paddingVertical: s(2),
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseBody: {
    backgroundColor: AppColors.pr100,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: vs(10),
  },
  assignmentCard: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    marginHorizontal: s(10),
    marginVertical: vs(8),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(14),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  assignmentBody: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
  },
});
