import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import ParticipantItem from '../components/courses/ParticipantItem';
import { useRoute } from '@react-navigation/native';
import { fetchStudentGroupList, StudentGroupData } from '../api/semester'; // Import API
import { showErrorToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color'; // Import AppColors
import AppText from '../components/texts/AppText'; // Import AppText
import dayjs from 'dayjs'; // Import dayjs
import relativeTime from 'dayjs/plugin/relativeTime'; // Import relativeTime
import { s, vs } from 'react-native-size-matters';
dayjs.extend(relativeTime); // Extend dayjs
const ParticipantsScreen = () => {
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;

  const [participants, setParticipants] = useState<StudentGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) {
      showErrorToast('Error', 'No Class ID provided.');
      setIsLoading(false);
      return;
    }

    const loadParticipants = async () => {
      setIsLoading(true);
      try {
        const allStudents = await fetchStudentGroupList();
        console.log(allStudents, classId);
        const classParticipants = allStudents.filter(
          student => student.classId.toString() === classId,
        );
        setParticipants(classParticipants);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load participants.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();
  }, [classId]);

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Participants" />
      <FlatList
        data={participants}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <ParticipantItem
              key={item.id}
              avatar={null} // Assuming API provides avatar, else null
              title={item.studentName}
              className={`Group Name: ${item.classCode}`}
              joinDate={`Joined ${dayjs(item.enrollmentDate).fromNow()}`} // Calculate relative time
              role={'Student'} // Assuming all are students; adjust if API provides role
            />
          );
        }}
        showsVerticalScrollIndicator={false} // Changed to vertical
        ListEmptyComponent={
          <AppText style={styles.emptyText}>No participants found.</AppText>
        }
        contentContainerStyle={styles.listContent}
      />
    </AppSafeView>
  );
};

export default ParticipantsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: vs(10),
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(50),
    color: AppColors.n500,
  },
});
