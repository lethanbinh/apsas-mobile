import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AccountData, RoleMap } from '../../api/account';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';

interface UserTableProps {
  isLoading: boolean;
  data: AccountData[];
  onEdit: (user: AccountData) => void;
}

const UserTable = ({ isLoading, data, onEdit }: UserTableProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedData = data.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [data]);
  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrevious = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const getStatus = (user: AccountData): 'Active' | 'Inactive' => {
    return 'Active';
  };
  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.headerText, styles.nameCol]}>Client Name</Text>
      <Text style={[styles.headerText, styles.emailCol]}>Email</Text>
      <Text style={[styles.headerText, styles.genderCol]}>Gender</Text>
      <Text style={[styles.headerText, styles.codeCol]}>Account Code</Text>
      <Text style={[styles.headerText, styles.statusCol]}>Status</Text>
      <Text style={[styles.headerText, styles.dateCol]}>Date of Birth</Text>
      <Text style={[styles.headerText, styles.phoneCol]}>Phone</Text>
      <Text style={[styles.headerText, styles.roleCol]}>Role</Text>
      <Text style={[styles.headerText, styles.actionCol]}>Actions</Text>
    </View>
  );

  const renderItem = ({ item }: { item: AccountData }) => {
    const status = getStatus(item);
    return (
      <View style={styles.row}>
        <View style={[styles.nameCol, styles.userInfo]}>
          <Image
            source={{
              uri:
                item.avatar ||
                'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            }}
            style={styles.avatar}
          />
          <Text style={styles.nameText} numberOfLines={1}>
            {item.fullName || item.username}
          </Text>
        </View>
        <Text style={[styles.text, styles.emailCol]} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={[styles.text, styles.genderCol]}>
          {item.gender === 0 ? 'Male' : item.gender === 1 ? 'Female' : '-'}
        </Text>
        <Text style={[styles.text, styles.codeCol]}>{item.accountCode}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
          <Text style={getStatusTextStyle(status)}>{status}</Text>
        </View>
        <Text style={[styles.text, styles.dateCol]}>
          {item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : '-'}
        </Text>
        <Text style={[styles.text, styles.phoneCol]}>
          {item.phoneNumber || '-'}
        </Text>
        <Text style={[styles.text, styles.roleCol]}>
          {RoleMap[item.role] || 'Unknown'}
        </Text>
        <View style={styles.actionCol}>
          <AppButton
            title="Edit"
            onPress={() => onEdit(item)}
            size="small"
            variant="secondary"
            style={styles.editButton}
            textVariant="label12pxRegular"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {renderHeader()}
          {isLoading ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={pagedData} // Sử dụng dữ liệu đã phân trang
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={page === 1 || isLoading}
          style={[
            styles.pageButton,
            (page === 1 || isLoading) && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.pageText,
              (page === 1 || isLoading) && styles.disabledText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {total > 0
            ? `${(page - 1) * pageSize + 1}-${Math.min(
                page * pageSize,
                total,
              )} of ${total}`
            : '0 of 0'}
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          disabled={page === totalPages || isLoading}
          style={[
            styles.pageButton,
            (page === totalPages || isLoading) && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.pageText,
              (page === totalPages || isLoading) && styles.disabledText,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStatusBadgeStyle = (status: string) => ({
  backgroundColor: status === 'Active' ? AppColors.g100 : AppColors.n100,
});
const getStatusTextStyle = (status: string) => ({
  fontSize: s(12),
  fontWeight: '600' as const,
  color: status === 'Active' ? AppColors.g500 : AppColors.n500,
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    flex: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    minWidth: s(1150),
    backgroundColor: AppColors.white,
    flexGrow: 1,
  },
  loadingIndicator: {
    marginTop: vs(50),
    alignSelf: 'center',
    height: vs(300), // Cho chiều cao cố định khi loading
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(30),
    color: AppColors.n500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  headerRow: {
    backgroundColor: AppColors.n100,
  },
  headerText: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n700,
  },
  text: {
    fontSize: s(13),
    color: AppColors.n800,
  },
  nameCol: { width: s(150) },
  emailCol: { width: s(200) },
  genderCol: { width: s(70) },
  codeCol: { width: s(110) },
  statusCol: { width: s(90) },
  statusBadge: {
    width: s(80),
    paddingVertical: vs(3),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
  },
  dateCol: { width: s(100) },
  phoneCol: { width: s(110) },
  roleCol: { width: s(100) },
  actionCol: { width: s(80), alignItems: 'center' },
  editButton: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    minWidth: s(60),
    borderColor: AppColors.pr500,
    borderWidth: 1,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    marginRight: s(6),
  },
  nameText: { fontSize: s(13), color: AppColors.n800, flexShrink: 1 },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(12),
    gap: s(20),
    marginBottom: vs(20),
  },
  pageButton: {
    paddingVertical: vs(6),
    paddingHorizontal: s(14),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
  },
  disabledButton: {
    borderColor: AppColors.n200,
    backgroundColor: AppColors.n100,
  },
  pageText: { color: AppColors.n700, fontSize: s(13) },
  disabledText: { color: AppColors.n400 },
  pageInfo: { fontSize: s(13), color: AppColors.n600 },
});

export default UserTable;
