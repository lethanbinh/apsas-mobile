import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { Portal, Modal, Button, Text } from 'react-native-paper';
import ScreenHeader from '../components/common/ScreenHeader';
import Tabs from '../components/common/Tabs';
import SubmissionItem from '../components/score/SubmissionItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const initialOngoingPlans = [
  {
    id: 1,
    classCode: 'SE1720',
    semester: 'Summer2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar1.png',
  },
  {
    id: 2,
    classCode: 'SE1730',
    semester: 'Summer2025',
    lecturerName: 'ChienNV',
    avatar: 'path/to/avatar2.png',
  },
  {
    id: 3,
    classCode: 'SE1740',
    semester: 'Summer2025',
    lecturerName: 'VanVTT10',
    avatar: 'path/to/avatar3.png',
  },
  {
    id: 4,
    classCode: 'SE1750',
    semester: 'Summer2025',
    lecturerName: 'HoangTT',
    avatar: 'path/to/avatar4.png',
  },
  {
    id: 5,
    classCode: 'SE1760',
    semester: 'Summer2025',
    lecturerName: 'MinhPQ',
    avatar: 'path/to/avatar5.png',
  },
];

const initialEndedPlans = [
  {
    id: 6,
    classCode: 'SE1620',
    semester: 'Spring2025',
    lecturerName: 'VanVTT10',
    avatar: 'path/to/avatar6.png',
  },
  {
    id: 7,
    classCode: 'SE1630',
    semester: 'Spring2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar7.png',
  },
  {
    id: 8,
    classCode: 'SE1640',
    semester: 'Spring2025',
    lecturerName: 'ChienNV',
    avatar: 'path/to/avatar8.png',
  },
  {
    id: 9,
    classCode: 'SE1650',
    semester: 'Spring2025',
    lecturerName: 'HoangTT',
    avatar: 'path/to/avatar9.png',
  },
  {
    id: 10,
    classCode: 'SE1660',
    semester: 'Spring2025',
    lecturerName: 'MinhPQ',
    avatar: 'path/to/avatar10.png',
  },
];

const initialUpcomingPlans = [
  {
    id: 11,
    classCode: 'SE1820',
    semester: 'Fall2025',
    lecturerName: 'NguyenNT',
    avatar: 'path/to/avatar11.png',
  },
  {
    id: 12,
    classCode: 'SE1830',
    semester: 'Fall2025',
    lecturerName: 'ChienNV',
    avatar: 'path/to/avatar12.png',
  },
  {
    id: 13,
    classCode: 'SE1840',
    semester: 'Fall2025',
    lecturerName: 'VanVTT10',
    avatar: 'path/to/avatar13.png',
  },
  {
    id: 14,
    classCode: 'SE1850',
    semester: 'Fall2025',
    lecturerName: 'HoangTT',
    avatar: 'path/to/avatar14.png',
  },
  {
    id: 15,
    classCode: 'SE1860',
    semester: 'Fall2025',
    lecturerName: 'MinhPQ',
    avatar: 'path/to/avatar15.png',
  },
];

const initialDraftPlans = [
  {
    id: 16,
    classCode: 'SE1920',
    semester: 'Draft-Summer2026',
    lecturerName: 'DraftLecturer1',
    avatar: 'path/to/avatar16.png',
  },
  {
    id: 17,
    classCode: 'SE1930',
    semester: 'Draft-Summer2026',
    lecturerName: 'DraftLecturer2',
    avatar: 'path/to/avatar17.png',
  },
  {
    id: 18,
    classCode: 'SE1940',
    semester: 'Draft-Summer2026',
    lecturerName: 'DraftLecturer3',
    avatar: 'path/to/avatar18.png',
  },
  {
    id: 19,
    classCode: 'SE1950',
    semester: 'Draft-Summer2026',
    lecturerName: 'DraftLecturer4',
    avatar: 'path/to/avatar19.png',
  },
  {
    id: 20,
    classCode: 'SE1960',
    semester: 'Draft-Summer2026',
    lecturerName: 'DraftLecturer5',
    avatar: 'path/to/avatar20.png',
  },
];

const PlatListScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<string>('ongoing');

  const [ongoingPlans] = useState(initialOngoingPlans);
  const [endedPlans] = useState(initialEndedPlans);
  const [upcomingPlans] = useState(initialUpcomingPlans);
  const [draftPlans, setDraftPlans] = useState(initialDraftPlans);

  const [cloneTarget, setCloneTarget] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleClone = (item: any) => {
    setCloneTarget(item);
    setModalVisible(true);
  };

  const confirmClone = () => {
    if (cloneTarget) {
      const newItem = {
        ...cloneTarget,
        id: Date.now(), // tạo id mới
        semester: `Draft-${cloneTarget.semester}`, // đổi semester cho dễ phân biệt
      };
      setDraftPlans([newItem, ...draftPlans]); // thêm lên đầu
    }
    setModalVisible(false);
    setCloneTarget(null);
  };

  const renderList = (data: typeof ongoingPlans) => (
    <FlatList
      data={data}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <SubmissionItem
          fileName={item.classCode + ' ' + item.semester}
          title={item.lecturerName}
          onNavigate={() =>
            navigation.navigate(
              activeTab === 'drafts'
                ? 'PreviewDataScreen'
                : 'PublishPlansScreen',
            )
          }
          onClone={() => handleClone(item)}
        />
      )}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
      contentContainerStyle={{ paddingBottom: s(40) }}
    />
  );

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
            {/* Confirm trước */}
            <Button
              mode="contained"
              buttonColor={AppColors.pr500}
              textColor="white"
              onPress={confirmClone}
              style={styles.button}
            >
              Confirm
            </Button>
            {/* Cancel sau */}
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
});
