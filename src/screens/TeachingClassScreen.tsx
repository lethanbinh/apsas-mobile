import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import AppSafeView from '../components/views/AppSafeView';
import SubmissionItem from '../components/score/SubmissionItem';
import { useNavigation } from '@react-navigation/native';
const students = [
  {
    id: 1,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar1.png',
  },
  {
    id: 2,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'ChienNV',
    avatar: 'path/to/avatar2.png',
  },
  {
    id: 3,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar3.png',
  },
  {
    id: 4,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'VanVTT10',
    avatar: 'path/to/avatar4.png',
  },
  {
    id: 5,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar5.png',
  },
];

const TeachingClassScreen = () => {
  const navigation = useNavigation<any>();
  const semesters = ['Fall2025', 'Summer2025', 'Spring2025'];

  const handleSemesterSelect = (semester: string) => {
    console.log('Selected semester:', semester);
  };
  return (
    <AppSafeView>
      <ScreenHeader title="My Classes" />

      <View style={{ padding: s(25) }}>
        <SemesterDropdown
          semesters={semesters}
          onSelect={handleSemesterSelect}
        />

        <FlatList
          data={students}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <SubmissionItem
              fileName={item.classCode + ' ' + item.semester}
              title={item.lecturerName}
              onNavigate={() =>
                navigation.navigate('CourseDetailTeacherScreen')
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
          contentContainerStyle={{ paddingBottom: s(120) }}
        />
      </View>
    </AppSafeView>
  );
};

export default TeachingClassScreen;

const styles = StyleSheet.create({});
