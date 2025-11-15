import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import { DashboardIcon } from '../../assets/icons/courses';
import { Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import UserTable from './UserTable';
import {
  RoleNameToIdMap,
  AccountData,
  RoleMap,
  GenderIdToNameMap,
} from '../../api/account';
import { accountService } from '../../api/accountService';
import { adminService } from '../../api/adminService';
import { examinerService } from '../../api/examinerService';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import _debounce from 'lodash/debounce';
import * as XLSX from 'xlsx';
import RNBlobUtil from 'react-native-blob-util';
import AddEditUserModal from '../modals/AddEditUserModal';
import dayjs from 'dayjs';
const ManageUserList = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('All');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [addEditModalVisible, setAddEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AccountData | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [allUsers, setAllUsers] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roles = Object.keys(RoleNameToIdMap);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      // Sử dụng accountService.getAccountList() giống như web
      // Lấy tất cả users bằng cách fetch với pageSize lớn
      const result = await accountService.getAccountList(1, 9999);
      setAllUsers(result.users || []);
    } catch (error: any) {
      showErrorToast('Error', 'Failed to load user list.');
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, [refreshKey]);

  const handleSelectRole = (role: string) => {
    setSelectedRoleName(role);
    setRoleModalVisible(false);
  };

  // Hàm xin quyền (Android)
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true; // Bỏ qua nếu là iOS
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download files.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Hàm Export (Client-side)
  const handleExport = async () => {
    setIsActionLoading(true);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast(
          'Permission Denied',
          'Storage permission is required to export.',
        );
        setIsActionLoading(false);
        return;
      }

      const dataToExport = filteredUsers.map(user => ({
        'Account Code': user.accountCode,
        Username: user.username,
        Email: user.email,
        'Full Name': user.fullName,
        Phone: user.phoneNumber,
        Address: user.address,
        Gender: user.gender !== null ? GenderIdToNameMap[user.gender] : '',
        'Date of Birth': user.dateOfBirth
          ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
          : '',
        Role: RoleMap[user.role],
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      const path = `${
        RNBlobUtil.fs.dirs.DownloadDir
      }/users_export_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;

      await RNBlobUtil.fs.writeFile(path, wbout, 'base64');
      showSuccessToast(
        'Export Successful',
        `File saved to Downloads folder as users_export_...xlsx`,
      );
    } catch (error: any) {
      console.error('Export Failed:', error);
      showErrorToast(
        'Export Failed',
        error.message || 'Could not export data.',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setAddEditModalVisible(true);
  };

  const handleOpenEditModal = (user: AccountData) => {
    setEditingUser(user);
    setAddEditModalVisible(true);
  };

  const handleEditOk = async (values: any, role: number) => {
    if (editingUser) {
      try {
        setIsActionLoading(true);
        const updatePayload = {
          phoneNumber: values.phoneNumber,
          fullName: values.fullName,
          address: values.address,
        };

        await adminService.updateAccount(editingUser.id, updatePayload);

        setAddEditModalVisible(false);
        setEditingUser(null);
        showSuccessToast('Success', 'User updated successfully');
        setRefreshKey(prev => prev + 1);
      } catch (err: any) {
        console.error('Failed to update user:', err);
        showErrorToast('Error', err.message || 'Failed to update user');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleEditCancel = () => {
    setAddEditModalVisible(false);
    setEditingUser(null);
  };

  const handleCreateOk = async (values: any, role: number) => {
    try {
      setIsActionLoading(true);
      if (role === 4) {
        await examinerService.createExaminer(values);
      } else {
        await adminService.createAccount(values);
      }

      setAddEditModalVisible(false);
      showSuccessToast('Success', 'User created successfully');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      showErrorToast('Error', err.message || 'Failed to create user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setAddEditModalVisible(false);
  };

  const displayRole = selectedRoleName
    ? selectedRoleName.length > 12
      ? selectedRoleName.slice(0, 12) + '...'
      : selectedRoleName
    : 'All Roles';

  const filteredUsers = useMemo(() => {
    const roleIdToFilter = RoleNameToIdMap[selectedRoleName];
    const searchTermLower = debouncedSearchText.toLowerCase();

    return allUsers.filter(user => {
      const roleMatch = roleIdToFilter === null || user.role === roleIdToFilter;
      const searchMatch =
        !searchTermLower ||
        (user.fullName &&
          user.fullName.toLowerCase().includes(searchTermLower)) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
        (user.accountCode &&
          user.accountCode.toLowerCase().includes(searchTermLower));
      return roleMatch && searchMatch;
    });
  }, [allUsers, selectedRoleName, debouncedSearchText]);

  return (
    <View style={styles.container}>
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
          disabled={isActionLoading}
        />
        <AppButton
          style={{ width: s(90), borderColor: AppColors.n300 }}
          title="Export"
          onPress={handleExport}
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
          disabled={isActionLoading}
        />
        <AppButton
          style={{ width: s(40), minWidth: 0, borderColor: AppColors.n300 }}
          onPress={() => navigation.navigate('AdminDashboardScreen')}
          backgroundColor={AppColors.white}
          variant="secondary"
          size="small"
          leftIcon={<DashboardIcon />}
          disabled={isActionLoading}
        />
      </View>

      <View style={styles.buttonRow}>
        <AppButton
          style={{ width: s(90) }}
          title="Add"
          onPress={handleOpenAddModal}
          size="small"
          leftIcon={<Ionicons name="add" size={16} color={AppColors.white} />}
          disabled={isActionLoading}
        />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={AppColors.n500} />
        <TextInput
          style={styles.input}
          placeholder="Search by name, email or code..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <UserTable
        isLoading={isLoading}
        data={filteredUsers}
        onEdit={handleOpenEditModal}
      />

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
                  selectedRoleName === role && styles.roleTextSelected,
                ]}
              >
                {role === 'All'
                  ? 'All Roles'
                  : role.charAt(0) + role.slice(1).toLowerCase()}
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

      {editingUser ? (
        <AddEditUserModal
          visible={addEditModalVisible}
          onCancel={handleEditCancel}
          onOk={handleEditOk}
          initialData={editingUser}
          confirmLoading={isActionLoading}
        />
      ) : (
        <AddEditUserModal
          visible={addEditModalVisible}
          onCancel={handleCreateCancel}
          onOk={handleCreateOk}
          initialData={null}
          confirmLoading={isActionLoading}
        />
      )}
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
    flexWrap: 'wrap',
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
    fontSize: s(14),
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
    marginTop: vs(10),
  },
});
