import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ScrollView,
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
import { pick, types } from '@react-native-documents/picker';
import { FlatList } from 'react-native';
import CustomModal from '../modals/CustomModal';
import AppText from '../texts/AppText';

interface ImportResult {
  row: number;
  accountCode?: string;
  email?: string;
  error: string;
}

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
  const [importLoading, setImportLoading] = useState(false);
  const [importResultVisible, setImportResultVisible] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: ImportResult[];
  }>({ success: 0, failed: 0, errors: [] });

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
      
      if (Platform.OS === 'android') {
        await RNBlobUtil.android.addCompleteDownload({
          title: `users_export_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
          description: 'Download complete',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          path: path,
          showNotification: true,
        });
      }
      
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

  // Download template with 50 sample accounts
  const handleDownloadTemplate = async () => {
    try {
      setIsActionLoading(true);
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required.');
        setIsActionLoading(false);
        return;
      }

      const sampleAccounts = [];
      const roles = [
        { value: '0', name: 'Admin' },
        { value: '1', name: 'Lecturer' },
        { value: '2', name: 'Student' },
        { value: '3', name: 'HOD' },
        { value: '4', name: 'Examiner' },
      ];
      const genders = ['0', '1', '2']; // Male, Female, Other
      const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do'];
      const middleNames = ['Van', 'Thi', 'Duc', 'Minh', 'Thanh', 'Quang', 'Duy', 'Hoang', 'Tuan', 'Anh'];
      const lastNames = ['An', 'Binh', 'Chi', 'Dung', 'Em', 'Giang', 'Hoa', 'Khanh', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phuong', 'Quan', 'Son', 'Thao', 'Uyen', 'Vy', 'Xuan', 'Yen'];
      const addresses = [
        '123 Le Loi Street, District 1, Ho Chi Minh City',
        '456 Nguyen Hue Boulevard, District 1, Ho Chi Minh City',
        '789 Tran Hung Dao Street, District 5, Ho Chi Minh City',
        '321 Vo Van Tan Street, District 3, Ho Chi Minh City',
        '654 Ly Tu Trong Street, District 1, Ho Chi Minh City',
        '987 Pasteur Street, District 3, Ho Chi Minh City',
        '147 Dong Khoi Street, District 1, Ho Chi Minh City',
        '258 Hai Ba Trung Street, District 3, Ho Chi Minh City',
        '369 Nguyen Dinh Chieu Street, District 3, Ho Chi Minh City',
        '741 Cach Mang Thang Tam Street, District 10, Ho Chi Minh City',
      ];

      for (let i = 1; i <= 50; i++) {
        const roleIndex = Math.floor((i - 1) / 10);
        const role = roles[roleIndex % roles.length];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${middleName} ${lastName}`;
        const accountCode = `ACC${String(i).padStart(3, '0')}`;
        const username = `user${String(i).padStart(3, '0')}`;
        const email = `user${String(i).padStart(3, '0')}@example.com`;
        const phoneNumber = `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`;
        const address = addresses[Math.floor(Math.random() * addresses.length)];
        
        const year = 1990 + Math.floor(Math.random() * 16);
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const avatarUrl = i % 3 === 0 ? `https://example.com/avatar${i}.jpg` : '';
        const password = `Pass${i}@123`;

        sampleAccounts.push({
          'Account Code': accountCode,
          'Username': username,
          'Email': email,
          'Phone Number': phoneNumber,
          'Full Name': fullName,
          'Avatar URL': avatarUrl,
          'Address': address,
          'Gender': gender,
          'Date of Birth': dateOfBirth,
          'Role': role.value,
          'Password': password,
        });
      }

      const ws = XLSX.utils.json_to_sheet(sampleAccounts);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Accounts');

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Account Code
        { wch: 15 }, // Username
        { wch: 25 }, // Email
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Full Name
        { wch: 30 }, // Avatar URL
        { wch: 40 }, // Address
        { wch: 10 }, // Gender
        { wch: 15 }, // Date of Birth
        { wch: 10 }, // Role
        { wch: 15 }, // Password
      ];

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const path = `${RNBlobUtil.fs.dirs.DownloadDir}/Account_Import_Template.xlsx`;
      await RNBlobUtil.fs.writeFile(path, wbout, 'base64');

      if (Platform.OS === 'android') {
        await RNBlobUtil.android.addCompleteDownload({
          title: 'Account_Import_Template.xlsx',
          description: 'Download complete',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          path: path,
          showNotification: true,
        });
      }

      showSuccessToast(
        'Template Downloaded',
        'Excel template with 50 sample accounts has been downloaded successfully.',
      );
    } catch (error: any) {
      console.error('Failed to download sample template:', error);
      showErrorToast(
        'Download Failed',
        'Failed to download sample template. Please try again.',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Validate account data
  const validateAccountData = (row: any, rowIndex: number): string | null => {
    const rowNum = rowIndex + 2;

    if (!row['Account Code'] || !row['Account Code'].toString().trim()) {
      return `Row ${rowNum}: Account Code is required`;
    }
    if (!row['Username'] || !row['Username'].toString().trim()) {
      return `Row ${rowNum}: Username is required`;
    }
    if (row['Username'].toString().trim().length < 3) {
      return `Row ${rowNum}: Username must be at least 3 characters`;
    }
    if (!row['Email'] || !row['Email'].toString().trim()) {
      return `Row ${rowNum}: Email is required`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row['Email'].toString().trim())) {
      return `Row ${rowNum}: Invalid email format`;
    }
    if (!row['Phone Number'] || !row['Phone Number'].toString().trim()) {
      return `Row ${rowNum}: Phone Number is required`;
    }
    const phoneRegex = /^[0-9]{10,}$/;
    const phoneDigits = row['Phone Number'].toString().replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(phoneDigits)) {
      return `Row ${rowNum}: Phone Number must be at least 10 digits`;
    }
    if (!row['Full Name'] || !row['Full Name'].toString().trim()) {
      return `Row ${rowNum}: Full Name is required`;
    }
    if (row['Full Name'].toString().trim().length < 2) {
      return `Row ${rowNum}: Full Name must be at least 2 characters`;
    }
    if (!row['Address'] || !row['Address'].toString().trim()) {
      return `Row ${rowNum}: Address is required`;
    }
    if (row['Address'].toString().trim().length < 5) {
      return `Row ${rowNum}: Address must be at least 5 characters`;
    }
    if (row['Gender'] === undefined || row['Gender'] === null || row['Gender'].toString().trim() === '') {
      return `Row ${rowNum}: Gender is required (0=Male, 1=Female, 2=Other)`;
    }
    const gender = parseInt(row['Gender'].toString().trim());
    if (isNaN(gender) || gender < 0 || gender > 2) {
      return `Row ${rowNum}: Gender must be 0 (Male), 1 (Female), or 2 (Other)`;
    }
    if (!row['Date of Birth'] || !row['Date of Birth'].toString().trim()) {
      return `Row ${rowNum}: Date of Birth is required (format: YYYY-MM-DD)`;
    }
    const dateOfBirth = new Date(row['Date of Birth'].toString().trim());
    if (isNaN(dateOfBirth.getTime())) {
      return `Row ${rowNum}: Invalid Date of Birth format (use YYYY-MM-DD)`;
    }
    if (!row['Role'] || row['Role'].toString().trim() === '') {
      return `Row ${rowNum}: Role is required (0=Admin, 1=Lecturer, 2=Student, 3=HOD, 4=Examiner)`;
    }
    const role = parseInt(row['Role'].toString().trim());
    if (isNaN(role) || role < 0 || role > 4) {
      return `Row ${rowNum}: Role must be 0-4 (0=Admin, 1=Lecturer, 2=Student, 3=HOD, 4=Examiner)`;
    }
    if (!row['Password'] || !row['Password'].toString().trim()) {
      return `Row ${rowNum}: Password is required`;
    }
    if (row['Password'].toString().trim().length < 6) {
      return `Row ${rowNum}: Password must be at least 6 characters`;
    }
    if (row['Avatar URL'] && row['Avatar URL'].toString().trim()) {
      try {
        new URL(row['Avatar URL'].toString().trim());
      } catch {
        return `Row ${rowNum}: Invalid Avatar URL format`;
      }
    }

    return null;
  };

  // Parse Excel file
  const parseExcelFile = async (fileUri: string): Promise<any[]> => {
    try {
      const base64Data = await RNBlobUtil.fs.readFile(fileUri, 'base64');
      const workbook = XLSX.read(base64Data, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      return jsonData;
    } catch (error) {
      throw new Error('Failed to parse Excel file. Please check the file format.');
    }
  };

  // Import accounts
  const handleImportAccounts = async () => {
    try {
      setImportLoading(true);
      const result = await pick({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
      });

      if (!result || result.length === 0) {
        setImportLoading(false);
        return;
      }

      const file = result[0];
      const data = await parseExcelFile(file.uri);

      if (!data || data.length === 0) {
        showErrorToast('Import Failed', 'Excel file is empty or invalid.');
        setImportLoading(false);
        return;
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as ImportResult[],
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2;

        // Validate row
        const validationError = validateAccountData(row, i);
        if (validationError) {
          results.failed++;
          results.errors.push({
            row: rowNum,
            accountCode: row['Account Code']?.toString(),
            email: row['Email']?.toString(),
            error: validationError,
          });
          continue;
        }

        // Prepare account data
        const accountData: any = {
          accountCode: row['Account Code'].toString().trim(),
          username: row['Username'].toString().trim(),
          email: row['Email'].toString().trim(),
          phoneNumber: row['Phone Number'].toString().trim(),
          fullName: row['Full Name'].toString().trim(),
          address: row['Address'].toString().trim(),
          gender: parseInt(row['Gender'].toString().trim()),
          dateOfBirth: new Date(row['Date of Birth'].toString().trim()).toISOString(),
          role: parseInt(row['Role'].toString().trim()),
          password: row['Password'].toString().trim(),
        };

        if (row['Avatar URL'] && row['Avatar URL'].toString().trim()) {
          accountData.avatar = row['Avatar URL'].toString().trim();
        }

        // Create account
        try {
          if (accountData.role === 4) {
            // Examiner
            const examinerPayload = {
              ...accountData,
              role: 'teacher' as const,
            };
            await examinerService.createExaminer(examinerPayload);
          } else {
            await adminService.createAccount(accountData);
          }
          results.success++;
        } catch (error: any) {
          results.failed++;
          const errorMessage = error.response?.data?.errorMessages?.[0] || 
                              error.message || 
                              'Failed to create account';
          results.errors.push({
            row: rowNum,
            accountCode: accountData.accountCode,
            email: accountData.email,
            error: errorMessage,
          });
        }
      }

      setImportResults(results);
      
      // Always show modal if there are errors
      if (results.failed > 0) {
        setImportResultVisible(true);
      }
      
      // Show success toast only if all succeeded
      if (results.success > 0 && results.failed === 0) {
        showSuccessToast(
          'Import Completed',
          `Successfully created ${results.success} account(s).`,
        );
        setRefreshKey(prev => prev + 1);
      } else if (results.success > 0 && results.failed > 0) {
        // Some succeeded, some failed - show modal with errors
        setRefreshKey(prev => prev + 1);
      } else if (results.failed > 0) {
        // All failed - modal already shown above
        // Don't show toast, modal will show all errors
      }
    } catch (error: any) {
      console.error('Import error:', error);
      if (error?.message?.includes('User cancelled')) {
        // User cancelled, silently return
        return;
      }
      showErrorToast(
        'Import Failed',
        error.message || 'Failed to import accounts. Please check the file format.',
      );
    } finally {
      setImportLoading(false);
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
        <AppButton
          style={{ width: s(200), borderColor: AppColors.n300 }}
          title="Download Template"
          onPress={handleDownloadTemplate}
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
          disabled={isActionLoading || importLoading}
        />
        <AppButton
          style={{ width: s(140), borderColor: AppColors.n300 }}
          title="Import Excel"
          onPress={handleImportAccounts}
          backgroundColor={AppColors.white}
          textColor={AppColors.n700}
          variant="secondary"
          size="small"
          leftIcon={
            <Ionicons
              name="cloud-upload-outline"
              size={16}
              color={AppColors.n700}
            />
          }
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

      {/* Import Results Modal */}
      <CustomModal
        visible={importResultVisible}
        onClose={() => setImportResultVisible(false)}
        title="Import Results"
        disableScrollView={false}
      >
        <View style={styles.importResultContainer}>
          <AppText style={[
            styles.importSummary,
            { color: importResults.failed === 0 ? AppColors.g500 : AppColors.r500 }
          ]}>
            Import Summary: {importResults.success} successful, {importResults.failed} failed
          </AppText>
          
          {importResults.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <AppText style={styles.errorsTitle}>Errors:</AppText>
              <ScrollView 
                style={styles.errorsList}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {importResults.errors.map((item, index) => (
                  <View key={`error-${index}`} style={styles.errorItem}>
                    <AppText style={styles.errorRow}>Row {item.row}</AppText>
                    {item.accountCode && (
                      <AppText style={styles.errorText}>Account Code: {item.accountCode}</AppText>
                    )}
                    {item.email && (
                      <AppText style={styles.errorText}>Email: {item.email}</AppText>
                    )}
                    <AppText style={styles.errorMessage}>{item.error}</AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          <AppButton
            title="Close"
            onPress={() => setImportResultVisible(false)}
            style={styles.closeButton}
            textVariant="body14pxBold"
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
  importResultContainer: {
    padding: s(16),
  },
  importSummary: {
    fontSize: s(16),
    fontWeight: '600',
    marginBottom: vs(16),
  },
  errorsContainer: {
    marginTop: vs(12),
    maxHeight: vs(400),
  },
  errorsTitle: {
    fontSize: s(14),
    fontWeight: '600',
    marginBottom: vs(8),
    color: AppColors.n900,
  },
  errorsList: {
    maxHeight: vs(300),
    flexGrow: 0,
  },
  errorItem: {
    padding: s(12),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    marginBottom: vs(8),
    borderLeftWidth: 3,
    borderLeftColor: AppColors.r500,
  },
  errorRow: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n900,
    marginBottom: vs(4),
  },
  errorText: {
    fontSize: s(12),
    color: AppColors.n700,
    marginBottom: vs(2),
  },
  errorMessage: {
    fontSize: s(12),
    color: AppColors.r500,
    marginTop: vs(4),
  },
  closeButton: {
    width: s(100),
    alignSelf: 'center',
    borderRadius: s(10),
    marginTop: vs(20),
  },
});
