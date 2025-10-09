import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import { DashboardIcon } from '../../assets/icons/courses';
import { Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import CustomModal from '../modals/CustomModal';
import { QuestionMarkIcon } from '../../assets/icons/input-icon';
import UserTable from './UserTable';

const ManageUserList = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // 🔹 Modal trạng thái
  const [bannedModalVisible, setBannedModalVisible] = useState(false);
  const [reactiveModalVisible, setReactiveModalVisible] = useState(false);

  const roles = ['All', 'Admin', 'Student', 'Lecturer', 'Head of Department'];
  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setRoleModalVisible(false);
  };

  const displayRole = selectedRole
    ? selectedRole.length > 12
      ? selectedRole.slice(0, 12) + '...'
      : selectedRole
    : 'Select role (4)';

  return (
    <View style={styles.container}>
      {/* ===== Button Row 1 ===== */}
      <View style={styles.buttonRow}>
        <AppButton
          style={{ width: s(140), borderColor: AppColors.n300 }}
          title={displayRole}
          onPress={() => setRoleModalVisible(true)}
          backgroundColor={AppColors.white}
          textColor={AppColors.n700}
          variant="secondary"
          size="small"
          leftIcon={
            <Ionicons name="options-outline" size={16} color={AppColors.n700} />
          }
        />
        <AppButton
          style={{ width: s(90), borderColor: AppColors.n300 }}
          title="Export"
          onPress={() => console.log('Export')}
          backgroundColor={AppColors.white}
          textColor={AppColors.n700}
          variant="secondary"
          size="small"
          leftIcon={
            <Ionicons
              name="download-outline"
              size={16}
              color={AppColors.n700}
            />
          }
        />
        <AppButton
          style={{ width: s(40), minWidth: 0, borderColor: AppColors.n300 }}
          onPress={() => navigation.navigate('AdminDashboardScreen')}
          backgroundColor={AppColors.white}
          variant="secondary"
          size="small"
          leftIcon={<DashboardIcon />}
        />
      </View>

      {/* ===== Button Row 2 ===== */}
      <View style={styles.buttonRow}>
        <AppButton
          style={{ width: s(90) }}
          title="Add"
          onPress={() => console.log('Add')}
          size="small"
          leftIcon={<Ionicons name="add" size={16} color={AppColors.white} />}
        />
        <AppButton
          style={{ width: s(90) }}
          title="Banned"
          onPress={() => setBannedModalVisible(true)}
          backgroundColor={AppColors.r500}
          size="small"
        />
        <AppButton
          style={{ width: s(100) }}
          title="Reactivated"
          onPress={() => setReactiveModalVisible(true)}
          backgroundColor={AppColors.g500}
          size="small"
        />
      </View>

      {/* ===== Search Box ===== */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={AppColors.n500} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <UserTable />

      {/* ===== Role Selection Modal ===== */}
      <Portal>
        <Modal
          visible={roleModalVisible}
          onDismiss={() => setRoleModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Select a role</Text>
          {roles.map(role => (
            <TouchableOpacity
              key={role}
              style={styles.roleItem}
              onPress={() => handleSelectRole(role)}
            >
              <Text
                style={[
                  styles.roleText,
                  selectedRole === role && styles.roleTextSelected,
                ]}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setRoleModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>

      {/* ===== Banned Modal ===== */}
      <CustomModal
        visible={bannedModalVisible}
        onClose={() => setBannedModalVisible(false)}
        title="Are You Sure?"
        description="Do you want to banned those users"
        icon={<QuestionMarkIcon />}
      >
        <View style={styles.modalButtonRow}>
          <AppButton
            size="small"
            title="Yes"
            onPress={() => {
              console.log('Users banned');
              setBannedModalVisible(false);
            }}
            style={{ width: s(80) }}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setBannedModalVisible(false)}
            textColor={AppColors.pr500}
            style={{ width: s(90), borderColor: AppColors.pr500 }}
          />
        </View>
      </CustomModal>

      {/* ===== Reactivated Modal ===== */}
      <CustomModal
        visible={reactiveModalVisible}
        onClose={() => setReactiveModalVisible(false)}
        title="Are You Sure?"
        description="Do you want to reactive those users"
        icon={<QuestionMarkIcon />}
      >
        <View style={styles.modalButtonRow}>
          <AppButton
            size="small"
            title="Yes"
            onPress={() => {
              console.log('Users reactivated');
              setReactiveModalVisible(false);
            }}
            style={{ width: s(80) }}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setReactiveModalVisible(false)}
            textColor={AppColors.pr500}
            style={{ width: s(90), borderColor: AppColors.pr500 }}
          />
        </View>
      </CustomModal>
    </View>
  );
};

export default ManageUserList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: s(16),
    backgroundColor: AppColors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: s(8),
    marginBottom: vs(8),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    paddingHorizontal: s(10),
    marginVertical: vs(12),
  },
  input: {
    flex: 1,
    paddingVertical: vs(8),
    paddingHorizontal: s(6),
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingVertical: vs(16),
    paddingHorizontal: s(16),
    marginHorizontal: s(20),
  },
  modalTitle: {
    fontSize: s(16),
    fontWeight: '600',
    marginBottom: vs(12),
    textAlign: 'center',
    color: AppColors.black,
  },
  roleItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  roleText: {
    fontSize: s(14),
    color: AppColors.n700,
  },
  roleTextSelected: {
    color: AppColors.pr500,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: vs(16),
    alignSelf: 'flex-end',
  },
  cancelText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(10),
  },
});
