import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import { globalStyles } from '../styles/shareStyles';
import AppButton from '../components/buttons/AppButton';
import { AppColors } from '../styles/color';
import { PlusIcon } from '../assets/icons/icon';
import { s, vs } from 'react-native-size-matters';
import { Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ApprovalChooseSemesterScreen = () => {
  const [semesters, setSemesters] = useState([
    'Fall2025',
    'Summer2025',
    'Spring2025',
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSemester, setNewSemester] = useState('');
  const navigation = useNavigation();
  const handleSemesterSelect = (semester: string) => {
    console.log('Selected semester:', semester);
  };

  const handleAddSemester = () => {
    if (newSemester.trim()) {
      setSemesters(prev => [...prev, newSemester.trim()]);
      setNewSemester('');
      setModalVisible(false);
    }
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Approval" />
      <View style={globalStyles.containerStyle}>
        <AppButton
          variant="secondary"
          textColor={AppColors.black}
          title="Add Semester"
          leftIcon={<PlusIcon />}
          onPress={() => setModalVisible(true)}
          style={{
            borderColor: AppColors.n500,
            width: s(120),
            alignSelf: 'flex-start',
          }}
        />

        <SemesterDropdown
          semesters={semesters}
          onSelect={handleSemesterSelect}
        />

        <AppButton
          style={{
            marginTop: vs(20),
            borderRadius: s(12),
          }}
          title="Continue"
          onPress={() => {
            navigation.navigate('ApprovalScreen' as never);
          }}
          size="large"
        />
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Add New Semester</Text>
          <TextInput
            value={newSemester}
            onChangeText={setNewSemester}
            placeholder="Ex: Winter2026"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddSemester}>
              <Text style={styles.add}>Add</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </AppSafeView>
  );
};

export default ApprovalChooseSemesterScreen;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingVertical: vs(20),
    paddingHorizontal: s(16),
    marginHorizontal: s(20), // tránh sát mép màn hình
    alignItems: 'stretch', // các thành phần full chiều ngang
  },
  modalTitle: {
    fontSize: s(16),
    fontWeight: '600',
    marginBottom: vs(12),
    textAlign: 'center',
    color: AppColors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    padding: s(10),
    marginBottom: vs(20),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    color: AppColors.n500,
    fontSize: s(14),
    marginRight: s(20),
  },
  add: {
    color: AppColors.pr500,
    fontSize: s(14),
    fontWeight: '600',
  },
});
