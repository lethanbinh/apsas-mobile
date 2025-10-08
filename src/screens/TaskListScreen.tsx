import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Tabs, { TabType } from '../components/common/Tabs';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { s, vs } from 'react-native-size-matters';
import SubmissionItem from '../components/score/SubmissionItem';
import { useNavigation } from '@react-navigation/native';

const TaskListScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const navigation = useNavigation<any>();

  const ongoingExams = [
    {
      id: 1,
      classCode: 'SE1720',
      semester: 'Summer2025',
      lecturerName: 'NguyenNT',
      avatar: 'path/to/avatar1.png',
    },
    {
      id: 2,
      classCode: 'SE1735',
      semester: 'Summer2025',
      lecturerName: 'ChienNV',
      avatar: 'path/to/avatar2.png',
    },
  ];

  const endedExams = [
    {
      id: 3,
      classCode: 'SE1740',
      semester: 'Spring2025',
      lecturerName: 'VanVTT10',
      avatar: 'path/to/avatar3.png',
    },
    {
      id: 4,
      classCode: 'SE1750',
      semester: 'Spring2025',
      lecturerName: 'NguyenNT',
      avatar: 'path/to/avatar4.png',
    },
  ];

  const upcomingExams = [
    {
      id: 5,
      classCode: 'SE1760',
      semester: 'Fall2025',
      lecturerName: 'PhamTA',
      avatar: 'path/to/avatar5.png',
    },
    {
      id: 6,
      classCode: 'SE1770',
      semester: 'Fall2025',
      lecturerName: 'LeQH',
      avatar: 'path/to/avatar6.png',
    },
  ];

  const renderList = (data: typeof ongoingExams) => (
    <FlatList
      data={data}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <SubmissionItem
          fileName={item.classCode + ' ' + item.semester}
          title={item.lecturerName}
          onNavigate={() => navigation.navigate('AssignmentDetailTeacherScreen')}
        />
      )}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
      contentContainerStyle={{
        paddingBottom: s(40),
        paddingTop: s(20),
      }}
    />
  );

  return (
    <AppSafeView style={{ flex: 1 }}>
      <ScreenHeader title="Tasks" />
      <View
        style={{ flex: 1, paddingVertical: vs(20), paddingHorizontal: s(25) }}
      >
        <Tabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'ongoing' && renderList(ongoingExams)}
        {activeTab === 'ended' && renderList(endedExams)}
        {activeTab === 'upcoming' && renderList(upcomingExams)}
      </View>
    </AppSafeView>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({});
