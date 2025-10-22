import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import { DashboardIcon } from '../../assets/icons/courses';
import { Modal, Portal, SegmentedButtons } from 'react-native-paper'; // Import SegmentedButtons
import { useNavigation } from '@react-navigation/native';
import CustomModal from '../modals/CustomModal';
import { QuestionMarkIcon } from '../../assets/icons/input-icon';
import UserTable from './UserTable';
import {
  RoleNameToIdMap,
  exportAccounts,
  banAccount,
  reactivateAccount,
} from '../../api/account';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import _debounce from 'lodash/debounce';
import AddEditUserModal from '../modals/AddEditUserModal';

const ManageUserList = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('All');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [bannedModalVisible, setBannedModalVisible] = useState(false);
  const [reactiveModalVisible, setReactiveModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // State for Add Modal
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const roles = ['All', 'Admin', 'HOD', 'Lecturer', 'Student'];

  const debouncedSearch = useCallback(
    _debounce((text: string) => {
      setDebouncedSearchText(text);
      setRefreshKey(prev => prev + 1); // Trigger refresh on search change
    }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchText);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, debouncedSearch]);

  const handleSelectRole = (role: string) => {
    setSelectedRoleName(role);
    setRoleModalVisible(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh on role change
  };

  const handleExport = async () => {
    setIsActionLoading(true);
    try {
      const roleId = RoleNameToIdMap[selectedRoleName];
      await exportAccounts(roleId, debouncedSearchText);
      showSuccessToast(
        'Export Started',
        'Check your downloads or device notifications.',
      );
    } catch (error: any) {
      showErrorToast(
        'Export Failed',
        error.message || 'Could not export data.',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddUser = () => {
    setAddModalVisible(true); // Open the add user modal
  };

  const handleConfirmBan = async () => {
    if (selectedUserIds.length === 0) {
      showErrorToast('Error', 'Please select at least one user to ban.');
      setBannedModalVisible(false);
      return;
    }
    setIsActionLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id => banAccount(id)));
      showSuccessToast(
        'Success',
        `${selectedUserIds.length} user(s) have been banned.`,
      );
      setRefreshKey(prev => prev + 1);
      setSelectedUserIds([]);
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to ban users.');
    } finally {
      setIsActionLoading(false);
      setBannedModalVisible(false);
    }
  };

  const handleConfirmReactivate = async () => {
    if (selectedUserIds.length === 0) {
      showErrorToast('Error', 'Please select at least one user to reactivate.');
      setReactiveModalVisible(false);
      return;
    }
    setIsActionLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id => reactivateAccount(id)));
      showSuccessToast(
        'Success',
        `${selectedUserIds.length} user(s) have been reactivated.`,
      );
      setRefreshKey(prev => prev + 1);
      setSelectedUserIds([]);
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to reactivate users.');
    } finally {
      setIsActionLoading(false);
      setReactiveModalVisible(false);
    }
  };

  const handleAddSuccess = () => {
    setRefreshKey(prev => prev + 1); // Refresh table after adding user
  };

  const displayRole = selectedRoleName
    ? selectedRoleName.length > 12
      ? selectedRoleName.slice(0, 12) + '...'
      : selectedRoleName
    : 'All Roles';

  const tableFilters = {
    roleId: RoleNameToIdMap[selectedRoleName],
    searchTerm: debouncedSearchText,
  };

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
          onPress={handleAddUser} // Updated handler
          size="small"
          leftIcon={<Ionicons name="add" size={16} color={AppColors.white} />}
          disabled={isActionLoading}
        />
        <AppButton
          style={{ width: s(90) }}
          title="Banned"
          onPress={() => setBannedModalVisible(true)}
          backgroundColor={AppColors.r500}
          size="small"
          disabled={isActionLoading || selectedUserIds.length === 0}
        />
        <AppButton
          style={{ width: s(100) }}
          title="Reactivated"
          onPress={() => setReactiveModalVisible(true)}
          backgroundColor={AppColors.g500}
          size="small"
          disabled={isActionLoading || selectedUserIds.length === 0}
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
        filters={tableFilters}
        onSelectionChange={setSelectedUserIds}
        refreshKey={refreshKey}
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

      <CustomModal
        visible={bannedModalVisible}
        onClose={() => setBannedModalVisible(false)}
        title="Confirm Ban"
        description={`Do you want to ban ${selectedUserIds.length} selected user(s)?`}
        icon={<QuestionMarkIcon />}
      >
        <View style={styles.modalButtonRow}>
          <AppButton
            size="small"
            title="Yes, Ban"
            onPress={handleConfirmBan}
            backgroundColor={AppColors.r500}
            style={{ width: s(100) }}
            loading={isActionLoading}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setBannedModalVisible(false)}
            textColor={AppColors.pr500}
            style={{ width: s(90), borderColor: AppColors.pr500 }}
            disabled={isActionLoading}
          />
        </View>
      </CustomModal>

      <CustomModal
        visible={reactiveModalVisible}
        onClose={() => setReactiveModalVisible(false)}
        title="Confirm Reactivation"
        description={`Do you want to reactivate ${selectedUserIds.length} selected user(s)?`}
        icon={<QuestionMarkIcon />}
      >
        <View style={styles.modalButtonRow}>
          <AppButton
            size="small"
            title="Yes, Reactivate"
            onPress={handleConfirmReactivate}
            backgroundColor={AppColors.g500}
            style={{ width: s(130) }}
            loading={isActionLoading}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setReactiveModalVisible(false)}
            textColor={AppColors.pr500}
            style={{ width: s(90), borderColor: AppColors.pr500 }}
            disabled={isActionLoading}
          />
        </View>
      </CustomModal>

      {/* Add User Modal */}
      <AddEditUserModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
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
