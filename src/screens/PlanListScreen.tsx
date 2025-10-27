import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { fetchSemesterCourses, fetchSemesters } from '../api/semester';
import ScreenHeader from '../components/common/ScreenHeader';
import Tabs from '../components/common/Tabs';
import SubmissionItem from '../components/score/SubmissionItem';
import {
  showErrorToast,
  showSuccessToast,
} from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { RootState } from '../store/store';
import { AppColors } from '../styles/color';
import { fetchHoDDetails } from '../api/hodService';

interface Plan {
  id: string;
  semester: string;
  year: string;
}

const PlatListScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<string>('ongoing');
  const [isLoading, setIsLoading] = useState(true);

  const [ongoingPlans, setOngoingPlans] = useState<Plan[]>([]);
  const [endedPlans, setEndedPlans] = useState<Plan[]>([]);
  const [upcomingPlans, setUpcomingPlans] = useState<Plan[]>([]);
  const [draftPlans, setDraftPlans] = useState<Plan[]>([]);

  const [cloneTarget, setCloneTarget] = useState<Plan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  useEffect(() => {
    const loadSemesterPlans = async () => {
      if (!userAccountId) {
        showErrorToast('Error', 'User not logged in or account ID missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [semesters, semesterCourses] = await Promise.all([
          fetchSemesters(),
          fetchSemesterCourses(),
        ]);

        const uniqueHodIds = [
          ...new Set(
            semesterCourses
              .map(sc => sc.createdByHODId)
              .filter(id => id != null),
          ),
        ];

        const hodDetailsPromises = uniqueHodIds.map(async hodId => {
          try {
            const details = await fetchHoDDetails(hodId);
            return {
              hodId: hodId, // ID từ semesterCourse
              accountId: details.accountId, // ID tài khoản của HOD đó
            };
          } catch (e) {
            return null;
          }
        });

        const hodIdToAccountIdMap = (
          await Promise.all(hodDetailsPromises)
        ).filter(item => item !== null) as {
          hodId: string;
          accountId: number;
        }[];

        const matchingHodIds = hodIdToAccountIdMap
          .filter(
            mapItem => String(mapItem.accountId) === String(userAccountId),
          )
          .map(mapItem => mapItem.hodId);

        const userSemesterCourses = semesterCourses.filter(
          sc =>
            sc.createdByHODId != null &&
            matchingHodIds.includes(sc.createdByHODId),
        );

        const userSemesterIds = [
          ...new Set(userSemesterCourses.map(sc => sc.semesterId)),
        ];

        const userSemesters = semesters.filter(sem =>
          userSemesterIds.includes(sem.id),
        );

        const now = dayjs();
        const ongoing: Plan[] = [];
        const ended: Plan[] = [];
        const upcoming: Plan[] = [];

        userSemesters.forEach(sem => {
          const startDate = dayjs(sem.startDate);
          const endDate = dayjs(sem.endDate);
          const plan: Plan = {
            id: sem.id,
            semester: sem.semesterCode,
            year: sem.academicYear,
          };

          if (now.isAfter(endDate)) {
            ended.push(plan);
          } else if (now.isBefore(startDate)) {
            upcoming.push(plan);
          } else {
            ongoing.push(plan);
          }
        });

        setOngoingPlans(ongoing);
        setEndedPlans(ended);
        setUpcomingPlans(upcoming);
        setDraftPlans([]);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load semester plans.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSemesterPlans();
  }, [userAccountId]);

  const handleClone = (item: Plan) => {
    setCloneTarget(item);
    setModalVisible(true);
  };

  const confirmClone = () => {
    if (cloneTarget) {
      const newItem = {
        ...cloneTarget,
        id: dayjs().toISOString(),
        semester: `Draft-${cloneTarget.semester}`,
      };
      setDraftPlans([newItem, ...draftPlans]);
      showSuccessToast('Success', 'Plan cloned to drafts.');
    }
    setModalVisible(false);
    setCloneTarget(null);
  };

  const renderList = (data: Plan[]) => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={{ marginTop: vs(50) }} />;
    }

    if (data.length === 0) {
      return (
        <Text style={styles.emptyText}>No plans found in this category.</Text>
      );
    }

    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <SubmissionItem
            fileName={`${item.semester} - ${item.year}`}
            title={'Semester Plan'}
            onNavigate={() =>
              navigation.navigate('PublishPlansScreen', {
                semesterId: item.id,
                semesterCode: item.semester,
              })
            }
            onClone={() => handleClone(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
        contentContainerStyle={{ paddingBottom: s(40) }}
      />
    );
  };

  return (
    <AppSafeView style={{ flex: 1 }}>
      <ScreenHeader title="Semester plan" />
      <View
        style={{ flex: 1, paddingHorizontal: s(25), paddingVertical: vs(20) }}
      >
        <Tabs
          tabs={[
            { key: 'ongoing', label: 'Ongoing' },
            { key: 'ended', label: 'Ended' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'drafts', label: 'Drafts' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <View style={{ marginTop: vs(20) }}>
          {activeTab === 'ongoing' && renderList(ongoingPlans)}
          {activeTab === 'ended' && renderList(endedPlans)}
          {activeTab === 'upcoming' && renderList(upcomingPlans)}
          {activeTab === 'drafts' && renderList(draftPlans)}
        </View>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Clone this plan?</Text>
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              buttonColor={AppColors.pr500}
              textColor="white"
              onPress={confirmClone}
              style={styles.button}
            >
              Confirm
            </Button>
            <Button
              mode="outlined"
              textColor={AppColors.pr500}
              style={[styles.button, { borderColor: AppColors.pr500 }]}
              onPress={() => setModalVisible(false)}
            >
              Cancel
            </Button>
          </View>
        </Modal>
      </Portal>
    </AppSafeView>
  );
};

export default PlatListScreen;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    marginHorizontal: s(20),
    padding: s(20),
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: s(16),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 90,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(40),
    color: AppColors.n500,
  },
});
